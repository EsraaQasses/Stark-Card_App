from django.db import models
from django.conf import settings
from wallets.models import Wallet
from django.core.exceptions import ValidationError
from third_party_apis.models import ThirdPartyAPI 

User = settings.AUTH_USER_MODEL

class Section(models.Model):
    name_en = models.CharField(max_length=255)
    name_ar = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to="sections/", blank=True, null=True)
    father_section = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name="subsections"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name_en']

    def __str__(self):
        return f"{self.name_en} / {self.name_ar}"

class ProductRequirement(models.Model):
    FIELD_TYPES = (
        ('text', 'Text'),
        ('number', 'Number'),
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('id', 'ID'),
    )
    
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='requirements')
    field_name = models.CharField(max_length=255)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    is_required = models.BooleanField(default=True)
    placeholder = models.CharField(max_length=255, blank=True, null=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.field_name} ({self.field_type}) - {self.product.name_en}"

class Product(models.Model):
    PRODUCT_TYPES = (
        ("amount_based", "Amount Based"),
        ("customization_based", "Customization Based"),
    )
    
    section = models.ForeignKey(Section, related_name="products", on_delete=models.CASCADE)
    api_config = models.ForeignKey(ThirdPartyAPI, on_delete=models.SET_NULL, null=True, blank=True)
    
    name_en = models.CharField(max_length=255)
    name_ar = models.CharField(max_length=255)
    
    description_en = models.TextField(blank=True, null=True)
    description_ar = models.TextField(blank=True, null=True)
    
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES, default="amount_based")
    
    min_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    min_amount_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Price for the minimum amount (will be used to calculate price per unit)"
    )
    price_per_unit = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        editable=False,
        help_text="Automatically calculated: min_amount_price / min_amount"
    )
    
    customization_options = models.TextField(blank=True, null=True, help_text="Comma-separated values: option1,option2,option3")
    customization_prices = models.TextField(blank=True, null=True, help_text="Comma-separated prices matching options: 10,15,20")
    
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name_en']

    def __str__(self):
        return f"{self.name_en} / {self.name_ar}"

    def save(self, *args, **kwargs):
        if self.product_type == "amount_based" and self.min_amount and self.min_amount_price:
            if self.min_amount > 0:
                self.price_per_unit = self.min_amount_price / self.min_amount
            else:
                self.price_per_unit = 0
        elif self.product_type == "customization_based":
            self.price_per_unit = None
        
        super().save(*args, **kwargs)

    def clean(self):
        if self.product_type == "amount_based":
            if not all([self.min_amount, self.max_amount, self.min_amount_price]):
                raise ValidationError("Amount based products require min_amount, max_amount, and min_amount_price")
            if self.min_amount >= self.max_amount:
                raise ValidationError("Min amount must be less than max amount")
            if self.min_amount <= 0:
                raise ValidationError("Min amount must be greater than 0")
                
        elif self.product_type == "customization_based":
            if not self.customization_options or not self.customization_prices:
                raise ValidationError("Customization based products require both options and prices")
            
            options = [opt.strip() for opt in self.customization_options.split(',') if opt.strip()]
            prices = [price.strip() for price in self.customization_prices.split(',') if price.strip()]
            
            if len(options) != len(prices):
                raise ValidationError("Number of options must match number of prices")
            
            try:
                [float(price) for price in prices]
            except ValueError:
                raise ValidationError("All prices must be valid numbers")

    def get_customization_data(self):
        """Returns customization options with prices as list of tuples"""
        if self.product_type != "customization_based":
            return []
        
        options = [opt.strip() for opt in self.customization_options.split(',') if opt.strip()]
        prices = [price.strip() for price in self.customization_prices.split(',') if price.strip()]
        
        return list(zip(options, prices))

    def calculate_price(self, amount=None, selected_option=None):
        """Calculate price based on amount or selected option"""
        if self.product_type == "amount_based" and amount is not None:
            if amount < self.min_amount or amount > self.max_amount:
                raise ValueError(f"Amount must be between {self.min_amount} and {self.max_amount}")
            return float(amount) * float(self.price_per_unit)
        
        elif self.product_type == "customization_based" and selected_option is not None:
            customization_data = self.get_customization_data()
            for option, price in customization_data:
                if option == selected_option:
                    return float(price)
            raise ValueError(f"Invalid option: {selected_option}")
        
        return None

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

class ExternalProduct(models.Model):
    """Read-only cache of products from external APIs"""
    api_config = models.ForeignKey(ThirdPartyAPI, on_delete=models.CASCADE, related_name='external_products')
    external_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100, blank=True)
    required_fields_json = models.JSONField(default=list)  # Store required input fields
    external_data = models.JSONField(default=dict)  # Store original API response
    is_active = models.BooleanField(default=True)
    last_synced = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['api_config', 'external_id']
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.api_config.provider})"

class StoreProduct(models.Model):
    """Custom product with admin-defined name and price"""
    section = models.ForeignKey('Section', on_delete=models.CASCADE, related_name='store_products')
    external_product = models.ForeignKey(ExternalProduct, on_delete=models.CASCADE, related_name='store_products')
    
    # Admin-defined fields
    name = models.CharField(max_length=255)  # Custom name
    description = models.TextField(blank=True)  # Custom description
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Custom price
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} (Based on: {self.external_product.name})"