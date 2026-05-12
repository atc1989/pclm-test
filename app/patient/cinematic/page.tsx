"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Sequence (mirrors reference gutguard-patient-portal-v33.html obReveal):
// phase 0 : tagline
// phase 1 : ring visible at 281° (inflamed) + ringPulse + "You are here."
// phase 2 : sweep 281→65 via rAF (ring, particle, score-number colour all animate)
// phase 3 : sweep done — "This is where you want to be." + Continue
// phase 4 : continue tapped — ring+text fade
// phase 5 : brand + CTA

export default function CinematicPage() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);

  // Refs for imperative animation (never causes re-renders)
  const ringFillRef  = useRef<HTMLDivElement>(null);
  const ringWrapRef  = useRef<HTMLDivElement>(null);
  const glowBgRef    = useRef<HTMLDivElement>(null); // full-screen ambient
  const glowRingRef  = useRef<HTMLDivElement>(null); // radial behind ring
  const particleRef  = useRef<HTMLDivElement>(null);
  const rippleRef    = useRef<HTMLDivElement>(null);
  const ripple2Ref   = useRef<HTMLDivElement>(null);
  const labelLRef    = useRef<HTMLSpanElement>(null);
  const labelRRef    = useRef<HTMLSpanElement>(null);
  const rafRef       = useRef<number>(0);

  useEffect(() => {
    const rf = ringFillRef.current;
    // Snap ring to inflamed state — no CSS transition
    if (rf) {
      rf.style.transition = "none";
      rf.style.setProperty("--ra", "281deg");
      rf.style.opacity = "1";
    }

    // t=4700 : tagline fades out
    // t=5300 : ring appears  (600ms dark gap matches reference)
    const t1 = setTimeout(() => setPhase(1), 5300);

    // t=6600 : stop ringPulse breathe
    const t2 = setTimeout(() => {
      if (ringWrapRef.current) ringWrapRef.current.style.animation = "none";
    }, 6600);

    // t=6800 : brief compress + ripple burst + haptic
    const t3 = setTimeout(() => {
      const rw = ringWrapRef.current;
      if (rw) { rw.style.transition = "transform .12s ease"; rw.style.transform = "scale(.96)"; }
      const r1 = rippleRef.current;
      const r2 = ripple2Ref.current;
      if (r1) r1.style.animation = "touchRipple .8s cubic-bezier(.2,.8,.2,1) forwards";
      setTimeout(() => { if (r2) r2.style.animation = "touchRipple2 .8s cubic-bezier(.2,.8,.2,1) .12s forwards"; }, 120);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([12, 6, 30, 6, 12]);
    }, 6800);

    // t=7000 : rebound + sweep 281→65 via rAF
    const t4 = setTimeout(() => {
      if (ringWrapRef.current) ringWrapRef.current.style.transform = "scale(1)";
      setPhase(2);
      sweepRingWithParticle();
    }, 7000);

    // t=9800 : "This is where you want to be." + Continue
    const t5 = setTimeout(() => setPhase(3), 9800);

    return () => {
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sweepRingWithParticle() {
    const rf       = ringFillRef.current;
    const particle = particleRef.current;
    const glowBg   = glowBgRef.current;
    const glowRing = glowRingRef.current;
    const labelR   = labelRRef.current;
    const labelL   = labelLRef.current;

    const from = 281, to = 65, dur = 2800;
    // Measure actual rendered ring size for accurate particle placement
    const ringPx = rf?.parentElement?.offsetWidth ?? 180;
    const r  = Math.round(ringPx * 0.459);
    const cx = Math.round(ringPx / 2);
    const cy = Math.round(ringPx / 2);

    // Map --ra degrees → pixel position of the arc tip (8 = half of 16px particle)
    function calcPos(deg: number) {
      const cd  = (180 + deg) % 360;
      const rad = cd * Math.PI / 180;
      return { l: cx + r * Math.sin(rad) - 8, t: cy - r * Math.cos(rad) - 8 };
    }

    // Interpolate red [212,32,32] → green [92,184,130]
    function lerpColor(p: number) {
      const a = [212, 32, 32], b = [92, 184, 130];
      return `rgb(${Math.round(a[0] + (b[0] - a[0]) * p)},${Math.round(a[1] + (b[1] - a[1]) * p)},${Math.round(a[2] + (b[2] - a[2]) * p)})`;
    }

    // Place particle at the inflamed tip and show it
    const p0 = calcPos(from);
    if (particle) {
      particle.style.left    = p0.l + "px";
      particle.style.top     = p0.t + "px";
      particle.style.opacity = "1";
    }

    // Shift ambient + ring glow red → green
    if (glowBg)   glowBg.style.background   = "radial-gradient(ellipse at 50% 50%,rgba(52,168,83,.05) 0%,transparent 60%)";
    if (glowRing) { glowRing.style.background = "radial-gradient(circle,rgba(92,184,130,.18) 0%,transparent 70%)"; glowRing.style.animation = "none"; }

    // INFLAMED label fades exactly over sweep duration
    if (labelR) { labelR.style.transition = "color 2.8s linear"; labelR.style.color = "rgba(212,32,32,0)"; }

    // rAF loop — drives --ra, particle position, and score number colour
    const t0 = performance.now();
    (function loop(now: number) {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const cur = from + (to - from) * e;

      if (rf) rf.style.setProperty("--ra", cur + "deg");

      const pos = calcPos(cur);
      const col = lerpColor(e);
      const colA = col.replace("rgb(", "rgba(").replace(")", ", .70)");

      if (particle) {
        particle.style.left      = pos.l + "px";
        particle.style.top       = pos.t + "px";
        particle.style.boxShadow = `0 0 14px 5px ${colA},0 0 4px 1px rgba(255,255,255,.88)`;
      }
      if (p < 1) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        // Sweep done: hide particle, reveal OPTIMAL label
        setTimeout(() => { if (particle) particle.style.opacity = "0"; }, 500);
        if (labelL) { labelL.style.transition = "color 2s ease"; labelL.style.color = "rgba(92,184,130,.85)"; }
      }
    })(t0);
  }

  function handleContinue() {
    setPhase(4);
    setTimeout(() => setPhase(5), 900);
  }

  const ringVisible = phase >= 1 && phase < 5;

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg)", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "var(--f)" }}>

      {/* Full-screen ambient glow — starts red, goes green during sweep */}
      <div ref={glowBgRef} style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%,rgba(212,32,32,.04) 0%,transparent 60%)", transition: "background 2.5s ease", pointerEvents: "none", zIndex: 0 }} />

      {/* Phase 0: Tagline full-screen overlay */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 clamp(28px,8vw,52px)", opacity: phase === 0 ? 1 : 0, transition: "opacity .9s", zIndex: 100, pointerEvents: "none", background: "var(--bg)" }}>
        <div style={{ fontSize: "clamp(22px,6.2vw,30px)", fontWeight: 800, color: "rgba(255,255,255,.88)", textAlign: "center", lineHeight: 1.5, letterSpacing: "-.03em", maxWidth: "min(320px,88vw)" }}>
          See your body&apos;s direction—<br />
          <span style={{ background: "linear-gradient(90deg,#E8772E,#D42020)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 900 }}>toward disease,</span>
          <br />
          <span style={{ color: "#5CB882" }}>or away from it.</span>
        </div>
      </div>

      {/* Top spacer */}
      <div style={{ height: "clamp(32px,7vw,64px)", flexShrink: 0 }} />

      {/* Ring (phases 1–4) */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", opacity: ringVisible ? 1 : 0, transition: "opacity 1s", zIndex: 1 }}>

        {/* Pulsing radial glow behind ring */}
        <div ref={glowRingRef} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 230, height: 230, borderRadius: "50%", background: "radial-gradient(circle,rgba(212,32,32,.18) 0%,transparent 70%)", pointerEvents: "none", animation: "ambientPulse 2.4s ease-in-out infinite", transition: "background 3s ease", zIndex: 0 }} />

        {/* Ring wrapper — overflow:hidden clips the particle inside the arc */}
        <div
          ref={ringWrapRef}
          style={{ width: 180, height: 180, position: "relative", zIndex: 1, overflow: "hidden", transition: "transform .2s var(--ease)", animation: phase === 1 ? "ringPulse 2.2s ease-in-out infinite" : "none" }}
        >
          <div className="ring" style={{ width: "100%", height: "100%", position: "relative" }}>
            <div className="ring-trk" />
            {/* Ring fill: pre-snapped to 281deg; rAF will drive --ra during sweep */}
            <div ref={ringFillRef} className="ring-fill" style={{ "--ra": "281deg" } as React.CSSProperties} />
            <div className="ring-c">
              {/* Ripple burst elements — animated imperatively at t=6800ms */}
              <div ref={rippleRef}  style={{ position: "absolute", width: 52, height: 52, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.55)", top: "50%", left: "50%", opacity: 0, pointerEvents: "none", transform: "translate(-50%,-50%)" }} />
              <div ref={ripple2Ref} style={{ position: "absolute", width: 52, height: 52, borderRadius: "50%", border: "1px solid rgba(255,255,255,.20)",   top: "50%", left: "50%", opacity: 0, pointerEvents: "none", transform: "translate(-50%,-50%)" }} />
            </div>
          </div>

          {/* Particle — glowing dot that traces the arc 281→65 */}
          <div ref={particleRef} style={{ position: "absolute", width: 14, height: 14, borderRadius: "50%", opacity: 0, transition: "opacity .5s", pointerEvents: "none", background: "#fff", boxShadow: "0 0 12px 4px rgba(212,32,32,.70),0 0 3px 1px rgba(255,255,255,.88)" }} />
        </div>

        {/* Labels: INFLAMED visible from phase 1, fades over sweep; OPTIMAL appears at sweep end */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: 212, marginTop: 14, padding: "0 2px" }}>
          <span ref={labelLRef} style={{ fontSize: "clamp(17px,4.5vw,19px)", fontWeight: 800, letterSpacing: ".10em", color: "rgba(92,184,130,0)", textTransform: "uppercase" }}>Optimal</span>
          <span ref={labelRRef} style={{ fontSize: "clamp(17px,4.5vw,19px)", fontWeight: 800, letterSpacing: ".10em", color: "rgba(212,32,32,.75)", textTransform: "uppercase" }}>Inflamed</span>
        </div>
      </div>

      {/* "You are here." — appears at phase 1, exits at phase 2 */}
      <div style={{ flexShrink: 0, textAlign: "center", marginTop: "clamp(16px,4vw,28px)", opacity: phase === 1 ? 1 : 0, transform: phase < 1 ? "translateY(6px)" : phase >= 2 ? "translateY(-6px)" : "none", transition: "opacity .6s, transform .6s var(--ease)", zIndex: 1 }}>
        <div style={{ fontSize: "clamp(19px,5.5vw,24px)", fontWeight: 600, color: "rgba(255,255,255,.88)", letterSpacing: "-.02em" }}>You are here.</div>
      </div>

      {/* "This is where you want to be." — appears at phase 3 */}
      <div style={{ flexShrink: 0, textAlign: "center", marginTop: "clamp(14px,3.5vw,24px)", opacity: phase === 3 ? 1 : 0, transform: phase < 3 ? "translateY(8px)" : phase >= 4 ? "translateY(-6px)" : "none", transition: "opacity .7s .3s, transform .7s .3s var(--ease)", zIndex: 1 }}>
        <div style={{ fontSize: "clamp(19px,5.5vw,24px)", fontWeight: 600, color: "rgba(92,184,130,.90)", letterSpacing: "-.02em" }}>This is where you want to be.</div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Continue bar — phase 3 only */}
      <div style={{ flexShrink: 0, width: "100%", padding: "0 clamp(20px,5vw,28px)", paddingBottom: "calc(clamp(20px,4vw,32px) + env(safe-area-inset-bottom,0px))", opacity: phase === 3 ? 1 : 0, transform: phase === 3 ? "none" : "translateY(12px)", transition: "opacity .7s, transform .7s var(--ease)", zIndex: 2, pointerEvents: phase === 3 ? "auto" : "none" }}>
        <button className="btn-p" onClick={handleContinue} style={{ borderRadius: 14 }}>Continue</button>
      </div>

      {/* Brand + CTA — phase 5 */}
      {phase >= 5 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(20px,6vw,28px)", zIndex: 10, animation: "up .7s var(--ease) both", background: "var(--bg)" }}>
          <div style={{ fontSize: "clamp(28px,7.8vw,38px)", fontWeight: 800, color: "rgba(255,255,255,.88)", letterSpacing: "-.04em", textAlign: "center", marginBottom: 8 }}>GutGuard</div>
          <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 400, color: "rgba(255,255,255,.70)", lineHeight: 1.5, maxWidth: "min(240px,80vw)", textAlign: "center", marginBottom: "clamp(20px,5vw,32px)" }}>
            Your blood doesn&apos;t lie.<br />One panel. One number. One independent physician.
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(8px,3vw,14px)", marginBottom: "clamp(20px,5vw,32px)", padding: "0 8px" }}>
            {([["15", "Years"], ["7", "Institutions"], ["1M+", "Capsules"], ["7K+", "Patients"]] as const).map(([val, label], i) => (
              <div key={val} style={{ display: "contents" }}>
                {i > 0 && <div style={{ width: 1, height: 24, background: "rgba(255,255,255,.10)", alignSelf: "center" }} />}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 800, color: "rgba(255,255,255,.90)" }}>{val}</div>
                  <div style={{ fontSize: "clamp(17px,4.5vw,19px)", fontWeight: 600, color: "rgba(255,255,255,.45)", letterSpacing: ".06em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: "clamp(20px,5vw,32px)", fontSize: "clamp(17px,4.5vw,19px)", fontWeight: 600, letterSpacing: ".06em", color: "rgba(255,255,255,.25)", textTransform: "uppercase" }}>
            <span>SEC Registered</span><span style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "inline-block" }} />
            <span>FDA Notified</span><span style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "inline-block" }} />
            <span>8 Lab Readings</span>
          </div>
          <div style={{ width: "100%", maxWidth: 480, padding: "0 clamp(20px,5vw,28px)", paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
            <button className="btn-p" onClick={() => router.push("/patient/disclaimer")} style={{ borderRadius: 14 }}>Scan My Labs</button>
          </div>
        </div>
      )}

      {/* Skip — visible until phase 3 */}
      {phase < 3 && (
        <div style={{ position: "absolute", bottom: "calc(clamp(12px,3vw,20px) + env(safe-area-inset-bottom,0px))", zIndex: 200 }}>
          <button onClick={() => router.push("/patient/disclaimer")} style={{ background: "none", border: "none", fontSize: "clamp(18px,5vw,20px)", fontWeight: 400, color: phase === 0 ? "rgba(255,255,255,.32)" : "rgba(255,255,255,.20)", fontFamily: "var(--f)", cursor: "pointer", padding: 8, transition: "color 1.5s" }}>Skip</button>
        </div>
      )}
    </div>
  );
}
