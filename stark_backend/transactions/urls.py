from django.urls import path
from .views import  ApproveTransactionView

urlpatterns = [
    path("approve/<int:pk>/", ApproveTransactionView.as_view(), name="transaction-approve"),
]
