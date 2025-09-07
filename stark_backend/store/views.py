from rest_framework import generics, permissions
from .models import Section, Product, ProductPrice, PaymentMethod, RedeemCode
from .serializers import SectionSerializer, ProductSerializer, ProductPriceSerializer, PaymentMethodSerializer

class SectionListView(generics.ListAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.AllowAny]

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        section_id = self.request.query_params.get("section")
        if section_id:
            return Product.objects.filter(section_id=section_id)
        return Product.objects.all()

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
