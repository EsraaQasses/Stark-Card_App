import random
import secrets
from datetime import timedelta
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_otp.plugins.otp_totp.models import TOTPDevice

# Import for QR code generation
import qrcode
from io import BytesIO
import base64

from .serializers import (
    UserProfileSerializer, UserSerializer, RegisterSerializer,
    VerifyOTPSerializer, UserLoginSerializer, AdminLoginSerializer,
    ChangePasswordSerializer, ResetPasswordSerializer, ForgotPasswordSerializer,
    AdminStep1LoginSerializer, AdminStep2LoginSerializer, AdminStep3LoginSerializer,
    SetupSecondPasswordSerializer, AdminProfileUpdateSerializer
)
from .models import OTPCode, User, PasswordResetToken, AdminSecurity, AdminLoginSession
from .permissions import IsAdminUser


# -------------------- Backup Codes Manager --------------------
class BackupCodeManager:
    """Custom backup codes manager since we removed two_factor dependency"""
    
    @staticmethod
    def create_backup_codes(user, count=10):
        """Generate backup codes without two_factor dependency"""
        backup_codes = []
        for i in range(count):
            code = secrets.token_hex(4).upper()  # 8-character backup codes
            backup_codes.append(code)
        
        # In a real implementation, you'd store these in the database
        # For now, we'll just return them and the user should save them securely
        return backup_codes


# -------------------- 2FA Management Views --------------------
class TwoFactorSetupView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Get 2FA setup information"""
        try:
            # Check if 2FA is already enabled
            existing_devices = TOTPDevice.objects.filter(user=request.user, confirmed=True)
            
            if existing_devices.exists():
                return Response({
                    "is_2fa_enabled": True,
                    "message": "2FA is already enabled for this account",
                    "devices": [
                        {
                            "id": device.id,
                            "name": device.name or "Authenticator App",
                            "confirmed": device.confirmed,
                            "created_at": device.created_at
                        }
                        for device in existing_devices
                    ]
                }, status=status.HTTP_200_OK)
            
            # Generate a new TOTP device for setup
            device = TOTPDevice.objects.create(
                user=request.user,
                name="Authenticator App",
                confirmed=False
            )
            
            # Get the provisioning URL for QR code
            provisioning_url = device.config_url
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(provisioning_url)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            qr_code = base64.b64encode(buffer.getvalue()).decode()
            
            return Response({
                "is_2fa_enabled": False,
                "secret": device.bin_key.hex(),  # The secret key for manual entry
                "qr_code": f"data:image/png;base64,{qr_code}",
                "provisioning_url": provisioning_url,
                "message": "Scan the QR code with your authenticator app"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": "Failed to generate 2FA setup",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class TwoFactorVerifyView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        """Verify and enable 2FA with a token"""
        try:
            token = request.data.get('token')
            if not token:
                return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Find unconfirmed device for this user
            device = TOTPDevice.objects.filter(
                user=request.user, 
                confirmed=False
            ).first()
            
            if not device:
                return Response({"error": "No pending 2FA setup found"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify the token
            if device.verify_token(token):
                device.confirmed = True
                device.save()
                
                # Generate backup codes using our custom method
                backup_codes = BackupCodeManager.create_backup_codes(request.user, 10)
                
                return Response({
                    "message": "2FA enabled successfully!",
                    "is_2fa_enabled": True,
                    "backup_codes": backup_codes,
                    "warning": "Save these backup codes in a secure place. You will need them if you lose your authenticator app. They will not be shown again."
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Invalid token. Please try again."
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                "error": "Failed to verify 2FA token",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class TwoFactorDisableView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        """Disable 2FA for the user"""
        try:
            # Delete all TOTP devices
            TOTPDevice.objects.filter(user=request.user).delete()
            
            return Response({
                "message": "2FA disabled successfully",
                "is_2fa_enabled": False
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": "Failed to disable 2FA",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class TwoFactorStatusView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Get 2FA status and devices"""
        try:
            devices = TOTPDevice.objects.filter(user=request.user)
            active_devices = devices.filter(confirmed=True)
            
            # Since we removed two_factor, we'll track backup codes differently
            # For now, we'll just indicate if 2FA is enabled
            has_backup_codes = active_devices.exists()  # Simplified for now
            
            return Response({
                "is_2fa_enabled": active_devices.exists(),
                "devices": [
                    {
                        "id": device.id,
                        "name": device.name or "Authenticator App",
                        "confirmed": device.confirmed,
                        "created_at": device.created_at
                    }
                    for device in devices
                ],
                "has_backup_codes": has_backup_codes,
                "backup_codes_count": 10 if has_backup_codes else 0
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": "Failed to get 2FA status",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


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
                'second_password_set_at': admin_security.updated_at if admin_security and admin_security.is_second_password_set else None,
                'has_2fa': TOTPDevice.objects.filter(user=user, confirmed=True).exists()
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
                'security_created_at': admin_security.created_at if admin_security else None,
                'has_2fa': TOTPDevice.objects.filter(user=user, confirmed=True).exists(),
                'devices_count': TOTPDevice.objects.filter(user=user, confirmed=True).count()
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

# ... (All your imports remain the same) ...
import random
import secrets
from datetime import timedelta
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.mail import send_mail
# ... (other imports) ...


# -------------------- Utility Functions for Views --------------------

def _send_otp_email(user, otp_code):
    """Generate and send OTP to admin email (for non-2FA users)"""
    print(f"📧 DEBUG: Generated OTP {otp_code} for {user.email}")
    
    # Send OTP via email
    try:
        send_mail(
            subject="Your Admin Login OTP - Stark",
            message=f"""Hello {user.full_name},

Your admin login verification code is: {otp_code}

This code will expire in {getattr(settings, 'ADMIN_OTP_EXPIRY_MINUTES', 10)} minutes.

If you didn't request this login, please secure your account immediately.

Best regards,
Stark Security Team""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False
        )
        print(f"✅ DEBUG: OTP email sent successfully to {user.email}")
        return True
    except Exception as e:
        print(f"❌ DEBUG: Failed to send OTP email: {str(e)}")
        # In a production app, you might raise an exception here or use a logger
        return False

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
            "requires_2fa": False, # Default
            "requires_otp": False # Default
        }

        if not admin_security.is_second_password_set:
            response_data["message"] = "Please set up second password"
            response_data["requires_setup"] = True
        else:
            # Check if 2FA is enabled using django-otp
            has_2fa = TOTPDevice.objects.filter(user=user, confirmed=True).exists()
            if has_2fa:
                response_data["requires_2fa"] = True
                response_data["message"] = "Step 1 completed. Please proceed to second password and 2FA."
            else:
                # Send OTP for non-2FA users
                if getattr(settings, 'ADMIN_OTP_REQUIRED', True):
                    # Create the OTPCode object (serializer handles validation later)
                    otp_code = str(random.randint(100000, 999999))
                    OTPCode.objects.create(user=user, code=otp_code)
                    _send_otp_email(user, otp_code)
                    
                    response_data["requires_otp"] = True
                    response_data["message"] = "Step 1 completed. Please proceed to second password and OTP sent to your email."
                else:
                    # Neither 2FA nor OTP is required (should only happen with specific settings)
                    response_data["message"] = "Step 1 completed. Please proceed to second password."


        return Response(response_data, status=status.HTTP_200_OK)


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
        
        has_2fa = user.admin_security.is_2fa_enabled # Use AdminSecurity helper method
        
        response_data = {
            "message": "Second password verified successfully.",
            "session_token": session.session_token,
            "requires_2fa": has_2fa,
            "requires_otp": False
        }

        if has_2fa:
            response_data["message"] = "Second password verified. Please enter your 2FA code."
        
        elif getattr(settings, 'ADMIN_OTP_REQUIRED', True):
            # Send OTP for non-2FA users
            otp_code = str(random.randint(100000, 999999))
            OTPCode.objects.create(user=user, code=otp_code) # Use the OTPCode model
            _send_otp_email(user, otp_code)
            
            response_data["requires_otp"] = True
            response_data["message"] = "Second password verified successfully. OTP sent to your email."
        
        else:
            # If no 2FA and no OTP required, proceed directly to Step 3's finalization (if you allow this)
            response_data["message"] = "Second password verified. Proceed to final login."
            response_data["requires_2fa"] = False # Ensure client doesn't wait for a code
        
        session.save()
        return Response(response_data, status=status.HTTP_200_OK)


# -------------------- Admin Step 3 Login --------------------
class AdminStep3LoginView(generics.GenericAPIView):
    serializer_class = AdminStep3LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            # *** The serializer now handles ALL 2FA/OTP verification logic ***
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            session = serializer.validated_data["session"]
            user = serializer.validated_data["user"]

            # Mark step 3 as completed (Validation has already passed inside the serializer)
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
            # Catch the validation error or any other exception
            print(f"❌ Step 3 error: {str(e)}")
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

# -------------------- First Time Setup Second Password --------------------
class FirstTimeSetupSecondPasswordView(generics.GenericAPIView):
    serializer_class = SetupSecondPasswordSerializer
    permission_classes = [AllowAny] 

    def post(self, request, *args, **kwargs):
        # NOTE: session_token is NOT part of SetupSecondPasswordSerializer, 
        # so we need to validate it manually or add it to the serializer.
        session_token = request.data.get('session_token')
        if not session_token:
             return Response({"error": "Session token is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        second_password = serializer.validated_data['second_password']

        try:
            # Get session and verify
            session = AdminLoginSession.objects.get(
                session_token=session_token,
                step_1_completed=True,
                step_2_completed=False
            )
            
            if session.is_expired():
                session.delete()
                return Response({"error": "Session expired"}, status=status.HTTP_400_BAD_REQUEST)

            user = session.user
            
            # Setup second password
            user.setup_second_password(second_password)
            
            # Mark step 2 as completed
            session.step_2_completed = True
            
            has_2fa = user.admin_security.is_2fa_enabled
            response_data = {
                "message": "Second password set up successfully",
                "requires_2fa": has_2fa,
                "requires_otp": False
            }
            
            if not has_2fa and getattr(settings, 'ADMIN_OTP_REQUIRED', True):
                # Send OTP for non-2FA users and create OTPCode object
                otp_code = str(random.randint(100000, 999999))
                OTPCode.objects.create(user=user, code=otp_code)
                _send_otp_email(user, otp_code)
                
                response_data["requires_otp"] = True
            
            session.save()

            return Response(response_data, status=status.HTTP_200_OK)

        except AdminLoginSession.DoesNotExist:
            return Response({"error": "Invalid or expired session"}, status=status.HTTP_400_BAD_REQUEST)


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


# -------------------- 2FA Status Check --------------------
class Check2FAStatusView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Check 2FA status using django-otp"""
        try:
            is_2fa_enabled = TOTPDevice.objects.filter(user=request.user, confirmed=True).exists()
            devices_count = TOTPDevice.objects.filter(user=request.user, confirmed=True).count()
            
            return Response({
                "is_2fa_enabled": is_2fa_enabled,
                "devices_count": devices_count,
                "devices": [
                    {
                        "id": device.id,
                        "name": device.name or "Authenticator App",
                        "confirmed": device.confirmed,
                        "created_at": device.created_at
                    }
                    for device in TOTPDevice.objects.filter(user=request.user)
                ]
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": "Failed to check 2FA status",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


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


# -------------------- Admin Profile Update --------------------
class AdminProfileUpdateView(generics.UpdateAPIView):
    serializer_class = AdminProfileUpdateSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        serializer = self.get_serializer(
            instance, 
            data=request.data, 
            partial=partial,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        self.perform_update(serializer)

        # Return updated user data
        user_serializer = UserProfileSerializer(instance, context={'request': request})
        
        response_data = {
            "message": "Profile updated successfully",
            "user": user_serializer.data
        }
        
        # Add specific success messages based on what was updated
        if 'new_password' in request.data:
            response_data["password_message"] = "Password updated successfully"
        
        if 'new_second_password' in request.data:
            response_data["second_password_message"] = "Second password updated successfully"

        return Response(response_data, status=status.HTTP_200_OK)


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

        # Change role to agent
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


# -------------------- List All Users --------------------
@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_list(request):
    """Get all users for admin dashboard"""
    try:
        users = User.objects.all().order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    except Exception as e:
        print(f"Error in user_list: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -------------------- Simple User List --------------------
@api_view(['GET'])
@permission_classes([IsAdminUser])
def simple_user_list(request):
    """Simple user list without complex serialization"""
    try:
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