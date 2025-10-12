from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from .models import Favorite, Section, Product, Package, PackagePrice, StoreProduct, ExternalProduct, ProductRequirement
from .serializers import (
    SectionSerializer,
    ProductSerializer,
    ProductRequirementSerializer,
    PackageSerializer,
    PackagePriceSerializer,
    FavoriteSerializer,
    PurchaseSerializer,
    ExternalProductSerializer,
    StoreProductSerializer,
    StoreProductCreateSerializer,
    ProductCreateSerializer
)
from django.db.models import Q
from users.permissions import IsAdminUser, IsRegularUser
from rest_framework.decorators import action
from transactions.services.purchase_service import PurchaseService

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        return SectionSerializer

    def get_queryset(self):
        return Section.objects.select_related('father_section').prefetch_related('subsections', 'products')

    @action(detail=False, methods=['get'])
    def main_sections(self, request):
        """Get only main sections (without father sections)"""
        main_sections = Section.objects.filter(father_section__isnull=True)
        serializer = self.get_serializer(main_sections, many=True)
        return Response(serializer.data)

class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductSerializer

    def get_queryset(self):
        return Product.objects.select_related(
            'section', 'api_config'
        ).prefetch_related(
            'requirements'
        ).filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['get', 'post', 'delete'])
    def requirements(self, request, pk=None):
        """Manage product requirements"""
        product = self.get_object()
        
        if request.method == 'GET':
            requirements = product.requirements.all()
            serializer = ProductRequirementSerializer(requirements, many=True)
            return Response(serializer.data)
            
        elif request.method == 'POST':
            serializer = ProductRequirementSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(product=product)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        elif request.method == 'DELETE':
            requirement_id = request.data.get('requirement_id')
            try:
                requirement = product.requirements.get(id=requirement_id)
                requirement.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except ProductRequirement.DoesNotExist:
                return Response(
                    {"error": "Requirement not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )

    @action(detail=False, methods=['post'])
    def bulk_toggle(self, request):
        """Bulk enable/disable products"""
        product_ids = request.data.get('product_ids', [])
        is_active = request.data.get('is_active', True)
        
        if not product_ids:
            return Response({"error": "No product IDs provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        updated_count = Product.objects.filter(id__in=product_ids).update(is_active=is_active)
        return Response({
            "message": f"Updated {updated_count} products", 
            "is_active": is_active,
            "updated_count": updated_count
        })

class UserSectionListView(viewsets.ReadOnlyModelViewSet):
    """User view for browsing sections and products"""
    permission_classes = [IsRegularUser]
    serializer_class = SectionSerializer
    
    def get_queryset(self):
        # Return only main sections for users
        return Section.objects.filter(
            father_section__isnull=True,
            products__is_active=True
        ).distinct().prefetch_related('subsections')

class UserProductListView(viewsets.ReadOnlyModelViewSet):
    """User view for browsing products"""
    permission_classes = [IsRegularUser]
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        section_id = self.request.query_params.get('section_id')
        search = self.request.query_params.get('search')
        
        queryset = Product.objects.filter(
            is_active=True
        ).select_related('section', 'api_config').prefetch_related('requirements')
        
        if section_id:
            # Get products from this section and all its subsections
            sections = Section.objects.filter(
                Q(id=section_id) | Q(father_section_id=section_id)
            )
            queryset = queryset.filter(section__in=sections)
            
        if search:
            queryset = queryset.filter(
                Q(name_en__icontains=search) | 
                Q(name_ar__icontains=search) |
                Q(description_en__icontains=search) |
                Q(description_ar__icontains=search)
            )
            
        return queryset

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products"""
        featured_products = self.get_queryset()[:10]  # First 10 as featured
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Enhanced search with filters"""
        query = request.query_params.get('q', '')
        section_id = request.query_params.get('section_id')
        product_type = request.query_params.get('product_type')
        
        queryset = self.get_queryset()
        
        if query:
            queryset = queryset.filter(
                Q(name_en__icontains=query) | 
                Q(name_ar__icontains=query) |
                Q(description_en__icontains=query) |
                Q(description_ar__icontains=query)
            )
            
        if section_id:
            sections = Section.objects.filter(
                Q(id=section_id) | Q(father_section_id=section_id)
            )
            queryset = queryset.filter(section__in=sections)
            
        if product_type:
            queryset = queryset.filter(product_type=product_type)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

class PackageViewSet(viewsets.ModelViewSet):
    """Package management for admin"""
    permission_classes = [IsAdminUser]
    serializer_class = PackageSerializer
    queryset = Package.objects.all()
    
    def get_queryset(self):
        return Package.objects.select_related('product').prefetch_related('prices')

class FavoriteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get user favorites"""
        favorites = Favorite.objects.filter(user=request.user).select_related("product")
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(data=serializer.data)

    @action(detail=False, methods=["post"])
    def add(self, request):
        product_id = request.data.get("product_id")
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        favorite, created = Favorite.objects.get_or_create(user=request.user, product=product)
        if not created:
            return Response({"detail": "Product already in favorites"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Added to favorites"}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def remove(self, request):
        product_id = request.data.get("product_id")
        try:
            favorite = Favorite.objects.get(user=request.user, product_id=product_id)
            favorite.delete()
            return Response({"detail": "Removed from favorites"}, status=status.HTTP_200_OK)
        except Favorite.DoesNotExist:
            return Response({"detail": "Product not in favorites"}, status=status.HTTP_404_NOT_FOUND)

class PurchaseViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def purchase(self, request):
        """Handle user purchase with external API integration"""
        serializer = PurchaseSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        store_product_id = serializer.validated_data['store_product_id']
        user_inputs = serializer.validated_data['user_inputs']
        
        result = PurchaseService.process_purchase(
            store_product_id=store_product_id,
            user=request.user,
            user_inputs=user_inputs
        )
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

class ExternalProductViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = ExternalProductSerializer
    
    def get_queryset(self):
        api_id = self.request.query_params.get('api_id')
        queryset = ExternalProduct.objects.filter(is_active=True)
        
        if api_id:
            queryset = queryset.filter(api_config_id=api_id)
        
        return queryset.select_related('api_config')

class StoreProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = StoreProduct.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update']:
            return StoreProductCreateSerializer
        return StoreProductSerializer
    
    def get_queryset(self):
        return StoreProduct.objects.select_related('section', 'external_product', 'external_product__api_config')
    
    @action(detail=False, methods=['get'])
    def by_section(self, request):
        """Get store products by section"""
        section_id = request.query_params.get('section_id')
        if not section_id:
            return Response({"error": "section_id parameter required"}, status=400)
        
        products = StoreProduct.objects.filter(section_id=section_id, is_active=True)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)