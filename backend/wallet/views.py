from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import Wallet
from .serializers import WalletSerializer, TransactionSerializer, SubscriptionPackageSerializer

class WalletView(generics.RetrieveAPIView):
    """
    Get current user's wallet balance and transactions
    """
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Auto-create wallet if it doesn't exist (failsafe)
        wallet, created = Wallet.objects.get_or_create(user=self.request.user)
        # Give welcome bonus credits if new wallet (configurable via environment)
        if created:
             wallet.credit(settings.WELCOME_BONUS_CREDITS, "Welcome Bonus")
        return wallet

class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Auto-create wallet if missing
        Wallet.objects.get_or_create(user=self.request.user)
        return self.request.user.wallet.transactions.all().order_by('-created_at')

class AddFundsView(APIView):
    """
    Simulate adding funds to wallet (e.g., after Payment Gateway success).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount')
        try:
            amount = float(amount)
            if amount <= 0:
                 raise ValueError
        except (TypeError, ValueError):
            return Response({"error": "Invalid amount"}, status=400)
            
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        
        try:
            new_balance = wallet.credit(amount, "Funds Added via Payment Gateway")
            return Response({
                "message": "Funds added successfully",
                "balance": new_balance,
                "added": amount
            })
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class SubscriptionPackageListView(generics.ListAPIView):
    """List all active packages"""
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
    """Admin view to manage packages"""
    serializer_class = SubscriptionPackageSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        from .models import SubscriptionPackage
        return SubscriptionPackage.objects.all()


class AdminTransactionListView(generics.ListAPIView):
    """Admin view to see all transactions"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        from .models import Transaction
        from django.db.models import Q
        
        queryset = Transaction.objects.all().select_related('wallet__user').order_by('-created_at')
        
        # Filters
        user_role = self.request.query_params.get('role')
        if user_role:
            queryset = queryset.filter(wallet__user__role=user_role)
            
        status = self.request.query_params.get('status')
        # Transactions don't have status, but we might filter by type
        if status: # Assuming status maps to type for now or ignored
             pass

        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(
                Q(wallet__user__username__icontains=q) |
                Q(wallet__user__email__icontains=q) |
                Q(description__icontains=q)
            )
            
        return queryset


class RevokeCreditsView(APIView):
    """
    Superadmin: Revoke (deduct) credits from a user's wallet.
    Useful for correcting mistakes or penalizing users.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'SUPERADMIN':
            return Response({"error": "Only Superadmin can revoke credits"}, status=403)
            
        from django.shortcuts import get_object_or_404
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        target_user = get_object_or_404(User, pk=pk)
        amount = request.data.get('amount')
        reason = request.data.get('reason', 'Admin Correction')
        
        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError
        except (TypeError, ValueError):
            return Response({"error": "Invalid amount"}, status=400)
            
        wallet, _ = Wallet.objects.get_or_create(user=target_user)
        
        try:
            new_balance = wallet.debit(amount, f"REVOKED BY ADMIN: {reason}")
            
            return Response({
                "message": f"Successfully revoked {amount} credits",
                "user": target_user.username,
                "new_balance": new_balance,
                "reason": reason
            })
        except Exception as e:
            return Response({"error": str(e)}, status=400)
