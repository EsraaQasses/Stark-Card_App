from django.contrib import admin
from django import forms
from django.utils.html import format_html
from .models import Section, Product, ProductRequirement, StoreProduct, ExternalProduct

class ProductRequirementInline(admin.TabularInline):
    model = ProductRequirement
    extra = 1

class ProductAdminForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = '__all__'
    
    def clean(self):
        cleaned_data = super().clean()
        product_type = cleaned_data.get('product_type')
        
        if product_type == 'amount_based':
            min_amount = cleaned_data.get('min_amount')
            min_amount_price = cleaned_data.get('min_amount_price')
            max_amount = cleaned_data.get('max_amount')
            
            if not all([min_amount, min_amount_price, max_amount]):
                raise forms.ValidationError("Amount based products require min amount, max amount, and min amount price")
            
            if min_amount >= max_amount:
                raise forms.ValidationError("Min amount must be less than max amount")
            
            if min_amount <= 0:
                raise forms.ValidationError("Min amount must be greater than 0")
                
        elif product_type == 'customization_based':
            customization_options = cleaned_data.get('customization_options')
            customization_prices = cleaned_data.get('customization_prices')
            
            if not customization_options or not customization_prices:
                raise forms.ValidationError("Customization based products require both options and prices")
            
            options = [opt.strip() for opt in customization_options.split(',') if opt.strip()]
            prices = [price.strip() for price in customization_prices.split(',') if price.strip()]
            
            if len(options) != len(prices):
                raise forms.ValidationError("Number of options must match number of prices")
            
            try:
                [float(price) for price in prices]
            except ValueError:
                raise forms.ValidationError("All prices must be valid numbers")
        
        return cleaned_data

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'name_ar', 'father_section', 'created_at')
    list_filter = ('father_section',)
    search_fields = ('name_en', 'name_ar')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    inlines = [ProductRequirementInline]
    list_display = (
        'name_en', 'name_ar', 'section', 'product_type', 
        'display_price_info', 'is_active', 'created_at'
    )
    list_filter = ('section', 'product_type', 'is_active', 'api_config')
    search_fields = ('name_en', 'name_ar')
    readonly_fields = ('price_per_unit', 'created_at', 'updated_at', 'display_price_calculation')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name_en', 'name_ar', 'description_en', 'description_ar', 'section', 'api_config', 'image')
        }),
        ('Product Type', {
            'fields': ('product_type', 'is_active')
        }),
        ('Amount Based Configuration', {
            'fields': (
                'min_amount', 
                'max_amount', 
                'min_amount_price',
                'display_price_calculation',
                'price_per_unit'
            ),
            'classes': ('collapse',)
        }),
        ('Customization Based Configuration', {
            'fields': ('customization_options', 'customization_prices'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def display_price_info(self, obj):
        if obj.product_type == 'amount_based':
            return f"${obj.min_amount_price} min → ${obj.price_per_unit:.4f}/unit"
        elif obj.product_type == 'customization_based':
            return "Custom pricing"
        return "N/A"
    display_price_info.short_description = 'Pricing Info'
    
    def display_price_calculation(self, obj):
        if obj.product_type == 'amount_based' and obj.min_amount and obj.min_amount_price:
            calculated_price = obj.min_amount_price / obj.min_amount
            return format_html(
                '<div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">'
                '<strong>Price Calculation:</strong><br>'
                'Min Amount Price / Min Amount = Price Per Unit<br>'
                '${} / {} = <strong>${:.4f}</strong> per unit'
                '</div>',
                obj.min_amount_price, obj.min_amount, calculated_price
            )
        return "Price per unit will be calculated automatically when you save the product."
    display_price_calculation.short_description = 'Price Calculation'
    display_price_calculation.allow_tags = True

    def save_model(self, request, obj, form, change):
        # Ensure price_per_unit is calculated before saving
        if obj.product_type == "amount_based" and obj.min_amount and obj.min_amount_price:
            if obj.min_amount > 0:
                obj.price_per_unit = obj.min_amount_price / obj.min_amount
        super().save_model(request, obj, form, change)

# Keep your existing StoreProduct admin
class StoreProductForm(forms.ModelForm):
    class Meta:
        model = StoreProduct
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['external_product'].queryset = ExternalProduct.objects.filter(
            is_active=True,
            api_config__is_active=True
        ).select_related('api_config')

@admin.register(StoreProduct)
class StoreProductAdmin(admin.ModelAdmin):
    form = StoreProductForm
    list_display = ('name', 'section', 'price', 'external_product', 'is_active')
    list_filter = ('section', 'is_active', 'external_product__api_config__provider')
    search_fields = ('name', 'external_product__name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('section', 'external_product', 'name', 'description', 'price', 'is_active')
        }),
        ('External Product Info (Read-only)', {
            'fields': ('get_external_product_info',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_external_product_info(self, obj):
        if obj.external_product:
            return f"""
            <strong>Original Name:</strong> {obj.external_product.name}<br>
            <strong>Provider:</strong> {obj.external_product.api_config.provider}<br>
            <strong>Base Price:</strong> ${obj.external_product.base_price}<br>
            <strong>Category:</strong> {obj.external_product.category}<br>
            <strong>Required Fields:</strong> {obj.external_product.required_fields_json}
            """
        return "No external product linked"
    get_external_product_info.allow_tags = True
    get_external_product_info.short_description = "External Product Details"

@admin.register(ExternalProduct)
class ExternalProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'api_config', 'base_price', 'category', 'is_active', 'last_synced')
    list_filter = ('api_config__provider', 'category', 'is_active')
    search_fields = ('name', 'external_id')
    readonly_fields = ('external_id', 'base_price', 'required_fields_json', 'external_data', 'last_synced')
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False