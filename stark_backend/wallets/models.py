from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Wallet(models.Model):
    CURRENCY_CHOICES = (
        ("usd", "US Dollar"),
        ("lira", "Turkish Lira"),
    )

    user = models.ForeignKey(User, related_name="wallets", on_delete=models.CASCADE)
    currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        unique_together = ("user", "currency")

    def __str__(self):
        return f"{self.user.name} - {self.currency}: {self.balance}"
