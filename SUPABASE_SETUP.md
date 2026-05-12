# Supabase Integration

This project is fully integrated with Supabase for authentication and database management.

## Setup Completed

✅ **Supabase Client Configuration**
- Browser client: `app/lib/supabase/client.ts`
- Server client: `app/lib/supabase/server.ts`
- Admin client: Available via `createAdminClient()` from server

✅ **TypeScript Database Types**
- Generated types: `app/lib/supabase/types.ts`
- Type-safe database operations with full IntelliSense

✅ **Authentication & Query Utilities**
- Auth functions: `app/lib/supabase/auth.ts`
- Database queries: `app/lib/supabase/queries.ts`
- React hooks: `app/lib/supabase/hooks.ts`

✅ **Middleware**
- Session management: `middleware.ts`
- Automatically refreshes user sessions

## Environment Variables

All required Supabase environment variables are configured in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public API key for client-side operations
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side admin operations (keep secret)
- `DATABASE_URL` - Direct PostgreSQL connection string

See `.env.example` for all available configuration options.

## Usage Examples

### Client-Side Operations

```typescript
// In a React component
"use client";
import { useAuth, useSupabase } from "@/lib/supabase/hooks";

export function Profile() {
  const { user, profile, loading } = useAuth();
  const supabase = useSupabase();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return <div>Welcome, {profile?.email}</div>;
}
```

### Server-Side Operations

```typescript
// In a Server Component or API route
import { createServerClient } from "@/lib/supabase/server";

export async function getServerData() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*");
  return data;
}
```

### API Routes

```typescript
// app/api/profile/route.ts
import { createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return NextResponse.json(data);
}
```

### Database Queries

```typescript
// Using pre-built query functions
import {
  getDoctorProfile,
  getDoctorClinic,
  updateDoctorClinic,
} from "@/lib/supabase/queries";

const doctor = await getDoctorProfile(doctorId);
const clinic = await getDoctorClinic(doctorId);

await updateDoctorClinic(doctorId, {
  clinic_name: "New Clinic Name",
});
```

## Database Schema

The database includes the following main tables:

- **profiles** - User profiles (doctors, patients, admins)
- **doctor_clinics** - Doctor clinic information and QR codes
- **doctor_verifications** - PRC license verification data
- **onboarding_status** - Doctor onboarding workflow state
- **patient_profiles** - Patient-specific profile data
- **lab_results** - Patient lab test results
- **bioscan_reviews** - Doctor review of patient bioscan data
- **physician_messages** - Direct messaging between physicians
- **physician_credits** - Doctor credit/subscription management
- **orders** - Patient orders for services

See the migration files in `supabase/migrations/` for complete schema details.

## Key Features

✅ **Row Level Security (RLS)** - Database enforces user permissions
✅ **Real-time Subscriptions** - Listen to database changes in real-time
✅ **Type Safety** - Full TypeScript support with generated types
✅ **Server Actions** - Next.js Server Components integration ready
✅ **Session Management** - Automatic session refresh via middleware

## Migrations

All database migrations are in `supabase/migrations/`. They're automatically applied when:
- Deploying to Supabase (via CLI or dashboard)
- Creating a new branch
- Running local Supabase instance

## Testing the Integration

1. Verify the setup by running the development server:
   ```bash
   npm run dev
   ```

2. Check that Supabase connection is working:
   - The browser should connect to Supabase
   - Session cookies should be stored
   - User authentication should work

3. Test database queries:
   - Create test routes that query the database
   - Verify TypeScript types are working

## Next Steps

1. **Set up authentication** - Add login/signup forms using Supabase Auth
2. **Implement RLS policies** - Review and configure Row Level Security
3. **Add real-time features** - Use Supabase subscriptions for live updates
4. **Set up storage** - Configure file uploads for document verification
5. **Create API routes** - Build backend endpoints for your frontend

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Database Types Generation](https://supabase.com/docs/reference/cli/usage#generate-types)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
