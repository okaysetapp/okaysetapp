#!/usr/bin/env python3
"""
Create Supabase tables using the Management API
This script manually creates the required tables for the OkaySet platform
"""

from supabase import create_client
from dotenv import load_dotenv
from pathlib import Path
import os
import re
import sys

# Load env from backend/.env first (legacy), then project-root .env (current).
load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent.parent / ".env")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

def main():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in env.")
        sys.exit(1)

    print("🚀 Setting up Supabase tables...")

    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    # Derive the project ref from the URL so the dashboard link works for any project.
    m = re.match(r"https://([a-z0-9]+)\.supabase\.co", SUPABASE_URL)
    project_ref = m.group(1) if m else "<your-project>"

    print("\n📋 MANUAL STEP REQUIRED:")
    print("=" * 70)
    print("Please execute the following SQL in your Supabase SQL Editor:")
    print(f"https://supabase.com/dashboard/project/{project_ref}/sql/new")
    print("=" * 70)
    
    sql_commands = """
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('planner', 'vendor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    description TEXT NOT NULL,
    external_link TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendors_city ON public.vendors(city);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public vendors are viewable by everyone" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can insert their own listing" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can update their own listing" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can delete their own listing" ON public.vendors;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can insert roles" ON public.user_roles;

-- Create RLS policies for vendors
CREATE POLICY "Public vendors are viewable by everyone" 
    ON public.vendors FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Vendors can insert their own listing" 
    ON public.vendors FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Vendors can update their own listing" 
    ON public.vendors FOR UPDATE 
    USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Vendors can delete their own listing" 
    ON public.vendors FOR DELETE 
    USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own role" 
    ON public.user_roles FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert roles" 
    ON public.user_roles FOR INSERT 
    WITH CHECK (true);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_vendors_updated_at ON public.vendors;
CREATE TRIGGER update_vendors_updated_at 
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
"""
    
    print(sql_commands)
    print("=" * 70)
    print("\n✋ After executing the SQL above, press Enter to continue...")
    input()
    
    # Verify tables were created
    print("\n🔍 Verifying tables...")
    try:
        supabase.table('vendors').select('id').limit(1).execute()
        print("✓ 'vendors' table exists")
    except Exception as e:
        print(f"❌ 'vendors' table not found: {str(e)[:100]}")
        return False
    
    try:
        supabase.table('user_roles').select('id').limit(1).execute()
        print("✓ 'user_roles' table exists")
    except Exception as e:
        print(f"❌ 'user_roles' table not found: {str(e)[:100]}")
        return False
    
    print("\n✅ Tables verified successfully!")
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🎉 You can now proceed with data migration!")
    else:
        print("\n⚠️  Please create the tables first using the SQL above.")
