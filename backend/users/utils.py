"""Utility helpers for OTP, OAuth verification, and KYC URL signing."""

import logging
import random
import re
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

        # 1. Try as ID Token
        response = requests.get(f'https://oauth2.googleapis.com/tokeninfo?id_token={token}', timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('aud') != settings.GOOGLE_CLIENT_ID:
                logger.error('Invalid ID Token audience: expected %s got %s', settings.GOOGLE_CLIENT_ID, data.get('aud'))
                return {'error': 'invalid_audience'}
            return data

        # 2. Try as Access Token
        response = requests.get(f'https://oauth2.googleapis.com/tokeninfo?access_token={token}', timeout=10)
        if response.status_code == 200:
            data = response.json()
            # For access tokens, 'azp' or 'aud' contains the Client ID
            client_id = data.get('azp') or data.get('aud')
            if client_id != settings.GOOGLE_CLIENT_ID:
                logger.error('Invalid Access Token audience/azp: expected %s got %s', settings.GOOGLE_CLIENT_ID, client_id)
                return {'error': 'invalid_audience'}
            
            # Access tokens from tokeninfo might lack profile data, fall back to userinfo if email is missing
            if not data.get('email'):
                userinfo_res = requests.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    headers={'Authorization': f'Bearer {token}'},
                    timeout=10,
                )
                if userinfo_res.status_code == 200:
                    data.update(userinfo_res.json())
                else:
                    logger.error('Could not fetch userinfo for access token: %s', userinfo_res.status_code)
                    return {'error': 'google_verification_failed'}
            return data

        logger.error(
            'Google verification failed (ID/Access Token Info both failed): %s',
            response.status_code,
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


def get_tutor_image_url(profile):
    """
    Centralized utility to get a tutor's profile image URL.
    Handles transformation of Google Drive links to direct image links.
    """
    if not profile:
        return None

    if profile.profile_image:
        return profile.profile_image.url

    url = profile.external_profile_image_url
    if not url:
        return None

    # Transform Google Drive links to direct image links
    if "drive.google.com" in url:
        # Handle both id=FILE_ID and /file/d/FILE_ID/
        match = re.search(r'id=([a-zA-Z0-9_-]+)', url) or re.search(r'/file/d/([a-zA-Z0-9_-]+)', url)
        if match:
            file_id = match.group(1)
            return f"https://lh3.googleusercontent.com/d/{file_id}"

    return url
