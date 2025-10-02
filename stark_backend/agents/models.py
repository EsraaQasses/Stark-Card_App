from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class AgentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="agent_profile")
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Agent: {self.user.name}"
