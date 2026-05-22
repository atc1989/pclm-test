# GLIS Clinical Methodology

**A Physician's Reference for the Gut-Lifestyle Inflammation Score**

*Lead Authors: CSA (IG International / GutGuard) and Dr. Shane Animas, MD (Internal Medicine, GenSan) — pending co-authorship confirmation*

*Version 1.3 — April 2026*

*Status: Draft for clinical review and revision*

---

## Executive Summary — Chairside Quick Reference

**What GLIS measures.** The Gut-Lifestyle Inflammation Score (GLIS) is a composite biological score targeting **inflammaging** — chronic low-grade systemic inflammation. It measures one specific phenomenon, not inflammation generally.

**What GLIS is not.** GLIS is not a diagnostic tool. It does not detect acute infection, autoimmune disease, organ-specific inflammation, allergic conditions, neuroinflammation, cancer, or any clinical pathology. Patients with clinical symptoms suggesting these conditions need specialist evaluation, not a GLIS score.

**Score scale.** 0–100, where **lower = lower inflammatory burden**. Four bands:

| Score | Patient Label | Clinical Label |
|---|---|---|
| 0–25 | Optimal (*Mabuti*) | Low inflammation |
| 26–50 | Good (*Maayos*) | Moderate inflammation |
| 51–75 | Pay Attention (*Pansinin*) | High inflammation |
| 76–100 | Take Action (*Kumilos Na*) | Critical inflammation |

**Tier structure (PH lab pricing):**

| Tier | Markers | Cost (PHP) | When to use |
|---|---|---|---|
| Screen | 3 (hs-CRP, CBC/NLR, HbA1c) | ₱1,000–1,500 | Budget-constrained pre-screening only; not full GLIS |
| Core | 5 (+ ALT, eGFR) | ₱2,000–3,000 | Default protocol baseline |
| Plus | 8 (+ ferritin, TyG, uric acid, albumin) | ₱5,500–8,500 | Pathway differentiation, premium |
| Complete | 12 (+ homocysteine, fasting insulin, GGT, cortisol AM, DHEA-S) | ₱9,500–14,500 | Full four-domain assessment |

**Two operational gates protect score validity:**

1. **Pre-scan check-in (patient-facing gate)** — at every BioScan upload, the patient confirms the **blood draw date and time** and completes a checklist about their condition **at the time the blood was drawn**. The system responds with one of three explicit recommendations:
   - **Good to scan** (high confidence — proceed normally)
   - **Scan with caveat** (lower confidence — specific notes attached to score)
   - **Reschedule recommended** (active infection, recent surgery, autoimmune flare, cancer treatment, pregnancy, vaccination within 24 hours of draw — scan would measure the wrong thing)
2. **Confidence handling** — for partial marker sets. Below 75% of tier markers (4/5 Core, 6/8 Plus, 9/12 Complete), no composite score is computed.

**Mandatory referral triggers:** HbA1c ≥6.5%, hs-CRP >10 mg/L, NLR >5.0, eGFR <30, ALT >100, albumin <3.0, homocysteine >30, cortisol AM <3 or >25.

**Deployment model.** GLIS is a patient-primary wellness tool. Patients may use it:
- Independently, with their own offline doctor handling clinical follow-up
- With an optional GutGuard-matched supervising physician
- With their existing doctor reviewing results outside the GutGuard system

**Your role (if you participate as a supervising physician — optional).** Review flagged results within 24-72 hours. Make override decisions on "Reschedule recommended" scans with documented justification when clinically appropriate. Approve or defer protocol enrollment based on full context. Provide initial referral guidance.

**Your boundaries (always).** You are not the patient's PCP. You are not responsible for long-term follow-up beyond initial referral. Findings outside GutGuard protocol scope remain the patient's PCP's responsibility. Patients without a GutGuard supervising physician are responsible for their own clinical follow-up.

**Pediatric exclusion.** GLIS is for adults 18 and over. Reference ranges are not pediatric-calibrated.

---

## 1. Conflict of Interest — Acknowledged Directly

GLIS is owned and operated by IG International / GutGuard, the manufacturer of the Pre→Pro→Postbiotic + MBS supplement protocol that GLIS is used to assess. The score gates entry into and validates outcomes for a commercial product marketed by the same entity that operates the score.

This is a real conflict of interest, and physicians evaluating GLIS should be aware of it. Three considerations for how the methodology safeguards against this conflict:

**The exclusion zone is operationally enforced.** Section 7 establishes what GLIS does not measure; Section 8 establishes the patient-facing pre-scan check-in that operationally prevents measurement of excluded phenomena. A commercially-motivated framework would document the exclusion zone as fine print and silently compute scores anyway. This framework does not — and the patient sees the gate operating, which provides accountability beyond physician oversight alone (especially important given the patient-primary deployment model).

**Markers are selected from peer-reviewed inflammaging literature, not commercial convenience.** Section 4 defends each marker selection with citations from established medical literature (Levine, Ridker, Pearson, Furman, Franceschi). A commercially-motivated framework would select markers based on lab partnerships and pricing; this framework's marker selection is methodologically driven.

**Independent peer-reviewed validation is on the roadmap.** Section 15 specifies a validation study (n ≥ 150, IRB-submitted, target publication in Philippine Journal of Internal Medicine). GLIS is not currently independently validated; this is acknowledged transparently throughout the document.

These safeguards do not eliminate the commercial relationship. They constrain how that relationship can affect the methodology. Physicians evaluating GLIS — whether to participate as supervising physicians, advise their own patients on it, or simply assess whether they're comfortable with the framework — should weigh the conflict against the safeguards and make their own determination.

---

## 2. Regulatory Positioning

GLIS is positioned as a **non-diagnostic wellness screening and protocol-tracking tool**. It is not a medical device under FDA Philippines regulations and is not marketed as a clinical decision support system. Patient use does not require physician supervision, though optional supervising physician involvement is available within the GutGuard ecosystem.

GLIS does not:
- Issue diagnostic conclusions
- Direct clinical treatment decisions
- Replace physician evaluation
- Substitute for FDA-registered diagnostic tests

GLIS does:
- Aggregate results from FDA-registered laboratory tests into a composite screening score
- Support patient education and lifestyle protocol guidance
- Track inflammation trajectory over time
- Recommend medical follow-up when critical findings are detected

The framework operationally enforces this non-diagnostic scope through the patient-facing pre-scan check-in (Section 8) and confidence handling (Section 9), preventing the system from issuing scores that would constitute clinical risk stratification or disease prediction.

Should regulatory classification of similar wellness scoring tools change under FDA Philippines or the DOH, GLIS will be re-evaluated for compliance.

---

## 3. The Inflammaging Target — Why GLIS Is Defensibly Specific

A composite score that does not specify which inflammation it targets is scientifically unstable. Specialists dismiss such scores. This section establishes what GLIS targets and what it does not.

### 3.1 The Seven Categories of Inflammation

The word "inflammation" describes seven distinct biological phenomena:

1. **Acute inflammation** — the body's response to injury or infection. CRP rises sharply, often above 50 mg/L. Examples: pneumonia, appendicitis, traumatic injury. Medically obvious.

2. **Chronic high-grade inflammation** — sustained, clinically apparent inflammation from defined pathology. Examples: rheumatoid arthritis, lupus, IBD. Specialist territory; disease-specific markers.

3. **Acute-on-chronic inflammation** — flares superimposed on chronic disease. Examples: RA flare, Crohn's exacerbation. Disease-specific management.

4. **Chronic low-grade systemic inflammation (inflammaging)** — sustained, sub-clinical inflammatory state. Invisible to the patient, undetected by standard checkups, driven by metabolic dysfunction, gut dysbiosis, lifestyle, and aging. CRP typically 1–10 mg/L. Associated with cardiovascular disease, type 2 diabetes, neurodegeneration, sarcopenia, frailty, and accelerated biological aging. **This is what GLIS measures.**

5. **Local inflammation** — confined to specific tissues. Direct measurement requires tissue-specific approaches.

6. **Allergic / Type 2 inflammation** — IgE/eosinophil-mediated. Different markers entirely.

7. **Neuroinflammation** — CNS inflammation, microglial-mediated. Different markers (GFAP, NFL, kynurenine pathway).

### 3.2 Why This Specificity Matters

GLIS measures inflammaging specifically. The framework's markers, scoring weights, exclusion zone, pre-scan check-in, and clinical action pathway all flow from this single locked target. The framework actively prevents measurement of the other six categories — both documentary (Section 7 exclusion zone) and operational (Section 8 patient-facing pre-scan check-in anchored to blood draw date and time).

This specificity is the methodological foundation. A score that vaguely claims to measure "inflammation generally" is dismissible. A score that explicitly measures inflammaging — and operationally enforces that focus through a transparent patient gate — is defensible.

### 3.3 Inflammaging in the Peer-Reviewed Literature

- **Franceschi C, et al.** "Inflamm-aging: an evolutionary perspective on immunosenescence." *Annals of the NY Academy of Sciences* 2000.
- **Franceschi C, Campisi J.** "Chronic inflammation (inflammaging) and its potential contribution to age-associated diseases." *J Gerontol A* 2014.
- **Furman D, et al.** "Chronic inflammation in the etiology of disease across the life span." *Nature Medicine* 2019.
- **Levine ME, et al.** "An epigenetic biomarker of aging for lifespan and healthspan." *Aging* 2018.

---

## 4. The GLIS Marker Set — Scientific Rationale

GLIS Core uses five markers across three biological domains. Each marker is selected because it captures a defensible aspect of inflammaging, with peer-reviewed literature support.

### 4.1 hs-CRP — Inflammatory Domain, 24 points

**What it measures.** High-sensitivity C-reactive protein in the 1–10 mg/L range — the inflammaging range, distinct from acute infection elevations of 50+ mg/L. CRP is the downstream integrator of the NLRP3 → IL-1β → IL-6 → hepatocyte CRP cascade.

**Why it fits inflammaging.** CRP in the inflammaging range is one of the most robust predictors of cardiovascular events, all-cause mortality, and accelerated biological aging in the medical literature.

**Anticipated objection: "Single time-point CRP is unreliable."** Acknowledged. CRP can be transiently elevated by acute events (infection, injury, vaccination, sleep deprivation, intense exercise) at the time of blood draw. The patient-facing pre-scan check-in (Section 8) routes patients with these conditions present at draw time to "Reschedule recommended" or "Scan with caveat."

**Citations.** Ridker PM, et al. *NEJM* 2000; Pearson TA, et al. *Circulation* 2003; Levine ME, et al. *Aging* 2018.

### 4.2 NLR — Inflammatory Domain, 16 points

**What it measures.** Balance between innate immune activation (neutrophils) and adaptive immune competence (lymphocytes). Computed from standard CBC differential.

**Why it fits inflammaging.** Chronic low-grade inflammation produces sustained neutrophil dominance and relative lymphopenia. Increasingly used in geriatric medicine, oncology, and longevity research as an inflammaging marker.

**Operational advantage.** Computed from the standard CBC that most patients already have. Adds inflammaging signal without requiring an additional test.

**Citations.** Zahorec R. *Bratisl Lek Listy* 2021; Fest J, et al. *Eur J Epidemiol* 2019.

### 4.3 HbA1c — Metabolic Domain, 35 points

**What it measures.** Three-month glycemic substrate. Reflects sustained glucose exposure that drives advanced glycation end-product formation, oxidative stress, adipose tissue dysfunction, and chronic activation of inflammatory pathways.

**Why it fits inflammaging.** HbA1c is included not because diabetes is inflammation, but because chronic hyperglycemia is one of the primary metabolic drivers of inflammaging. Elevated HbA1c in the prediabetic range (5.7–6.4%) is associated with accelerated inflammatory aging even in patients who do not yet meet diabetic criteria.

HbA1c is classified as a metabolic-domain marker only. The neuroendocrine domain activates at Complete tier with direct HPA-axis markers; until then, the framework provides full assessment across three domains without claiming neuroendocrine coverage.

**Why the highest weight (35 of 100 points).** HbA1c's weight reflects its role as the dominant upstream driver of inflammaging in the target population. In Filipino patients, prediabetes and type 2 diabetes prevalence drives a substantial portion of population-level inflammaging burden.

**Anticipated objection: "HbA1c is a diabetes marker, not an inflammation marker."** True but incomplete. HbA1c reflects the metabolic substrate that produces inflammaging. Patients with HbA1c ≥6.5% are flagged for endocrinology referral (Section 11).

### 4.4 ALT — Organ Function Domain, 12 points

**What it measures.** Hepatocellular metabolic stress. Mildly elevated ALT in the absence of viral hepatitis, alcoholism, or hepatotoxic drug exposure is the most common biomarker of non-alcoholic fatty liver disease (NAFLD).

**Why it fits inflammaging.** The liver is metabolically central to inflammaging. NAFLD-associated inflammation contributes to systemic CRP elevation, insulin resistance, and adipose tissue dysfunction.

**Tighter thresholds than typical PH lab reference ranges.** GLIS uses 25 U/L for women, 33 U/L for men (per AGA guidance) rather than the typical PH lab range of <40 U/L.

**Anticipated objection: "ALT can be elevated by alcohol, medications, recent exercise."** Acknowledged. The patient-facing pre-scan check-in captures recent alcohol consumption, exercise, and relevant medications at the time of blood draw.

**Citations.** Kwo PY, et al. *Am J Gastroenterol* 2017; Younossi ZM, et al. *Hepatology* 2016.

### 4.5 eGFR — Organ Function Domain, 13 points

**What it measures.** Estimated glomerular filtration rate, computed using CKD-EPI 2021 formula incorporating age and sex.

**Why it fits inflammaging.** Chronic kidney disease has a bidirectional relationship with systemic inflammation — uremic toxins promote inflammation, inflammation accelerates renal decline.

**Why eGFR rather than raw creatinine.** Raw creatinine is heavily confounded by muscle mass.

**Anticipated objection: "eGFR can be affected by hydration status."** Acknowledged. The patient-facing pre-scan check-in captures hydration status at the time of blood draw.

**Citations.** Stenvinkel P, et al. *Kidney International* 1999.

### 4.6 What This Selection Achieves

The five markers together capture inflammaging across three dimensions: direct inflammatory signal (CRP, NLR), metabolic substrate (HbA1c), and end-organ inflammatory burden (ALT, eGFR). The fourth biological domain (neuroendocrine) activates at Complete tier with cortisol AM and DHEA-S.

When a specialist asks *"why these markers?"*, the answer is documented. When a patient asks *"what does this mean?"*, the answer connects to a real biological process.

---

## 5. The Tier Architecture — Screen / Core / Plus / Complete

### 5.1 The Domain × Tier Matrix

| Domain | Screen (3) | Core (5) | Plus (8) | Complete (12) |
|---|---|---|---|---|
| **Inflammatory** | hs-CRP, NLR | hs-CRP, NLR | hs-CRP, NLR, ferritin | hs-CRP, NLR, ferritin, homocysteine |
| **Metabolic** | HbA1c | HbA1c | HbA1c, TyG, uric acid | HbA1c, TyG, uric acid, fasting insulin/HOMA-IR |
| **Organ Function** | — | ALT, eGFR | ALT, eGFR, albumin | ALT, eGFR, albumin, GGT |
| **Neuroendocrine** | — | — | — | cortisol AM, DHEA-S |
| **Cost (PHP)** | ₱1,000–1,500 | ₱2,000–3,000 | ₱5,500–8,500 | ₱9,500–14,500 |
| **PH availability** | Universal | Universal | Universal | Universal |
| **Turnaround** | Same day | Same day | Same day | 2–3 days |

All twelve Complete tier markers verified routinely available at major Philippine laboratory chains.

### 5.2 What Each Tier Contributes Clinically

**GLIS Screen** — A 3-marker pre-screening tier covering only inflammatory and metabolic domains. Screen produces a directional indicator, not a full GLIS score. Used for budget-constrained pre-screening or rapid intake. Screen does not gate entry into the protocol — Core or higher is required.

**GLIS Core** — The 5-marker tier covering all three current domains. Core is the canonical GLIS score. Default tier for protocol enrollment.

**GLIS Plus** — The 8-marker tier deepening each of the three current domains: ferritin (inflammatory), TyG and uric acid (metabolic), albumin (organ function). Used for premium enrollment, mid-protocol validation, and pathway differentiation.

**GLIS Complete** — The 12-marker tier activating the neuroendocrine domain (cortisol AM, DHEA-S), adding homocysteine, fasting insulin / HOMA-IR, and GGT. Used for clinical-grade assessment, certification, and patients with suspected stress-driven, metabolic-syndrome-deep, or HPA-mediated inflammaging.

**Note: The Complete tier requires AM blood draw timing** (typically 6-9 AM) for valid cortisol interpretation. The pre-scan check-in (Section 8) captures draw time and routes Complete-tier scans with non-AM draws to appropriate handling.

### 5.3 Cross-Tier Score Continuity (Not Equivalence)

GLIS scores at all tiers compute on the same 0–100 scale to enable trajectory continuity. The confidence indicator (X of 12 markers) shows the marker basis for each scan. Cross-tier score equivalence has not been empirically validated; this is part of the v1.5 study.

### 5.4 IL-6, TNF-α, and the Future GLIS Research Tier

IL-6 and TNF-α are not routinely available at Philippine clinical laboratories. They are reserved for a future GLIS Research tier launching when PH reference-laboratory partnership makes routine availability feasible.

---

## 6. The Score Computation

The GLIS score is computed as a weighted linear sum of marker contributions, normalized to 0–100 where lower scores indicate lower inflammatory burden.

**GLIS Core (5 markers, 100 points total):**

| Marker | Domain | Weight |
|---|---|---|
| hs-CRP | Inflammatory | 24 |
| NLR | Inflammatory | 16 |
| HbA1c | Metabolic | 35 |
| ALT | Organ Function | 12 |
| eGFR | Organ Function | 13 |

**Severe-abnormal floor rule.** If any single marker reaches its critical-range threshold (Section 11), GLIS produces a score floor reflecting that critical finding regardless of other markers' contributions.

**Plus and Complete tiers** redistribute weights across markers while preserving the 0–100 scale.

---

## 7. The Exclusion Zone — When GLIS Is Not the Right Tool

GLIS does not detect, diagnose, monitor, or substitute for clinical evaluation of:

- **Acute infections** (pneumonia, UTI, sepsis)
- **Autoimmune diseases** (RA, SLE, IBD, psoriatic arthritis, ankylosing spondylitis)
- **Organ-specific inflammation** (synovitis, enterocolitis, pulmonary, dermatologic)
- **Allergic / Type 2 inflammation** (atopy, asthma, eosinophilic conditions)
- **Cancer or oncologic inflammation**
- **Neuroinflammation**
- **Cardiovascular risk in established cardiac disease**
- **Diabetes management on therapy**
- **Pre-operative clinical assessment**
- **Specific medication response**
- **Pregnancy** — GLIS reference ranges are not pregnancy-calibrated

**Pediatric exclusion.** GLIS is intended for adults aged 18 and older. Reference ranges are not pediatric-calibrated; many of the markers (notably HbA1c thresholds, eGFR formulas, and adult-specific inflammaging studies) do not translate directly to pediatric populations. The system requires age verification at account creation and will not compute scores for users under 18.

The exclusion zone is operationally enforced through the patient-facing pre-scan check-in (Section 8). Patients reporting any of these conditions as present at the time of blood draw are routed to "Reschedule recommended" before they proceed.

The exclusion zone is not a limitation to hide. It is a defining feature. A score that clearly states what it does not do — and operationally prevents measuring those things at the patient gate — is more credible than a score vaguely claiming broad coverage.

---

## 8. The Pre-Scan Check-In — A Patient-Facing Gate Anchored to the Blood Draw

This is the methodologically essential feature that distinguishes GLIS from wellness-app wrappers that silently compute scores regardless of patient context.

### 8.1 Why This Matters Clinically

GLIS is calibrated to detect inflammaging — chronic, low-grade, sub-clinical inflammation. Several common conditions produce inflammatory marker elevations identical to inflammaging on lab reports but representing fundamentally different biology: acute infection, recent surgery, pregnancy, autoimmune flare, recent vaccination, strenuous exercise, significant alcohol consumption, sleep deprivation, fasting state mismatches, acute medication effects, acute mental health crisis.

**The clinically critical detail: what matters is the patient's state at the time the blood was drawn, not at the time they upload the results.** Blood markers are a snapshot of a specific moment; the check-in captures context for that moment.

### 8.2 Step 1 — Confirm Blood Draw Date and Time

The first screen asks the patient to confirm or enter the date and time the blood was drawn. The system pre-fills these from the BioScan record where available (lab reports typically carry both date and time), and asks the patient to confirm.

> **When was your blood drawn?**
>
> *We need to know this so we can ask the right questions about how you were feeling at the time. The markers in your blood test reflect your body's state on the day of the draw, not today.*
>
> Date: [pre-filled or entered: e.g., October 15, 2026]
> Time: [pre-filled or entered: e.g., 7:30 AM]
>
> [Confirm and continue →]

The time of draw matters specifically for the Complete tier. AM cortisol has a strong circadian variation, with reference ranges anchored to morning collection (typically 6-9 AM). A "morning cortisol" reading from a 2 PM draw is biologically valid as a value but cannot be interpreted against the standard reference range. Complete-tier scans with non-AM draws will display a specific caveat about cortisol interpretation.

If the patient cannot confirm the draw date or time, the system asks for best estimates and flags the scan in the audit trail with "estimated — unconfirmed."

### 8.3 Step 2 — Chronic Context Disclosure (One-Time, Then Stored)

Before the time-anchored check-in, the patient confirms several pieces of chronic context that don't change between scans:

> **A few things about you (you only have to answer these once — let us know when they change):**
>
> - **Are you a current smoker?** (No / Occasional / Yes — daily) *Smokers typically have chronically elevated inflammatory markers; this is part of how we interpret your score.*
>
> - **For women: Are you currently using hormonal contraception or hormone replacement therapy?** (No / Yes — type / Skip)
>
> - **Do you have a chronic condition we should know about?** *(Free-text optional disclosure of stable chronic conditions like well-controlled hypertension, well-controlled hypothyroidism, etc.)*
>
> [Confirm and continue →]

These are stored with the patient profile and shown on every scan for confirmation. Patients can update them anytime. They do not gate scoring but inform interpretation. Smoking status in particular shifts the patient's "everyday baseline" — a smoker's GLIS score should be interpreted in light of the chronic inflammatory contribution from smoking, separate from the protocol-targetable inflammaging contribution.

### 8.4 Step 3 — Time-Anchored Check-In Questions

After the date/time is confirmed and chronic context is current, the patient sees the check-in screen with the date prominently displayed. Framing copy:

> **Pre-Scan Check-In**
>
> *Blood drawn on: [confirmed date], at [confirmed time]*
>
> *Before we calculate your score, we need to know how you were feeling around the time your blood was drawn. The markers in your test reflect your body's state then, not now. A few quick questions — this helps us give you an accurate result.*

Each question is anchored to the blood draw date. Target completion: 90 seconds, single-tap responses where possible.

**Recent illness or injury (relative to blood draw date):**

1. **In the 2 weeks before [October 15], did you have a fever, flu, or other infection?**

2. **In the 4 weeks before [October 15], did you have surgery or a significant injury?**

3. **On [October 15], were you being treated for an autoimmune condition that was flaring (RA, SLE, IBD, etc.)?**

4. **On [October 15], were you undergoing cancer treatment (chemotherapy, radiation, immunotherapy)?**

**Pregnancy (women only, mandatory):**

5. **On [October 15], were you pregnant?**

**Recent vaccination (relative to blood draw):**

6. **In the 72 hours before [October 15], did you receive any vaccination?** *(within 24 hours of draw / 24–72 hours before draw / no)*

**Recent medications (at the time of blood draw):**

7. **On [October 15], were you taking any of the following: NSAIDs (ibuprofen, aspirin), steroids (prednisone), or antibiotics?**

**Pre-draw lifestyle (relative to blood draw):**

8. **In the 48 hours before [October 15], did you do strenuous exercise (more than your usual activity)?**

9. **In the 72 hours before [October 15], did you drink significant alcohol (3+ drinks)?**

**Pre-draw physiological state:**

10. **On the night before your [October 15] blood draw, did you sleep poorly (less than 6 hours, or significantly disrupted sleep)?** *Poor sleep temporarily elevates cortisol and inflammatory markers.*

11. **For the 8+ hours before your [October 15] blood draw, were you fasted (no food, only water)?** *(Yes — fasted overnight as recommended / No — I had eaten / Unsure)* *Fasting status affects metabolic markers including TyG, fasting insulin, and HOMA-IR.*

**Acute stress (relative to blood draw):**

12. **In the 7 days before [October 15], did you experience a major stressful event (death in family, accident, severe emotional crisis)?**

**Optional (skippable, women only):**

- **On [October 15], were you menstruating?**

The bracketed date is replaced with the patient's confirmed blood draw date in actual rendering. Plain language with Tagalog companion phrasing throughout. Patients can edit answers before submitting; the system logs both original and revised answers if changed, with audit-trail flagging if the change moved toward less restrictive outcome.

### 8.5 The System Response — Three Explicit Recommendations

After the patient completes the checklist and submits, the system shows them an explicit recommendation panel — a visible response the patient reads before any score is shown.

#### Recommendation 1: "Good to scan" (*Pwede na mag-scan*)

**Triggered when:** No relevant conditions reported as present at or around the blood draw date.

**What the patient sees:**

> ✓ **Good to scan**
>
> *Based on your check-in, your body was in a clean baseline state when your blood was drawn on [date]. Your score will reflect your everyday inflammation with full confidence.*
>
> [Continue to GLIS results →]

**System action:** Standard GLIS computation proceeds. Score displayed normally with the standard supporting copy and confidence indicator.

#### Recommendation 2: "Scan with caveat" (*Mag-scan na, may note*)

**Triggered when:** Patient reports one or more of: vaccination 24–72 hours before draw, NSAID/steroid/antibiotic use at draw time, strenuous exercise within 48 hours of draw, significant alcohol within 72 hours of draw, poor sleep night before draw, non-fasted state for fasting-sensitive markers, major acute stress within 7 days of draw, active menstruation at draw, or non-AM draw timing for Complete tier.

**What the patient sees:**

> ⚠ **Scan with caveat**
>
> *You can scan now, but a few things may have affected the markers in your blood when it was drawn on [date]:*
>
> *• [Specific caveat 1, e.g., "You had been vaccinated within 72 hours before the draw — vaccines temporarily elevate inflammatory markers"]*
> *• [Specific caveat 2, e.g., "You did strenuous exercise in the 48 hours before the draw — this temporarily elevates ALT and CRP"]*
>
> *Your score will be computed and shown with these notes for context. Your doctor will see the same notes (if you have a supervising physician).*
>
> [Continue to GLIS results →]

**System action:** GLIS is computed normally. Score displayed with the standard supporting copy plus the explicit caveat note. The score is plotted on the trajectory with a visual marker indicating context-affected status.

#### Recommendation 3: "Reschedule recommended" (*Iurong muna ang scan*)

**Triggered when:** Patient reports any of: active infection within 2 weeks of draw, surgery or significant injury within 4 weeks of draw, active autoimmune flare at draw, active cancer treatment at draw, pregnancy at draw, vaccination within 24 hours of draw.

**What the patient sees:**

> ✕ **Reschedule recommended**
>
> *Based on your check-in, your body was experiencing [specific condition] when your blood was drawn on [date]. The markers in your test likely reflect that condition rather than your everyday inflammation.*
>
> *We recommend getting your blood drawn again [specific timeframe].*
>
> *Your individual marker readings from this draw are saved for your reference. If any of those readings concern you, please consult your doctor.*
>
> [View individual markers →] [Schedule new blood draw →]

**System action:** GLIS computation halted. No composite score computed. Individual marker readings remain accessible. The deferred scan is logged.

For patients with a GutGuard supervising physician (optional), the deferred scan is visible in the doctor portal and can be reviewed for potential override (Section 12). For patients without a supervising physician, the deferral is final within the system — patients who want to proceed despite the deferral should consult their own physician outside the GutGuard ecosystem.

The patient's protocol enrollment access is preserved — deferral is not a penalty.

### 8.6 Why Anchor to Blood Draw Date and Time

**Biological accuracy.** Blood markers are a snapshot of the body at a specific moment. The relevant context for interpretation is the patient's state when that snapshot was taken — not their state when they happen to upload the results.

**Patient cognition support.** Asking patients to mentally project backward to a specific date and recall conditions at that moment is a non-trivial cognitive task. Anchoring every question to the explicit date ("On October 15, were you...") makes the temporal frame unambiguous.

**Clinical precision.** When applicable, the doctor portal can display check-in responses with explicit temporal context — "patient reported infection in the 2 weeks before the October 15 blood draw, drawn at 7:30 AM."

**Cortisol interpretation.** Time of draw is essential for AM cortisol (Complete tier). A 2 PM draw produces a biologically valid value that cannot be interpreted against a "morning cortisol" reference range. The system flags this explicitly.

### 8.7 Patient Experience for Old Lab Results

A common scenario: a patient has lab results from a blood draw weeks or months ago and decides to upload them now. The patient enters the historical blood draw date, the check-in asks about their conditions on or around that historical date, and the system evaluates the response with the same logic as a recent draw.

This makes the system equally valid for fresh blood draws and retrospective uploads of older lab results.

### 8.8 Honesty Protection

The system is designed so honest reporting produces the same product-feature access as no-condition reporting:

- "Reschedule recommended" patients still see their individual marker readings
- They retain full access to protocol enrollment workflow
- They receive clear, non-judgmental rescan guidance with specific timeframes
- They are not penalized for honest reporting

There is no advantage to lying on the check-in. The "Reschedule recommended" outcome is presented as the system being thorough on the patient's behalf, not as gatekeeping.

The temporal anchor design adds a subtle protection against gaming: a patient who tries to misremember conditions still has to commit to a specific date claim. The audit trail captures both the date and the answers.

### 8.9 Trajectory Treatment

Trajectory plots distinguish four scan types and use **the blood draw date** as the trajectory axis (not the upload date). This is important: if a patient uploads three retrospective scans on the same day (e.g., labs from January, April, and July), the trajectory should show three distinct points spanning January–July, not three points on the same upload day.

- **"Good to scan" (full confidence):** filled dots in band color
- **"Scan with caveat" (caveated):** filled dots with small icon
- **"Reschedule recommended" override-computed (with optional physician):** outlined dots with override icon
- **"Reschedule recommended" without override:** not plotted; visible in Scan History as deferred entry with reason

A trajectory plotted by blood draw date with check-in context for each draw tells a clinically accurate story: *Optimal (June 1, Good to scan) → [deferred entry — flu around July 15 draw] → Pay Attention (September 1, Scan with caveat — recent vaccination) → Optimal (December 1, Good to scan).*

### 8.10 Mapping to the Underlying Three-Tier Logic

The patient-facing recommendations map cleanly to the three-tier classification:

| Patient sees | Underlying tier | System action |
|---|---|---|
| ✓ Good to scan | Tier 3 | Standard GLIS computation |
| ⚠ Scan with caveat | Tier 2 | Score computed with interpretive note |
| ✕ Reschedule recommended | Tier 1 | Score deferred (physician override possible only with optional supervising physician) |

---

## 9. Confidence Handling for Partial Marker Sets

The pre-scan check-in (Section 8) operates first; confidence handling operates only after "Good to scan" or "Scan with caveat" status is confirmed. The two systems together form a comprehensive scan validity envelope: scans must be both biologically valid (passed pre-scan check-in for the blood draw context) and methodologically valid (sufficient marker count and domain coverage).

### 9.1 Minimum Marker Thresholds

GLIS produces a composite score only when minimum marker thresholds are met for each tier:

| Tier | Total markers | Minimum for composite |
|---|---|---|
| Screen | 3 | 3 (all required) |
| Core | 5 | 4 of 5 |
| Plus | 8 | 6 of 8 |
| Complete | 12 | 9 of 12 |

The 75% threshold for Plus and Complete is a design choice based on operational reality and methodology rigor; empirical validation is part of the v1.5 study (Section 15).

Below threshold, no composite score is computed; patient sees individual markers with "Complete your panel for a GLIS score" prompt.

### 9.2 Domain-Coverage Rule

Each domain the tier covers must have at least one marker present. A Plus panel missing all three organ-function markers does not produce a Plus score even if count threshold is met — because organ-function inflammatory burden cannot be assessed.

### 9.3 Tier-Downgrade Rule

When a panel falls short of enrolled tier but meets minimum for a lower tier, GLIS automatically computes the lower-tier score with prominent notification:

> *"We computed your Core score because your panel was missing 3 Plus markers (ferritin, TyG components, uric acid). Complete those markers at your next scan to upgrade to Plus."*

The downgrade is automatic, logged in audit trail.

### 9.4 Doctor Portal Warning (when applicable)

For patients with a supervising physician, the doctor portal displays an explicit warning panel for partial-marker scores listing missing markers and tier-downgrade status, visually prominent without click-through requirement.

### 9.5 Severe-Abnormal Floor Rule Interaction

The severe-abnormal floor rule operates on context-validated scans regardless of marker count. A "Reschedule recommended" scan does not trigger the severe-abnormal floor because the underlying condition at draw time explains the elevation.

---

## 10. Score-Band Labels and Patient Communication

### 10.1 The Four Bands

| Score | Patient-Facing | Tagalog | Clinical Label |
|---|---|---|---|
| 0–25 | **Optimal** | *Mabuti* | Low inflammation |
| 26–50 | **Good** | *Maayos* | Moderate inflammation |
| 51–75 | **Pay Attention** | *Pansinin* | High inflammation |
| 76–100 | **Take Action** | *Kumilos Na* | Critical inflammation |

### 10.2 Patient-Facing Supporting Copy

**Optimal:** *"Your body is in great shape. Inflammation is low — keep doing what you're doing."*

**Good:** *"Your body is doing well. Inflammation is manageable. Small lifestyle adjustments can move you toward optimal."*

**Pay Attention:** *"Your body is signaling that inflammation is building. Now is a good time to start the protocol and make supportive lifestyle changes."*

**Take Action:** *"Your body needs support — inflammation is high. We strongly recommend talking to a doctor about evaluation, and starting the protocol to begin recovery."*

### 10.3 Why Body-State Framing

The labels describe the body's current state, not predicted future disease. *"Your body is signaling"* rather than *"You are at risk of diabetes."* This framing keeps GLIS in the wellness-screening regulatory lane (where Oura, WHOOP, and Apple Health operate) rather than crossing into medical device classification through risk-prediction language.

### 10.4 Doctor Portal Dual Vocabulary

When patients have an optional supervising physician, the doctor portal displays both vocabularies side by side: *Optimal / Mabuti / Low inflammation* through *Take Action / Kumilos Na / Critical inflammation*. This ensures physicians and patients share language for shared decision-making while physicians retain clinical-register language for chart documentation.

---

## 11. Clinical Action Pathway

### 11.1 By Score Band

**Optimal (0–25 / Mabuti / Low inflammation):** Reinforce current lifestyle. Re-screen at 6–12 months. No additional workup based on GLIS alone.

**Good (26–50 / Maayos / Moderate inflammation):** Lifestyle counseling and protocol enrollment as appropriate. Address specific markers with domain-appropriate workup. Re-assess at protocol mid-point.

**Pay Attention (51–75 / Pansinin / High inflammation):** Full lifestyle review and protocol enrollment recommended. Investigate specific markers in the high range. Consider tier upgrade for pathway differentiation.

**Take Action (76–100 / Kumilos Na / Critical inflammation):** **Patients are strongly recommended to consult a doctor before protocol enrollment.** If accompanied by severe-abnormal floor trigger, mandatory referral per Section 11.4.

### 11.2 "Reschedule Recommended" Patient Guidance

When a scan receives the "Reschedule recommended" recommendation:
- **Get a new blood draw when condition resolves** per Section 8.5 timeframes (note: it's the blood draw that needs to be repeated, not just the upload)
- **Use individual marker readings for your own reference and discussion with your doctor**
- **Do not enroll in protocol based on deferred scan alone**
- **Document the deferral in your records** — recurrent defers signal a different clinical picture worth discussing with a physician

### 11.3 Tier-Upgrade Clinical Indications

**Core → Plus indications:**
- Suspected metabolic syndrome workup (HbA1c 5.8–6.4 + central obesity or family history)
- NAFLD signal requiring nutritional context (ALT 30+ U/L + elevated GLIS)
- Persistent elevated GLIS without clear single-marker driver
- Mid-protocol non-response (12+ weeks without expected GLIS improvement)

**Plus → Complete indications:**
- Suspected stress-driven inflammaging (persistent GLIS elevation + chronic stress, sleep disruption, HPA-related complaints)
- Vascular-inflammation differentiation (elevated GLIS + family history of premature CV disease)
- Direct insulin resistance assessment (HbA1c 5.7–6.4 + TyG borderline + clinical metabolic syndrome features)
- Persistent unexplained GLIS in low-risk demographic (young patient with persistent elevated GLIS unexplained by metabolic, organ-function, or vascular markers)
- Clinical-grade documentation requirements

### 11.4 Critical Findings — Mandatory Patient Notification

These findings are clinically significant and should prompt the patient to consult a doctor regardless of whether they have a GutGuard supervising physician.

| Finding | Recommended consultation |
|---|---|
| HbA1c ≥6.5% | Endocrinologist or PCP |
| hs-CRP >10 mg/L (no acute cause confirmed via check-in) | Internal Medicine or PCP |
| NLR >5.0 | Internal Medicine, Hematologist, or PCP |
| eGFR <30 mL/min/1.73m² | Nephrologist |
| ALT >100 U/L | Gastroenterologist or Hepatologist |
| Albumin <3.0 g/dL | Internal Medicine |
| Homocysteine >30 μmol/L | Internal Medicine or Cardiologist |
| Fasting Insulin >25 μU/mL or HOMA-IR >5.0 | Endocrinologist |
| Cortisol AM <3 or >25 μg/dL | Endocrinologist |
| Anemia, leukocytosis, thrombocytopenia | Appropriate specialist |

**Patient-primary notification (no supervising physician).** When a critical finding is detected and the patient does not have a GutGuard supervising physician, the system displays a prominent "Critical finding — consultation recommended" notification with:

- The specific finding and value
- The recommended type of doctor to consult
- A brief explanation of why it's clinically significant
- A required acknowledgment checkbox before the patient can proceed: *"I understand this finding is clinically significant and I will discuss it with a qualified doctor. I will not rely solely on the GutGuard system for medical evaluation of this finding."*

The acknowledgment is logged in the audit trail. The patient can still proceed with the protocol if they want, but the acknowledgment ensures they were explicitly informed and accepted responsibility for following up.

**With optional GutGuard supervising physician.** When the patient has a supervising physician, critical findings are flagged in the doctor portal for physician acknowledgment within 24 hours, in parallel with patient notification. Both pathways operate; the physician acknowledgment supplements rather than replaces patient acknowledgment.

### 11.5 Minimum Repeat Scan Interval

For protocol-decision purposes (tier assignment, tier escalation, intensity adjustments), a minimum interval of **6-8 weeks** between GLIS scans is recommended. This reflects the kinetics of the underlying biology — CRP responds to interventions over weeks; HbA1c reflects 3-month glycemic average; metabolic shifts manifest over similar timeframes. Scans closer together than this don't reliably distinguish biological change from measurement variability.

For trajectory tracking outside of protocol decisions, patients can scan more frequently with awareness that closely-spaced scans may show variability that reflects normal fluctuation rather than protocol response.

The system displays a soft notification for repeat scans within 6 weeks: *"This scan is sooner than the recommended 6-8 week interval for tracking protocol response. Your score may show variability that reflects normal day-to-day fluctuation rather than meaningful change. We've recorded this scan in your trajectory."*

This is informational; it does not block scoring.

---

## 12. Optional Supervising Physician Role

GLIS is a patient-primary wellness tool. Patients can use it independently without any GutGuard physician involvement. Supervising physician participation is **opt-in** for both patient and physician, providing an enhanced clinical-grade experience for those who want it.

### 12.1 Patient Pathways

**Pathway A — Independent use (no GutGuard supervising physician).** Patient uses GLIS independently. Their existing PCP or any doctor of their choice handles clinical follow-up outside the GutGuard system. This is the default and most common pathway.

**Pathway B — Use with offline doctor.** Patient uses GLIS independently in the GutGuard system but shares results with their existing doctor outside the system. Their doctor reviews the GLIS report (downloadable PDF including check-in responses, markers, and band-label interpretation) and makes their own clinical recommendations. GutGuard provides no infrastructure beyond the report.

**Pathway C — Use with optional GutGuard supervising physician.** Patient opts in to a GutGuard-matched supervising physician who reviews flagged findings, provides override decisions on deferred scans where clinically appropriate, and offers initial referral guidance. The physician's involvement is scoped to GLIS and the GutGuard protocol, not the patient's broader healthcare.

### 12.2 If You Choose to Participate as a Supervising Physician

The following describes the scope and protections for physicians who opt in to the GutGuard supervising physician role. Participation is voluntary; you can decline cases, set caseload limits, or withdraw from the role with notice.

**Your Responsibilities (when you have accepted a case):**

- Reviewing flagged GLIS results in the doctor portal
- Acknowledging within 24 hours (mandatory critical findings) or 72 hours (non-urgent flags) — see Section 12.4 for off-hours handling
- Reviewing pre-scan check-in responses with their temporal context to the blood draw date
- Making override decisions on "Reschedule recommended" scans with documented clinical justification when clinically appropriate
- Approving or deferring protocol enrollment based on full context
- Providing initial referral guidance for flagged findings — patient is responsible for following through

**Your Boundaries (always):**

- You are not the patient's primary care physician
- You are not responsible for long-term follow-up of incidental findings beyond the initial referral
- You are not responsible for treatment of conditions outside the GutGuard protocol scope
- You are not responsible for care coordination with the patient's other healthcare providers
- You are not responsible for findings that the patient does not act on after you have flagged them

**Patient Acknowledgment of Optional Supervisory Scope.** When a patient opts in to having a supervising physician, they explicitly acknowledge that the supervising physician's role is limited to GLIS-related findings and GutGuard protocol decisions, not to comprehensive primary care. This acknowledgment is part of the GutGuard consent flow and is logged in the audit trail.

### 12.3 Override Decision Documentation

When you override a "Reschedule recommended" outcome, the override and your justification are permanently associated with the scan in the audit trail. The annotation includes the blood draw date and time, the patient's reported condition at draw time, and your clinical reasoning. This protects your medico-legal position by making your decision and reasoning explicitly part of the record.

The system does not permit silent overrides. Every override requires text justification (free-text, no minimum length but expected to be substantive) and is visible in the audit trail with timestamp, your identity, and license number.

### 12.4 Off-Hours Coverage

The 24-hour acknowledgment window for mandatory critical findings refers to **business-day hours** (Monday-Friday, 8 AM - 6 PM PHT). Critical findings flagged outside business hours have their acknowledgment clock starting at the next business-day morning. Weekends and Philippine public holidays do not count toward the 24-hour window.

For patients with critical findings flagged on weekends or holidays, the system displays the critical finding notification immediately to the patient (with the acknowledgment checkbox per Section 11.4) regardless of physician acknowledgment timing. The patient is empowered to seek consultation through emergency or urgent care channels if their finding warrants it; the supervising physician's review then occurs at the next business-day window.

This separation ensures that:
- Critical findings reach patients immediately
- Patients are not gated by physician availability
- Supervising physicians have predictable working hours
- The system's reliability does not depend on 24/7 physician coverage

If a supervising physician wishes to provide off-hours coverage voluntarily, they can do so; this is between them and the patient. The system does not require it.

### 12.5 Caseload Considerations

Supervising physicians can set their own caseload limits based on their available time. The platform will not automatically assign more cases than a physician has accepted. Physicians can withdraw from active supervision with a defined notice period (typically 30 days) during which their cases are reassigned to another supervising physician or transitioned to Pathway A (independent use) with patient consent.

IG International / GutGuard does not pressure physicians to accept cases beyond their stated availability. Physician participation is a service to patients, not a quota to fill.

### 12.6 Medico-Legal Boundaries

Your responsibility as a supervising physician is limited to:
- Findings flagged by the system that you have reviewed
- Recommendations you have explicitly endorsed
- Override decisions you have made with documented justification
- The scope of the GutGuard protocol consultation as defined in patient consent

Findings outside this scope remain the patient's responsibility (their PCP, specialists they're already seeing, or doctors they consult independently). Pre-scan deferred scans that you have not overridden remain the patient's responsibility to address with their own healthcare providers.

The GutGuard consent flow makes these boundaries explicit to the patient at enrollment, providing legal clarity for both parties.

### 12.7 Audit Trail

The system logs every BioScan upload, OCR session, user confirmation, blood draw date and time confirmation, chronic context disclosures, pre-scan check-in responses (original and any revisions, with temporal anchor preserved), system recommendation issued, your override decisions and justifications (when applicable), patient critical-finding acknowledgments, resulting GLIS score (or deferred status), band label assigned, confidence indicator state, tier-downgrade events, your warning views (when applicable), and any protocol tier approvals. Logs retained minimum 5 years per medical records standards.

The audit trail protects both the patient (clear record of what they were told and acknowledged) and the supervising physician (clear record of what was flagged, when reviewed, what was decided).

---

## 13. Patient Disclaimer and Acknowledgment

This section documents what the patient explicitly acknowledges before using GLIS. The acknowledgment is presented in the GutGuard onboarding flow, captured in the audit trail, and reaffirmed annually. It is reproduced here so physicians can see what their patients (or potential patients) have agreed to.

### 13.1 Patient Acknowledgment

Patients confirm understanding and acceptance of the following before using GLIS:

**About what GLIS is and isn't:**

> *"I understand that GLIS (Gut-Lifestyle Inflammation Score) is a wellness screening tool, not a medical diagnostic tool. GLIS provides a composite score reflecting one specific type of inflammation (chronic low-grade systemic inflammation, also called inflammaging) — not a diagnosis of any disease. GLIS does not detect or diagnose acute infection, autoimmune disease, organ-specific inflammation, allergic conditions, neuroinflammation, cancer, or any other clinical pathology. If I have symptoms that concern me, I will consult a qualified doctor — GLIS is not a substitute for medical care."*

**About my responsibility:**

> *"I understand that I am responsible for my own healthcare follow-up. If GLIS flags a critical finding, I will consult a qualified doctor about it. If I have an existing primary care physician or specialists, I am responsible for sharing my GLIS results with them as I see fit. IG International / GutGuard is not my primary care provider."*

**About the optional supervising physician:**

> *"I understand that having a GutGuard supervising physician is optional. If I opt in, the supervising physician's role is limited to reviewing GLIS findings and providing initial referral guidance — they are not my primary care physician and are not responsible for long-term follow-up. If I opt out, I am responsible for all clinical follow-up through my own healthcare providers."*

**About commercial relationship:**

> *"I understand that GLIS is owned and operated by IG International / GutGuard, the company that markets the Pre→Pro→Postbiotic + MBS supplement protocol. GLIS is used to assess and track outcomes of this protocol. I have been informed of this commercial relationship and have considered it in my decision to use GLIS."*

**About data and privacy:**

> *"I understand that my GLIS data (lab values, scores, check-in responses) is stored in the GutGuard system per the Privacy Policy. My data may be used in anonymized form for research and methodology improvement, including the v1.5 validation study. I can request access, correction, or deletion of my data at any time, subject to medical records retention requirements."*

**About scientific status:**

> *"I understand that GLIS has not yet undergone independent peer-reviewed validation. The score is based on peer-reviewed inflammaging literature, but the specific composite has not been independently validated. A validation study is on the GutGuard roadmap. Until validation completes, I should interpret GLIS scores as indicative but not definitive."*

**About age:**

> *"I confirm that I am 18 years of age or older. GLIS is not designed or validated for use by minors."*

### 13.2 Critical Finding Acknowledgments (Per-Event)

In addition to the onboarding acknowledgment, patients acknowledge each critical finding individually as it arises (Section 11.4). The per-event acknowledgment confirms:

> *"I understand this finding is clinically significant and I will discuss it with a qualified doctor. I will not rely solely on the GutGuard system for medical evaluation of this finding. I have been told what type of doctor to consult and why."*

The acknowledgment is logged with the timestamp, the specific finding, and the patient's response (acknowledged / declined to acknowledge). Patients who decline the acknowledgment cannot proceed with the protocol until they have either acknowledged or escalated to a GutGuard supervising physician (if available) for direct review.

### 13.3 Withdrawal of Consent

Patients can withdraw consent and discontinue use of GLIS at any time. Withdrawal triggers:
- Stop of new scoring (no further GLIS scans computed)
- Optional data deletion request (per Privacy Policy)
- Trajectory and historical scores remain accessible to the patient for download
- The supervising physician (if any) is notified of the withdrawal

Withdrawal is final but does not prevent the patient from re-enrolling later if they choose.

---

## 14. Clinical Case Scenarios

These scenarios illustrate GLIS in practice across both patient pathways. Cases 1-4 show independent patient use; Cases 5-7 show optional supervising physician involvement; Case 8 shows time-of-draw handling for the Complete tier.

### Case 1 — Standard appropriate use (independent)

**Patient:** 42-year-old female, Pathway A (independent use). Blood drawn October 10 at 7:30 AM, fasted overnight, slept 7 hours. Uploads results October 14.

**Pre-scan check-in:** All temporal questions about her state on or around October 10 answered "No." Fasting confirmed. Sleep adequate. System: ✓ **Good to scan**.

**Markers:** hs-CRP 2.8, NLR 2.4, HbA1c 5.9%, ALT 28, eGFR 88.

**GLIS Core score:** 58 (Pay Attention / *Pansinin*).

**Patient sees:** *"Your body is signaling that inflammation is building. Now is a good time to start the protocol and make supportive lifestyle changes."*

**Patient action:** She decides to enroll in the protocol and to discuss her HbA1c trending toward prediabetic with her PCP at her next visit. She takes the GLIS report (PDF download) to her PCP appointment. Her PCP reviews and recommends standard lifestyle changes, agrees the supplement protocol won't conflict with her care.

**Why this works:** The patient uses GLIS as a screening and tracking tool. Her PCP remains her medical home. GutGuard provides the score and the protocol; clinical care continues outside the system.

### Case 2 — "Reschedule recommended" (acute infection, independent use)

**Patient:** 35-year-old male, Pathway A. Blood drawn October 8 at 8:00 AM during the tail end of a flu episode. Uploads October 18.

**Pre-scan check-in:** Date confirmed as October 8. Question 1 answered "Yes" — flu starting around October 1, still mildly symptomatic on October 8.

**System response:** ✕ **Reschedule recommended** — *"Your body was experiencing a recent infection when your blood was drawn on October 8 at 8:00 AM..."*

**Patient sees:** Individual markers (hs-CRP 5.2, NLR 3.8, HbA1c 5.4%, ALT 22, eGFR 95). No composite score. Recommendation to schedule a new blood draw 2 weeks after symptom resolution.

**Patient action:** Schedules new blood draw for late October. Doesn't pursue further action on the deferred markers.

**Why this works:** No supervising physician needed. The patient understands the deferral, the system provides clear next steps, and the patient handles their own scheduling.

### Case 3 — Critical finding, independent use (Patient Acknowledgment Required)

**Patient:** 51-year-old female, Pathway A. Blood drawn November 5 at 7:00 AM, fasted, asymptomatic. All check-in responses "No." System: ✓ **Good to scan**.

**Markers:** hs-CRP 11.5, NLR 3.2, HbA1c 5.8%, ALT 24, eGFR 86.

**System action:** Severe-abnormal floor triggered (hs-CRP >10). Score: Take Action / *Kumilos Na*. Critical finding notification:

> ⚠ **Critical Finding — Consultation Recommended**
>
> *Your hs-CRP is 11.5 mg/L, which is above the threshold (10 mg/L) where we recommend medical evaluation. Elevated CRP at this level in someone without acute infection or injury can indicate occult infection, autoimmune disease, or other conditions that need clinical workup.*
>
> *We recommend consulting an Internal Medicine doctor or your PCP about this finding before continuing with the protocol.*
>
> *To proceed, please acknowledge:*
> *☐ I understand this finding is clinically significant and I will discuss it with a qualified doctor. I will not rely solely on the GutGuard system for medical evaluation of this finding.*

**Patient action:** Acknowledges the finding (logged with timestamp). Schedules an appointment with her PCP. Defers protocol enrollment until after consultation. The PCP orders additional workup (full autoimmune panel, infection screen) and identifies an early Sjögren's syndrome that hadn't been clinically apparent. The patient's PCP becomes her primary clinician for that condition; she may or may not return to the GutGuard protocol depending on her clinical course.

**Why this works:** The patient pathway is fully self-directed. The critical finding triggers prominent notification with clear next-step guidance. The acknowledgment establishes patient understanding for both the patient's protection and the system's protection. The PCP's workup catches a condition that GLIS couldn't have detected — exactly the kind of finding that demands clinical workflow, not protocol intervention.

### Case 4 — "Scan with caveat" (multiple lifestyle factors, independent use)

**Patient:** 38-year-old male marathon runner, Pathway A. Blood drawn October 22 at 9:00 AM, fasted overnight (10 hours), slept poorly the night before (5 hours, anxious about race), did 30km training run 30 hours before draw. Uploads October 24.

**Pre-scan check-in:** Date confirmed as October 22. Question 8: strenuous exercise within 48 hours — Yes. Question 10 (sleep): poor sleep night before — Yes. Question 11 (fasting): Yes.

**System response:** ⚠ **Scan with caveat** — *"You can scan now, but a few things may have affected the markers in your blood when it was drawn on October 22:*
> *• You did strenuous exercise in the 48 hours before the draw — this temporarily elevates ALT and CRP.*
> *• You slept poorly the night before the draw — this temporarily elevates cortisol and inflammatory markers.*
> *Your score will be computed and shown with these notes for context."*

**Patient sees:** Score 52 (Pay Attention / *Pansinin*) with both caveat notes.

**Markers:** hs-CRP 3.4, NLR 2.8, HbA1c 5.3%, ALT 35, eGFR 92.

**Patient action:** Reads the caveats. Recognizes that the elevated CRP and ALT likely reflect post-exercise and sleep-disruption inflammation, not baseline inflammaging. Plans to scan again on a non-training week with adequate sleep for a cleaner baseline. Discusses with his coach to time blood draws strategically.

**Why this works:** The patient sees both confounders explicitly and understands how they affect interpretation. They self-direct the appropriate next action (timing of next scan).

### Case 5 — Physician override appropriate (with optional supervising physician)

**Patient:** 58-year-old male with Crohn's disease in stable remission for 18 months. Pathway C (with supervising physician — you are the supervising physician). Blood drawn September 20 at 7:30 AM, fasted, well-rested.

**Pre-scan check-in:** Question 3 answered "Yes" — patient interpreted "being treated for autoimmune condition" literally because he's on infliximab.

**System response:** ✕ **Reschedule recommended** based on autoimmune flare reported.

**Your portal view:** You see the deferred scan and the patient's check-in response. You know this patient personally — calprotectin <50 at June 2026 check, no inflammatory symptoms in office visits before or after September 20.

**Override action:** Mandatory justification: *"Patient is in 18-month sustained Crohn's remission on infliximab; calprotectin <50 at June 2026 check; no inflammatory symptoms documented in office visits in the weeks before or after September 20 blood draw. Patient interpreted the autoimmune question literally because he is on biologic therapy, but no flare was actually occurring at draw time. GLIS computation appropriate."*

**System computes:** GLIS Plus score 38 (Good / *Maayos*). Score annotated as physician override. Trajectory shows scan with override icon at September 20.

**Patient action:** You communicate the score to the patient with body-state framing. Educate him on how to answer Question 3 in future check-ins (it asks about active flaring, not whether he has the condition).

**Why this works:** The temporal anchor allows precise override based on documented clinical observations. The audit trail captures the date-specific reasoning. Without supervising physician access, this patient's deferred scan would have remained deferred — he could have shared the report with his rheumatologist for separate review, but the GutGuard system itself would not have computed the score.

### Case 6 — Inappropriate use scenario (you are advising your own patient)

**Patient:** 45-year-old female (your private practice patient, not a GutGuard patient yet). She has persistent fatigue, joint pain, morning stiffness, recurrent low-grade fevers over 6 months. Asks you about the GutGuard supplement protocol and GLIS.

**Your assessment:** Her clinical picture suggests possible autoimmune disease requiring rheumatology workup — RF, anti-CCP, ANA, ESR, complement levels. Even if she enrolled in GLIS and her check-in showed no acute conditions on the day of her future blood draw, GLIS would be the wrong tool for her clinical picture.

**What you tell her:** *"GLIS measures one specific kind of inflammation — the slow, low-grade kind associated with metabolic stress and aging. What you're describing — joint pain, morning stiffness, recurrent fevers — sounds like a different kind of inflammation that needs proper workup with a rheumatologist. Let's get that done first. If they confirm it's not autoimmune, GLIS could be useful afterwards as a screening and tracking tool for the metabolic-inflammatory side."*

**Why this matters:** As a physician (not necessarily a GutGuard supervising physician), you serve as an operational filter for patients whose presentations fall outside GLIS's appropriate use. The framework's exclusion zone is documentary; you provide the clinical filter.

### Case 7 — Confidence handling — partial Plus panel (independent use)

**Patient:** 49-year-old male, Pathway A. Plus tier enrollment. Blood drawn September 12 at 8:00 AM, fasted, well-rested. Lab panel includes Core markers plus ferritin (6 of 8 Plus markers — missing TyG components and uric acid).

**Pre-scan check-in:** All "No." System: ✓ **Good to scan**.

**System action:** Plus minimum threshold met (6/8). Score computed at Plus tier with confidence indicator showing "6 of 8 markers."

**Plus score:** 42 (Good / *Maayos*).

**Patient sees:** *"Your body is doing well based on the 6 markers in your panel from the September 12 draw. Inflammation is manageable. For a fuller picture, complete the remaining 2 markers (TyG components, uric acid) at your next blood draw."*

**Patient action:** Adds TyG components and uric acid to his order at next blood draw for trajectory continuity at full Plus confidence.

### Case 8 — Critical finding with non-AM cortisol (Complete tier, independent use)

**Patient:** 56-year-old female, Pathway A. Complete tier scan. Blood drawn at 2:15 PM (not morning), fasted, well-rested.

**Pre-scan check-in:** No relevant conditions on October 30. The system flags the non-AM draw time for cortisol-specific caveat: ⚠ **Scan with caveat** — *"Your blood was drawn at 2:15 PM, not in the morning. Cortisol naturally drops throughout the day, so your AM cortisol reading cannot be interpreted against the standard reference range. Your score will exclude cortisol from the neuroendocrine domain calculation; if you'd like a complete neuroendocrine assessment, schedule a future blood draw between 6-9 AM."*

**Markers (relevant):** Cortisol "AM" 7.2 μg/dL (drawn at 2:15 PM, well within normal afternoon range but cannot be interpreted as morning cortisol).

**System action:** Computes Complete tier score with cortisol excluded from neuroendocrine domain (DHEA-S only). Confidence indicator shows "11 of 12 markers — cortisol excluded due to non-AM draw timing."

**Patient action:** Decides to schedule a future morning draw to complete the neuroendocrine domain.

**Why this works:** Time-of-draw matters specifically for cortisol. The system handles it gracefully — providing a useful score with appropriate caveats rather than refusing to compute or producing a misleading interpretation.

---

## 15. Validation Roadmap and Evidence Status

GLIS itself has not undergone independent peer-reviewed validation. Internal performance estimates throughout this document are presented as estimates pending formal validation. This section specifies how validation will be earned.

### 15.1 v1.5 Validation Study Specification

**Study design:** Cross-sectional comparison of GLIS Core (5 markers) and GLIS Complete (12 markers) on the same patient blood samples, with concurrent measurement of established inflammaging reference markers (PhenoAge components where feasible). All enrolled scans must have received "Good to scan" or "Scan with caveat" recommendations based on pre-scan check-in anchored to blood draw date; "Reschedule recommended" scans excluded from primary analysis.

**Target enrollment:** n ≥ 150 Filipino adults (target 200 to allow for attrition and subgroup analysis), ages 25–65, recruited through GutGuard protocol enrollment and partnered Philippine clinical sites.

**Primary outcomes:**
- Cross-tier score equivalence — correlation Core to Complete (target r > 0.75)
- Sensitivity and specificity of Core vs. Complete for detecting inflammaging vs. PhenoAge-equivalent reference
- Internal consistency of the 100-point weighting scheme
- Empirical validation of the 75% minimum-threshold design choice
- Effect of pre-scan check-in (anchored to blood draw date) on cohort composition and score validity

**Secondary outcomes:**
- Coverage descriptors validated against measured sensitivity
- Systematic score shifts at tier upgrade
- Philippine-population baseline distribution per marker
- "Scan with caveat" condition impact on score interpretation
- Pre-scan check-in patient acceptance and response patterns
- Concordance between patient-reported check-in responses and clinical record review of conditions at blood draw date

**Timeline:**
- Protocol drafting: Q3 2026 (Dr. Animas as co-investigator pending confirmation)
- IRB submission: Q3 2026
- Enrollment: Q4 2026 – Q1 2027
- Analysis: Q2 2027
- Target publication: Philippine Journal of Internal Medicine; preprint deposit on medRxiv

### 15.2 What This Means for Practice

Until validation completes:
- Use GLIS as one component of clinical assessment, not as a standalone decision tool
- Communicate to patients that GLIS is a screening tool with validation pending
- Document your clinical reasoning when GLIS findings inform protocol decisions
- Report cases where GLIS results conflicted with clinical assessment

After validation completes, performance claims will be replaced with empirical findings.

---

## 16. Anticipated Objections and Responses

### 16.1 "This is a wellness-app score dressed up as clinical methodology."

The framework operationally enforces methodology rigor through three mechanisms: (1) the exclusion zone is documentary AND operational — the patient-facing pre-scan check-in (anchored to blood draw date and time) prevents measurement of excluded phenomena, and the patient sees the gate operating in real-time; (2) markers are selected from peer-reviewed inflammaging literature with documented citations; (3) confidence handling refuses to compute scores from inadequate data. Most wellness apps fail all three tests.

### 16.2 "There's no published validation of this composite."

Acknowledged and stated transparently throughout. v1.5 validation study specified with timeline, enrollment, outcomes, and publication venue. Until validation completes, performance claims are presented as design-choice estimates.

### 16.3 "Why use a composite score instead of individual marker interpretation?"

GLIS targets a specific phenomenon (inflammaging) characterized by mild elevations across multiple markers. Composite scoring captures the multi-marker pattern. Individual markers remain visible in the marker breakdown — the composite supplements rather than replaces them. Critical individual findings still trigger mandatory referrals.

### 16.4 "How is HbA1c 35 of 100 points justified?"

HbA1c's weight reflects its role as the dominant upstream metabolic driver of inflammaging in the Filipino target population. Empirical validation of the weighting scheme is included in v1.5 study primary outcomes. Current weighting is documented as a design choice.

### 16.5 "What if a patient lies on the pre-scan check-in?"

Honest reporting produces the same product-feature access as no-condition reporting. Patients can edit answers before submission. The audit trail logs both original and revised answers with flagging if revisions moved toward less restrictive outcomes. The temporal anchor (blood draw date) makes lying harder to maintain — patients must commit to specific date claims that can be cross-checked against clinical records if relevant.

### 16.6 "Why is this not a medical device requiring FDA Philippines registration?"

GLIS is positioned as a non-diagnostic wellness screening and protocol-tracking tool. It does not issue diagnostic conclusions, direct clinical treatment, or substitute for clinical evaluation. Operational enforcement through pre-scan check-in and confidence handling prevents the system from issuing scores that would constitute clinical risk stratification.

### 16.7 "Why are IL-6 and TNF-α not included?"

Not routinely available at Philippine clinical laboratories. The current Complete tier substitutes homocysteine and fasting insulin/HOMA-IR. IL-6 and TNF-α reserved for a future GLIS Research tier launching when PH reference-laboratory partnership makes routine availability feasible.

### 16.8 "Should I worry about being held responsible for patient outcomes if I'm a supervising physician?"

Your responsibility is limited to findings flagged by the system that you have reviewed, recommendations you have explicitly endorsed, and override decisions you have made with documented justification. The audit trail logs your review timestamps, decisions, and justifications. Findings outside the GutGuard protocol consultation scope remain the patient's responsibility (their PCP, specialists they're seeing). Patients without a GutGuard supervising physician are entirely self-directed for clinical follow-up. The supervising physician role is opt-in — you can decline cases or withdraw with notice.

### 16.9 "What if my patient uses GLIS and gets misled by their score?"

The patient acknowledgment (Section 13) establishes that GLIS is a screening tool, not a diagnostic. Per-event acknowledgments for critical findings ensure patients are explicitly informed when something needs medical follow-up. The patient-facing supporting copy uses body-state framing rather than disease-prediction language. If a patient persistently misuses GLIS or relies on it inappropriately despite acknowledgments, that's a patient-level issue that any wellness tool faces — the framework's job is to communicate clearly and document acknowledgment, which it does.

### 16.10 "Why should I sign on as a supervising physician given the commercial conflict of interest?"

Honestly: only if you've evaluated the methodology safeguards (Section 1) and find them adequate; only if you find the inflammaging target scientifically defensible (Sections 3–4); only if you're comfortable with the operational gating mechanisms (Sections 8–9, 11); only if the validation roadmap (Section 15) gives you reasonable confidence in the framework's evidence trajectory; and only if the optional, opt-in nature of the role with clearly defined boundaries (Section 12) provides adequate medico-legal protection. The framework is designed to be defensible to physicians who do this evaluation. Most importantly: you can also choose to evaluate GLIS without participating as a supervising physician — many physicians may simply review the framework, decide whether to recommend it (or not) to their own patients, and let their patients use it independently. That's a fully supported pathway.

---

## 17. References

**Foundational inflammaging literature:**

- Franceschi C, et al. *Annals NY Acad Sci* 2000.
- Franceschi C, Campisi J. *J Gerontol A* 2014.
- Furman D, et al. *Nature Medicine* 2019.

**hs-CRP:**

- Ridker PM, et al. *NEJM* 2000.
- Pearson TA, et al. *Circulation* 2003.

**NLR:**

- Zahorec R. *Bratisl Lek Listy* 2021.
- Fest J, et al. *Eur J Epidemiol* 2019.

**Biological age and PhenoAge:**

- Levine ME, et al. *Aging* 2018.
- Liu Z, et al. *PLoS Med* 2018.

**Gut-inflammation axis:**

- Cani PD, et al. *Diabetes* 2007.
- Thevaranjan N, et al. *Cell Host & Microbe* 2017.

**NAFLD and ALT:**

- Younossi ZM, et al. *Hepatology* 2016.
- Kwo PY, et al. *Am J Gastroenterol* 2017.

**Mitophagy and Urolithin-A:**

- Ryu D, et al. *Nature Medicine* 2016.
- Andreux PA, et al. *Nature Metabolism* 2019.

**Senescence and SASP:**

- Coppé JP, et al. *Annu Rev Pathol* 2010.
- Tchkonia T, et al. *J Clin Invest* 2013.

**eGFR and inflammation:**

- Stenvinkel P, et al. *Kidney Int* 1999.

**Plus and Complete tier markers:**

- Simental-Mendía LE, et al. *Metab Syndr Relat Disord* 2008 (TyG).
- Borghi C, et al. *J Hypertens* 2015 (uric acid).
- Refsum H, et al. *Annu Rev Med* 2006 (homocysteine).
- Matthews DR, et al. *Diabetologia* 1985 (HOMA-IR).
- Adam EK, et al. *Psychoneuroendocrinology* 2017 (cortisol).

**Acute inflammation confounders (pre-scan check-in):**

- Pepys MB, Hirschfield GM. *J Clin Invest* 2003.
- Margolis KL, et al. *Am J Epidemiol* 2005.

**Sleep and inflammation:**

- Irwin MR. "Sleep and Inflammation: Partners in Sickness and in Health." *Nature Reviews Immunology* 2019.

**Cortisol circadian rhythm:**

- Edwards S, Clow A, Evans P, Hucklebridge F. "Exploration of the awakening cortisol response in relation to diurnal cortisol secretory activity." *Life Sciences* 2001.

**Smoking and inflammation:**

- Wannamethee SG, et al. "Cigarette smoking and inflammation, hemostasis and circulating insulin-like growth factor I." *Atherosclerosis* 2005.

---

## 18. Document Control

| Field | Value |
|---|---|
| Document Title | GLIS Clinical Methodology v1.3 |
| Audience | Physicians evaluating GLIS for any of three purposes: (1) advising their own patients on whether to use it, (2) reviewing GLIS reports their patients bring to them, (3) optionally participating as a GutGuard supervising physician |
| Lead Authors | CSA (IG International / GutGuard) and Dr. Shane Animas, MD — pending co-authorship confirmation |
| Owner | IG International / GutGuard |
| Date | April 2026 |
| Status | Draft for clinical review and revision |
| Companion Documents | GLIS Inflammation Framework v1.4 (Master Methodology); GLIS Clinical Rationale v1.5; GLIS Clinical Reference Card (HTML, pending update) |

### Document Position

This document is the primary reference for clinical audiences evaluating GLIS. Where this document and other framework documents differ on substantive methodology, the Master Framework controls.

### Approval Sign-off

- [ ] Dr. Shane Animas, MD — Clinical methodology approval
- [ ] CSA, IG International / GutGuard — Strategic alignment with Master Framework
- [ ] Independent specialist reviewer — Optional but recommended

### Revision History

**v1.3 (April 2026)** — Major repositioning and methodology completeness updates:

1. **Deployment model clarified.** Patient-primary with optional supervising physician; three patient pathways (independent / offline doctor / optional GutGuard physician) explicitly supported.
2. **Pre-scan check-in expanded.** Three additional questions (sleep, fasting, draw time of day). Smoking and chronic context captured separately as one-time disclosures.
3. **Methodology completeness.** Pediatric exclusion stated. Minimum repeat scan interval (6-8 weeks). Critical finding patient acknowledgment workflow. Off-hours coverage policy. Audit trail expanded.
4. **New Section 13 (Patient Disclaimer and Acknowledgment)** — what patients explicitly acknowledge before using GLIS.
5. **Section 12 (Optional Supervising Physician Role)** — rewritten to reflect opt-in nature; medico-legal boundaries strengthened; off-hours and caseload provisions added.
6. **Case scenarios (Section 14)** — expanded to 8 cases covering both independent and supervising-physician pathways.
7. **References (Section 17)** — added sleep, cortisol circadian, and smoking-inflammation citations.
8. **Ownership corrected** — IG International / GutGuard throughout (replacing previous "GutGuard Protocol Inc." references).

Underlying methodology — markers, weights, tier architecture, three-tier classification logic, validation roadmap — is unchanged.

**v1.2 (April 2026)** — Pre-scan check-in temporal anchoring (blood draw date framing).

**v1.1 (April 2026)** — Pre-scan check-in UX as patient-facing gate.

**v1.0 (April 2026)** — Initial physician-focused methodology document.

### Next Scheduled Review

Six months from initial deployment, or upon: Master Framework version update; v1.5 validation study results; clinical feedback indicating documentation gaps; new peer-reviewed evidence; regulatory environment changes.

### Distribution

Intended for distribution to physicians (including those advising patients on GLIS, those reviewing GLIS reports patients bring to them, and those participating as optional GutGuard supervising physicians). Distribution outside the clinical audience requires IG International / GutGuard approval.

---

*End of GLIS Clinical Methodology document.*
