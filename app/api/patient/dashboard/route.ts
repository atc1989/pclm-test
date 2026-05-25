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

  const [profileRes, scoresRes, plansRes] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name, mobile").eq("id", user.id).single(),
    (supabase as any)
      .from("inflammation_scores")
      .select("id, ibi_score, interpretation, created_at, lab_result_id, lab_results(test_date)")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: true }),
    (supabase as any)
      .from("protocol_plans")
      .select("id, protocol_key, status, started_at, patient_orders(id, confirmation_code, capsule_count, bottle_count, supply_days, scans_included, total_amount)")
      .eq("patient_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const profile = profileRes.data;
  const scores: any[] = scoresRes.data ?? [];
  const activePlan = plansRes.data?.[0] ?? null;

  const scanHistory = scores.map((s: any) => ({
    score: s.ibi_score,
    date: s.lab_results?.test_date ?? s.created_at?.split("T")[0] ?? "",
    interpretation: s.interpretation,
  }));

  const latestScore = scores.length > 0 ? scores[scores.length - 1] : null;

  return NextResponse.json({
    name: profile?.first_name ?? null,
    scanHistory,
    latestScore: latestScore ? { score: latestScore.ibi_score, interpretation: latestScore.interpretation } : null,
    activeProtocol: activePlan
      ? {
          protocol_key: DB_TO_TIER[activePlan.protocol_key] ?? activePlan.protocol_key,
          started_at: activePlan.started_at,
          order: activePlan.patient_orders?.[0] ?? null,
        }
      : null,
  });
}
