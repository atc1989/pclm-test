import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DB_TO_TIER: Record<string, string> = {
  maintenance: "trial",
  start: "start",
  grow: "grow",
  power: "peak",
};

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .single();

  const { data: orders } = await (supabase as any)
    .from("patient_orders")
    .select("id, confirmation_code, protocol_key, total_amount, capsule_count, bottle_count, supply_days, scans_included, city, ordered_at, protocol_plans(id, started_at)")
    .eq("patient_id", user.id)
    .order("ordered_at", { ascending: false })
    .limit(1);

  const order = orders?.[0] ?? null;

  if (!order) return NextResponse.json({ order: null });

  return NextResponse.json({
    order: {
      confirmation_code: order.confirmation_code,
      protocol_key: DB_TO_TIER[order.protocol_key] ?? order.protocol_key,
      total_amount: order.total_amount,
      capsule_count: order.capsule_count,
      bottle_count: order.bottle_count,
      supply_days: order.supply_days,
      scans_included: order.scans_included,
      city: order.city,
    },
    name: profile?.first_name ?? null,
  });
}
