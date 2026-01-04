# MOCARDS Database Deployment Guide

## Overview

This directory contains the complete database schema and migration files for the MOCARDS Dental Benefits Management System. The database is designed for Supabase and includes full appointment workflow functionality.

## Files Description

### 1. `schema-production-ready.sql` - **RECOMMENDED** Production Database Schema
- **Purpose**: Creates the complete database structure with all safety checks
- **Use**: For new deployments AND existing database updates
- **Contains**: All tables, indexes, RLS policies, functions, and triggers
- **Safe**: 100% safe to run multiple times - handles all conflicts gracefully
- **Status**: ✅ **USE THIS FILE** - Most reliable option

### 2. `schema.sql` - Original Schema (Now Fixed)
- **Purpose**: Creates the complete database structure from scratch
- **Use**: For new deployments or complete database resets
- **Contains**: All tables, indexes, RLS policies, functions, and triggers
- **Safe**: Fixed trigger conflicts - safe to run multiple times

### 3. `migration-appointment-workflow.sql` - Appointment Enhancement Migration
- **Purpose**: Adds advanced appointment workflow features to existing databases
- **Use**: For upgrading existing databases to support admin-clinic workflow
- **Contains**: Column additions, constraint updates, policy enhancements
- **Safe**: Checks for existing columns before adding - safe to run multiple times

## Deployment Instructions

### ⭐ **RECOMMENDED: Production-Ready Installation**

1. **Run Production Schema** (Works for both new and existing databases):
   ```sql
   -- In Supabase SQL Editor, run:
   -- Copy and paste entire contents of schema-production-ready.sql
   ```

2. **Run Appointment Migration** (to add enhanced workflow features):
   ```sql
   -- In Supabase SQL Editor, run:
   -- Copy and paste entire contents of migration-appointment-workflow.sql
   ```

### Option A: Fresh Installation (New Database)

1. **Run Original Schema**:
   ```sql
   -- In Supabase SQL Editor, run:
   -- Copy and paste entire contents of schema.sql
   ```

2. **Run Appointment Migration** (to add enhanced features):
   ```sql
   -- In Supabase SQL Editor, run:
   -- Copy and paste entire contents of migration-appointment-workflow.sql
   ```

### Option B: Upgrade Existing Database

1. **Run Appointment Migration Only**:
   ```sql
   -- In Supabase SQL Editor, run:
   -- Copy and paste entire contents of migration-appointment-workflow.sql
   ```

This will safely add the new appointment workflow features to your existing database.

## What the Migration Adds

The appointment workflow migration enhances the appointments table with:

- **`card_code`** - Direct card code reference for admin-created requests
- **`patient_name`** - Patient name for admin-created requests
- **`admin_notes`** - Notes from admin when creating request
- **`clinic_response`** - Response from clinic (accept/reject/reschedule reason)
- **`rescheduled_date`** - New date if rescheduled
- **`rescheduled_time`** - New time if rescheduled
- **`created_by`** - Admin who created the request
- **`responded_by`** - Clinic user who responded
- **`responded_at`** - When clinic responded
- **Enhanced status** - Adds 'rescheduled' status option
- **Improved RLS policies** - Separate policies for admin creation and clinic management

## Verification

After running the migration, verify the setup:

```sql
-- Check appointments table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'appointments';
```

## Workflow Features Enabled

### Admin Features:
1. **Create Appointment Requests**: Admin can create requests with card codes and assign to clinics
2. **Track All Requests**: View status of all requests sent to clinics
3. **Monitor Responses**: See clinic responses and rescheduling actions

### Clinic Features:
1. **Receive Requests**: Get appointment requests sent by admin
2. **Respond to Requests**: Accept, reject, or reschedule with custom messages
3. **Manage Schedule**: Full control over appointment acceptance and timing

### Status Flow:
1. **Admin creates** → `pending`
2. **Clinic accepts** → `confirmed`
3. **Clinic rejects** → `rejected`
4. **Clinic reschedules** → `rescheduled`
5. **Treatment done** → `completed`

## Database Schema Overview

```
regions (4 Philippine regions)
├── clinic_codes (64 codes: 16 per region)
├── clinics (registered dental clinics)
├── user_profiles (admin, clinic, public roles)
├── cards (dental benefit cards)
│   ├── card_perks (benefits per card)
│   └── appointments (enhanced workflow)
└── perk_redemptions (audit trail)
```

## Security Features

- **Row Level Security (RLS)** on all tables
- **Role-based access control** (admin, clinic, public)
- **Secure policies** for data isolation
- **Audit trails** for all major actions
- **Safe column additions** without data loss

## Production Readiness

✅ **Safe migrations** - No data loss
✅ **RLS enabled** - Secure by default
✅ **Proper indexing** - Optimized performance
✅ **Constraint validation** - Data integrity
✅ **Trigger automation** - Timestamp management
✅ **Role separation** - Admin vs Clinic access
✅ **Apple UX compatible** - Works with frontend

## Support

For issues with database deployment:
1. Check Supabase logs for specific errors
2. Verify user permissions in Supabase dashboard
3. Ensure RLS policies are properly applied
4. Run verification queries to confirm structure

The database is designed to be production-ready and supports the complete Apple-style MOCARDS application with full appointment workflow capabilities.