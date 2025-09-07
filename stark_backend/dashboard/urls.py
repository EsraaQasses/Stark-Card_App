from django.urls import path
from .views import (
    DashboardUserListView, DashboardTransactionListView, DashboardWalletListView,
    DashboardSectionListCreateView, DashboardProductListCreateView,
    DashboardPaymentMethodListCreateView
)

urlpatterns = [
    path("users/", DashboardUserListView.as_view(), name="dashboard-users"),
    path("transactions/", DashboardTransactionListView.as_view(), name="dashboard-transactions"),
    path("wallets/", DashboardWalletListView.as_view(), name="dashboard-wallets"),
    path("sections/", DashboardSectionListCreateView.as_view(), name="dashboard-sections"),
    path("products/", DashboardProductListCreateView.as_view(), name="dashboard-products"),
    path("payment-methods/", DashboardPaymentMethodListCreateView.as_view(), name="dashboard-payment-methods"),
]
