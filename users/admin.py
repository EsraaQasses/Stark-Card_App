from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {"fields": ("name", "email", "phone", "role", "agent", "password")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {"fields": ("name", "email", "phone", "role", "agent", "password1", "password2")}),
    )
    list_display = ("id", "name", "email", "phone", "role", "agent", "is_active", "is_banned")
    search_fields = ("name", "email", "phone")
    list_filter = ("role", "is_banned")
    ordering = ("id",)
