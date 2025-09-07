from rest_framework import serializers
from .models import Section, Product, ProductPrice, PaymentMethod, RedeemCode

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ["id", "name", "description", "image"]

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ["id", "name", "method_type", "api_endpoint", "instructions"]

class ProductPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductPrice
        fields = ["id", "currency", "amount"]

class ProductSerializer(serializers.ModelSerializer):
    prices = ProductPriceSerializer(many=True, read_only=True)
    payment_method = PaymentMethodSerializer(read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "description", "image", "section", "payment_method", "prices"]

class RedeemCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RedeemCode
        fields = ["id", "product", "code", "used"]
