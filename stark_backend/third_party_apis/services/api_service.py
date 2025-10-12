# third_party_apis/services/api_service.py
import logging
from typing import List, Dict, Any, Optional
from django.db import transaction as db_transaction
from django.utils import timezone
from ..models import ThirdPartyAPI, APITransaction
from ..utils.connectors import ConnectorFactory
from transactions.models import Transaction

logger = logging.getLogger(__name__)

class APIService:
    
    @staticmethod
    def _execute_api_call_and_log(api_config: ThirdPartyAPI, endpoint: str, 
                                 method: str, payload: Dict, internal_transaction=None) -> Dict[str, Any]:
        """Execute API call with comprehensive logging"""
        
        # Create APITransaction record before the call
        api_transaction = APITransaction.objects.create(
            api_config=api_config,
            internal_transaction=internal_transaction,
            request_payload=payload,
            endpoint_used=endpoint,
            request_timestamp=timezone.now(),
            success=False
        )
        
        try:
            connector = ConnectorFactory.get_connector(api_config)
            
            # Execute the appropriate method based on endpoint
            if endpoint == '/api/products':
                result = connector.get_products()
                # Transform result for consistency - FIXED: Return proper structure
                result_data = {
                    'success': True,
                    'products': result,
                    'status_code': 200
                }
            elif endpoint == '/api/purchase':
                result = connector.execute_purchase(
                    payload.get('product_data', {}),
                    payload.get('user_data', {}),
                    payload.get('transaction_data', {})
                )
                result_data = result
            else:
                result_data = {'success': False, 'error': f'Unknown endpoint: {endpoint}'}
            
            # Update APITransaction with response - FIXED: Use order_id instead of transaction_id
            api_transaction.response_payload = result_data
            api_transaction.response_timestamp = timezone.now()
            api_transaction.http_status_code = result_data.get('status_code', 200)
            api_transaction.success = result_data.get('success', False)
            api_transaction.error_message = result_data.get('error', '')
            api_transaction.external_transaction_id = result_data.get('order_id', '')  # FIXED: Use order_id
            api_transaction.save()
            
            return result_data
            
        except Exception as e:
            logger.error(f"API call failed: {e}")
            # Update APITransaction with error
            api_transaction.response_payload = {'error': str(e)}
            api_transaction.response_timestamp = timezone.now()
            api_transaction.success = False
            api_transaction.error_message = str(e)
            api_transaction.save()
            
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_active_apis(provider: str = None) -> List[ThirdPartyAPI]:
        """Get active APIs, optionally filtered by provider"""
        queryset = ThirdPartyAPI.objects.filter(is_active=True)
        if provider:
            queryset = queryset.filter(provider=provider)
        return queryset.order_by('priority')
    
    @staticmethod
    def sync_products_from_api(api_id: int) -> Dict[str, Any]:
        """Sync only ACTIVE products from external API to ExternalProduct model - FIXED VERSION"""
        from store.models import ExternalProduct  # Import here to avoid circular imports
        
        try:
            api_config = ThirdPartyAPI.objects.get(id=api_id)
            
            # FIX: Use connector directly to avoid response format issues with _execute_api_call_and_log
            connector = ConnectorFactory.get_connector(api_config)
            products_data = connector.get_products()
            
            if not products_data:
                return {
                    'success': False,
                    'error': 'No products returned from API',
                    'details': 'Empty product list from connector'
                }
            
            # Filter only active products (price > 0 and has fields)
            active_products = [
                product for product in products_data 
                if product.get('base_price', 0) > 0 and product.get('required_fields')
            ]
            
            synced_count = 0
            updated_count = 0
            
            for product_data in active_products:
                # Handle null descriptions
                description = product_data.get('description') or ''
                
                # Create or update ExternalProduct
                external_product, created = ExternalProduct.objects.update_or_create(
                    external_id=product_data['external_id'],
                    api_config=api_config,
                    defaults={
                        'name': product_data['name'],
                        'description': description,
                        'base_price': product_data['base_price'],
                        'category': product_data.get('category', 'general'),
                        'required_fields_json': product_data.get('required_fields', []),
                        'external_data': product_data.get('external_data', {}),
                        'is_active': True
                    }
                )
                
                if created:
                    synced_count += 1
                else:
                    updated_count += 1
            
            return {
                'success': True,
                'synced_count': synced_count,
                'updated_count': updated_count,
                'total_products': len(products_data),
                'active_products': len(active_products)
            }
            
        except Exception as e:
            logger.error(f"Product sync failed for API {api_id}: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def process_payment(api_id: int, store_product_id: int, user_data: Dict, 
                       internal_tx_id: int, user_inputs: Dict) -> Dict[str, Any]:
        """Process payment through external API - FIXED VERSION"""
        from store.models import StoreProduct  # Import here to avoid circular imports
        
        try:
            api_config = ThirdPartyAPI.objects.get(id=api_id)
            store_product = StoreProduct.objects.get(id=store_product_id)
            
            # Get the transaction object for logging
            internal_transaction = Transaction.objects.get(id=internal_tx_id)
            
            # Prepare product data for external API
            product_data = {
                'external_id': store_product.external_product.external_id,
                'quantity': user_inputs.get('quantity', 1),
                'user_inputs': user_inputs,
                'final_price': float(store_product.price)
            }
            
            transaction_data = {
                'internal_tx_id': internal_tx_id,
                'description': f"Purchase: {store_product.name}",
                'amount': float(store_product.price)
            }
            
            # FIX: Use internal_transaction instead of internal_transaction_id
            # FIX: Use correct endpoint '/api/purchase'
            result = APIService._execute_api_call_and_log(
                api_config=api_config,
                endpoint='/api/purchase',  # Fixed endpoint
                method='POST',
                payload={
                    'product_data': product_data,
                    'user_data': user_data,
                    'transaction_data': transaction_data
                },
                internal_transaction=internal_transaction  # FIXED: Pass object, not ID
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Payment processing failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def test_api_connection(api_id: int) -> Dict[str, Any]:
        """Test connection to a specific API with detailed info"""
        try:
            api_config = ThirdPartyAPI.objects.get(id=api_id)
            connector = ConnectorFactory.get_connector(api_config)
            
            # Test balance endpoint
            balance_result = connector.get_balance()
            balance_success = balance_result.get('success', False)
            balance_data = balance_result.get('data', {})
            
            # Test products endpoint
            products_result = connector.get_products()
            products_success = products_result is not None
            products_count = len(products_result) if products_result else 0
            
            is_connected = balance_success and products_success
            
            return {
                'success': True,
                'connected': is_connected,
                'api_name': api_config.name,
                'provider': api_config.provider,
                'balance_test': {
                    'success': balance_success,
                    'balance': balance_data.get('balance') if balance_success else None,
                    'error': balance_result.get('error') if not balance_success else None
                },
                'products_test': {
                    'success': products_success,
                    'products_count': products_count
                },
                'details': f"Balance: {'OK' if balance_success else 'FAIL'}, Products: {products_count} found"
            }
        except Exception as e:
            logger.error(f"Connection test failed for API {api_id}: {e}")
            return {
                'success': False,
                'connected': False,
                'error': str(e)
            }