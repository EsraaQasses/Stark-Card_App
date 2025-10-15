from rest_framework import serializers
from .models import ExchangeRate, Wallet

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ["id", "user", "currency", "balance"]
        read_only_fields = ["id", "user", "balance"]


class ExchangeRateSerializer(serializers.ModelSerializer):
    syp_to_usd = serializers.SerializerMethodField()

    class Meta:
        model = ExchangeRate
        fields = ["id", "usd_to_syp", "syp_to_usd", "updated_at"]


    def get_syp_to_usd(self, obj):
        return obj.syp_to_usd