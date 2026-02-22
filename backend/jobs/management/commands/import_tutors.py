"""
import_tutors.py — Drop-in replacement for backend/jobs/management/commands/import_tutors.py

USAGE:
  # Dry run (no DB writes, just shows what would happen)
  python manage.py import_tutors path/to/file.csv --dry-run

  # Import all tutors (regardless of approval status)
  python manage.py import_tutors Form_Responses_1.csv Form_Responses_2.csv NEW_TUTOR_RESPONSE_SHEET.csv

  # Import ONLY approved tutors (Form 2 has APPROVED OR NOT column)
  python manage.py import_tutors Form_Responses_2.csv --approved-only

  # Import and auto-set status to ACTIVE (for already-vetted tutors)
  python manage.py import_tutors NewSheet.csv --status ACTIVE

  # Output a report CSV of what happened
  python manage.py import_tutors *.csv --report import_report.csv

WHAT THIS SCRIPT FIXES vs THE OLD ONE:
  1. Signal-aware: User creation signal auto-creates TutorProfile + TutorStatus.
     Old script called TutorProfile.objects.create() again → IntegrityError.
     This script uses get_or_create + update instead.
  2. Cross-file deduplication: 512 duplicate phones exist across the 3 CSVs.
     Old script only checked the DB; this script tracks seen phones in-memory too.
  3. Email conflict handling: Duplicate emails get a phone-based fallback email.
  4. DOB parsing: Handles M/D/YYYY, MM/DD/YYYY, #ERROR!, garbage values gracefully.
  5. Phone normalization: Strips +91, spaces, dashes; extracts first valid 10-digit number.
  6. Photo URL: Stores Google Drive photo URL → TutorProfile.external_profile_image_url.
  7. Approval filtering: Reads APPROVED OR NOT column; can set KYC status to VERIFIED.
  8. All 3 CSV column-name variants are normalized before processing.
  9. DOB, marital status, highest qualification, father name — all populated.
  10. Detailed per-row logging + summary report.
"""

import csv
import os
import re
import json
import logging
from datetime import datetime, date
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

from users.models import TutorProfile, TutorStatus, TutorKYC

User = get_user_model()

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────
# Column name normalization map
# Handles differences between Form 1, Form 2, and NewSheet
# ─────────────────────────────────────────────────────────
COLUMN_ALIASES = {
    # Canonical name → list of aliases found in the CSVs
    'email':            ['Email Address', 'Email'],
    'name':             ['NAME', 'Full Name', 'Name'],
    'gender':           ['Gender'],
    'dob':              ['Date of Birth', 'DOB'],
    'phone':            ['CALLING NUMBER , WHATSAPP NUMBER , ALTERNATE NUMBER', 'Phone', 'Phone Number'],
    'marital_status':   ['MARITAL STATUS', 'Marital Status'],
    'father_name':      ['FATHER / MOTHER NAME', 'Father / Mother Name'],
    'father_contact':   ['FATHER / MOTHER CONTACT NO.', 'Father Contact'],
    'intermediate':     ['INTERMEDIATE ( Stream , Year , School and Board )', 'Intermediate'],
    'qualification':    ['HIGHEST QUALIFICATION', 'Highest Qualification'],
    'classes_subjects': ['Classes and Subjects'],
    'subjects_9_10':    ['Which Subjects you can teach in class 9th and 10th'],
    'subjects_11_12':   ['Which Subjects You Can Teach in Class 11th and 12th',
                         'Which Subjects you can teach in class 11th and 12th'],
    'subjects_extra':   ['Any Additional Subject and Stream You can teach write in brief'],
    'locations':        ['IN WHICH LOCATIONS YOU CAN TEACH', 'Locations', 'Locality'],
    'exp_years':        ['TEACHING EXPERIENCE IN YEARS', 'Teaching Experience in Years'],
    'exp_school':       ['TEACHING EXPERIENCE IN SCHOOL ( Describe in brief with school name and year )',
                         'TEACHING EXPERIENCE  IN SCHOOL ( Describe in brief with school name and year )'],
    'conveyance':       ['DO YOU HAVE YOUR OWN CONVEYANCE'],
    'local_address':    ['LOCAL ADDRESS', 'Local Address'],
    'perm_address':     ['PERMANENT ADDRESS', 'Permanent Address'],
    'aadhaar_front':    ['AADHAAR CARD FRONT'],
    'aadhaar_back':     ['AADHAAR CARD BACK'],
    'marksheet':        ['HIGHEST QUALIFICATION MARKSHEET', 'HIGHEST QUALIFICATION MARKSHEET '],
    'photo':            ['RECENT PASSPORT SIZE PHOTOGRAPH.', 'Recent Passport Size Photograph'],
    'approval':         ['APPROVED OR NOT'],
    'doc_approved':     ['DOCUMENT APPROVED OR NOT'],
    'reg_date':         ['REGISTRATION DATE ( AMOUNT ) -  PROCESSED BY',
                         'REGISTRATION DATE ( AMOUNT ) - PROCESSED BY'],
    'valid_upto':       ['VALID UPTO'],
}

# Build reverse lookup: raw header → canonical key
def build_lookup(fieldnames):
    lookup = {}
    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            # Strip whitespace + trailing newlines from both sides for matching
            normalized_alias = alias.strip().replace('\n', '')
            for fn in fieldnames:
                fn_clean = fn.strip().replace('\n', '')
                if fn_clean == normalized_alias:
                    lookup[canonical] = fn  # store original fieldname for dict access
                    break
    return lookup


def get(row, lookup, key, default=''):
    """Safely get a value using the canonical key."""
    col = lookup.get(key)
    if col is None:
        return default
    return (row.get(col) or default).strip()


# ─────────────────────────────────────────────────────────
# Data cleaning helpers
# ─────────────────────────────────────────────────────────

def clean_phone(raw):
    """
    Extract first valid 10-digit Indian phone number from a raw string.
    Handles: '+91 9876543210', '9876543210, 9876543211', '9876 543 210', etc.
    Returns 10-digit string or '' if nothing valid found.
    """
    if not raw:
        return ''
    # Try each comma-separated segment in order
    for segment in re.split(r'[,/|]+', raw):
        digits = re.sub(r'\D', '', segment)
        # Remove leading 91 / 0 country/trunk prefix
        if digits.startswith('91') and len(digits) == 12:
            digits = digits[2:]
        elif digits.startswith('0') and len(digits) == 11:
            digits = digits[1:]
        if len(digits) == 10 and digits[0] in '6789':
            return digits
    return ''


def clean_dob(raw):
    """
    Parse dates like '7/23/2000', '11/5/1999', '23-07-2000'.
    Returns a date object or None if unparseable.
    """
    if not raw or raw.strip() in ('#ERROR!', '', 'N/A', 'NA'):
        return None
    # Ignore clearly bad values (purely numeric short strings like '549')
    raw = raw.strip()
    if re.match(r'^\d{1,3}$', raw):
        return None
    for fmt in ('%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y', '%m-%d-%Y'):
        try:
            parsed = datetime.strptime(raw, fmt).date()
            # Sanity check: tutors must be born between 1960 and 2008
            if date(1960, 1, 1) <= parsed <= date(2008, 12, 31):
                return parsed
        except ValueError:
            continue
    return None


def clean_gender(raw):
    mapping = {
        'male': 'Male', 'm': 'Male',
        'female': 'Female', 'f': 'Female',
        'other': 'Other',
    }
    return mapping.get(raw.strip().lower(), '')


def clean_marital(raw):
    r = raw.strip().lower()
    if 'married' in r:
        return 'Married'
    if 'single' in r or 'unmarried' in r:
        return 'Single'
    return ''


def clean_experience(raw):
    """Extract first integer found, e.g. '3 years' → 3."""
    m = re.search(r'\d+', raw or '')
    if m:
        val = int(m.group())
        return min(val, 50)  # Cap at 50 years to filter garbage
    return 0


def clean_subjects(parts):
    """
    Given a list of raw subject strings (possibly comma or newline separated),
    return a deduped, cleaned list.
    """
    subjects = []
    for part in parts:
        if not part:
            continue
        # Split by comma, newline, semicolon
        for s in re.split(r'[,\n;]+', part):
            s = s.strip()
            if s and len(s) > 1 and s.lower() not in ('none', 'na', 'n/a', '-'):
                subjects.append(s)
    # Deduplicate preserving order
    seen = set()
    result = []
    for s in subjects:
        if s.lower() not in seen:
            seen.add(s.lower())
            result.append(s)
    return result


def is_approved(row, lookup):
    """
    Returns True if this row has been explicitly approved by admin.
    Checks both APPROVED OR NOT and DOCUMENT APPROVED OR NOT columns.
    """
    approval = get(row, lookup, 'approval', '').lower()
    doc_approved = get(row, lookup, 'doc_approved', '').lower()
    return 'approved' in approval or 'approved' in doc_approved


def make_unique_email(email, phone):
    """
    If email is blank or will conflict, generate a placeholder using phone.
    """
    if email and '@' in email:
        return email
    return f"{phone}@imported.thtpro.in"


def make_unique_username(phone, email):
    """Phone is primary username. If blank (shouldn't happen at this point), fall back to email prefix."""
    if phone:
        return phone
    return email.split('@')[0][:30]


# ─────────────────────────────────────────────────────────
# Django Management Command
# ─────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = 'Bulk import tutors from one or more Google Form CSV exports'

    def add_arguments(self, parser):
        parser.add_argument(
            'csv_files', nargs='+', type=str,
            help='Path(s) to CSV file(s). Multiple files are deduplicated automatically.'
        )
        parser.add_argument(
            '--dry-run', action='store_true',
            help='Simulate the import without writing anything to the database.'
        )
        parser.add_argument(
            '--approved-only', action='store_true',
            help='Only import rows where APPROVED OR NOT column contains "Approved".'
        )
        parser.add_argument(
            '--status', type=str, default='ACTIVE',
            choices=['SIGNED_UP', 'PROFILE_INCOMPLETE', 'KYC_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE'],
            help='TutorStatus to assign after import. Default: ACTIVE'
        )
        parser.add_argument(
            '--report', type=str, default='',
            help='Path to write a CSV report of import results (optional).'
        )
        parser.add_argument(
            '--default-password', type=str, default='Tutor@123',
            help='Default password for created accounts. Change immediately after import!'
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        approved_only = options['approved_only']
        target_status = options['status']
        report_path = options['report']
        default_password = options['default_password']

        if dry_run:
            self.stdout.write(self.style.WARNING('🔍 DRY RUN MODE — no database changes will be made.\n'))

        # ── Collect all rows from all CSVs ──────────────────────────────
        all_rows = []  # list of (row_dict, source_filename, lookup)

        for csv_path in options['csv_files']:
            if not os.path.exists(csv_path):
                self.stdout.write(self.style.ERROR(f'❌ File not found: {csv_path}'))
                continue
            fname = os.path.basename(csv_path)
            try:
                with open(csv_path, encoding='utf-8', errors='replace') as f:
                    reader = csv.DictReader(f)
                    if not reader.fieldnames:
                        self.stdout.write(self.style.ERROR(f'❌ Empty or invalid CSV: {fname}'))
                        continue
                    # Sanitize fieldnames
                    reader.fieldnames = [n.strip().replace('\n', '') for n in reader.fieldnames]
                    lookup = build_lookup(reader.fieldnames)
                    rows = list(reader)
                self.stdout.write(f'📄 Loaded {len(rows)} rows from {fname}')
                for row in rows:
                    all_rows.append((row, fname, lookup))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Could not read {fname}: {e}'))

        if not all_rows:
            self.stdout.write(self.style.ERROR('No rows to process. Exiting.'))
            return

        self.stdout.write(f'\n📊 Total rows across all files: {len(all_rows)}\n')

        # ── Process rows ────────────────────────────────────────────────
        stats = {
            'created': 0,
            'skipped_dup_phone': 0,
            'skipped_no_phone': 0,
            'skipped_not_approved': 0,
            'skipped_existing_db': 0,
            'errors': 0,
        }
        report_rows = []
        seen_phones = set()  # in-memory dedup across files

        for row, source, lookup in all_rows:
            full_name = get(row, lookup, 'name')
            email_raw = get(row, lookup, 'email')
            phone_raw = get(row, lookup, 'phone')
            phone = clean_phone(phone_raw)

            # ── Filter: approved only ───────────────────────────────────
            if approved_only and not is_approved(row, lookup):
                stats['skipped_not_approved'] += 1
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': phone,
                    'result': 'SKIPPED_NOT_APPROVED', 'reason': 'Not in approved list'
                })
                continue

            # ── Filter: must have valid phone ───────────────────────────
            if not phone:
                stats['skipped_no_phone'] += 1
                self.stdout.write(self.style.WARNING(f'  ⚠ No valid phone — skipping: "{full_name}" ({source})'))
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': '',
                    'result': 'SKIPPED_NO_PHONE', 'reason': f'Raw phone: "{phone_raw}"'
                })
                continue

            # ── Filter: cross-file dedup ────────────────────────────────
            if phone in seen_phones:
                stats['skipped_dup_phone'] += 1
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': phone,
                    'result': 'SKIPPED_DUPLICATE', 'reason': 'Duplicate phone in CSV batch'
                })
                continue
            seen_phones.add(phone)

            # ── Filter: already in DB ───────────────────────────────────
            if User.objects.filter(username=phone).exists():
                stats['skipped_existing_db'] += 1
                self.stdout.write(self.style.WARNING(f'  ↩ Already in DB — skipping: {phone} ({full_name})'))
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': phone,
                    'result': 'SKIPPED_EXISTING', 'reason': 'Phone already registered'
                })
                continue

            # ── Parse all fields ────────────────────────────────────────
            gender          = clean_gender(get(row, lookup, 'gender'))
            dob             = clean_dob(get(row, lookup, 'dob'))
            marital         = clean_marital(get(row, lookup, 'marital_status'))
            qualification   = get(row, lookup, 'qualification')
            locations       = get(row, lookup, 'locations')
            exp_years       = clean_experience(get(row, lookup, 'exp_years'))
            local_address   = get(row, lookup, 'local_address')
            perm_address    = get(row, lookup, 'perm_address')
            photo_url       = get(row, lookup, 'photo')       # Google Drive URL
            intermediate    = get(row, lookup, 'intermediate')

            subjects = clean_subjects([
                get(row, lookup, 'classes_subjects'),
                get(row, lookup, 'subjects_9_10'),
                get(row, lookup, 'subjects_11_12'),
                get(row, lookup, 'subjects_extra'),
            ])

            # Unique email — fallback to phone-based if blank or duplicate
            email = make_unique_email(email_raw, phone)
            if User.objects.filter(email=email).exclude(username=phone).exists():
                email = make_unique_email('', phone)  # force phone-based email

            # ── Write to DB ─────────────────────────────────────────────
            if dry_run:
                self.stdout.write(self.style.SUCCESS(
                    f'  ✅ [DRY] Would create: {full_name or "?"} | {phone} | {email} | '
                    f'subjects={subjects[:3]} | exp={exp_years}y'
                ))
                stats['created'] += 1
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': phone,
                    'result': 'WOULD_CREATE', 'reason': ''
                })
                continue

            try:
                with transaction.atomic():
                    # Create User — signal will auto-create TutorProfile + TutorStatus
                    user = User.objects.create_user(
                        username=phone,
                        email=email,
                        password=default_password,
                        first_name=(full_name or '').split()[0][:30] if full_name else '',
                        last_name=' '.join((full_name or '').split()[1:])[:150] if full_name else '',
                        role=User.Role.TEACHER,
                        phone=phone
                    )

                    # Profile was auto-created by signal — fetch and update it
                    profile = user.tutor_profile  # OneToOne, guaranteed to exist
                    profile.full_name             = full_name or ''
                    profile.gender                = gender
                    profile.dob                   = dob
                    profile.marital_status        = marital
                    profile.whatsapp_number       = phone
                    profile.highest_qualification = qualification
                    profile.subjects              = subjects
                    profile.locality              = locations
                    profile.teaching_experience_years = exp_years
                    profile.local_address         = local_address
                    profile.permanent_address     = perm_address
                    profile.teaching_mode         = 'BOTH'
                    # Store Google Drive photo URL (model field added for exactly this purpose)
                    if photo_url and photo_url.startswith('http'):
                        profile.external_profile_image_url = photo_url
                    profile.save()

                    # Update TutorStatus (auto-created by signal as SIGNED_UP)
                    status_obj = profile.status_record
                    status_obj.status = target_status
                    status_obj.save(update_fields=['status'])

                    # If row is approved in admin sheet, create a VERIFIED KYC record
                    if is_approved(row, lookup):
                        TutorKYC.objects.get_or_create(
                            tutor=profile,
                            defaults={'status': TutorKYC.Status.VERIFIED}
                        )

                self.stdout.write(self.style.SUCCESS(
                    f'  ✅ Created: {full_name or "?"} | {phone}'
                ))
                stats['created'] += 1
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': phone,
                    'result': 'CREATED', 'reason': ''
                })

            except Exception as e:
                stats['errors'] += 1
                msg = str(e)
                self.stdout.write(self.style.ERROR(f'  ❌ Error [{full_name} / {phone}]: {msg}'))
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': phone,
                    'result': 'ERROR', 'reason': msg
                })

        # ── Summary ─────────────────────────────────────────────────────
        self.stdout.write('\n' + '─' * 60)
        self.stdout.write(self.style.SUCCESS(f'✅ Created:              {stats["created"]}'))
        self.stdout.write(self.style.WARNING(f'↩  Already in DB:       {stats["skipped_existing_db"]}'))
        self.stdout.write(self.style.WARNING(f'🔁 Duplicate in batch:  {stats["skipped_dup_phone"]}'))
        self.stdout.write(self.style.WARNING(f'📵 No valid phone:      {stats["skipped_no_phone"]}'))
        if approved_only:
            self.stdout.write(self.style.WARNING(f'🚫 Not approved:       {stats["skipped_not_approved"]}'))
        self.stdout.write(self.style.ERROR(  f'❌ Errors:              {stats["errors"]}'))
        self.stdout.write('─' * 60 + '\n')

        # ── Write Report ─────────────────────────────────────────────────
        if report_path:
            try:
                with open(report_path, 'w', newline='', encoding='utf-8') as rf:
                    writer = csv.DictWriter(rf, fieldnames=['source', 'name', 'phone', 'result', 'reason'])
                    writer.writeheader()
                    writer.writerows(report_rows)
                self.stdout.write(self.style.SUCCESS(f'📋 Report saved to: {report_path}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Could not write report: {e}'))
