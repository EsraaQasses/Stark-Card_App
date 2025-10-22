import requests
import json
import logging
from typing import Dict, Optional, Any
from django.utils import timezone
from ..models import ThirdPartyAPI, APITransaction

logger = logging.getLogger(__name__)

class BaseConnector:
    
    def __init__(self, api_config: ThirdPartyAPI):
        self.api_config = api_config
        self.base_url = api_config.base_url
        self.headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'StarkPayments/1.0'
        }
        self.setup_authentication()
    
    def setup_authentication(self):
        api_key = self.api_config.get_api_key()
        if api_key:
            self.headers['Authorization'] = f'Bearer {api_key}'
    
    def make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, 
                    timeout: int = 30) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data,
                timeout=timeout
            )
            
            return {
                'success': 200 <= response.status_code < 300,
                'status_code': response.status_code,
                'data': response.json() if response.content else {},
                'headers': dict(response.headers)
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'status_code': None
            }
    
    def test_connection(self) -> bool:
        raise NotImplementedError("Subclasses must implement test_connection")
    
    def get_balance(self) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement get_balance")
    
    def get_products(self) -> list:
        raise NotImplementedError("Subclasses must implement get_products")
    
    def execute_purchase(self, product_data: Dict, user_data: Dict, transaction_data: Dict) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement execute_purchase")

class DailyConnector(BaseConnector):
    
    def test_connection(self) -> bool:
        result = self.make_request('/api/health', 'GET')
        return result.get('success', False)
    
    def get_balance(self) -> Dict[str, Any]:
        result = self.make_request('/api/balance', 'GET')
        return result
    
    def get_products(self) -> list:
        result = self.make_request('/api/products', 'GET')
        if result.get('success'):
            return result.get('data', {}).get('products', [])
        return []
    
    def execute_purchase(self, product_data: Dict, user_data: Dict, transaction_data: Dict) -> Dict[str, Any]:
        payload = {
            'product_id': product_data.get('external_id'),
            'quantity': product_data.get('quantity', 1),
            'user_inputs': product_data.get('user_inputs', {}),
            'amount': transaction_data.get('amount')
        }
        
        result = self.make_request('/api/purchase', 'POST', payload)
        return result

class AlfaourConnector(BaseConnector):
    
    def setup_authentication(self):
        api_key = self.api_config.get_api_key()
        if api_key:
            self.headers['X-API-Key'] = api_key
    
    def test_connection(self) -> bool:
        result = self.make_request('/v1/auth/verify', 'GET')
        return result.get('success', False)
    
    def get_balance(self) -> Dict[str, Any]:
        result = self.make_request('/v1/balance', 'GET')
        return result
    
    def get_products(self) -> list:
        result = self.make_request('/v1/products', 'GET')
        if result.get('success'):
            return result.get('data', {}).get('products', [])
        return []
    
    def execute_purchase(self, product_data: Dict, user_data: Dict, transaction_data: Dict) -> Dict[str, Any]:
        payload = {
            'product_id': product_data.get('external_id'),
            'quantity': product_data.get('quantity', 1),
            'customer_email': user_data.get('email'),
            'amount': transaction_data.get('amount')
        }
        
        result = self.make_request('/v1/purchase', 'POST', payload)
        return result

class AlaaeddinConnector(BaseConnector):
    """Connector for Alaaeddin API"""
    
    def setup_authentication(self):
        api_key = self.api_config.get_api_key()
        if api_key:
            self.headers['Authorization'] = f'Bearer {api_key}'
    
    def test_connection(self) -> bool:
        """Test connection by checking balance"""
        result = self.get_balance()
        return result.get('success', False)
    
    def get_balance(self) -> Dict[str, Any]:
        """Get account balance"""
        result = self.make_request('/api/balance', 'GET')
        return result
    
def get_products(self) -> list:
    """Get available products with proper field mapping for Alaaeddin API"""
    result = self.make_request('/api/products', 'GET')
    
    if result.get('success'):
        products = result.get('data', {}).get('products', [])
        
        # Transform Alaaeddin API response to match our expected format
        transformed_products = []
        for product in products:
            # Handle price conversion - Alaaeddin prices might be multipliers
            default_price = product.get('default_price')
            try:
                base_price = float(default_price) if default_price else 0
            except (ValueError, TypeError):
                base_price = 0
            
            transformed_product = {
                'external_id': str(product.get('id')),  # Map 'id' to 'external_id' as string
                'name': product.get('name'),
                'base_price': base_price,  # Map 'default_price' to 'base_price'
                'description': product.get('description'),
                'required_fields': product.get('fields', []),  # Map 'fields' to 'required_fields'
                'category': product.get('category', 'general'),
                # Keep original Alaaeddin fields for reference
                'original_data': {
                    'default_price': product.get('default_price'),
                    'custom_price': product.get('custom_price'),
                    'final_price': product.get('final_price')
                }
            }
            transformed_products.append(transformed_product)
        
        print(f"🔄 Alaaeddin connector: Transformed {len(transformed_products)} products")
        return transformed_products
    
    print(f"❌ Alaaeddin connector: API call failed - {result.get('error')}")
    return []
    
    def execute_purchase(self, product_data: Dict, user_data: Dict, transaction_data: Dict) -> Dict[str, Any]:
        """Execute a purchase"""
        payload = {
            'product_id': product_data.get('external_id'),
            'quantity': product_data.get('quantity', 1),
            'user_details': user_data,
            'transaction_details': transaction_data
        }
        
        result = self.make_request('/api/purchase', 'POST', payload)
        return result

class ConnectorFactory:
    
    @staticmethod
    def get_connector(api_config: ThirdPartyAPI) -> BaseConnector:
        connectors = {
            'daily': DailyConnector,
            'alfaour': AlfaourConnector,
            'alaaeddin': AlaaeddinConnector,  # Add this line
        }
        
        connector_class = connectors.get(api_config.provider)
        if not connector_class:
            raise ValueError(f"No connector found for provider: {api_config.provider}")
        
        return connector_class(api_config)