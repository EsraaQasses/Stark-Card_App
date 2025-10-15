from rest_framework import serializers
from wallets.models import Wallet
from .models import User, UserIdentity, OTPCode
import random
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings


# -------------------- Admin Login --------------------
class AdminLoginSerializer(serializers.Serializer):
    name = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user = User.objects.get(name=data["name"])
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

        if not user.check_password(data["password"]):
            raise serializers.ValidationError("Invalid credentials")

        if user.role != "admin":
            raise serializers.ValidationError("Not an admin user")

        if not user.is_active:
            raise serializers.ValidationError("Account is inactive")

        data["user"] = user
        return data


# -------------------- User Serializer --------------------
class UserSerializer(serializers.ModelSerializer):
    is_verified = serializers.SerializerMethodField()
    connected_agent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "full_name", "name", "email", "phone", "role",
            "country", "optional_phone", "agent", "is_verified",
            "is_banned", "agent_code", "connected_agent"
        ]
        read_only_fields = ["id", "is_verified", "agent_code", "connected_agent"]

    def get_is_verified(self, obj):
        return obj.identities.filter(is_verified=True).exists()

    def get_connected_agent(self, obj):
        if obj.agent:
            return {
                "id": obj.agent.id,
                "full_name": obj.agent.full_name,
                "agent_code": obj.agent.agent_code
            }
        return None

    def get_first_name(self, obj):
        return obj.full_name.split(' ')[0] if obj.full_name else ''

    def get_last_name(self, obj):
        parts = obj.full_name.split(' ')
        return ' '.join(parts[1:]) if len(parts) > 1 else ''


# -------------------- Register Serializer --------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    provider = serializers.ChoiceField(choices=["email", "phone", "google"])
    agent_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "full_name", "name", "email", "phone", "password",
            "country", "optional_phone", "role", "provider", "agent_code"
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        provider = validated_data.pop("provider")
        agent_code = validated_data.pop("agent_code", None)

        user = User(**validated_data)
        user.set_password(password)

        # ربط المستخدم بوكيل إذا تم إدخال الكود
        if agent_code:
            try:
                agent = User.objects.get(agent_code=agent_code, role="agent")
                user.agent = agent
            except User.DoesNotExist:
                raise serializers.ValidationError({"agent_code": "Invalid agent code"})

        user.save()

        identifier = user.email if provider in ["email", "google"] else user.phone

        UserIdentity.objects.create(
            user=user,
            provider=provider,
            identifier=identifier,
            is_verified=False
        )

        # توليد OTP
        otp_code = str(random.randint(100000, 999999))
        OTPCode.objects.create(user=user, code=otp_code)

        # إرسال OTP على الإيميل الرسمي أو طباعته للهواتف
        if provider in ["email", "google"]:
            send_mail(
                subject="Your OTP Code",
                message=f"Your verification code is {otp_code}",
                from_email=settings.DEFAULT_FROM_EMAIL,  # البريد الرسمي للتطبيق
                recipient_list=[user.email],
                fail_silently=False
            )
        else:
            # لاحقاً يمكن إضافة خدمة SMS حقيقية
            print(f"OTP for {user.phone}: {otp_code}")

        return user


class UserLoginSerializer(serializers.Serializer):
    name = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user = User.objects.get(name=data["name"])
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

        if not user.check_password(data["password"]):
            raise serializers.ValidationError("Invalid credentials")

        if user.role == "admin":
            raise serializers.ValidationError("Admins must login from admin portal")

        if not user.identities.filter(is_verified=True).exists():
            raise serializers.ValidationError("Account not verified")

        if user.is_banned:
            raise serializers.ValidationError("Account is banned")

        data["user"] = user
        return data


class VerifyOTPSerializer(serializers.Serializer):
    name = serializers.CharField()
    otp_code = serializers.CharField(max_length=6)

    def validate(self, data):
        try:
            user = User.objects.get(name=data["name"])
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

        otp = OTPCode.objects.filter(user=user, code=data["otp_code"], is_used=False).first()

        if not otp:
            raise serializers.ValidationError("Invalid OTP")

        if timezone.now() > otp.created_at + timedelta(minutes=5):
            raise serializers.ValidationError("OTP expired")

        identity = user.identities.first()
        if identity:
            identity.is_verified = True
            identity.save()

        otp.is_used = True
        otp.save()

        data["user"] = user
        return data


# -------------------- Agent Serializer --------------------
class AgentUserSerializer(serializers.ModelSerializer):
    users_count = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "country",
            "users_count",
            "status",
            "balance",
        ]

    def get_users_count(self, obj):
        # عدد العملاء التابعين لهذا المستخدم إذا كان وكيل
        return obj.subordinates.count() if hasattr(obj, "subordinates") else 0

    def get_balance(self, obj):
        # نجلب رصيد المستخدم من محفظته (USD و SYP)
        wallets = Wallet.objects.filter(user=obj)
        balances = {}
        for w in wallets:
            balances[w.currency.upper()] = float(w.balance)
        # إذا ما عنده محفظة نرجع صفر
        if not balances:
            balances = {"USD": 0.0, "SYP": 0.0}
        return balances

    def get_status(self, obj):
        return "Banned" if getattr(obj, "is_banned", False) else "Active"


#----بيانات المستخدمين عند العرض على الوكيل----
class SubordinateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "name",
            "email",
            "phone",
            "role",
            "country",
            "optional_phone",
            "is_banned"
        ]
        read_only_fields = fields
# -------------------- User Profile Serializer --------------------
class UserProfileSerializer(serializers.ModelSerializer):
    connected_agent = serializers.SerializerMethodField()
    agent_users = serializers.SerializerMethodField()
    balances = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "full_name", "first_name", "last_name", "name", "email", "phone", "role",
            "country", "optional_phone", "is_banned", "agent_code",
            "connected_agent", "agent_users", "balances"
        ]

    def get_first_name(self, obj):
        return obj.full_name.split(' ')[0] if obj.full_name else ''

    def get_last_name(self, obj):
        parts = obj.full_name.split(' ')
        return ' '.join(parts[1:]) if len(parts) > 1 else ''

    def get_connected_agent(self, obj):
        if obj.agent:
            return {
                "id": obj.agent.id,
                "full_name": obj.agent.full_name,
                "agent_code": obj.agent.agent_code
            }
        return None

    def get_agent_users(self, obj):
        if obj.role == "agent":
            return [
                {
                    "id": u.id,
                    "full_name": u.full_name,
                    "first_name": u.full_name.split(' ')[0] if u.full_name else '',
                    "last_name": ' '.join(u.full_name.split(' ')[1:]) if len(u.full_name.split(' ')) > 1 else '',
                    "name": u.name,
                    "email": u.email,
                    "phone": u.phone,
                } for u in obj.subordinates.all()
            ]
        return []

    def get_balances(self, obj):
        wallets = Wallet.objects.filter(user=obj)
        return {wallet.currency: float(wallet.balance) for wallet in wallets} if wallets else {}