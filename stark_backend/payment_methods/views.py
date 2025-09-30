from rest_framework import viewsets
from .models import PaymentMethod
from .serializers import PaymentMethodSerializer
from users.views import HasRolePermission

class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    allowed_roles = ["admin"]  # فقط الادمن
    permission_classes = [HasRolePermission]