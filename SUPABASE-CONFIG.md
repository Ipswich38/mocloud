# 📱 SUPABASE CONFIGURATION FOR SIMPLE AUTH

## 🚨 **URGENT: Configure Supabase for Simple Login**

### **1. Authentication Settings**

In your Supabase Dashboard:

**Go to: Authentication → Settings**

**Site URL:**
```
https://mocloud-9kyw1t36t-cherwin-fernandezs-projects.vercel.app
```

**Redirect URLs:**
```
https://mocloud-9kyw1t36t-cherwin-fernandezs-projects.vercel.app/auth/callback
https://mocloud-9kyw1t36t-cherwin-fernandezs-projects.vercel.app/**
```

**Turn OFF these settings:**
- [ ] ❌ **Enable email confirmations**
- [ ] ❌ **Enable phone confirmations**
- [ ] ❌ **Enable secure email change**
- [x] ✅ **Enable manual linking**

### **2. Email Auth Provider**

**Go to: Authentication → Providers → Email**

**Settings:**
- [x] ✅ **Enable email provider**
- [ ] ❌ **Confirm email** (TURN THIS OFF!)
- [ ] ❌ **Secure email change** (TURN THIS OFF!)

### **3. Run Simple Auth Setup**

**In SQL Editor, run:**
```sql
-- Copy entire contents of database/simple-auth-setup.sql and run it
```

### **4. Test Immediately**

**Admin Login:**
- Email: `admin@mocards.local`
- Password: `mocards2024`

**Clinic Login:**
- Email: `clinic@mocards.local`
- Password: `clinic2024`

## 🎯 **RESULT:**

✅ **No email verification needed**
✅ **Instant login access**
✅ **Still secure with RLS**
✅ **Ready for client demo**

**⏰ This should take 2 minutes to configure!**