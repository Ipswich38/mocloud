-- DEBUG: Minimal test to isolate the exact issue
-- Run this step by step to find where the error occurs

-- Step 1: Create cards table first
CREATE TABLE IF NOT EXISTS cards_test (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    control_number VARCHAR(50) UNIQUE NOT NULL
);

-- Step 2: Test if the column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'cards_test' AND column_name = 'control_number';

-- Step 3: Test dynamic SQL function
CREATE OR REPLACE FUNCTION test_control_number_exists(
    p_control_number VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN := FALSE;
    v_sql TEXT;
BEGIN
    v_sql := 'SELECT EXISTS(SELECT 1 FROM cards_test WHERE control_number = $1)';

    BEGIN
        EXECUTE v_sql INTO v_exists USING p_control_number;
    EXCEPTION
        WHEN OTHERS THEN
            v_exists := FALSE;
    END;

    RETURN v_exists;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Test the function
SELECT test_control_number_exists('TEST-123-0001-ABC123');

-- Clean up
DROP FUNCTION IF EXISTS test_control_number_exists;
DROP TABLE IF EXISTS cards_test;