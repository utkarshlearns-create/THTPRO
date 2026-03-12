"""Wallet and payment API views."""

import hashlib
import hmac
import json
import logging
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsAdminRole
from core.roles import SUPERADMIN
from .models import PaymentRecord, Wallet
from .serializers import (
    SubscriptionPackageSerializer,
    TransactionSerializer,
    WalletSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)


class WalletView(generics.RetrieveAPIView):
    """Get current user's wallet balance and transactions."""

    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        wallet, created = Wallet.objects.get_or_create(user=self.request.user)
        if created:
            wallet.credit(settings.WELCOME_BONUS_CREDITS, 'Welcome Bonus')
        return wallet


class TransactionListView(generics.ListAPIView):
    """List transactions for current user wallet."""

    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        Wallet.objects.get_or_create(user=self.request.user)
        return self.request.user.wallet.transactions.all().order_by('-created_at')


class AddFundsView(APIView):
    """Manual wallet top-up endpoint restricted to superadmin only."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != SUPERADMIN:
            return Response({'error': 'Only Superadmin can manually top up credits.'}, status=403)

        amount = request.data.get('amount')
        user_id = request.data.get('user_id') or request.user.id

        try:
            amount = Decimal(str(amount))
            if amount <= 0:
                raise ValueError
        except (TypeError, ValueError):
            return Response({'error': 'Invalid amount'}, status=400)

        target_user = User.objects.filter(id=user_id).first()
        if not target_user:
            return Response({'error': 'Target user not found'}, status=404)

        wallet, _ = Wallet.objects.get_or_create(user=target_user)
        try:
            new_balance = wallet.credit(amount, f'Manual top-up by {request.user.username}')
            return Response({'message': 'Funds added successfully', 'balance': new_balance, 'added': amount})
        except Exception as exc:
            return Response({'error': str(exc)}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(APIView):
    """Consumes Razorpay webhooks and credits wallets on captured payments."""

    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        raw_body = request.body
        provided_signature = request.headers.get('x-razorpay-signature', '')

        if not settings.RAZORPAY_WEBHOOK_SECRET:
            logger.error('Razorpay webhook secret is not configured.')
            return Response({'error': 'Webhook is not configured on server'}, status=503)

        expected_signature = hmac.new(
            settings.RAZORPAY_WEBHOOK_SECRET.encode('utf-8'),
            raw_body,
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, provided_signature):
            return Response({'error': 'Invalid webhook signature'}, status=400)

        try:
            payload = json.loads(raw_body.decode('utf-8'))
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON payload'}, status=400)

        event = payload.get('event')
        if event != 'payment.captured':
            return Response({'message': 'Event ignored'}, status=200)

        entity = payload.get('payload', {}).get('payment', {}).get('entity', {})
        order_id = entity.get('order_id')
        payment_id = entity.get('id')
        amount_paise = entity.get('amount')

        if not order_id or not payment_id or amount_paise is None:
            return Response({'error': 'Incomplete payment payload'}, status=400)

        notes = entity.get('notes', {}) or {}
        user_id = notes.get('user_id')
        if not user_id:
            return Response({'error': 'Missing user_id in payment notes'}, status=400)

        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({'error': 'User not found for payment'}, status=404)

        amount = Decimal(str(amount_paise)) / Decimal('100')

        with transaction.atomic():
            if PaymentRecord.objects.filter(razorpay_order_id=order_id).exists():
                return Response({'message': 'Payment already processed'}, status=200)

            wallet, _ = Wallet.objects.get_or_create(user=user)
            wallet.credit(amount, f'Razorpay payment captured ({payment_id})')

            PaymentRecord.objects.create(
                user=user,
                razorpay_order_id=order_id,
                razorpay_payment_id=payment_id,
                amount=amount,
                status=event,
            )

        return Response({'message': 'Wallet credited successfully'}, status=200)


class SubscriptionPackageListView(generics.ListAPIView):
    """List all active packages."""

    serializer_class = SubscriptionPackageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from .models import SubscriptionPackage

        queryset = SubscriptionPackage.objects.filter(is_active=True)
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(target_role=role.upper())
        return queryset


class AdminPackageView(generics.ListCreateAPIView):
    """Admin view to manage packages."""

    serializer_class = SubscriptionPackageSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        from .models import SubscriptionPackage

        return SubscriptionPackage.objects.all()


class AdminTransactionListView(generics.ListAPIView):
    """Admin view to see all wallet transactions."""

    serializer_class = TransactionSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        from django.db.models import Q
        from .models import Transaction

        queryset = Transaction.objects.all().select_related('wallet__user').order_by('-created_at')

        user_role = self.request.query_params.get('role')
        if user_role:
            queryset = queryset.filter(wallet__user__role=user_role)

        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(
                Q(wallet__user__username__icontains=q)
                | Q(wallet__user__email__icontains=q)
                | Q(description__icontains=q)
            )

        return queryset


class RevokeCreditsView(APIView):
    """Superadmin can revoke credits from a user's wallet."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != SUPERADMIN:
            return Response({'error': 'Only Superadmin can revoke credits'}, status=403)

        from django.shortcuts import get_object_or_404

        target_user = get_object_or_404(User, pk=pk)
        amount = request.data.get('amount')
        reason = request.data.get('reason', 'Admin Correction')

        try:
            amount = Decimal(str(amount))
            if amount <= 0:
                raise ValueError
        except (TypeError, ValueError):
            return Response({'error': 'Invalid amount'}, status=400)

        wallet, _ = Wallet.objects.get_or_create(user=target_user)

        try:
            new_balance = wallet.debit(amount, f'REVOKED BY ADMIN: {reason}')
            return Response(
                {
                    'message': f'Successfully revoked {amount} credits',
                    'user': target_user.username,
                    'new_balance': new_balance,
                    'reason': reason,
                }
            )
        except Exception as exc:
            return Response({'error': str(exc)}, status=400)
