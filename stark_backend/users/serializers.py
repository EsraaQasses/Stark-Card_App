from rest_framework import serializers
from .models import User, UserIdentity, OTPCode
import random
from django.utils import timezone
from datetime import timedelta

class UserSerializer(serializers.ModelSerializer):
    is_verified = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ["id","full_name", "name", "email", "phone", "role",
                  "country", "optional_phone", "agent", "is_verified"]
        read_only_fields = ["id", "is_verified"]

    def get_is_verified(self, obj):
        return obj.identities.filter(is_verified=True).exists()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    provider = serializers.ChoiceField(choices=["email", "phone", "google"])

    class Meta:
        model = User
        fields = ["full_name", "name", "email", "phone", "password",
                  "country", "optional_phone", "role", "agent", "provider"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        provider = validated_data.pop("provider")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        identifier = user.email if provider in ["email", "google"] else user.phone

        UserIdentity.objects.create(
            user=user,
            provider=provider,
            identifier=identifier,
            is_verified=False
        )

        # إنشاء OTP مرة واحدة عند التسجيل
        otp_code = str(random.randint(100000, 999999))
        OTPCode.objects.create(user=user, code=otp_code)

        #TODO: Send OTP via Email/SMS
        print(f"OTP for {user.name}: {otp_code}")  # للتجريب فقط

        return user


class LoginSerializer(serializers.Serializer):
    name = serializers.CharField()
    password = serializers.CharField(write_only=True)


class VerifyOTPSerializer(serializers.Serializer):
    name = serializers.CharField()
    otp_code = serializers.CharField(max_length=6)

    def validate(self, data):
        try:
            user = User.objects.get(name=data["name"])
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

        otp = OTPCode.objects.filter(
            user=user, code=data["otp_code"], is_used=False
        ).first()

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
