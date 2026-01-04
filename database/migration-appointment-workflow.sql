-- =====================================================
-- APPOINTMENT WORKFLOW MIGRATION
-- Migration script to enhance appointments table for admin-clinic workflow
-- Safe to run on existing databases
-- =====================================================

-- Check if appointments table exists and create/modify as needed
DO $migration$
BEGIN
    -- Check if appointments table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments' AND table_schema = 'public') THEN
        -- Table exists, add missing columns if they don't exist

        -- Add card_code column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'appointments' AND column_name = 'card_code' AND table_schema = 'public') THEN
            ALTER TABLE appointments ADD COLUMN card_code VARCHAR(20);
        END IF;

        -- Add patient_name column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'appointments' AND column_name = 'patient_name' AND table_schema = 'public') THEN
            ALTER TABLE appointments ADD COLUMN patient_name VARCHAR(255);
        END IF;

        -- Add admin_notes column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'appointments' AND column_name = 'admin_notes' AND table_schema = 'public') THEN
            ALTER TABLE appointments ADD COLUMN admin_notes TEXT;
        END IF;

        -- Add clinic_response column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'appointments' AND column_name = 'clinic_response' AND table_schema = 'public') THEN
            ALTER TABLE appointments ADD COLUMN clinic_response TEXT;
        END IF;

        -- Add rescheduled_date column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'appointments' AND column_name = 'rescheduled_date' AND table_schema = 'public') THEN
            ALTER TABLE appointments ADD COLUMN rescheduled_date DATE;
        END IF;

        -- Add rescheduled_time column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'appointments' AND column_name = 'rescheduled_time' AND table_schema = 'public') THEN
            ALTER TABLE appointments ADD COLUMN rescheduled_time TIME;
        END IF;

        -- Add created_by column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'appointments' AND column_name = 'created_by' AND table_schema = 'public') THEN
            ALTER TABLE appointments ADD COLUMN created_by UUID REFERENCES auth.users(id);
        END IF;

        -- Add responded_by column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'appointments' AND column_name = 'responded_by' AND table_schema = 'public') THEN
            ALTER TABLE appointments ADD COLUMN responded_by UUID REFERENCES auth.users(id);
        END IF;

        -- Add responded_at column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'appointments' AND column_name = 'responded_at' AND table_schema = 'public') THEN
            ALTER TABLE appointments ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE;
        END IF;

        -- Update status constraint to include 'rescheduled'
        BEGIN
            ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
            ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
                CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'rescheduled'));
        EXCEPTION
            WHEN OTHERS THEN
                -- Constraint might not exist or might be named differently, continue
                NULL;
        END;

        -- Make card_id nullable if it isn't already
        ALTER TABLE appointments ALTER COLUMN card_id DROP NOT NULL;

        RAISE NOTICE 'Appointments table updated with new columns for admin workflow';

    ELSE
        -- Table doesn't exist, create it with full schema
        CREATE TABLE appointments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            card_code VARCHAR(20) NOT NULL,
            card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
            clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
            patient_name VARCHAR(255) NOT NULL,
            requested_date DATE NOT NULL,
            requested_time TIME NOT NULL,
            purpose TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'rescheduled')),
            notes TEXT,
            admin_notes TEXT,
            clinic_response TEXT,
            rescheduled_date DATE,
            rescheduled_time TIME,
            created_by UUID REFERENCES auth.users(id),
            responded_by UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            responded_at TIMESTAMP WITH TIME ZONE
        );

        RAISE NOTICE 'Appointments table created with full admin workflow schema';
    END IF;

    -- Create or recreate indexes (safe to run multiple times)
    CREATE INDEX IF NOT EXISTS idx_appointments_card_code ON appointments(card_code);
    CREATE INDEX IF NOT EXISTS idx_appointments_card_id ON appointments(card_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(requested_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_appointments_created_by ON appointments(created_by);
    CREATE INDEX IF NOT EXISTS idx_appointments_responded_by ON appointments(responded_by);
    CREATE INDEX IF NOT EXISTS idx_appointments_patient_name ON appointments(patient_name);

    -- Enable RLS if not already enabled
    ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

    -- Update RLS policies for new workflow

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Appointments public create" ON appointments;
    DROP POLICY IF EXISTS "Appointments clinic/admin read" ON appointments;
    DROP POLICY IF EXISTS "Appointments clinic/admin update" ON appointments;

    -- Admin can create appointment requests
    CREATE POLICY "Appointments admin create" ON appointments
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'admin'
            )
        );

    -- Public can still create appointments (for direct patient requests)
    CREATE POLICY "Appointments public create direct" ON appointments
        FOR INSERT WITH CHECK (
            auth.uid() IS NULL OR
            NOT EXISTS (
                SELECT 1 FROM user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role IN ('admin', 'clinic')
            )
        );

    -- Admin can read all appointments
    CREATE POLICY "Appointments admin read all" ON appointments
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'admin'
            )
        );

    -- Clinics can read appointments assigned to them
    CREATE POLICY "Appointments clinic read assigned" ON appointments
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'clinic'
                AND user_profiles.clinic_id = appointments.clinic_id
            )
        );

    -- Admin can update any appointment
    CREATE POLICY "Appointments admin update all" ON appointments
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'admin'
            )
        );

    -- Clinics can update appointments assigned to them
    CREATE POLICY "Appointments clinic update assigned" ON appointments
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'clinic'
                AND user_profiles.clinic_id = appointments.clinic_id
            )
        );

    RAISE NOTICE 'Appointment workflow migration completed successfully!';

END $migration$;

-- Create or replace trigger for updated_at
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Verification query
SELECT
    'Migration verification:' as status,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND table_schema = 'public'
ORDER BY ordinal_position;