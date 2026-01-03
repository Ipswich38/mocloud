-- MOCARDS Admin Setup - Quick Start
-- Run this after the main schema to ensure admin user exists

-- First, make sure the user_profiles table has the correct structure
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);

-- Remove NOT NULL constraint from display_name if it exists
ALTER TABLE user_profiles
ALTER COLUMN display_name DROP NOT NULL;

-- Create admin user profile (if admin user exists in auth.users)
INSERT INTO user_profiles (id, username, display_name, email, role)
SELECT
    u.id,
    'admin',
    'Administrator',
    'admin@mocards.com',
    'admin'
FROM auth.users u
WHERE u.email = 'admin@mocards.com'
ON CONFLICT (username) DO UPDATE SET
    role = 'admin',
    display_name = 'Administrator',
    email = 'admin@mocards.com';

-- If no admin user found, create a placeholder profile
-- (You'll need to create the actual auth user through Supabase dashboard)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE username = 'admin') THEN
        -- Create a dummy admin profile that will be updated when real user is created
        INSERT INTO user_profiles (id, username, display_name, email, role)
        VALUES (
            '00000000-0000-0000-0000-000000000000'::UUID,
            'admin',
            'Administrator',
            'admin@mocards.com',
            'admin'
        ) ON CONFLICT (username) DO NOTHING;

        RAISE NOTICE '⚠️  Admin profile created. Please:';
        RAISE NOTICE '1. Go to Supabase Dashboard → Authentication → Users';
        RAISE NOTICE '2. Create user with email: admin@mocards.com, password: admin123';
        RAISE NOTICE '3. Run this script again to link the profile';
    ELSE
        RAISE NOTICE '✅ Admin user profile is ready!';
        RAISE NOTICE 'Login credentials: username = admin, password = admin123';
    END IF;
END $$;

-- Verify admin setup
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM user_profiles WHERE username = 'admin' AND role = 'admin')
        THEN '✅ Admin profile exists'
        ELSE '❌ Admin profile missing'
    END as admin_status;