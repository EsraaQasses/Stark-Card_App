from django.test import TestCase

# testing_script.py
import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')
django.setup()

from third_party_apis.models import ThirdPartyAPI
from third_party_apis.services.api_service import APIService
from store.models import Section, Product, StoreProduct, ExternalProduct
from transactions.services.purchase_service import PurchaseService
from django.contrib.auth import get_user_model

User = get_user_model()

class AlaeddinAPITester:
    def __init__(self):
        self.api_config = None
        self.test_user = None
        
    def setup_test_data(self):
        """Create test data for Alaeddin API"""
        print("=== SETTING UP TEST DATA ===")
        
        # 1. Create or get test user
        self.test_user, created = User.objects.get_or_create(
            username='test_user',
            defaults={'email': 'test@example.com', 'is_active': True}
        )
        if created:
            print(f"✅ Created test user: {self.test_user.username}")
        else:
            print(f"✅ Using existing test user: {self.test_user.username}")
        
        # 2. Create Alaeddin API configuration
        self.api_config, created = ThirdPartyAPI.objects.get_or_create(
            name='Alaeddin Test API',
            provider='alaaeddin',
            defaults={
                'base_url': 'https://your-alaeddin-api-domain.com',  # Replace with actual URL
                'is_active': True,
                'priority': 1,
                'description': 'Test API for Alaeddin integration'
            }
        )
        
        if created:
            # Set API key (you'll need to get this from Alaeddin)
            api_key = input("Enter your Alaeddin API key: ")
            self.api_config.set_api_key(api_key)
            self.api_config.save()
            print("✅ Created Alaeddin API configuration")
        else:
            print("✅ Using existing Alaeddin API configuration")
            
        print(f"API Config ID: {self.api_config.id}")
        return True
    
    def test_connection(self):
        """Test connection to Alaeddin API"""
        print("\n=== TESTING API CONNECTION ===")
        
        result = APIService.test_api_connection(self.api_config.id)
        
        print(f"✅ Connection Test Result:")
        print(f"   - Overall: {'SUCCESS' if result['connected'] else 'FAILED'}")
        print(f"   - Balance Test: {'SUCCESS' if result['balance_test']['success'] else 'FAILED'}")
        if result['balance_test']['success']:
            print(f"     Balance: {result['balance_test']['balance']}")
        print(f"   - Products Test: {'SUCCESS' if result['products_test']['success'] else 'FAILED'}")
        print(f"     Products Found: {result['products_test']['products_count']}")
        
        return result['connected']
    
    def sync_products(self):
        """Sync products from Alaeddin API"""
        print("\n=== SYNCING PRODUCTS ===")
        
        result = APIService.sync_products_from_api(self.api_config.id)
        
        if result['success']:
            print(f"✅ Product Sync Successful:")
            print(f"   - Synced: {result['synced_count']} products")
            print(f"   - Updated: {result['updated_count']} products")
            print(f"   - Total: {result['total_products']} products")
            
            # Display synced products
            external_products = ExternalProduct.objects.filter(api_config=self.api_config)
            for product in external_products[:5]:  # Show first 5
                print(f"     • {product.name} (ID: {product.external_id}) - ${product.base_price}")
            if external_products.count() > 5:
                print(f"     ... and {external_products.count() - 5} more")
        else:
            print(f"❌ Product Sync Failed: {result['error']}")
            
        return result['success']
    
    def create_store_structure(self):
        """Create sections and store products"""
        print("\n=== CREATING STORE STRUCTURE ===")
        
        # Create a section
        section, created = Section.objects.get_or_create(
            name='Alaeddin Products',
            defaults={'description': 'Products synced from Alaeddin API'}
        )
        if created:
            print(f"✅ Created section: {section.name}")
        else:
            print(f"✅ Using existing section: {section.name}")
        
        # Create store products from external products
        external_products = ExternalProduct.objects.filter(api_config=self.api_config, is_active=True)
        store_products_created = 0
        
        for ext_product in external_products:
            store_product, created = StoreProduct.objects.get_or_create(
                external_product=ext_product,
                defaults={
                    'section': section,
                    'name': ext_product.name,
                    'description': ext_product.description,
                    'price': ext_product.base_price * 1.1,  # 10% markup
                    'is_active': True
                }
            )
            if created:
                store_products_created += 1
                print(f"✅ Created store product: {store_product.name} - ${store_product.price}")
        
        print(f"✅ Created {store_products_created} store products")
        return section
    
    def test_purchase_flow(self):
        """Test the complete purchase flow"""
        print("\n=== TESTING PURCHASE FLOW ===")
        
        # Get first available store product
        store_product = StoreProduct.objects.filter(is_active=True).first()
        
        if not store_product:
            print("❌ No active store products found for testing")
            return False
        
        print(f"Testing with product: {store_product.name}")
        print(f"Price: ${store_product.price}")
        
        # Check required fields
        required_fields = store_product.external_product.required_fields_json
        print(f"Required fields: {required_fields}")
        
        # Prepare user inputs based on required fields
        user_inputs = {}
        for field in required_fields:
            field_name = field.get('name', 'unknown')
            if field.get('type') == 'dropdown' and field.get('options'):
                # Use first option for testing
                user_inputs[field_name] = field['options'][0]
            else:
                user_inputs[field_name] = f'test_{field_name}'
        
        print(f"User inputs: {user_inputs}")
        
        # Execute purchase
        try:
            result = PurchaseService.process_purchase(
                store_product_id=store_product.id,
                user=self.test_user,
                user_inputs=user_inputs
            )
            
            print(f"Purchase Result:")
            print(f"   - Success: {result['success']}")
            if result['success']:
                print(f"   - Transaction ID: {result.get('transaction_id')}")
                print(f"   - Message: {result.get('message')}")
            else:
                print(f"   - Error: {result.get('error')}")
                
            return result['success']
            
        except Exception as e:
            print(f"❌ Purchase failed with exception: {str(e)}")
            return False
    
    def run_complete_test(self):
        """Run complete test suite"""
        print("🚀 STARTING COMPREHENSIVE ALAEDDIN API TEST")
        print("=" * 50)
        
        try:
            # Step 1: Setup
            if not self.setup_test_data():
                return False
            
            # Step 2: Test connection
            if not self.test_connection():
                print("❌ Connection test failed. Stopping.")
                return False
            
            # Step 3: Sync products
            if not self.sync_products():
                print("❌ Product sync failed. Stopping.")
                return False
            
            # Step 4: Create store structure
            self.create_store_structure()
            
            # Step 5: Test purchase
            purchase_success = self.test_purchase_flow()
            
            print("\n" + "=" * 50)
            print("🎯 TEST SUMMARY")
            print("=" * 50)
            print(f"✅ API Configuration: Ready")
            print(f"✅ Connection: Working")
            print(f"✅ Products: Synced")
            print(f"✅ Store Structure: Created")
            print(f"✅ Purchase Flow: {'WORKING' if purchase_success else 'NEEDS ATTENTION'}")
            
            return purchase_success
            
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            return False

# Run the test
if __name__ == "__main__":
    tester = AlaeddinAPITester()
    tester.run_complete_test()
