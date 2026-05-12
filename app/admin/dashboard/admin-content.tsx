"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type DoctorClinic = Database["public"]["Tables"]["doctor_clinics"]["Row"];
type DoctorVerification = Database["public"]["Tables"]["doctor_verifications"]["Row"];
type OnboardingStatus = Database["public"]["Tables"]["onboarding_status"]["Row"];

type EnrichedDoctor = Profile & {
  clinic: DoctorClinic | null;
  verification: DoctorVerification | null;
  onboarding: OnboardingStatus | null;
};

type MarkerRange = { min: number; max: number };
type MarkerKey = "crp" | "wbc" | "neut" | "lymph" | "glu" | "trig" | "hdl" | "alt";

type MarkerConfig = Record<MarkerKey, MarkerRange>;

const MARKER_META: Record<MarkerKey, { label: string; unit: string; desc: string; step: number; absMin: number; absMax: number }> = {
  crp:  { label: "hs-CRP",          unit: "mg/L",     desc: "High-sensitivity C-reactive protein — inflammation marker", step: 0.1, absMin: 0, absMax: 50 },
  wbc:  { label: "WBC",             unit: "×10³/μL",  desc: "White blood cell count — immune response", step: 0.1, absMin: 0, absMax: 50 },
  neut: { label: "Neutrophil",      unit: "%",         desc: "Neutrophil percentage — bacterial infection indicator", step: 1, absMin: 0, absMax: 100 },
  lymph:{ label: "Lymphocyte",      unit: "%",         desc: "Lymphocyte percentage — immune health", step: 1, absMin: 0, absMax: 100 },
  glu:  { label: "Glucose",         unit: "mg/dL",    desc: "Fasting blood glucose — metabolic health", step: 1, absMin: 0, absMax: 600 },
  trig: { label: "Triglycerides",   unit: "mg/dL",    desc: "Triglycerides — cardiovascular and metabolic risk", step: 1, absMin: 0, absMax: 1000 },
  hdl:  { label: "HDL Cholesterol", unit: "mg/dL",    desc: "High-density lipoprotein — protective cholesterol (higher is better)", step: 1, absMin: 0, absMax: 200 },
  alt:  { label: "ALT",             unit: "U/L",       desc: "Alanine aminotransferase — liver health", step: 1, absMin: 0, absMax: 500 },
};

const DEFAULT_MARKERS: MarkerConfig = {
  crp:  { min: 0,   max: 3.0  },
  wbc:  { min: 4.5, max: 11.0 },
  neut: { min: 40,  max: 70   },
  lymph:{ min: 20,  max: 40   },
  glu:  { min: 70,  max: 100  },
  trig: { min: 0,   max: 149  },
  hdl:  { min: 40,  max: 200  },
  alt:  { min: 7,   max: 40   },
};

const STORAGE_KEY = "gg_marker_config";

function loadMarkerConfig(): MarkerConfig {
  if (typeof window === "undefined") return DEFAULT_MARKERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MARKERS;
    const parsed = JSON.parse(raw) as Partial<MarkerConfig>;
    const merged = { ...DEFAULT_MARKERS };
    for (const key of Object.keys(MARKER_META) as MarkerKey[]) {
      if (parsed[key] && typeof parsed[key]!.min === "number" && typeof parsed[key]!.max === "number") {
        merged[key] = parsed[key]!;
      }
    }
    return merged;
  } catch {
    return DEFAULT_MARKERS;
  }
}

const adminStyles = `
:root{--a-bg:#0c1017;--a-s1:#111a26;--a-blue:#3b82c8;--a-lt:#f3f2ef;--a-lt2:#e8e6e0;--a-lt3:#ddd9d0;--a-white:#fff;--a-d1:#1a1a17;--a-d2:#4a4840;--a-d3:#7a7870;--a-d4:#9a978f;--a-green:#5cb882;--a-gold:#d4a840;--a-orange:#e8772e;--a-red:#d42020;--a-font:'Outfit',system-ui,-apple-system,sans-serif}
.admin-shell{min-height:100dvh;background:var(--a-bg);font-family:var(--a-font);color:var(--a-white)}
.admin-header{background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.07);padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;position:sticky;top:0;z-index:10;backdrop-filter:blur(12px)}
.admin-brand{display:flex;align-items:center;gap:10px;font-size:17px;font-weight:850;color:rgba(255,255,255,.92)}
.admin-mark{width:32px;height:32px;border-radius:10px;background:var(--a-red);display:flex;align-items:center;justify-content:center}
.admin-badge{font-size:11px;font-weight:850;letter-spacing:.12em;color:var(--a-red);background:rgba(212,32,32,.12);border:1px solid rgba(212,32,32,.2);padding:3px 10px;border-radius:20px;text-transform:uppercase}
.admin-signout{border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.5);font:750 13px var(--a-font);padding:8px 16px;border-radius:10px;cursor:pointer}
.admin-body{max-width:900px;margin:0 auto;padding:32px 20px 60px}
.admin-tabs{display:flex;gap:4px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:4px;margin-bottom:28px}
.admin-tab{flex:1;padding:11px 16px;border-radius:10px;border:none;font:750 14px var(--a-font);cursor:pointer;transition:all .15s;color:rgba(255,255,255,.45);background:transparent}
.admin-tab.on{background:rgba(255,255,255,.08);color:rgba(255,255,255,.92)}
.section-head{margin-bottom:20px}
.section-title{font-size:20px;font-weight:850;color:rgba(255,255,255,.92);letter-spacing:-.02em}
.section-sub{font-size:14px;color:rgba(255,255,255,.4);margin-top:4px}
.doctor-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:20px;margin-bottom:12px;transition:border-color .15s}
.doctor-card:hover{border-color:rgba(255,255,255,.13)}
.doctor-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}
.doctor-info{flex:1;min-width:0}
.doctor-name{font-size:17px;font-weight:850;color:rgba(255,255,255,.92)}
.doctor-email{font-size:13px;color:rgba(255,255,255,.4);margin-top:2px}
.doctor-clinic{font-size:14px;color:rgba(255,255,255,.6);margin-top:6px}
.doctor-clinic span{color:rgba(255,255,255,.35)}
.status-pills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.pill{font-size:12px;font-weight:850;padding:4px 10px;border-radius:20px;letter-spacing:.04em}
.pill-pending{background:rgba(212,168,64,.12);color:var(--a-gold);border:1px solid rgba(212,168,64,.2)}
.pill-approved{background:rgba(92,184,130,.1);color:var(--a-green);border:1px solid rgba(92,184,130,.18)}
.pill-rejected{background:rgba(212,32,32,.1);color:var(--a-red);border:1px solid rgba(212,32,32,.18)}
.pill-draft{background:rgba(255,255,255,.06);color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.08)}
.pill-submitted{background:rgba(59,130,200,.1);color:var(--a-blue);border:1px solid rgba(59,130,200,.18)}
.pill-under-review{background:rgba(212,168,64,.12);color:var(--a-gold);border:1px solid rgba(212,168,64,.2)}
.pill-none{background:rgba(255,255,255,.04);color:rgba(255,255,255,.3);border:1px solid rgba(255,255,255,.06)}
.doctor-actions{display:flex;gap:8px;flex-wrap:wrap}
.action-group{display:flex;flex-direction:column;gap:6px;flex:1;min-width:180px}
.action-label{font-size:11px;font-weight:850;letter-spacing:.1em;color:rgba(255,255,255,.3);text-transform:uppercase}
.action-btns{display:flex;gap:6px}
.btn-approve{flex:1;min-height:36px;border-radius:10px;border:none;background:rgba(92,184,130,.15);color:var(--a-green);font:750 13px var(--a-font);cursor:pointer;transition:background .15s}
.btn-approve:hover:not(:disabled){background:rgba(92,184,130,.25)}
.btn-approve:disabled{opacity:.35;cursor:not-allowed}
.btn-reject{flex:1;min-height:36px;border-radius:10px;border:none;background:rgba(212,32,32,.1);color:var(--a-red);font:750 13px var(--a-font);cursor:pointer;transition:background .15s}
.btn-reject:hover:not(:disabled){background:rgba(212,32,32,.2)}
.btn-reject:disabled{opacity:.35;cursor:not-allowed}
.btn-reset{flex:1;min-height:36px;border-radius:10px;border:none;background:rgba(255,255,255,.06);color:rgba(255,255,255,.5);font:750 13px var(--a-font);cursor:pointer;transition:background .15s}
.btn-reset:hover:not(:disabled){background:rgba(255,255,255,.1)}
.btn-reset:disabled{opacity:.35;cursor:not-allowed}
.empty-state{text-align:center;padding:48px 24px;color:rgba(255,255,255,.3);font-size:15px}
.loading-state{text-align:center;padding:48px 24px;color:rgba(255,255,255,.4);font-size:15px}
.error-state{background:rgba(212,32,32,.08);border:1px solid rgba(212,32,32,.18);border-radius:14px;padding:16px 20px;color:var(--a-red);font-size:14px;margin-bottom:16px}
.marker-grid{display:flex;flex-direction:column;gap:12px}
.marker-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:20px 22px}
.marker-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}
.marker-label{font-size:17px;font-weight:850;color:rgba(255,255,255,.92)}
.marker-unit{font-size:12px;font-weight:750;color:rgba(255,255,255,.35);background:rgba(255,255,255,.06);padding:3px 10px;border-radius:8px;margin-top:2px;display:inline-block}
.marker-desc{font-size:13px;color:rgba(255,255,255,.4);margin-top:4px}
.marker-fields{display:flex;gap:10px;align-items:center}
.marker-field{flex:1}
.marker-field label{display:block;font-size:11px;font-weight:850;letter-spacing:.1em;color:rgba(255,255,255,.35);text-transform:uppercase;margin-bottom:6px}
.marker-input{width:100%;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.09);border-radius:12px;padding:12px 14px;font:750 18px var(--a-font);color:rgba(255,255,255,.88);outline:none;transition:border-color .15s;-moz-appearance:textfield}
.marker-input:focus{border-color:rgba(59,130,200,.45);box-shadow:0 0 0 3px rgba(59,130,200,.08)}
.marker-input::-webkit-outer-spin-button,.marker-input::-webkit-inner-spin-button{-webkit-appearance:none}
.range-sep{font-size:22px;font-weight:300;color:rgba(255,255,255,.2);margin-top:18px}
.save-bar{display:flex;align-items:center;justify-content:space-between;gap:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:16px 22px;margin-top:24px}
.save-note{font-size:13px;color:rgba(255,255,255,.4)}
.save-note strong{color:rgba(255,255,255,.7);font-weight:750}
.save-actions{display:flex;gap:8px}
.btn-save{min-height:42px;padding:0 24px;border-radius:12px;border:none;background:var(--a-blue);color:#fff;font:850 15px var(--a-font);cursor:pointer;transition:opacity .15s}
.btn-save:hover{opacity:.88}
.btn-save:disabled{opacity:.4;cursor:not-allowed}
.btn-reset-all{min-height:42px;padding:0 18px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.4);font:750 14px var(--a-font);cursor:pointer;transition:background .15s}
.btn-reset-all:hover{background:rgba(255,255,255,.06)}
.save-success{font-size:13px;color:var(--a-green);font-weight:750}
.doctor-date{font-size:12px;color:rgba(255,255,255,.3);margin-top:4px}
.stats-strip{display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap}
.stat-box{flex:1;min-width:120px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:14px 16px}
.stat-box strong{display:block;font-size:24px;font-weight:900;letter-spacing:-.04em;color:rgba(255,255,255,.88)}
.stat-box span{display:block;font-size:11px;font-weight:850;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-top:4px}
.stat-box.blue strong{color:var(--a-blue)}
.stat-box.green strong{color:var(--a-green)}
.stat-box.gold strong{color:var(--a-gold)}
.stat-box.red strong{color:var(--a-red)}
.filter-row{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
.filter-btn{padding:7px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:transparent;color:rgba(255,255,255,.4);font:750 13px var(--a-font);cursor:pointer;transition:all .15s}
.filter-btn.on{background:rgba(255,255,255,.08);color:rgba(255,255,255,.88);border-color:rgba(255,255,255,.14)}
.doctor-prc{font-size:13px;color:rgba(255,255,255,.4);margin-top:4px}
.doctor-prc strong{color:rgba(255,255,255,.65)}
@media(max-width:520px){.admin-body{padding:20px 14px 48px}.doctor-actions{flex-direction:column}.marker-fields{flex-wrap:wrap}}
`;

type Tab = "doctors" | "markers";
type Filter = "all" | "pending" | "approved" | "rejected";

export function AdminContent({ adminName }: { adminName: string }) {
  const router = useRouter();
  const logout = async () => {
    await createClient().auth.signOut();
    router.push("/admin/auth");
  };
  const [tab, setTab] = useState<Tab>("doctors");
  const [doctors, setDoctors] = useState<EnrichedDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const [markers, setMarkers] = useState<MarkerConfig>(DEFAULT_MARKERS);
  const [markerDraft, setMarkerDraft] = useState<MarkerConfig>(DEFAULT_MARKERS);
  const [markerSaved, setMarkerSaved] = useState(false);

  useEffect(() => {
    const config = loadMarkerConfig();
    setMarkers(config);
    setMarkerDraft(config);
  }, []);

  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    setDoctorError(null);
    try {
      const res = await fetch("/api/admin/doctors");
      if (!res.ok) throw new Error(await res.text());
      setDoctors(await res.json());
    } catch (err) {
      setDoctorError(err instanceof Error ? err.message : "Failed to load doctors");
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "doctors") fetchDoctors();
  }, [tab, fetchDoctors]);

  async function updateVerification(doctorId: string, status: string) {
    setActionLoading(`verify-${doctorId}-${status}`);
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
      setDoctors((prev) =>
        prev.map((d) =>
          d.id === doctorId
            ? {
                ...d,
                verification: d.verification
                  ? { ...d.verification, verification_status: status as DoctorVerification["verification_status"] }
                  : null,
              }
            : d
        )
      );
    } catch {
      setDoctorError("Failed to update verification status");
    } finally {
      setActionLoading(null);
    }
  }

  async function updateOnboarding(doctorId: string, status: string) {
    setActionLoading(`onboard-${doctorId}-${status}`);
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
      setDoctors((prev) =>
        prev.map((d) =>
          d.id === doctorId
            ? {
                ...d,
                onboarding: d.onboarding
                  ? { ...d.onboarding, status: status as OnboardingStatus["status"] }
                  : null,
              }
            : d
        )
      );
    } catch {
      setDoctorError("Failed to update onboarding status");
    } finally {
      setActionLoading(null);
    }
  }

  function saveMarkers() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(markerDraft));
    setMarkers(markerDraft);
    setMarkerSaved(true);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    setTimeout(() => setMarkerSaved(false), 2500);
  }

  function resetMarkers() {
    setMarkerDraft(DEFAULT_MARKERS);
  }

  function setField(key: MarkerKey, field: "min" | "max", raw: string) {
    const value = parseFloat(raw);
    if (!isNaN(value)) {
      setMarkerDraft((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    }
  }

  const filteredDoctors = doctors.filter((d) => {
    if (filter === "all") return true;
    const vs = d.verification?.verification_status;
    const os = d.onboarding?.status;
    if (filter === "pending") return vs === "pending" || os === "submitted" || os === "under_review" || (!vs && !os);
    if (filter === "approved") return vs === "approved" && os === "approved";
    if (filter === "rejected") return vs === "rejected" || os === "rejected";
    return true;
  });

  const counts = {
    all: doctors.length,
    pending: doctors.filter((d) => {
      const vs = d.verification?.verification_status;
      const os = d.onboarding?.status;
      return vs === "pending" || os === "submitted" || os === "under_review" || (!vs && !os);
    }).length,
    approved: doctors.filter((d) => d.verification?.verification_status === "approved" && d.onboarding?.status === "approved").length,
    rejected: doctors.filter((d) => d.verification?.verification_status === "rejected" || d.onboarding?.status === "rejected").length,
  };

  return (
    <div className="admin-shell">
      <style dangerouslySetInnerHTML={{ __html: adminStyles }} />

      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-mark">
            <ShieldIcon />
          </div>
          GutGuard
          <span className="admin-badge">Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>{adminName}</span>
          <button className="admin-signout" type="button" onClick={logout}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="admin-body">
        <div className="admin-tabs">
          <button
            className={tab === "doctors" ? "admin-tab on" : "admin-tab"}
            type="button"
            onClick={() => setTab("doctors")}
          >
            Doctor Reviews
          </button>
          <button
            className={tab === "markers" ? "admin-tab on" : "admin-tab"}
            type="button"
            onClick={() => setTab("markers")}
          >
            Marker Normal Values
          </button>
        </div>

        {tab === "doctors" && (
          <>
            <div className="section-head">
              <div className="section-title">Doctor Reviews &amp; Approvals</div>
              <div className="section-sub">Manage verification and onboarding status for all registered doctors</div>
            </div>

            <div className="stats-strip">
              <div className="stat-box blue">
                <strong>{counts.all}</strong>
                <span>Total Doctors</span>
              </div>
              <div className="stat-box gold">
                <strong>{counts.pending}</strong>
                <span>Needs Review</span>
              </div>
              <div className="stat-box green">
                <strong>{counts.approved}</strong>
                <span>Fully Approved</span>
              </div>
              <div className="stat-box red">
                <strong>{counts.rejected}</strong>
                <span>Rejected</span>
              </div>
            </div>

            <div className="filter-row">
              {(["all", "pending", "approved", "rejected"] as Filter[]).map((f) => (
                <button
                  key={f}
                  className={filter === f ? "filter-btn on" : "filter-btn"}
                  type="button"
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All" : f === "pending" ? "Needs Review" : f === "approved" ? "Approved" : "Rejected"}
                  {f !== "all" && (
                    <span style={{ marginLeft: 6, opacity: 0.6 }}>
                      {counts[f]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {doctorError && <div className="error-state">{doctorError}</div>}

            {loadingDoctors ? (
              <div className="loading-state">Loading doctors...</div>
            ) : filteredDoctors.length === 0 ? (
              <div className="empty-state">No doctors found for this filter.</div>
            ) : (
              filteredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  actionLoading={actionLoading}
                  onVerify={(status) => updateVerification(doctor.id, status)}
                  onOnboard={(status) => updateOnboarding(doctor.id, status)}
                />
              ))
            )}
          </>
        )}

        {tab === "markers" && (
          <>
            <div className="section-head">
              <div className="section-title">Marker Normal Value Ranges</div>
              <div className="section-sub">
                Define the reference range for each of the 8 GLIS score markers. Values outside the range are flagged as elevated.
              </div>
            </div>

            <div className="marker-grid">
              {(Object.keys(MARKER_META) as MarkerKey[]).map((key) => {
                const meta = MARKER_META[key];
                const draft = markerDraft[key];
                return (
                  <div className="marker-card" key={key}>
                    <div className="marker-head">
                      <div>
                        <div className="marker-label">{meta.label}</div>
                        <span className="marker-unit">{meta.unit}</span>
                        <div className="marker-desc">{meta.desc}</div>
                      </div>
                    </div>
                    <div className="marker-fields">
                      <div className="marker-field">
                        <label>Min (Lower Bound)</label>
                        <input
                          className="marker-input"
                          type="number"
                          step={meta.step}
                          min={meta.absMin}
                          max={meta.absMax}
                          value={draft.min}
                          onChange={(e) => setField(key, "min", e.currentTarget.value)}
                        />
                      </div>
                      <div className="range-sep">—</div>
                      <div className="marker-field">
                        <label>Max (Upper Bound)</label>
                        <input
                          className="marker-input"
                          type="number"
                          step={meta.step}
                          min={meta.absMin}
                          max={meta.absMax}
                          value={draft.max}
                          onChange={(e) => setField(key, "max", e.currentTarget.value)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="save-bar">
              <div className="save-note">
                {markerSaved ? (
                  <span className="save-success">✓ Ranges saved successfully</span>
                ) : (
                  <>
                    Changes apply to <strong>new patient scans</strong>. Existing GLIS scores are unaffected.
                  </>
                )}
              </div>
              <div className="save-actions">
                <button className="btn-reset-all" type="button" onClick={resetMarkers}>
                  Reset to Defaults
                </button>
                <button className="btn-save" type="button" onClick={saveMarkers}>
                  Save Ranges
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DoctorCard({
  actionLoading,
  doctor,
  onOnboard,
  onVerify,
}: {
  actionLoading: string | null;
  doctor: EnrichedDoctor;
  onOnboard: (status: string) => void;
  onVerify: (status: string) => void;
}) {
  const vs = doctor.verification?.verification_status ?? null;
  const os = doctor.onboarding?.status ?? null;
  const joined = new Date(doctor.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="doctor-card">
      <div className="doctor-top">
        <div className="doctor-info">
          <div className="doctor-name">
            Dr. {doctor.first_name ?? ""} {doctor.last_name ?? ""}
          </div>
          <div className="doctor-email">{doctor.email}</div>
          {doctor.clinic && (
            <div className="doctor-clinic">
              {doctor.clinic.clinic_name} <span>· {doctor.clinic.city}, {doctor.clinic.province}</span>
              <span> · {doctor.clinic.specialty}</span>
            </div>
          )}
          {doctor.verification?.prc_license_number && (
            <div className="doctor-prc">PRC: <strong>{doctor.verification.prc_license_number}</strong></div>
          )}
          <div className="doctor-date">Joined {joined}</div>
        </div>
      </div>

      <div className="status-pills">
        <PillVerification status={vs} />
        <PillOnboarding status={os} />
      </div>

      <div className="doctor-actions">
        <div className="action-group">
          <div className="action-label">Verification</div>
          <div className="action-btns">
            <button
              className="btn-approve"
              type="button"
              disabled={vs === "approved" || actionLoading !== null}
              onClick={() => onVerify("approved")}
            >
              {actionLoading === `verify-${doctor.id}-approved` ? "..." : "Approve"}
            </button>
            <button
              className="btn-reject"
              type="button"
              disabled={vs === "rejected" || actionLoading !== null}
              onClick={() => onVerify("rejected")}
            >
              {actionLoading === `verify-${doctor.id}-rejected` ? "..." : "Reject"}
            </button>
            <button
              className="btn-reset"
              type="button"
              disabled={vs === "pending" || actionLoading !== null}
              onClick={() => onVerify("pending")}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="action-group">
          <div className="action-label">Onboarding</div>
          <div className="action-btns">
            <button
              className="btn-approve"
              type="button"
              disabled={os === "approved" || actionLoading !== null}
              onClick={() => onOnboard("approved")}
            >
              {actionLoading === `onboard-${doctor.id}-approved` ? "..." : "Approve"}
            </button>
            <button
              className="btn-reject"
              type="button"
              disabled={os === "rejected" || actionLoading !== null}
              onClick={() => onOnboard("rejected")}
            >
              {actionLoading === `onboard-${doctor.id}-rejected` ? "..." : "Reject"}
            </button>
            <button
              className="btn-reset"
              type="button"
              disabled={os === "draft" || actionLoading !== null}
              onClick={() => onOnboard("draft")}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PillVerification({ status }: { status: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Verification: Pending", cls: "pill pill-pending" },
    approved: { label: "Verification: Approved", cls: "pill pill-approved" },
    rejected: { label: "Verification: Rejected", cls: "pill pill-rejected" },
  };
  const item = status ? map[status] : null;
  if (!item) return <span className="pill pill-none">No Verification Record</span>;
  return <span className={item.cls}>{item.label}</span>;
}

function PillOnboarding({ status }: { status: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    draft: { label: "Onboarding: Draft", cls: "pill pill-draft" },
    submitted: { label: "Onboarding: Submitted", cls: "pill pill-submitted" },
    under_review: { label: "Onboarding: Under Review", cls: "pill pill-under-review" },
    approved: { label: "Onboarding: Approved", cls: "pill pill-approved" },
    rejected: { label: "Onboarding: Rejected", cls: "pill pill-rejected" },
  };
  const item = status ? map[status] : null;
  if (!item) return <span className="pill pill-none">No Onboarding Record</span>;
  return <span className={item.cls}>{item.label}</span>;
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
