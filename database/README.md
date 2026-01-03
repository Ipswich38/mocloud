# MOCARDS Database Setup

This directory contains the database schema and setup scripts for the MOCARDS dental benefits management system.

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be fully provisioned

### 2. Set Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase project details:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Run Database Schema

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Execute the script

### 4. Create Admin User

1. Sign up for an account through your application
2. Get your user ID from the Supabase auth dashboard
3. Run this SQL to make yourself an admin:
   ```sql
   UPDATE user_profiles
   SET role = 'admin'
   WHERE id = 'your-user-id-here';
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