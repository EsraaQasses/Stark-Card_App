import random
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (
    UserProfileSerializer,
    UserSerializer,
    RegisterSerializer,
    VerifyOTPSerializer,
    UserLoginSerializer,
    AdminLoginSerializer
)
from .models import OTPCode, User
from .permissions import IsAdminUser
from django.core.mail import send_mail

# -------------------- تسجيل المستخدم --------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  # السماح لأي شخص بالتسجيل

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # تعيين الدور للمستخدم الجديد كـ "user" بشكل افتراضي
        if user.role != "admin":
            user.role = "user"
            user.save()

        # في حال كان مرتبط بوكيل، يتم تمرير اسم الوكيل في الاستجابة
        connected_agent_name = user.agent.full_name if user.agent else None

        return Response({
            "message": "User registered successfully. Please verify OTP sent to your provider.",
            "user": UserSerializer(user).data,
            "connected_agent": connected_agent_name
        }, status=status.HTTP_201_CREATED)


# -------------------- التحقق من OTP --------------------
class VerifyOTPView(generics.GenericAPIView):
    serializer_class = VerifyOTPSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        user.is_active = True  # تفعيل الحساب بعد التحقق
        user.save()

        return Response({
            "message": "OTP verified successfully. Account activated.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)

# -------------------- تسجيل الدخول للمستخدم --------------------
class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]  # بدون تسجيل دخول

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # التحقق من الاسم وكلمة المرور
        user = authenticate(
            username=serializer.validated_data["name"],
            password=serializer.validated_data["password"]
        )

        if not user:
             return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # منع الأدمن من تسجيل الدخول من هذا المسار
        if user.role == "admin":
            return Response({"error": "Admins must login from admin portal"}, status=status.HTTP_403_FORBIDDEN)

        # التأكد من أن الحساب مفعل عبر OTP
        if not user.identities.filter(is_verified=True).exists():
            return Response({"error": "Account not verified"}, status=status.HTTP_403_FORBIDDEN)

        # إنشاء توكن JWT
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "name": user.name,
                "role": user.role
            }
        }, status=status.HTTP_200_OK)


# -------------------- تسجيل دخول الأدمن --------------------
class AdminLoginView(generics.GenericAPIView):
    serializer_class = AdminLoginSerializer
    permission_classes = [AllowAny]  # بدون تسجيل دخول

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "name": user.name,
                "role": user.role
            }
        }, status=status.HTTP_200_OK)


# -------------------- تسجيل الخروج --------------------
class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data.get("refresh")
        access_token = request.data.get("access")

        try:
            # أولوية تعطيل الـ refresh token
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"message": "Logged out (refresh token blacklisted)"}, status=status.HTTP_200_OK)

            # لو ما في refresh، نحاول تعطيل access token
            elif access_token:
                token = AccessToken(access_token)
                token.blacklist()
                return Response({"message": "Logged out (access token blacklisted)"}, status=status.HTTP_200_OK)

            # ما في أي توكن، نرجع نجاح رمزي
            else:
                return Response({"message": "No token provided, but logged out (client side)"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "Invalid or expired token", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# -------------------- حظر المستخدم --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ban_user(request, user_id):
    # السماح فقط للأدمن بالحظر
    if not IsAdminUser(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, id=user_id)

    # لا يمكن حظر نفسك
    if user == request.user:
        return Response({'error': "You can't ban yourself."}, status=status.HTTP_400_BAD_REQUEST)

    if user.is_banned:
        return Response({'status': f'{user.name} is already banned.'}, status=status.HTTP_400_BAD_REQUEST)

    user.is_banned = True
    user.save()
    return Response({'status': f'{user.name} has been banned.'}, status=status.HTTP_200_OK)


# -------------------- فك الحظر --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unban_user(request, user_id):
    if not IsAdminUser(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, id=user_id)

    if not user.is_banned:
        return Response({'status': f'{user.name} is not banned.'}, status=status.HTTP_400_BAD_REQUEST)

    user.is_banned = False
    user.save()
    return Response({'status': f'{user.name} has been unbanned.'}, status=status.HTTP_200_OK)


# -------------------- عرض قائمة المحظورين --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    if not IsAdminUser(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    banned_users = User.objects.filter(is_banned=True)
    serializer = UserSerializer(banned_users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------- ترقية مستخدم إلى أدمن فرعي --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def promote_to_sub_admin(request, user_id):
 
    if not IsAdminUser(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, id=user_id)

    if user.role == "admin":
        return Response({'message': f'{user.name} is already an admin.'}, status=status.HTTP_400_BAD_REQUEST)

    user.role = "admin"
    #  لاحقاً: يمكن إضافة صلاحيات مخصصة له
    # user.admin_permissions = {...}
    user.save()

    return Response({
        'message': f'{user.name} has been promoted to sub-admin.',
    }, status=status.HTTP_200_OK)


# -------------------- إعادة إرسال OTP --------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def resend_otp(request):
    name = request.data.get("name")
    if not name:
        return Response({"error": "Name is required"}, status=400)

    # جلب المستخدم حسب الاسم
    try:
        user = User.objects.get(name=name)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    # البحث عن آخر OTP غير مستخدم
    otp = OTPCode.objects.filter(user=user, is_used=False).order_by("-created_at").first()

    # إذا كان OTP القديم لا يزال صالحاً
    if otp and not otp.is_expired():
        return Response({"message": "Current OTP is still valid"}, status=200)

    # إنشاء OTP جديد
    otp_code = str(random.randint(100000, 999999))
    OTPCode.objects.create(user=user, code=otp_code)

    # إرسال OTP بالبريد أو طباعته مؤقتاً في حالة SMS
    identity = user.identities.first()
    if identity.provider in ["email", "google"]:
        send_mail(
            subject="Your OTP Code",
            message=f"Your verification code is {otp_code}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[identity.identifier],
            fail_silently=False
        )
    else:
        # ⚠️ لاحقاً استبدل هذه بـ SMS حقيقية
        print(f"OTP for {identity.identifier}: {otp_code}")

    return Response({"message": "OTP resent successfully"}, status=200)


# -------------------- بروفايل المستخدم --------------------
class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user