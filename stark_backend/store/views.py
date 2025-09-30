from rest_framework import viewsets
from .models import Section, Product, Package, PackagePrice, RedeemCode
from .serializers import (
    SectionSerializer,
    ProductSerializer,
    PackageSerializer,
    PackagePriceSerializer,
    RedeemCodeSerializer,
)
from users.views import HasRolePermission  


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    allowed_roles = ["admin"]  # فقط الادمن
    permission_classes = [HasRolePermission]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related("section").prefetch_related(
        "packages__prices"
    )
    serializer_class = ProductSerializer
    allowed_roles = ["admin"]
    permission_classes = [HasRolePermission]


class PackageViewSet(viewsets.ModelViewSet):
    queryset = Package.objects.all().select_related("product").prefetch_related("prices")
    serializer_class = PackageSerializer
    allowed_roles = ["admin"]
    permission_classes = [HasRolePermission]


class PackagePriceViewSet(viewsets.ModelViewSet):
    queryset = PackagePrice.objects.all().select_related("package")
    serializer_class = PackagePriceSerializer
    allowed_roles = ["admin"]
    permission_classes = [HasRolePermission]


class RedeemCodeViewSet(viewsets.ModelViewSet):
    queryset = RedeemCode.objects.all().select_related("product")
    serializer_class = RedeemCodeSerializer
    allowed_roles = ["admin"]
    permission_classes = [HasRolePermission]
