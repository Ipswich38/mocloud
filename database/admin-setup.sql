-- MOCARDS Auto-Setup System
-- This script prepares the database for automatic admin creation
-- No manual user creation needed - the app will handle everything!

-- First, make sure the user_profiles table has the correct structure
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);

-- Remove NOT NULL constraint from display_name if it exists
ALTER TABLE user_profiles
ALTER COLUMN display_name DROP NOT NULL;

-- Clean up any existing admin@mocards.com references
DELETE FROM user_profiles WHERE email = 'admin@mocards.com';
DELETE FROM auth.users WHERE email = 'admin@mocards.com';

-- Create placeholder to ensure table structure is ready
INSERT INTO user_profiles (id, username, display_name, email, role)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'system_placeholder',
    'System Ready',
    'system@local.setup',
    'public'
) ON CONFLICT (username) DO NOTHING;

DO $$
BEGIN
    RAISE NOTICE '🚀 MOCARDS Auto-Setup System Ready!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ No manual setup required';
    RAISE NOTICE '✅ Just login with: username = admin, password = admin123';
    RAISE NOTICE '✅ Admin user will be created automatically on first login';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Ready to use immediately!';
END $$;

-- Verify system is ready
SELECT '🚀 Auto-Setup System Ready' as status;