import random
import secrets
from datetime import timedelta
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from .serializers import (
    UserProfileSerializer, UserSerializer, RegisterSerializer,
    VerifyOTPSerializer, UserLoginSerializer, AdminLoginSerializer,
    ChangePasswordSerializer, ResetPasswordSerializer, ForgotPasswordSerializer,
    AdminStep1LoginSerializer, AdminStep2LoginSerializer, AdminStep3LoginSerializer,
    SetupSecondPasswordSerializer
)
from .models import OTPCode, User, PasswordResetToken, AdminSecurity, AdminLoginSession
from .permissions import IsAdminUser


# -------------------- Make User Admin --------------------
@api_view(['POST'])
@permission_classes([IsAdminUser])
def make_user_admin(request, user_id):
    """Make a regular user or agent an admin"""
    try:
        user = get_object_or_404(User, id=user_id)
        
        # Check if user is already admin
        if user.role == "admin":
            # Get admin security status
            admin_security, created = AdminSecurity.objects.get_or_create(user=user)
            return Response({
                'message': f'{user.name} is already an admin.',
                'user': UserSerializer(user).data,
                'requires_second_password_setup': not admin_security.is_second_password_set,
                'already_admin': True
            }, status=status.HTTP_200_OK)
        
        # Prevent making banned users admin
        if user.is_banned:
            return Response({
                'error': 'Cannot promote banned user to admin'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Store original role for audit (optional)
        original_role = user.role
        
        # Change role to admin
        user.role = "admin"
        user.is_staff = True
        user.is_superuser = True
        user.save()
        
        # Create admin security record
        admin_security, created = AdminSecurity.objects.get_or_create(user=user)
        
        # Log the action
        print(f"User {user.name} (ID: {user.id}) promoted from {original_role} to admin by {request.user.name}")
        
        return Response({
            'message': f'{user.name} has been promoted to admin.',
            'user': UserSerializer(user).data,
            'requires_second_password_setup': not admin_security.is_second_password_set,
            'already_admin': False,
            'original_role': original_role
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error making user admin: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': 'Failed to make user admin',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)      
        
# -------------------- Set Second Password for Admin --------------------
class SetAdminSecondPasswordView(generics.GenericAPIView):
    serializer_class = SetupSecondPasswordSerializer
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        """Set second password for another admin user"""
        try:
            target_user = get_object_or_404(User, id=user_id)
            
            # Check if target user is admin
            if target_user.role != "admin":
                return Response({
                    "error": "Target user is not an admin"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if current user has permission (super admin can set for others)
            if not request.user.is_superuser and request.user.id != target_user.id:
                return Response({
                    "error": "You can only set your own second password"
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            second_password = serializer.validated_data['second_password']
            
            # Set up second password
            admin_security = target_user.setup_second_password(second_password)
            
            return Response({
                "message": "Second password set up successfully",
                "user": {
                    "id": target_user.id,
                    "name": target_user.name,
                    "full_name": target_user.full_name
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": "Failed to set second password",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


# -------------------- List Admin Users --------------------
@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_admin_users(request):
    """Get all admin users"""
    try:
        admin_users = User.objects.filter(role='admin').order_by('-date_joined')
        
        admin_data = []
        for user in admin_users:
            admin_security = getattr(user, 'admin_security', None)
            admin_data.append({
                'id': user.id,
                'name': user.name,
                'full_name': user.full_name,
                'email': user.email,
                'phone': user.phone,
                'is_active': user.is_active,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined,
                'last_login': user.last_login,
                'has_second_password': admin_security.is_second_password_set if admin_security else False,
                'second_password_set_at': admin_security.updated_at if admin_security and admin_security.is_second_password_set else None
            })
        
        return Response(admin_data)
        
    except Exception as e:
        return Response({
            'error': 'Failed to fetch admin users',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -------------------- Admin User Details --------------------
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_detail(request, user_id):
    """Get detailed information about an admin user"""
    try:
        user = get_object_or_404(User, id=user_id, role='admin')
        admin_security = getattr(user, 'admin_security', None)
        
        user_data = {
            'id': user.id,
            'name': user.name,
            'full_name': user.full_name,
            'email': user.email,
            'phone': user.phone,
            'is_active': user.is_active,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
            'security': {
                'has_second_password': admin_security.is_second_password_set if admin_security else False,
                'second_password_set_at': admin_security.updated_at if admin_security else None,
                'security_created_at': admin_security.created_at if admin_security else None
            },
            'permissions': {
                'groups': list(user.groups.values_list('name', flat=True)),
                'user_permissions': list(user.user_permissions.values_list('codename', flat=True))
            }
        }
        
        return Response(user_data)
        
    except Exception as e:
        return Response({
            'error': 'Failed to fetch admin user details',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -------------------- Remove Admin Role --------------------
@api_view(['POST'])
@permission_classes([IsAdminUser])
def remove_admin_role(request, user_id):
    """Remove admin role from user (demote to regular user)"""
    try:
        # Prevent self-demotion
        if request.user.id == int(user_id):
            return Response({
                'error': 'You cannot remove your own admin role'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(User, id=user_id)
        
        if user.role != "admin":
            return Response({
                'message': f'{user.name} is not an admin.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Store original role or set to 'user'
        # You might want to store the original role before becoming admin
        user.role = "user"
        user.is_staff = False
        user.is_superuser = False
        user.save()
        
        # Keep admin security record for audit purposes
        
        return Response({
            'message': f'{user.name} has been demoted to regular user.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error removing admin role: {str(e)}")
        return Response({
            'error': 'Failed to remove admin role'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# -------------------- Admin Step 1 Login --------------------
class AdminStep1LoginView(generics.GenericAPIView):
    serializer_class = AdminStep1LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data["user"]
        admin_security = serializer.validated_data["admin_security"]

        # Create login session
        session_token = secrets.token_urlsafe(32)
        session = AdminLoginSession.objects.create(
            user=user,
            session_token=session_token,
            step_1_completed=True,
            expires_at=timezone.now() + timedelta(minutes=30)
        )

        response_data = {
            "message": "Step 1 completed successfully",
            "session_token": session_token,
            "requires_second_password": admin_security.is_second_password_set,
            "requires_otp": getattr(settings, 'ADMIN_OTP_REQUIRED', True)
        }

        # If second password is not set, mark for setup (don't skip to OTP)
        if not admin_security.is_second_password_set:
            response_data["message"] = "Please set up second password"
            response_data["requires_setup"] = True
            # Don't send OTP yet - wait for password setup
        else:
            # Send OTP immediately if password is already set
            self._send_otp(session)
            session.save()

        return Response(response_data, status=status.HTTP_200_OK)

    def _send_otp(self, session):
        """Generate and send OTP to admin email"""
        otp_code = str(random.randint(100000, 999999))
        session.otp_code = otp_code
        session.otp_created_at = timezone.now()

        # Send OTP via email
        send_mail(
            subject="Your Admin Login OTP - Stark",
            message=f"""Hello {session.user.full_name},

Your admin login verification code is: {otp_code}

This code will expire in {getattr(settings, 'ADMIN_OTP_EXPIRY_MINUTES', 10)} minutes.

If you didn't request this login, please secure your account immediately.

Best regards,
Stark Security Team""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[session.user.email],
            fail_silently=False
        )


# -------------------- Admin Step 2 Login --------------------
class AdminStep2LoginView(generics.GenericAPIView):
    serializer_class = AdminStep2LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        session = serializer.validated_data["session"]
        user = serializer.validated_data["user"]

        # Mark step 2 as completed
        session.step_2_completed = True
        
        # Send OTP for step 3
        self._send_otp(session)
        session.save()

        print(f"✅ Step 2 completed - Session: {session.session_token}, OTP: {session.otp_code}")

        return Response({
            "message": "Second password verified successfully. OTP sent to your email.",
            "session_token": session.session_token
        }, status=status.HTTP_200_OK)

    def _send_otp(self, session):
        """Generate and send OTP to admin email"""
        otp_code = str(random.randint(100000, 999999))
        session.otp_code = otp_code
        session.otp_created_at = timezone.now()

        print(f"📧 Generated OTP: {otp_code} for user: {session.user.email}")

        # Send OTP via email
        send_mail(
            subject="Your Admin Login OTP - Stark",
            message=f"""Hello {session.user.full_name},

Your admin login verification code is: {otp_code}

This code will expire in {getattr(settings, 'ADMIN_OTP_EXPIRY_MINUTES', 10)} minutes.

If you didn't request this login, please secure your account immediately.

Best regards,
Stark Security Team""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[session.user.email],
            fail_silently=False
        )


# -------------------- Admin Step 3 Login --------------------
class AdminStep3LoginView(generics.GenericAPIView):
    serializer_class = AdminStep3LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            session = serializer.validated_data["session"]
            user = serializer.validated_data["user"]

            # Mark step 3 as completed and generate tokens
            session.step_3_completed = True
            session.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Clean up session
            session.delete()

            return Response({
                "message": "Admin login successful",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "role": user.role,
                    "full_name": user.full_name
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"❌ Step 3 error: {str(e)}")
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


# -------------------- Setup Second Password --------------------
class SetupSecondPasswordView(generics.GenericAPIView):
    serializer_class = SetupSecondPasswordSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response({"error": "Only admin users can set up second password"}, 
                          status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        second_password = serializer.validated_data['second_password']
        
        try:
            request.user.setup_second_password(second_password)
            return Response({
                "message": "Second password set up successfully"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": "Failed to set up second password"
            }, status=status.HTTP_400_BAD_REQUEST)

# -------------------- First Time Setup Second Password --------------------
class FirstTimeSetupSecondPasswordView(generics.GenericAPIView):
    serializer_class = SetupSecondPasswordSerializer
    permission_classes = [AllowAny]  # Allow access without authentication

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_token = request.data.get('session_token')
        second_password = serializer.validated_data['second_password']

        try:
            # Get session and verify
            session = AdminLoginSession.objects.get(
                session_token=session_token,
                step_1_completed=True,
                step_2_completed=False  # Not completed yet for first-time setup
            )
            
            if session.is_expired():
                session.delete()
                return Response({"error": "Session expired"}, status=400)

            user = session.user
            
            # Setup second password
            admin_security = user.setup_second_password(second_password)
            
            # Mark step 2 as completed
            session.step_2_completed = True
            
            # Send OTP for step 3
            self._send_otp(session)
            session.save()

            return Response({
                "message": "Second password set up successfully",
                "requires_otp": True
            }, status=status.HTTP_200_OK)

        except AdminLoginSession.DoesNotExist:
            return Response({"error": "Invalid or expired session"}, status=400)

    def _send_otp(self, session):
        """Generate and send OTP to admin email"""
        otp_code = str(random.randint(100000, 999999))
        session.otp_code = otp_code
        session.otp_created_at = timezone.now()

        # Send OTP via email
        send_mail(
            subject="Your Admin Login OTP - Stark",
            message=f"""Hello {session.user.full_name},

Your admin login verification code is: {otp_code}

This code will expire in {getattr(settings, 'ADMIN_OTP_EXPIRY_MINUTES', 10)} minutes.

If you didn't request this login, please secure your account immediately.

Best regards,
Stark Security Team""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[session.user.email],
            fail_silently=False
        )


# -------------------- Check Second Password Setup --------------------
class CheckSecondPasswordSetupView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response({"error": "Only admin users can check second password setup"}, 
                          status=status.HTTP_403_FORBIDDEN)

        is_setup = hasattr(request.user, 'admin_security') and request.user.admin_security.is_second_password_set
        
        return Response({
            "is_second_password_set": is_setup
        }, status=status.HTTP_200_OK)


# -------------------- Debug Session --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def debug_session(request):
    """Debug endpoint to check session state"""
    session_token = request.data.get('session_token')
    
    try:
        session = AdminLoginSession.objects.get(session_token=session_token)
        return Response({
            'session_exists': True,
            'step_1_completed': session.step_1_completed,
            'step_2_completed': session.step_2_completed, 
            'step_3_completed': session.step_3_completed,
            'otp_code': session.otp_code,
            'otp_created_at': session.otp_created_at,
            'user': session.user.name,
            'is_expired': session.is_expired(),
            'current_time': timezone.now()
        })
    except AdminLoginSession.DoesNotExist:
        return Response({'session_exists': False})


# -------------------- User Registration --------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        connected_agent_name = user.agent.full_name if user.agent else None

        return Response({
            "message": "User registered successfully. Please verify OTP sent to your provider.",
            "user": UserSerializer(user).data,
            "connected_agent": connected_agent_name
        }, status=status.HTTP_201_CREATED)


# -------------------- OTP Verification --------------------
class VerifyOTPView(generics.GenericAPIView):
    serializer_class = VerifyOTPSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        return Response({
            "message": "OTP verified successfully. Account activated.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


# -------------------- User Login --------------------
class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

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


# -------------------- Admin Login (Legacy) --------------------
class AdminLoginView(generics.GenericAPIView):
    serializer_class = AdminLoginSerializer
    permission_classes = [AllowAny]

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


# -------------------- Logout --------------------
class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data.get("refresh")
        access_token = request.data.get("access")

        try:
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"message": "Logged out (refresh token blacklisted)"}, status=status.HTTP_200_OK)
            elif access_token:
                token = AccessToken(access_token)
                token.blacklist()
                return Response({"message": "Logged out (access token blacklisted)"}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "No token provided, but logged out (client side)"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Invalid or expired token", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -------------------- Ban User --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ban_user(request, user_id):
    if not request.user.role == "admin":
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, id=user_id)

    if user == request.user:
        return Response({'error': "You can't ban yourself."}, status=status.HTTP_400_BAD_REQUEST)

    if user.is_banned:
        return Response({'status': f'{user.name} is already banned.'}, status=status.HTTP_400_BAD_REQUEST)

    user.is_banned = True
    user.save()
    return Response({'status': f'{user.name} has been banned.'}, status=status.HTTP_200_OK)


# -------------------- Unban User --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unban_user(request, user_id):
    if not request.user.role == "admin":
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, id=user_id)

    if not user.is_banned:
        return Response({'status': f'{user.name} is not banned.'}, status=status.HTTP_400_BAD_REQUEST)

    user.is_banned = False
    user.save()
    return Response({'status': f'{user.name} has been unbanned.'}, status=status.HTTP_200_OK)

# -------------------- Make User Agent --------------------
@api_view(['POST'])
@permission_classes([IsAdminUser])
def make_user_agent(request, user_id):
    """Make a regular user an agent"""
    try:
        user = get_object_or_404(User, id=user_id)
        
        if user.role == "agent":
            return Response({
                'message': f'{user.name} is already an agent.',
                'agent_code': user.agent_code
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if user.role == "admin":
            return Response({
                'error': 'Cannot change admin role to agent'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Change role to agent (this will automatically generate agent_code in save method)
        user.role = "agent"
        user.save()
        
        # Ensure user has wallets
        from wallets.models import Wallet
        Wallet.objects.get_or_create(user=user, currency="USD")
        Wallet.objects.get_or_create(user=user, currency="SYP")

        return Response({
            'message': f'{user.name} has been promoted to agent.',
            'agent_code': user.agent_code,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error making user agent: {str(e)}")
        return Response({
            'error': 'Failed to make user agent'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -------------------- List All Users (for admin dashboard) --------------------
@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_list(request):
    """Get all users for admin dashboard"""
    try:
        print("Starting user_list view...")
        users = User.objects.all().order_by('-date_joined')
        print(f"Found {users.count()} users")
        
        if users.exists():
            test_user = users.first()
            print(f"Testing serialization for user: {test_user.name}")
            
            basic_data = {
                'id': test_user.id,
                'name': test_user.name,
                'full_name': test_user.full_name,
                'email': test_user.email,
            }
            print(f"Basic user data: {basic_data}")
            
            try:
                test_serializer = UserSerializer(test_user)
                print("Test serialization successful")
            except Exception as serialization_error:
                print(f"Serialization error: {serialization_error}")
                return Response({"error": "Serialization failed"}, status=500)
        
        serializer = UserSerializer(users, many=True)
        print("Full serialization completed successfully")
        return Response(serializer.data)
    except Exception as e:
        print(f"Error in user_list: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -------------------- Simple User List (for testing) --------------------
@api_view(['GET'])
@permission_classes([IsAdminUser])
def simple_user_list(request):
    """Simple user list without complex serialization"""
    try:
        print("Starting simple_user_list view...")
        users = User.objects.all().order_by('-date_joined').values(
            'id', 'name', 'full_name', 'email', 'phone', 'role', 
            'country', 'is_banned', 'last_login', 'is_active', 'date_joined'
        )
        users_list = list(users)
        
        for user in users_list:
            user['balances'] = {"USD": 0.0, "SYP": 0.0}
            user['is_verified'] = True
            user['connected_agent'] = None
            user['agent_code'] = None
            user['optional_phone'] = user.get('optional_phone', '')
            user['agent'] = None
        
        print(f"Returning {len(users_list)} users")
        return Response(users_list)
    except Exception as e:
        print(f"Error in simple_user_list: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -------------------- List Banned Users --------------------
@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_users(request):
    """List banned users only"""
    try:
        banned_users = User.objects.filter(is_banned=True)
        serializer = UserSerializer(banned_users, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# -------------------- User Statistics --------------------
@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_stats(request):
    """Get user statistics for dashboard"""
    try:
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        banned_users = User.objects.filter(is_banned=True).count()
        admin_users = User.objects.filter(role='admin').count()
        agent_users = User.objects.filter(role='agent').count()
        regular_users = User.objects.filter(role='user').count()
        
        week_ago = timezone.now() - timedelta(days=7)
        new_users_week = User.objects.filter(date_joined__gte=week_ago).count()
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'banned_users': banned_users,
            'admin_users': admin_users,
            'agent_users': agent_users,
            'regular_users': regular_users,
            'new_users_week': new_users_week
        })
    except Exception as e:
        return Response({
            'error': 'Database error',
            'detail': str(e)
        }, status=500)


# -------------------- Promote to Sub-Admin --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def promote_to_sub_admin(request, user_id):
    if not IsAdminUser(request.user):
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, id=user_id)

    if user.role == "admin":
        return Response({'message': f'{user.name} is already an admin.'}, status=status.HTTP_400_BAD_REQUEST)

    user.role = "admin"
    user.save()

    return Response({
        'message': f'{user.name} has been promoted to sub-admin.',
    }, status=status.HTTP_200_OK)


# -------------------- Resend OTP --------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def resend_otp(request):
    name = request.data.get("name")
    if not name:
        return Response({"error": "Name is required"}, status=400)

    try:
        user = User.objects.get(name=name)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    identity = user.identities.first()
    if identity and identity.is_verified:
        return Response({"error": "Account is already verified"}, status=400)

    OTPCode.objects.filter(user=user).delete()

    otp_code = str(random.randint(100000, 999999))
    OTPCode.objects.create(user=user, code=otp_code)

    if identity and identity.provider in ["email", "google"]:
        send_mail(
            subject="Your OTP Code",
            message=f"Your verification code is {otp_code}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[identity.identifier],
            fail_silently=False
        )
    else:
        print(f"OTP for {identity.identifier}: {otp_code}")

    return Response({"message": "OTP resent successfully"}, status=200)


# -------------------- User Profile --------------------
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if 'avatar' in request.FILES and instance.avatar:
            instance.avatar.delete(save=False)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)


# -------------------- Change Password --------------------
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)


# -------------------- Forgot Password --------------------
class ForgotPasswordView(generics.GenericAPIView):
    serializer_class = ForgotPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        token = secrets.token_urlsafe(50)
        
        PasswordResetToken.objects.filter(user=user).delete()
        
        reset_token = PasswordResetToken.objects.create(user=user, token=token)
        
        reset_link = f"http://localhost:3000/reset-password?token={token}"
        
        send_mail(
            subject="Password Reset Request - Stark",
            message=f"""Hello {user.full_name},

You requested a password reset for your Stark account.

Click the link below to reset your password:
{reset_link}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

Best regards,
Stark Team""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False
        )
        
        return Response({
            "message": "Password reset link has been sent to your email."
        }, status=status.HTTP_200_OK)


# -------------------- Reset Password --------------------
class ResetPasswordView(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
        except PasswordResetToken.DoesNotExist:
            return Response({"error": "Invalid or expired reset token."}, status=400)
        
        if reset_token.is_expired():
            return Response({"error": "Reset token has expired."}, status=400)
        
        user = reset_token.user
        user.set_password(new_password)
        user.save()
        
        reset_token.is_used = True
        reset_token.save()
        
        PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
        
        return Response({
            "message": "Password has been reset successfully. You can now login with your new password."
        }, status=status.HTTP_200_OK)


# -------------------- Email Verification --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    email = request.data.get('email')
    verification_code = request.data.get('code')
    
    if not email or not verification_code:
        return Response({"error": "Email and verification code are required."}, status=400)
    
    try:
        user = User.objects.get(email=email)
        
        verify_data = {"name": user.name, "otp_code": verification_code}
        verify_serializer = VerifyOTPSerializer(data=verify_data)
        
        if verify_serializer.is_valid():
            verified_user = verify_serializer.validated_data["user"]
            return Response({
                "message": "Email verified successfully. Your account is now active.",
                "user": UserSerializer(verified_user).data
            })
        else:
            return Response({"error": verify_serializer.errors}, status=400)
            
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)


# -------------------- Email Verification View (Token-based) --------------------
class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.GET.get('token')
        
        if not token:
            return Response({"error": "Verification token is required."}, status=400)
        
        return Response({"message": "Email verification would be handled here."})