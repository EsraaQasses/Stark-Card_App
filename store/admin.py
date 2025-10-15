from django.contrib import admin
from .models import Section, Product, Package, PackagePrice

# ===========================
# Section Admin
# ===========================
@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("id", "name_en", "name_ar", "parent_section")
    search_fields = ("name_en", "name_ar")

    def parent_section(self, obj):
        return obj.father_section.name_en if obj.father_section else "-"
    parent_section.short_description = "Parent Section"

# ===========================
# Product Admin
# ===========================
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name_en", "name_ar", "section_name")
    list_filter = ("section",)
    search_fields = ("name_en", "name_ar")

    def section_name(self, obj):
        return obj.section.name_en
    section_name.short_description = "Section"

# ===========================
# Package Price Inline
# ===========================
class PackagePriceInline(admin.TabularInline):
    model = PackagePrice
    extra = 1

# ===========================
# Package Admin
# ===========================
@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "product", "is_active")
    list_filter = ("is_active",)
    inlines = [PackagePriceInline]
