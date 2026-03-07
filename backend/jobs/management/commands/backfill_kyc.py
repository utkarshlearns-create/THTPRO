"""
Backfill KYC records for imported tutors from CSV data.
Connection-resilient version: handles Neon free tier connection drops.
"""
import csv
import os
import re
import time

from django.core.management.base import BaseCommand
from django.db import connection
from users.models import User, TutorProfile, TutorKYC


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
    matches = re.findall(r'[6-9]\d{9}', raw)
    if matches:
        return matches[0]
    return ''


PHONE_ALIASES = ['CALLING NUMBER , WHATSAPP NUMBER , ALTERNATE NUMBER',
                 'CALLING NUMBER, WHATSAPP NUMBER, ALTERNATE NUMBER',
                 'Phone', 'Phone Number', 'Contact Number']
AADHAAR_FRONT_ALIASES = ['AADHAAR CARD FRONT']
AADHAAR_BACK_ALIASES = ['AADHAAR CARD BACK']
EDUCATION_ALIASES = ['HIGHEST QUALIFICATION MARKSHEET',
                     'HIGHEST QUALIFICATION MARKSHEET ']
PHOTO_ALIASES = ['Recent Passport Size Photograph',
                 'RECENT PASSPORT SIZE PHOTOGRAPH.',
                 'RECENT PASSPORT SIZE PHOTOGRAPH']


def find_column(headers, aliases):
    for alias in aliases:
        for i, h in enumerate(headers):
            if h.strip().upper() == alias.strip().upper():
                return i
    return None


def get_val(row, idx):
    if idx is not None and idx < len(row):
        return row[idx].strip()
    return ''


def ensure_connection():
    """Close stale connections and ensure a fresh one."""
    try:
        connection.ensure_connection()
    except Exception:
        connection.close()
        connection.ensure_connection()


class Command(BaseCommand):
    help = 'Backfill KYC records for imported tutors from CSV Google Form data'

    def add_arguments(self, parser):
        parser.add_argument('csv_files', nargs='+', type=str,
                            help='Path(s) to CSV file(s)')
        parser.add_argument('--dry-run', action='store_true')
        parser.add_argument('--report', type=str, default='')

    def handle(self, *args, **options):
        csv_files = options['csv_files']
        dry_run = options['dry_run']
        report_path = options.get('report', '')

        results = []
        stats = {'created': 0, 'updated': 0, 'skipped_exist': 0,
                 'skipped_no_phone': 0, 'skipped_no_tutor': 0,
                 'skipped_no_docs': 0, 'errors': 0, 'retries': 0}

        for fpath in csv_files:
            fname = os.path.basename(fpath)
            self.stdout.write(f'\nProcessing: {fname}')

            try:
                rows = []
                with open(fpath, encoding='utf-8') as f:
                    reader = csv.reader(f)
                    headers = next(reader)
                    rows = list(reader)

                phone_idx = find_column(headers, PHONE_ALIASES)
                aadhaar_front_idx = find_column(headers, AADHAAR_FRONT_ALIASES)
                aadhaar_back_idx = find_column(headers, AADHAAR_BACK_ALIASES)
                education_idx = find_column(headers, EDUCATION_ALIASES)
                photo_idx = find_column(headers, PHOTO_ALIASES)

                if phone_idx is None:
                    self.stdout.write(f'  WARNING: No phone column, skipping')
                    continue

                self.stdout.write(f'  {len(rows)} rows, cols: phone={phone_idx}, af={aadhaar_front_idx}, ab={aadhaar_back_idx}, edu={education_idx}, photo={photo_idx}')

                for i, row in enumerate(rows):
                    raw_phone = get_val(row, phone_idx)
                    phone = clean_phone(raw_phone)
                    if not phone:
                        stats['skipped_no_phone'] += 1
                        continue

                    af = get_val(row, aadhaar_front_idx)
                    ab = get_val(row, aadhaar_back_idx)
                    edu = get_val(row, education_idx)
                    photo = get_val(row, photo_idx)

                    af = af if af.startswith('http') else ''
                    ab = ab if ab.startswith('http') else ''
                    edu = edu if edu.startswith('http') else ''
                    photo = photo if photo.startswith('http') else ''

                    if not any([af, ab, edu, photo]):
                        stats['skipped_no_docs'] += 1
                        continue

                    if dry_run:
                        stats['created'] += 1
                        continue

                    # Process with retry logic
                    max_retries = 3
                    for attempt in range(max_retries):
                        try:
                            ensure_connection()
                            user = User.objects.get(phone=phone)
                            profile = user.tutor_profile

                            kyc_qs = TutorKYC.objects.filter(tutor=profile)
                            if kyc_qs.exists():
                                kyc = kyc_qs.first()
                                changed = False
                                if af and not kyc.external_aadhaar_front_url:
                                    kyc.external_aadhaar_front_url = af
                                    changed = True
                                if ab and not kyc.external_aadhaar_back_url:
                                    kyc.external_aadhaar_back_url = ab
                                    changed = True
                                if edu and not kyc.external_education_url:
                                    kyc.external_education_url = edu
                                    changed = True
                                if photo and not kyc.external_photo_url:
                                    kyc.external_photo_url = photo
                                    changed = True
                                if changed:
                                    kyc.status = 'VERIFIED'
                                    kyc.aadhaar_front_verified = True
                                    kyc.aadhaar_back_verified = True
                                    kyc.qualification_verified = True
                                    kyc.save()
                                    stats['updated'] += 1
                                    results.append((fname, phone, 'UPDATED', ''))
                                else:
                                    stats['skipped_exist'] += 1
                            else:
                                TutorKYC.objects.create(
                                    tutor=profile,
                                    external_aadhaar_front_url=af,
                                    external_aadhaar_back_url=ab,
                                    external_education_url=edu,
                                    external_photo_url=photo,
                                    status='VERIFIED',
                                    aadhaar_front_verified=bool(af),
                                    aadhaar_back_verified=bool(ab),
                                    qualification_verified=bool(edu),
                                    submission_count=1,
                                )
                                stats['created'] += 1
                                results.append((fname, phone, 'CREATED', ''))
                            break  # success
                        except User.DoesNotExist:
                            stats['skipped_no_tutor'] += 1
                            break
                        except TutorProfile.DoesNotExist:
                            stats['skipped_no_tutor'] += 1
                            break
                        except Exception as e:
                            err_str = str(e).lower()
                            if attempt < max_retries - 1 and ('connection' in err_str or 'closed' in err_str or 'server' in err_str or 'translate' in err_str or 'timeout' in err_str):
                                stats['retries'] += 1
                                connection.close()
                                time.sleep(3 + attempt * 2)
                            else:
                                stats['errors'] += 1
                                results.append((fname, phone, 'ERROR', err_str[:80]))
                                break

                    # Progress logging
                    if (i + 1) % 500 == 0:
                        self.stdout.write(f'  ... {i+1}/{len(rows)} rows processed (created={stats["created"]}, retries={stats["retries"]})')

            except Exception as e:
                self.stdout.write(f'  ERROR: {e}')

        self.stdout.write(f'\n{"="*50}')
        self.stdout.write(f'KYC Backfill Complete')
        self.stdout.write(f'  Created:           {stats["created"]}')
        self.stdout.write(f'  Updated:           {stats["updated"]}')
        self.stdout.write(f'  Skipped (exist):   {stats["skipped_exist"]}')
        self.stdout.write(f'  Skipped (no phone):{stats["skipped_no_phone"]}')
        self.stdout.write(f'  Skipped (no tutor):{stats["skipped_no_tutor"]}')
        self.stdout.write(f'  Skipped (no docs): {stats["skipped_no_docs"]}')
        self.stdout.write(f'  Errors:            {stats["errors"]}')
        self.stdout.write(f'  Retries:           {stats["retries"]}')

        if report_path:
            with open(report_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['source', 'phone', 'result', 'reason'])
                writer.writerows(results)
            self.stdout.write(f'Report written to {report_path}')
