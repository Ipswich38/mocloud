-- MOCARDS Database Schema - SAFE VERSION
-- Dental Benefits Card Management System
-- Safe to run multiple times - handles existing objects gracefully

-- =====================================================
-- CLEANUP EXISTING POLICIES (if any)
-- =====================================================
DO $$
BEGIN
    -- Drop all existing policies (safe if they don't exist)
    DROP POLICY IF EXISTS "Regions are publicly readable" ON regions;
    DROP POLICY IF EXISTS "Clinic codes admin only" ON clinic_codes;
    DROP POLICY IF EXISTS "Clinics are publicly readable" ON clinics;
    DROP POLICY IF EXISTS "Clinics admin write" ON clinics;
    DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Cards public lookup by code" ON cards;
    DROP POLICY IF EXISTS "Cards admin/clinic write" ON cards;
    DROP POLICY IF EXISTS "Cards admin update" ON cards;
    DROP POLICY IF EXISTS "Card perks follow card access" ON card_perks;
    DROP POLICY IF EXISTS "Card perks admin/clinic write" ON card_perks;
    DROP POLICY IF EXISTS "Appointments public create" ON appointments;
    DROP POLICY IF EXISTS "Appointments clinic/admin read" ON appointments;
    DROP POLICY IF EXISTS "Appointments clinic/admin update" ON appointments;
    DROP POLICY IF EXISTS "Perk redemptions admin/clinic only" ON perk_redemptions;
EXCEPTION
    WHEN others THEN NULL; -- Ignore errors if policies don't exist
END $$;

-- =====================================================
-- CREATE TABLES (safe)
-- =====================================================

-- 1. REGIONS TABLE
CREATE TABLE IF NOT EXISTS regions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CLINIC CODES TABLE
CREATE TABLE IF NOT EXISTS clinic_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL UNIQUE,
    is_assigned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CLINICS TABLE
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

-- 4. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'public' CHECK (role IN ('admin', 'clinic', 'public')),
    clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CARDS TABLE
CREATE TABLE IF NOT EXISTS cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_code VARCHAR(12) NOT NULL UNIQUE,
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

-- 6. CARD PERKS TABLE
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

-- 7. APPOINTMENTS TABLE
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

-- 8. PERK REDEMPTIONS TABLE
CREATE TABLE IF NOT EXISTS perk_redemptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    perk_id UUID NOT NULL REFERENCES card_perks(id) ON DELETE CASCADE,
    redeemed_by UUID NOT NULL REFERENCES auth.users(id),
    redemption_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES (safe)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_clinic_codes_region_id ON clinic_codes(region_id);
CREATE INDEX IF NOT EXISTS idx_clinic_codes_assigned ON clinic_codes(is_assigned);
CREATE INDEX IF NOT EXISTS idx_clinics_active ON clinics(is_active);
CREATE INDEX IF NOT EXISTS idx_clinics_name ON clinics(name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_clinic ON user_profiles(clinic_id);
CREATE INDEX IF NOT EXISTS idx_cards_code ON cards(card_code);
CREATE INDEX IF NOT EXISTS idx_cards_clinic ON cards(clinic_id);
CREATE INDEX IF NOT EXISTS idx_cards_active ON cards(is_active);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at);
CREATE INDEX IF NOT EXISTS idx_card_perks_card_id ON card_perks(card_id);
CREATE INDEX IF NOT EXISTS idx_card_perks_redeemed ON card_perks(is_redeemed);
CREATE INDEX IF NOT EXISTS idx_card_perks_category ON card_perks(perk_category);
CREATE INDEX IF NOT EXISTS idx_appointments_card_id ON appointments(card_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(requested_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_perk_redemptions_perk_id ON perk_redemptions(perk_id);
CREATE INDEX IF NOT EXISTS idx_perk_redemptions_user ON perk_redemptions(redeemed_by);

-- =====================================================
-- INSERT DATA (safe)
-- =====================================================

-- Insert regions (skip duplicates)
INSERT INTO regions (code, name) VALUES
    ('CVT', 'Cavite'),
    ('BTG', 'Batangas'),
    ('LGN', 'Laguna'),
    ('MIM', 'MIMAROPA Region (Region IV-B)')
ON CONFLICT (code) DO NOTHING;

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
-- CREATE RLS POLICIES
-- =====================================================

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

-- Drop existing triggers (safe)
DROP TRIGGER IF EXISTS update_clinics_updated_at ON clinics;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create triggers
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
-- GENERATE CLINIC CODES (safe)
-- =====================================================
DO $$
DECLARE
    region_record RECORD;
    i INTEGER;
    clinic_code VARCHAR(6);
BEGIN
    -- Only generate if clinic_codes table is empty
    IF NOT EXISTS (SELECT 1 FROM clinic_codes LIMIT 1) THEN
        FOR region_record IN SELECT id, code FROM regions LOOP
            FOR i IN 1..16 LOOP
                clinic_code := region_record.code || LPAD(i::TEXT, 3, '0');
                INSERT INTO clinic_codes (region_id, code, is_assigned)
                VALUES (region_record.id, clinic_code, FALSE);
            END LOOP;
        END LOOP;
    END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
SELECT 'Setup completed successfully!' as status;

SELECT 'Tables:' as info, COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT 'Regions:' as info, COUNT(*) as count FROM regions;

SELECT 'Clinic codes:' as info, COUNT(*) as total,
       COUNT(CASE WHEN is_assigned THEN 1 END) as assigned,
       COUNT(CASE WHEN NOT is_assigned THEN 1 END) as available
FROM clinic_codes;