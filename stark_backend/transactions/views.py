from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Transaction
from wallets.models import Wallet
from rest_framework import permissions

class ApproveTransactionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        transaction = Transaction.objects.get(pk=pk)

        if transaction.status != "pending":
            return Response({"detail": "Already processed"}, status=status.HTTP_400_BAD_REQUEST)

        action = request.data.get("action")
        if action not in ["approve", "reject"]:
            return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

        if action == "reject":
            transaction.status = "rejected"
            transaction.save()
            return Response({"status": transaction.status})

        # إذا كانت العملية موافقة
        if transaction.transaction_type == "deposit":
            transaction.wallet.balance += transaction.amount
            transaction.wallet.save()
        elif transaction.transaction_type == "purchase":
            # المبلغ تم خصمه عند الإنشاء، فلا نفعل شيء
            pass
        elif transaction.transaction_type == "transfer":
            # خصم من محفظة المرسل وإضافة للمستلم
            sender_wallet = transaction.wallet
            recipient_wallet = Wallet.objects.get(pk=transaction.recipient_wallet_id)
            sender_wallet.balance -= transaction.amount
            recipient_wallet.balance += transaction.amount
            sender_wallet.save()
            recipient_wallet.save()

        transaction.status = "approved"
        transaction.save()
        return Response({"status": transaction.status})
