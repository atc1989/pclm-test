import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: "patient" } },
  });

  if (error) {
    // "User already registered" from Supabase when email confirmations are off
    if (error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("already exists")) {
      return NextResponse.json({ userExists: true });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Email confirmation required — session will be null
  if (!data.session && data.user) {
    return NextResponse.json({ confirmEmail: true });
  }

  // No user returned and no session — user likely already exists (email confirm ON path)
  if (!data.user) {
    return NextResponse.json({ userExists: true });
  }

  return NextResponse.json({ success: true });
}
