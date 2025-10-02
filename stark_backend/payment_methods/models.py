from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class PaymentMethod(models.Model):
    CURRENCY_CHOICES = (
        ("usd", "US Dollar"),
        ("syp", "Syrian Pound"),
    )

    title = models.CharField(max_length=255)  
    currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES)
    icon_url = models.URLField(blank=True, null=True)  
    account_details = models.TextField()  
    instructions = models.TextField() 
    is_active = models.BooleanField(default=True)  

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.currency})"
