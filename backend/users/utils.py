import random
import string
from django.core.cache import cache
import requests
import sys
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def generate_otp():
    """Generates a 6-digit OTP."""
    return ''.join(random.choices(string.digits, k=6))

def send_otp_to_phone(phone, otp):
    """
    Simulates sending OTP to phone.
    In a real app, integrate an SMS gateway here (e.g., Twilio, SNS).
    """
    logger.info(f"========================================")
    logger.info(f"OTP SENT TO {phone}: {otp}")
    logger.info(f"========================================")
    return True

def verify_google_token(token):
    """
    Verifies the Google token (ID token or Access Token) and returns user info.
    """
    try:
        logger.debug(f"Verifying Google Token: {token[:20]}...")
        
        # Strategy 1: Try as ID Token first
        response = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
        
        if response.status_code == 200:
            data = response.json()
            # Check audience matches our Client ID (critical security check)
            if settings.GOOGLE_CLIENT_ID and data.get('aud') != settings.GOOGLE_CLIENT_ID:
                error_msg = f"Invalid Audience. Expected {settings.GOOGLE_CLIENT_ID}, got {data.get('aud')}"
                logger.error(error_msg)
                return {"error": error_msg}
            return data
        
        # Strategy 2: Try as Access Token - use userinfo endpoint (returns email, name, picture)
        logger.debug(f"ID Token failed ({response.status_code}). Trying as Access Token via userinfo API...")
        userinfo_response = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if userinfo_response.status_code == 200:
            data = userinfo_response.json()
            logger.debug(f"Google userinfo response: {data}")
            # userinfo returns: sub, name, given_name, family_name, picture, email, email_verified
            return data
        else:
            error_msg = f"Google verification failed: ID Token ({response.status_code}), UserInfo ({userinfo_response.status_code})"
            logger.error(error_msg)
            return {"error": error_msg}
    except Exception as e:
        error_msg = f"Google verification exception: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

