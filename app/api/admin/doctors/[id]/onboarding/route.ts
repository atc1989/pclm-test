import { createAdminClient, createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";
import { NextRequest, NextResponse } from "next/server";

type OnboardingUpdate = Database["public"]["Tables"]["onboarding_status"]["Update"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!["admin", "internal_admin"].includes(caller?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!["draft", "submitted", "under_review", "approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const admin = await createAdminClient();

  const now = new Date().toISOString();
  const updates: OnboardingUpdate = { status, updated_at: now };
  if (status === "submitted") updates.submitted_at = now;
  if (status === "approved") updates.approved_at = now;

  const { data, error } = await admin
    .from("onboarding_status")
    .update(updates)
    .eq("doctor_id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
