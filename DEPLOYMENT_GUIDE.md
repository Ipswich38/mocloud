# 🚀 MOCARDS Cloud Deployment Guide

Complete guide to deploy the MOC Card Generation System on Supabase and Vercel.

## 📋 Prerequisites

- [Supabase Account](https://supabase.com)
- [Vercel Account](https://vercel.com)
- [GitHub Repository](https://github.com) (already set up)
- Node.js 18+ installed locally

## 🗄️ Database Setup (Supabase)

### Step 1: Create New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Set project name: `mocards-production`
5. Generate a strong password
6. Choose a region close to your users

### Step 2: Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the entire content from:
   ```
   database/supabase-production-ready.sql
   ```
5. Click **Run** to execute the schema

**⚠️ Use the PRODUCTION-READY version** - This schema has been bulletproofed to handle all dependency issues and edge cases.

This will create:
- ✅ All required tables with proper relationships
- ✅ Row Level Security policies
- ✅ Database functions for card generation
- ✅ Performance indexes
- ✅ Sample data for testing
- ✅ Admin user setup

### Step 3: Get Supabase Credentials

From your Supabase dashboard, go to **Settings > API** and copy:
- `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
- `anon/public key` (NEXT_PUBLIC_SUPABASE_ANON_KEY)

## 🚀 Frontend Deployment (Vercel)

### Step 1: Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Custom configurations
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 2: Deploy to Vercel

**Option A: Automatic Deployment (Recommended)**
1. Connect your GitHub repository to Vercel
2. Import your repository
3. Add environment variables in Vercel dashboard
4. Deploy automatically

**Option B: Manual Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from your project directory
vercel --prod

# Follow the prompts and add environment variables
```

### Step 3: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | All |

## 👤 Admin User Setup

### Method 1: Supabase Auth Dashboard (Recommended)

1. Go to **Authentication > Users** in Supabase
2. Click **Add User**
3. Create admin user:
   - Email: `admin@yourdomain.com`
   - Password: Strong password
   - Confirm via email: `false`
4. The user profile will be auto-created with 'public' role
5. Update role to 'admin' via SQL Editor:

```sql
UPDATE user_profiles
SET role = 'admin', username = 'admin'
WHERE email = 'admin@yourdomain.com';
```

### Method 2: Direct SQL Insert

Run this in Supabase SQL Editor (replace the UUID with the actual user ID from auth.users):

```sql
-- First, get the user ID from the auth.users table
SELECT id, email FROM auth.users WHERE email = 'admin@yourdomain.com';

-- Then update the profile (replace the UUID)
UPDATE user_profiles
SET role = 'admin', username = 'admin', display_name = 'Administrator'
WHERE id = 'actual-user-uuid-here';
```

## 🧪 Testing the Deployment

### Step 1: Verify Database Connection

Visit your deployed app and check:
- ✅ App loads without errors
- ✅ Navigation works
- ✅ No console errors related to Supabase

### Step 2: Test Admin Login

1. Go to `/auth/signin`
2. Login with your admin credentials
3. Verify redirect to admin dashboard
4. Check admin-only features are accessible

### Step 3: Test Card Generation

1. Navigate to `/admin/cards/generate`
2. Try generating 1-10 test cards
3. Verify:
   - ✅ Control numbers follow format: `MOC-TIMESTAMP-SEQUENCE-RANDOM`
   - ✅ Progress tracking works
   - ✅ CSV export functions
   - ✅ Cards saved to database

## 🔧 Production Configuration

### Security Settings

**Supabase RLS Policies:**
- ✅ Public can lookup cards by control number
- ✅ Admin-only access to card generation
- ✅ Clinic-specific data isolation
- ✅ Audit logging enabled

**Environment Variables:**
```env
# Production environment
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

### Performance Optimizations

The deployment includes:
- ✅ Database indexes for fast queries
- ✅ Connection pooling via Supabase
- ✅ Edge deployment via Vercel
- ✅ Static generation for public pages

## 📊 Monitoring and Maintenance

### Supabase Dashboard Monitoring

Monitor in **Dashboard > Overview**:
- Database size and usage
- API requests per second
- Active connections
- Query performance

### Key Metrics to Watch

1. **Card Generation Volume:**
   ```sql
   SELECT
     DATE_TRUNC('day', created_at) as date,
     COUNT(*) as cards_generated
   FROM cards
   WHERE created_at >= NOW() - INTERVAL '7 days'
   GROUP BY DATE_TRUNC('day', created_at)
   ORDER BY date;
   ```

2. **Batch Success Rate:**
   ```sql
   SELECT
     status,
     COUNT(*) as batches,
     ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
   FROM card_batches
   GROUP BY status;
   ```

3. **Active Users:**
   ```sql
   SELECT
     role,
     COUNT(*) as user_count
   FROM user_profiles
   GROUP BY role;
   ```

## 🔄 Updates and Migrations

### Database Schema Updates

For future schema changes:
1. Create migration scripts in `database/migrations/`
2. Test in development first
3. Apply to production during low-traffic periods
4. Monitor for issues post-deployment

### Application Updates

The deployment supports automatic updates via:
- GitHub integration with Vercel
- Automatic rebuilds on main branch push
- Zero-downtime deployments

## 🆘 Troubleshooting

### Common Issues

**Environment Variables Not Loading:**
```bash
# Check Vercel deployment logs
vercel logs your-deployment-url

# Verify environment variables
vercel env ls
```

**Database Connection Errors:**
1. Verify Supabase URL and keys
2. Check RLS policies are correct
3. Ensure user has proper permissions

**Build Failures:**
```bash
# Test build locally
npm run build

# Check for TypeScript errors
npm run type-check
```

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)

## ✅ Deployment Checklist

**Pre-Deployment:**
- [ ] Supabase project created
- [ ] Database schema applied successfully
- [ ] Environment variables configured
- [ ] Admin user created
- [ ] Local testing completed

**Post-Deployment:**
- [ ] Application loads correctly
- [ ] Admin login works
- [ ] Card generation functions
- [ ] Database queries perform well
- [ ] CSV export works
- [ ] Mobile responsiveness verified

## 🎉 Success!

Your MOCARDS system is now live and ready to generate dental benefit cards with the exact control number format:

**`{PREFIX}-{TIMESTAMP}-{SEQUENCE}-{RANDOM}`**

Examples:
- `MOC-1736045167891-0001-ABC123`
- `CARD-1736045167891-0002-DEF456`

The system supports up to 10,000 cards per batch with full audit trails, progress tracking, and CSV export functionality.

---

**Need Help?** Create an issue in the GitHub repository or refer to the troubleshooting section above.