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
    """Verify Google token while always enforcing audience validation.

    Supports both ID tokens and OAuth access tokens returned by Google login flows.
    """
    try:
        logger.debug('Verifying Google token: %s...', token[:20])

        # 1) Try ID token validation
        id_response = requests.get(
            f'https://oauth2.googleapis.com/tokeninfo?id_token={token}',
            timeout=10,
        )
        if id_response.status_code == 200:
            data = id_response.json()
            if data.get('aud') != settings.GOOGLE_CLIENT_ID:
                logger.error(
                    'Invalid ID token audience: expected %s got %s',
                    settings.GOOGLE_CLIENT_ID,
                    data.get('aud'),
                )
                return {'error': 'invalid_audience'}
            return data

        # 2) Try access token validation via tokeninfo (contains aud/app_id metadata)
        access_info_response = requests.get(
            f'https://oauth2.googleapis.com/tokeninfo?access_token={token}',
            timeout=10,
        )
        if access_info_response.status_code == 200:
            access_info = access_info_response.json()
            aud = access_info.get('aud') or access_info.get('issued_to') or access_info.get('azp')
            if aud != settings.GOOGLE_CLIENT_ID:
                logger.error(
                    'Invalid access token audience: expected %s got %s',
                    settings.GOOGLE_CLIENT_ID,
                    aud,
                )
                return {'error': 'invalid_audience'}

            # Fetch user identity after audience verification succeeds
            userinfo_response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {token}'},
                timeout=10,
            )
            if userinfo_response.status_code == 200:
                return userinfo_response.json()

            logger.error(
                'Google userinfo fetch failed after valid audience: %s %s',
                userinfo_response.status_code,
                userinfo_response.text,
            )
            return {'error': 'google_userinfo_failed'}

        logger.error(
            'Google verification failed: id_token=%s, access_token=%s',
            id_response.status_code,
            access_info_response.status_code,
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
