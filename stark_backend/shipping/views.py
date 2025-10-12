# shipping/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import Shipping
from .serializers import ShippingSerializer, ShippingStatusUpdateSerializer
from users.permissions import IsAdminUser, IsRegularUser
from wallets.models import Wallet
from transactions.models import Transaction

class ShippingViewSet(viewsets.ModelViewSet):
    serializer_class = ShippingSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Shipping.objects.all()
        return Shipping.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.action in ['update_status', 'partial_update']:
            return ShippingStatusUpdateSerializer
        return ShippingSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        shipping = self.get_object()
        new_status = request.data.get('status')
        
        with transaction.atomic():
            # Update shipping status
            serializer = ShippingStatusUpdateSerializer(shipping, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            updated_shipping = serializer.save()
            
            # If approved, add funds to wallet
            if new_status == 'approved' and shipping.status != 'approved':
                self._process_payment(shipping)
            
            # Update the original request status
            if new_status == 'approved':
                shipping.request.status = 'completed'
            elif new_status == 'rejected':
                shipping.request.status = 'rejected'
                shipping.request.rejection_reason = request.data.get('admin_notes', '')
            shipping.request.save()
        
        return Response({
            "message": f"Shipping status updated to {new_status}",
            "shipping": ShippingSerializer(updated_shipping).data
        })
    
    def _process_payment(self, shipping):
        """Add funds to user's wallet and create transaction"""
        try:
            # Get or create wallet for the user and currency
            wallet, created = Wallet.objects.get_or_create(
                user=shipping.user,
                currency=shipping.currency,
                defaults={'balance': 0}
            )
            
            # Update wallet balance
            wallet.balance += shipping.amount
            wallet.save()
            
            # Create transaction record
            transaction_obj = Transaction.objects.create(
                user=shipping.user,
                wallet=wallet,
                amount=shipping.amount,
                transaction_type="deposit",
                status="approved",
                description=f"Manual payment via {shipping.request.payment_method.title if shipping.request.payment_method else 'Payment Method'}",
                reference=f"SHIPPING_{shipping.id}"
            )
            
            # Update shipping with transaction reference
            shipping.transaction_ref = f"TXN_{transaction_obj.id}"
            shipping.processed_at = transaction_obj.created_at
            shipping.save()
            
        except Exception as e:
            # Handle error - you might want to log this
            raise serializers.ValidationError(f"Error processing payment: {str(e)}")