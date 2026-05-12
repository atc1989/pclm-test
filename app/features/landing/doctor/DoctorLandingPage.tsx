'use client';

/* eslint-disable react/no-unescaped-entities */

import { inlineStyle } from "../shared/inlineStyle";
import { useDoctorLandingEffects } from "./useDoctorLandingEffects";
import { doctorLandingStyles } from "./doctorLanding.styles";

export function DoctorLandingPage() {
  useDoctorLandingEffects();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: doctorLandingStyles }} />
      <div className="doctor-page">
        
        <nav id="nav">
          <a href="/home" className="nav-logo" aria-label="GutGuard patient home">
            <div className="nav-mark"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            <span className="nav-name">GutGuard</span>
            <span className="nav-for">For Physicians</span>
          </a>
          <div className="nav-r">
            <a href="/auth/login" className="nav-in">Already enrolled? Sign In</a>
            <button className="nav-btn" data-scroll-target="cta">Activate Portal →</button>
          </div>
        </nav>
        
        
        <section id="hero">
          <div className="hero-glow hero-glow-1"></div>
          <div className="hero-glow hero-glow-2"></div>
          <div className="hero-body">
            <div className="mx">
              <div className="hero-grid">
        
                
                <div className="hero-ring-side">
                  <div className="ring-free">
                    <div className="ring-glow-bg" id="ringGlow"></div>
                    <div className="ring-trk"></div>
                    <div className="ring-fill" id="rFill"></div>
                    <div className="ring-center">
                      <div className="ring-num" id="rNum" style={inlineStyle("color:var(--red)")}>—</div>
                      <div className="ring-lbl">GLIS</div>
                    </div>
                    
                    <div className="ring-data rd-crp" id="rdCrp"><div className="ring-data-name">hs-CRP</div><div className="ring-data-val">8.4 <span className="ring-data-flag" style={inlineStyle("color:var(--red)")}>↑</span></div>
                    </div>
                    <div className="ring-data rd-nlr" id="rdNlr"><div className="ring-data-name">NLR</div><div className="ring-data-val">3.8 <span className="ring-data-flag" style={inlineStyle("color:var(--ter)")}>↑</span></div>
                    </div>
                    <div className="ring-data rd-hdl" id="rdHdl"><div className="ring-data-name">HDL</div><div className="ring-data-val">52 <span className="ring-data-flag" style={inlineStyle("color:var(--grn)")}>✓</span></div>
                    </div>
                    <div className="ring-data rd-glu" id="rdGlu"><div className="ring-data-name">Glucose</div><div className="ring-data-val">112 <span className="ring-data-flag" style={inlineStyle("color:var(--ter)")}>↑</span></div>
                    </div>
                  </div>
                  <div className="ring-verdict" id="rVerdict">
                    <strong id="rVerdictStrong" style={inlineStyle("color:var(--red)")}>Elevated Inflammation</strong><br />
                    Metabolic + immune drivers. Protocol recommended.
                  </div>
                  <div className="ring-chips" id="rChips">
                    <span className="ring-chip hi">CRP ↑</span>
                    <span className="ring-chip mid">NLR ↑</span>
                    <span className="ring-chip mid">Glucose ↑</span>
                    <span className="ring-chip ok">HDL ✓</span>
                    <span className="ring-chip ok">ALT ✓</span>
                    <span className="ring-chip ok">Lymph ✓</span>
                  </div>
                  <div style={inlineStyle("margin-top:12px;font-size:13px;color:rgba(255,255,255,.35);text-align:center")}>Live demo · updates every 5s</div>
                </div>
        
                
                <div className="hero-copy">
                  <div style={inlineStyle("display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:10px;padding:3px 10px;border-radius:100px;border:1px solid rgba(255,255,255,.08)")}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>For Licensed Physicians Only · Philippines</div>
                  <div className="hero-tag">
                    <div className="hero-tag-pulse"></div>
                    For Healthcare Professionals · Philippines
                  </div>
                  <h1 className="hero-h1">
                    Every scan tells you <span className="hl2">where they&#8217;re going.</span>
                  </h1>
                  <p className="hero-sub">
                    GutGuard BioScan tracks inflammatory trajectory across multiple panels. Eight markers. One score. A direction your patients can see moving.
                  </p>
                  <div className="hero-btns">
                    <button className="btn-p" data-scroll-target="cta">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Activate Your Physician Portal
                    </button>
                    <a href="#clinical" className="btn-g">
                      How it works
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
                    </a>
                  </div>
                  <div className="hero-creds">
                    <div className="hero-cred"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> DOST-accredited</div>
                    <div className="hero-cred"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> FDA CPR Licensed</div>
                    <div className="hero-cred"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> 7 institutions</div>
                    <div className="hero-cred"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> GenSan · Dr. Shane Animas</div>
                  </div>
                </div>
        
              </div>
            </div>
          </div>
        </section>
        
        
        <div id="proof">
          <div className="mx">
            <div className="proof-inner">
              <div className="proof-big rv rv-left">
                <span>28</span><sup>pts</sup>
                <div className="proof-big-label">Avg BioScan<br />score drop / cycle</div>
              </div>
              <div className="proof-stats">
                <div className="rv rv-up">
                  <div className="proof-stat-n" data-count="127" style={inlineStyle("color:#fff")}>0</div>
                  <div className="proof-stat-l">Patients reviewed</div>
                  <div className="proof-stat-note">Apr 2025 – Mar 2026</div>
                </div>
                <div className="rv rv-up rv-d1">
                  <div className="proof-stat-n" style={inlineStyle("color:var(--gld)")}>12 min</div>
                  <div className="proof-stat-l">Avg review time</div>
                  <div className="proof-stat-note">Fits between consultations</div>
                </div>
                <div className="rv rv-up rv-d2">
                  <div className="proof-stat-n" style={inlineStyle("color:var(--bl)")}>480+</div>
                  <div className="proof-stat-l">BioScans reviewed</div>
                  <div className="proof-stat-note">Apr 2025 – Mar 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        
        <section id="clinical">
          <div className="mx">
            <div className="clinical-split">
              <div>
                <div className="section-tag rv rv-up" style={inlineStyle("color:var(--bl)")}>The Clinical Workflow</div>
                <h2 className="section-h2 rv rv-up" style={inlineStyle("color:var(--d1)")}>What the review actually involves</h2>
                <p className="section-body rv rv-up" style={inlineStyle("color:var(--d3)")}>A patient uploads their existing blood panel from any Philippine lab — Hi-Precision, St. Luke's, The Medical City. You receive a structured summary in your portal, not a raw image. You review, note, and assign. You never see the patient in person.</p>
                <div className="time-badge rv rv-up">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  Average review time: 12 minutes
                </div>
                <div className="step-list">
                  <div className="step-row rv rv-left">
                    <div className="step-n">1</div>
                    <div>
                      <div className="step-title">Patient uploads their blood panel</div>
                      <div className="step-desc">Patient photographs their lab result or uploads PDF. Eight markers extract automatically. You get a clean structured summary — not a raw image, not a form to fill.</div>
                      <div className="step-time"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Patient side — nothing from you yet</div>
                    </div>
                  </div>
                  <div className="step-row rv rv-left rv-d1">
                    <div className="step-n">2</div>
                    <div>
                      <div className="step-title">You review GLIS and assign a protocol</div>
                      <div className="step-desc">Your portal shows all eight markers and the computed GLIS score. You review, modify if clinically indicated, add an observation, and approve. One confirmation tap.</div>
                      <div className="step-time"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Your active time: 8–15 minutes</div>
                    </div>
                  </div>
                  <div className="step-row rv rv-left rv-d2">
                    <div className="step-n">3</div>
                    <div>
                      <div className="step-title">Patient receives protocol, you earn credits</div>
                      <div className="step-desc">Patient portal activates with their assigned protocol and Viber confirmation. Your clinical credit logs immediately. Redeemable via vRedeem — no minimum threshold.</div>
                      <div className="step-time"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Credit logged immediately</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="section-tag rv rv-up" style={inlineStyle("color:var(--grn)")}>Eight Markers</div>
                <h2 className="section-h2 rv rv-up" style={inlineStyle("color:var(--d1)")}>What GLIS reads from a standard Philippine lab panel</h2>
                <p className="section-body rv rv-up" style={inlineStyle("color:var(--d3)")}>Every marker is already on a standard CBC + metabolic panel. No additional tests required. Most Filipino patients presenting with fatigue, joint pain, or poor sleep already have these results.</p>
                <div className="markers-grid">
                  <div className="mk-card rv rv-scale"><div className="mk-name">hs-CRP</div><div className="mk-full">High-sensitivity C-reactive protein</div><div className="mk-tag">Primary inflammatory signal</div></div>
                  <div className="mk-card rv rv-scale rv-d1"><div className="mk-name">WBC</div><div className="mk-full">White blood cell count</div><div className="mk-tag">Immune activation load</div></div>
                  <div className="mk-card rv rv-scale rv-d1"><div className="mk-name">NLR</div><div className="mk-full">Neutrophil-to-lymphocyte ratio</div><div className="mk-tag">Systemic inflammatory stress</div></div>
                  <div className="mk-card rv rv-scale rv-d2"><div className="mk-name">Fasting Glucose</div><div className="mk-full">Fasting blood glucose</div><div className="mk-tag">Metabolic inflammation driver</div></div>
                  <div className="mk-card rv rv-scale rv-d2"><div className="mk-name">Triglycerides</div><div className="mk-full">Serum triglycerides</div><div className="mk-tag">Lipid-based inflammatory load</div></div>
                  <div className="mk-card rv rv-scale rv-d3"><div className="mk-name">HDL</div><div className="mk-full">High-density lipoprotein</div><div className="mk-tag">Anti-inflammatory capacity</div></div>
                  <div className="mk-card rv rv-scale rv-d3"><div className="mk-name">ALT</div><div className="mk-full">Alanine aminotransferase</div><div className="mk-tag">Hepatic inflammation indicator</div></div>
                  <div className="mk-card rv rv-scale rv-d4"><div className="mk-name">Lymphocytes</div><div className="mk-full">Lymphocyte count / %</div><div className="mk-tag">Immune regulation balance</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="trajectory" style={inlineStyle("background:var(--bg);padding:clamp(48px,8vh,80px) 0;border-top:1px solid rgba(255,255,255,.06)")}>
          <div className="mx">
            <div className="section-tag rv rv-up" style={inlineStyle("color:rgba(255,255,255,.35)")}>Across Three Scans</div>
            <h2 className="section-h2 rv rv-up" style={inlineStyle("color:#fff")}>This is what direction looks like</h2>
            <div className="traj-card rv rv-up" style={inlineStyle("margin-top:clamp(20px,4vh,32px)")}>
              <div className="traj-hd">
                <div>
                  <div className="traj-hd-label">Patient BioScan Trajectory</div>
                  <div className="traj-hd-sub">J.D. · 38 y/o · GutGuard Power Protocol · Reviewed by Dr. Shane Animas, MD</div>
                </div>
                <div className="traj-hd-badge"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Improving</div>
              </div>
              <div className="traj-chart-wrap">
                <svg id="trajSVG" className="traj-svg" viewBox="0 0 600 210" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="seg1Grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#D42020"/><stop offset="100%" stopColor="#E8772E"/></linearGradient>
                    <linearGradient id="seg2Grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#E8772E"/><stop offset="100%" stopColor="#5CB882"/></linearGradient>
                    <filter id="dotGlow"><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  </defs>
                  
                  <rect x="50" y="20" width="500" height="50"  rx="4" fill="rgba(212,32,32,.08)"/>
                  <rect x="50" y="70" width="500" height="49"  rx="4" fill="rgba(232,119,46,.06)"/>
                  <rect x="50" y="119" width="500" height="55" rx="4" fill="rgba(92,184,130,.07)"/>
                  <text x="46" y="50" fontSize="20" fontFamily="Outfit,sans-serif" fontWeight="700" fill="rgba(212,32,32,.5)" textAnchor="end">HIGH</text>
                  <text x="46" y="100" fontSize="20" fontFamily="Outfit,sans-serif" fontWeight="700" fill="rgba(232,119,46,.5)" textAnchor="end">MOD</text>
                  <text x="46" y="148" fontSize="20" fontFamily="Outfit,sans-serif" fontWeight="700" fill="rgba(92,184,130,.55)" textAnchor="end">LOW</text>
                  <line x1="50" x2="550" y1="70"  y2="70"  stroke="rgba(255,255,255,.06)" strokeWidth="1"/>
                  <line x1="50" x2="550" y1="119" y2="119" stroke="rgba(255,255,255,.06)" strokeWidth="1"/>
                  
                  <line id="trajSeg1" x1="130" y1="64" x2="300" y2="95"  stroke="url(#seg1Grad)" strokeWidth="2.5" strokeLinecap="round" style={inlineStyle("stroke-dasharray:1;stroke-dashoffset:1")}/>
                  <line id="trajSeg2" x1="300" y1="95" x2="470" y2="125" stroke="url(#seg2Grad)" strokeWidth="2.5" strokeLinecap="round" style={inlineStyle("stroke-dasharray:1;stroke-dashoffset:1")}/>
                  
                  <circle id="d1halo" cx="130" cy="64"  r="0" fill="rgba(212,32,32,.2)"/>
                  <circle id="d2halo" cx="300" cy="95"  r="0" fill="rgba(232,119,46,.2)"/>
                  <circle id="d3halo" cx="470" cy="125" r="0" fill="rgba(92,184,130,.2)"/>
                  
                  <circle id="d1" cx="130" cy="64"  r="0" fill="#D42020" stroke="rgba(255,255,255,.15)" strokeWidth="2" filter="url(#dotGlow)"/>
                  <circle id="d2" cx="300" cy="95"  r="0" fill="#E8772E" stroke="rgba(255,255,255,.15)" strokeWidth="2" filter="url(#dotGlow)"/>
                  <circle id="d3" cx="470" cy="125" r="0" fill="#5CB882" stroke="rgba(255,255,255,.15)" strokeWidth="2" filter="url(#dotGlow)"/>
                  
                  <g id="tpLabels" opacity="0">
                    <rect x="104" y="30" width="52" height="24" rx="6" fill="rgba(212,32,32,.15)" stroke="rgba(212,32,32,.3)" strokeWidth="1.5"/>
                    <text x="130" y="45" textAnchor="middle" fontSize="28" fontFamily="Outfit,sans-serif" fontWeight="800" fill="#E87070">74</text>
                    <line x1="130" y1="54" x2="130" y2="62" stroke="rgba(212,32,32,.3)" strokeWidth="1.5"/>
                    <rect x="274" y="60" width="52" height="24" rx="6" fill="rgba(232,119,46,.12)" stroke="rgba(232,119,46,.3)" strokeWidth="1.5"/>
                    <text x="300" y="75" textAnchor="middle" fontSize="28" fontFamily="Outfit,sans-serif" fontWeight="800" fill="#E8A060">52</text>
                    <line x1="300" y1="84" x2="300" y2="93" stroke="rgba(232,119,46,.3)" strokeWidth="1.5"/>
                    <rect x="444" y="132" width="52" height="24" rx="6" fill="rgba(92,184,130,.12)" stroke="rgba(92,184,130,.3)" strokeWidth="1.5"/>
                    <text x="470" y="147" textAnchor="middle" fontSize="28" fontFamily="Outfit,sans-serif" fontWeight="800" fill="#5CB882">31</text>
                    <line x1="470" y1="127" x2="470" y2="130" stroke="rgba(92,184,130,.3)" strokeWidth="1.5"/>
                  </g>
                  <text x="130" y="192" textAnchor="middle" fontSize="20" fontFamily="Outfit,sans-serif" fontWeight="700" fill="rgba(255,255,255,.45)">BioScan 1</text>
                  <text x="130" y="203" textAnchor="middle" fontSize="24" fontFamily="Outfit,sans-serif" fill="rgba(255,255,255,.25)">Day 0</text>
                  <text x="300" y="192" textAnchor="middle" fontSize="20" fontFamily="Outfit,sans-serif" fontWeight="700" fill="rgba(255,255,255,.45)">BioScan 2</text>
                  <text x="300" y="203" textAnchor="middle" fontSize="24" fontFamily="Outfit,sans-serif" fill="rgba(255,255,255,.25)">Day 45</text>
                  <text x="470" y="192" textAnchor="middle" fontSize="20" fontFamily="Outfit,sans-serif" fontWeight="700" fill="rgba(255,255,255,.45)">BioScan 3</text>
                  <text x="470" y="203" textAnchor="middle" fontSize="24" fontFamily="Outfit,sans-serif" fill="rgba(255,255,255,.25)">Day 90</text>
                </svg>
              </div>
              <div className="traj-ft">
                <div className="traj-ft-drop"><span className="traj-drop-num">&#8595; 43</span><span className="traj-drop-label">GLIS points across 90 days</span></div>
                <div className="traj-ft-right"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> 3 BioScan reviews · Dr. Shane Animas, MD</div>
              </div>
            </div>
          </div>
        </section>
        
        
        
        
        <section id="anxieties" style={inlineStyle("background:var(--lt)")}>
          <div className="mx">
            <div className="section-tag rv rv-up" style={inlineStyle("color:var(--bl)")}>Direct Answers</div>
            <h2 className="section-h2 rv rv-up" style={inlineStyle("color:var(--d1)")}>The honest answers. before enrolling</h2>
            <div className="anxiety-grid">
              <div className="ax-card a1 rv rv-up">
                <div className="ax-ico" style={inlineStyle("background:rgba(59,130,200,.12)")}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--bl)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <div className="ax-q">Is this a regulatory risk?</div>
                <div className="ax-a">GutGuard SynBIOTIC+ is a <strong>DOST-accredited licensed lifestyle supplement</strong>, not a pharmaceutical. Your role is clinical monitoring and protocol assignment — the same judgment you exercise daily. <strong>Full FDA documentation available on request.</strong></div>
              </div>
              <div className="ax-card a2 rv rv-up rv-d1">
                <div className="ax-ico" style={inlineStyle("background:rgba(212,168,64,.1)")}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gld)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
                <div className="ax-q">Will this compete with my practice time?</div>
                <div className="ax-a">Average review is <strong>12 minutes</strong>. Done from your phone between consultations — not in a dedicated session. <strong>No minimum volume. No schedule commitment.</strong> One review a week or forty — the platform fits your pace.</div>
              </div>
              <div className="ax-card a3 rv rv-up rv-d2">
                <div className="ax-ico" style={inlineStyle("background:rgba(92,184,130,.1)")}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--grn)" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg></div>
                <div className="ax-q">Is there real clinical evidence?</div>
                <div className="ax-a"><strong>127 patients. Average 28-point GLIS drop per protocol cycle.</strong> Before/after blood marker data from Philippine labs available for peer review. 7 institutions. 15 years underlying molecular research. Full clinical data on request.</div>
              </div>
              <div className="ax-card a4 rv rv-up rv-d3">
                <div className="ax-ico" style={inlineStyle("background:rgba(232,119,46,.1)")}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ter)" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                <div className="ax-q">Is there compensation?</div>
                <div className="ax-a">Completed reviews accumulate credits redeemable via vRedeem — no minimum threshold, no separate enrollment. The work is clinical. Compensation follows it.</div>
              </div>
            </div>
          </div>
        </section>
        
        
        
        <section id="peers">
          <div className="mx">
            <div className="section-tag rv rv-up" style={inlineStyle("color:var(--bl)")}>Physician Observations</div>
            <h2 className="section-h2 rv rv-up" style={inlineStyle("color:var(--d1)")}>What GutGuard doctors say</h2>
            <p className="section-body rv rv-up" style={inlineStyle("color:var(--d3)")}>Professional observations — not product endorsements. These are the conversations happening between GutGuard physicians on Viber.</p>
            <div className="viber-cols">
        
              <div className="viber-thread rv rv-up">
                <div className="viber-header">
                  <div className="viber-av" style={inlineStyle("background:var(--bl)")}>RD</div>
                  <div>
                    <div className="viber-dr-name">Dr. R. Dela Cruz</div>
                    <div className="viber-dr-spec">Internal Medicine · Davao City</div>
                  </div>
                </div>
                <div className="viber-body">
                  <div className="chat-bubble chat-in">Kumusta ang review workload? Nagwoworry ako na maaapektuhan yung clinic schedule ko.</div>
                  <div className="chat-bubble chat-out">Honestly, I do 3–4 reviews between my afternoon consultations. Fits in the gaps I already had.</div>
                  <div className="chat-bubble chat-in">Ano yung average — ilang minutes per review?</div>
                  <div className="chat-bubble chat-out">About 10–15 minutes. The system extracts the markers automatically, so I just review and note. Hindi siya comprehensive consult.</div>
                  <div className="chat-time">✓✓ Delivered</div>
                </div>
              </div>
        
              <div className="viber-thread rv rv-up rv-d1">
                <div className="viber-header">
                  <div className="viber-av" style={inlineStyle("background:var(--grn)")}>ML</div>
                  <div>
                    <div className="viber-dr-name">Dr. M. Lim</div>
                    <div className="viber-dr-spec">Family Medicine · Cebu City</div>
                  </div>
                </div>
                <div className="viber-body">
                  <div className="chat-bubble chat-in">Clinical ba talaga 'to? O marketing lang ng supplement?</div>
                  <div className="chat-bubble chat-out">I had three patients last month — hs-CRP technically within normal range but elevated on GLIS. All three responded to the protocol. I now think about this framework differently.</div>
                  <div className="chat-bubble chat-in">Yun yung patients na palaging nag-cocomplain ng fatigue pero "normal" labs?</div>
                  <div className="chat-bubble chat-out">Exactly those patients. GLIS surfaces what the clinical threshold misses. For me that was the validation.</div>
                  <div className="chat-time">✓✓ Delivered</div>
                </div>
              </div>
        
              
        
            </div>
          </div>
        </section>
        <section id="shane">
          <div className="mx">
            <div className="shane-layout">
              <div className="shane-quote-wrap rv rv-left">
                <div className="shane-quote-mark">"</div>
                <blockquote className="shane-quote">
                  I&#8217;ve been sending these patients home for fifteen years. GutGuard BioScan changed that.
                </blockquote>
                <div className="shane-attr">
                  <div className="shane-avatar">SA</div>
                  <div>
                    <div className="shane-name">Dr. Shane Animas, MD</div>
                    <div className="shane-title">Internal Medicine · General Santos City · Clinical Lead, GutGuard</div>
                  </div>
                </div>
              </div>
              <div className="shane-data rv rv-right">
                <div className="shane-stat">
                  <div className="shane-stat-n" style={inlineStyle("color:var(--grn)")}>127</div>
                  <div className="shane-stat-l">Patients personally reviewed</div>
                  <div className="shane-stat-note">Complete before/after blood marker data on file</div>
                </div>
                <div className="shane-stat">
                  <div className="shane-stat-n" style={inlineStyle("color:var(--bl)")}>28 pts</div>
                  <div className="shane-stat-l">Average GLIS improvement per cycle</div>
                  <div className="shane-stat-note">Across all protocol tiers, all patient profiles</div>
                </div>
                <div className="shane-stat">
                  <div className="shane-stat-n" style={inlineStyle("color:var(--gld)")}>7</div>
                  <div className="shane-stat-l">Research institutions · 15 years basis</div>
                  <div className="shane-stat-note">Peer consultation available for enrolled physicians</div>
                </div>
                <div style={inlineStyle("padding:14px 16px;background:rgba(59,130,200,.08);border:1px solid rgba(59,130,200,.15);border-radius:12px")}>
                  <div style={inlineStyle("font-size:14px;font-weight:700;color:var(--bl);margin-bottom:4px;letter-spacing:.06em;text-transform:uppercase")}>Peer consultation</div>
                  <div style={inlineStyle("font-size:14px;color:rgba(255,255,255,.6);line-height:1.6")}>Dr. Shane is available for a direct peer conversation with every physician considering GutGuard enrollment. Not a sales call — a clinical peer discussion.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        
        
        <section id="cta">
          <div className="cta-glow"></div>
          <div className="mx">
            <div className="cta-inner">
              <div className="cta-tag rv rv-up">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Physician Enrollment
              </div>
              <h2 className="cta-h2 rv rv-up">One step. Your portal activates immediately.</h2>
              <p className="cta-sub rv rv-up">Portal access, GLIS scoring, and your first BioScan review — all active the moment you register.</p>
              <div className="cta-cards rv rv-up" style={inlineStyle("display:flex;justify-content:center;max-width:440px;margin:0 auto")}>
                <div className="cta-card cta-card-primary" style={inlineStyle("width:100%")}>
                  <div className="cta-card-tag">Recommended start</div>
                  <div className="cta-card-title">Clinical Account</div>
                  
                  <a className="cta-card-btn" href="/doctor/onboarding">
                    Activate Your Physician Portal
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                </div>
                
              </div>
              <p className="cta-note rv rv-up">Have questions before enrolling? <a href="#">Schedule a peer call with Dr. Shane →</a></p>
            </div>
          </div>
        </section>
        
        
        <footer id="footer">
          <div className="mx">
            <div className="foot-inner">
              <div className="foot-logo">
                <div className="foot-mark"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <span className="foot-name">GutGuard · Physician Portal</span>
              </div>
              <div className="foot-links">
                <a href="#" className="foot-link">Clinical Documentation</a>
                <a href="#" className="foot-link">Regulatory</a>
                <a href="#" className="foot-link">Contact Dr. Shane</a>
              </div>
              <div className="foot-copy">© 2026 GutGuard · FDA CPR FR-4XXXXXXX · LTO FDO-XXXXXXX</div>
            </div>
          </div>
          <div style={inlineStyle("padding:16px clamp(20px,5vw,52px);border-top:1px solid rgba(255,255,255,.06);font-size:13px;color:rgba(255,255,255,.28);line-height:1.8;max-width:860px")}>
            GutGuard SynBIOTIC+ is a licensed lifestyle supplement (FDA CPR FR-4XXXXXXX · LTO FDO-XXXXXXX). GLIS is a wellness monitoring framework — not a clinical diagnostic instrument. Outcome data (n=127, Apr 2025–Mar 2026) is observational and not peer-reviewed. Redeemable credits converted via vRedeem constitute taxable income under Philippine BIR regulations. Physician participation is subject to applicable PMA Code of Ethics provisions. Patient data processed under RA 10173. This page is directed at licensed Philippine healthcare professionals only. Individual results vary.
          </div>
        </footer>
      </div>
    </>
  );
}
