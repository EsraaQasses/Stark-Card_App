# payments/services/payment_service.py
import logging
from django.db import transaction as db_transaction
from django.utils import timezone
from ..models import Payment, PaymentConfig
from wallets.models import Wallet
from store.models import StoreProduct
from transactions.models import Transaction
from third_party_apis.services.api_service import APIService

logger = logging.getLogger(__name__)

class PaymentService:
    
    @staticmethod
    @db_transaction.atomic
    def process_payment(store_product_id, user, user_inputs):
        """Process payment with profit percentage and external API integration"""
        try:
            # 1. Get store product and validate
            store_product = StoreProduct.objects.select_related(
                'external_product', 
                'external_product__api_config'
            ).get(id=store_product_id, is_active=True)
            
            # 2. Get payment configuration
            payment_config = PaymentConfig.get_config()
            
            # 3. Get user wallet (use appropriate currency)
            user_wallet = Wallet.objects.get(user=user, currency='syp')  # Adjust currency as needed
            
            # 4. Calculate prices
            base_price = store_product.price
            final_price = base_price + (base_price * payment_config.profit_percentage / 100)
            
            # 5. Check wallet balance
            if user_wallet.balance < final_price:
                return {
                    'success': False,
                    'error': f'Insufficient balance. Need: {final_price}, Have: {user_wallet.balance}'
                }
            
            # 6. Create payment record
            payment = Payment.objects.create(
                user=user,
                store_product=store_product,
                wallet=user_wallet,
                base_price=base_price,
                profit_percentage=payment_config.profit_percentage,
                final_price=final_price,
                user_inputs=user_inputs,
                status='processing'
            )
            
            # 7. Hold funds in wallet
            user_wallet.balance -= final_price
            user_wallet.save()
            
            # 8. Call external API
            api_config = store_product.external_product.api_config
            
            user_data = {
                'user_id': user.id,
                'name': user.name,
                'email': user.email
            }
            
            transaction_data = {
                'internal_tx_id': payment.id,
                'description': f"Payment: {store_product.name}",
                'amount': float(final_price)
            }
            
            product_data = {
                'external_id': store_product.external_product.external_id,
                'quantity': user_inputs.get('quantity', 1),
                'user_inputs': user_inputs,
                'final_price': float(final_price)
            }
            
            # Call external API
            api_result = APIService.process_payment(
                api_id=api_config.id,
                store_product_id=store_product_id,
                user_data=user_data,
                internal_tx_id=payment.id,
                user_inputs=user_inputs
            )
            
            # 9. Handle API response
            if api_result and api_result.get('success'):
                # API call successful
                payment.status = 'success'
                payment.external_transaction_id = api_result.get('external_transaction_id') or api_result.get('order_id')
                payment.processed_at = timezone.now()
                payment.save()
                
                # Create transaction record
                Transaction.objects.create(
                    user=user,
                    wallet=user_wallet,
                    transaction_type='purchase',
                    amount=final_price,
                    status='approved',
                    note=f"Payment for {store_product.name} - External ID: {payment.external_transaction_id}"
                )
                
                return {
                    'success': True,
                    'payment_id': payment.id,
                    'external_transaction_id': payment.external_transaction_id,
                    'order_id': api_result.get('order_id'),
                    'message': api_result.get('message', 'Payment completed successfully'),
                    'final_price': final_price,
                    'new_balance': user_wallet.balance
                }
            else:
                # API call failed - refund wallet
                user_wallet.balance += final_price
                user_wallet.save()
                
                payment.status = 'failed'
                error_msg = api_result.get('error', 'External API call failed') if api_result else 'API returned no response'
                payment.error_message = error_msg
                payment.save()
                
                return {
                    'success': False,
                    'error': error_msg,
                    'payment_id': payment.id,
                    'details': api_result.get('details') if api_result else None
                }
                
        except StoreProduct.DoesNotExist:
            return {
                'success': False,
                'error': 'Product not found or inactive'
            }
        except Wallet.DoesNotExist:
            return {
                'success': False,
                'error': 'User wallet not found'
            }
        except Exception as e:
            logger.error(f"Payment processing failed: {e}")
            
            # Refund wallet if payment was created
            if 'payment' in locals() and user_wallet:
                user_wallet.balance += final_price
                user_wallet.save()
                
                payment.status = 'failed'
                payment.error_message = str(e)
                payment.save()
            
            return {
                'success': False,
                'error': f'Payment processing failed: {str(e)}'
            }