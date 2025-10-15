from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Wallet(models.Model):
    CURRENCY_CHOICES = (
        ("usd", "US Dollar"),
        ("syp", "Syrian Pound"),
    )

    user = models.ForeignKey(User, related_name="wallets", on_delete=models.CASCADE)
    currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        unique_together = ("user", "currency")

    def __str__(self):
        return f"{self.user.name} - {self.currency}: {self.balance}"


class ExchangeRate(models.Model):
    usd_to_syp = models.DecimalField(max_digits=20, decimal_places=3)
    syp_to_usd = models.DecimalField(max_digits=20, decimal_places=6, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # حساب العكس تلقائيًا
        if self.usd_to_syp:
            self.syp_to_usd = 1 / self.usd_to_syp
        elif self.syp_to_usd:
            self.usd_to_syp = 1 / self.syp_to_usd
        super().save(*args, **kwargs)

    def __str__(self):
        return f"1 USD = {self.usd_to_syp} SYP"
