from django.urls import path
from .views import WalletView, TransactionListView, AddFundsView, SubscriptionPackageListView, AdminPackageView, AdminTransactionListView, RevokeCreditsView

urlpatterns = [
    path('me/', WalletView.as_view(), name='wallet-detail'),
    path('transactions/', TransactionListView.as_view(), name='wallet-transactions'),
    path('add-funds/', AddFundsView.as_view(), name='wallet-add-funds'),
    
    # Packages
    path('packages/', SubscriptionPackageListView.as_view(), name='package-list'),
    path('admin/packages/', AdminPackageView.as_view(), name='admin-package-list'),
    
    # Admin Transactions
    path('admin/transactions/', AdminTransactionListView.as_view(), name='admin-transaction-list'),
    path('admin/users/<int:pk>/revoke/', RevokeCreditsView.as_view(), name='admin-revoke-credits'),
]
