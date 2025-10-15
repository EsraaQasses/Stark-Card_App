from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import AdListView, NotificationViewSet, AdViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'ads', AdViewSet, basename='ads')

urlpatterns = [
    path('all/', AdListView.as_view(), name='ad_list_all'),
    path('', include(router.urls)),  
]
