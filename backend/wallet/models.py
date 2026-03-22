from django.db import models
from django.contrib.auth import get_user_model
from django.db import transaction
from decimal import Decimal

User = get_user_model()

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Wallet ({self.balance})"

    @transaction.atomic
    def credit(self, amount, description=""):
        """Add funds to wallet"""
        from decimal import Decimal
        amount = Decimal(str(amount))
        
        if amount <= 0:
            raise ValueError("Amount must be positive")
        
        # Ensure self.balance is Decimal
        if not isinstance(self.balance, Decimal):
            self.balance = Decimal(str(self.balance))

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
        from decimal import Decimal
        amount = Decimal(str(amount))
        
        if amount <= 0:
            raise ValueError("Amount must be positive")
        
        if not isinstance(self.balance, Decimal):
            self.balance = Decimal(str(self.balance))

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


class SubscriptionPackage(models.Model):
    """Packages for purchasing credits"""
    ROLE_CHOICES = (
        ('PARENT', 'Parent'),
        ('TEACHER', 'Teacher'),
        ('INSTITUTION', 'Institution'),
    )
    
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    credit_amount = models.IntegerField()
    target_role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    features = models.JSONField(default=list, blank=True) # List of feature strings
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.credit_amount} Credits) - ₹{self.price}"


class PaymentRecord(models.Model):
    """Tracks processed Razorpay payments to enforce idempotent wallet credits."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_records')
    razorpay_order_id = models.CharField(max_length=128, unique=True)
    razorpay_payment_id = models.CharField(max_length=128)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=32, default='payment.captured')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.razorpay_order_id} - {self.user.username}"
