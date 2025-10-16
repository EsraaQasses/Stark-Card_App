from django.utils.deprecation import MiddlewareMixin

from store.models import User
from .models import LastAction, SystemLog

class SystemLogMiddleware(MiddlewareMixin):
    def process_view(self, request, view_func, view_args, view_kwargs):
        # نسجل فقط العمليات المهمة (POST, PUT, DELETE) أو كل العمليات إذا بدك
        if request.method not in ['POST', 'PUT', 'DELETE']:
            return None

        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return None  # مستخدم غير مسجل الدخول ما ينحسب

        if getattr(user, 'role', None) == 'admin':
            return None  # نتجاوز الأدمن، لأنه عنده جدول خاص

        # نوع العملية بناءً على الـHTTP method
        operation_type = {
            'POST': SystemLog.OTHER,
            'PUT': SystemLog.UPDATE,
            'DELETE': SystemLog.DELETE
        }.get(request.method, SystemLog.OTHER)

        # اسم العملية (مثلاً POST /api/payments/)
        operation_name = f"{request.method} {request.path}"

        # Device info
        device_info = request.META.get('HTTP_USER_AGENT', '')

        # IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

        # وصف العملية: ممكن نخزن البيانات المرسلة بدون الحساسيات
        description = str(request.data) if hasattr(request, 'data') else ''

        # إنشاء اللوج
        SystemLog.objects.create(
            user=user,
            operation_type=operation_type,
            operation_name=operation_name,
            url=request.build_absolute_uri(),
            description=description[:500],  # قص الوصف لو طويل
            device_info=device_info,
            ip_address=ip
        )
        return None


#--------------------عمليات الادمن--------------------
# system/middleware.py
from django.utils.deprecation import MiddlewareMixin
from system.models import LastAction
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminActionMiddleware(MiddlewareMixin):
    def process_view(self, request, view_func, view_args, view_kwargs):
        user = getattr(request, 'user', None)

        # شرط يكون أدمن ومسجل دخول
        if not user or not user.is_authenticated or getattr(user, "role", None) != "admin":
            return None

        # تسجيل فقط العمليات التي تغير بيانات
        if request.method not in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return None

        # حاول نجيب target_user لو موجود في البيانات
        target_user_id = request.data.get('user_id') or request.data.get('agent_id')
        target_user = None
        if target_user_id:
            try:
                target_user = User.objects.get(id=target_user_id)
            except User.DoesNotExist:
                target_user = None

        # نوع العملية (مثال: POST /api/system/ads/)
        action_type = f"{request.method} {request.path}"

        # وصف العملية (البيانات المرسلة)
        description = str(request.data)[:500] if hasattr(request, 'data') else ""

        # حفظ العملية
        LastAction.objects.create(
            admin=user,
            target_user=target_user,
            action_type=action_type,
            description=description
        )

        return None
