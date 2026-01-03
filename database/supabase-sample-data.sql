-- MOCARDS Sample Data for Supabase
-- Run this AFTER creating tables, RLS policies, and functions

-- =====================================================
-- STEP 6: GENERATE SAMPLE DATA
-- =====================================================

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
-- OPTIONAL: SAMPLE CLINIC DATA FOR TESTING
-- =====================================================

-- Uncomment the following to create sample clinics for testing
-- (You'll need to adjust the UUIDs to match your actual region IDs)

/*
-- Sample clinic for Cavite (CVT001)
INSERT INTO clinics (clinic_code_id, name, address, contact_email, contact_phone, contact_person)
SELECT
    cc.id,
    'Healthy Smiles Dental Clinic',
    '123 Main Street, Imus, Cavite',
    'info@healthysmiles.ph',
    '+639171234567',
    'Dr. Maria Santos'
FROM clinic_codes cc
JOIN regions r ON cc.region_id = r.id
WHERE cc.code = 'CVT001';

-- Update clinic code as assigned
UPDATE clinic_codes
SET is_assigned = TRUE
WHERE code = 'CVT001';

-- Sample clinic for Batangas (BTG001)
INSERT INTO clinics (clinic_code_id, name, address, contact_email, contact_phone, contact_person)
SELECT
    cc.id,
    'Batangas Family Dental',
    '456 Rizal Avenue, Batangas City, Batangas',
    'contact@batangasdental.ph',
    '+639189876543',
    'Dr. Juan dela Cruz'
FROM clinic_codes cc
JOIN regions r ON cc.region_id = r.id
WHERE cc.code = 'BTG001';

-- Update clinic code as assigned
UPDATE clinic_codes
SET is_assigned = TRUE
WHERE code = 'BTG001';
*/

-- =====================================================
-- VIEW CREATED DATA
-- =====================================================

-- Check regions
SELECT * FROM regions ORDER BY code;

-- Check clinic codes (should show 64 total: 16 per region)
SELECT
    r.name as region_name,
    r.code as region_code,
    COUNT(cc.id) as total_codes,
    COUNT(CASE WHEN cc.is_assigned THEN 1 END) as assigned_codes
FROM regions r
LEFT JOIN clinic_codes cc ON r.id = cc.region_id
GROUP BY r.id, r.name, r.code
ORDER BY r.code;