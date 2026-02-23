"""
import_tutors.py — Optimized bulk import of tutors from Google Form CSV exports.

USAGE:
  python manage.py import_tutors path/to/*.csv
  python manage.py import_tutors *.csv --dry-run
  python manage.py import_tutors *.csv --status ACTIVE --report report.csv

KEY FIXES (v2):
  - Per-row savepoints: one bad row never kills the rest
  - Speed: pre-fetches existing data, batches output, minimal queries
  - Extracts subjects AND classes from CSV columns
  - Populates about_me from school experience field
  - Better phone & subject parsing
"""

import csv
import os
import re
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
# ─────────────────────────────────────────────────────────
COLUMN_ALIASES = {
    'email':            ['Email Address', 'Email'],
    'name':             ['NAME', 'Full Name', 'Name'],
    'gender':           ['Gender'],
    'dob':              ['Date of Birth', 'DOB'],
    'phone':            ['CALLING NUMBER , WHATSAPP NUMBER , ALTERNATE NUMBER',
                         'Phone', 'Phone Number'],
    'marital_status':   ['MARITAL STATUS', 'Marital Status'],
    'father_name':      ['FATHER / MOTHER NAME', 'Father / Mother Name'],
    'father_contact':   ['FATHER / MOTHER CONTACT NO.', 'Father Contact'],
    'intermediate':     ['INTERMEDIATE ( Stream , Year , School and Board )',
                         'Intermediate'],
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
    'marksheet':        ['HIGHEST QUALIFICATION MARKSHEET',
                         'HIGHEST QUALIFICATION MARKSHEET '],
    'photo':            ['RECENT PASSPORT SIZE PHOTOGRAPH.',
                         'Recent Passport Size Photograph'],
    'approval':         ['APPROVED OR NOT'],
    'doc_approved':     ['DOCUMENT APPROVED OR NOT'],
    'reg_date':         ['REGISTRATION DATE ( AMOUNT ) -  PROCESSED BY',
                         'REGISTRATION DATE ( AMOUNT ) - PROCESSED BY'],
    'valid_upto':       ['VALID UPTO'],
}


def build_lookup(fieldnames):
    lookup = {}
    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            normalized = alias.strip().replace('\n', '')
            for fn in fieldnames:
                if fn.strip().replace('\n', '') == normalized:
                    lookup[canonical] = fn
                    break
    return lookup


def get(row, lookup, key, default=''):
    col = lookup.get(key)
    if col is None:
        return default
    return (row.get(col) or default).strip()


# ─────────────────────────────────────────────────────────
# Data cleaning helpers
# ─────────────────────────────────────────────────────────

def clean_phone(raw):
    if not raw:
        return ''
    for segment in re.split(r'[,/|]+', raw):
        digits = re.sub(r'\D', '', segment)
        if digits.startswith('91') and len(digits) == 12:
            digits = digits[2:]
        elif digits.startswith('0') and len(digits) == 11:
            digits = digits[1:]
        if len(digits) == 10 and digits[0] in '6789':
            return digits
    return ''


def clean_dob(raw):
    if not raw or raw.strip() in ('#ERROR!', '', 'N/A', 'NA'):
        return None
    raw = raw.strip()
    if re.match(r'^\d{1,3}$', raw):
        return None
    for fmt in ('%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y', '%m-%d-%Y'):
        try:
            parsed = datetime.strptime(raw, fmt).date()
            if date(1960, 1, 1) <= parsed <= date(2008, 12, 31):
                return parsed
        except ValueError:
            continue
    return None


def clean_gender(raw):
    mapping = {'male': 'Male', 'm': 'Male', 'female': 'Female', 'f': 'Female', 'other': 'Other'}
    return mapping.get(raw.strip().lower(), '')


def clean_marital(raw):
    r = raw.strip().lower()
    if 'married' in r:
        return 'Married'
    if 'single' in r or 'unmarried' in r:
        return 'Single'
    return ''


def clean_experience(raw):
    m = re.search(r'\d+', raw or '')
    if m:
        return min(int(m.group()), 50)
    return 0


# Known class/grade patterns to extract from mixed subject strings
CLASS_PATTERNS = [
    r'nursery|pre[\s-]?school|pre[\s-]?primary|kg|lkg|ukg',
    r'class[\s-]?1[\s-]?(?:to|-)[\s-]?5',
    r'class[\s-]?6[\s-]?(?:to|-)[\s-]?8',
    r'class[\s-]?9(?:th)?',
    r'class[\s-]?10(?:th)?',
    r'class[\s-]?11(?:th)?',
    r'class[\s-]?12(?:th)?',
    r'iit[\s-]?jee|neet|competitive',
    r'\b[1-9](?:st|nd|rd|th)\b',
    r'\b1[0-2](?:th)?\b',
]

# Map raw class mentions to normalized values
CLASS_NORMALIZE = {
    'nursery': 'Nursery/Preschool', 'preschool': 'Nursery/Preschool',
    'pre school': 'Nursery/Preschool', 'pre-school': 'Nursery/Preschool',
    'kg': 'Nursery/Preschool', 'lkg': 'Nursery/Preschool', 'ukg': 'Nursery/Preschool',
    'pre primary': 'Nursery/Preschool', 'pre-primary': 'Nursery/Preschool',
    'class 1 to 5': 'Class 1-5', 'class 1-5': 'Class 1-5',
    'class 6 to 8': 'Class 6-8', 'class 6-8': 'Class 6-8',
    'class 9': 'Class 9', 'class 9th': 'Class 9', '9th': 'Class 9',
    'class 10': 'Class 10', 'class 10th': 'Class 10', '10th': 'Class 10',
    'class 11': 'Class 11', 'class 11th': 'Class 11', '11th': 'Class 11',
    'class 12': 'Class 12', 'class 12th': 'Class 12', '12th': 'Class 12',
    'iit jee': 'IIT-JEE/NEET', 'iit-jee': 'IIT-JEE/NEET',
    'neet': 'IIT-JEE/NEET', 'competitive': 'IIT-JEE/NEET',
    '1st': 'Class 1-5', '2nd': 'Class 1-5', '3rd': 'Class 1-5',
    '4th': 'Class 1-5', '5th': 'Class 1-5',
    '6th': 'Class 6-8', '7th': 'Class 6-8', '8th': 'Class 6-8',
}


def clean_subjects_and_classes(parts):
    """
    Parse raw CSV subject columns into separate subjects and classes lists.
    Many CSV entries mix them: "Class 9th, 10th - Mathematics, Science"
    """
    subjects = []
    classes = set()

    # Known subject keywords (case-insensitive matching)
    SUBJECT_KEYWORDS = {
        'mathematics', 'maths', 'math', 'physics', 'chemistry', 'biology',
        'science', 'english', 'hindi', 'sanskrit', 'social science', 'sst',
        'social studies', 'history', 'geography', 'civics', 'political science',
        'computer science', 'computer', 'computers', 'cs', 'it',
        'information technology', 'coding', 'programming',
        'accountancy', 'accounts', 'accounting', 'business studies', 'business',
        'economics', 'commerce', 'evs', 'environmental studies',
        'environmental science', 'psychology', 'sociology',
        'physical education', 'pe', 'general knowledge', 'gk',
        'reasoning', 'aptitude', 'drawing', 'art', 'music',
    }

    # Normalized subject names
    SUBJECT_NORMALIZE = {
        'maths': 'Mathematics', 'math': 'Mathematics', 'mathematics': 'Mathematics',
        'physics': 'Physics', 'chemistry': 'Chemistry', 'biology': 'Biology',
        'science': 'Science', 'english': 'English', 'hindi': 'Hindi',
        'sanskrit': 'Sanskrit', 'social science': 'Social Science',
        'sst': 'Social Science', 'social studies': 'Social Science',
        'history': 'History', 'geography': 'Geography', 'civics': 'Civics',
        'political science': 'Political Science',
        'computer science': 'Computer Science', 'computer': 'Computer Science',
        'computers': 'Computer Science', 'cs': 'Computer Science',
        'it': 'Information Technology', 'information technology': 'Information Technology',
        'coding': 'Coding', 'programming': 'Coding',
        'accountancy': 'Accountancy', 'accounts': 'Accountancy',
        'accounting': 'Accountancy', 'business studies': 'Business Studies',
        'business': 'Business Studies', 'economics': 'Economics',
        'commerce': 'Commerce', 'evs': 'EVS',
        'environmental studies': 'EVS', 'environmental science': 'EVS',
        'psychology': 'Psychology', 'sociology': 'Sociology',
        'physical education': 'Physical Education', 'pe': 'Physical Education',
        'general knowledge': 'General Knowledge', 'gk': 'General Knowledge',
        'reasoning': 'Reasoning', 'aptitude': 'Aptitude',
        'drawing': 'Drawing', 'art': 'Art', 'music': 'Music',
    }

    for part in parts:
        if not part:
            continue
        # Check for class mentions and extract them
        lower_part = part.lower()
        for raw_class, normalized in CLASS_NORMALIZE.items():
            if raw_class in lower_part:
                classes.add(normalized)

        # Split by comma, newline, semicolon, and
        for s in re.split(r'[,\n;]+', part):
            s = s.strip()
            if not s or len(s) <= 1 or s.lower() in ('none', 'na', 'n/a', '-', 'no'):
                continue

            # Check if this token is a class reference (skip adding to subjects)
            s_lower = s.lower().strip()
            if s_lower in CLASS_NORMALIZE:
                classes.add(CLASS_NORMALIZE[s_lower])
                continue

            # Check if it's a pure number like "9th", "10th"
            if re.match(r'^\d{1,2}(?:st|nd|rd|th)?$', s_lower):
                if s_lower in CLASS_NORMALIZE:
                    classes.add(CLASS_NORMALIZE[s_lower])
                continue

            # Check if it looks like "Class X" pattern
            if re.match(r'class\s', s_lower):
                # It's a class, not a subject
                for raw_class, normalized in CLASS_NORMALIZE.items():
                    if raw_class in s_lower:
                        classes.add(normalized)
                continue

            # Otherwise treat as subject — normalize if known
            normalized_subj = SUBJECT_NORMALIZE.get(s_lower)
            if normalized_subj:
                subjects.append(normalized_subj)
            elif len(s) > 2:
                # Unknown but non-trivial — keep as-is
                subjects.append(s)

    # If we found no classes, infer from context
    # "subjects_9_10" column implies Class 9 and Class 10
    # "subjects_11_12" column implies Class 11 and Class 12
    # We handle this in the caller based on which column had data

    # Deduplicate preserving order
    seen = set()
    unique_subjects = []
    for s in subjects:
        key = s.lower()
        if key not in seen:
            seen.add(key)
            unique_subjects.append(s)

    return unique_subjects, sorted(classes)


def is_approved(row, lookup):
    approval = get(row, lookup, 'approval', '').lower()
    doc_approved = get(row, lookup, 'doc_approved', '').lower()
    return 'approved' in approval or 'approved' in doc_approved


def make_unique_email(email, phone):
    if email and '@' in email:
        return email
    return f"{phone}@imported.thtpro.in"


# ─────────────────────────────────────────────────────────
# Django Management Command
# ─────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = 'Bulk import tutors from Google Form CSV exports (v2 — per-row transactions)'

    def add_arguments(self, parser):
        parser.add_argument('csv_files', nargs='+', type=str,
                            help='Path(s) to CSV file(s)')
        parser.add_argument('--dry-run', action='store_true',
                            help='Simulate without writing to DB')
        parser.add_argument('--approved-only', action='store_true',
                            help='Only import rows marked as approved')
        parser.add_argument('--status', type=str, default='ACTIVE',
                            choices=['SIGNED_UP', 'PROFILE_INCOMPLETE',
                                     'KYC_SUBMITTED', 'UNDER_REVIEW',
                                     'APPROVED', 'ACTIVE'],
                            help='TutorStatus to assign (default: ACTIVE)')
        parser.add_argument('--report', type=str, default='',
                            help='Path to write CSV report')
        parser.add_argument('--default-password', type=str, default='Tutor@123',
                            help='Default password for created accounts')
        parser.add_argument('--update-existing', action='store_true',
                            help='Update profiles for existing users (fill empty fields)')

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        approved_only = options['approved_only']
        target_status = options['status']
        report_path = options['report']
        default_password = options['default_password']
        update_existing = options['update_existing']

        if dry_run:
            self.stdout.write(self.style.WARNING(
                '🔍 DRY RUN — no database changes.\n'))

        # ── Load all CSV rows ────────────────────────────────────────
        all_rows = []
        for csv_path in options['csv_files']:
            if not os.path.exists(csv_path):
                self.stdout.write(self.style.ERROR(f'❌ Not found: {csv_path}'))
                continue
            fname = os.path.basename(csv_path)
            try:
                with open(csv_path, encoding='utf-8', errors='replace') as f:
                    reader = csv.DictReader(f)
                    if not reader.fieldnames:
                        self.stdout.write(self.style.ERROR(f'❌ Empty CSV: {fname}'))
                        continue
                    reader.fieldnames = [
                        n.strip().replace('\n', '') for n in reader.fieldnames
                    ]
                    lookup = build_lookup(reader.fieldnames)
                    rows = list(reader)
                self.stdout.write(f'📄 {fname}: {len(rows)} rows. '
                                  f'Mapped columns: {list(lookup.keys())}')
                for row in rows:
                    all_rows.append((row, fname, lookup))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Read error {fname}: {e}'))

        if not all_rows:
            self.stdout.write(self.style.ERROR('No rows. Exiting.'))
            return

        self.stdout.write(f'\n📊 Total rows: {len(all_rows)}\n')

        # ── Pre-fetch for speed ──────────────────────────────────────
        self.stdout.write("🔍 Pre-fetching existing users...")
        existing_usernames = set(
            User.objects.values_list('username', flat=True))
        existing_emails = set(
            User.objects.values_list('email', flat=True))
        self.stdout.write(f"   {len(existing_usernames)} existing users.\n")

        stats = {
            'created': 0, 'updated': 0,
            'skipped_dup': 0, 'skipped_no_phone': 0,
            'skipped_not_approved': 0, 'skipped_existing': 0,
            'errors': 0,
        }
        report_rows = []
        seen_phones = set()
        batch_count = 0

        for row, source, lookup in all_rows:
            full_name = get(row, lookup, 'name')
            phone_raw = get(row, lookup, 'phone')
            phone = clean_phone(phone_raw)
            email_raw = get(row, lookup, 'email')

            # ── Approval filter ──────────────────────────────────────
            if approved_only and not is_approved(row, lookup):
                stats['skipped_not_approved'] += 1
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': phone,
                    'result': 'SKIPPED_NOT_APPROVED', 'reason': ''
                })
                continue

            # ── Must have phone ──────────────────────────────────────
            if not phone:
                stats['skipped_no_phone'] += 1
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': '',
                    'result': 'SKIPPED_NO_PHONE',
                    'reason': f'Raw: "{phone_raw}"'
                })
                continue

            # ── Cross-file dedup ─────────────────────────────────────
            if phone in seen_phones:
                stats['skipped_dup'] += 1
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': phone,
                    'result': 'SKIPPED_DUPLICATE', 'reason': 'Dup in batch'
                })
                continue
            seen_phones.add(phone)

            # ── Already in DB ────────────────────────────────────────
            if phone in existing_usernames and not update_existing:
                stats['skipped_existing'] += 1
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': phone,
                    'result': 'SKIPPED_EXISTING', 'reason': 'Already in DB'
                })
                continue

            # ── Parse fields ─────────────────────────────────────────
            gender = clean_gender(get(row, lookup, 'gender'))
            dob = clean_dob(get(row, lookup, 'dob'))
            marital = clean_marital(get(row, lookup, 'marital_status'))
            qualification = get(row, lookup, 'qualification')
            locations = get(row, lookup, 'locations')
            exp_years = clean_experience(get(row, lookup, 'exp_years'))
            exp_school = get(row, lookup, 'exp_school')
            local_address = get(row, lookup, 'local_address')
            perm_address = get(row, lookup, 'perm_address')
            photo_url = get(row, lookup, 'photo')

            # Parse subjects AND classes
            classes_subjects_raw = get(row, lookup, 'classes_subjects')
            subjects_9_10_raw = get(row, lookup, 'subjects_9_10')
            subjects_11_12_raw = get(row, lookup, 'subjects_11_12')
            subjects_extra_raw = get(row, lookup, 'subjects_extra')

            subjects, classes = clean_subjects_and_classes([
                classes_subjects_raw,
                subjects_9_10_raw,
                subjects_11_12_raw,
                subjects_extra_raw,
            ])

            # Infer classes from which column had data
            if subjects_9_10_raw and subjects_9_10_raw.lower() not in ('', 'na', 'n/a', 'none', 'no', '-'):
                classes = list(set(classes) | {'Class 9', 'Class 10'})
            if subjects_11_12_raw and subjects_11_12_raw.lower() not in ('', 'na', 'n/a', 'none', 'no', '-'):
                classes = list(set(classes) | {'Class 11', 'Class 12'})
            if classes_subjects_raw and any(kw in classes_subjects_raw.lower() for kw in ['1-5', '1 to 5', 'primary']):
                classes = list(set(classes) | {'Class 1-5'})
            if classes_subjects_raw and any(kw in classes_subjects_raw.lower() for kw in ['6-8', '6 to 8', 'middle']):
                classes = list(set(classes) | {'Class 6-8'})

            classes = sorted(set(classes))

            # Build about_me from school experience if available
            about_me = ''
            if exp_school and exp_school.lower() not in ('', 'na', 'n/a', 'none', 'no', '-'):
                about_me = exp_school

            email = make_unique_email(email_raw, phone)
            if email in existing_emails:
                email = make_unique_email('', phone)

            # ── Dry run ──────────────────────────────────────────────
            if dry_run:
                stats['created'] += 1
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': phone,
                    'result': 'WOULD_CREATE', 'reason': ''
                })
                continue

            # ── Handle existing user update ───────────────────────────
            if phone in existing_usernames and update_existing:
                try:
                    with transaction.atomic():
                        user = User.objects.get(username=phone)
                        profile = user.tutor_profile
                        updated = False

                        # Only fill empty fields, don't overwrite existing data
                        if not profile.subjects and subjects:
                            profile.subjects = subjects
                            updated = True
                        if not profile.classes and classes:
                            profile.classes = classes
                            updated = True
                        if not profile.about_me and about_me:
                            profile.about_me = about_me
                            updated = True
                        if not profile.external_profile_image_url and photo_url and photo_url.startswith('http'):
                            profile.external_profile_image_url = photo_url
                            updated = True
                        if not profile.gender and gender:
                            profile.gender = gender
                            updated = True
                        if not profile.dob and dob:
                            profile.dob = dob
                            updated = True
                        if not profile.locality and locations:
                            profile.locality = locations
                            updated = True

                        if updated:
                            profile.save()
                            stats['updated'] += 1
                            report_rows.append({
                                'source': source, 'name': full_name,
                                'phone': phone, 'result': 'UPDATED',
                                'reason': ''
                            })
                        else:
                            stats['skipped_existing'] += 1
                            report_rows.append({
                                'source': source, 'name': full_name,
                                'phone': phone, 'result': 'SKIPPED_EXISTING',
                                'reason': 'No empty fields to update'
                            })
                except Exception as e:
                    stats['errors'] += 1
                    report_rows.append({
                        'source': source, 'name': full_name,
                        'phone': phone, 'result': 'ERROR',
                        'reason': str(e)[:200]
                    })
                continue

            # ── Create new user (PER-ROW SAVEPOINT) ──────────────────
            try:
                with transaction.atomic():
                    user = User.objects.create_user(
                        username=phone,
                        email=email,
                        password=default_password,
                        first_name=(full_name or '').split()[0][:30] if full_name else '',
                        last_name=' '.join((full_name or '').split()[1:])[:150] if full_name else '',
                        role=User.Role.TEACHER,
                        phone=phone,
                    )

                    profile = user.tutor_profile
                    profile.full_name = full_name or ''
                    profile.gender = gender
                    profile.dob = dob
                    profile.marital_status = marital
                    profile.whatsapp_number = phone
                    profile.highest_qualification = qualification
                    profile.subjects = subjects
                    profile.classes = classes
                    profile.locality = locations
                    profile.teaching_experience_years = exp_years
                    profile.local_address = local_address
                    profile.permanent_address = perm_address
                    profile.teaching_mode = 'BOTH'
                    profile.state = 'Uttar Pradesh'
                    profile.city = 'Lucknow'
                    if about_me:
                        profile.about_me = about_me
                    if photo_url and photo_url.startswith('http'):
                        profile.external_profile_image_url = photo_url
                    profile.save()

                    # Update status
                    status_obj = profile.status_record
                    status_obj.status = target_status
                    status_obj.save(update_fields=['status'])

                    # KYC for approved rows
                    if is_approved(row, lookup):
                        TutorKYC.objects.get_or_create(
                            tutor=profile,
                            defaults={'status': TutorKYC.Status.VERIFIED}
                        )

                    # Track in memory to avoid duplicate attempts
                    existing_usernames.add(phone)
                    existing_emails.add(email)

                stats['created'] += 1
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': phone,
                    'result': 'CREATED', 'reason': ''
                })

            except Exception as e:
                stats['errors'] += 1
                msg = str(e)[:200]
                report_rows.append({
                    'source': source, 'name': full_name, 'phone': phone,
                    'result': 'ERROR', 'reason': msg
                })

            # Progress indicator every 500 rows
            batch_count += 1
            if batch_count % 500 == 0:
                self.stdout.write(
                    f'  ⏳ Processed {batch_count} rows... '
                    f'({stats["created"]} created, {stats["errors"]} errors)')

        # ── Summary ──────────────────────────────────────────────────
        self.stdout.write('\n' + '─' * 60)
        self.stdout.write(self.style.SUCCESS(
            f'✅ Created:            {stats["created"]}'))
        self.stdout.write(self.style.SUCCESS(
            f'✏️  Updated:            {stats["updated"]}'))
        self.stdout.write(self.style.WARNING(
            f'↩  Already in DB:      {stats["skipped_existing"]}'))
        self.stdout.write(self.style.WARNING(
            f'🔁 Duplicate in batch: {stats["skipped_dup"]}'))
        self.stdout.write(self.style.WARNING(
            f'📵 No valid phone:     {stats["skipped_no_phone"]}'))
        if approved_only:
            self.stdout.write(self.style.WARNING(
                f'🚫 Not approved:      {stats["skipped_not_approved"]}'))
        self.stdout.write(self.style.ERROR(
            f'❌ Errors:             {stats["errors"]}'))
        self.stdout.write('─' * 60 + '\n')

        # ── Report ───────────────────────────────────────────────────
        if report_path:
            try:
                with open(report_path, 'w', newline='', encoding='utf-8') as rf:
                    w = csv.DictWriter(rf, fieldnames=[
                        'source', 'name', 'phone', 'result', 'reason'])
                    w.writeheader()
                    w.writerows(report_rows)
                self.stdout.write(self.style.SUCCESS(
                    f'📋 Report: {report_path}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(
                    f'Report write error: {e}'))
