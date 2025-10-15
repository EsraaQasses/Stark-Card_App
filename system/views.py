from rest_framework import viewsets, permissions, generics
from .models import Ad, Notification
from .serializers import AdSerializer, NotificationSerializer
from users.permissions import IsAdminUser

#  الإشعارات
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.is_read:
            instance.delete()

#  تحكم بالإعلانات (للأدمن فقط)
class AdViewSet(viewsets.ModelViewSet):
    queryset = Ad.objects.all()
    serializer_class = AdSerializer
    permission_classes = [permissions.IsAdminUser]

#  عرض الإعلانات للمستخدمين
class AdListView(generics.ListAPIView):
    queryset = Ad.objects.all().order_by('-created_at')
    serializer_class = AdSerializer
    permission_classes = [permissions.IsAuthenticated]
