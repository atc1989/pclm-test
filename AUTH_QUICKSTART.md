# Supabase Login - Quick Start

## 🚀 Get Started in 5 Minutes

### 1. Start the dev server
```bash
npm run dev
```

### 2. Create an account
- Navigate to **http://localhost:3000/auth/signup**
- Fill in your details:
  - First Name: Your first name
  - Last Name: Your last name
  - Email: A test email
  - Password: A secure password
  - Role: Choose "Healthcare Professional (Doctor)" or "Patient"
- Click "Sign Up"

### 3. You're logged in! 🎉
- Doctors are redirected to `/doctor/onboarding`
- Patients are redirected to `/patient/setup`
- Both can access their respective dashboards

### 4. Access Dashboards
- **Doctor**: http://localhost:3000/doctor/dashboard
- **Patient**: http://localhost:3000/patient/dashboard

### 5. Sign out
- Click "Sign Out" button in the dashboard

---

## 📍 Available Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/auth/login` | Public | Login page |
| `/auth/signup` | Public | Sign up page |
| `/doctor/dashboard` | Protected | Doctor's dashboard |
| `/patient/dashboard` | Protected | Patient's dashboard |
| `/unauthorized` | Public | Access denied page |

---

## 🔑 Test Accounts

After signing up through the UI, you'll have a test account. 

**To test multiple accounts:**
1. Use different email addresses
2. Each signup creates a new user in Supabase
3. Each user can have different roles

---

## ⚙️ Configuration

All configuration is already done! Your `.env` file has:
- ✅ Supabase URL
- ✅ Anon key (for client)
- ✅ Service role key (for server)
- ✅ Database URL

No additional setup needed.

---

## 🐛 Common Issues

### Page shows "Loading..." indefinitely
- Check browser console for errors (F12)
- Verify `.env` variables are correct
- Clear browser cache and refresh

### "Email already in use" on signup
- Email is registered - use a different email
- Or login with existing account at `/auth/login`

### Session expires after refresh
- This shouldn't happen - check middleware.ts configuration
- Clear browser cookies and retry

### Can't access dashboard after login
- Check browser console for errors
- Verify your user's role in Supabase dashboard
- Try logging out and in again

---

## 📊 User Roles

The system supports 4 roles:
1. **doctor** - Healthcare professionals
2. **patient** - Patients
3. **admin** - Admins (future)
4. **internal_admin** - Internal admins (future)

Each role:
- Can only access their own dashboard
- Has different features available
- Has different database permissions (RLS)

---

## 🔐 Security

✅ **Already Implemented:**
- Password hashing (Supabase Auth)
- Session cookies
- CSRF protection (Next.js)
- Role-based access control
- Protected API routes

---

## 📞 Need Help?

1. Check [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) for detailed docs
2. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for Supabase concepts
3. Review [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) for architecture

---

## ✨ Next: Connect Your App

Now that auth is working, you can:

1. **Update existing pages** to use authenticated user data
2. **Add API routes** that require authentication
3. **Create protected components** that only authenticated users can see
4. **Fetch user data** from your Supabase database

Example:
```typescript
"use client";
import { useAuth } from "@/lib/supabase/hooks";

export function WelcomeMessage() {
  const { profile } = useAuth();
  return <h1>Welcome, {profile?.first_name}!</h1>;
}
```

---

**Ready to go!** 🚀

Start by visiting http://localhost:3000/auth/signup
