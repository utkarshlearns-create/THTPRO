from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
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
        # Give free credits to EVERYONE for now if new wallet
        if created:
             wallet.credit(500, "Welcome Bonus")
        return wallet

class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.wallet.transactions.all().order_by('-created_at')
