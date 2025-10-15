from decimal import Decimal
from django.db.models import Sum, Case, When, F, DecimalField
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from wallets.serializers import ExchangeRateSerializer
from .models import ExchangeRate
from transactions.models import Transaction


#    لحساب أرصدة مستخدم واحد
def get_wallet_balances_for_user(user):
    balances = {"USD": {"available": Decimal("0"), "pending": Decimal("0"), "total": Decimal("0")},
                "SYP": {"available": Decimal("0"), "pending": Decimal("0"), "total": Decimal("0")}}

    qs = (
        Transaction.objects.filter(user=user)
        .values('wallet__currency')
        .annotate(
            available=Sum(Case(When(status='approved', then=F('amount')), output_field=DecimalField())),
            pending=Sum(Case(When(status='pending', then=F('amount')), output_field=DecimalField())),
        )
    )

    for row in qs:
        cur = row['wallet__currency']
        available = row['available'] or Decimal("0")
        pending = row['pending'] or Decimal("0")
        balances[cur]["available"] = available
        balances[cur]["pending"] = pending
        balances[cur]["total"] = available + pending

    return balances


#    لحساب مجموع أرصدة كل المستخدمين (للأدمن)
def get_wallet_balances_for_all_users():
    balances = {"USD": {"available": Decimal("0"), "pending": Decimal("0"), "total": Decimal("0")},
                "SYP": {"available": Decimal("0"), "pending": Decimal("0"), "total": Decimal("0")}}

    qs = (
        Transaction.objects
        .values('wallet__currency')
        .annotate(
            available=Sum(Case(When(status='approved', then=F('amount')), output_field=DecimalField())),
            pending=Sum(Case(When(status='pending', then=F('amount')), output_field=DecimalField())),
        )
    )

    for row in qs:
        cur = row['wallet__currency']
        available = row['available'] or Decimal("0")
        pending = row['pending'] or Decimal("0")
        balances[cur]["available"] = available
        balances[cur]["pending"] = pending
        balances[cur]["total"] = available + pending

    return balances


#   لجلب سعر الصرف مع نسبة التغير 
def get_exchange_rates():
    rates = ExchangeRate.objects.order_by('-id')[:2]  # آخر سجلين
    if not rates:
        return {
            "usd_to_syp": {"value": Decimal("0"), "change": 0},
            "syp_to_usd": {"value": Decimal("0"), "change": 0}
        }

    current = rates[0]
    previous = rates[1] if len(rates) > 1 else current 

    def calc_change(current_val, prev_val):
        if prev_val == 0:
            return 0
        change = ((current_val - prev_val) / prev_val) * 100
        return round(change, 2)

    usd_change = calc_change(current.usd_to_syp, previous.usd_to_syp)
    syp_change = calc_change(current.syp_to_usd, previous.syp_to_usd)

    return {
        "usd_to_syp": {"value": current.usd_to_syp, "change": usd_change},
        "syp_to_usd": {"value": current.syp_to_usd, "change": syp_change},
    }


#   لعرض المحفظة
class WalletView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # أرصدة المستخدم أو كل المستخدمين إذا أدمن
        if user.role == "admin":
            balances = get_wallet_balances_for_all_users()
        else:
            balances = get_wallet_balances_for_user(user)

        # جلب سعر الصرف
        rates = get_exchange_rates()
        usd_rate = rates["usd_to_syp"]
        syp_rate = rates["syp_to_usd"]

        # حساب الإجمالي المحول
        total_usd = balances["USD"]["total"] + (balances["SYP"]["total"] * syp_rate["value"])
        total_syp = balances["SYP"]["total"] + (balances["USD"]["total"] * usd_rate["value"])

        data = {
            "USD": {
                "symbol": "$",
                "available": f"{float(balances['USD']['available']):,.2f} $",
                "pending": f"{float(balances['USD']['pending']):,.2f} $",
                "total": f"{float(balances['USD']['total']):,.2f} $",
                "rate_to_syp": float(usd_rate["value"])
            },
            "SYP": {
                "symbol": "ل.س",
                "available": f"{float(balances['SYP']['available']):,.2f} ل.س",
                "pending": f"{float(balances['SYP']['pending']):,.2f} ل.س",
                "total": f"{float(balances['SYP']['total']):,.2f} ل.س",
                "rate_to_usd": float(syp_rate["value"])
            },
            "exchange_rates": {
                "usd_to_syp": f"{float(usd_rate['value']):,.2f} ل.س ({usd_rate['change']}%)",
                "syp_to_usd": f"{float(syp_rate['value']):,.5f} $ ({syp_rate['change']}%)"
            },
            "totals": {
                "usd": f"{float(total_usd):,.2f} $",
                "syp": f"{float(total_syp):,.2f} ل.س",
            },
        }

        return Response(data, status=200)
 

class ExchangeRateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rate = ExchangeRate.objects.last()
        serializer = ExchangeRateSerializer(rate)
        return Response(serializer.data, status=200)

    def put(self, request):
        if request.user.role != "admin":
            return Response({"detail": "ليس لديك صلاحية لتعديل سعر الصرف"}, status=403)

        rate = ExchangeRate.objects.last()
        serializer = ExchangeRateSerializer(rate, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # بعد الحفظ، syp_to_usd يتم حسابه تلقائيًا
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def change_user_currency(request):
    """
    تغيير العملة الأساسية للمستخدم (USD أو SYP)
    """
    new_currency = request.data.get("currency")

    if new_currency not in ["USD", "SYP"]:
        return Response({"error": "عملة غير مدعومة"}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    user.currency_preference = new_currency
    user.save()

    return Response({
        "message": f"تم تغيير العملة الأساسية إلى {new_currency}",
        "currency_preference": new_currency
    }, status=status.HTTP_200_OK)