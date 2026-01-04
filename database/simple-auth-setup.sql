-- =====================================================
-- SIMPLE SECURE AUTHENTICATION SETUP
-- No email verification, easy login, still secure
-- =====================================================

-- Create simple admin users (run this in Supabase SQL Editor)

-- 1. Create admin user
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    phone_confirmed_at,
    confirmation_sent_at,
    recovery_sent_at,
    email_change_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@mocards.local',
    crypt('mocards2024', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- 2. Create clinic user
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    phone_confirmed_at,
    confirmation_sent_at,
    recovery_sent_at,
    email_change_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'clinic@mocards.local',
    crypt('clinic2024', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- 3. Create user profiles
INSERT INTO user_profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'admin@mocards.local'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

INSERT INTO user_profiles (id, email, role)
SELECT id, email, 'clinic'
FROM auth.users
WHERE email = 'clinic@mocards.local'
ON CONFLICT (id) DO UPDATE SET role = 'clinic';

-- 4. Verification query
SELECT
    'Authentication setup complete!' as status,
    u.email,
    p.role,
    'Login ready' as access_status
FROM auth.users u
JOIN user_profiles p ON u.id = p.id
WHERE u.email IN ('admin@mocards.local', 'clinic@mocards.local')
ORDER BY p.role;