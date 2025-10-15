from django.urls import path
from .views import AgentListView, AgentProductAssignmentAPIView, AgentPurchaseView, AgentUsersListView, agent_approve_payment_view, demote_to_user, promote_to_agent, set_agent_commission

urlpatterns = [
    path('agents/', AgentListView.as_view(), name='agent-list'),
    path("<int:agent_id>/users/", AgentUsersListView.as_view(), name="agent-users"),
    path('agent/purchase/', AgentPurchaseView.as_view(), name='agent-purchase'),
    path('agent/transactions/<int:transaction_id>/approve/', agent_approve_payment_view, name='agent-approve'),
    path('promote-to-agent/<int:user_id>/', promote_to_agent, name='promote-to-agent'),
    path('demote-to-user/<int:user_id>/', demote_to_user, name='demote-to-user'),
    path('agent/<int:agent_id>/set-commission/', set_agent_commission, name='set-agent-commission'),
    path('agent-product-assignments/', AgentProductAssignmentAPIView.as_view(), name='agent-product-assignments'),
    path('agent-product-assignments/<int:assignment_id>/', AgentProductAssignmentAPIView.as_view(), name='agent-product-assignment-delete'),

]
