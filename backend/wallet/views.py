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
