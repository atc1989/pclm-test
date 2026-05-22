"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ALL_MARKERS = ["hs-CRP", "WBC", "Neutrophils", "Lymphocytes", "Fasting Glucose", "Triglycerides", "HDL Cholesterol", "ALT"];
const KEY_TO_LABEL: Record<string, string> = {
  crp: "hs-CRP", wbc: "WBC", neut: "Neutrophils", lymph: "Lymphocytes",
  glu: "Fasting Glucose", trig: "Triglycerides", hdl: "HDL Cholesterol", alt: "ALT",
};

function showErrDialog(msg: string) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px;box-sizing:border-box";
  overlay.innerHTML = `<div style="background:#12121f;border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:24px;max-width:340px;width:100%"><div style="font-size:13px;font-weight:700;color:rgba(255,255,255,.35);letter-spacing:.07em;text-transform:uppercase;margin-bottom:10px">Error details</div><div style="font-size:clamp(17px,4.5vw,19px);color:rgba(255,255,255,.65);line-height:1.6;margin-bottom:20px;word-break:break-word">${msg}</div><button id="closeErrDlg" style="width:100%;padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.05);color:rgba(255,255,255,.60);font-size:clamp(18px,5vw,20px);font-family:var(--f);cursor:pointer">Close</button></div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
  document.getElementById("closeErrDlg")?.addEventListener("click", () => overlay.remove());
}

function jitter(base: number, pct = 0.08) {
  return parseFloat((base * (1 + (Math.random() * 2 - 1) * pct)).toFixed(1));
}

function getDemoResult() {
  return {
    markers: {
      crp:   jitter(8.4),   // high (normal <1.0)
      wbc:   jitter(11.6),  // high (normal 4.5–11.0)
      neut:  jitter(79),    // high % (normal 40–70)
      lymph: jitter(14),    // low %  (normal 20–40)
      glu:   jitter(116),   // high   (normal <100)
      trig:  jitter(218),   // high   (normal <150)
      hdl:   jitter(31),    // low    (normal >40)
      alt:   jitter(54),    // high   (normal <40)
    },
    confidence: { crp:"clear", wbc:"clear", neut:"clear", lymph:"clear", glu:"clear", trig:"clear", hdl:"clear", alt:"clear" } as Record<string, string>,
    missingFields: [],
    warnings: ["demo mode"],
    rawText: "",
    provider: { ocr: "demo", normalizer: "demo", bypassed: true },
  };
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function UploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scanLabel, setScanLabel] = useState("Inflammation Scan");
  const [error, setError] = useState("");

  // Refs for imperative post-API animation (mirrors reference JS exactly)
  const spinnerRef = useRef<HTMLDivElement>(null);
  const titleRef   = useRef<HTMLParagraphElement>(null);
  const barWrapRef = useRef<HTMLDivElement>(null);
  const barRef     = useRef<HTMLDivElement>(null);
  const stepsRef   = useRef<HTMLDivElement>(null);
  const procRef    = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFileRef = useRef<File | null>(null);
  const isAuthedRef = useRef(false);

  useEffect(() => {
    fetch("/api/patient/dashboard").then(r => r.json()).then(d => {
      const count = (d.scanHistory ?? []).length;
      setScanLabel(ordinal(count + 1) + " Scan");
      isAuthedRef.current = true;
    }).catch(() => {});
  }, []);

  function setBar(pct: number) {
    if (barRef.current) barRef.current.style.width = pct + "%";
  }

  async function processFile(file: File) {
    const valid = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!valid.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|webp|heic)$/i)) {
      setError("Please upload a PDF or image file (JPG, PNG, WEBP, HEIC)."); return;
    }
    if (file.size > 12 * 1024 * 1024) { setError("File must be under 12 MB."); return; }

    setError("");
    lastFileRef.current = file;
    setScanning(true);
    setBar(0);

    const phases = [
      { t: 0,    pct: 8,  label: "Reading document..." },
      { t: 800,  pct: 20, label: "Detecting lab format..." },
      { t: 1600, pct: 35, label: "Reading your results..." },
    ];
    phases.forEach(({ t, pct, label }) => setTimeout(() => {
      setBar(pct);
      if (titleRef.current) titleRef.current.textContent = label;
    }, t));

    let barPct = 35;
    intervalRef.current = setInterval(() => {
      barPct = Math.min(barPct + (Math.random() * 6 + 3), 92);
      setBar(barPct);
    }, 400);

    try {
      let result: ReturnType<typeof getDemoResult>;
      if (isDemo) {
        await new Promise(r => setTimeout(r, 2800));
        if (intervalRef.current) clearInterval(intervalRef.current);
        result = getDemoResult();
      } else {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/patient/lab-result/scan", { method: "POST", body: form });
        const json = await res.json();
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (!res.ok) {
          const msg = json.error || "Upload failed. Please try again.";
          if (spinnerRef.current) spinnerRef.current.style.display = "none";
          if (barWrapRef.current) barWrapRef.current.style.display = "none";
          if (titleRef.current) { titleRef.current.style.display = "none"; }
          if (stepsRef.current) stepsRef.current.style.display = "none";
          const errDiv = document.createElement("div");
          errDiv.style.cssText = "text-align:center;opacity:0;transition:opacity .3s";
          errDiv.innerHTML = `<div style="width:56px;height:56px;border-radius:50%;background:rgba(212,32,32,.08);display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div style="font-size:clamp(18px,5.2vw,21px);font-weight:700;color:rgba(255,255,255,.80);margin-bottom:6px">Something went wrong</div><button id="apiErrDetailsBtn" style="background:none;border:none;font-size:clamp(16px,4.2vw,17px);color:rgba(255,255,255,.30);font-family:var(--f);cursor:pointer;text-decoration:underline;padding:0;margin-bottom:24px">Show error details</button><div style="display:flex;flex-direction:column;gap:10px"><button class="btn-p" style="border-radius:14px;min-height:54px" id="apiRetryBtn"><span class="bt">Try again</span><div class="bs"></div></button><button id="apiChangeBtn" style="width:100%;padding:14px;border:none;background:none;font-size:clamp(18px,5vw,20px);font-weight:600;color:rgba(255,255,255,.45);font-family:var(--f);cursor:pointer">Upload a different file</button></div>`;
          procRef.current?.appendChild(errDiv);
          requestAnimationFrame(() => {
            errDiv.style.opacity = "1";
            document.getElementById("apiErrDetailsBtn")?.addEventListener("click", () => showErrDialog(msg));
            document.getElementById("apiRetryBtn")?.addEventListener("click", () => {
              errDiv.remove();
              if (spinnerRef.current) spinnerRef.current.style.display = "";
              if (titleRef.current) { titleRef.current.style.display = ""; titleRef.current.textContent = "Analyzing your lab report..."; }
              if (barWrapRef.current) barWrapRef.current.style.display = "";
              if (barRef.current) barRef.current.style.width = "0%";
              if (stepsRef.current) { stepsRef.current.style.cssText = "text-align:left;max-width:240px;margin:0 auto"; stepsRef.current.innerHTML = ""; stepsRef.current.style.display = ""; }
              if (lastFileRef.current) processFile(lastFileRef.current);
            });
            document.getElementById("apiChangeBtn")?.addEventListener("click", () => handleRetry());
          });
          return;
        }
        result = json.result;
      }

      sessionStorage.setItem("gg_scan", JSON.stringify(result));

      const rawMarkers = (result?.markers ?? {}) as Record<string, number | null | undefined>;
      const foundNames: string[] = [];
      const missingNames: string[] = [];
      ALL_MARKERS.forEach(label => {
        const key = Object.entries(KEY_TO_LABEL).find(([, v]) => v === label)?.[0];
        const val = key ? rawMarkers[key] : undefined;
        if (val !== null && val !== undefined) foundNames.push(label);
        else missingNames.push(label);
      });
      const found = foundNames.length;
      const tier = found >= 6 ? "full" : found >= 3 ? "partial" : "incomplete";

      setBar(100);
      if (titleRef.current) {
        titleRef.current.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--grn)" stroke-width="2.5" style="animation:checkPop .4s cubic-bezier(.34,1.56,.64,1) both"><polyline points="20 6 9 17 4 12"/></svg>Complete</span>';
      }
      setTimeout(() => { if (barWrapRef.current) barWrapRef.current.style.display = "none"; }, 600);

      // Reveal found markers one by one with green check
      foundNames.forEach((mk, i) => {
        setTimeout(() => {
          const el = document.createElement("div");
          el.style.cssText = "display:flex;align-items:center;gap:8px;padding:4px 0;opacity:0;transform:translateX(-8px);transition:all .3s var(--ease)";
          el.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--grn)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span style="font-size:clamp(18px,5.2vw,21px);color:rgba(255,255,255,.70)">${mk}</span>`;
          stepsRef.current?.appendChild(el);
          requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "translateX(0)"; });
        }, 800 + i * 280);
      });

      const afterFound = 800 + foundNames.length * 280;

      if (tier === "full") {
        setTimeout(() => {
          const steps = stepsRef.current;
          if (steps) { steps.style.transition = "transform .5s var(--ease),opacity .4s"; steps.style.transform = "scale(.65) translateY(-16px)"; steps.style.opacity = ".15"; }
          setTimeout(() => {
            if (steps) steps.style.display = "none";
            if (spinnerRef.current) spinnerRef.current.style.display = "none";
            if (titleRef.current) titleRef.current.style.display = "none";

            const confDiv = document.createElement("div");
            confDiv.style.cssText = "text-align:center;opacity:0;transition:opacity .3s";
            let ci = `<div style="display:flex;align-items:baseline;justify-content:center;gap:8px;margin-bottom:8px">
              <span style="font-size:clamp(52px,18vw,76px);font-weight:900;color:#fff;letter-spacing:-.06em;line-height:1">${found}</span>
              <span style="font-size:clamp(28px,8.5vw,36px);font-weight:600;color:rgba(255,255,255,.55);letter-spacing:-.02em;align-self:center">/8</span>
            </div>
            <div style="font-size:clamp(18px,5vw,20px);font-weight:600;color:rgba(255,255,255,.70);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">markers detected</div>
            <div style="font-size:clamp(18px,5.2vw,21px);color:rgba(255,255,255,.35);letter-spacing:.04em;margin-bottom:14px">100% score confidence</div>
            <div style="font-size:clamp(18px,5vw,20px);color:rgba(255,255,255,.70);line-height:1.5;margin-bottom:24px">All readings found.</div>`;
            ci += `<div id="confActions" style="opacity:0;transform:translateY(8px)">`;
            ci += `<button class="btn-p" style="border-radius:14px;min-height:54px" id="calcBtn"><span class="bt">Calculate My Score</span><div class="bs"></div></button>`;
            ci += `</div>`;
            confDiv.innerHTML = ci;
            procRef.current?.appendChild(confDiv);

            if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
            requestAnimationFrame(() => {
              confDiv.style.opacity = "1";
              const acts = document.getElementById("confActions");
              if (acts) { acts.style.transition = "opacity .4s var(--ease),transform .4s var(--ease)"; acts.style.opacity = "1"; acts.style.transform = "translateY(0)"; }
              document.getElementById("calcBtn")?.addEventListener("click", () => router.push(isAuthedRef.current ? "/patient/scan" : "/patient/account"));
            });
          }, 500);
        }, afterFound);

      } else {
        // Show missing markers with red X strikethrough
        missingNames.forEach((mk, i) => {
          setTimeout(() => {
            const el = document.createElement("div");
            el.style.cssText = "display:flex;align-items:center;gap:8px;padding:3px 0;opacity:0;transform:translateX(-8px);transition:all .3s var(--ease)";
            el.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2.5" style="opacity:.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span style="font-size:clamp(18px,5.2vw,21px);color:rgba(255,255,255,.55);text-decoration:line-through;opacity:.4">${mk}</span>`;
            stepsRef.current?.appendChild(el);
            requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "translateX(0)"; });
          }, afterFound + i * 180);
        });

        const afterMissing = afterFound + missingNames.length * 180 + 350;
        setTimeout(() => {
          const steps = stepsRef.current;
          if (steps) { steps.style.transition = "transform .5s var(--ease),opacity .4s"; steps.style.transform = "scale(.65) translateY(-16px)"; steps.style.opacity = ".15"; }
          setTimeout(() => {
            if (steps) steps.style.display = "none";
            if (spinnerRef.current) spinnerRef.current.style.display = "none";
            if (titleRef.current) titleRef.current.style.display = "none";

            const confPct = Math.round(found / 8 * 100);
            let ci = "";
            if (tier === "partial") {
              ci = `<div style="display:flex;align-items:baseline;justify-content:center;gap:8px;margin-bottom:8px">
                <span style="font-size:clamp(52px,18vw,76px);font-weight:900;color:#fff;letter-spacing:-.06em;line-height:1">${found}</span>
                <span style="font-size:clamp(28px,8.5vw,36px);font-weight:600;color:rgba(255,255,255,.55);letter-spacing:-.02em;align-self:center">/8</span>
              </div>
              <div style="font-size:clamp(18px,5vw,20px);font-weight:600;color:rgba(255,255,255,.70);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">markers detected</div>
              <div style="font-size:clamp(18px,5.2vw,21px);color:rgba(255,255,255,.35);letter-spacing:.04em;margin-bottom:14px">${confPct}% score confidence</div>
              <div style="font-size:clamp(18px,5vw,20px);color:rgba(255,255,255,.70);line-height:1.5;margin-bottom:24px">${found >= 5 ? "Your score is ready." : "Enough to calculate a score."}</div>`;
            } else {
              ci = `<div style="font-size:clamp(18px,5.2vw,21px);font-weight:700;color:rgba(255,255,255,.70);margin-bottom:8px">Couldn't read this clearly.</div>
              <div style="font-size:clamp(18px,5vw,20px);color:rgba(255,255,255,.70);line-height:1.5;margin-bottom:24px">Try a clear photo of the full results page, or upload a PDF.</div>`;
            }
            ci += `<div id="confActions" style="opacity:0;transform:translateY(8px)">`;
            if (tier === "partial") {
              ci += `<button class="btn-p" style="border-radius:14px;min-height:54px" id="calcBtn"><span class="bt">Calculate My Score</span><div class="bs"></div></button>
              <button id="retryBtn" style="width:100%;padding:14px;border:none;background:none;font-size:clamp(18px,5vw,20px);font-weight:600;color:rgba(255,255,255,.55);font-family:var(--f);cursor:pointer;margin-top:4px">Upload a different lab</button>`;
            } else {
              ci += `<button class="btn-p" style="border-radius:14px;min-height:54px" id="retryBtn"><span class="bt">Try again</span><div class="bs"></div></button>`;
            }
            ci += "</div>";

            const confDiv = document.createElement("div");
            confDiv.style.cssText = "text-align:center;opacity:0;transition:opacity .3s";
            confDiv.innerHTML = ci;
            procRef.current?.appendChild(confDiv);

            requestAnimationFrame(() => {
              confDiv.style.opacity = "1";
              const acts = document.getElementById("confActions");
              if (acts) { acts.style.transition = "opacity .4s var(--ease),transform .4s var(--ease)"; acts.style.opacity = "1"; acts.style.transform = "translateY(0)"; }
              document.getElementById("calcBtn")?.addEventListener("click", () => router.push(isAuthedRef.current ? "/patient/scan" : "/patient/account"));
              document.getElementById("retryBtn")?.addEventListener("click", handleRetry);
            });
          }, 500);
        }, afterMissing);
      }

    } catch {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (spinnerRef.current) spinnerRef.current.style.display = "none";
      if (barWrapRef.current) barWrapRef.current.style.display = "none";
      if (titleRef.current) titleRef.current.style.display = "none";
      if (stepsRef.current) stepsRef.current.style.display = "none";
      const errDiv = document.createElement("div");
      errDiv.style.cssText = "text-align:center;opacity:0;transition:opacity .3s";
      const netMsg = "Network error. Please try again.";
      errDiv.innerHTML = `<div style="width:56px;height:56px;border-radius:50%;background:rgba(212,32,32,.08);display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div style="font-size:clamp(18px,5.2vw,21px);font-weight:700;color:rgba(255,255,255,.80);margin-bottom:6px">Something went wrong</div><button id="netErrDetailsBtn" style="background:none;border:none;font-size:clamp(16px,4.2vw,17px);color:rgba(255,255,255,.30);font-family:var(--f);cursor:pointer;text-decoration:underline;padding:0;margin-bottom:24px">Show error details</button><div style="display:flex;flex-direction:column;gap:10px"><button class="btn-p" style="border-radius:14px;min-height:54px" id="netRetryBtn"><span class="bt">Try again</span><div class="bs"></div></button><button id="netChangeBtn" style="width:100%;padding:14px;border:none;background:none;font-size:clamp(18px,5vw,20px);font-weight:600;color:rgba(255,255,255,.45);font-family:var(--f);cursor:pointer">Upload a different file</button></div>`;
      procRef.current?.appendChild(errDiv);
      requestAnimationFrame(() => {
        errDiv.style.opacity = "1";
        document.getElementById("netErrDetailsBtn")?.addEventListener("click", () => showErrDialog(netMsg));
        document.getElementById("netRetryBtn")?.addEventListener("click", () => {
          errDiv.remove();
          if (spinnerRef.current) spinnerRef.current.style.display = "";
          if (titleRef.current) { titleRef.current.style.display = ""; titleRef.current.textContent = "Analyzing your lab report..."; }
          if (barWrapRef.current) barWrapRef.current.style.display = "";
          if (barRef.current) barRef.current.style.width = "0%";
          if (stepsRef.current) { stepsRef.current.style.cssText = "text-align:left;max-width:240px;margin:0 auto"; stepsRef.current.innerHTML = ""; stepsRef.current.style.display = ""; }
          if (lastFileRef.current) processFile(lastFileRef.current);
        });
        document.getElementById("netChangeBtn")?.addEventListener("click", () => handleRetry());
      });
    }
  }

  function handleRetry() {
    setScanning(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (stepsRef.current) { stepsRef.current.innerHTML = ""; stepsRef.current.style.cssText = "text-align:left;max-width:240px;margin:0 auto"; }
    if (spinnerRef.current) spinnerRef.current.style.display = "";
    if (titleRef.current) { titleRef.current.style.display = ""; titleRef.current.textContent = "Analyzing your lab report..."; }
    if (barWrapRef.current) barWrapRef.current.style.display = "";
    if (barRef.current) barRef.current.style.width = "0%";
    // Remove appended confDiv (any child of proc that isn't a ref-tracked element)
    if (procRef.current) {
      Array.from(procRef.current.children).forEach(c => {
        if (c !== spinnerRef.current && c !== titleRef.current && c !== barWrapRef.current && c !== stepsRef.current) c.remove();
      });
    }
  }

  function goManual() {
    sessionStorage.setItem("gg_scan", JSON.stringify({ markers: {}, confidence: {} }));
    router.push("/patient/scan");
  }

  return (
    <div className="dk" style={{ minHeight: "100dvh", fontFamily: "var(--f)" }}>
      <div className="lt-bar an">
        <button className="lt-bk" onClick={() => router.push("/patient/disclaimer")}>← Back</button>
        <div className="lt-logo">GutGuard</div>
        <div />
      </div>

      <div className="mx" style={{ paddingBottom: 40, display: "flex", flexDirection: "column", minHeight: "calc(100dvh - 52px)" }}>

        {/* ── Header: always visible ── */}
        <div className="an d1" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--bl)", fontWeight: 700, letterSpacing: ".06em", marginBottom: 6 }}>{scanLabel}</div>
          <div style={{ fontSize: "clamp(22px,6.2vw,28px)", fontWeight: 700, color: "rgba(255,255,255,.88)", letterSpacing: "-.02em" }}>Upload your lab result</div>
          <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "rgba(255,255,255,.55)", marginTop: 4 }}>Your score appears in under 30 seconds.</div>
        </div>

        {/* ── Content area: upload paths (#su) OR proc (#sp) ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {/* #su: upload paths */}
          {!scanning && (
            <div className="an d2">
              {error && (
                <div style={{ padding: "12px 16px", background: "rgba(212,32,32,.08)", border: "1px solid rgba(212,32,32,.18)", borderRadius: 14, fontSize: "clamp(18px,5.2vw,21px)", color: "#F87171", marginBottom: 16 }}>{error}</div>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf,image/*,.heic" style={{ display: "none" }} onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <div className="upl-path" style={{ background: "rgba(59,130,200,.08)", border: "1.5px solid rgba(59,130,200,.25)", marginBottom: 0 }} onClick={() => fileInputRef.current?.click()} onMouseDown={e => (e.currentTarget.style.transform = "scale(.98)")} onMouseUp={e => (e.currentTarget.style.transform = "")}>
                  <div className="upl-path-ico" style={{ background: "rgba(59,130,200,.15)" }}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--bl)" strokeWidth={2}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx={12} cy={13} r={4} /></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 700, color: "rgba(255,255,255,.92)" }}>Take a photo</div>
                    <div style={{ fontSize: "clamp(17px,4.5vw,19px)", color: "rgba(255,255,255,.45)", marginTop: 2 }}>Point your camera at your lab result</div>
                  </div>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={2}><path d="M9 18l6-6-6-6" /></svg>
                </div>

                <div className="upl-path" style={{ background: "rgba(255,255,255,.04)", border: "1.5px solid rgba(255,255,255,.10)", marginBottom: 0 }} onClick={() => fileInputRef.current?.click()} onMouseDown={e => (e.currentTarget.style.transform = "scale(.98)")} onMouseUp={e => (e.currentTarget.style.transform = "")}>
                  <div className="upl-path-ico" style={{ background: "rgba(255,255,255,.07)" }}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.70)" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1={12} y1={3} x2={12} y2={15} /></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 700, color: "rgba(255,255,255,.92)" }}>Upload a file</div>
                    <div style={{ fontSize: "clamp(17px,4.5vw,19px)", color: "rgba(255,255,255,.45)", marginTop: 2 }}>PDF, screenshot, or saved photo</div>
                  </div>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={2}><path d="M9 18l6-6-6-6" /></svg>
                </div>

                <div className="upl-path" style={{ background: "rgba(255,255,255,.03)", border: "1.5px solid rgba(255,255,255,.07)", marginBottom: 0 }} onClick={goManual} onMouseDown={e => (e.currentTarget.style.transform = "scale(.98)")} onMouseUp={e => (e.currentTarget.style.transform = "")}>
                  <div className="upl-path-ico" style={{ background: "rgba(255,255,255,.05)" }}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth={2}><line x1={17} y1={10} x2={3} y2={10} /><line x1={21} y1={6} x2={3} y2={6} /><line x1={21} y1={14} x2={3} y2={14} /><line x1={17} y1={18} x2={3} y2={18} /></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 700, color: "rgba(255,255,255,.88)" }}>Enter my values manually</div>
                    <div style={{ fontSize: "clamp(17px,4.5vw,19px)", color: "rgba(255,255,255,.40)", marginTop: 2 }}>I have a physical paper result — I&apos;ll type in my numbers</div>
                  </div>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.20)" strokeWidth={2}><path d="M9 18l6-6-6-6" /></svg>
                </div>
              </div>

              {/* Trust strip */}
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, padding: 12, borderRadius: 12, background: "rgba(255,255,255,.04)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(59,130,200,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="var(--bl)" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                  <div><div style={{ fontSize: "clamp(17px,4.5vw,19px)", fontWeight: 700, color: "rgba(255,255,255,.70)" }}>Private</div><div style={{ fontSize: "clamp(18px,5.2vw,21px)", color: "rgba(255,255,255,.40)", lineHeight: 1.4 }}>Only you and your doctor see this.</div></div>
                </div>
                <div style={{ flex: 1, padding: 12, borderRadius: 12, background: "rgba(255,255,255,.04)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(92,184,130,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="var(--grn)" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div><div style={{ fontSize: "clamp(17px,4.5vw,19px)", fontWeight: 700, color: "rgba(255,255,255,.70)" }}>PH Labs</div><div style={{ fontSize: "clamp(18px,5.2vw,21px)", color: "rgba(255,255,255,.40)", lineHeight: 1.4 }}>Hi-Precision, Medicard, and more.</div></div>
                </div>
              </div>
            </div>
          )}

          {/* #sp: processing / detected — single .proc container, managed imperatively */}
          {scanning && (
            <div ref={procRef} className="proc">
              <div ref={spinnerRef} className="proc-spin" />
              <p ref={titleRef}>Analyzing your lab report...</p>
              <div ref={barWrapRef} style={{ width: "100%", height: 4, background: "rgba(255,255,255,.08)", borderRadius: 2, overflow: "hidden", margin: "14px 0 18px" }}>
                <div ref={barRef} style={{ height: "100%", width: "0%", background: "linear-gradient(90deg,var(--bl),var(--grn))", borderRadius: 2, transition: "width .4s var(--ease)" }} />
              </div>
              <div ref={stepsRef} style={{ textAlign: "left", maxWidth: 240, margin: "0 auto" }} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={null}>
      <UploadContent />
    </Suspense>
  );
}
