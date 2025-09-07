from django.urls import path
from .views import CreateTransactionView, UserTransactionListView, ApproveTransactionView

urlpatterns = [
    path("create/", CreateTransactionView.as_view(), name="transaction-create"),
    path("me/", UserTransactionListView.as_view(), name="user-transactions"),
    path("approve/<int:pk>/", ApproveTransactionView.as_view(), name="transaction-approve"),
]
