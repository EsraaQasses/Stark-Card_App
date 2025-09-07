from rest_framework import serializers
from .models import AgentProfile
from users.serializers import UserSerializer
from users.models import User

class AgentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentProfile
        fields = ["id", "user", "commission_rate", "total_earnings"]

class AgentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "phone", "balance"]
