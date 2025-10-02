from django.urls import path
from .views import UserWalletListView, WalletDetailView

urlpatterns = [
    path("me/", UserWalletListView.as_view(), name="user-wallets"),
    path("<int:pk>/", WalletDetailView.as_view(), name="wallet-detail"),
]
