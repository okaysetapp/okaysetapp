#!/usr/bin/env python3
"""
Test Supabase client configuration
"""

import requests
import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

# Load env from project-root .env (single source of truth)
load_dotenv(Path(__file__).parent / ".env")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
SUPABASE_ANON_KEY = (
    os.environ.get("SUPABASE_ANON_KEY")
    or os.environ.get("REACT_APP_SUPABASE_ANON_KEY")
)

if not (SUPABASE_URL and SUPABASE_SERVICE_KEY and SUPABASE_ANON_KEY):
    print("❌ SUPABASE_URL, SUPABASE_SERVICE_KEY, and SUPABASE_ANON_KEY (or REACT_APP_SUPABASE_ANON_KEY) must be set in env.")
    sys.exit(1)

def test_supabase_auth():
    print("🔍 Testing Supabase Client Configuration")
    print("=" * 50)
    
    # Test with service key client (like backend)
    service_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    # Get a user token first
    BASE_URL = "https://okayset-restore.preview.emergentagent.com"
    API_URL = f"{BASE_URL}/api"
    
    vendor_login = {
        "email": "jacob@test.com",
        "password": "ChangeMe123!"
    }
    
    response = requests.post(f"{API_URL}/auth/login", json=vendor_login)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return
    
    data = response.json()
    token = data.get('token')
    user_id = data.get('user_id')
    
    print(f"✅ Got token for user: {user_id}")
    
    # Test token verification with service client
    try:
        user_response = service_client.auth.get_user(token)
        if user_response and user_response.user:
            print(f"✅ Service client can verify token")
            print(f"   User ID: {user_response.user.id}")
            print(f"   Email: {user_response.user.email}")
            
            # Test role lookup
            role_response = service_client.table('user_roles').select('role').eq('user_id', user_id).single().execute()
            if role_response.data:
                print(f"✅ Role found: {role_response.data['role']}")
            else:
                print(f"❌ No role found for user")
        else:
            print(f"❌ Service client cannot verify token")
    except Exception as e:
        print(f"❌ Service client error: {str(e)}")
    
    # Test with anon client
    try:
        anon_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        user_response = anon_client.auth.get_user(token)
        if user_response and user_response.user:
            print(f"✅ Anon client can verify token")
        else:
            print(f"❌ Anon client cannot verify token")
    except Exception as e:
        print(f"❌ Anon client error: {str(e)}")

if __name__ == "__main__":
    test_supabase_auth()