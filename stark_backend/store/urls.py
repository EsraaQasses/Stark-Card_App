from django.urls import path
from .views import SectionListView, ProductListView, ProductDetailView

urlpatterns = [
    path("sections/", SectionListView.as_view(), name="sections-list"),
    path("products/", ProductListView.as_view(), name="products-list"),
    path("products/<int:pk>/", ProductDetailView.as_view(), name="product-detail"),
]
