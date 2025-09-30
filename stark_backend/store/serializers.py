from rest_framework import serializers
from .models import PackagePrice, Section, Product, PaymentMethod, RedeemCode, Package


class SectionSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    products = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = ["id", "name", "description", "image", "products"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None

    def get_products(self, obj):
        return ProductSerializer(obj.products.all(), many=True, context=self.context).data


class PaymentMethodSerializer(serializers.ModelSerializer):
    api_key = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = PaymentMethod
        fields = ["id", "name", "method_type", "api_endpoint", "instructions", "api_key"]


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


class ProductSerializer(serializers.ModelSerializer):
    packages = PackageSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "description", "image", "section", "packages"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


class RedeemCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RedeemCode
        fields = ["id", "product", "code", "used"]
