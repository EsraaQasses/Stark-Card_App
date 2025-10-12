# third_party_apis/utils/connectors.py - UPDATED VERSION
import requests
import logging
from typing import Dict, List, Optional, Any
from django.utils import timezone
from ..models import ThirdPartyAPI, APITransaction

logger = logging.getLogger(__name__)

class BaseAPIConnector:
    """Base connector defining required interface for all providers"""
    
    def __init__(self, api_instance):
        self.api_config = api_instance
        self.api_key = api_instance.get_api_key()
        self.base_url = api_instance.base_url.rstrip("/")
        self.headers = {}
        self.setup_authentication()
    
    def setup_authentication(self):
        """Setup authentication headers - override in subclasses"""
        api_key = self.api_config.get_api_key()
        if api_key:
            self.headers['Authorization'] = f'Bearer {api_key}'
    
    def make_request(self, endpoint, method="GET", data=None):
        url = f"{self.base_url}{endpoint}"
        request_headers = self.headers.copy() 
        request_headers["Accept"] = "application/json"

        try:
            logger.info(f"Requesting {url} with headers {request_headers}")
            response = requests.request(method, url, headers=request_headers, json=data, timeout=20)
            response.raise_for_status()
            return {"success": True, "status_code": response.status_code, "data": response.json()}
        except requests.RequestException as e:
            logger.error(f"API request failed: {e}")
            return {"success": False, "error": str(e), "status_code": getattr(e.response, "status_code", None)}
    
    def get_products(self) -> List[Dict]:
        """Fetch products from external API"""
        raise NotImplementedError("Subclasses must implement get_products")
    
    def execute_purchase(self, product_data: Dict, user_data: Dict, 
                        transaction_data: Dict) -> Dict[str, Any]:
        """Execute purchase on external API"""
        raise NotImplementedError("Subclasses must implement execute_purchase")
    
    def get_order_status(self, external_order_id: str) -> Dict[str, Any]:
        """Check order status on external API"""
        raise NotImplementedError("Subclasses must implement get_order_status")
    
    def test_connection(self) -> bool:
        """Test connection to API"""
        raise NotImplementedError("Subclasses must implement test_connection")


class AlaaeddinConnector(BaseAPIConnector):
    """Connector for Alaaeddin API - UPDATED with fixes"""
    
    def setup_authentication(self):
        """Alaaeddin/Stark-Card uses 'api-token' header for authentication."""
        api_key = self.api_config.get_api_key()
        self.headers['User-Agent'] = 'Mozilla/5.0 (compatible; StarkCardApp/1.0)'
        if api_key:
            self.headers['Authorization'] = f'Bearer {api_key}'
            
            if 'api-token' in self.headers:
                 del self.headers['api-token']
                     
   
    def get_balance(self) -> Dict[str, Any]:
        """Get user balance from Alaaeddin API (FIXED PARSING)"""
        # 1. Make the request
        result = self.make_request('/api/user/balance', 'GET')
        
        # Check for overall success from the BaseAPIConnector wrapper
        if result.get('success'):
            # 2. Extract the 'total' balance value from the response data
            # The raw response body is expected to be under the 'data' key, 
            # and the balance value under the 'total' key within that data.
            
            # Example raw response: {'total': 5175331, 'all_balances': [...]}
            balance_value = result.get('data', {}).get('total')
            
            if balance_value is not None:
                # 3. Return a successful, formatted dictionary
                return {
                    'success': True,
                    # Ensure the balance is returned as a string
                    'data': {'balance': str(balance_value)} 
                }
        
        # Fallback for failed extraction or API error
        # Use the error message reported by the BaseAPIConnector
        error_message = result.get('error', 'Could not parse balance response or API failed.')

        return {
            'success': False,
            'error': error_message
        }
        
    def get_products(self) -> List[Dict]:
        """Get products from Alaaeddin API - FIXED VERSION"""
        result = self.make_request('/api/products', 'GET')
        
        if result['success']:
            # FIX: The API returns {'products': [...]} - extract the products array from data
            response_data = result.get('data', {})
            products_data = response_data.get('products', [])
            
            transformed_products = []
            
            for product in products_data:
                try:
                    # Extract data from Alaaeddin API response
                    product_id = product.get('id')
                    if not product_id:
                        continue
                    
                    name = product.get('name', 'Unknown Product')
                    default_price = product.get('default_price', 0)
                    custom_price = product.get('custom_price')
                    final_price = product.get('final_price', default_price)
                    
                    # FIX: Handle null description
                    description = product.get('description') or ''
                    
                    # Convert prices safely
                    try:
                        base_price = float(product.get('default_price', 0)) 
                    except (ValueError, TypeError):
                        continue
                    
                    try:
                        final_price = float(str(final_price))
                    except (ValueError, TypeError):
                        final_price = base_price
                    
                    # Extract required fields - FIXED null handling
                    fields = product.get('fields', [])
                    required_fields = []
                    
                    for field in fields:
                        # FIX: Handle null field options
                        field_options = field.get('field_options')
                        
                        field_def = {
                            'name': field.get('field_name', ''),
                            'type': field.get('field_type', 'text'),
                            'required': True,
                            'label': field.get('field_name', '')
                        }
                        
                        if field_options is not None:  # Only add if not null
                            field_def['options'] = field_options
                            
                        required_fields.append(field_def)
                    
                    transformed_products.append({
                        'external_id': str(product_id),
                        'name': name,
                        'description': description,  # FIXED: Now handles null
                        'base_price': base_price,
                        'final_price': final_price,
                        'category': 'general',
                        'required_fields': required_fields,  # FIXED: Now handles null options
                        'external_data': product
                    })
                    
                except Exception as e:
                    logger.warning(f"Failed to process product {product.get('id')}: {e}")
                    continue
            
            return transformed_products
        return []
    
    def execute_purchase(self, product_data: Dict, user_data: Dict, 
                        transaction_data: Dict) -> Dict[str, Any]:
        """Execute purchase on Alaaeddin API - CORRECTED WORKING VERSION"""
        
        # CORRECT FORMAT: fields should be a dictionary with field names as keys
        payload = {
            'product_id': int(product_data['external_id']),
            'quantity': product_data.get('quantity', 1),
            'fields': product_data.get('user_inputs', {})  # Direct dictionary, not array
        }
        
        logger.info(f"Alaaeddin purchase payload: {payload}")
        
        result = self.make_request('/api/purchase', 'POST', payload)
        
        # Enhance the result with order_id if successful
        if result.get('success') and 'data' in result:
            result['order_id'] = result['data'].get('order_id')
            
        return result
    
    def get_order_status(self, external_order_id: str) -> Dict[str, Any]:
        """Get order status from Alaaeddin API"""
        result = self.make_request(f'/api/order/status/{external_order_id}', 'GET')
        return result
    
    def test_connection(self) -> bool:
        """Test connection by checking balance and products"""
        try:
            # Test balance endpoint
            balance_result = self.get_balance()
            balance_ok = balance_result.get('success', False)
            
            # Test products endpoint
            products_result = self.get_products()
            products_ok = products_result is not None
            
            return balance_ok and products_ok
            
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return False


class AlfaourConnector(BaseAPIConnector):
    """Connector for Alfaour API - PLACEHOLDER"""
    
    def setup_authentication(self):
        api_key = self.api_config.get_api_key()
        if api_key:
            self.headers['X-API-Key'] = api_key
    
    def get_products(self) -> List[Dict]:
        # Implement based on Alfaour API
        logger.info("Alfaour connector - get_products not implemented")
        return []
    
    def execute_purchase(self, product_data: Dict, user_data: Dict, 
                        transaction_data: Dict) -> Dict[str, Any]:
        # Implement based on Alfaour API
        logger.info("Alfaour connector - execute_purchase not implemented")
        return {
            'success': False,
            'error': 'Alfaour connector not implemented'
        }
    
    def get_order_status(self, external_order_id: str) -> Dict[str, Any]:
        logger.info("Alfaour connector - get_order_status not implemented")
        return {}
    
    def test_connection(self) -> bool:
        logger.info("Alfaour connector - test_connection not implemented")
        return False


class DailyConnector(BaseAPIConnector):
    """Connector for Daily API - PLACEHOLDER"""
    
    def get_products(self) -> List[Dict]:
        logger.info("Daily connector - get_products not implemented")
        return []
    
    def execute_purchase(self, product_data: Dict, user_data: Dict, 
                        transaction_data: Dict) -> Dict[str, Any]:
        logger.info("Daily connector - execute_purchase not implemented")
        return {
            'success': False,
            'error': 'Daily connector not implemented'
        }
    
    def get_order_status(self, external_order_id: str) -> Dict[str, Any]:
        logger.info("Daily connector - get_order_status not implemented")
        return {}
    
    def test_connection(self) -> bool:
        logger.info("Daily connector - test_connection not implemented")
        return False


class ConnectorFactory:
    """Factory to get the correct connector based on provider"""
    
    @staticmethod
    def get_connector(api_config: ThirdPartyAPI) -> BaseAPIConnector:
        connectors = {
            'alaaeddin': AlaaeddinConnector,
            'alfaour': AlfaourConnector,
            'daily': DailyConnector,
        }
        
        connector_class = connectors.get(api_config.provider)
        if not connector_class:
            raise ValueError(f"No connector found for provider: {api_config.provider}")
        
        return connector_class(api_config)