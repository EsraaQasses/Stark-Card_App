from rest_framework import viewsets
from .models import PaymentMethod
from .serializers import PaymentMethodSerializer
from users.permissions import IsAdminUser
from rest_framework import generics
from users.permissions import IsRegularUser

class PaymentMethodAdminViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAdminUser]  # CRUD للأدمن فقط


class PaymentMethodListView(generics.ListAPIView):
    queryset = PaymentMethod.objects.filter(is_active=True)
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsRegularUser]  # user و agent فقط