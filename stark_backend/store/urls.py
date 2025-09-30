from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SectionViewSet, ProductViewSet, PackageViewSet, PackagePriceViewSet,
    PaymentMethodViewSet, RedeemCodeViewSet
)

router = DefaultRouter()
router.register(r"sections", SectionViewSet, basename="section")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"packages", PackageViewSet, basename="package")
router.register(r"package-prices", PackagePriceViewSet, basename="packageprice")
router.register(r"payment-methods", PaymentMethodViewSet, basename="paymentmethod")
router.register(r"redeem-codes", RedeemCodeViewSet, basename="redeemcode")

urlpatterns = [
    path("", include(router.urls)),
]
