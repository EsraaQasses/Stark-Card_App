from django.contrib import admin
from .models import Section, Product, ProductPrice, PaymentMethod, RedeemCode

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "section", "payment_method")
    list_filter = ("section",)
    search_fields = ("name",)

@admin.register(ProductPrice)
class ProductPriceAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "currency", "amount")
    list_filter = ("currency",)

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "method_type")

@admin.register(RedeemCode)
class RedeemCodeAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "code", "used")
    list_filter = ("used",)
