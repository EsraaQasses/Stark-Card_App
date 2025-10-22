from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction

from agents import serializers
from system.models import Notification
from .models import Shipping
from .serializers import ShippingSerializer, ShippingStatusUpdateSerializer
from users.permissions import IsAdminUser, IsRegularUser
from wallets.models import Wallet
from transactions.models import Transaction

class ShippingViewSet(viewsets.ModelViewSet):
    serializer_class = ShippingSerializer
    @action(detail=False, methods=['get'])
    def count(self, request):
        """Get total count of shipping requests"""
        try:
            pending_count = Shipping.objects.filter(status='pending').count()
            total_count = Shipping.objects.count()
            
            return Response({
                'total_count': total_count,
                'pending_count': pending_count,
                'approved_count': Shipping.objects.filter(status='approved').count(),
                'rejected_count': Shipping.objects.filter(status='rejected').count()
            })
        except Exception as e:
            return Response({
                'error': 'Database error',
                'detail': str(e)
            }, status=500)
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
            # إرسال إشعار حسب الحالة الجديدة
        if new_status == 'approved' and shipping.status != 'approved':
            self._process_payment(shipping)
            Notification.objects.create(
                recipient=shipping.user,
                title="تمت الموافقة على طلب الشحن",
                message=f"تمت الموافقة على شحنتك رقم {shipping.id} بقيمة {shipping.amount}",
                icon=""
            )

        elif new_status == 'rejected':
                reason = request.data.get('admin_notes', 'لم يتم تحديد السبب')
                Notification.objects.create(
                recipient=shipping.user,
                title="تم رفض طلب الشحن",
                message=f"تم رفض شحنتك رقم {shipping.id}. السبب: {reason}",
                icon="alert-circle"
            )
            
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

            Notification.objects.create(
                recipient=shipping.user,
                title="تمت إضافة الأموال إلى محفظتك",
                message=f"تمت إضافة مبلغ {shipping.amount} {shipping.currency} إلى محفظتك بنجاح.",
                icon=""
)
            
        except Exception as e:
            # Handle error - you might want to log this
            raise serializers.ValidationError(f"Error processing payment: {str(e)}")