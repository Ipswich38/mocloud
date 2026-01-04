#!/bin/bash

# MOCARDS Production Deployment Script
# Run this to prepare for deployment

echo "🚀 MOCARDS Production Deployment Preparation"
echo "=========================================="

# Check if build works
echo "📦 Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Check errors above."
    exit 1
fi

# Check environment file
if [ -f ".env.local" ]; then
    echo "⚠️  Found .env.local - make sure to set these in Vercel!"
    echo "📋 Required environment variables:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - NEXTAUTH_SECRET"
    echo "   - NEXTAUTH_URL"
    echo "   - NODE_ENV=production"
else
    echo "📋 Remember to set environment variables in Vercel:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - NEXTAUTH_SECRET (generate random 32+ chars)"
    echo "   - NEXTAUTH_URL (your vercel app URL)"
    echo "   - NODE_ENV=production"
fi

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Create Supabase project at https://supabase.com"
echo "2. Run database/schema-bulletproof.sql in Supabase SQL Editor"
echo "3. Deploy to Vercel at https://vercel.com"
echo "4. Set environment variables in Vercel"
echo "5. Create admin account and test!"
echo ""
echo "📖 Full guide: PRODUCTION-DEPLOYMENT.md"
echo ""
echo "✅ Ready for production deployment!"