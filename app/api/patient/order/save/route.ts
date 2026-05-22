import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { TIERS, type TierKey } from "@/lib/glis/score";

const TIER_TO_DB: Record<string, string> = {
  trial: "maintenance",
  start: "start",
  grow: "grow",
  power: "power",
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { tierKey, fullName, phone, address, city, confirmationCode, inflammationScoreId } = body;

  const dbKey = TIER_TO_DB[tierKey] ?? tierKey;
  const tier = TIERS[tierKey as TierKey];
  if (!tier) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  // Upsert protocol_plan — one active plan per patient
  const { data: plan, error: planError } = await (supabase as any)
    .from("protocol_plans")
    .insert({
      patient_id: user.id,
      source_score_id: inflammationScoreId ?? null,
      protocol_key: dbKey,
      status: "active",
      started_at: new Date().toISOString(),
      entitlement_status: "active",
    })
    .select("id")
    .single();
  if (planError) return NextResponse.json({ error: planError.message }, { status: 400 });

  // Insert order
  const { data: order, error: orderError } = await (supabase as any)
    .from("patient_orders")
    .insert({
      patient_id: user.id,
      protocol_plan_id: plan.id,
      protocol_key: dbKey,
      order_status: "confirmed",
      full_name: fullName,
      phone,
      city,
      address_line: address,
      total_amount: tier.p,
      per_capsule_amount: parseFloat((tier.p / tier.c).toFixed(2)),
      capsule_count: tier.c,
      bottle_count: tier.b,
      supply_days: tier.d,
      scans_included: tier.scans,
      confirmation_code: confirmationCode,
    })
    .select("id")
    .single();
  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 400 });

  return NextResponse.json({ order_id: order.id, protocol_plan_id: plan.id });
}
