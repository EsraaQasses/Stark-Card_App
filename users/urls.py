from django.urls import path
from .views import AdminLoginView, RegisterView, UserLoginView, UserProfileView, VerifyOTPView, LogoutView, resend_otp
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path('login/admin/', AdminLoginView.as_view(), name='admin-login'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", UserProfileView.as_view(), name="user-profile"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("resend-otp/", resend_otp, name="resend-otp"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("ban/<int:user_id>/", views.ban_user, name="ban_user"),
    path("unban/<int:user_id>/", views.unban_user, name="unban_user"),
    path("banned_users/", views.list_users, name="banned_list_users"),
    path("promote/<int:user_id>/", views.promote_to_sub_admin, name="promote_to_sub_admin"),



]
