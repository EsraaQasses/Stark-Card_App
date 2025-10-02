from django.contrib import admin
from .models import Section, Product, Package, PackagePrice, RedeemCode

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "section")
    list_filter = ("section",)
    search_fields = ("name",)
    # نعرض الباكيجات كـ inline
    inlines = []

class PackagePriceInline(admin.TabularInline):
    model = PackagePrice
    extra = 1

class PackageInline(admin.TabularInline):
    model = Package
    extra = 1
    show_change_link = True
    inlines = [PackagePriceInline]

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "product", "is_active")
    list_filter = ("is_active",)
    inlines = [PackagePriceInline]

@admin.register(RedeemCode)
class RedeemCodeAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "code", "used")
    list_filter = ("used",)
