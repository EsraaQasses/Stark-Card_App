from jsonschema import ValidationError
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from .models import Favorite, Section, Product, Package, PackagePrice, Favorite
from .serializers import (
    SectionSerializer,
    ProductSerializer,
    PackageSerializer,
    PackagePriceSerializer,
    FavoriteSerializer
)
from users.permissions import IsAdminUser, IsRegularUser
from rest_framework import generics
from rest_framework.decorators import action


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsAdminUser]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related("section").prefetch_related(
        "packages__prices"
    )
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]


class PackageViewSet(viewsets.ModelViewSet):
    queryset = Package.objects.all().select_related("product").prefetch_related("prices")
    serializer_class = PackageSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        product = serializer.validated_data["product"]
        if product.product_type != "package_based":
            raise ValidationError("لا يمكنك إضافة باكيج لمنتج من نوع Range")
        serializer.save()

class PackagePriceViewSet(viewsets.ModelViewSet):
    queryset = PackagePrice.objects.all().select_related("package")
    serializer_class = PackagePriceSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        package = serializer.validated_data["package"]
        if package.product.product_type != "package_based":
            raise ValidationError("لا يمكنك إضافة سعر لمنتج من نوع Range")
        serializer.save()

class SectionListView(generics.ListAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsRegularUser]


class ProductListBySectionView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsRegularUser]

    def get_queryset(self):
        section_id = self.kwargs.get('section_id')
        return Product.objects.filter(section_id=section_id).select_related("section").prefetch_related("packages__prices")


class PackagePriceListByProductView(generics.ListAPIView):
    serializer_class = PackagePriceSerializer
    permission_classes = [IsRegularUser]

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        product = Product.objects.get(id=product_id)

        if product.product_type == "range_based":
            # المنتج ما الو أسعار محددة → رجّع queryset فاضي
            return PackagePrice.objects.none()

        return PackagePrice.objects.filter(package__product_id=product_id).select_related("package")

    def list(self, request, *args, **kwargs):
        product_id = self.kwargs.get('product_id')
        product = Product.objects.get(id=product_id)

        if product.product_type == "range_based":
            return Response({
                "product": product.name,
                "type": product.product_type,
                "min_value": product.min_value,
                "max_value": product.max_value,
            })

        return super().list(request, *args, **kwargs)


class FavoriteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """عرض قائمة المفضلات للـ user"""
        favorites = Favorite.objects.filter(user=request.user).select_related("product")
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(data=serializer.data)

    @action(detail=False, methods=["post"])
    def add(self, request):
        product_id = request.data.get("product_id")
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"detail": "المنتج غير موجود"}, status=status.HTTP_404_NOT_FOUND)

        favorite, created = Favorite.objects.get_or_create(user=request.user, product=product)
        if not created:
            return Response({"detail": "المنتج بالفعل موجود بالمفضلة"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "تمت الإضافة للمفضلة"}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def remove(self, request):
        product_id = request.data.get("product_id")
        try:
            favorite = Favorite.objects.get(user=request.user, product_id=product_id)
            favorite.delete()
            return Response({"detail": "تمت الإزالة من المفضلة"}, status=status.HTTP_200_OK)
        except Favorite.DoesNotExist:
            return Response({"detail": "المنتج غير موجود بالمفضلة"}, status=status.HTTP_404_NOT_FOUND)
