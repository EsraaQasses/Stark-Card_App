from rest_framework import serializers
from users.models import User
from wallets.models import Wallet
from transactions.models import Transaction
from store.models import Section, Product, ProductPrice, PaymentMethod

class DashboardUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "phone", "role", "agent"]

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ["id", "user", "currency", "balance"]

class TransactionSerializer(serializers.ModelSerializer):
    user = DashboardUserSerializer(read_only=True)
    class Meta:
        model = Transaction
        fields = ["id", "user", "agent", "admin", "wallet", "transaction_type", "amount", "status", "created_at"]

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ["id", "name", "description", "image"]

class ProductPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductPrice
        fields = ["id", "currency", "amount"]

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ["id", "name", "method_type", "api_endpoint", "instructions"]

class ProductSerializer(serializers.ModelSerializer):
    prices = ProductPriceSerializer(many=True, read_only=True)
    payment_method = PaymentMethodSerializer(read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "description", "image", "section", "payment_method", "prices"]
