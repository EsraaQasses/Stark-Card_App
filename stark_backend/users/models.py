from datetime import timedelta, timezone
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.core.validators import RegexValidator
from rest_framework.permissions import BasePermission

from wallets.models import Wallet

class UserManager(BaseUserManager):
    def create_user(self, name, password=None, email=None, phone=None, role="user", **extra_fields):
        if not name:
            raise ValueError("Users must have a name")

        email = self.normalize_email(email) if email else None
        user = self.model(
            name=name,
            email=email,
            phone=phone,
            role=role,
            **extra_fields
        )
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, name, password=None, email=None, phone=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(name, password, email, phone, role="admin", **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("agent", "Agent"),
        ("user", "User"),
    )
    full_name = models.CharField(max_length=255)
    name = models.CharField(max_length=255, unique=True) #Username
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")
    country = models.CharField(max_length=100, null=True, blank=True)
    optional_phone = models.CharField(max_length=20, null=True, blank=True)
    is_banned = models.BooleanField(default=False) 

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    agent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users_under_agent",
        limit_choices_to={"role": "agent"}
    )

    objects = UserManager()
    USERNAME_FIELD = "name"
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.name} ({self.role})"


class UserIdentity(models.Model):
    PROVIDER_CHOICES = [
        ("email", "Email"),
        ("phone", "Phone"),
        ("google", "Google"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="identities")
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    identifier = models.CharField(max_length=255, null=True, blank=True)        # email أو phone
    provider_user_id = models.CharField(max_length=255, null=True, blank=True)  # sub من Google
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
     constraints = [
        models.UniqueConstraint(
            fields=["provider", "identifier"],
            name="unique_provider_identifier"
        ),
        models.UniqueConstraint(
            fields=["provider_user_id"],
            condition=models.Q(provider="google"),
            name="unique_google_userid"
        ),
    ]


    def __str__(self):
        return f"{self.user.name} via {self.provider}"


class OTPCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otps")
    code = models.CharField(max_length=6, validators=[RegexValidator(r'^\d{6}$')])  
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"OTP for {self.user.name}: {self.code}"


    def is_expired(self):
      return timezone.now() > self.created_at + timedelta(minutes=5)

