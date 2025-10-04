from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SectionViewSet, ProductViewSet, PackageViewSet, PackagePriceViewSet, FavoriteViewSet,
    SectionListView, ProductListBySectionView, PackagePriceListByProductView  # views المستخدم
)

# Router للأدمن
router = DefaultRouter()
router.register(r"sections", SectionViewSet, basename="section")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"packages", PackageViewSet, basename="package")
router.register(r"package-prices", PackagePriceViewSet, basename="packageprice")

urlpatterns = [
    # مسارات الأدمن (CRUD كامل)
    path("", include(router.urls)),

    # مسارات المستخدم العادي
    path("user/sections/", SectionListView.as_view(), name="user_sections"),
    path("user/sections/<int:section_id>/products/", ProductListBySectionView.as_view(), name="user_products_by_section"),
    path("user/products/<int:product_id>/prices/", PackagePriceListByProductView.as_view(), name="user_package_prices_by_product"),
    path("user/favorites/", FavoriteViewSet.as_view({"get": "list"}), name="user_favorites"),
    path("user/favorites/add/", FavoriteViewSet.as_view({"post": "add"}), name="user_add_favorite"),
    path("user/favorites/remove/", FavoriteViewSet.as_view({"post": "remove"}), name="user_remove_favorite"),

]
