import hashlib
import secrets

import bcrypt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_salt() -> str:
    return bcrypt.gensalt().decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a bcrypt hash.
    
    Handles passwords that were hashed with SHA-256 first (if they exceeded 72 bytes).
    """
    # Try direct verification first
    try:
        if pwd_context.verify(plain_password, hashed_password):
            return True
    except Exception:
        pass
    
    # If direct verification fails and password is long, try SHA-256 + bcrypt
    # This handles cases where the original password exceeded 72 bytes
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        password_hash = hashlib.sha256(password_bytes).hexdigest()
        try:
            return pwd_context.verify(password_hash, hashed_password)
        except Exception:
            pass
    
    return False


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    If password exceeds 72 bytes (bcrypt limit), it's first hashed with SHA-256
    to ensure it fits within bcrypt's limit while maintaining security.
    """
    # Bcrypt has a 72-byte limit, so if password is longer, hash it first
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Hash with SHA-256 first, then bcrypt the hash
        # This maintains security while working within bcrypt's limits
        password = hashlib.sha256(password_bytes).hexdigest()
    
    try:
        return pwd_context.hash(password)
    except Exception as e:
        # Fallback: if bcrypt still fails, hash with SHA-256 and try again
        if "cannot be longer than 72 bytes" in str(e) or len(password_bytes) > 72:
            password = hashlib.sha256(password_bytes).hexdigest()
            return pwd_context.hash(password)
        raise


# API Key hashing functions (using SHA-256 instead of bcrypt to avoid 72-byte limit)
def hash_api_key(api_key: str) -> str:
    """
    Hash an API key using SHA-256.
    
    API keys use SHA-256 instead of bcrypt because:
    1. API keys are already random, so we don't need bcrypt's computational cost
    2. SHA-256 doesn't have the 72-byte limit that bcrypt has
    3. It's faster for verification
    """
    return hashlib.sha256(api_key.encode('utf-8')).hexdigest()


def verify_api_key(api_key: str, key_hash: str) -> bool:
    """
    Verify an API key against its hash.
    
    Args:
        api_key: The plain API key
        key_hash: The stored hash of the API key
        
    Returns:
        True if the API key matches the hash, False otherwise
    """
    computed_hash = hash_api_key(api_key)
    return secrets.compare_digest(computed_hash, key_hash)
