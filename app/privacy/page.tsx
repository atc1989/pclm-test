import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — GutGuard",
  description:
    "How GutGuard collects, uses, shares, and protects your personal and health information.",
};

const EFFECTIVE_DATE = "May 24, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div style={shell}>
      <div style={page}>
        <Link href="/" style={back}>
          ← Back to GutGuard
        </Link>

        <header style={head}>
          <h1 style={h1}>Privacy Policy</h1>
          <p style={meta}>
            Effective {EFFECTIVE_DATE}. This policy describes how IG International /
            GutGuard (&ldquo;GutGuard,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) collects, uses,
            shares, and protects information when you use the GutGuard Patient
            Portal, our website, and related services (the &ldquo;Service&rdquo;).
          </p>
        </header>

        <Section title="1. Who we are">
          <p>
            GutGuard is a Philippine wellness-monitoring service operated by IG
            International. Our medical director is Dr. Shane Animas, MD (PRC Lic.
            0098732, Internal Medicine, General Santos City). We are committed to
            handling personal and sensitive personal information in accordance with
            the Philippine Data Privacy Act of 2012 (RA 10173), its implementing
            rules and regulations, and the issuances of the National Privacy
            Commission.
          </p>
        </Section>

        <Section title="2. Information we collect">
          <p>We collect the following categories of information:</p>
          <ul style={list}>
            <li>
              <strong>Account information.</strong> Email address, password (stored as
              a salted hash by Supabase, never in plaintext), full name, mobile
              number, age, and sex when you create an account.
            </li>
            <li>
              <strong>Social login information.</strong> If you sign in with Google,
              Facebook, GitHub, or TikTok, we receive your provider user ID, display
              name, avatar URL, and (where the provider supports it) email address.
              For TikTok we request only the <code>user.info.basic</code> scope and
              never post on your behalf.
            </li>
            <li>
              <strong>Health information.</strong> Blood-panel files (PDFs or
              photos) you upload, extracted laboratory values (e.g., hs-CRP, NLR,
              ferritin, glucose, HDL, ALT, uric acid, lymphocyte %), and the
              GLIS wellness score we calculate from them.
            </li>
            <li>
              <strong>Order and protocol information.</strong> Delivery address,
              payment method selected, protocol tier, confirmation codes, and
              physician review notes.
            </li>
            <li>
              <strong>Technical information.</strong> Device type, browser, IP
              address, session cookies, and basic page-view analytics.
            </li>
          </ul>
        </Section>

        <Section title="3. How we use your information">
          <ul style={list}>
            <li>To authenticate you and maintain your signed-in session.</li>
            <li>
              To deliver the BioScan service: extract markers from your uploaded
              labs, calculate your GLIS score, route your case to a licensed
              physician for review, and assign a matched supplement protocol.
            </li>
            <li>To process orders and arrange physical delivery of supplements.</li>
            <li>
              To communicate with you about your account, scan results, protocol
              status, and important service updates.
            </li>
            <li>
              To improve the Service, debug technical issues, and prevent fraud or
              abuse.
            </li>
            <li>
              To comply with legal obligations under Philippine law, including
              FDA-PH, BIR, and applicable health regulations.
            </li>
          </ul>
        </Section>

        <Section title="4. Who we share information with">
          <p>We share information only with the following categories of recipients:</p>
          <ul style={list}>
            <li>
              <strong>Supabase, Inc.</strong> &mdash; our database and authentication
              provider. Your account data, lab data, and order data are stored on
              Supabase infrastructure. Supabase processes data on our instructions
              under its data processing agreement.
            </li>
            <li>
              <strong>Identity providers (Google, Facebook, GitHub, TikTok).</strong>{" "}
              When you choose to sign in via a social provider, that provider
              receives standard OAuth metadata (the fact that you are signing in to
              GutGuard). We receive your profile information from the provider, as
              described above.
            </li>
            <li>
              <strong>Enrolled GutGuard Protocol Center physicians.</strong> Your
              BioScan markers and GLIS score are reviewed by a licensed Philippine
              physician who has signed a confidentiality agreement with GutGuard.
            </li>
            <li>
              <strong>Logistics and payment partners.</strong> When you place an
              order, your delivery address and contact details are shared with the
              courier we use to ship your protocol. Payments are processed by
              third-party payment processors that meet PCI-DSS requirements.
            </li>
            <li>
              <strong>Government and regulatory bodies</strong> when required by
              Philippine law (e.g., NPC, FDA-PH, BIR).
            </li>
          </ul>
          <p>
            We <strong>do not sell your personal information</strong>, and we do not
            share your health data with advertisers.
          </p>
        </Section>

        <Section title="5. Cookies and similar technologies">
          <p>
            We use strictly-necessary cookies to keep you signed in (Supabase
            session cookies, marked HttpOnly and Secure in production). We may use
            anonymous analytics cookies to understand aggregate usage. We do not
            currently run advertising trackers.
          </p>
        </Section>

        <Section title="6. Data retention">
          <p>
            We keep your account and health information for as long as your account
            is active. If you request deletion (see Section 7), we delete your
            account data within 30 days, except where we are required by law to
            retain certain records (e.g., tax records for orders).
          </p>
        </Section>

        <Section title="7. Your rights">
          <p>
            Under RA 10173 you have the right to be informed, to access, to object,
            to erasure or blocking, to damages, to data portability, and to file a
            complaint with the National Privacy Commission. To exercise any of
            these, email us at the address below.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            We protect your information using TLS in transit, encryption at rest
            (Supabase managed), salted password hashing, row-level security on our
            database tables, and least-privilege access for the small team that
            operates the Service. No system is perfectly secure, but we take
            reasonable steps appropriate to the sensitivity of health data.
          </p>
        </Section>

        <Section title="9. Children">
          <p>
            The Service is intended for adults aged 18 and over. We do not
            knowingly collect information from anyone under 18. If you believe a
            child has provided information to us, please contact us so we can
            delete it.
          </p>
        </Section>

        <Section title="10. International transfers">
          <p>
            Our service providers (including Supabase) may process data on servers
            located outside the Philippines. We rely on contractual safeguards
            with these providers to ensure your information remains protected at
            a standard consistent with Philippine law.
          </p>
        </Section>

        <Section title="11. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. Material changes
            will be communicated by email or by a prominent notice in the Service.
            The &ldquo;Effective&rdquo; date at the top reflects the latest version.
          </p>
        </Section>

        <Section title="12. Contact us">
          <p>
            Questions, deletion requests, or complaints: <br />
            <strong>Data Protection Officer, GutGuard Protocol Center</strong>
            <br />
            Email: <a href="mailto:privacy@gutguard.ph" style={linkStyle}>privacy@gutguard.ph</a>
            <br />
            General Santos City, Philippines
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={h2}>{title}</h2>
      <div style={body}>{children}</div>
    </section>
  );
}

const shell: React.CSSProperties = {
  minHeight: "100dvh",
  background: "var(--bg, #0C1017)",
  color: "rgba(255,255,255,.88)",
  fontFamily: "var(--f, 'Outfit', sans-serif)",
};
const page: React.CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  padding: "clamp(32px, 6vw, 64px) clamp(20px, 5vw, 32px) 96px",
  lineHeight: 1.7,
};
const back: React.CSSProperties = {
  display: "inline-block",
  marginBottom: 32,
  fontSize: 14,
  color: "rgba(255,255,255,.55)",
  textDecoration: "none",
};
const head: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,.08)",
  paddingBottom: 24,
};
const h1: React.CSSProperties = {
  fontSize: "clamp(32px, 5vw, 44px)",
  fontWeight: 800,
  letterSpacing: "-.02em",
  margin: 0,
};
const meta: React.CSSProperties = {
  marginTop: 12,
  color: "rgba(255,255,255,.55)",
  fontSize: 15,
};
const h2: React.CSSProperties = {
  fontSize: "clamp(20px, 2.6vw, 24px)",
  fontWeight: 700,
  letterSpacing: "-.01em",
  marginBottom: 12,
  color: "#fff",
};
const body: React.CSSProperties = {
  fontSize: 15,
  color: "rgba(255,255,255,.72)",
};
const list: React.CSSProperties = {
  paddingLeft: 20,
  margin: "8px 0",
};
const linkStyle: React.CSSProperties = {
  color: "var(--bl, #3B82C8)",
  textDecoration: "none",
};
