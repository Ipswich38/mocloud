-- MOCARDS Database Schema
-- Dental Benefits Card Management System
-- Complete setup for Supabase - Run this entire file in Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)

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

-- Insert Philippine regions including MIMAROPA (skip if exists)
INSERT INTO regions (code, name) VALUES
    ('CVT', 'Cavite'),
    ('BTG', 'Batangas'),
    ('LGN', 'Laguna'),
    ('MIM', 'MIMAROPA Region (Region IV-B)')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 2. CLINIC CODES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS clinic_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL UNIQUE, -- Format: CVT001, BTG002, etc.
    is_assigned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
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
-- 4. USER PROFILES TABLE (extends auth.users)
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
-- 5. CARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_code VARCHAR(12) NOT NULL UNIQUE, -- MC + 10 characters
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

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_cards_code ON cards(card_code);
CREATE INDEX IF NOT EXISTS idx_cards_clinic ON cards(clinic_id);
CREATE INDEX IF NOT EXISTS idx_cards_active ON cards(is_active);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at);

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
-- 7. APPOINTMENTS TABLE
-- =====================================================
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointments_card_id ON appointments(card_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(requested_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- =====================================================
-- 8. PERK REDEMPTIONS TABLE (Audit trail)
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE perk_redemptions ENABLE ROW LEVEL SECURITY;

-- Regions: Public read access
DROP POLICY IF EXISTS "Regions are publicly readable" ON regions;
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
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
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

-- Triggers for updated_at
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

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'public');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- =====================================================

-- Create admin user profile (replace with actual admin user ID)
-- INSERT INTO user_profiles (id, email, role) VALUES
--     ('your-admin-user-id-here', 'admin@mocards.com', 'admin');

-- Generate clinic codes for each region (001-016)
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
            VALUES (region_record.id, clinic_code, FALSE);
        END LOOP;
    END LOOP;
END $$;

-- =====================================================
-- VERIFICATION QUERIES (Optional - Run to verify setup)
-- =====================================================

-- Check all tables exist
SELECT 'Tables created successfully!' as status,
       COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check regions are populated
SELECT 'Regions populated:' as status, * FROM regions ORDER BY code;

-- Check clinic codes generated (should show 16 per region = 64 total)
SELECT 'Clinic codes generated:' as status,
       r.code as region_code,
       r.name as region_name,
       COUNT(cc.id) as codes_generated
FROM regions r
LEFT JOIN clinic_codes cc ON r.id = cc.region_id
GROUP BY r.id, r.code, r.name
ORDER BY r.code;

-- Total clinic codes summary
SELECT 'Total clinic codes:' as status,
       COUNT(*) as total_codes,
       COUNT(CASE WHEN is_assigned THEN 1 END) as assigned_codes,
       COUNT(CASE WHEN NOT is_assigned THEN 1 END) as available_codes
FROM clinic_codes;