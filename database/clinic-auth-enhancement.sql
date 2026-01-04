-- =====================================================
-- 🏥 CLINIC AUTHENTICATION ENHANCEMENT
-- Adds secure clinic credential management
-- =====================================================

-- Add clinic credentials table
CREATE TABLE IF NOT EXISTS clinic_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
    must_change_password BOOLEAN DEFAULT TRUE,
    last_password_change TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL, -- admin who created it
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_clinic_username UNIQUE(clinic_id, username)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clinic_credentials_clinic_id ON clinic_credentials(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_credentials_username ON clinic_credentials(username);

-- Add clinic activity logging
CREATE TABLE IF NOT EXISTS clinic_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES clinic_credentials(id),
    action VARCHAR(50) NOT NULL, -- login, logout, password_change, etc
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for activity log
CREATE INDEX IF NOT EXISTS idx_clinic_activity_clinic_id ON clinic_activity_log(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_activity_created_at ON clinic_activity_log(created_at);

-- Function to hash passwords (for demo - in production use proper bcrypt)
CREATE OR REPLACE FUNCTION hash_password(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Simple demo hash - in production use bcrypt
    RETURN encode(digest(plain_password || 'mocards_salt_2025', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to create clinic credentials
CREATE OR REPLACE FUNCTION create_clinic_credentials(
    p_clinic_id UUID,
    p_username VARCHAR(50),
    p_password TEXT,
    p_created_by UUID
)
RETURNS JSONB AS $$
DECLARE
    v_password_hash VARCHAR(255);
    v_credential_id UUID;
    v_clinic_exists BOOLEAN;
BEGIN
    -- Check if clinic exists
    SELECT EXISTS(SELECT 1 FROM clinics WHERE id = p_clinic_id)
    INTO v_clinic_exists;

    IF NOT v_clinic_exists THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Clinic not found'
        );
    END IF;

    -- Hash the password
    v_password_hash := hash_password(p_password);

    -- Insert credentials
    INSERT INTO clinic_credentials (clinic_id, username, password_hash, created_by)
    VALUES (p_clinic_id, p_username, v_password_hash, p_created_by)
    RETURNING id INTO v_credential_id;

    RETURN jsonb_build_object(
        'success', true,
        'credential_id', v_credential_id,
        'username', p_username,
        'clinic_id', p_clinic_id
    );
EXCEPTION
    WHEN unique_violation THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Username already exists'
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to create credentials: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- Function to verify clinic login
CREATE OR REPLACE FUNCTION verify_clinic_login(
    p_username VARCHAR(50),
    p_password TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_credential_record RECORD;
    v_clinic_record RECORD;
    v_password_hash VARCHAR(255);
    v_is_locked BOOLEAN := FALSE;
BEGIN
    -- Hash the provided password
    v_password_hash := hash_password(p_password);

    -- Get credential record with clinic info
    SELECT cc.*, c.name as clinic_name, c.is_active as clinic_active
    INTO v_credential_record
    FROM clinic_credentials cc
    JOIN clinics c ON cc.clinic_id = c.id
    WHERE cc.username = p_username;

    IF NOT FOUND THEN
        -- Log failed attempt
        INSERT INTO clinic_activity_log (clinic_id, action, success, notes)
        VALUES (NULL, 'login_attempt', false, 'Username not found: ' || p_username);

        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid username or password'
        );
    END IF;

    -- Check if account is locked
    IF v_credential_record.locked_until IS NOT NULL AND v_credential_record.locked_until > NOW() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Account is temporarily locked. Try again later.'
        );
    END IF;

    -- Check if clinic is active
    IF NOT v_credential_record.clinic_active THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Clinic account is inactive'
        );
    END IF;

    -- Verify password
    IF v_credential_record.password_hash = v_password_hash THEN
        -- Reset failed attempts and unlock
        UPDATE clinic_credentials
        SET failed_login_attempts = 0, locked_until = NULL
        WHERE id = v_credential_record.id;

        -- Log successful login
        INSERT INTO clinic_activity_log (clinic_id, user_id, action, success)
        VALUES (v_credential_record.clinic_id, v_credential_record.id, 'login', true);

        RETURN jsonb_build_object(
            'success', true,
            'clinic_id', v_credential_record.clinic_id,
            'username', v_credential_record.username,
            'clinic_name', v_credential_record.clinic_name,
            'must_change_password', v_credential_record.must_change_password,
            'role', 'clinic'
        );
    ELSE
        -- Increment failed attempts
        UPDATE clinic_credentials
        SET
            failed_login_attempts = failed_login_attempts + 1,
            locked_until = CASE
                WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
                ELSE locked_until
            END
        WHERE id = v_credential_record.id;

        -- Log failed attempt
        INSERT INTO clinic_activity_log (clinic_id, user_id, action, success, notes)
        VALUES (v_credential_record.clinic_id, v_credential_record.id, 'login_attempt', false, 'Invalid password');

        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid username or password'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to change clinic password
CREATE OR REPLACE FUNCTION change_clinic_password(
    p_username VARCHAR(50),
    p_old_password TEXT,
    p_new_password TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_credential_record RECORD;
    v_old_hash VARCHAR(255);
    v_new_hash VARCHAR(255);
BEGIN
    -- Get current credential
    SELECT * INTO v_credential_record
    FROM clinic_credentials
    WHERE username = p_username;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;

    -- Verify old password
    v_old_hash := hash_password(p_old_password);
    IF v_credential_record.password_hash != v_old_hash THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Current password is incorrect'
        );
    END IF;

    -- Hash new password
    v_new_hash := hash_password(p_new_password);

    -- Update password
    UPDATE clinic_credentials
    SET
        password_hash = v_new_hash,
        must_change_password = FALSE,
        last_password_change = NOW(),
        failed_login_attempts = 0,
        locked_until = NULL,
        updated_at = NOW()
    WHERE id = v_credential_record.id;

    -- Log password change
    INSERT INTO clinic_activity_log (clinic_id, user_id, action, success)
    VALUES (v_credential_record.clinic_id, v_credential_record.id, 'password_change', true);

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Password updated successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS for new tables
ALTER TABLE clinic_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "allow_all_clinic_credentials" ON clinic_credentials FOR ALL USING (true);
CREATE POLICY "allow_all_clinic_activity" ON clinic_activity_log FOR ALL USING (true);

-- Sample clinic credentials (for testing)
-- This will be created by admin in the UI, but having one for immediate testing
DO $$
DECLARE
    v_clinic_id UUID;
    v_admin_id UUID := '550e8400-e29b-41d4-a716-446655440000'; -- Admin ID from main schema
BEGIN
    -- Get first clinic
    SELECT id INTO v_clinic_id FROM clinics LIMIT 1;

    IF v_clinic_id IS NOT NULL THEN
        -- Create test clinic credentials
        PERFORM create_clinic_credentials(
            v_clinic_id,
            'clinic1',
            'clinic123',
            v_admin_id
        );
    END IF;
END $$;

-- Add region and clinic code fields to clinics table
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS region VARCHAR(10);
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS area_code VARCHAR(10);
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS custom_region VARCHAR(100);
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS custom_code VARCHAR(20);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_clinics_region_code ON clinics(region, area_code);
CREATE INDEX IF NOT EXISTS idx_clinics_area_code ON clinics(area_code);

-- Update existing sample clinics with region and area codes
UPDATE clinics
SET region = '4A', area_code = 'CVT001'
WHERE name = 'SmileCare Dental Cavite';

UPDATE clinics
SET region = '4A', area_code = 'BTG001'
WHERE name = 'Bright Dental Batangas';

UPDATE clinics
SET region = '4A', area_code = 'LGN001'
WHERE name = 'Pearl White Dental Laguna';

-- Function to get available clinic codes by area
CREATE OR REPLACE FUNCTION get_available_clinic_codes(
    p_area_prefix VARCHAR(3)
)
RETURNS TABLE(
    code VARCHAR(10),
    is_available BOOLEAN
) AS $$
DECLARE
    i INTEGER;
    code_to_check VARCHAR(10);
    code_exists BOOLEAN;
BEGIN
    FOR i IN 1..16 LOOP
        code_to_check := p_area_prefix || LPAD(i::TEXT, 3, '0');

        SELECT EXISTS(
            SELECT 1 FROM clinics
            WHERE area_code = code_to_check AND is_active = true
        ) INTO code_exists;

        RETURN QUERY SELECT code_to_check, NOT code_exists;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to validate clinic creation with region/code
CREATE OR REPLACE FUNCTION validate_clinic_creation(
    p_clinic_name VARCHAR(100),
    p_region VARCHAR(10),
    p_area_code VARCHAR(10),
    p_custom_region VARCHAR(100) DEFAULT NULL,
    p_custom_code VARCHAR(20) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_errors TEXT[] := ARRAY[]::TEXT[];
    v_final_region VARCHAR(100);
    v_final_code VARCHAR(20);
    v_code_exists BOOLEAN := FALSE;
BEGIN
    -- Validate required fields
    IF LENGTH(TRIM(p_clinic_name)) = 0 THEN
        v_errors := array_append(v_errors, 'Clinic name is required');
    END IF;

    IF LENGTH(TRIM(p_region)) = 0 THEN
        v_errors := array_append(v_errors, 'Region is required');
    END IF;

    IF LENGTH(TRIM(p_area_code)) = 0 THEN
        v_errors := array_append(v_errors, 'Clinic code is required');
    END IF;

    -- Handle custom region
    IF p_region = 'CUSTOM' THEN
        IF p_custom_region IS NULL OR LENGTH(TRIM(p_custom_region)) = 0 THEN
            v_errors := array_append(v_errors, 'Custom region name is required');
        END IF;
        v_final_region := p_custom_region;
    ELSE
        v_final_region := p_region;
    END IF;

    -- Handle custom code
    IF p_area_code = 'CUSTOM' THEN
        IF p_custom_code IS NULL OR LENGTH(TRIM(p_custom_code)) = 0 THEN
            v_errors := array_append(v_errors, 'Custom clinic code is required');
        END IF;
        v_final_code := p_custom_code;
    ELSE
        v_final_code := p_area_code;
    END IF;

    -- Check if clinic code already exists
    SELECT EXISTS(
        SELECT 1 FROM clinics
        WHERE area_code = v_final_code AND is_active = true
    ) INTO v_code_exists;

    IF v_code_exists THEN
        v_errors := array_append(v_errors, 'Clinic code ' || v_final_code || ' is already in use');
    END IF;

    -- Check clinic name uniqueness
    SELECT EXISTS(
        SELECT 1 FROM clinics
        WHERE LOWER(name) = LOWER(p_clinic_name) AND is_active = true
    ) INTO v_code_exists;

    IF v_code_exists THEN
        v_errors := array_append(v_errors, 'Clinic name already exists');
    END IF;

    RETURN jsonb_build_object(
        'is_valid', array_length(v_errors, 1) IS NULL,
        'errors', COALESCE(array_to_json(v_errors), '[]'::json),
        'final_region', v_final_region,
        'final_code', v_final_code
    );
END;
$$ LANGUAGE plpgsql;

SELECT '✅ CLINIC AUTH: Enhanced clinic authentication system ready' as status;
SELECT '✅ CLINIC REGIONS: Philippine regions and clinic codes system added' as region_status;