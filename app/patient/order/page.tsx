"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TIERS, type TierKey } from "@/lib/glis/score";

type PayMethod = "gcash" | "card" | "bank" | "cod";

const PAY_LABELS: Record<PayMethod, string> = {
  gcash: "GCash",
  card: "Card",
  bank: "Bank Transfer",
  cod: "Cash on Delivery",
};

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tierKey, setTierKey] = useState<TierKey | null>(null);
  const [scoreId, setScoreId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod>("gcash");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [btnTxt, setBtnTxt] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [city, setCity] = useState("");
  const [delivOpen, setDelivOpen] = useState(true);

  const btnTxtRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const t = searchParams.get("tier") as TierKey | null;
    const sid = searchParams.get("sid");
    if (!t || !TIERS[t]) { router.replace("/patient/results"); return; }
    setTierKey(t);
    if (sid) setScoreId(sid);
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.profile) {
        setName(`${d.profile.first_name || ""} ${d.profile.last_name || ""}`.trim());
        setPhone(d.profile.mobile || "");
      }
    }).catch(() => {});
  }, [router, searchParams]);

  function handlePay() {
    if (!name.trim() || !phone.trim() || !addr.trim() || !city.trim()) {
      setError("Please complete all delivery fields.");
      setDelivOpen(true);
      return;
    }
    setError("");
    setShowConfirm(true);
  }

  async function handleConfirmPay() {
    if (!tierKey) return;
    const tier = TIERS[tierKey];
    setLoading(true);
    setBtnTxt("Processing payment...");
    setTimeout(() => setBtnTxt(`Verifying with ${PAY_LABELS[payMethod]}...`), 600);
    setTimeout(() => setBtnTxt("Confirming order..."), 1100);
    setTimeout(() => setBtnTxt("Setting up protocol..."), 1400);
    await new Promise(r => setTimeout(r, 1600));
    const confirmationCode = `GG-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    // Save order to Supabase
    await fetch("/api/patient/order/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tierKey,
        fullName: name,
        phone,
        address: addr,
        city: city.trim(),
        confirmationCode,
        inflammationScoreId: scoreId,
      }),
    }).catch(() => {});
    router.push("/patient/confirmation");
  }

  if (!tierKey) return null;
  const tier = TIERS[tierKey];
  const capPrice = Math.round(tier.p / tier.c);

  const PAY_METHODS: { key: PayMethod; label: string; desc: string; bg: string; ico: React.ReactNode }[] = [
    { key: "gcash", label: "GCash", desc: "Pay instantly", bg: "#0060FF", ico: <span style={{ fontWeight: 800, color: "#fff", fontSize: "clamp(18px,5.2vw,21px)" }}>G</span> },
    { key: "card", label: "Card", desc: "Visa, Mastercard", bg: "var(--lt2)", ico: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--d2)" strokeWidth={2}><rect x={1} y={4} width={22} height={16} rx={2} /><line x1={1} y1={10} x2={23} y2={10} /></svg> },
    { key: "bank", label: "Bank Transfer", desc: "BDO, BPI, UnionBank", bg: "var(--lt2)", ico: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--d2)" strokeWidth={2}><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg> },
    { key: "cod", label: "Cash on Delivery", desc: "Pay when kit arrives", bg: "rgba(204,110,72,.06)", ico: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--ter)" strokeWidth={2}><path d="M21 16V8l-7-4-7 4v8l7 4 7-4z" /></svg> },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "var(--lt)", color: "var(--d1)", position: "relative", fontFamily: "var(--f)" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(12,16,23,.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,.08)", padding: "16px 28px", display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "rgba(255,255,255,.88)", padding: 0, cursor: "pointer", fontFamily: "var(--f)" }}>←</button>
        <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "#fff", marginLeft: 4 }}>{tier.f}</div>
      </div>

      <div className="mx" style={{ padding: "20px 28px 20px" }}>
        <div style={{ padding: 20, borderRadius: 14, background: "var(--w)", boxShadow: "0 2px 8px rgba(0,0,0,.04)", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {[
              { val: tier.c, label: "capsules", accent: false },
              { val: tier.d, label: "days", accent: false },
              { val: `₱${capPrice}`, label: "per cap", accent: true },
            ].map(({ val, label, accent }) => (
              <div key={label} style={{ flex: 1, padding: "14px 8px", borderRadius: 14, background: accent ? "rgba(59,130,200,.04)" : "var(--lt)", textAlign: "center" }}>
                <div style={{ fontSize: "clamp(24px,6.8vw,30px)", fontWeight: 800, color: accent ? "var(--bl)" : "var(--d1)", letterSpacing: "-.04em" }}>{val}</div>
                <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: accent ? "var(--bl)" : "var(--d4)", letterSpacing: ".04em", textTransform: "uppercase", marginTop: 3, opacity: accent ? 0.6 : 1 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Doctor-monitored program", `${tier.scans} lab scan${tier.scans > 1 ? "s" : ""} included`, "AI protocol assistant via Telegram", "Free delivery · 2–3 days"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--grn)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--d1)" }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "right", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--lt2)" }}>
            <span style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--d4)" }}>Total </span>
            <span style={{ fontSize: "clamp(18px,5.2vw,21px)", color: "var(--d3)" }}>₱{tier.p.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 14, background: "rgba(59,130,200,.03)", border: "1px solid rgba(59,130,200,.06)", marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(59,130,200,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--bl)" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
          </div>
          <div>
            <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "var(--d1)" }}>Dr. Shane Animas</div>
            <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--d3)" }}>GutGuard Protocol Center · Will monitor your protocol</div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "var(--d1)", marginBottom: 14 }}>Payment</div>
          {PAY_METHODS.map(({ key, label, desc, bg, ico }) => (
            <div key={key} className={`pay${payMethod === key ? " on" : ""}`} onClick={() => setPayMethod(key)}>
              <div className="pay-r"><div className="pay-ri" /></div>
              <div className="pay-i" style={{ background: bg }}>{ico}</div>
              <div style={{ flex: 1 }}><div className="pay-n">{label}</div><div className="pay-d">{desc}</div></div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <button onClick={() => setDelivOpen(o => !o)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: 0, border: "none", background: "none", fontFamily: "var(--f)", cursor: "pointer", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "var(--d1)" }}>Delivery</div>
              <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--d3)", marginTop: 2 }}>Free · 2–3 business days</div>
            </div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--d3)" strokeWidth={2.5} style={{ transition: "transform .2s", transform: delivOpen ? "rotate(180deg)" : "" }}><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {delivOpen && (
            <div>
              {error && <div className="err-b"><span>{error}</span></div>}
              {[
                { id: "ck-name", label: "Full Name", val: name, set: setName, ph: "Maria Santos Cruz", ac: "name" },
                { id: "ck-phone", label: "Mobile", val: phone, set: setPhone, ph: "09XX XXX XXXX", ac: "tel" },
                { id: "ck-addr", label: "Address", val: addr, set: setAddr, ph: "123 Rizal Street, Barangay...", ac: "street-address" },
                { id: "ck-city", label: "City", val: city, set: setCity, ph: "Makati City", ac: "address-level2" },
              ].map(({ id, label, val, set, ph, ac }) => (
                <div key={id} className="fg" style={{ position: "relative", marginBottom: 16 }}>
                  <label>{label} <span className="rq">*</span></label>
                  <input value={val} onChange={e => set(e.target.value)} placeholder={ph} autoComplete={ac}
                    style={{ width: "100%", padding: "16px 18px", border: "1.5px solid var(--lt3)", borderRadius: 14, fontFamily: "var(--f)", fontSize: "clamp(18px,5.2vw,21px)", color: "var(--d1)", background: "var(--w)", minHeight: 52, outline: "none", boxSizing: "border-box" }}
                    onFocus={e => e.currentTarget.style.borderColor = "var(--bl)"} onBlur={e => e.currentTarget.style.borderColor = "var(--lt3)"} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: "clamp(18px,5vw,20px)", color: "var(--d4)", marginTop: 16 }}>
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="var(--d4)" strokeWidth={2}><rect x={3} y={11} width={18} height={11} rx={2} /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          Secured by PayMongo · SEC Reg. For Filing
        </div>
      </div>

      <div style={{ padding: "20px 28px calc(90px + env(safe-area-inset-bottom,0px))" }}>
        <button className="btn-p" onClick={handlePay} style={{ borderRadius: 14, margin: 0, fontSize: "clamp(18px,5.2vw,21px)" }}>
          <span className="bt">Place Order · ₱{tier.p.toLocaleString()}</span>
          <div className="bs" />
        </button>
      </div>

      {showConfirm && (
        <div onClick={() => !loading && setShowConfirm(false)}
          style={{ display: "flex", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 480, background: "var(--w)", borderRadius: "20px 24px 0 0", padding: "32px 28px calc(120px + env(safe-area-inset-bottom,0px))", boxShadow: "0 -8px 32px rgba(0,0,0,.12)", animation: "up .35s var(--ease)" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--lt2)", margin: "0 auto 24px" }} />
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: "clamp(19px,5.2vw,22px)", fontWeight: 700, color: "var(--d1)", marginBottom: 6 }}>Confirm your order</div>
              <div style={{ fontSize: "clamp(18px,5.2vw,21px)", color: "var(--d3)", lineHeight: 1.5 }}>
                {tier.f} · {tier.c} capsules · ₱{tier.p.toLocaleString()}<br />
                Delivering to {city || "your address"} via {PAY_LABELS[payMethod]}
              </div>
            </div>
            <button className={`btn-p${loading ? " ld" : ""}`} onClick={handleConfirmPay} disabled={loading} style={{ borderRadius: 14, marginBottom: 10, fontSize: "clamp(18px,5.2vw,21px)" }}>
              <span ref={btnTxtRef} className="bt">{loading ? btnTxt : `Confirm · Pay ₱${tier.p.toLocaleString()}`}</span>
              <div className="bs" />
            </button>
            {!loading && (
              <button onClick={() => setShowConfirm(false)} style={{ width: "100%", padding: 14, border: "none", background: "none", fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "var(--d3)", fontFamily: "var(--f)", cursor: "pointer" }}>Cancel</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={null}>
      <OrderContent />
    </Suspense>
  );
}
