from rest_framework.routers import DefaultRouter
from .views import PaymentMethodViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r"payment-methods", PaymentMethodViewSet, basename="paymentmethod")

urlpatterns = [
    path("", include(router.urls)),
]
