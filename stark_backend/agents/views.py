from rest_framework import generics, permissions
from .models import AgentProfile
from .serializers import AgentProfileSerializer, AgentUserSerializer
from users.models import User

class AgentListView(generics.ListAPIView):
    queryset = AgentProfile.objects.all()
    serializer_class = AgentProfileSerializer
    permission_classes = [permissions.IsAdminUser]

class AgentDetailView(generics.RetrieveAPIView):
    queryset = AgentProfile.objects.all()
    serializer_class = AgentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]  

class AgentUsersListView(generics.ListAPIView):
    serializer_class = AgentUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        agent_id = self.kwargs.get("agent_id")
        return User.objects.filter(agent_id=agent_id)
