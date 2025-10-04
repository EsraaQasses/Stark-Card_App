from django.urls import path
from .views import RegisterView, UserProfileView, VerifyOTPView, LogoutView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", UserProfileView.as_view(), name="user-profile"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("ban/<int:user_id>/", views.ban_user, name="ban_user"),
    path("unban/<int:user_id>/", views.unban_user, name="unban_user"),
    path("all/", views.list_users, name="banned_list_users"),
]
