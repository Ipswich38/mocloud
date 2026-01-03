-- =====================================================
-- 🚀 MOCARDS CLOUD DEPLOYMENT SCHEMA FOR SUPABASE
-- Complete setup for production deployment
-- Run this in your Supabase SQL Editor for full functionality
-- =====================================================

-- Enable required extensions (Supabase handles most of these automatically)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CORE TABLES - Base MOCARDS Schema
-- =====================================================

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Philippine regions
INSERT INTO regions (code, name) VALUES
    ('CVT', 'Cavite'),
    ('BTG', 'Batangas'),
    ('LGN', 'Laguna'),
    ('MIM', 'MIMAROPA Region (Region IV-B)')
ON CONFLICT (code) DO NOTHING;

-- Clinic codes table
CREATE TABLE IF NOT EXISTS clinic_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL UNIQUE,
    is_assigned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinics table
CREATE TABLE IF NOT EXISTS clinics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_code_id UUID REFERENCES clinic_codes(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'public' CHECK (role IN ('admin', 'clinic', 'public')),
    clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ENHANCED CARDS SYSTEM FOR MOC GENERATION
-- =====================================================

-- Card batches table for tracking bulk generation
CREATE TABLE IF NOT EXISTS card_batches (
    id VARCHAR(50) PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    batch_name VARCHAR(100) NOT NULL,
    total_cards INTEGER NOT NULL CHECK (total_cards > 0 AND total_cards <= 10000),
    generated_cards INTEGER DEFAULT 0 CHECK (generated_cards >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    prefix VARCHAR(5) NOT NULL DEFAULT 'MOC',
    template_data JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Enhanced cards table with MOC control numbers
CREATE TABLE IF NOT EXISTS cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Legacy fields (maintain compatibility)
    card_code VARCHAR(12) UNIQUE,
    patient_name VARCHAR(100),
    patient_birthdate DATE,
    patient_address TEXT,
    patient_phone VARCHAR(20),

    -- Enhanced MOC fields
    control_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    birth_date DATE NOT NULL,
    address TEXT NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    emergency_contact VARCHAR(20) NOT NULL,

    -- Card management
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    category_id UUID,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'expired')),

    -- Perks system
    perks_total INTEGER DEFAULT 10 CHECK (perks_total >= 0),
    perks_used INTEGER DEFAULT 0 CHECK (perks_used >= 0),

    -- Dates and metadata
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 years'),
    qr_code_data TEXT,
    tenant_id UUID REFERENCES clinics(id),
    metadata JSONB DEFAULT '{}',
    batch_id VARCHAR(50) REFERENCES card_batches(id),

    -- Audit fields
    generated_by UUID NOT NULL REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card perks table
CREATE TABLE IF NOT EXISTS card_perks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    perk_name VARCHAR(100) NOT NULL,
    perk_description TEXT NOT NULL,
    perk_category VARCHAR(50) NOT NULL,
    is_redeemed BOOLEAN DEFAULT FALSE,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    redeemed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card exports table for tracking downloads
CREATE TABLE IF NOT EXISTS card_exports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL REFERENCES card_batches(id) ON DELETE CASCADE,
    export_type VARCHAR(20) DEFAULT 'csv' CHECK (export_type IN ('csv', 'xlsx', 'pdf')),
    file_name VARCHAR(200) NOT NULL,
    file_size BIGINT,
    exported_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card history table for audit trail
CREATE TABLE IF NOT EXISTS card_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    batch_id VARCHAR(50) REFERENCES card_batches(id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('created', 'updated', 'deactivated', 'reactivated')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perk redemptions table
CREATE TABLE IF NOT EXISTS perk_redemptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    perk_id UUID NOT NULL REFERENCES card_perks(id) ON DELETE CASCADE,
    redeemed_by UUID NOT NULL REFERENCES auth.users(id),
    redemption_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. PERFORMANCE INDEXES
-- =====================================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_clinic_codes_region_id ON clinic_codes(region_id);
CREATE INDEX IF NOT EXISTS idx_clinic_codes_assigned ON clinic_codes(is_assigned);
CREATE INDEX IF NOT EXISTS idx_clinics_active ON clinics(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_clinic ON user_profiles(clinic_id);

-- Card system indexes
CREATE INDEX IF NOT EXISTS idx_card_batches_clinic_id ON card_batches(clinic_id);
CREATE INDEX IF NOT EXISTS idx_card_batches_status ON card_batches(status);
CREATE INDEX IF NOT EXISTS idx_card_batches_created_at ON card_batches(created_at);

CREATE INDEX IF NOT EXISTS idx_cards_control_number ON cards(control_number);
CREATE INDEX IF NOT EXISTS idx_cards_card_code ON cards(card_code);
CREATE INDEX IF NOT EXISTS idx_cards_clinic ON cards(clinic_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_batch_id ON cards(batch_id);
CREATE INDEX IF NOT EXISTS idx_cards_issue_date ON cards(issue_date);
CREATE INDEX IF NOT EXISTS idx_cards_expiry_date ON cards(expiry_date);

CREATE INDEX IF NOT EXISTS idx_card_perks_card_id ON card_perks(card_id);
CREATE INDEX IF NOT EXISTS idx_card_perks_redeemed ON card_perks(is_redeemed);

-- =====================================================
-- 4. DATABASE FUNCTIONS FOR MOC CARD GENERATION
-- =====================================================

-- Generate unique control number with exact format
CREATE OR REPLACE FUNCTION generate_control_number(
    p_prefix VARCHAR(5) DEFAULT 'MOC',
    p_sequence INTEGER DEFAULT 1
) RETURNS VARCHAR(50) AS $$
DECLARE
    v_timestamp BIGINT;
    v_sequence VARCHAR(4);
    v_random VARCHAR(6);
    v_control_number VARCHAR(50);
    v_counter INTEGER := 0;
BEGIN
    -- Generate timestamp in milliseconds
    v_timestamp := EXTRACT(EPOCH FROM NOW()) * 1000;
    v_sequence := LPAD(p_sequence::TEXT, 4, '0');

    -- Loop until unique control number is generated
    LOOP
        -- Generate random 6-character suffix
        v_random := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));

        -- Construct control number: PREFIX-TIMESTAMP-SEQUENCE-RANDOM
        v_control_number := p_prefix || '-' || v_timestamp::TEXT || '-' || v_sequence || '-' || v_random;

        -- Check uniqueness
        IF NOT EXISTS (SELECT 1 FROM cards WHERE control_number = v_control_number) THEN
            RETURN v_control_number;
        END IF;

        -- Prevent infinite loop
        v_counter := v_counter + 1;
        IF v_counter > 1000 THEN
            RAISE EXCEPTION 'Failed to generate unique control number after 1000 attempts';
        END IF;

        -- Increment timestamp slightly for next attempt
        v_timestamp := v_timestamp + v_counter;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Validate card generation request
CREATE OR REPLACE FUNCTION validate_generation_request(
    p_clinic_id UUID,
    p_count INTEGER,
    p_prefix VARCHAR(5) DEFAULT 'MOC'
) RETURNS JSONB AS $$
DECLARE
    v_clinic_exists BOOLEAN;
    v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check clinic exists and is active
    SELECT EXISTS(SELECT 1 FROM clinics WHERE id = p_clinic_id AND is_active = true)
    INTO v_clinic_exists;

    IF NOT v_clinic_exists THEN
        v_errors := array_append(v_errors, 'Clinic not found or inactive');
    END IF;

    -- Validate count range
    IF p_count < 1 OR p_count > 10000 THEN
        v_errors := array_append(v_errors, 'Card count must be between 1 and 10,000');
    END IF;

    -- Validate prefix format
    IF LENGTH(p_prefix) < 2 OR LENGTH(p_prefix) > 5 THEN
        v_errors := array_append(v_errors, 'Prefix must be 2-5 characters');
    END IF;

    IF p_prefix !~ '^[A-Z]+$' THEN
        v_errors := array_append(v_errors, 'Prefix must contain only uppercase letters');
    END IF;

    -- Return validation result
    RETURN jsonb_build_object(
        'is_valid', array_length(v_errors, 1) IS NULL,
        'errors', COALESCE(array_to_json(v_errors), '[]'::json)
    );
END;
$$ LANGUAGE plpgsql;

-- Update batch progress
CREATE OR REPLACE FUNCTION update_batch_progress(
    p_batch_id VARCHAR(50),
    p_generated_cards INTEGER,
    p_status VARCHAR(20) DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE card_batches
    SET
        generated_cards = p_generated_cards,
        status = COALESCE(p_status, status),
        completed_at = CASE
            WHEN p_status = 'completed' THEN NOW()
            ELSE completed_at
        END
    WHERE id = p_batch_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGERS AND AUTOMATION
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_clinics_updated_at
    BEFORE UPDATE ON clinics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile on Supabase auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'public');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Card history tracking
CREATE OR REPLACE FUNCTION track_card_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_action VARCHAR(20);
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_action := 'created';
        INSERT INTO card_history (card_id, batch_id, action, new_values, changed_by)
        VALUES (NEW.id, NEW.batch_id, v_action, to_jsonb(NEW), NEW.generated_by);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := CASE
            WHEN OLD.is_active = true AND NEW.is_active = false THEN 'deactivated'
            WHEN OLD.is_active = false AND NEW.is_active = true THEN 'reactivated'
            ELSE 'updated'
        END;
        INSERT INTO card_history (card_id, batch_id, action, old_values, new_values, changed_by)
        VALUES (NEW.id, NEW.batch_id, v_action, to_jsonb(OLD), to_jsonb(NEW), NEW.generated_by);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER card_history_trigger
    AFTER INSERT OR UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION track_card_changes();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE perk_redemptions ENABLE ROW LEVEL SECURITY;

-- Regions: Public read access
DROP POLICY IF EXISTS "Regions are publicly readable" ON regions;
CREATE POLICY "Regions are publicly readable" ON regions
    FOR SELECT USING (true);

-- User profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Clinics: Public read, admin write
DROP POLICY IF EXISTS "Clinics are publicly readable" ON clinics;
CREATE POLICY "Clinics are publicly readable" ON clinics
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage clinics" ON clinics;
CREATE POLICY "Admins can manage clinics" ON clinics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Card batches: Admin only
DROP POLICY IF EXISTS "Admins can manage batches" ON card_batches;
CREATE POLICY "Admins can manage batches" ON card_batches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Cards: Public lookup, admin/clinic manage
DROP POLICY IF EXISTS "Cards public lookup" ON cards;
CREATE POLICY "Cards public lookup" ON cards
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage all cards" ON cards;
CREATE POLICY "Admins can manage all cards" ON cards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Card perks: Follow card access
DROP POLICY IF EXISTS "Card perks follow card access" ON card_perks;
CREATE POLICY "Card perks follow card access" ON card_perks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cards
            WHERE cards.id = card_perks.card_id
            AND cards.is_active = true
        )
    );

-- Appointments: Public create, clinic/admin manage
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
CREATE POLICY "Anyone can create appointments" ON appointments
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Clinic staff can view their appointments" ON appointments;
CREATE POLICY "Clinic staff can view their appointments" ON appointments
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE user_profiles.id = auth.uid()
                AND (
                    user_profiles.role = 'admin'
                    OR (user_profiles.role = 'clinic' AND user_profiles.clinic_id = appointments.clinic_id)
                )
            )
        )
    );

-- =====================================================
-- 7. ADMIN SETUP AND SAMPLE DATA
-- =====================================================

-- Create instant admin (modify UUID and email as needed)
INSERT INTO user_profiles (id, username, display_name, email, role)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'admin',
    'System Administrator',
    'admin@mocards.com',
    'admin'
) ON CONFLICT (username) DO UPDATE SET
    role = 'admin',
    display_name = 'System Administrator',
    email = 'admin@mocards.com';

-- Generate clinic codes for all regions
DO $$
DECLARE
    region_record RECORD;
    i INTEGER;
    clinic_code VARCHAR(6);
BEGIN
    FOR region_record IN SELECT id, code FROM regions LOOP
        FOR i IN 1..16 LOOP
            clinic_code := region_record.code || LPAD(i::TEXT, 3, '0');
            INSERT INTO clinic_codes (region_id, code, is_assigned)
            VALUES (region_record.id, clinic_code, FALSE)
            ON CONFLICT (code) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Create sample clinics for testing
INSERT INTO clinics (name, address, contact_email, contact_phone, contact_person, is_active)
VALUES
    ('SmileCare Dental Cavite', 'Dasmarinas, Cavite', 'info@smilecare-cavite.com', '+639171234567', 'Dr. Maria Santos', true),
    ('Bright Dental Batangas', 'Lipa City, Batangas', 'contact@bright-batangas.com', '+639181234567', 'Dr. Juan Cruz', true),
    ('Pearl White Dental Laguna', 'Santa Rosa, Laguna', 'hello@pearlwhite-laguna.com', '+639191234567', 'Dr. Ana Reyes', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. VERIFICATION AND STATUS CHECK
-- =====================================================

-- Verify complete setup
SELECT
    '🚀 MOCARDS Cloud Deployment Complete!' as status,
    COUNT(CASE WHEN table_name = 'regions' THEN 1 END) as regions_table,
    COUNT(CASE WHEN table_name = 'clinics' THEN 1 END) as clinics_table,
    COUNT(CASE WHEN table_name = 'cards' THEN 1 END) as cards_table,
    COUNT(CASE WHEN table_name = 'card_batches' THEN 1 END) as card_batches_table,
    COUNT(CASE WHEN table_name = 'user_profiles' THEN 1 END) as user_profiles_table
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('regions', 'clinics', 'cards', 'card_batches', 'user_profiles');

-- Test control number generation
SELECT
    '✅ Control Number Test:' as test,
    generate_control_number('MOC', 1) as sample_moc_number,
    generate_control_number('CARD', 1) as sample_card_number;

-- Show admin status
SELECT
    '✅ Admin Status:' as admin_check,
    CASE
        WHEN username = 'admin' AND role = 'admin'
        THEN '✅ Admin ready! Use Supabase Auth to create admin user'
        ELSE '❌ Please create admin user in Supabase Auth'
    END as status
FROM user_profiles
WHERE username = 'admin'
LIMIT 1;

-- Show available clinic codes
SELECT
    '📋 Available Clinic Codes:' as summary,
    r.name as region,
    COUNT(cc.id) as total_codes,
    COUNT(CASE WHEN cc.is_assigned THEN 1 END) as assigned,
    COUNT(CASE WHEN NOT cc.is_assigned THEN 1 END) as available
FROM regions r
LEFT JOIN clinic_codes cc ON r.id = cc.region_id
GROUP BY r.id, r.name
ORDER BY r.code;

-- Final success message
SELECT '🎉 READY FOR CARD GENERATION! Visit /admin/cards/generate to start.' as final_message;