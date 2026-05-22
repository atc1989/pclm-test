"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TIERS, type TierKey } from "@/lib/glis/score";

function buildScanTimeline(numScans: number, totalDays: number): { day: number; done: boolean }[] {
  return Array.from({ length: numScans }, (_, i) => ({
    done: i === 0,
    day: Math.round(totalDays * (i / Math.max(numScans - 1, 1))),
  }));
}

function shareStart() {
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share({ title: "GutGuard Protocol", text: "I just started my GutGuard Protocol. Taking control of my gut health!" }).catch(() => {});
  }
}

function SkeletonBlock({ h, w = "100%", r = 12 }: { h: number; w?: string; r?: number }) {
  return <div style={{ height: h, width: w, borderRadius: r, background: "rgba(255,255,255,.06)", animation: "pulse 1.6s ease-in-out infinite" }} />;
}

function ConfirmationSkeleton() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--lt)", fontFamily: "var(--f)", padding: "32px 28px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,.06)", animation: "pulse 1.6s ease-in-out infinite", marginBottom: 20 }} />
        <SkeletonBlock h={28} w="70%" r={8} />
        <div style={{ marginTop: 8 }}><SkeletonBlock h={18} w="200px" r={6} /></div>
      </div>
      {[80, 120, 100, 80].map((h, i) => (
        <div key={i} style={{ marginBottom: 14 }}><SkeletonBlock h={h} /></div>
      ))}
    </div>
  );
}

type OrderData = {
  confirmation_code: string;
  protocol_key: TierKey;
  total_amount: number;
  capsule_count: number;
  bottle_count: number;
  supply_days: number;
  scans_included: number;
  city: string;
};

export default function ConfirmationPage() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient/order/latest")
      .then(r => r.json())
      .then(data => {
        if (!data.order || !TIERS[data.order.protocol_key as TierKey]) {
          router.replace("/patient/dashboard");
          return;
        }
        setOrder(data.order);
        if (data.name) setPatientName(data.name);
      })
      .catch(() => router.replace("/patient/dashboard"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <ConfirmationSkeleton />;
  if (!order) return null;

  const tier = TIERS[order.protocol_key];
  const scanNodes = buildScanTimeline(order.scans_included, order.supply_days);
  const heading = patientName ? `${patientName}, your protocol is confirmed` : "Protocol confirmed";

  return (
    <div style={{ minHeight: "100dvh", background: "var(--lt)", color: "var(--d1)", fontFamily: "var(--f)" }}>
      <div style={{ padding: "32px 28px 24px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(52,168,83,.08)", border: "2px solid rgba(52,168,83,.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "checkPop .5s cubic-bezier(.34,1.56,.64,1) .2s both" }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--grn)" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 style={{ fontSize: "clamp(22px,6.2vw,28px)", fontWeight: 700, letterSpacing: "-.03em", color: "var(--d1)", margin: "0 0 8px" }}>{heading}</h2>
        <p style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--d3)", lineHeight: 1.5, maxWidth: 280, margin: "0 auto" }}>Your {tier.f} supply is being prepared.</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, padding: "6px 14px", borderRadius: 20, background: "var(--w)", fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "var(--d3)" }}>#{order.confirmation_code}</div>
      </div>

      <div style={{ padding: "0 28px 40px" }}>
        <div className="cd" style={{ padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(59,130,200,.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--bl)" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>
          </div>
          <div>
            <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "var(--d1)" }}>Dr. Shane Animas assigned</div>
            <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--d3)", marginTop: 2 }}>GutGuard Protocol Center · Will monitor your protocol and review all scans</div>
          </div>
        </div>

        <div className="cd" style={{ padding: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "var(--d1)" }}>{tier.f}</div>
              <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--d3)", marginTop: 2 }}>{order.bottle_count} blisters · {order.capsule_count} capsules · {order.supply_days} days</div>
            </div>
            <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 700, color: "var(--d1)" }}>₱{Number(order.total_amount).toLocaleString()}</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {[
              { val: "2–3", label: "days delivery", color: "var(--bl)" },
              { val: String(order.supply_days), label: "day protocol", color: "var(--grn)" },
              { val: String(order.scans_included), label: "lab scans", color: "var(--d1)" },
            ].map(({ val, label, color }) => (
              <div key={label} style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--lt)", textAlign: "center" }}>
                <div style={{ fontSize: "clamp(18px,5.2vw,21px)", fontWeight: 800, color }}>{val}</div>
                <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--d4)", marginTop: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cd" style={{ padding: 20, marginBottom: 16, borderLeft: "3px solid var(--grn)" }}>
          <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, letterSpacing: ".08em", color: "var(--grn)", textTransform: "uppercase", marginBottom: 6 }}>When Your Kit Arrives</div>
          <div style={{ fontSize: "clamp(18px,5.2vw,21px)", color: "var(--d3)", marginBottom: 14 }}>Day 1 starts the morning after delivery. Here&apos;s what to do:</div>
          {[
            ["Morning capsule with breakfast", "With water and food — never on an empty stomach"],
            ["Evening capsule before dinner", "Set a daily alarm so you don't miss a dose"],
            ["Connect on Telegram for reminders", "Your AI assistant sends daily tips + scan alerts"],
          ].map(([title, desc], i) => (
            <div key={title} style={{ display: "flex", gap: 8, marginBottom: i < 2 ? 12 : 0 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--bl)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "clamp(18px,5vw,20px)", fontWeight: 800, color: "#fff" }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "var(--d1)" }}>{title}</div>
                <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--d3)", marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="cd" style={{ padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, letterSpacing: ".08em", color: "var(--d4)", textTransform: "uppercase", marginBottom: 12 }}>Scan Schedule</div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {scanNodes.map(({ done, day }, i) => (
              <div key={i} style={{ display: "contents" }}>
                {i > 0 && <div style={{ flex: 1, height: 2, background: "var(--lt2)" }} />}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 56 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: done ? "var(--bl)" : "transparent", border: done ? "none" : "1.5px solid var(--lt3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {done ? <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                      : <span style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 800, color: "var(--d4)" }}>{day}</span>}
                  </div>
                  <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: done ? "var(--d2)" : "var(--d4)", marginTop: 4 }}>{done ? "Done" : `Day ${day}`}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <a href="https://t.me/gutguardprotocol" target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: 16, borderRadius: 14, background: "var(--w)", border: "1px solid rgba(38,165,219,.10)", textDecoration: "none", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: "#26A5DB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}><path d="M21 2L11 13" /><path d="M21 2l-7 20-4-9-9-4 20-7z" /></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "var(--d1)" }}>Connect on Telegram</div>
              <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--d3)", marginTop: 2 }}>Get daily reminders &amp; scan alerts</div>
            </div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--d4)" strokeWidth={2}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </div>
        </a>

        <div onClick={shareStart} style={{ padding: 16, borderRadius: 14, background: "var(--w)", marginBottom: 16, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: "rgba(59,130,200,.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--bl)" strokeWidth={2}><circle cx={18} cy={5} r={3} /><circle cx={6} cy={12} r={3} /><circle cx={18} cy={19} r={3} /><line x1={8.59} y1={13.51} x2={15.42} y2={17.49} /><line x1={15.41} y1={6.51} x2={8.59} y2={10.49} /></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "clamp(18px,5vw,20px)", fontWeight: 600, color: "var(--d1)" }}>Tell someone you started</div>
              <div style={{ fontSize: "clamp(18px,5vw,20px)", color: "var(--d3)", marginTop: 2 }}>Accountability makes it stick</div>
            </div>
          </div>
        </div>

        <button className="btn-p" onClick={() => router.push("/patient/dashboard")} style={{ borderRadius: 14 }}>
          Go to Dashboard
        </button>
        <div style={{ textAlign: "center", padding: "16px 0 0", fontSize: "clamp(18px,5vw,20px)", color: "var(--d4)" }}>GutGuard Protocol · For Filing</div>
      </div>
    </div>
  );
}
