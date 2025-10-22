from cryptography.fernet import Fernet
from django.conf import settings
import base64
import logging

logger = logging.getLogger(__name__)

class EncryptionHelper:
    def __init__(self):
        self.fernet_key = getattr(settings, 'THIRD_PARTY_API_FERNET_KEY', None)
        if not self.fernet_key:
            raise ValueError("THIRD_PARTY_API_FERNET_KEY must be set in settings")
        self.fernet = Fernet(self.fernet_key)

    def encrypt_text(self, text: str) -> str:
        try:
            if text is None:
                return None
            encrypted_data = self.fernet.encrypt(text.encode())
            return encrypted_data.decode()
        except Exception as e:
            logger.error(f"Encryption error: {e}")
            raise

    def decrypt_text(self, encrypted_text: str) -> str:
        try:
            if not encrypted_text:
                return None
            decrypted_data = self.fernet.decrypt(encrypted_text.encode())
            return decrypted_data.decode()
        except Exception as e:
            logger.error(f"Decryption error: {e}")
            raise

encryption_helper = EncryptionHelper()

def encrypt_text(text: str) -> str:
    return encryption_helper.encrypt_text(text)

def decrypt_text(encrypted_text: str) -> str:
    return encryption_helper.decrypt_text(encrypted_text)