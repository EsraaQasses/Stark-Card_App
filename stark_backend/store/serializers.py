from rest_framework import serializers
from .models import Favorite, PackagePrice, Section, Product, Package


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
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "description", "image", "section", "packages", "is_favorite"]

    def get_is_favorite(self, obj):
        user = self.context["request"].user
        return obj.favorited_by.filter(user=user).exists()

    def validate(self, data):
        product_type = data.get("product_type")
        min_value = data.get("min_value")
        max_value = data.get("max_value")

        if product_type == "range_based":
            if min_value is None or max_value is None:
                raise serializers.ValidationError("منتج الـ Range لازم يحتوي حد أدنى وأقصى")
            if min_value >= max_value:
                raise serializers.ValidationError("الحد الأدنى يجب أن يكون أصغر من الحد الأقصى")

        if product_type == "package_based":
            if min_value or max_value:
                raise serializers.ValidationError("منتج الباكيجات ما لازم يحتوي min/max")

        return data

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ["id", "product"]