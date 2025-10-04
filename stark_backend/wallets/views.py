from django.db.models import Sum
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from transactions.models import Transaction

def get_wallet_balances(user):
    currencies = ["USD", "SYP"]
    balances = {currency: {"available": 0, "pending": 0, "total": 0} for currency in currencies}

    for currency in currencies:
        available = (
            Transaction.objects.filter(user=user, wallet__currency=currency, status="approved")
            .aggregate(total=Sum("amount"))["total"] or 0
        )
        pending = (
            Transaction.objects.filter(user=user, wallet__currency=currency, status="pending")
            .aggregate(total=Sum("amount"))["total"] or 0
        )
        balances[currency]["available"] = available
        balances[currency]["pending"] = pending
        balances[currency]["total"] = available + pending

    return balances

def get_exchange_rates():
    try:
        response = requests.get("https://api.frankfurter.app/latest?from=USD&to=SYP")
        data = response.json()
        usd_to_syp = data["rates"]["SYP"]
        syp_to_usd = 1 / usd_to_syp
        return {"usd_to_syp": usd_to_syp, "syp_to_usd": syp_to_usd}
    except Exception:
        return {"usd_to_syp": 404, "syp_to_usd": 404} #لما يعرض قيمة 404 معناتا في خطأ بالapi

class WalletView(APIView):
    def get(self, request):
        user = request.user

        # تحديد المستخدمين حسب الدور
        if user.role == "admin":
            # الادمن يشوف كل المستخدمين كمجاميع
            users = user.__class__.objects.all()
            balances = {
                "USD": {"available": 0, "pending": 0, "total": 0},
                "SYP": {"available": 0, "pending": 0, "total": 0},
            }
            for u in users:
                user_balances = get_wallet_balances(u)
                for currency in ["USD", "SYP"]:
                    for key in ["available", "pending", "total"]:
                        balances[currency][key] += user_balances[currency][key]
        else:
            # الوكيل والمستخدم يشوف فقط أرصدته
            balances = get_wallet_balances(user)

        rates = get_exchange_rates()
        total_usd = balances["USD"]["total"] + balances["SYP"]["total"] * rates["syp_to_usd"]
        total_syp = balances["SYP"]["total"] + balances["USD"]["total"] * rates["usd_to_syp"]

        data = {
            "USD": balances["USD"],
            "SYP": balances["SYP"],
            "exchange_rates": rates,
            "totals": {
                "usd": round(total_usd, 2),
                "syp": round(total_syp, 2),
            },
        }
        return Response(data)
