from django.db import models
from django.conf import settings
from wallets.models import Wallet
from django.core.exceptions import ValidationError

User = settings.AUTH_USER_MODEL


class Section(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to="sections/", blank=True, null=True)

    def __str__(self):
        return self.name


class PaymentMethod(models.Model):
    METHOD_TYPES = (
        ("manual_code", "Manual Redeem Code"),
        ("in_game_topup", "In-Game Top-Up"),
        ("api_provider", "API Provider"),
    )

    name = models.CharField(max_length=255)
    method_type = models.CharField(max_length=50, choices=METHOD_TYPES)
    api_endpoint = models.URLField(blank=True, null=True)
    api_key = models.CharField(max_length=255, blank=True, null=True)
    instructions = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    section = models.ForeignKey(Section, related_name="products", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to="products/", blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.section.name})"

    def clean(self):
        # هذا التحقق يضمن وجود باكيج واحد على الأقل لكل منتج
        if self.pk and not self.packages.exists():
            raise ValidationError("المنتج يجب أن يحوي باكيج واحد على الأقل")


class Package(models.Model):
    product = models.ForeignKey("Product", related_name="packages", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)  # مثال: "60 UC"
    is_active = models.BooleanField(default=True)  # الباكيج متوفر أو لا

    def __str__(self):
        return f"{self.name} ({self.product.name})"

    @property
    def image(self):
        return self.product.image.url if self.product.image else None


class PackagePrice(models.Model):
    CURRENCY_CHOICES = Wallet.CURRENCY_CHOICES
    package = models.ForeignKey(Package, related_name="prices", on_delete=models.CASCADE)
    currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ("package", "currency")

    def __str__(self):
        return f"{self.package.name} - {self.currency}: {self.amount}"


class RedeemCode(models.Model):
    product = models.ForeignKey(Product, related_name="codes", on_delete=models.CASCADE)
    code = models.CharField(max_length=255)
    used = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.code} - {'Used' if self.used else 'Available'}"
