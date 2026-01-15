from django.db import models
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Wallet ({self.balance})"

    @transaction.atomic
    def credit(self, amount, description=""):
        """Add funds to wallet"""
        if amount <= 0:
            raise ValueError("Amount must be positive")
        
        self.balance += amount
        self.save()
        
        Transaction.objects.create(
            wallet=self,
            amount=amount,
            transaction_type='CREDIT',
            description=description
        )
        return self.balance

    @transaction.atomic
    def debit(self, amount, description=""):
        """Deduct funds from wallet"""
        if amount <= 0:
            raise ValueError("Amount must be positive")
        if self.balance < amount:
            raise ValueError("Insufficient balance")
        
        self.balance -= amount
        self.save()
        
        Transaction.objects.create(
            wallet=self,
            amount=amount,
            transaction_type='DEBIT',
            description=description
        )
        return self.balance


class Transaction(models.Model):
    TYPE_CHOICES = (
        ('CREDIT', 'Credit'), # Money added
        ('DEBIT', 'Debit'),   # Money spent
    )

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type}: {self.amount} - {self.description}"
