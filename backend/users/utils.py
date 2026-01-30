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
    Verifies the Google ID token with Google's public keys.
    """
    try:
        # Simple verification using Google's token info endpoint
        # For production, use google-auth authentication library for better security and caching
        logger.debug(f"Verifying Google Token: {token[:20]}...")
        response = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
        
        if response.status_code == 200:
            data = response.json()
            # Check if Audience matches our Client ID
            # This is CRITICAL for security (prevents token reuse from other apps)
            if settings.GOOGLE_CLIENT_ID and data.get('aud') != settings.GOOGLE_CLIENT_ID:
                error_msg = f"Invalid Audience. Expected {settings.GOOGLE_CLIENT_ID}, got {data.get('aud')}"
                logger.error(error_msg)
                return {"error": error_msg}

            return data
        
        # If ID Token fails, try Access Token
        logger.debug(f"ID Token failed ({response.status_code}). Trying Access Token verification...")
        response_access = requests.get(f"https://oauth2.googleapis.com/tokeninfo?access_token={token}")
        
        if response_access.status_code == 200:
            data = response_access.json()
            # Access tokens from Google usually have 'audience' or 'azp' field, but strict aud check is mostly for ID tokens.
            # However, if we have a GOOGLE_CLIENT_ID, we should try to verify it if present.
            if settings.GOOGLE_CLIENT_ID and data.get('aud') and data.get('aud') != settings.GOOGLE_CLIENT_ID:
                 # Note: Sometimes access tokens have different aud logic, but for simple sign-in it usually matches.
                 # Warn but maybe allow if strict ID token check passed (but here ID token failed so we are in fallback).
                 # Let's verify strictly to be safe.
                error_msg = f"Invalid Audience (Access Token). Expected {settings.GOOGLE_CLIENT_ID}, got {data.get('aud')}"
                logger.error(error_msg)
                return {"error": error_msg}
                
            return data
        else:
             # Return error from first attempt usually, or combined?
            error_msg = f"Google verification failed: ID Token ({response.status_code}), Access Token ({response_access.status_code})"
            logger.error(error_msg)
            return {"error": error_msg}
    except Exception as e:
        error_msg = f"Google verification exception: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}
