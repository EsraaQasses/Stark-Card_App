from django.contrib import admin
from .models import Wallet

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "currency", "balance")
    search_fields = ("user__name", "user__email")
    list_filter = ("currency",)
