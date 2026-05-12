'use client';

/* eslint-disable react/no-unescaped-entities */

import { inlineStyle } from "../shared/inlineStyle";
import { usePatientLandingEffects } from "./usePatientLandingEffects";
import { patientLandingStyles } from "./patientLanding.styles";

export function PatientLandingPage() {
  usePatientLandingEffects();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: patientLandingStyles }} />
      <div className="patient-page">
        
        <nav id="nav">
          <div className="nav-logo">
            <div className="nav-shield">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="nav-wordmark">Gut<em>Guard</em></span>
          </div>
          <a href="/doctor" className="nav-dr">Are you a physician?</a>
          <button className="nav-cta" data-scroll-target="offer">Start My BioScan →</button>
        </nav>
        
        
        <section id="hero">
          <div className="hero-noise"></div>
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
        
          <div className="hero-body">
            <div className="mx">
              <div className="hero-grid">
        
                
                <div className="hero-copy">
                  <div className="hero-tag rv"><div className="tag-dot"></div> For Filipinos 35–55</div>
                  <h1 className="hero-h1 rv d1">
                    Your doctor measures<br />disease.
                    <em>Nobody measures<br />what comes before it.</em>
                  </h1>
                  <p className="hero-body-copy rv d2">
                    <strong>That something is chronic inflammation</strong> — the documented upstream driver across virtually every major disease category. Your inflammatory load is measurable. It has a direction.</p>
                  <p className="hero-body-copy rv d3" style={inlineStyle("margin-bottom:0")}>
                  And once you can see the direction, <strong>you can change it.</strong> GutGuard BioScan puts a number on your inflammation. Your enrolled independent physician monitors your GLIS wellness score. A matched protocol moves it. <em style={inlineStyle("color:#fff;font-style:normal;font-weight:600")}>The direction is now yours.</em>
                  </p>
                  <div className="hero-btns rv d3">
                    <button className="btn-primary" data-scroll-target="offer">
                      Find My Score
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <button className="btn-ghost" data-scroll-target="how">
                      How it works
                    </button>
                  </div>
                  <div className="hero-trust rv d4">
                    <div className="trust-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>FDA-PH Registered</div>
                    <div className="trust-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Physician-reviewed</div>
                    <div className="trust-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>90-day guarantee</div>
                  </div>
                </div>
        
                
                <div className="hero-ring-side rv rv-r d2">
                  <div className="ring-wrap hero-ring">
                    <div className="ring-glow" id="heroGlow" style={inlineStyle("background:rgba(212,32,32,.5)")}></div>
                    <div className="ring-trk"></div>
                    <div className="ring-fill" id="heroRing"></div>
                    <div className="ring-ctr">
                      <span className="ring-score" id="heroScore" style={inlineStyle("color:#D42020")}>74</span>
                      <span className="ring-lbl">GLIS</span>
                    </div>
                  </div>
                  <div className="ring-verdict rv d3" id="heroVerdict" style={inlineStyle("color:#D42020;font-size:15px;font-weight:700")}>⚠ Elevated Inflammation</div>
                  <div className="ring-chips rv d4" id="heroChips">
                    <span className="chip-marker chip-hi">hs-CRP ↑</span>
                    <span className="chip-marker chip-hi">NLR ↑</span>
                    <span className="chip-marker chip-mid">Glucose ↑</span>
                    <span className="chip-marker chip-mid">Ferritin ↑</span>
                    <span className="chip-marker chip-ok">HDL ✓</span>
                    <span className="chip-marker chip-ok">ALT ✓</span>
                  </div>
                  <div className="ring-toggle rv d5">
                    <button className="rtog on" data-hero-state="before" id="rb0">Day 0 — Before</button>
                    <button className="rtog" data-hero-state="after" id="rb1">Day 90 — After →</button>
                  </div>
                </div>
        
              </div>
            </div>
          </div>
        </section>
        
        
        <section id="proof">
          <div className="mx">
            <div className="proof-row">
              <div className="proof-stat rv">
                <div className="proof-n" style={inlineStyle("color:var(--grn)")}><span data-count="127">0</span></div>
                <div className="proof-l">Patients enrolled*<br />& tracked</div>
              </div>
              <div className="proof-stat rv d1">
                <div className="proof-n" style={inlineStyle("color:var(--bl)")}>28<span style={inlineStyle("font-size:.55em;letter-spacing:0")}>pts</span></div>
                <div className="proof-l">Avg GLIS drop*<br />per 90-day cycle</div>
              </div>
              <div className="proof-stat rv d2">
                <div className="proof-n" style={inlineStyle("color:var(--gld)")}>48<span style={inlineStyle("font-size:.55em;letter-spacing:0")}>hrs</span></div>
                <div className="proof-l">Physician review<br />turnaround</div>
              </div>
              <div className="proof-stat rv d3">
                <div className="proof-n" style={inlineStyle("color:var(--ter)")}>3<span style={inlineStyle("font-size:.55em;letter-spacing:0")}>tx</span></div>
                <div className="proof-l">Physician re-scans<br />over 90 days</div>
              </div>
            </div>
          </div>
        </section>
        
        
        <section id="why">
          <div className="mx">
            <div className="section-tag rv" style={inlineStyle("color:var(--bl)")}>Published Research</div>
            <h2 className="section-h rv d1" style={inlineStyle("color:var(--d1)")}>
              Inflammation is the documented upstream<br />driver in virtually every major disease.
            </h2>
            <p className="section-body rv d2" style={inlineStyle("max-width:580px")}>
              Peer-reviewed literature links chronic low-grade inflammation to all of the following. You don't need to develop any of them. You need to know your direction before one of them becomes your diagnosis.
            </p>
        
            <div className="disease-grid">
              <div className="disease-card rv d1"><div className="disease-ico">❤️</div><div className="disease-lbl">Cardiovascular</div><div className="disease-note">CRP, NLR, fibrinogen</div></div>
              <div className="disease-card rv d2"><div className="disease-ico">🧠</div><div className="disease-lbl">Neurological</div><div className="disease-note">IL-6, TNF-α links</div></div>
              <div className="disease-card rv d3"><div className="disease-ico">🩸</div><div className="disease-lbl">Metabolic</div><div className="disease-note">Insulin resistance</div></div>
              <div className="disease-card rv d4"><div className="disease-ico">🦠</div><div className="disease-lbl">Autoimmune</div><div className="disease-note">Gut-immune axis</div></div>
              <div className="disease-card rv d5"><div className="disease-ico">🫁</div><div className="disease-lbl">Pulmonary</div><div className="disease-note">Airways, surfactant</div></div>
              <div className="disease-card rv d5"><div className="disease-ico">🦴</div><div className="disease-lbl">Musculoskeletal</div><div className="disease-note">Joint, tendon load</div></div>
            </div>
        
            <div className="inflammation-bar rv d2">
              <div className="ibar-label">Inflammatory Load — Where Are You On This Spectrum?</div>
              <div className="ibar-track"><div className="ibar-fill" id="ibarFill" style={inlineStyle("width:0%")}></div></div>
              <div className="ibar-markers">
                <span className="ibar-m" style={inlineStyle("color:var(--grn)")}>Optimal</span>
                <span className="ibar-m" style={inlineStyle("color:var(--gld)")}>Elevated</span>
                <span className="ibar-m" style={inlineStyle("color:var(--ter)")}>High</span>
                <span className="ibar-m" style={inlineStyle("color:var(--red)")}>Critical</span>
              </div>
            </div>
          </div>
        </section>
        
        
        
        <div style={inlineStyle("background:rgba(59,130,200,.07);border-top:1px solid rgba(59,130,200,.14);border-bottom:1px solid rgba(59,130,200,.14);padding:clamp(16px,3vh,22px) clamp(20px,5vw,48px);text-align:center;")}>
          <p style={inlineStyle("font-size:clamp(14px,2.5vw,15px);color:rgba(255,255,255,.55);max-width:720px;margin:0 auto;line-height:1.75;")}>
            <strong style={inlineStyle("color:rgba(255,255,255,.75);")}>The information above is educational only.</strong>
            GutGuard BioScan is a wellness monitoring service — not a diagnostic test and not a treatment for any disease.
            The GLIS score does not replace your doctor&#8217;s diagnosis or any prescribed medical treatment.
            Always continue any treatment your physician has prescribed.
          </p>
        </div>
        
        
        <section id="how">
          <div className="mx">
            <h2 className="section-h rv" style={inlineStyle("color:#fff;margin-bottom:clamp(10px,2vh,14px)")}>Control the Direction.</h2>
            <p className="rv d1" style={inlineStyle("font-size:clamp(17px,3.5vw,22px);font-weight:800;letter-spacing:-.03em;color:var(--grn);margin-bottom:0")}>Three steps. 48 hours.</p>
            <p style={inlineStyle("font-size:clamp(16px,2.5vw,18px);color:rgba(255,255,255,.55);max-width:480px;line-height:1.75;margin-bottom:0")} className="rv d2">
              No new blood draw required. Your existing CBC or metabolic panel contains everything we need.
            </p>
        
            <div className="steps">
              <div className="step-row rv">
                <div className="step-num">1</div>
                <div className="step-body">
                  <div className="step-h">Upload your existing blood panel</div>
                  <p className="step-p">Any recent CBC, lipid panel, or metabolic panel from your clinic or laboratory. We extract 8 inflammatory markers from what you already have — no new blood draw, no clinic visit.</p>
                  <div className="step-badge">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    10 minutes from your phone
                  </div>
                </div>
              </div>
              <div className="step-row rv d1">
                <div className="step-num" style={inlineStyle("background:rgba(212,168,64,.12);border-color:rgba(212,168,64,.22);color:var(--gld)")}>2</div>
                <div className="step-body">
                  <div className="step-h">A physician reviews your 8 markers</div>
                  <p className="step-p">An independent licensed physician reviews your BioScan through the GutGuard platform within 48 hours. They calculate your GLIS score from the 8 markers, assess your inflammatory trajectory, and approve your protocol.</p>
                  <div className="step-badge" style={inlineStyle("background:rgba(212,168,64,.1);border-color:rgba(212,168,64,.18);color:var(--gld)")}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Licensed Philippine physician
                  </div>
                </div>
              </div>
              <div className="step-row rv d2">
                <div className="step-num" style={inlineStyle("background:rgba(92,184,130,.12);border-color:rgba(92,184,130,.22);color:var(--grn)")}>3</div>
                <div className="step-body">
                  <div className="step-h">Your physician-approved GutGuard Lifestyle Protocol activates. Your score moves.</div>
                  <p className="step-p">Your Pre→Pro→Postbiotic formula is matched to your specific GLIS score — not a generic protocol. Re-scanned at Day 30, 60, and 90. If the score isn't moving at Day 30, your physician adjusts the protocol.</p>
                  <div className="step-badge" style={inlineStyle("background:rgba(92,184,130,.1);border-color:rgba(92,184,130,.18);color:var(--grn)")}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    Monitored every 30 days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        
        <section id="markers">
          <div className="mx">
            <div className="section-tag rv" style={inlineStyle("color:var(--bl)")}>The BioScan</div>
            <h2 className="section-h rv d1" style={inlineStyle("color:var(--d1)")}>Eight markers.<br />One direction.</h2>
            <p className="section-body rv d2" style={inlineStyle("max-width:520px;margin-bottom:0")}>
              The GLIS score is calculated from 8 markers your doctor already orders. Each one is a documented inflammatory signal. Together they give a number — and a trajectory.
            </p>
            <div className="markers-grid">
              <div className="mk rv d1"><div className="mk-name">hs-CRP</div><div className="mk-full">High-sensitivity C-Reactive Protein</div><div className="mk-role">Primary Inflammation Marker</div></div>
              <div className="mk rv d2"><div className="mk-name">NLR</div><div className="mk-full">Neutrophil-Lymphocyte Ratio</div><div className="mk-role">Immune Stress Index</div></div>
              <div className="mk rv d3"><div className="mk-name">Ferritin</div><div className="mk-full">Serum Ferritin Level</div><div className="mk-role">Iron / Inflammatory Store</div></div>
              <div className="mk rv d4"><div className="mk-name">Glucose (FBS)</div><div className="mk-full">Fasting Blood Sugar</div><div className="mk-role">Metabolic Load Driver</div></div>
              <div className="mk rv d1"><div className="mk-name">HDL-C</div><div className="mk-full">High-Density Lipoprotein</div><div className="mk-role">Anti-Inflammatory Indicator</div></div>
              <div className="mk rv d2"><div className="mk-name">ALT</div><div className="mk-full">Alanine Aminotransferase</div><div className="mk-role">Hepatic Stress Signal</div></div>
              <div className="mk rv d3"><div className="mk-name">Uric Acid</div><div className="mk-full">Serum Uric Acid</div><div className="mk-role">Oxidative Stress Marker</div></div>
              <div className="mk rv d4"><div className="mk-name">Lymphocyte %</div><div className="mk-full">Differential Lymphocyte Count</div><div className="mk-role">Immune System Capacity</div></div>
            </div>
        
            <div className="formula-strip rv d2">
              <div className="formula-item">
                <div className="formula-num">Component 1</div>
                <div className="formula-name">Prebiotics</div>
                <div className="formula-ing">Patented prebiotics — feeds the gut microbiome selectively</div>
              </div>
              <div className="formula-item">
                <div className="formula-num">Component 2</div>
                <div className="formula-name">Probiotics</div>
                <div className="formula-ing">Nano-encapsulated target-specific strains — reaches the gut alive</div>
              </div>
              <div className="formula-item">
                <div className="formula-num">Component 3 — Postbiotics</div>
                <div className="formula-name">Urolithin-A · L-Tryptophan</div>
                <div className="formula-ing">Activates the Mitochondria Bio-regeneration System (MBS)</div>
              </div>
            </div>
          </div>
        </section>
        
        
        <div style={inlineStyle("background:rgba(59,130,200,.06);border-top:1px solid rgba(59,130,200,.14);border-bottom:1px solid rgba(59,130,200,.14);padding:14px clamp(20px,5vw,48px);text-align:center")}>
          <p style={inlineStyle("font-size:13px;color:rgba(255,255,255,.5);line-height:1.7;max-width:720px;margin:0 auto")}>
            <strong style={inlineStyle("color:rgba(255,255,255,.65)")}>Important:</strong>
            The research associations above are drawn from peer-reviewed literature and describe population-level findings — they are not product claims.
            GutGuard SynBIOTIC+ is a licensed lifestyle food supplement, not a treatment for any disease.
            The GLIS score is an internal wellness monitoring framework — it has not been independently peer-reviewed or validated as a clinical diagnostic instrument.
            Continue any treatment prescribed by your physician.
          </p>
        </div>
        
        
        <section id="offer">
          <div className="mx">
            <div className="section-tag rv" style={inlineStyle("color:rgba(255,255,255,.38)")}>The Protocol</div>
            <h2 className="section-h rv d1" style={inlineStyle("color:#fff")}>
              Not a supplement.<br /><em style={inlineStyle("font-style:normal;color:var(--grn)")}>A direction — with a doctor watching it change.</em>
            </h2>
            <p style={inlineStyle("font-size:clamp(16px,2.5vw,18px);color:rgba(255,255,255,.55);max-width:520px;line-height:1.75;margin-bottom:0")} className="rv d2">
              Choose the protocol that matches your commitment. Every tier includes physician BioScan review, GLIS scoring, and a matched Pre→Pro→Postbiotic formula. Higher tiers extend your monitoring and supply.
            </p>
        
        
            
            <div style={inlineStyle("border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 18px;margin-bottom:24px;background:rgba(255,255,255,.04);")}>
              <p style={inlineStyle("font-size:clamp(14px,2.5vw,14px);color:rgba(255,255,255,.5);line-height:1.7;margin:0;")}>
                <strong style={inlineStyle("color:rgba(255,255,255,.65);")}>Important:</strong>
                GutGuard SynBIOTIC+ is a licensed lifestyle food supplement — not a prescription medicine.
                The GLIS score is a wellness indicator — not a medical diagnosis.
                Do not discontinue any prescribed medication or treatment based on your GLIS score.
                Always consult your physician.
              </p>
            </div>
        
            
            <div className="proto-grid">
        
              <div className="proto-card rv d1">
                <div className="proto-name">Trial</div>
                <div className="proto-caps">10 capsules · 1 bottle · 1 BioScan</div>
                <div className="proto-cap-price">₱130</div>
                <div className="proto-cap-label">per capsule</div>
                <div className="proto-price">₱1,299 total · 10 caps</div>
                <div className="proto-scans">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  1 BioScan review included
                </div>
                <a href="/patient" className="proto-cta">Start Trial →</a>
              </div>
        
              <div className="proto-card rv d2">
                <div className="proto-name">Start</div>
                <div className="proto-caps">40 capsules · 4 bottles · 1 BioScan</div>
                <div className="proto-cap-price">₱115</div>
                <div className="proto-cap-label">per capsule</div>
                <div className="proto-price">₱4,900 total · 40 caps</div>
                <div className="proto-scans">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  1 BioScan review included
                </div>
                <a href="/patient" className="proto-cta">Start Protocol →</a>
              </div>
        
              <div className="proto-card recommended rv d3">
                <div className="proto-rec-badge">Most chosen</div>
                <div className="proto-name">Grow</div>
                <div className="proto-caps">120 capsules · 12 bottles · 3 BioScans</div>
                <div className="proto-cap-price">₱103</div>
                <div className="proto-cap-label">per capsule</div>
                <div className="proto-price">₱13,000 total · 120 caps</div>
                <div className="proto-scans">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  3 BioScan reviews · Day 0, 45, 90
                </div>
                <a href="/patient" className="proto-cta">Start Grow →</a>
              </div>
        
              <div className="proto-card rv d4">
                <div className="proto-name">Power</div>
                <div className="proto-caps">400 capsules · 40 bottles · 3 BioScans</div>
                <div className="proto-cap-price">₱87</div>
                <div className="proto-cap-label">per capsule</div>
                <div className="proto-price">₱39,000 total · 400 caps</div>
                <div className="proto-scans">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  3 BioScan reviews · full-cycle supply
                </div>
                <a href="/patient" className="proto-cta">Start Power →</a>
              </div>
        
            </div>
        
            
            <div className="rv d2" style={inlineStyle("margin-top:20px;padding:18px 22px;background:rgba(59,130,200,.07);border:1px solid rgba(59,130,200,.16);border-radius:14px")}>
              <div style={inlineStyle("font-size:13px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:var(--bl);margin-bottom:10px")}>Every tier includes</div>
              <div style={inlineStyle("display:flex;flex-wrap:wrap;gap:10px 24px")}>
                <span style={inlineStyle("font-size:15px;color:rgba(255,255,255,.72);display:flex;align-items:center;gap:6px")}><span style={inlineStyle("color:var(--grn);font-weight:700")}>✓</span>BioScan + GLIS Score</span>
                <span style={inlineStyle("font-size:15px;color:rgba(255,255,255,.72);display:flex;align-items:center;gap:6px")}><span style={inlineStyle("color:var(--grn);font-weight:700")}>✓</span>Physician review &amp; approval</span>
                <span style={inlineStyle("font-size:15px;color:rgba(255,255,255,.72);display:flex;align-items:center;gap:6px")}><span style={inlineStyle("color:var(--grn);font-weight:700")}>✓</span>Matched Pre→Pro→Postbiotic formula</span>
                <span style={inlineStyle("font-size:15px;color:rgba(255,255,255,.72);display:flex;align-items:center;gap:6px")}><span style={inlineStyle("color:var(--grn);font-weight:700")}>✓</span>Urolithin-A + L-Tryptophan Postbiotics</span>
                <span style={inlineStyle("font-size:15px;color:rgba(255,255,255,.72);display:flex;align-items:center;gap:6px")}><span style={inlineStyle("color:var(--grn);font-weight:700")}>✓</span>90-day money-back guarantee</span>
              </div>
            </div>
        
            
            <div className="rv d3" style={inlineStyle("margin-top:28px")}>
              <div className="doc-strip">
                <div className="doc-top">
                  <div className="doc-avatar">👨‍⚕️</div>
                  <div>
                    <div className="doc-name">Dr. Shane Animas, MD</div>
                    <div className="doc-title">Medical Director (oversight & advisory) · GutGuard Protocol Center · Internal Medicine</div>
                  </div>
                </div>
                <div className="doc-quote">
                  "Every patient who submits a BioScan gets a physician's eyes on their data before anything is activated. The protocol is matched to a specific GLIS number — not a generic template. If the score isn't moving at Day 30, we adjust it."
                </div>
                <div className="doc-stats">
                  <div className="ds"><div className="ds-n" style={inlineStyle("color:var(--grn)")} data-count="127">0</div><div className="ds-l">Protocols reviewed</div></div>
                  <div className="ds"><div className="ds-n" style={inlineStyle("color:var(--bl)")}>48h</div><div className="ds-l">Review turnaround</div></div>
                  <div className="ds"><div className="ds-n" style={inlineStyle("color:var(--gld)")}>PRC<br /><span style={inlineStyle("font-size:13px")}>Verified</span></div><div className="ds-l">Licensed physician</div></div>
                </div>
              </div>
            </div>
        
          </div>
        </section>
        
        
        
        <section id="voices">
          <div className="mx">
            <div className="section-tag rv" style={inlineStyle("color:var(--bl)")}>Patient Stories</div>
            <h2 className="section-h rv d1" style={inlineStyle("color:var(--d1)")}>
              What it looks like<br />when the number moves.
            </h2>
            <p className="section-body rv d2" style={inlineStyle("max-width:520px")}>
              Two patients. Same frustration — "normal labs" while feeling everything but normal. Different scores, same direction.
            </p>
        
            <div className="viber-cols">
        
              
              <div className="viber-thread rv rv-up">
                <div className="viber-header">
                  <div className="viber-av" style={inlineStyle("background:var(--ter)")}>MC</div>
                  <div>
                    <div className="viber-dr-name">M. Cruz, 47</div>
                    <div className="viber-dr-spec">Grow Protocol · GenSan · GLIS 68 → 29</div>
                  </div>
                </div>
                <div className="viber-body">
                  <div className="chat-bubble chat-in">Parang ang OA ko pero I've been exhausted for two years. Bloodwork lagi "within normal limits."</div>
                  <div className="chat-bubble chat-out">That's exactly what GLIS 68 looks like. Your hs-CRP and NLR are both in the high-normal zone — technically fine individually, but together they tell a different story.</div>
                  <div className="chat-bubble chat-in">Day 30 na. GLIS ko 51 na. Hindi pa dramatic pero I actually slept through the night for the first time in months.</div>
                  <div className="chat-bubble chat-out">That tracks — the sleep improvement usually shows before the score drops significantly. Day 60 re-scan is next. Keep going.</div>
                  <div className="chat-bubble chat-in">Day 90. GLIS 29. Diba 68 siya dati? Hindi ko mapigilang iyak 😭</div>
                  <div className="chat-time">✓✓ Read</div>
                </div>
              </div>
        
              
              <div className="viber-thread rv rv-up rv-d1">
                <div className="viber-header">
                  <div className="viber-av" style={inlineStyle("background:var(--grn)")}>RB</div>
                  <div>
                    <div className="viber-dr-name">R. Buenaventura, 52</div>
                    <div className="viber-dr-spec">Power Protocol · Davao · GLIS 74 → 31</div>
                  </div>
                </div>
                <div className="viber-body">
                  <div className="chat-bubble chat-in">My doctor says I'm healthy. But my knees, my back — parang every day may inflammation. Sabi ko nga "doctor-healthy" lang ako.</div>
                  <div className="chat-bubble chat-out">GLIS 74. You're right that your standard labs look fine — but your NLR is 3.9 and ferritin is elevated. That's a real signal. You're not imagining it.</div>
                  <div className="chat-bubble chat-in">Finally. Someone said it's real. Sige, anong protocol?</div>
                  <div className="chat-bubble chat-out">Power Protocol for your score range. Day 30 re-scan scheduled — we'll see the first movement there.</div>
                  <div className="chat-bubble chat-in">Day 90 na. 31 na yung GLIS ko. Yung knees ko — I can go up stairs without stopping now. Unbelievable.</div>
                  <div className="chat-time">✓✓ Read</div>
                </div>
              </div>
        
            </div>
          </div>
        </section>
        
        
        <section id="guarantee">
          <div className="mx">
            <div className="guar-wrap rv">
              <div className="guar-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--grn)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h3 className="guar-h">The Number Moves or the Money Does.</h3>
                <p className="guar-p">Complete 90 days. Follow the protocol. If your GLIS score doesn't show measurable improvement — your supplement cost comes back in full. No forms. No arguments. Cash back to the same account you paid from.</p>
              </div>
            </div>
          </div>
        </section>
        
        
        <section id="qualify">
          <div className="mx">
            <div className="section-tag rv" style={inlineStyle("color:rgba(255,255,255,.35)")}>Honest About Fit</div>
            <h2 className="section-h rv d1" style={inlineStyle("color:#fff")}>This is not for everyone.<br />We mean that.</h2>
            <div className="qualify-grid">
              <div className="qual-card qual-yes rv d1">
                <div className="qual-head">Good fit ✓</div>
                <div className="qual-item"><div className="qual-dot">✓</div><span>Filipino adults 35–60 with fatigue, joint pain, or brain fog their labs call "normal"</span></div>
                <div className="qual-item"><div className="qual-dot">✓</div><span>Anyone with a family history of cardiovascular, metabolic, or autoimmune disease</span></div>
                <div className="qual-item"><div className="qual-dot">✓</div><span>People who have recent bloodwork and want to know what it's actually telling them</span></div>
                <div className="qual-item"><div className="qual-dot">✓</div><span>Those who want a physician watching their direction — not just a pill</span></div>
              </div>
              <div className="qual-card qual-no rv d2">
                <div className="qual-head">Not a fit ✗</div>
                <div className="qual-item"><div className="qual-dot">✗</div><span>Anyone expecting symptom relief in the first two weeks — this is a 90-day trajectory protocol</span></div>
                <div className="qual-item"><div className="qual-dot">✗</div><span>Those currently on immunosuppressants or biologics — consult your specialist first</span></div>
                <div className="qual-item"><div className="qual-dot">✗</div><span>Pregnant or breastfeeding — not evaluated for this group</span></div>
                <div className="qual-item"><div className="qual-dot">✗</div><span>Anyone looking for a diagnosis — GLIS is a wellness score, not a clinical test</span></div>
              </div>
            </div>
          </div>
        </section>
        
        
        <section id="close">
          <div className="close-orb"></div>
          <div className="mx-xs close-inner">
            <h2 className="close-h rv">
              Somewhere between your last clean blood test
              and <em>"We need to talk"</em> is a window.
            </h2>
            <p className="close-sub rv d1">Most people don't know the window exists. Most find out it closed from a specialist's office. You're finding out now.</p>
            <div className="close-cta-wrap rv d2">
              <a href="/patient" className="btn-primary" style={inlineStyle("font-size:18px;padding:20px 40px")}>
                Start My BioScan →
              </a>
              <div className="close-proof">
                <span className="close-proof-item">Existing labs only</span>
                <span className="close-proof-item">48-hour physician review</span>
                <span className="close-proof-item">90-day money-back</span>
                <span className="close-proof-item">FDA-PH registered</span>
              </div>
            </div>
          </div>
        </section>
        
        
        <footer>
          <div className="mx">
            <div className="ft-top">
              <div className="ft-logo">Gut<em>Guard</em></div>
              <div className="ft-links">
                <a href="/doctor" className="ft-link">Are you a physician?</a>
                <a href="/patient" className="ft-link">Patient Portal</a>
                <a href="#" className="ft-link">Privacy Policy</a>
                <a href="#" className="ft-link">Terms</a>
                <a href="#" className="ft-link">Refund Policy</a>
                <a href="#" className="ft-link">Contact</a>
              </div>
            </div>
            <div className="ft-disc">
              <strong>FDA-PH · CPR FR-4XXXXXXX · Medical Director (advisory): Dr. Shane Animas, MD · PRC Lic. 0098732 · Internal Medicine · General Santos City</strong>
              GutGuard SynBIOTIC+ is a licensed lifestyle food supplement (FDA-PH CPR FR-4XXXXXXX · LTO FDO-XXXXXXX). It is not intended to diagnose, treat, cure, or prevent any disease. The GLIS (Lifestyle Inflammation Score) is a proprietary wellness monitoring framework — not a clinical diagnostic instrument. The GLIS methodology is developed internally and has not been independently peer-reviewed or validated as a clinical instrument. Protocol assignment is a supplement recommendation, not a prescription act under RA 9173 or the Medical Act. Research associations are drawn from published peer-reviewed literature and do not constitute product claims. Individual results vary. *Outcome data from internal observational tracking (n=127, Apr 2025–Mar 2026) — not a peer-reviewed clinical trial. Not representative of all users. Outcome data from internal tracking of enrolled completers — not a peer-reviewed clinical trial. BioScan reviews are conducted by enrolled GutGuard Protocol Center physicians; Dr. Shane Animas serves as Medical Director in an oversight and advisory capacity per RA 2382. Patient data processed under RA 10173 (Data Privacy Act) — patient consent required before BioScan submission. Protocol credit redemptions via vRedeem constitute taxable income under the Philippine NIRC (BIR). Physician participation subject to PMA Code of Ethics. GutGuard's liability is limited to the purchase price of the protocol in the 12 months preceding any claim. Always consult your physician before starting any supplement protocol. Compliant with RA 9711, RA 7394, RA 10173, and applicable FDA-PH regulations.
            </div>
          </div>
        </footer>
        
        
        <div id="sticky">
          <div className="sk-l">
            <div className="sk-title">GutGuard Protocol</div>
            <div className="sk-sub">Trial ₱1,299 · Grow ₱13,000 · Physician-reviewed</div>
          </div>
          <a href="/patient" className="sk-btn">Start My BioScan →</a>
        </div>
        
        <a id="wa" href="https://wa.me/639XXXXXXXXX?text=Hi%2C+I%27d+like+to+ask+about+GutGuard+BioScan" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">💬</a>
      </div>
    </>
  );
}
