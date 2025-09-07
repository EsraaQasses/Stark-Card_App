from rest_framework import serializers
from .models import Transaction
from wallets.models import Wallet

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id", "user", "agent", "admin", "wallet",
            "transaction_type", "amount", "status", "note", "created_at"
        ]
        read_only_fields = ["id", "status", "created_at"]

class CreateTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["wallet", "transaction_type", "amount", "note"]

    def validate(self, attrs):
        wallet = attrs.get("wallet")
        amount = attrs.get("amount")
        if wallet.balance < amount and attrs.get("transaction_type") == "purchase":
            raise serializers.ValidationError("Insufficient balance")
        return attrs
