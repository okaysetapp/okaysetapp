-- ============================================================================
-- OkaySet — Supabase schema
-- ----------------------------------------------------------------------------
-- Reconstructed from the runtime code in backend/server.py + google_lookup.py.
-- Two tables only — vendors and user_roles. Authentication itself uses
-- Supabase's managed auth.users table; this file does not touch it.
--
-- Idempotent: every CREATE/ALTER is guarded so you can re-run the file
-- safely against the same project (useful during dev / staging refresh).
-- ============================================================================

-- Required extension for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================================
-- vendors
-- ----------------------------------------------------------------------------
-- One row per business listing.
-- user_id is nullable on purpose: admins create vendors via /api/admin/vendors
-- with user_id = NULL (those listings aren't owned by an end-user account).
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vendors (
    id              UUID                     PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID                     REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name   TEXT                     NOT NULL,
    category        TEXT                     NOT NULL,
    city            TEXT                     NOT NULL,
    address         TEXT                     NOT NULL,
    phone           TEXT                     NOT NULL,
    description     TEXT                     NOT NULL,
    external_link   TEXT,
    latitude        DOUBLE PRECISION         NOT NULL,
    longitude       DOUBLE PRECISION         NOT NULL,
    is_active       BOOLEAN                  DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_city     ON public.vendors(city);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id  ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_location ON public.vendors(latitude, longitude);


-- ============================================================================
-- user_roles
-- ----------------------------------------------------------------------------
-- Maps a Supabase auth user to one of three application roles. The backend
-- queries this with .single(), so user_id is UNIQUE.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    id          UUID                     PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID                     REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role        TEXT                     NOT NULL CHECK (role IN ('planner', 'vendor', 'admin')),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);


-- ============================================================================
-- Row-Level Security
-- ----------------------------------------------------------------------------
-- The backend uses the SUPABASE_SERVICE_KEY which bypasses RLS, so policies
-- only matter for direct anon-key access from the frontend (currently used
-- only for public vendor reads via Supabase JS, if at all).
-- ============================================================================
ALTER TABLE public.vendors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- vendors policies
DROP POLICY IF EXISTS "Public vendors are viewable by everyone" ON public.vendors;
CREATE POLICY "Public vendors are viewable by everyone" ON public.vendors
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Vendors can insert their own listing" ON public.vendors;
CREATE POLICY "Vendors can insert their own listing" ON public.vendors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendors can update their own listing" ON public.vendors;
CREATE POLICY "Vendors can update their own listing" ON public.vendors
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendors can delete their own listing" ON public.vendors;
CREATE POLICY "Vendors can delete their own listing" ON public.vendors
    FOR DELETE USING (auth.uid() = user_id);

-- user_roles policies
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert roles" ON public.user_roles;
CREATE POLICY "Service role can insert roles" ON public.user_roles
    FOR INSERT WITH CHECK (TRUE);


-- ============================================================================
-- updated_at auto-touch trigger for vendors
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vendors_updated_at ON public.vendors;
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
