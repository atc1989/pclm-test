import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { scoreBand, suggestTier } from "@/lib/glis/score";

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
  const { markers, score, inflDomain, metDomain, nlr, tyg, isFollowUp } = body;

  const stage = isFollowUp ? "follow_up" : "baseline";
  const today = new Date().toISOString().split("T")[0];
  const tgHdlRatio = markers.trig && markers.hdl ? markers.trig / markers.hdl : null;

  // lab_results
  const { data: labResult, error: labError } = await (supabase as any)
    .from("lab_results")
    .insert({ patient_id: user.id, stage, lab_name: "Patient Upload", source_type: "manual_upload", test_date: today })
    .select("id")
    .single();
  if (labError) return NextResponse.json({ error: labError.message }, { status: 400 });

  // biomarker_records
  const { error: bioError } = await (supabase as any)
    .from("biomarker_records")
    .insert({
      patient_id: user.id,
      lab_result_id: labResult.id,
      hs_crp: markers.crp ?? null,
      neutrophils: markers.neut ?? null,
      lymphocytes: markers.lymph ?? null,
      triglycerides: markers.trig ?? null,
      hdl: markers.hdl ?? null,
      fasting_glucose: markers.glu ?? null,
      hba1c: null,
      esr: null,
      derived_nlr: nlr ?? null,
      derived_tg_hdl: tgHdlRatio,
    });
  if (bioError) return NextResponse.json({ error: bioError.message }, { status: 400 });

  // inflammation_scores
  const recommended = TIER_TO_DB[suggestTier(score)] ?? "start";
  const { data: scoreRow, error: scoreError } = await (supabase as any)
    .from("inflammation_scores")
    .insert({
      patient_id: user.id,
      lab_result_id: labResult.id,
      ibi_score: score,
      interpretation: scoreBand(score),
      hs_crp_score: markers.crp ?? 0,
      nlr_score: nlr ?? 0,
      tg_hdl_score: tgHdlRatio ?? 0,
      metabolic_score: metDomain ?? 0,
      recommended_protocol: recommended,
    })
    .select("id")
    .single();
  if (scoreError) return NextResponse.json({ error: scoreError.message }, { status: 400 });

  return NextResponse.json({ lab_result_id: labResult.id, inflammation_score_id: scoreRow.id });
}
