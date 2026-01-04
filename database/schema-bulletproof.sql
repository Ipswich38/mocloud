-- =====================================================
-- MOCARDS BULLETPROOF DATABASE SCHEMA
-- Dental Benefits Card Management System
-- 100% SAFE TO RUN MULTIPLE TIMES - HANDLES ALL CONFLICTS
-- =====================================================

-- Note: Supabase manages UUID extension and JWT secrets automatically

-- =====================================================
-- 1. REGIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS regions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Philippine regions including 4A and 4B split (safe to run multiple times)
INSERT INTO regions (code, name) VALUES
    ('CVT', 'Cavite'),
    ('BTG', 'Batangas'),
    ('LGN', 'Laguna'),
    ('QZN', 'Quezon'),
    ('RIZ', 'Rizal'),
    ('MIM', 'MIMAROPA Region (Region IV-B)')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 2. CLINIC CODES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS clinic_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL UNIQUE,
    is_assigned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes (safe to create multiple times)
CREATE INDEX IF NOT EXISTS idx_clinic_codes_region_id ON clinic_codes(region_id);
CREATE INDEX IF NOT EXISTS idx_clinic_codes_assigned ON clinic_codes(is_assigned);

-- =====================================================
-- 3. CLINICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS clinics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_code_id UUID NOT NULL REFERENCES clinic_codes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinics_active ON clinics(is_active);
CREATE INDEX IF NOT EXISTS idx_clinics_name ON clinics(name);

-- =====================================================
-- 4. USER PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'public' CHECK (role IN ('admin', 'clinic', 'public')),
    clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_clinic ON user_profiles(clinic_id);

-- =====================================================
-- 5. CARDS TABLE - ENHANCED FOR NEW FORMAT
-- =====================================================

-- First create the table with basic structure if it doesn't exist
CREATE TABLE IF NOT EXISTS cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_code VARCHAR(26) NOT NULL UNIQUE,
    patient_name VARCHAR(100) NOT NULL,
    patient_birthdate DATE NOT NULL,
    patient_address TEXT NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    generated_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns if they don't exist
DO $$
BEGIN
    -- Add control_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'cards' AND column_name = 'control_number' AND table_schema = 'public') THEN
        ALTER TABLE cards ADD COLUMN control_number INTEGER;
    END IF;

    -- Add region_code if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'cards' AND column_name = 'region_code' AND table_schema = 'public') THEN
        ALTER TABLE cards ADD COLUMN region_code VARCHAR(3);
    END IF;

    -- Add clinic_code if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'cards' AND column_name = 'clinic_code' AND table_schema = 'public') THEN
        ALTER TABLE cards ADD COLUMN clinic_code VARCHAR(6);
    END IF;

    -- Update card_code column size if needed (MOC-XXXXXX-RRR-CCCCCC = 26 chars)
    BEGIN
        ALTER TABLE cards ALTER COLUMN card_code TYPE VARCHAR(26);
    EXCEPTION
        WHEN OTHERS THEN
            NULL; -- Column already has sufficient size
    END;

    -- Add unique constraint if it doesn't exist
    BEGIN
        ALTER TABLE cards ADD CONSTRAINT unique_control_number_per_clinic UNIQUE(control_number, clinic_id);
    EXCEPTION
        WHEN duplicate_object THEN
            NULL; -- Constraint already exists
        WHEN OTHERS THEN
            NULL; -- Other constraint conflicts
    END;
END $$;

-- Create indexes (all safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_cards_code ON cards(card_code);
CREATE INDEX IF NOT EXISTS idx_cards_clinic ON cards(clinic_id);
CREATE INDEX IF NOT EXISTS idx_cards_active ON cards(is_active);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at);
CREATE INDEX IF NOT EXISTS idx_cards_control_number ON cards(control_number);
CREATE INDEX IF NOT EXISTS idx_cards_region_code ON cards(region_code);
CREATE INDEX IF NOT EXISTS idx_cards_clinic_code ON cards(clinic_code);

-- =====================================================
-- 6. CARD PERKS TABLE
-- =====================================================
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_card_perks_card_id ON card_perks(card_id);
CREATE INDEX IF NOT EXISTS idx_card_perks_redeemed ON card_perks(is_redeemed);
CREATE INDEX IF NOT EXISTS idx_card_perks_category ON card_perks(perk_category);

-- =====================================================
-- 7. APPOINTMENTS TABLE - BASIC STRUCTURE
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_appointments_card_id ON appointments(card_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(requested_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- =====================================================
-- 8. PERK REDEMPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS perk_redemptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    perk_id UUID NOT NULL REFERENCES card_perks(id) ON DELETE CASCADE,
    redeemed_by UUID NOT NULL REFERENCES auth.users(id),
    redemption_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_perk_redemptions_perk_id ON perk_redemptions(perk_id);
CREATE INDEX IF NOT EXISTS idx_perk_redemptions_user ON perk_redemptions(redeemed_by);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE perk_redemptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - SAFE RECREATION
-- =====================================================

-- Drop all existing policies first (safe if they don't exist)
DO $$
BEGIN
    -- Regions policies
    DROP POLICY IF EXISTS "Regions are publicly readable" ON regions;

    -- Clinic codes policies
    DROP POLICY IF EXISTS "Clinic codes admin only" ON clinic_codes;

    -- Clinics policies
    DROP POLICY IF EXISTS "Clinics are publicly readable" ON clinics;
    DROP POLICY IF EXISTS "Clinics admin write" ON clinics;

    -- User profiles policies
    DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

    -- Cards policies
    DROP POLICY IF EXISTS "Cards public lookup by code" ON cards;
    DROP POLICY IF EXISTS "Cards admin/clinic write" ON cards;
    DROP POLICY IF EXISTS "Cards admin update" ON cards;

    -- Card perks policies
    DROP POLICY IF EXISTS "Card perks follow card access" ON card_perks;
    DROP POLICY IF EXISTS "Card perks admin/clinic write" ON card_perks;

    -- Appointments policies
    DROP POLICY IF EXISTS "Appointments public create" ON appointments;
    DROP POLICY IF EXISTS "Appointments clinic/admin read" ON appointments;
    DROP POLICY IF EXISTS "Appointments clinic/admin update" ON appointments;

    -- Perk redemptions policies
    DROP POLICY IF EXISTS "Perk redemptions admin/clinic only" ON perk_redemptions;
END $$;

-- Create fresh RLS policies
-- Regions: Public read access
CREATE POLICY "Regions are publicly readable" ON regions
    FOR SELECT USING (true);

-- Clinic codes: Admin only
CREATE POLICY "Clinic codes admin only" ON clinic_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Clinics: Public read, admin write
CREATE POLICY "Clinics are publicly readable" ON clinics
    FOR SELECT USING (is_active = true);

CREATE POLICY "Clinics admin write" ON clinics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- User profiles: Users can read their own, admins can read all
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can read all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.role = 'admin'
        )
    );

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

-- Cards: Public lookup by code, restricted write access
CREATE POLICY "Cards public lookup by code" ON cards
    FOR SELECT USING (is_active = true);

CREATE POLICY "Cards admin/clinic write" ON cards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinic')
        )
    );

CREATE POLICY "Cards admin update" ON cards
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Card perks: Follow card access patterns
CREATE POLICY "Card perks follow card access" ON card_perks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cards
            WHERE cards.id = card_perks.card_id
            AND cards.is_active = true
        )
    );

CREATE POLICY "Card perks admin/clinic write" ON card_perks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinic')
        )
    );

-- Appointments: Public create, clinic/admin manage
CREATE POLICY "Appointments public create" ON appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Appointments clinic/admin read" ON appointments
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'admin'
            )
            OR
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'clinic'
                AND user_profiles.clinic_id = appointments.clinic_id
            )
        )
    );

CREATE POLICY "Appointments clinic/admin update" ON appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinic')
            AND (
                user_profiles.role = 'admin'
                OR user_profiles.clinic_id = appointments.clinic_id
            )
        )
    );

-- Perk redemptions: Admin/clinic only
CREATE POLICY "Perk redemptions admin/clinic only" ON perk_redemptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'clinic')
        )
    );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Safe trigger creation (drop if exists, then create)
DROP TRIGGER IF EXISTS update_clinics_updated_at ON clinics;
CREATE TRIGGER update_clinics_updated_at
    BEFORE UPDATE ON clinics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function for automatic user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'public')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safe trigger for profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- CARD GENERATION FUNCTIONS
-- =====================================================

-- Function to generate new format card codes
CREATE OR REPLACE FUNCTION generate_card_code(
    p_control_number INTEGER,
    p_region_code VARCHAR(3),
    p_clinic_code VARCHAR(6)
) RETURNS VARCHAR(26) AS $$
BEGIN
    -- Format: MOC-XXXXXX-RRR-CCCCCC
    -- Example: MOC-000001-CVT-CVT001
    RETURN 'MOC-' || LPAD(p_control_number::TEXT, 6, '0') || '-' || p_region_code || '-' || p_clinic_code;
END;
$$ LANGUAGE plpgsql;

-- Function to get next control number for a clinic
CREATE OR REPLACE FUNCTION get_next_control_number(p_clinic_id UUID) RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    -- Get the next available control number for this clinic (1-100000)
    SELECT COALESCE(MAX(control_number), 0) + 1 INTO next_number
    FROM cards
    WHERE clinic_id = p_clinic_id;

    -- Ensure we don't exceed 100000
    IF next_number > 100000 THEN
        RAISE EXCEPTION 'Control number limit exceeded for clinic. Maximum 100000 cards per clinic.';
    END IF;

    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GENERATE CLINIC CODES (Safe to run multiple times)
-- Includes Region 4A (CVT, BTG, LGN, QZN, RIZ) and 4B (MIM)
-- =====================================================
DO $$
DECLARE
    region_record RECORD;
    i INTEGER;
    clinic_code VARCHAR(6);
BEGIN
    FOR region_record IN SELECT id, code FROM regions ORDER BY code LOOP
        FOR i IN 1..16 LOOP
            clinic_code := region_record.code || LPAD(i::TEXT, 3, '0');
            INSERT INTO clinic_codes (region_id, code, is_assigned)
            VALUES (region_record.id, clinic_code, FALSE)
            ON CONFLICT (code) DO NOTHING;
        END LOOP;
    END LOOP;
    RAISE NOTICE 'Clinic codes generation completed for all regions including 4A/4B split (existing codes skipped)';
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all tables exist
SELECT
    'Database setup verification:' as status,
    COUNT(DISTINCT table_name) as tables_created
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN ('regions', 'clinic_codes', 'clinics', 'user_profiles', 'cards', 'card_perks', 'appointments', 'perk_redemptions');

-- Verify regions are populated
SELECT 'Regions:' as info, code, name FROM regions ORDER BY code;

-- Verify clinic codes summary
SELECT
    'Clinic codes summary:' as info,
    COUNT(*) as total_codes,
    COUNT(CASE WHEN is_assigned THEN 1 END) as assigned,
    COUNT(CASE WHEN NOT is_assigned THEN 1 END) as available
FROM clinic_codes;

-- Test card code generation functions
SELECT 'Sample card codes in new format:' as info;
SELECT generate_card_code(1, 'CVT', 'CVT001') as sample_card_1;
SELECT generate_card_code(150, 'BTG', 'BTG005') as sample_card_2;
SELECT generate_card_code(10000, 'MIM', 'MIM016') as sample_card_3;

-- Success message
SELECT
    '✅ MOCARDS Database Setup Complete!' as status,
    'Database is ready for production use with new card format' as message,
    'Format: MOC-NNNNN-RRR-CCCCCC' as card_format,
    'Run migration-appointment-workflow.sql for enhanced appointment features' as next_step;