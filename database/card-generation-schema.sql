-- =====================================================
-- MOCARDS Card Generation System - Additional Schema
-- Run this after the main schema to add card generation features
-- =====================================================

-- =====================================================
-- 1. CARD BATCHES TABLE - Track batch generation
-- =====================================================
CREATE TABLE IF NOT EXISTS card_batches (
    id VARCHAR(50) PRIMARY KEY, -- Format: BATCH_{timestamp}
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    batch_name VARCHAR(100) NOT NULL,
    total_cards INTEGER NOT NULL CHECK (total_cards > 0 AND total_cards <= 10000),
    generated_cards INTEGER DEFAULT 0 CHECK (generated_cards >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    prefix VARCHAR(5) NOT NULL DEFAULT 'MOC', -- Control number prefix
    template_data JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_batches_clinic_id ON card_batches(clinic_id);
CREATE INDEX IF NOT EXISTS idx_card_batches_status ON card_batches(status);
CREATE INDEX IF NOT EXISTS idx_card_batches_created_at ON card_batches(created_at);
CREATE INDEX IF NOT EXISTS idx_card_batches_created_by ON card_batches(created_by);

-- =====================================================
-- 2. CARD EXPORTS TABLE - Track CSV exports
-- =====================================================
CREATE TABLE IF NOT EXISTS card_exports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL REFERENCES card_batches(id) ON DELETE CASCADE,
    export_type VARCHAR(20) DEFAULT 'csv' CHECK (export_type IN ('csv', 'xlsx', 'pdf')),
    file_name VARCHAR(200) NOT NULL,
    file_size BIGINT,
    exported_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_card_exports_batch_id ON card_exports(batch_id);
CREATE INDEX IF NOT EXISTS idx_card_exports_exported_by ON card_exports(exported_by);
CREATE INDEX IF NOT EXISTS idx_card_exports_created_at ON card_exports(created_at);

-- =====================================================
-- 3. CARD HISTORY TABLE - Audit trail for card changes
-- =====================================================
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_card_history_card_id ON card_history(card_id);
CREATE INDEX IF NOT EXISTS idx_card_history_batch_id ON card_history(batch_id);
CREATE INDEX IF NOT EXISTS idx_card_history_action ON card_history(action);
CREATE INDEX IF NOT EXISTS idx_card_history_created_at ON card_history(created_at);

-- =====================================================
-- 4. UPDATE CARDS TABLE - Add new fields for enhanced system
-- =====================================================

-- Add new columns to support the enhanced card generation system
ALTER TABLE cards
ADD COLUMN IF NOT EXISTS control_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS full_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS category_id UUID,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'expired')),
ADD COLUMN IF NOT EXISTS perks_total INTEGER DEFAULT 10 CHECK (perks_total >= 0),
ADD COLUMN IF NOT EXISTS perks_used INTEGER DEFAULT 0 CHECK (perks_used >= 0),
ADD COLUMN IF NOT EXISTS issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES clinics(id),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS batch_id VARCHAR(50) REFERENCES card_batches(id);

-- Create new indexes for the enhanced fields
CREATE INDEX IF NOT EXISTS idx_cards_control_number ON cards(control_number);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_batch_id ON cards(batch_id);
CREATE INDEX IF NOT EXISTS idx_cards_issue_date ON cards(issue_date);
CREATE INDEX IF NOT EXISTS idx_cards_expiry_date ON cards(expiry_date);
CREATE INDEX IF NOT EXISTS idx_cards_tenant_id ON cards(tenant_id);

-- =====================================================
-- 5. DATABASE FUNCTIONS FOR CARD GENERATION
-- =====================================================

-- Function to generate unique control numbers
CREATE OR REPLACE FUNCTION generate_card_control_number(
    p_prefix VARCHAR(5) DEFAULT 'MOC',
    p_sequence INTEGER DEFAULT 1
) RETURNS VARCHAR(50) AS $$
DECLARE
    v_timestamp BIGINT;
    v_sequence VARCHAR(4);
    v_random VARCHAR(6);
    v_control_number VARCHAR(50);
    v_counter INTEGER := 0;
    v_max_attempts INTEGER := 1000;
BEGIN
    -- Generate components
    v_timestamp := EXTRACT(EPOCH FROM NOW()) * 1000; -- Milliseconds
    v_sequence := LPAD(p_sequence::TEXT, 4, '0');

    -- Loop until we get a unique control number
    LOOP
        -- Generate random suffix
        v_random := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));

        -- Construct control number
        v_control_number := p_prefix || '-' || v_timestamp::TEXT || '-' || v_sequence || '-' || v_random;

        -- Check if it already exists
        IF NOT EXISTS (SELECT 1 FROM cards WHERE control_number = v_control_number) THEN
            RETURN v_control_number;
        END IF;

        -- Prevent infinite loop
        v_counter := v_counter + 1;
        IF v_counter > v_max_attempts THEN
            RAISE EXCEPTION 'Failed to generate unique control number after % attempts', v_max_attempts;
        END IF;

        -- Add small delay and regenerate timestamp
        v_timestamp := v_timestamp + v_counter;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to validate card generation request
CREATE OR REPLACE FUNCTION validate_card_generation_request(
    p_clinic_id UUID,
    p_count INTEGER,
    p_prefix VARCHAR(5) DEFAULT 'MOC'
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_clinic_exists BOOLEAN;
    v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Initialize result
    v_result := jsonb_build_object('is_valid', true, 'errors', '[]'::jsonb);

    -- Check if clinic exists
    SELECT EXISTS(SELECT 1 FROM clinics WHERE id = p_clinic_id AND is_active = true)
    INTO v_clinic_exists;

    IF NOT v_clinic_exists THEN
        v_errors := array_append(v_errors, 'Clinic not found or inactive');
    END IF;

    -- Validate count
    IF p_count < 1 OR p_count > 10000 THEN
        v_errors := array_append(v_errors, 'Card count must be between 1 and 10,000');
    END IF;

    -- Validate prefix
    IF LENGTH(p_prefix) < 2 OR LENGTH(p_prefix) > 5 THEN
        v_errors := array_append(v_errors, 'Prefix must be 2-5 characters');
    END IF;

    IF p_prefix !~ '^[A-Z]+$' THEN
        v_errors := array_append(v_errors, 'Prefix must contain only uppercase letters');
    END IF;

    -- Build result
    IF array_length(v_errors, 1) > 0 THEN
        v_result := jsonb_build_object(
            'is_valid', false,
            'errors', array_to_json(v_errors)
        );
    END IF;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to track batch progress
CREATE OR REPLACE FUNCTION update_batch_progress(
    p_batch_id VARCHAR(50),
    p_generated_cards INTEGER,
    p_status VARCHAR(20) DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_update_count INTEGER;
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

    GET DIAGNOSTICS v_update_count = ROW_COUNT;
    RETURN v_update_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to create card history entry
CREATE OR REPLACE FUNCTION create_card_history_entry(
    p_card_id UUID,
    p_batch_id VARCHAR(50),
    p_action VARCHAR(20),
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_changed_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_history_id UUID;
    v_changed_by UUID;
BEGIN
    -- Use current user if not specified
    v_changed_by := COALESCE(p_changed_by, auth.uid());

    INSERT INTO card_history (
        card_id, batch_id, action, old_values, new_values, changed_by
    ) VALUES (
        p_card_id, p_batch_id, p_action, p_old_values, p_new_values, v_changed_by
    ) RETURNING id INTO v_history_id;

    RETURN v_history_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGERS FOR AUTOMATIC HISTORY TRACKING
-- =====================================================

-- Function to handle card changes
CREATE OR REPLACE FUNCTION handle_card_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_action VARCHAR(20);
    v_old_values JSONB;
    v_new_values JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_action := 'created';
        v_new_values := to_jsonb(NEW);
        PERFORM create_card_history_entry(NEW.id, NEW.batch_id, v_action, NULL, v_new_values);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := CASE
            WHEN OLD.is_active = true AND NEW.is_active = false THEN 'deactivated'
            WHEN OLD.is_active = false AND NEW.is_active = true THEN 'reactivated'
            ELSE 'updated'
        END;
        v_old_values := to_jsonb(OLD);
        v_new_values := to_jsonb(NEW);
        PERFORM create_card_history_entry(NEW.id, NEW.batch_id, v_action, v_old_values, v_new_values);
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for card history
DROP TRIGGER IF EXISTS card_history_trigger ON cards;
CREATE TRIGGER card_history_trigger
    AFTER INSERT OR UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION handle_card_changes();

-- =====================================================
-- 7. ROW LEVEL SECURITY POLICIES FOR NEW TABLES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE card_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_history ENABLE ROW LEVEL SECURITY;

-- Card batches: Admin only access
CREATE POLICY "Card batches admin only" ON card_batches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Card exports: Admin only access
CREATE POLICY "Card exports admin only" ON card_exports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Card history: Admin read access
CREATE POLICY "Card history admin read" ON card_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- =====================================================
-- 8. SAMPLE DATA AND VERIFICATION
-- =====================================================

-- Verification query to check new tables
SELECT
    'Card Generation Schema Setup Complete!' as status,
    COUNT(CASE WHEN table_name = 'card_batches' THEN 1 END) as card_batches_table,
    COUNT(CASE WHEN table_name = 'card_exports' THEN 1 END) as card_exports_table,
    COUNT(CASE WHEN table_name = 'card_history' THEN 1 END) as card_history_table
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('card_batches', 'card_exports', 'card_history');

-- Test control number generation function
SELECT
    'Test Control Number Generation:' as test,
    generate_card_control_number('MOC', 1) as sample_control_number;

-- Test validation function
SELECT
    'Test Validation Function:' as test,
    validate_card_generation_request(
        (SELECT id FROM clinics LIMIT 1), -- Use first clinic
        100, -- Valid count
        'MOC' -- Valid prefix
    ) as validation_result;