"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  dashboardStats,
  nextSteps,
  portalBenefits,
  specialties,
} from "./onboardingData";
import { doctorOnboardingStyles } from "./doctorOnboarding.styles";

type Step = "welcome" | "account" | "practice" | "verify" | "review" | "ready";

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

export function DoctorOnboardingPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [form, setForm] = useState<FormState>(initialForm);
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  const doctorName = form.firstName || "Doctor";
  const clinicName = form.clinic || "Your Clinic";
  useEffect(() => {
    if (step !== "review") {
      return;
    }

    const timer = window.setTimeout(() => {
      setStep("ready");
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 1900);

    return () => window.clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step !== "ready" || !qrRef.current) {
      return;
    }

    drawPortalQr(qrRef.current);
  }, [step]);

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const go = (next: Step) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const submit = (event: FormEvent<HTMLFormElement>, next: Step) => {
    event.preventDefault();
    go(next);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: doctorOnboardingStyles }} />
      <main className="doctor-onboarding-shell">
        {step === "welcome" && (
          <section className="onboarding-screen onboarding-welcome">
            <BrandHeader />
            <div className="welcome-body">
              <div className="welcome-mark an d1">
                <ShieldIcon />
              </div>
              <p className="eyebrow an d2">Practitioner Protocol Center</p>
              <h1 className="welcome-title an d2">
                Activate your GutGuard doctor portal.
              </h1>
              <p className="welcome-copy an d3">
                Review BioScans, assign protocols, track GLIS movement, and
                receive clinic credits from one mobile-first workspace.
              </p>
              <div className="benefit-stack an d4">
                {portalBenefits.map((benefit) => (
                  <div className="benefit-row" data-tone={benefit.tone} key={benefit.label}>
                    <span className="benefit-dot" />
                    <span>
                      <strong>{benefit.label}</strong>
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bottom-actions an d5">
              <Link className="btn-primary" href="/auth/login">
                Create Doctor Account
              </Link>
              <a className="sub-link" href="/doctor">
                Back to physician page
              </a>
            </div>
          </section>
        )}

        {step === "account" && (
          <FormScreen
            currentStep="Step 1 of 3"
            progress="33%"
            title="Create your account"
            eyebrow="Personal Information"
            back={() => go("welcome")}
            onSubmit={(event) => submit(event, "practice")}
          >
            <div className="field-grid">
              <Field label="First Name" required value={form.firstName} onChange={(value) => update("firstName", value)} placeholder="Maria" autoComplete="given-name" />
              <Field label="Last Name" required value={form.lastName} onChange={(value) => update("lastName", value)} placeholder="Paloma" autoComplete="family-name" />
            </div>
            <Field label="Email" required type="email" value={form.email} onChange={(value) => update("email", value)} placeholder="doctor@clinic.com" autoComplete="email" />
            <Field label="Mobile" required type="tel" value={form.phone} onChange={(value) => update("phone", value)} placeholder="+63 917 000 0000" autoComplete="tel" />
            <Field label="Password" required type="password" value={form.password} onChange={(value) => update("password", value)} placeholder="Create a password" autoComplete="new-password" />
          </FormScreen>
        )}

        {step === "practice" && (
          <FormScreen
            currentStep="Step 2 of 3"
            progress="66%"
            title="About your practice"
            eyebrow="Practice Information"
            back={() => go("account")}
            onSubmit={(event) => submit(event, "verify")}
          >
            <Field label="Clinic Name" required value={form.clinic} onChange={(value) => update("clinic", value)} placeholder="Paloma Wellness Clinic" autoComplete="organization" />
            <div className="field-grid">
              <Field label="City" required value={form.city} onChange={(value) => update("city", value)} placeholder="General Santos City" autoComplete="address-level2" />
              <Field label="Province" value={form.province} onChange={(value) => update("province", value)} placeholder="South Cotabato" autoComplete="address-level1" />
            </div>
            <div className="field-group">
              <label>Medical Specialty</label>
              <div className="specialty-grid">
                {specialties.map((specialty) => (
                  <button
                    className={form.specialty === specialty ? "specialty-chip on" : "specialty-chip"}
                    key={specialty}
                    type="button"
                    onClick={() => update("specialty", specialty)}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
          </FormScreen>
        )}

        {step === "verify" && (
          <FormScreen
            currentStep="Step 3 of 3"
            progress="100%"
            title="Practitioner verification"
            eyebrow="Verification"
            back={() => go("practice")}
            onSubmit={(event) => submit(event, "review")}
            secondaryAction={
              <button className="btn-secondary" type="button" onClick={() => go("review")}>
                Skip for now
              </button>
            }
          >
            <p className="form-note">
              Optional for preview access. PRC verification enables full portal
              permissions, red-flag review, and credit redemption.
            </p>
            <Field label="PRC License Number" value={form.prc} onChange={(value) => update("prc", value)} placeholder="0000000" />
            <div className="field-group">
              <label>Upload PRC ID <span>optional</span></label>
              <button className="upload-box" type="button">
                <UploadIcon />
                <span>Tap to upload image or PDF</span>
              </button>
            </div>
          </FormScreen>
        )}

        {step === "review" && (
          <section className="onboarding-screen review-screen">
            <div className="review-icon">
              <span className="spinner" />
            </div>
            <h2>Reviewing registration...</h2>
            <p>This usually takes a few seconds.</p>
          </section>
        )}

        {step === "ready" && (
          <section className="ready-screen">
            <div className="ready-hero">
              <BrandHeader />
              <div className="ready-summary">
                <div className="success-mark">
                  <ShieldIcon />
                </div>
                <h1>Welcome, Dr. {doctorName}</h1>
                <p>
                  Your portal preview is active. Share your QR code to start
                  onboarding patients into GutGuard BioScan.
                </p>
                <div className="ready-progress">
                  <span />
                </div>
                <div className="ready-progress-labels">
                  <span>Account</span>
                  <span>Verified</span>
                  <span>Portal Ready</span>
                </div>
              </div>
            </div>

            <div className="ready-content">
              <div className="portal-card qr-card">
                <div className="card-label">Your Clinic QR Code</div>
                <div className="qr-box">
                  <canvas ref={qrRef} width={120} height={120} />
                </div>
                <strong>{clinicName}</strong>
                <span>gutguard.com/clinic/{slugify(clinicName || doctorName)}</span>
                <div className="qr-actions">
                  <button type="button">Download QR</button>
                  <button type="button">Print</button>
                </div>
              </div>

              <div className="stat-grid">
                {dashboardStats.map((stat) => (
                  <div className="portal-stat" data-tone={stat.tone} key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="portal-card">
                <div className="card-label">What&apos;s Next</div>
                {nextSteps.map(([number, title, detail]) => (
                  <div className="next-row" key={number}>
                    <span>{number}</span>
                    <div>
                      <strong>{title}</strong>
                      <p>{detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a className="btn-primary dashboard-link" href="/doctor/onboarding">
                Open Doctor Dashboard Preview
              </a>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function BrandHeader() {
  return (
    <div className="brand-header">
      <div className="brand-mark">
        <ShieldIcon />
      </div>
      <span>GutGuard</span>
    </div>
  );
}

function FormScreen({
  back,
  children,
  currentStep,
  eyebrow,
  onSubmit,
  progress,
  secondaryAction,
  title,
}: {
  back: () => void;
  children: React.ReactNode;
  currentStep: string;
  eyebrow: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  progress: string;
  secondaryAction?: React.ReactNode;
  title: string;
}) {
  return (
    <section className="onboarding-screen form-screen">
      <div className="form-nav">
        <button type="button" onClick={back}>← Back</button>
        <strong>GutGuard</strong>
        <span>{currentStep}</span>
      </div>
      <div className="progress-track">
        <div style={{ width: progress }} />
      </div>
      <form className="form-body" onSubmit={onSubmit}>
        <div className="form-heading an">
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        {children}
        <button className="btn-primary" type="submit">
          Continue
        </button>
        {secondaryAction}
      </form>
    </section>
  );
}

function Field({
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
    <div className="field-group">
      <label>
        {label} {required ? <span className="required">*</span> : null}
      </label>
      <input
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function drawPortalQr(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  const size = canvas.width;
  const cell = Math.floor(size / 18);

  context.fillStyle = "#fff";
  context.fillRect(0, 0, size, size);
  context.fillStyle = "#0C1017";

  for (let y = 0; y < size / cell; y += 1) {
    for (let x = 0; x < size / cell; x += 1) {
      if ((x * 7 + y * 11) % 5 > 1 || isQrCorner(x, y, size / cell)) {
        context.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }

  [
    [0, 0],
    [size - 7 * cell, 0],
    [0, size - 7 * cell],
  ].forEach(([x, y]) => {
    context.fillStyle = "#0C1017";
    context.fillRect(x, y, 7 * cell, 7 * cell);
    context.fillStyle = "#fff";
    context.fillRect(x + cell, y + cell, 5 * cell, 5 * cell);
    context.fillStyle = "#0C1017";
    context.fillRect(x + 2 * cell, y + 2 * cell, 3 * cell, 3 * cell);
  });
}

function isQrCorner(x: number, y: number, cells: number) {
  return (
    (x < 3 && y < 3) ||
    (x >= cells - 3 && y < 3) ||
    (x < 3 && y >= cells - 3)
  );
}
