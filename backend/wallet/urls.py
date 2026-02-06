from django.urls import path
from .views import WalletView, TransactionListView, AddFundsView

urlpatterns = [
    path('me/', WalletView.as_view(), name='wallet-detail'),
    path('transactions/', TransactionListView.as_view(), name='wallet-transactions'),
    path('add-funds/', AddFundsView.as_view(), name='wallet-add-funds'),
]
