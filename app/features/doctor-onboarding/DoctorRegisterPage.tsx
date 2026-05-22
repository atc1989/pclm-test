"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardStats, nextSteps, specialties } from "./onboardingData";

type Step = "account" | "practice" | "verify" | "review" | "ready";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  clinic: string;
  city: string;
  province: string;
  specialty: string;
  prc: string;
};

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  clinic: "",
  city: "",
  province: "",
  specialty: "Internal Medicine",
  prc: "",
};

const STEPS: Step[] = ["account", "practice", "verify"];
const STEP_LABELS = ["Personal Info", "Practice", "Verification"];

export function DoctorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("account");
  const [form, setForm] = useState<FormState>(initialForm);
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  const doctorName = form.firstName || "Doctor";
  const clinicName = form.clinic || "Your Clinic";
  const stepIndex = STEPS.indexOf(step as Step);
  const progressPct = stepIndex >= 0 ? Math.round(((stepIndex + 1) / STEPS.length) * 100) : 100;

  useEffect(() => {
    if (step !== "review") return;
    const timer = window.setTimeout(() => {
      setStep("ready");
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 1900);
    return () => window.clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step !== "ready" || !qrRef.current) return;
    drawPortalQr(qrRef.current);
  }, [step]);

  const update = (field: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const go = (next: Step) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const submit = (event: FormEvent<HTMLFormElement>, next: Step) => {
    event.preventDefault();
    go(next);
  };

  const goBack = () => {
    if (step === "account") { router.push("/doctor/onboarding"); return; }
    if (step === "practice") { go("account"); return; }
    if (step === "verify") { go("practice"); return; }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: darkRegisterStyles }} />

      <div className="dreg-page">
        <div className="dreg-grid" />
        <div className="dreg-glow" />

        {(step === "account" || step === "practice" || step === "verify") && (
          <div className="dreg-shell">
            {/* Nav */}
            <div className="dreg-nav">
              <button className="dreg-back-btn" type="button" onClick={goBack}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>
              <div className="dreg-nav-brand">
                <div className="dreg-brand-dot">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                GutGuard
              </div>
              <span className="dreg-step-label">
                {stepIndex + 1} / {STEPS.length}
              </span>
            </div>

            {/* Progress */}
            <div className="dreg-progress-track">
              <div className="dreg-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Step breadcrumbs */}
            <div className="dreg-steps-row">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`dreg-step-chip ${i < stepIndex ? "done" : i === stepIndex ? "active" : ""}`}
                >
                  <span className="dreg-step-num">{i + 1}</span>
                  {STEP_LABELS[i]}
                </div>
              ))}
            </div>

            {/* Form content */}
            <div className="dreg-content">
              {step === "account" && (
                <form className="dreg-form" onSubmit={(e) => submit(e, "practice")}>
                  <div className="dreg-form-heading">
                    <span className="dreg-eyebrow">Personal Information</span>
                    <h2 className="dreg-title">Create your account</h2>
                  </div>
                  <div className="dreg-field-grid">
                    <DField label="First Name" required value={form.firstName} onChange={(v) => update("firstName", v)} placeholder="Maria" autoComplete="given-name" />
                    <DField label="Last Name" required value={form.lastName} onChange={(v) => update("lastName", v)} placeholder="Paloma" autoComplete="family-name" />
                  </div>
                  <DField label="Email" required type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="doctor@clinic.com" autoComplete="email" />
                  <DField label="Mobile Number" required type="tel" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+63 917 000 0000" autoComplete="tel" />
                  <DField label="Password" required type="password" value={form.password} onChange={(v) => update("password", v)} placeholder="Create a strong password" autoComplete="new-password" />
                  <button className="dreg-btn-primary" type="submit">
                    Continue
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </form>
              )}

              {step === "practice" && (
                <form className="dreg-form" onSubmit={(e) => submit(e, "verify")}>
                  <div className="dreg-form-heading">
                    <span className="dreg-eyebrow">Practice Information</span>
                    <h2 className="dreg-title">About your practice</h2>
                  </div>
                  <DField label="Clinic Name" required value={form.clinic} onChange={(v) => update("clinic", v)} placeholder="Paloma Wellness Clinic" autoComplete="organization" />
                  <div className="dreg-field-grid">
                    <DField label="City" required value={form.city} onChange={(v) => update("city", v)} placeholder="General Santos City" autoComplete="address-level2" />
                    <DField label="Province" value={form.province} onChange={(v) => update("province", v)} placeholder="South Cotabato" autoComplete="address-level1" />
                  </div>
                  <div className="dreg-field-group">
                    <label className="dreg-label">Medical Specialty</label>
                    <div className="dreg-specialty-grid">
                      {specialties.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`dreg-chip${form.specialty === s ? " on" : ""}`}
                          onClick={() => update("specialty", s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="dreg-btn-primary" type="submit">
                    Continue
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </form>
              )}

              {step === "verify" && (
                <form className="dreg-form" onSubmit={(e) => submit(e, "review")}>
                  <div className="dreg-form-heading">
                    <span className="dreg-eyebrow">Verification</span>
                    <h2 className="dreg-title">Practitioner verification</h2>
                  </div>
                  <p className="dreg-form-note">
                    Optional for preview access. PRC verification enables full portal
                    permissions, red-flag review, and credit redemption.
                  </p>
                  <DField label="PRC License Number" value={form.prc} onChange={(v) => update("prc", v)} placeholder="0000000" />
                  <div className="dreg-field-group">
                    <label className="dreg-label">Upload PRC ID <span className="dreg-optional">optional</span></label>
                    <button className="dreg-upload-box" type="button">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>Tap to upload image or PDF</span>
                    </button>
                  </div>
                  <button className="dreg-btn-primary" type="submit">
                    Complete Registration
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <button className="dreg-btn-secondary" type="button" onClick={() => go("review")}>
                    Skip for now
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="dreg-center-screen">
            <div className="dreg-spinner-wrap">
              <span className="dreg-spinner-ring" />
            </div>
            <h2 className="dreg-review-title">Reviewing registration…</h2>
            <p className="dreg-review-sub">This usually takes a few seconds.</p>
          </div>
        )}

        {step === "ready" && (
          <div className="dreg-ready">
            {/* Hero */}
            <div className="dreg-ready-hero">
              <div className="dreg-ready-brand">
                <div className="dreg-brand-dot lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <span>GutGuard</span>
              </div>
              <div className="dreg-success-mark">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5CB882" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="dreg-ready-title">Welcome, Dr. {doctorName}</h1>
              <p className="dreg-ready-sub">
                Your portal preview is active. Share your QR code to start
                onboarding patients into GutGuard BioScan.
              </p>
              <div className="dreg-ready-progress">
                <span className="dreg-ready-prog-fill" />
              </div>
              <div className="dreg-ready-prog-labels">
                <span>Account</span>
                <span>Verified</span>
                <span>Portal Ready</span>
              </div>
            </div>

            {/* Content */}
            <div className="dreg-ready-content">
              <div className="dreg-card dreg-qr-card">
                <div className="dreg-card-label">Your Clinic QR Code</div>
                <div className="dreg-qr-box">
                  <canvas ref={qrRef} width={120} height={120} />
                </div>
                <strong className="dreg-clinic-name">{clinicName}</strong>
                <span className="dreg-clinic-url">gutguard.com/clinic/{slugify(clinicName || doctorName)}</span>
                <div className="dreg-qr-actions">
                  <button type="button" className="dreg-qr-btn primary">Download QR</button>
                  <button type="button" className="dreg-qr-btn">Print</button>
                </div>
              </div>

              <div className="dreg-stat-grid">
                {dashboardStats.map((stat) => (
                  <div className="dreg-stat" data-tone={stat.tone} key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="dreg-card">
                <div className="dreg-card-label">What&apos;s Next</div>
                {nextSteps.map(([number, title, detail]) => (
                  <div className="dreg-next-row" key={number}>
                    <span className="dreg-next-num">{number}</span>
                    <div>
                      <strong className="dreg-next-title">{title}</strong>
                      <p className="dreg-next-detail">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a className="dreg-btn-primary block" href="/auth/login">
                Sign In to Doctor Portal
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function DField({
  autoComplete,
  label,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: {
  autoComplete?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <div className="dreg-field-group">
      <label className="dreg-label">
        {label} {required && <span className="dreg-req">*</span>}
      </label>
      <input
        className="dreg-input"
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function drawPortalQr(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const size = canvas.width;
  const cell = Math.floor(size / 18);
  ctx.fillStyle = "rgba(255,255,255,.06)";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "rgba(59,130,200,.7)";
  for (let y = 0; y < size / cell; y++) {
    for (let x = 0; x < size / cell; x++) {
      if ((x * 7 + y * 11) % 5 > 1 || isQrCorner(x, y, size / cell)) {
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }
  ([
    [0, 0],
    [size - 7 * cell, 0],
    [0, size - 7 * cell],
  ] as [number, number][]).forEach(([x, y]) => {
    ctx.fillStyle = "rgba(59,130,200,.7)";
    ctx.fillRect(x, y, 7 * cell, 7 * cell);
    ctx.fillStyle = "rgba(255,255,255,.06)";
    ctx.fillRect(x + cell, y + cell, 5 * cell, 5 * cell);
    ctx.fillStyle = "rgba(59,130,200,.7)";
    ctx.fillRect(x + 2 * cell, y + 2 * cell, 3 * cell, 3 * cell);
  });
}

function isQrCorner(x: number, y: number, cells: number) {
  return (x < 3 && y < 3) || (x >= cells - 3 && y < 3) || (x < 3 && y >= cells - 3);
}

const darkRegisterStyles = `
*{box-sizing:border-box}
.dreg-page{min-height:100dvh;background:#0C1017;display:flex;flex-direction:column;align-items:center;position:relative;overflow-x:hidden;font-family:'Outfit',system-ui,-apple-system,sans-serif}
.dreg-grid{position:fixed;inset:0;background-image:radial-gradient(circle,rgba(59,130,200,.04) 1px,transparent 1px);background-size:32px 32px;pointer-events:none;z-index:0}
.dreg-glow{position:fixed;top:-80px;left:50%;transform:translateX(-50%);width:520px;height:520px;background:radial-gradient(circle,rgba(59,130,200,.07) 0%,transparent 70%);pointer-events:none;z-index:0}

/* Shell wraps form steps */
.dreg-shell{width:100%;max-width:576px;position:relative;z-index:1;display:flex;flex-direction:column;min-height:100dvh}
@media(min-width:600px){.dreg-shell{margin:24px auto;min-height:calc(100dvh - 48px);border-radius:20px;overflow:hidden;border:1px solid rgba(59,130,200,.10);background:rgba(255,255,255,.015);backdrop-filter:blur(2px)}}

/* Nav */
.dreg-nav{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;position:sticky;top:0;z-index:10;background:rgba(12,16,23,.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(59,130,200,.08)}
.dreg-back-btn{display:flex;align-items:center;gap:6px;background:none;border:none;font:700 15px 'Outfit',system-ui;color:rgba(255,255,255,.45);cursor:pointer;padding:6px 0;min-height:36px;transition:color .15s}
.dreg-back-btn:hover{color:rgba(255,255,255,.75)}
.dreg-nav-brand{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:800;color:rgba(255,255,255,.85)}
.dreg-brand-dot{width:26px;height:26px;border-radius:7px;background:rgba(59,130,200,.18);border:1px solid rgba(59,130,200,.25);display:flex;align-items:center;justify-content:center;color:#3B82C8;flex-shrink:0}
.dreg-brand-dot.lg{width:36px;height:36px;border-radius:10px}
.dreg-step-label{font-size:13px;font-weight:700;color:rgba(255,255,255,.35);letter-spacing:.04em;min-width:32px;text-align:right}

/* Progress */
.dreg-progress-track{height:2px;background:rgba(255,255,255,.06)}
.dreg-progress-fill{height:100%;background:#3B82C8;transition:width .4s cubic-bezier(.32,1,.68,1)}

/* Steps breadcrumbs */
.dreg-steps-row{display:flex;align-items:center;gap:6px;padding:14px 22px;border-bottom:1px solid rgba(255,255,255,.04)}
.dreg-step-chip{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:rgba(255,255,255,.28);letter-spacing:.04em;transition:color .2s}
.dreg-step-chip.active{color:rgba(255,255,255,.75)}
.dreg-step-chip.done{color:rgba(59,130,200,.65)}
.dreg-step-chip:not(:last-child)::after{content:'›';margin-left:6px;opacity:.3}
.dreg-step-num{width:20px;height:20px;border-radius:6px;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0}
.dreg-step-chip.active .dreg-step-num{background:rgba(59,130,200,.18);color:#3B82C8}
.dreg-step-chip.done .dreg-step-num{background:rgba(59,130,200,.12);color:#3B82C8}

/* Form area */
.dreg-content{flex:1;padding:28px 22px 48px}
.dreg-form{display:flex;flex-direction:column}
.dreg-form-heading{margin-bottom:26px}
.dreg-eyebrow{display:block;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(59,130,200,.7);margin-bottom:6px}
.dreg-title{font-size:clamp(22px,5.5vw,26px);font-weight:800;color:rgba(255,255,255,.92);letter-spacing:-.03em;margin:0;line-height:1.1}

/* Fields */
.dreg-field-group{margin-bottom:16px}
.dreg-field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:380px){.dreg-field-grid{grid-template-columns:1fr}}
.dreg-label{display:block;font-size:12px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:8px}
.dreg-req{color:#D42020}
.dreg-optional{font-weight:500;letter-spacing:0;text-transform:none;color:rgba(255,255,255,.28)}
.dreg-input{width:100%;padding:14px 16px;border:1.5px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.04);font:600 16px 'Outfit',system-ui;color:#fff;outline:none;min-height:52px;transition:border-color .15s,box-shadow .15s}
.dreg-input::placeholder{color:rgba(255,255,255,.22);font-weight:500}
.dreg-input:focus{border-color:rgba(59,130,200,.5);box-shadow:0 0 0 3px rgba(59,130,200,.08)}
.dreg-input:disabled{opacity:.45;cursor:not-allowed}

/* Specialty chips */
.dreg-specialty-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:2px}
.dreg-chip{padding:9px 14px;border-radius:11px;border:1.5px solid rgba(255,255,255,.07);background:rgba(255,255,255,.04);font:700 13px 'Outfit',system-ui;color:rgba(255,255,255,.55);cursor:pointer;transition:border-color .15s,background .15s,color .15s;min-height:40px}
.dreg-chip.on{border-color:rgba(59,130,200,.45);background:rgba(59,130,200,.10);color:#3B82C8}
.dreg-chip:hover:not(.on){border-color:rgba(255,255,255,.14);color:rgba(255,255,255,.75)}

/* Upload */
.dreg-upload-box{width:100%;min-height:130px;border:1.5px dashed rgba(255,255,255,.1);border-radius:16px;background:rgba(255,255,255,.02);color:rgba(255,255,255,.35);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font:700 14px 'Outfit',system-ui;cursor:pointer;transition:border-color .15s,color .15s}
.dreg-upload-box:hover{border-color:rgba(59,130,200,.3);color:rgba(59,130,200,.7)}

/* Form note */
.dreg-form-note{font-size:14px;color:rgba(255,255,255,.38);line-height:1.6;margin:-6px 0 20px}

/* Buttons */
.dreg-btn-primary{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:16px;border-radius:16px;border:none;font:800 16px 'Outfit',system-ui;background:#3B82C8;color:#fff;cursor:pointer;min-height:54px;margin-top:8px;box-shadow:0 4px 20px rgba(59,130,200,.25);transition:transform .1s,box-shadow .1s;text-decoration:none}
.dreg-btn-primary:active{transform:scale(.97);box-shadow:0 2px 10px rgba(59,130,200,.15)}
.dreg-btn-primary.block{display:flex}
.dreg-btn-secondary{display:flex;align-items:center;justify-content:center;width:100%;padding:14px;border-radius:16px;border:1.5px solid rgba(255,255,255,.08);background:transparent;font:700 15px 'Outfit',system-ui;color:rgba(255,255,255,.45);cursor:pointer;min-height:50px;margin-top:10px;transition:border-color .15s,color .15s}
.dreg-btn-secondary:hover{border-color:rgba(255,255,255,.15);color:rgba(255,255,255,.65)}

/* Review / loading screen */
.dreg-center-screen{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 28px;text-align:center;position:relative;z-index:1;min-height:100dvh}
.dreg-spinner-wrap{width:72px;height:72px;border-radius:20px;background:rgba(59,130,200,.08);border:1px solid rgba(59,130,200,.15);display:flex;align-items:center;justify-content:center;margin-bottom:24px}
.dreg-spinner-ring{width:28px;height:28px;border:3px solid rgba(59,130,200,.2);border-top-color:#3B82C8;border-radius:50%;animation:dreg-spin .7s linear infinite}
.dreg-review-title{font-size:22px;font-weight:800;color:rgba(255,255,255,.88);margin:0 0 8px;letter-spacing:-.02em}
.dreg-review-sub{font-size:15px;color:rgba(255,255,255,.38);margin:0}

/* Ready / success screen */
.dreg-ready{width:100%;max-width:576px;position:relative;z-index:1;margin:0 auto}
@media(min-width:600px){.dreg-ready{margin:24px auto;border-radius:20px;overflow:hidden;border:1px solid rgba(59,130,200,.10)}}
.dreg-ready-hero{background:linear-gradient(165deg,#0f1f38,#162d50);padding:28px 24px 32px;display:flex;flex-direction:column;align-items:center;text-align:center}
.dreg-ready-brand{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:800;color:rgba(255,255,255,.8);margin-bottom:28px;align-self:flex-start}
.dreg-success-mark{width:64px;height:64px;border-radius:18px;background:rgba(92,184,130,.1);border:1px solid rgba(92,184,130,.2);display:flex;align-items:center;justify-content:center;margin-bottom:18px}
.dreg-ready-title{font-size:26px;font-weight:800;color:rgba(255,255,255,.92);letter-spacing:-.03em;margin:0 0 10px}
.dreg-ready-sub{font-size:15px;color:rgba(255,255,255,.45);line-height:1.6;max-width:320px;margin:0 auto}
.dreg-ready-progress{height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;max-width:260px;width:100%;margin:24px auto 0}
.dreg-ready-prog-fill{display:block;height:100%;width:100%;background:linear-gradient(90deg,#3B82C8,#5CB882);animation:dreg-grow 1s cubic-bezier(.32,1,.68,1) both}
.dreg-ready-prog-labels{display:flex;justify-content:space-between;max-width:260px;width:100%;margin:8px auto 0;font-size:11px;color:rgba(255,255,255,.3);font-weight:700}

.dreg-ready-content{padding:24px 22px 48px;display:flex;flex-direction:column;gap:12px}
.dreg-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:20px}
.dreg-card-label{font-size:11px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:14px}
.dreg-qr-card{display:flex;flex-direction:column;align-items:center;text-align:center}
.dreg-qr-box{width:150px;height:150px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;margin-bottom:14px;overflow:hidden}
.dreg-clinic-name{font-size:17px;font-weight:800;color:rgba(255,255,255,.85);display:block;margin-bottom:4px}
.dreg-clinic-url{font-size:13px;color:#3B82C8;font-weight:700;display:block}
.dreg-qr-actions{display:flex;gap:8px;margin-top:16px}
.dreg-qr-btn{min-height:40px;padding:9px 16px;border-radius:10px;border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);font:800 13px 'Outfit',system-ui;color:rgba(255,255,255,.6);cursor:pointer;transition:border-color .15s,color .15s}
.dreg-qr-btn.primary{background:rgba(59,130,200,.15);border-color:rgba(59,130,200,.35);color:#3B82C8}

.dreg-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.dreg-stat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:14px 8px;text-align:center}
.dreg-stat strong{display:block;font-size:22px;font-weight:800;line-height:1;color:rgba(255,255,255,.85)}
.dreg-stat span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.35);font-weight:800;margin-top:6px}
.dreg-stat[data-tone="green"] strong{color:#5CB882}
.dreg-stat[data-tone="red"] strong{color:#D42020}

.dreg-next-row{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.dreg-next-row:last-child{border-bottom:none}
.dreg-next-num{width:34px;height:34px;border-radius:9px;background:rgba(59,130,200,.10);border:1px solid rgba(59,130,200,.18);color:#3B82C8;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0}
.dreg-next-title{display:block;font-size:15px;font-weight:750;color:rgba(255,255,255,.8)}
.dreg-next-detail{font-size:13px;color:rgba(255,255,255,.38);margin:3px 0 0;line-height:1.5}

@keyframes dreg-spin{to{transform:rotate(360deg)}}
@keyframes dreg-grow{from{width:0}to{width:100%}}
`;
