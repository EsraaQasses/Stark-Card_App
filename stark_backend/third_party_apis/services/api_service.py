from typing import Dict, Any, List
from django.db import transaction as db_transaction
from ..models import ThirdPartyAPI, APITransaction
from ..utils.connectors import ConnectorFactory
import logging

logger = logging.getLogger(__name__)

class APIService:
    
    @staticmethod
    def get_active_apis(provider: str = None) -> List[ThirdPartyAPI]:
        queryset = ThirdPartyAPI.objects.filter(is_active=True)
        if provider:
            queryset = queryset.filter(provider=provider)
        return queryset.order_by('priority')
    
    @staticmethod
    def test_api_connection(api_id: int) -> Dict[str, Any]:
        try:
            api_config = ThirdPartyAPI.objects.get(id=api_id, is_active=True)
            connector = ConnectorFactory.get_connector(api_config)
            is_connected = connector.test_connection()
            
            return {
                'success': True,
                'connected': is_connected,
                'api_name': api_config.name
            }
        except ThirdPartyAPI.DoesNotExist:
            return {'success': False, 'error': 'API configuration not found'}
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def process_payment(api_id: int, amount: float, user_data: Dict, 
                       transaction_data: Dict) -> Dict[str, Any]:
        try:
            api_config = ThirdPartyAPI.objects.get(id=api_id, is_active=True)
            
            if api_config.max_daily_limit and amount > api_config.max_daily_limit:
                return {
                    'success': False,
                    'error': f'Amount exceeds daily limit of {api_config.max_daily_limit}'
                }
            
            connector = ConnectorFactory.get_connector(api_config)
            result = connector.process_payment(amount, user_data, transaction_data)
            
            return {
                'success': result.get('success', False),
                'data': result.get('data', {}),
                'api_transaction_id': result.get('api_transaction_id'),
                'status_code': result.get('status_code'),
                'error': result.get('error')
            }
            
        except ThirdPartyAPI.DoesNotExist:
            return {'success': False, 'error': 'API configuration not found'}
        except Exception as e:
            logger.error(f"Payment processing failed: {e}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def process_payment_through_best_api(amount: float, user_data: Dict, 
                                       transaction_data: Dict, 
                                       provider: str = None) -> Dict[str, Any]:
        apis = APIService.get_active_apis(provider)
        
        for api in apis:
            result = APIService.process_payment(api.id, amount, user_data, transaction_data)
            if result['success']:
                return result
        
        return {
            'success': False, 
            'error': 'No active payment APIs available or all failed'
        }