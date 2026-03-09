"""Utility helpers for OTP, OAuth verification, and KYC URL signing."""

import logging
import random
import string
import time

import requests
from cloudinary.utils import private_download_url
from django.conf import settings

logger = logging.getLogger(__name__)


def generate_otp():
    """Generate a six-digit numeric OTP."""
    return ''.join(random.choices(string.digits, k=6))


def send_otp_to_phone(phone, otp):
    """Send OTP through MSG91 Flow API with development fallback logging."""
    if not settings.MSG91_AUTH_KEY or not settings.MSG91_TEMPLATE_ID:
        if settings.DEBUG:
            logger.warning('MSG91 not configured. DEV fallback OTP for %s: %s', phone, otp)
            return True
        logger.error('MSG91 configuration missing in production.')
        return False

    payload = {
        'template_id': settings.MSG91_TEMPLATE_ID,
        'short_url': '0',
        'recipients': [{'mobiles': f'91{phone}', 'otp': otp}],
    }
    headers = {'authkey': settings.MSG91_AUTH_KEY, 'content-type': 'application/json'}

    try:
        response = requests.post(
            'https://api.msg91.com/api/v5/flow/',
            json=payload,
            headers=headers,
            timeout=10,
        )
        if response.status_code in (200, 201, 202):
            return True
        logger.error('MSG91 OTP send failed (%s): %s', response.status_code, response.text)
        return False
    except Exception as exc:  # noqa: BLE001
        logger.exception('MSG91 OTP send exception: %s', exc)
        return False


def verify_google_token(token):
    """Verify Google token and enforce strict audience validation."""
    try:
        logger.debug('Verifying Google Token: %s...', token[:20])

        response = requests.get(f'https://oauth2.googleapis.com/tokeninfo?id_token={token}', timeout=10)

        if response.status_code == 200:
            data = response.json()
            if data.get('aud') != settings.GOOGLE_CLIENT_ID:
                logger.error('Invalid audience: expected %s got %s', settings.GOOGLE_CLIENT_ID, data.get('aud'))
                return {'error': 'invalid_audience'}
            return data

        userinfo_response = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {token}'},
            timeout=10,
        )

        if userinfo_response.status_code == 200:
            data = userinfo_response.json()
            # Access tokens do not return aud via this endpoint; reject for strict audience enforcement.
            logger.error('userinfo token rejected: audience cannot be validated')
            return {'error': 'invalid_audience'}

        logger.error(
            'Google verification failed: ID Token (%s), UserInfo (%s)',
            response.status_code,
            userinfo_response.status_code,
        )
        return {'error': 'google_verification_failed'}
    except Exception as exc:  # noqa: BLE001
        logger.error('Google verification exception: %s', str(exc))
        return {'error': 'google_verification_exception'}


def generate_signed_kyc_url(public_id, expiry_seconds=3600):
    """Generate a private signed Cloudinary download URL for sensitive KYC assets."""
    if not public_id:
        return None
    expires_at = int(time.time()) + int(expiry_seconds)
    return private_download_url(public_id, resource_type='raw', expires_at=expires_at, attachment=False)
