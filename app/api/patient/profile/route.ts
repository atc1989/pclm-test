import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const SEX_MAP: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  m: "Male",
  f: "Female",
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { first_name, last_name, mobile, email, gender, date_of_birth } = body;

  if (!first_name || typeof first_name !== "string" || !first_name.trim()) {
    return NextResponse.json({ error: "first_name is required" }, { status: 400 });
  }

  const now = new Date().toISOString();

  // Derive sex from gender string
  const resolvedSex =
    typeof gender === "string" && SEX_MAP[gender.toLowerCase()]
      ? SEX_MAP[gender.toLowerCase()]
      : null;

  // Derive age from date_of_birth (stored as YYYY-01-01)
  let resolvedAge: number | null = null;
  if (typeof date_of_birth === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date_of_birth)) {
    const birthYear = parseInt(date_of_birth.split("-")[0], 10);
    const age = new Date().getFullYear() - birthYear;
    if (age > 0 && age < 130) resolvedAge = age;
  }

  const fullName = [first_name.trim(), typeof last_name === "string" && last_name.trim() ? last_name.trim() : null]
    .filter(Boolean)
    .join(" ") || null;

  const profileUpdate: ProfileUpdate = {
    first_name: first_name.trim(),
    last_name: typeof last_name === "string" && last_name.trim() ? last_name.trim() : null,
    mobile: typeof mobile === "string" && mobile.trim() ? mobile.trim() : null,
    display_name: fullName,
    sex: resolvedSex,
    age: resolvedAge,
    updated_at: now,
  };

  if (typeof email === "string" && email.trim() && email.trim() !== user.email) {
    profileUpdate.email = email.trim();
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id);

  if (profileError) {
    console.error("Error updating profile:", profileError);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
