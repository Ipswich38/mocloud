-- MOCARDS Row Level Security Policies for Supabase
-- Run this AFTER creating tables and indexes

-- =====================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE perk_redemptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: CREATE RLS POLICIES
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