import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — GutGuard",
  description:
    "The terms that govern your use of the GutGuard Patient Portal and related services.",
};

const EFFECTIVE_DATE = "May 24, 2026";

export default function TermsOfServicePage() {
  return (
    <div style={shell}>
      <div style={page}>
        <Link href="/" style={back}>
          ← Back to GutGuard
        </Link>

        <header style={head}>
          <h1 style={h1}>Terms of Service</h1>
          <p style={meta}>
            Effective {EFFECTIVE_DATE}. By creating an account or using the
            GutGuard Patient Portal, our website, or related services (the
            &ldquo;Service&rdquo;), you agree to these Terms of Service (the
            &ldquo;Terms&rdquo;). Please read them carefully.
          </p>
        </header>

        <Section title="1. Who we are">
          <p>
            The Service is operated by IG International / GutGuard
            (&ldquo;GutGuard,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;).
            Medical Director: Dr. Shane Animas, MD (PRC Lic. 0098732, Internal
            Medicine, General Santos City).
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            You must be at least 18 years old and a resident of the Philippines (or
            otherwise legally able to enter into binding contracts) to use the
            Service. By creating an account you represent that you meet these
            requirements.
          </p>
        </Section>

        <Section title="3. The Service">
          <p>
            The Service lets you upload an existing blood panel, receive a GLIS
            wellness score reviewed by a licensed Philippine physician, and
            optionally order a matched Pre→Pro→Postbiotic supplement protocol
            (GutGuard SynBIOTIC+).
          </p>
        </Section>

        <Section title="4. Medical disclaimer (please read)">
          <p>
            <strong>
              GutGuard is a wellness service. It is not a diagnostic test, not a
              treatment, and not a substitute for medical advice, diagnosis, or
              treatment from your own physician.
            </strong>
          </p>
          <ul style={list}>
            <li>
              GutGuard SynBIOTIC+ is a licensed Philippine lifestyle food
              supplement (FDA-PH CPR FR-4XXXXXXX, LTO FDO-XXXXXXX). It is not
              intended to diagnose, treat, cure, or prevent any disease.
            </li>
            <li>
              The GLIS score is a proprietary internal wellness-monitoring
              framework. It has not been independently peer-reviewed or validated
              as a clinical diagnostic instrument.
            </li>
            <li>
              Protocol assignment is a supplement recommendation, not a
              prescription act under RA 9173 or the Medical Act.
            </li>
            <li>
              <strong>
                Always consult your physician before starting, stopping, or
                changing any treatment. Do not discontinue any prescribed
                medication based on your GLIS score.
              </strong>
            </li>
            <li>
              In a medical emergency, call your doctor or local emergency services
              immediately. The Service is not designed to handle urgent or
              life-threatening conditions.
            </li>
          </ul>
        </Section>

        <Section title="5. Your account">
          <p>
            You are responsible for keeping your sign-in credentials confidential
            and for all activity under your account. Notify us immediately if you
            suspect unauthorized access. You agree to provide accurate, current,
            and complete information when creating your account and to keep it
            updated.
          </p>
        </Section>

        <Section title="6. Third-party sign-in services">
          <p>
            When you sign in with Google, Facebook, GitHub, or TikTok, your use of
            that service is also governed by the third party&rsquo;s own terms and
            privacy policy. We are not responsible for the practices of those
            providers. We use the third-party sign-in solely to identify you and
            create your GutGuard account; we never post or take any action on your
            third-party account on your behalf.
          </p>
        </Section>

        <Section title="7. Acceptable use">
          <p>You agree not to:</p>
          <ul style={list}>
            <li>
              Submit lab data, identity information, or payment details that are
              not your own, unless you have explicit authorization to do so.
            </li>
            <li>
              Attempt to reverse-engineer, scrape, or interfere with the Service or
              its underlying infrastructure.
            </li>
            <li>
              Use the Service to violate any law, regulation, or third-party right.
            </li>
            <li>
              Resell, redistribute, or commercially exploit any part of the Service
              without our written consent.
            </li>
          </ul>
        </Section>

        <Section title="8. Orders, payment, and refunds">
          <p>
            When you place an order for a protocol, payment is processed by our
            third-party payment partners. We arrange delivery via licensed
            couriers. Our 90-day Money-Back Guarantee applies: if you complete a
            full 90 days of a Grow- or Peak-tier protocol and your GLIS score
            shows no measurable improvement, we will refund the supplement cost in
            full. Details and exclusions are published on the offer page at the
            time of purchase.
          </p>
        </Section>

        <Section title="9. Intellectual property">
          <p>
            The Service, including software, content, logos, the GLIS framework,
            and the GutGuard brand, is owned by GutGuard or our licensors. We
            grant you a limited, non-exclusive, non-transferable license to use
            the Service for your personal, non-commercial wellness purposes only.
          </p>
        </Section>

        <Section title="10. Your content">
          <p>
            You retain ownership of the lab files and personal information you
            submit. You grant us a limited license to process that content solely
            to provide the Service to you (including physician review and
            protocol matching). We will not use your personal health data for any
            other purpose without your consent.
          </p>
        </Section>

        <Section title="11. Disclaimers and limitation of liability">
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; To
            the maximum extent permitted by Philippine law, GutGuard disclaims all
            warranties, express or implied, including merchantability, fitness for
            a particular purpose, and non-infringement.
          </p>
          <p>
            To the maximum extent permitted by law, GutGuard&rsquo;s aggregate
            liability arising out of or relating to the Service is limited to the
            amount you paid us for the protocol in the twelve (12) months
            preceding the event giving rise to the claim.
          </p>
        </Section>

        <Section title="12. Termination">
          <p>
            You may close your account at any time by contacting us. We may
            suspend or terminate your access to the Service if you breach these
            Terms or if we are required to do so by law. Sections that by their
            nature should survive termination (including disclaimers, limitations
            of liability, and intellectual property) will survive.
          </p>
        </Section>

        <Section title="13. Changes to these Terms">
          <p>
            We may update these Terms from time to time. Material changes will be
            communicated by email or by a prominent notice in the Service. Your
            continued use of the Service after the changes take effect constitutes
            acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="14. Governing law and venue">
          <p>
            These Terms are governed by the laws of the Republic of the
            Philippines, without regard to its conflict-of-laws principles. Any
            dispute arising out of or relating to these Terms or the Service shall
            be brought exclusively in the competent courts of General Santos City,
            Philippines.
          </p>
        </Section>

        <Section title="15. Contact">
          <p>
            <strong>GutGuard Protocol Center</strong>
            <br />
            Email:{" "}
            <a href="mailto:support@gutguard.ph" style={linkStyle}>
              support@gutguard.ph
            </a>
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
