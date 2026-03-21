"""Wallet app URL routes."""

from django.urls import path

from .views import (
    AddFundsView,
    AdminPackageView,
    AdminTransactionListView,
    CreateRazorpayOrderView,
    RazorpayWebhookView,
    RevokeCreditsView,
    SubscriptionPackageListView,
    TransactionListView,
    WalletView,
)

urlpatterns = [
    path('me/', WalletView.as_view(), name='wallet-detail'),
    path('transactions/', TransactionListView.as_view(), name='wallet-transactions'),
    path('add-funds/', AddFundsView.as_view(), name='wallet-add-funds'),
    path('create-order/', CreateRazorpayOrderView.as_view(), name='wallet-create-order'),
    path('webhook/razorpay/', RazorpayWebhookView.as_view(), name='wallet-razorpay-webhook'),
    path('packages/', SubscriptionPackageListView.as_view(), name='package-list'),
    path('admin/packages/', AdminPackageView.as_view(), name='admin-package-list'),
    path('admin/transactions/', AdminTransactionListView.as_view(), name='admin-transaction-list'),
    path('admin/users/<int:pk>/revoke/', RevokeCreditsView.as_view(), name='admin-revoke-credits'),
]
