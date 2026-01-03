# MOCARDS Database Setup

This directory contains the database schema and setup scripts for the MOCARDS dental benefits management system, optimized for Supabase.

## 🚀 Quick Setup (Single File)

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be fully provisioned (2-3 minutes)

### 2. Set Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase project details:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Run Database Setup (One Command)

1. Open your Supabase project dashboard
2. Go to the **SQL Editor**
3. Copy and paste the **entire contents** of `schema.sql`
4. Click **Run** to execute everything at once

The unified schema includes:
- ✅ **Tables and indexes creation**
- ✅ **Row Level Security policies**
- ✅ **Functions and triggers**
- ✅ **Sample data generation**
- ✅ **Verification queries**

**That's it!** Everything will be set up in one go.

### 4. Create Admin User

1. Sign up for an account through your application
2. Get your user ID from the Supabase auth dashboard
3. Run this SQL to make yourself an admin:
   ```sql
   UPDATE user_profiles
   SET role = 'admin'
   WHERE id = 'your-user-id-here';
   ```

## 🔧 Troubleshooting

### Common Issues

**"permission denied to set parameter app.jwt_secret"**
- This is normal for Supabase managed databases
- Use the step-by-step files instead of `schema.sql`
- Supabase manages JWT secrets automatically

**"UUID function not found"**
- Supabase uses `gen_random_uuid()` instead of `uuid_generate_v4()`
- The new setup files use the correct function

**"auth.users table not found"**
- Make sure you've enabled authentication in Supabase dashboard
- Go to Authentication → Settings → Enable email auth

**RLS Policy errors**
- Run table creation before RLS policies
- Make sure all tables exist before creating policies

### File Descriptions

| File | Purpose | When to Use |
|------|---------|-------------|
| **`schema.sql`** | **Complete unified setup** | **Use this - everything in one file!** |
| `supabase-setup.sql` | Tables and indexes only | Alternative: step-by-step approach |
| `supabase-rls-policies.sql` | Security policies | Alternative: step-by-step approach |
| `supabase-functions.sql` | Functions and triggers | Alternative: step-by-step approach |
| `supabase-sample-data.sql` | Test data generation | Alternative: step-by-step approach |

**📝 Note:** The individual `supabase-*.sql` files are kept for reference and debugging, but `schema.sql` is now the recommended all-in-one solution.

### Verification Commands

After setup, verify your installation:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check regions are populated
SELECT * FROM regions;

-- Check clinic codes generated
SELECT r.code, COUNT(cc.id) as code_count
FROM regions r
LEFT JOIN clinic_codes cc ON r.id = cc.region_id
GROUP BY r.code;
```

## Database Structure

### Core Tables

1. **regions** - Philippine regions (CVT, BTG, LGN, MIM)
2. **clinic_codes** - Available clinic codes (CVT001-016, BTG001-016, etc.)
3. **clinics** - Registered dental clinics
4. **user_profiles** - User roles and clinic associations
5. **cards** - Patient dental benefit cards
6. **card_perks** - Benefits associated with each card
7. **appointments** - Appointment requests and scheduling
8. **perk_redemptions** - Audit trail for perk usage

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control** (admin, clinic, public)
- **Automatic user profile creation** on signup
- **Audit trails** for sensitive operations

### Key Features

- **Public card lookup** - Anyone can look up card details by card code
- **Admin management** - Full system administration capabilities
- **Clinic portal** - Clinic-specific card and appointment management
- **Automatic timestamps** - created_at and updated_at fields
- **Data validation** - Check constraints and foreign keys

## Performance Optimizations

- Comprehensive indexing on frequently queried columns
- Optimized for card lookup operations
- Efficient clinic and appointment queries
- Proper foreign key relationships

## Backup and Maintenance

- Supabase handles automatic backups
- Monitor query performance through Supabase dashboard
- Regular review of RLS policies for security
- Keep environment variables secure

## Development vs Production

For development:
- Use the schema as-is with sample data
- Test with multiple user roles
- Verify RLS policies work correctly

For production:
- Remove or modify sample data sections
- Review and strengthen RLS policies
- Set up monitoring and alerts
- Consider additional backup strategies