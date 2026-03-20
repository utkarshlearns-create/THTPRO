"""
Password Reset Views.
POST /api/users/password-reset/        → accepts {email}, sends reset link
POST /api/users/password-reset/confirm/ → accepts {uid, token, new_password}
"""
import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from core.throttles import LoginThrottle

logger = logging.getLogger(__name__)
User = get_user_model()


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginThrottle]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email address is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
            self._send_reset_email(user)
            logger.info('Password reset email sent to %s', email)
        except User.DoesNotExist:
            logger.warning('Password reset requested for unknown email: %s', email)

        return Response(
            {'message': 'If an account with that email exists, a password reset link has been sent.'},
            status=status.HTTP_200_OK
        )

    def _send_reset_email(self, user):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"

        subject = 'Reset Your Password — The Home Tuitions'
        message = f"""Hi {user.first_name or user.username},

We received a request to reset the password for your account on The Home Tuitions.

Click the link below to reset your password. This link is valid for 24 hours.

{reset_url}

If you did not request a password reset, you can safely ignore this email.

— The Home Tuitions Team
support@thehometuitions.in | +91 6387488141
"""
        html_message = f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 40px 0;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07);">
    <div style="background: #3730a3; padding: 32px 40px;">
      <h1 style="color: white; margin: 0; font-size: 22px;">The Home Tuitions</h1>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Reset Your Password</h2>
      <p style="color: #64748b; line-height: 1.6;">Hi {user.first_name or user.username},</p>
      <p style="color: #64748b; line-height: 1.6;">
        Click the button below to set a new password. This link is valid for <strong>24 hours</strong>.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{reset_url}" style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #94a3b8; font-size: 13px;">
        Or copy this link: <a href="{reset_url}" style="color: #4f46e5; word-break: break-all;">{reset_url}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
      <p style="color: #94a3b8; font-size: 12px;">If you did not request this, ignore this email. Your password will not change.</p>
    </div>
    <div style="background: #f8fafc; padding: 20px 40px; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 The Home Tuitions · support@thehometuitions.in</p>
    </div>
  </div>
</body>
</html>
"""
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginThrottle]

    def post(self, request):
        uid = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')

        if not uid or not token or not new_password:
            return Response({'error': 'uid, token and new_password are all required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_pk)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'This reset link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'This reset link is invalid or has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        logger.info('Password reset successful for user %s', user.pk)

        return Response({'message': 'Password reset successful. You can now log in with your new password.'}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """
    POST /api/users/change-password/
    Authenticated users can change their own password.
    Accepts { current_password, new_password }
    """
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [LoginThrottle]

    def post(self, request):
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')

        if not current_password or not new_password:
            return Response(
                {'error': 'Both current_password and new_password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {'error': 'New password must be at least 8 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not request.user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if current_password == new_password:
            return Response(
                {'error': 'New password must be different from current password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        request.user.set_password(new_password)
        request.user.save()
        logger.info('Password changed for user %s', request.user.pk)

        return Response(
            {'message': 'Password changed successfully.'},
            status=status.HTTP_200_OK
        )
