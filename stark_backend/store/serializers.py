from rest_framework import serializers
from .models import (
    Section, Product, ProductRequirement, Package, PackagePrice, Favorite, 
    StoreProduct, ExternalProduct
)

class SectionSerializer(serializers.ModelSerializer):
    subsections = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = [
            "id", "name_en", "name_ar", "description", "image", 
            "father_section", "subsections", "products_count", "created_at"
        ]

    def get_subsections(self, obj):
        return SectionSerializer(obj.subsections.all(), many=True).data

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None

    def get_products_count(self, obj):
        return obj.products.count()

class ProductRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRequirement
        fields = ["id", "field_name", "field_type", "is_required", "placeholder", "order"]

class ProductSerializer(serializers.ModelSerializer):
    requirements = ProductRequirementSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    section_name_en = serializers.CharField(source='section.name_en', read_only=True)
    section_name_ar = serializers.CharField(source='section.name_ar', read_only=True)
    api_name = serializers.CharField(source='api_config.name', read_only=True)
    customization_data = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    calculated_price_per_unit = serializers.DecimalField(
        source='price_per_unit', 
        max_digits=10, 
        decimal_places=4, 
        read_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id", "name_en", "name_ar", "description_en", "description_ar",
            "section", "section_name_en", "section_name_ar", "api_config", "api_name",
            "product_type", "min_amount", "max_amount", "min_amount_price",
            "calculated_price_per_unit", "customization_options", "customization_prices", 
            "customization_data", "requirements", "image", "is_active", "is_favorite", 
            "created_at"
        ]
        read_only_fields = ['price_per_unit']

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None

    def get_customization_data(self, obj):
        return obj.get_customization_data()

    def get_is_favorite(self, obj):
        user = self.context["request"].user
        if user.is_authenticated:
            return obj.favorited_by.filter(user=user).exists()
        return False

    def validate(self, data):
        product_type = data.get("product_type")
        
        if product_type == "amount_based":
            min_amount = data.get("min_amount")
            max_amount = data.get("max_amount")
            price_per_unit = data.get("price_per_unit")
            
            if not all([min_amount, max_amount, price_per_unit]):
                raise serializers.ValidationError("Amount based products require min_amount, max_amount, and price_per_unit")
            if min_amount >= max_amount:
                raise serializers.ValidationError("Min amount must be less than max amount")
                
        elif product_type == "customization_based":
            customization_options = data.get("customization_options")
            customization_prices = data.get("customization_prices")
            
            if not customization_options or not customization_prices:
                raise serializers.ValidationError("Customization based products require both options and prices")
            
            options = [opt.strip() for opt in customization_options.split(',') if opt.strip()]
            prices = [price.strip() for price in customization_prices.split(',') if price.strip()]
            
            if len(options) != len(prices):
                raise serializers.ValidationError("Number of options must match number of prices")
            
            try:
                [float(price) for price in prices]
            except ValueError:
                raise serializers.ValidationError("All prices must be valid numbers")

        return data

class ProductCreateSerializer(serializers.ModelSerializer):
    requirements = ProductRequirementSerializer(many=True, required=False)
    calculated_price_per_unit = serializers.DecimalField(
        max_digits=10, 
        decimal_places=4, 
        read_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id", "name_en", "name_ar", "description_en", "description_ar",
            "section", "api_config", "product_type", "min_amount", "max_amount", 
            "min_amount_price", "calculated_price_per_unit",
            "customization_options", "customization_prices", "image", "is_active", 
            "requirements"
        ]
        read_only_fields = ['price_per_unit']

    def create(self, validated_data):
        requirements_data = validated_data.pop('requirements', [])
        product = Product.objects.create(**validated_data)
        
        # Calculate and save price_per_unit
        if product.product_type == "amount_based" and product.min_amount and product.min_amount_price:
            if product.min_amount > 0:
                product.price_per_unit = product.min_amount_price / product.min_amount
                product.save()
        
        for req_data in requirements_data:
            ProductRequirement.objects.create(product=product, **req_data)
            
        return product

    def update(self, instance, validated_data):
        requirements_data = validated_data.pop('requirements', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Recalculate price_per_unit if amount-based fields changed
        if instance.product_type == "amount_based" and instance.min_amount and instance.min_amount_price:
            if instance.min_amount > 0:
                instance.price_per_unit = instance.min_amount_price / instance.min_amount
        
        instance.save()
        
        if requirements_data is not None:
            instance.requirements.all().delete()
            for req_data in requirements_data:
                ProductRequirement.objects.create(product=instance, **req_data)
                
        return instance

class PackagePriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackagePrice
        fields = ["id", "currency", "amount"]

class PackageSerializer(serializers.ModelSerializer):
    prices = PackagePriceSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Package
        fields = ["id", "name", "is_active", "product", "image", "prices"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.product.image and request:
            return request.build_absolute_uri(obj.product.image.url)
        return obj.product.image.url if obj.product.image else None

class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ["id", "product"]
        

class PurchaseSerializer(serializers.Serializer):
    store_product_id = serializers.IntegerField()
    user_inputs = serializers.JSONField()
    
    def validate_store_product_id(self, value):
        try:
            product = StoreProduct.objects.get(id=value, is_active=True)
            return value
        except StoreProduct.DoesNotExist:
            raise serializers.ValidationError("Product not found or inactive")
    
    def validate_user_inputs(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("User inputs must be a JSON object")
        return value

class StoreProductSerializer(serializers.ModelSerializer):
    external_product_info = serializers.SerializerMethodField()
    section_name = serializers.CharField(source='section.name', read_only=True)
    
    class Meta:
        model = StoreProduct
        fields = [
            "id", "name", "description", "price", "section", "section_name",
            "external_product", "external_product_info", "is_active"
        ]
        read_only_fields = ["external_product", "external_product_info"]
    
    def get_external_product_info(self, obj):
        return {
            'original_name': obj.external_product.name,
            'provider': obj.external_product.api_config.provider,
            'base_price': obj.external_product.base_price,
            'required_fields': obj.external_product.required_fields_json
        }

class ExternalProductSerializer(serializers.ModelSerializer):
    api_name = serializers.CharField(source='api_config.name', read_only=True)
    provider = serializers.CharField(source='api_config.provider', read_only=True)
    
    class Meta:
        model = ExternalProduct
        fields = [
            'id', 'external_id', 'name', 'description', 'base_price',
            'category', 'required_fields_json', 'api_config', 'api_name',
            'provider', 'is_active', 'last_synced'
        ]

class StoreProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreProduct
        fields = [
            'id', 'section', 'external_product', 'name', 'description', 
            'price', 'is_active'
        ]
    
    def validate(self, attrs):
        # Validate that external_product belongs to selected API
        external_product = attrs.get('external_product')
        if external_product and not external_product.is_active:
            raise serializers.ValidationError("External product is not active")
        return attrs