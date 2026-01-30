from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import Wallet
from .serializers import WalletSerializer, TransactionSerializer

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
        return self.request.user.wallet.transactions.all().order_by('-created_at')
