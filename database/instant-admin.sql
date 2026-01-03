-- MOCARDS Instant Admin Setup
-- Run this to ensure admin login works immediately
-- No dependencies, no complications - just works!

-- Create the admin profile directly
INSERT INTO user_profiles (id, username, display_name, email, role)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'admin',
    'Administrator',
    'admin-system@local',
    'admin'
) ON CONFLICT (username) DO UPDATE SET
    role = 'admin',
    display_name = 'Administrator';

-- Verify it worked
SELECT
    CASE
        WHEN username = 'admin' AND role = 'admin'
        THEN '✅ Admin ready! Login with: admin / admin123'
        ELSE '❌ Setup failed'
    END as status
FROM user_profiles
WHERE username = 'admin';

-- Show final status
SELECT '🚀 INSTANT ADMIN READY' as message;