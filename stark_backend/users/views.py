from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer, RegisterSerializer, VerifyOTPSerializer, LoginSerializer
from rest_framework.permissions import BasePermission
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "message": "User registered successfully. Please verify OTP sent to your provider.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class VerifyOTPView(generics.GenericAPIView):
    serializer_class = VerifyOTPSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]


        return Response({
            "message": "OTP verified successfully. Account activated.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)



class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            username=serializer.validated_data["name"],
            password=serializer.validated_data["password"]
        )

        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.identities.filter(is_verified=True).exists():
            return Response({"error": "Account not verified"}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user


class HasRolePermission(BasePermission):
 #يسمح بالوصول فقط للمستخدمين الذين دورهم موجود في allowed_roles.

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        allowed_roles = getattr(view, "allowed_roles", [])
        return request.user.role in allowed_roles

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=200)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=400)
    

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ["admin", "user", "agent"] 

    def get_object(self):
        return self.request.user
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ban_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_active = False
        user.save()
        return Response({"message": f"User {user.username} has been banned"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unban_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_active = True
        user.save()
        return Response({"message": f"User {user.username} has been unbanned"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    users = User.objects.all()
    user_data = [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "role": getattr(user, 'role', 'user')  # Assuming you have a role field
        }
        for user in users
    ]
    return Response({"users": user_data}, status=status.HTTP_200_OK)