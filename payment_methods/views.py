from rest_framework import viewsets, generics
from .models import PaymentMethod
from .serializers import PaymentMethodSerializer, PaymentMethodCreateSerializer, PaymentMethodFieldSerializer
from users.permissions import IsAdminUser, IsRegularUser

class PaymentMethodAdminViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PaymentMethodCreateSerializer
        return PaymentMethodSerializer

class PaymentMethodListView(generics.ListAPIView):
    queryset = PaymentMethod.objects.filter(is_active=True)
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsRegularUser]