import { createAdminClient, createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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

  const admin = await createAdminClient();

  const { data: doctors, error } = await admin
    .from("profiles")
    .select("*")
    .eq("role", "doctor")
    .order("created_at", { ascending: false });

  if (error || !doctors) return NextResponse.json([]);

  const ids = doctors.map((d) => d.id);

  if (ids.length === 0) return NextResponse.json([]);

  const [{ data: clinics }, { data: verifications }, { data: onboarding }] =
    await Promise.all([
      admin.from("doctor_clinics").select("*").in("doctor_id", ids),
      admin.from("doctor_verifications").select("*").in("doctor_id", ids),
      admin.from("onboarding_status").select("*").in("doctor_id", ids),
    ]);

  const enriched = doctors.map((doctor) => ({
    ...doctor,
    clinic: clinics?.find((c) => c.doctor_id === doctor.id) ?? null,
    verification: verifications?.find((v) => v.doctor_id === doctor.id) ?? null,
    onboarding: onboarding?.find((o) => o.doctor_id === doctor.id) ?? null,
  }));

  return NextResponse.json(enriched);
}
