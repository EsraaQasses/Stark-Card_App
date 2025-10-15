from django.db import models
from django.conf import settings
from store.models import Section, Product

User = settings.AUTH_USER_MODEL

#--------------الإشعارات---------------
class Notification(models.Model):
    PRIORITY_CHOICES = [
        ("low", "منخفضة"),
        ("normal", "عادية"),
        ("high", "مرتفعة"),
    ]

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)                     # عنوان الإشعار
    message = models.TextField()                                 # المحتوى
    icon = models.CharField(max_length=100, blank=True, null=True)   
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"[{self.recipient}] {self.title}"


#--------------الإعلانت---------------
TEXT_COLOR_CHOICES = (
    ('white', 'أبيض'),
    ('black', 'أسود'),
)

class Ad(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='ads')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ads')
    text = models.TextField()  # نص الإعلان
    background_color = models.CharField(max_length=7, default="#FFFFFF")  # الخلفية، يسمح برمز HEX
    font_size = models.PositiveIntegerField(default=14)  # حجم الخط
    text_color = models.CharField(max_length=5, choices=TEXT_COLOR_CHOICES, default='black')
    image = models.ImageField(upload_to='ads_images/', blank=True, null=True)  # صورة الإعلان
    link = models.URLField(blank=True, null=True)  # رابط الانتقال
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.section} - {self.product}"
    

#--------------Last action---------------
class LastAction(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_actions')
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='target_actions', null=True, blank=True)
    action_type = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.admin} - {self.action_type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"