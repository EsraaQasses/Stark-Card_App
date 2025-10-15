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
    
    def process_payment(self, amount: float, user_data: Dict, 
                       transaction_data: Dict) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement process_payment")

class DailyConnector(BaseConnector):
    
    def test_connection(self) -> bool:
        result = self.make_request('/api/health', 'GET')
        return result.get('success', False)
    
    def process_payment(self, amount: float, user_data: Dict, 
                       transaction_data: Dict) -> Dict[str, Any]:
        payload = {
            'amount': amount,
            'currency': 'USD',
            'customer_email': user_data.get('email'),
            'customer_id': user_data.get('id'),
            'reference': transaction_data.get('reference'),
            'metadata': transaction_data
        }
        
        result = self.make_request('/api/payments', 'POST', payload)
        
        if 'transaction' in transaction_data:
            APITransaction.objects.create(
                api_config=self.api_config,
                internal_transaction=transaction_data['transaction'],
                request_payload=payload,
                response_payload=result,
                endpoint_used='/api/payments',
                success=result.get('success', False)
            )
        
        return result

class AlfaourConnector(BaseConnector):
    
    def setup_authentication(self):
        api_key = self.api_config.get_api_key()
        if api_key:
            self.headers['X-API-Key'] = api_key
    
    def test_connection(self) -> bool:
        result = self.make_request('/v1/auth/verify', 'GET')
        return result.get('success', False)
    
    def process_payment(self, amount: float, user_data: Dict, 
                       transaction_data: Dict) -> Dict[str, Any]:
        payload = {
            'transaction_amount': amount,
            'payer_email': user_data.get('email'),
            'external_reference': transaction_data.get('reference'),
            'description': f"Payment for {transaction_data.get('description', 'services')}",
            'additional_info': transaction_data
        }
        
        result = self.make_request('/v1/payments', 'POST', payload)
        
        if 'transaction' in transaction_data:
            APITransaction.objects.create(
                api_config=self.api_config,
                internal_transaction=transaction_data['transaction'],
                request_payload=payload,
                response_payload=result,
                endpoint_used='/v1/payments',
                success=result.get('success', False)
            )
        
        return result

class ConnectorFactory:
    
    @staticmethod
    def get_connector(api_config: ThirdPartyAPI) -> BaseConnector:
        connectors = {
            'daily': DailyConnector,
            'alfaour': AlfaourConnector,
        }
        
        connector_class = connectors.get(api_config.provider)
        if not connector_class:
            raise ValueError(f"No connector found for provider: {api_config.provider}")
        
        return connector_class(api_config)