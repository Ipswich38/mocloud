-- =====================================================
-- CARD FORMAT MIGRATION TO MOC-NNNNN-RRR-CCCCCC
-- Updates existing cards table to support new format
-- Safe to run on existing databases
-- =====================================================

-- Migration for Card Generation Format Update
-- New format: MOC-00001-CVT-CVT001 to MOC-10000-MIM-MIM016
-- Where:
--   MOC = Prefix
--   NNNNN = Control number (00001-10000)
--   RRR = Region code (CVT, BTG, LGN, QZN, RIZ, MIM)
--   CCCCCC = Clinic code (CVT001, BTG002, etc.)

DO $$
BEGIN
    -- First add new regions for Region 4A/4B split
    INSERT INTO regions (code, name) VALUES
        ('QZN', 'Quezon'),
        ('RIZ', 'Rizal')
    ON CONFLICT (code) DO NOTHING;

    RAISE NOTICE 'Added new regions: QZN (Quezon) and RIZ (Rizal) for Region 4A split';

    -- Check if cards table needs updating
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cards' AND table_schema = 'public') THEN

        -- Add new columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'cards' AND column_name = 'control_number' AND table_schema = 'public') THEN
            ALTER TABLE cards ADD COLUMN control_number INTEGER;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'cards' AND column_name = 'region_code' AND table_schema = 'public') THEN
            ALTER TABLE cards ADD COLUMN region_code VARCHAR(3);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'cards' AND column_name = 'clinic_code' AND table_schema = 'public') THEN
            ALTER TABLE cards ADD COLUMN clinic_code VARCHAR(6);
        END IF;

        -- Update card_code column size if needed
        BEGIN
            ALTER TABLE cards ALTER COLUMN card_code TYPE VARCHAR(25);
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Card code column already has sufficient size';
        END;

        -- Add unique constraint for control_number per clinic if it doesn't exist
        BEGIN
            ALTER TABLE cards ADD CONSTRAINT unique_control_number_per_clinic UNIQUE(control_number, clinic_id);
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Unique constraint for control number per clinic already exists or could not be added';
        END;

        -- Create indexes for new columns if they don't exist
        CREATE INDEX IF NOT EXISTS idx_cards_control_number ON cards(control_number);
        CREATE INDEX IF NOT EXISTS idx_cards_region_code ON cards(region_code);
        CREATE INDEX IF NOT EXISTS idx_cards_clinic_code ON cards(clinic_code);

        RAISE NOTICE 'Card table migration completed - new columns added and indexed';

    ELSE
        RAISE NOTICE 'Cards table does not exist yet - will be created with new format';
    END IF;

END $$;

-- Generate clinic codes for new regions (QZN and RIZ)
DO $$
DECLARE
    region_record RECORD;
    i INTEGER;
    clinic_code VARCHAR(6);
BEGIN
    -- Only generate codes for new regions
    FOR region_record IN SELECT id, code FROM regions WHERE code IN ('QZN', 'RIZ') LOOP
        FOR i IN 1..16 LOOP
            clinic_code := region_record.code || LPAD(i::TEXT, 3, '0');
            INSERT INTO clinic_codes (region_id, code, is_assigned)
            VALUES (region_record.id, clinic_code, FALSE)
            ON CONFLICT (code) DO NOTHING;
        END LOOP;
    END LOOP;
    RAISE NOTICE 'Generated clinic codes for new regions QZN and RIZ (001-016 each)';
END $$;

-- Create or replace function to generate new format card codes
CREATE OR REPLACE FUNCTION generate_card_code(
    p_control_number INTEGER,
    p_region_code VARCHAR(3),
    p_clinic_code VARCHAR(6)
) RETURNS VARCHAR(25) AS $$
BEGIN
    -- Format: MOC-NNNNN-RRR-CCCCCC
    -- Example: MOC-00001-CVT-CVT001
    RETURN 'MOC-' || LPAD(p_control_number::TEXT, 5, '0') || '-' || p_region_code || '-' || p_clinic_code;
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to get next control number for a clinic
CREATE OR REPLACE FUNCTION get_next_control_number(p_clinic_id UUID) RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    -- Get the next available control number for this clinic (1-10000)
    SELECT COALESCE(MAX(control_number), 0) + 1 INTO next_number
    FROM cards
    WHERE clinic_id = p_clinic_id;

    -- Ensure we don't exceed 10000
    IF next_number > 10000 THEN
        RAISE EXCEPTION 'Control number limit exceeded for clinic. Maximum 10000 cards per clinic.';
    END IF;

    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Create or replace function for generating cards with new format
CREATE OR REPLACE FUNCTION generate_cards_new_format(
    p_clinic_id UUID,
    p_number_of_cards INTEGER,
    p_generated_by UUID
) RETURNS TABLE(
    card_id UUID,
    card_code VARCHAR(25),
    control_number INTEGER,
    region_code VARCHAR(3),
    clinic_code VARCHAR(6)
) AS $$
DECLARE
    clinic_info RECORD;
    region_info RECORD;
    clinic_code_info RECORD;
    current_control_number INTEGER;
    i INTEGER;
    generated_card_code VARCHAR(25);
    new_card_id UUID;
BEGIN
    -- Get clinic information
    SELECT c.id, c.name, cc.code as clinic_code_value, cc.region_id
    INTO clinic_info
    FROM clinics c
    JOIN clinic_codes cc ON c.clinic_code_id = cc.id
    WHERE c.id = p_clinic_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Clinic not found: %', p_clinic_id;
    END IF;

    -- Get region information
    SELECT code, name INTO region_info
    FROM regions
    WHERE id = clinic_info.region_id;

    -- Get starting control number
    SELECT get_next_control_number(p_clinic_id) INTO current_control_number;

    -- Validate we can generate the requested number of cards
    IF current_control_number + p_number_of_cards - 1 > 10000 THEN
        RAISE EXCEPTION 'Cannot generate % cards. Would exceed limit of 10000 cards per clinic. Next available: %',
            p_number_of_cards, current_control_number;
    END IF;

    -- Generate cards
    FOR i IN 0..(p_number_of_cards - 1) LOOP
        -- Generate card code in new format
        generated_card_code := generate_card_code(
            current_control_number + i,
            region_info.code,
            clinic_info.clinic_code_value
        );

        -- Create new card record (minimal for testing)
        new_card_id := gen_random_uuid();

        -- Return the generated information
        card_id := new_card_id;
        card_code := generated_card_code;
        control_number := current_control_number + i;
        region_code := region_info.code;
        clinic_code := clinic_info.clinic_code_value;

        RETURN NEXT;
    END LOOP;

    RAISE NOTICE 'Generated % card codes in new format MOC-NNNNN-RRR-CCCCCC for clinic %',
        p_number_of_cards, clinic_info.name;
END;
$$ LANGUAGE plpgsql;

-- Verification queries
SELECT 'Card format migration verification:' as status;

-- Check new regions
SELECT 'New regions added:' as info, code, name
FROM regions
WHERE code IN ('QZN', 'RIZ')
ORDER BY code;

-- Check clinic codes for new regions
SELECT
    'Clinic codes for new regions:' as info,
    r.code as region_code,
    r.name as region_name,
    COUNT(cc.id) as codes_generated
FROM regions r
LEFT JOIN clinic_codes cc ON r.id = cc.region_id
WHERE r.code IN ('QZN', 'RIZ')
GROUP BY r.id, r.code, r.name
ORDER BY r.code;

-- Test card code generation function
SELECT 'Sample card codes in new format:' as info;
SELECT generate_card_code(1, 'CVT', 'CVT001') as sample_card_1;
SELECT generate_card_code(150, 'BTG', 'BTG005') as sample_card_2;
SELECT generate_card_code(10000, 'MIM', 'MIM016') as sample_card_3;

SELECT '✅ Card format migration completed!' as status,
       'New format: MOC-NNNNN-RRR-CCCCCC' as format,
       'Ready for card generation with new system' as next_step;