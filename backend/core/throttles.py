"""Custom throttle classes for high-risk endpoints."""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginThrottle(AnonRateThrottle):
    """Throttle anonymous login attempts to reduce brute-force risk."""

    scope = 'login'


class ContactUnlockThrottle(UserRateThrottle):
    """Throttle tutor contact unlock requests to prevent abuse."""

    scope = 'contact_unlock'


class KYCUploadThrottle(UserRateThrottle):
    """Throttle KYC upload attempts to limit repeated submissions."""

    scope = 'kyc_upload'
