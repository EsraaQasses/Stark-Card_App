from django.urls import path
from .views import AgentListView, AgentDetailView, AgentUsersListView

urlpatterns = [
    path("", AgentListView.as_view(), name="agents-list"),
    path("<int:pk>/", AgentDetailView.as_view(), name="agent-detail"),
    path("<int:agent_id>/users/", AgentUsersListView.as_view(), name="agent-users"),
]
