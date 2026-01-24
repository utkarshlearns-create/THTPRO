import random
import string
from django.core.cache import cache
import requests

def generate_otp():
    """Generates a 6-digit OTP."""
    return ''.join(random.choices(string.digits, k=6))

def send_otp_to_phone(phone, otp):
    """
    Simulates sending OTP to phone.
    In a real app, integrate an SMS gateway here (e.g., Twilio, SNS).
    """
    print(f"========================================")
    print(f"DTO SENT TO {phone}: {otp}")
    print(f"========================================")
    return True

def verify_google_token(token):
    """
    Verifies the Google ID token with Google's public keys.
    """
    try:
        # Simple verification using Google's token info endpoint
        # For production, use google-auth authentication library for better security and caching
        response = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        print(f"Google Token Verification Error: {e}")
        return None
