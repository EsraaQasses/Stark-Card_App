from rest_framework import generics, permissions
from .models import Transaction
from .serializers import TransactionSerializer, CreateTransactionSerializer
from rest_framework.response import Response
from rest_framework import status
from wallets.models import Wallet

class CreateTransactionView(generics.CreateAPIView):
    serializer_class = CreateTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        transaction = serializer.save(user=self.request.user)
        if transaction.transaction_type == "purchase":
            wallet = transaction.wallet
            wallet.balance -= transaction.amount
            wallet.save()
            transaction.status = "approved"
            transaction.save()

class UserTransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

from rest_framework.views import APIView

class ApproveTransactionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        transaction = Transaction.objects.get(pk=pk)
        if transaction.status != "pending":
            return Response({"detail": "Already processed"}, status=status.HTTP_400_BAD_REQUEST)

        action = request.data.get("action")
        if action == "approve":
            transaction.status = "approved"
            transaction.wallet.balance += transaction.amount
            transaction.wallet.save()
            transaction.save()
        elif action == "reject":
            transaction.status = "rejected"
            transaction.save()
        else:
            return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"status": transaction.status})
