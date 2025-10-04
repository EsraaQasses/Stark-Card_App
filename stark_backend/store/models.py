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


class Product(models.Model):
    PRODUCT_TYPES = (
        ("package_based", "Package Based"),
        ("range_based", "Range Based"),
    )
    section = models.ForeignKey(Section, related_name="products", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES)

    min_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.section.name})"


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


class Favorite(models.Model):
    user = models.ForeignKey(User, related_name="favorites", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name="favorited_by", on_delete=models.CASCADE)

    class Meta:
        unique_together = ("user", "product")

    def __str__(self):
        return f"{self.user} - {self.product.name}"