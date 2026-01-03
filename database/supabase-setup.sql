-- MOCARDS Database Setup for Supabase
-- Run these queries step by step in the Supabase SQL Editor

-- =====================================================
-- STEP 1: CREATE CORE TABLES
-- =====================================================

-- 1. REGIONS TABLE
CREATE TABLE regions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Philippine regions including MIMAROPA
INSERT INTO regions (code, name) VALUES
    ('CVT', 'Cavite'),
    ('BTG', 'Batangas'),
    ('LGN', 'Laguna'),
    ('MIM', 'MIMAROPA Region (Region IV-B)');

-- 2. CLINIC CODES TABLE
CREATE TABLE clinic_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL UNIQUE, -- Format: CVT001, BTG002, etc.
    is_assigned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CLINICS TABLE
CREATE TABLE clinics (
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

-- 4. USER PROFILES TABLE (extends auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'public' CHECK (role IN ('admin', 'clinic', 'public')),
    clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CARDS TABLE
CREATE TABLE cards (
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

-- 6. CARD PERKS TABLE
CREATE TABLE card_perks (
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
CREATE TABLE appointments (
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

-- 8. PERK REDEMPTIONS TABLE (Audit trail)
CREATE TABLE perk_redemptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    perk_id UUID NOT NULL REFERENCES card_perks(id) ON DELETE CASCADE,
    redeemed_by UUID NOT NULL REFERENCES auth.users(id),
    redemption_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Clinic codes indexes
CREATE INDEX idx_clinic_codes_region_id ON clinic_codes(region_id);
CREATE INDEX idx_clinic_codes_assigned ON clinic_codes(is_assigned);

-- Clinics indexes
CREATE INDEX idx_clinics_active ON clinics(is_active);
CREATE INDEX idx_clinics_name ON clinics(name);

-- User profiles indexes
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_clinic ON user_profiles(clinic_id);

-- Cards indexes
CREATE INDEX idx_cards_code ON cards(card_code);
CREATE INDEX idx_cards_clinic ON cards(clinic_id);
CREATE INDEX idx_cards_active ON cards(is_active);
CREATE INDEX idx_cards_created_at ON cards(created_at);

-- Card perks indexes
CREATE INDEX idx_card_perks_card_id ON card_perks(card_id);
CREATE INDEX idx_card_perks_redeemed ON card_perks(is_redeemed);
CREATE INDEX idx_card_perks_category ON card_perks(perk_category);

-- Appointments indexes
CREATE INDEX idx_appointments_card_id ON appointments(card_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_date ON appointments(requested_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Perk redemptions indexes
CREATE INDEX idx_perk_redemptions_perk_id ON perk_redemptions(perk_id);
CREATE INDEX idx_perk_redemptions_user ON perk_redemptions(redeemed_by);