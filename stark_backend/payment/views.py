from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from store.models import Product, PackagePrice
from .services.purchase_service import PurchaseService

class PurchaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        product_id = request.data.get("product_id")
        package_price_id = request.data.get("package_price_id")
        custom_amount = request.data.get("amount")
        currency = request.data.get("currency")
        extra_payload = request.data.get("extra", {})

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"detail": "المنتج غير موجود"}, status=status.HTTP_404_NOT_FOUND)

        # نحدد المبلغ
        if product.product_type == "package_based":
            package_price = PackagePrice.objects.get(id=package_price_id, currency=currency)
            amount = package_price.amount
        else:
            amount = float(custom_amount)

        # نستخدم الـ service
        result = PurchaseService.make_purchase(user, product, amount, currency, extra_payload)

        return Response(result, status=status.HTTP_200_OK if result["success"] else status.HTTP_400_BAD_REQUEST)
