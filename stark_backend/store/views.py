from rest_framework import viewsets, permissions
from .models import Section, Product, Package, PackagePrice, PaymentMethod, RedeemCode
from .serializers import SectionSerializer, ProductSerializer, PackageSerializer, PackagePriceSerializer, PaymentMethodSerializer, RedeemCodeSerializer

class BaseViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class SectionViewSet(BaseViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer


class ProductViewSet(BaseViewSet):
    queryset = Product.objects.all().select_related("section").prefetch_related(
        "packages__prices"
    )
    serializer_class = ProductSerializer


class PackageViewSet(BaseViewSet):
    queryset = Package.objects.all().select_related("product").prefetch_related("prices")
    serializer_class = PackageSerializer


class PackagePriceViewSet(BaseViewSet):
    queryset = PackagePrice.objects.all().select_related("package")
    serializer_class = PackagePriceSerializer


class PaymentMethodViewSet(BaseViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer


class RedeemCodeViewSet(BaseViewSet):
    queryset = RedeemCode.objects.all().select_related("product")
    serializer_class = RedeemCodeSerializer
