from rest_framework import serializers
from .models import Notification, Ad

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "content", "icon", "created_at", "is_read"]
        read_only_fields = ["id", "created_at"]


class AdSerializer(serializers.ModelSerializer):
    section_name = serializers.ReadOnlyField(source='section.name')
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = Ad
        fields = [
            'id', 'section', 'section_name', 'product', 'product_name',
            'text', 'background_color', 'font_size', 'text_color', 'image', 'link', 'created_at'
        ]
