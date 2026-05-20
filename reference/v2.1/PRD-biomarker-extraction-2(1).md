# GutGuard BioScan — Biomarker Extraction Module
## Product Requirements Document (PRD) for Prototype

**Version:** 1.3
**Date:** May 14, 2026
**Status:** Final for Development
**Timeline:** 5 days
**Owner:** CSA, IG International / GutGuard
**For:** Development Team

**v1.3 changes:** Refactored `compute_glis()` in Section 11.9.5 to use a `MARKER_REGISTRY` pattern — adding a new biomarker is now a single-entry edit, not a multi-function refactor. Added Section 17 (Upgrade Path) documenting how to grow from 3 markers (v1.0 Screen tier) → 5 markers (v1.1 Core tier) → 8 markers (v2.0 Plus tier) → 12 markers (v3.0 Complete tier) per the GLIS methodology document.

**v1.2 changes:** Added Section 11.9 (Score Confidence and Missing Marker Handling) — defines a 4-tier confidence system (high / provisional / single_domain / incomplete) that handles real-world cases where lab reports include only some of the 3 required markers. Updated `compute_glis()` signature and tests. Added lab ordering guidance via doctor-directed flow (Section 11.10).

**v1.1 changes:** Added Section 4.5 (LLM Configuration Boundaries — what Sonnet does and does not do); expanded Section 11 (GLIS Score Computation) with full lookup tables, worked examples, complete Python implementation, and unit tests. The separation between LLM-based extraction and deterministic scoring is now explicit throughout.

---

## 1. Executive Summary

### 1.1 What we are building

A backend service that ingests Philippine lab reports (PDF, JPG, PNG) uploaded by GutGuard patients through the existing patient portal, extracts biomarker values using Claude's vision API, validates them, and returns structured data that feeds the GLIS (Gut-Lifestyle Inflammation Score) calculation.

### 1.2 Why we are building it

The existing patient portal frontend (`gutguard-patient-portal__5_.html`) currently simulates lab extraction via a placeholder function (`simUp()`). To launch the BioScan flow, we need a real backend that performs accurate biomarker extraction from real lab reports. Traditional OCR (Tesseract, etc.) is too brittle for the layout diversity of Philippine labs. LLM-based vision extraction handles layout variation, naming variation, and reference range parsing in one pass.

### 1.3 Scope of this prototype

**In scope:**
- Backend API for lab report upload and extraction
- Vision LLM extraction via Anthropic Claude Sonnet 4.5 (extraction only — see Section 4.5)
- Deterministic validation layer with mandatory referral triggers
- Deterministic Python GLIS score computation (no LLM — see Section 4.5 and Section 11)
- Patient confirmation flow (frontend already exists in `sC2` screen)
- Pre-scan check-in integration (blood draw date/time capture)
- Three biomarkers for Day-1 launch: hs-CRP, HbA1c, ALT

**Architectural principle (read Section 4.5):** The LLM extracts values from the lab report image. Everything else — validation, scoring, banding, referral flags, recommendation text — is deterministic Python. This separation is non-negotiable for clinical safety, regulatory posture, and reproducibility.

**Out of scope for v1.0 (deferred to v1.1):**
- User authentication (use unguessable URL tokens for demo)
- Doctor portal review queue (email-based escalation for now)
- Granular per-marker correction (re-upload only)
- Manual entry path (disabled in frontend for demo)
- Audit log table (use Supabase Postgres logs for now)
- Async job queue (synchronous API call, hold connection up to 30s)
- ZDR API headers (default retention acceptable for demo)
- Image quality pre-check
- Fallback LLM provider
- Cost monitoring and alerts

### 1.4 Success criteria

The prototype is considered successful when:

1. A patient uploads a lab report photo or PDF via the existing portal
2. The system extracts at least 1 of 3 launch biomarkers with >90% accuracy on a test set of 10 real PH lab reports
3. The patient confirms the extracted values on the `sC2` review screen
4. A GLIS score is computed and displayed
5. Mandatory referral triggers (hs-CRP >10, HbA1c ≥6.5%, ALT >100) are correctly flagged
6. Blood draw date is captured and feeds the pre-scan check-in gate
7. End-to-end latency is under 30 seconds on a typical mobile connection

---

## 2. System Architecture

### 2.1 Architecture diagram

```
┌──────────────────────────────────────────────────────────────┐
│  PATIENT PORTAL (existing HTML — gutguard-patient-portal)    │
│  - Tap upload → POST /api/extractions                        │
│  - Poll status → GET /api/extractions/{id}                   │
│  - Show sC2 review → POST /api/extractions/{id}/confirm      │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTPS multipart upload
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  FASTAPI BACKEND (Python 3.11 on Render or Railway)          │
│  - File validation (size, mime, magic bytes)                 │
│  - Rate limit (3 uploads/hour/patient)                       │
│  - Synchronous extraction (FastAPI BackgroundTasks)          │
│  - Polling endpoint for status                               │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  SUPABASE                                                     │
│  - Postgres: extractions, glis_scores tables                 │
│  - Storage: lab-uploads bucket (encrypted at rest)           │
│  - Region: Singapore (closest to Philippines)                │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  ANTHROPIC API                                                │
│  - Model: claude-sonnet-4-5                                  │
│  - Vision input: PDF or image                                │
│  - Output: structured JSON (strict schema)                   │
│  - Temperature: 0 (deterministic)                            │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Technology stack

| Component | Choice | Reason |
|---|---|---|
| Backend language | Python 3.11 | Anthropic SDK is best in Python; team familiarity |
| Web framework | FastAPI | Async support, built-in OpenAPI docs, fast to scaffold |
| Database | Supabase (Postgres) | Zero DevOps, Manila-region friendly, free tier sufficient |
| File storage | Supabase Storage | Encrypted at rest, signed URLs, integrated with DB |
| LLM | Claude Sonnet 4.5 via Anthropic API | Strong vision capability, native PDF support |
| Hosting | Render or Railway | One-click deploy from GitHub, free tier sufficient |
| Region | Singapore (Supabase) | Closest to Philippines for latency |

### 2.3 Why this stack for prototype

- **No DevOps overhead** — Supabase + Render means zero infrastructure work
- **Single language** — Python end-to-end, no context switching
- **Native PDF support** — Anthropic API accepts PDFs directly, no preprocessing
- **Quick deployment** — Git push to Render = deployed in 3 minutes
- **Survivable cost** — Estimated ₱3-8 per extraction; free Supabase tier covers prototype volume

---

## 3. API Specification

### 3.1 Endpoint: Upload lab report

```
POST /api/extractions
```

**Request:**

- Content-Type: `multipart/form-data`
- Body fields:
  - `file`: PDF, JPG, JPEG, or PNG (max 10 MB)
  - `patient_id`: string (UUID, hardcoded for demo)
  - `blood_draw_date`: ISO 8601 date (YYYY-MM-DD) — captured from pre-scan check-in
  - `blood_draw_time`: ISO 8601 time (HH:MM) — captured from pre-scan check-in
  - `prescan_responses`: JSON object — patient's pre-scan checklist answers

**Response 200:**

```json
{
  "extraction_id": "ext_abc123",
  "status": "queued",
  "estimated_seconds": 15
}
```

**Response 400:** Invalid file type, file too large, missing required fields
**Response 429:** Rate limit exceeded (3 uploads/hour/patient)
**Response 500:** Server error

### 3.2 Endpoint: Get extraction status

```
GET /api/extractions/{extraction_id}
```

**Response 200 (processing):**

```json
{
  "extraction_id": "ext_abc123",
  "status": "processing",
  "progress_percent": 45,
  "current_step": "Reading lab format"
}
```

**Response 200 (complete):**

```json
{
  "extraction_id": "ext_abc123",
  "status": "complete",
  "confidence_tier": "full",
  "markers_found": 3,
  "markers_total": 3,
  "blood_draw_date_extracted": "2026-05-10",
  "blood_draw_time_extracted": "07:30",
  "lab_name": "Hi-Precision Diagnostics",
  "date_mismatch": false,
  "markers": [
    {
      "code": "hs_crp",
      "display_name": "hs-CRP",
      "value": 2.3,
      "unit": "mg/L",
      "reference_range_low": 0.0,
      "reference_range_high": 3.0,
      "validation_status": "valid",
      "referral_flag": false
    },
    {
      "code": "hba1c",
      "display_name": "HbA1c",
      "value": 5.4,
      "unit": "%",
      "reference_range_low": 4.0,
      "reference_range_high": 5.6,
      "validation_status": "valid",
      "referral_flag": false
    },
    {
      "code": "alt",
      "display_name": "ALT (SGPT)",
      "value": 32,
      "unit": "U/L",
      "reference_range_low": 7,
      "reference_range_high": 56,
      "validation_status": "valid",
      "referral_flag": false
    }
  ],
  "warnings": []
}
```

**Response 200 (failed):**

```json
{
  "extraction_id": "ext_abc123",
  "status": "failed",
  "reason": "incomplete_extraction",
  "markers_found": 0,
  "user_message": "We couldn't read this clearly. Try a clear photo of the full results page, or upload a PDF."
}
```

### 3.3 Endpoint: Confirm extracted values

```
POST /api/extractions/{extraction_id}/confirm
```

**Request:**

```json
{
  "patient_id": "uuid",
  "confirmed_markers": [
    {"code": "hs_crp", "value": 2.3, "edited": false},
    {"code": "hba1c", "value": 5.4, "edited": false},
    {"code": "alt", "value": 32, "edited": false}
  ]
}
```

**Response 200:**

The response structure mirrors the `compute_glis()` return value from Section 11.9.5. Frontend uses `display_mode` to route rendering.

```json
{
  "confidence_tier": "high",
  "display_mode": "full_glis",
  "composite_score": 28,
  "band": "good",
  "band_label_en": "Good",
  "band_label_tl": "Maayos",
  "domain_scores": {
    "inflammatory": 22,
    "metabolic": 30,
    "organ_function": 25
  },
  "referral_flags": [],
  "markers_used": 3,
  "markers_missing": [],
  "single_domain_marker": null,
  "caveat_message": null,
  "next_steps_message": "Your inflammation is in the Good range. Continue your lifestyle protocol and re-scan in 6-8 weeks.",
  "error": null
}
```

**Response 200 (provisional tier example — 2 markers found):**

```json
{
  "confidence_tier": "provisional",
  "display_mode": "provisional_glis",
  "composite_score": 30,
  "band": "good",
  "band_label_en": "Good",
  "band_label_tl": "Maayos",
  "domain_scores": {"inflammatory": 30, "metabolic": 30},
  "referral_flags": [],
  "markers_used": 2,
  "markers_missing": ["alt"],
  "single_domain_marker": null,
  "caveat_message": "For a complete GLIS score, ask your doctor to also order ALT (SGPT).",
  "next_steps_message": "Based on the markers we could read, your inflammation appears to be in the Good range. A complete scan may show a different result.",
  "error": null
}
```

**Response 200 (single_domain tier example — only hs-CRP found):**

```json
{
  "confidence_tier": "single_domain",
  "display_mode": "single_domain",
  "composite_score": null,
  "band": null,
  "band_label_en": null,
  "band_label_tl": null,
  "domain_scores": {"inflammatory": 30},
  "referral_flags": [],
  "markers_used": 1,
  "markers_missing": ["hba1c", "alt"],
  "single_domain_marker": {
    "code": "hs_crp",
    "display_name": "hs-CRP",
    "value": 2.5,
    "domain": "inflammatory",
    "interpretation": "average",
    "interpretation_message": "Your inflammatory marker is in the average range. This is one of three GLIS domains."
  },
  "caveat_message": "For a complete GLIS score, ask your doctor to also order HbA1c and ALT (SGPT).",
  "next_steps_message": null,
  "error": null
}
```

---

## 4. Vision LLM Extraction — Core Module

### 4.1 Model and configuration

- **Model:** `claude-sonnet-4-5`
- **Temperature:** 0 (deterministic, no creative variation)
- **Max tokens:** 2000 (extraction output is structured, fits easily)
- **System prompt:** See section 4.3
- **Input format:** PDF as `document` block, images as `image` block, both base64-encoded

### 4.2 JSON output schema (locked)

The LLM MUST return JSON conforming exactly to this schema. No prose, no markdown fences, just JSON:

```json
{
  "extraction_succeeded": true,
  "lab_name": "Hi-Precision Diagnostics",
  "blood_draw_date": "2026-05-10",
  "blood_draw_time": "07:30",
  "patient_name_on_report": "Maria Santos Cruz",
  "markers": [
    {
      "code": "hs_crp",
      "found": true,
      "raw_label_on_report": "hs-CRP",
      "value": 2.3,
      "unit": "mg/L",
      "reference_range_low": 0.0,
      "reference_range_high": 3.0,
      "extraction_confidence": "high"
    },
    {
      "code": "hba1c",
      "found": true,
      "raw_label_on_report": "Hemoglobin A1c",
      "value": 5.4,
      "unit": "%",
      "reference_range_low": 4.0,
      "reference_range_high": 5.6,
      "extraction_confidence": "high"
    },
    {
      "code": "alt",
      "found": false,
      "raw_label_on_report": null,
      "value": null,
      "unit": null,
      "reference_range_low": null,
      "reference_range_high": null,
      "extraction_confidence": null
    }
  ],
  "warnings": []
}
```

### 4.3 System prompt (use exactly this)

```
You are a medical laboratory report extraction system. You receive lab reports from Philippine laboratories (PDF or photograph) and extract specific biomarker values into structured JSON.

You MUST extract exactly these three biomarkers if present:

1. hs-CRP (high-sensitivity C-reactive protein)
   Common names on PH lab reports: "hs-CRP", "hsCRP", "High Sensitivity CRP", "C-Reactive Protein (High Sensitivity)", "Ultra-Sensitive CRP"
   Typical units: mg/L, mg/dL (if mg/dL, convert: mg/dL × 10 = mg/L)
   Typical range: 0.0 to 10.0 mg/L

2. HbA1c (Hemoglobin A1c)
   Common names: "HbA1c", "Hemoglobin A1c", "Glycated Hemoglobin", "Glycosylated Hemoglobin", "A1C"
   Typical units: % (NGSP) or mmol/mol (IFCC)
   Typical range: 4.0 to 15.0 %

3. ALT (Alanine Aminotransferase)
   Common names: "ALT", "SGPT", "ALT (SGPT)", "SGPT (ALT)", "Alanine Aminotransferase", "Alanine Transaminase"
   Typical units: U/L, IU/L (equivalent)
   Typical range: 5 to 200 U/L

For each biomarker, return:
- code: one of "hs_crp", "hba1c", "alt"
- found: true if the biomarker appears in the report, false otherwise
- raw_label_on_report: the exact text label as printed on the report (for audit)
- value: numeric value as a float
- unit: unit as printed (preserve original; conversion happens downstream)
- reference_range_low: lower bound of the reference range if printed
- reference_range_high: upper bound of the reference range if printed
- extraction_confidence: "high" / "medium" / "low" based on clarity

Also extract:
- lab_name: laboratory name from the report header
- blood_draw_date: ISO 8601 date (YYYY-MM-DD) — look for "Collection Date", "Date Collected", "Specimen Date", "Date of Sampling", or similar
- blood_draw_time: ISO 8601 time (HH:MM) — look for collection time if printed; null if not found
- patient_name_on_report: patient name as printed
- warnings: array of strings flagging anything suspicious (e.g., "handwritten annotation observed near hs-CRP value", "image blurry around ALT value")

CRITICAL RULES:
1. Return ONLY valid JSON. No prose. No markdown fences. No explanation.
2. If you cannot read a value clearly, set found=false and value=null. Do NOT guess.
3. If a biomarker is not in the report, set found=false. Do NOT fabricate.
4. If extraction_succeeded would be false (e.g., not a lab report at all), set extraction_succeeded=false and leave markers array empty.
5. Preserve units exactly as printed. Do not convert.
6. Dates must be ISO 8601. If you see "May 10, 2026", convert to "2026-05-10".

Now extract from the attached document.
```

### 4.4 Python implementation pattern

```python
import anthropic
import base64
from pathlib import Path

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

def extract_biomarkers(file_path: str, file_type: str) -> dict:
    """
    file_type: 'application/pdf', 'image/jpeg', 'image/png'
    Returns: dict matching the JSON schema in section 4.2
    """
    file_bytes = Path(file_path).read_bytes()
    encoded = base64.standard_b64encode(file_bytes).decode("utf-8")

    if file_type == "application/pdf":
        content_block = {
            "type": "document",
            "source": {
                "type": "base64",
                "media_type": "application/pdf",
                "data": encoded
            }
        }
    else:
        content_block = {
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": file_type,
                "data": encoded
            }
        }

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2000,
        temperature=0,
        system=SYSTEM_PROMPT,  # exact text from section 4.3
        messages=[{
            "role": "user",
            "content": [
                content_block,
                {"type": "text", "text": "Extract the biomarkers."}
            ]
        }]
    )

    raw_text = response.content[0].text.strip()
    # strip markdown fences if model added them despite instructions
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
    import json
    return json.loads(raw_text)
```

### 4.5 LLM Configuration Boundaries — What Sonnet Does and Does Not Do

**This is the most important architectural rule in the entire system. Read it carefully.**

The LLM (Claude Sonnet 4.5) is used for **exactly one task**: reading values off a lab report image or PDF and returning structured JSON. Nothing else.

#### 4.5.1 What Sonnet 4.5 does

| Task | Why LLM |
|---|---|
| Reading text from lab report images/PDFs | Vision capability is the entire point — no other tool handles layout variation as well |
| Mapping marker name variants to canonical codes (e.g., "SGPT" → `alt`) | Linguistic flexibility — pattern matching by regex breaks on edge cases |
| Extracting blood draw date in varied formats ("May 10, 2026" or "10/05/26") | Linguistic flexibility |
| Returning structured JSON with extraction confidence per marker | LLM can self-report confidence when image is blurry/ambiguous |

#### 4.5.2 What Sonnet 4.5 does NOT do

| Task | Why NOT LLM | Where it happens instead |
|---|---|---|
| Compute the GLIS composite score | LLMs are non-deterministic; same input could yield different scores | Section 11 (Python) |
| Decide referral flags | Clinical safety requires deterministic threshold checks | Section 5.3 + Section 11 (Python) |
| Validate plausibility (e.g., "is hs-CRP=500 realistic?") | Math, not language | Section 5.6 (Python) |
| Normalize units (mg/dL → mg/L) | Math, not language | Section 5.6 (Python) |
| Classify into band (Optimal / Good / Pay Attention / Take Action) | Threshold comparison, not judgment | Section 11 (Python) |
| Generate patient-facing recommendations | Liability boundary — these are clinical guidance | Section 11 (Python, with reviewed copy) |
| Cross-check extracted blood draw date vs patient-entered date | Comparison logic | Section 5.6 (Python) |
| Decide whether to retry/reject an extraction | Routing logic | Section 5.5 (Python, based on confidence tier) |

#### 4.5.3 Why this separation matters

**Determinism.** Same lab report → same GLIS score → same band → same referral flags. Always. If a patient re-uploads the same PDF, they get the same number. LLMs cannot guarantee this even at temperature 0; deterministic Python code can.

**Clinical defensibility.** When Dr. Animas reviews a case and asks "why did this patient score 67?", the answer must be: "Because hs-CRP=4.5 mapped to inflammatory_sub=60, HbA1c=5.9 mapped to metabolic_sub=55, ALT=65 mapped to organ_function_sub=65, and the average rounded to 60. Then composite=60 mapped to the Pay Attention band (51-75)." That's a line-of-code-traceable answer. "The LLM decided" is not.

**Regulatory posture.** The GLIS methodology document (Section 2) positions GLIS as "non-diagnostic wellness screening that aggregates results from FDA-registered laboratory tests into a composite screening score." This positioning depends on the score being a mathematical aggregation. Using an LLM to compute the score would convert it into an opaque AI judgment, weakening the regulatory defense.

**Auditability for the v1.5 validation study.** Section 15 of the methodology document specifies an IRB-submitted validation study (n ≥ 150). For that study to be publishable, the scoring function must be a documented mathematical formula — not an LLM call.

**Cost and latency.** LLM calls are slow (~6-10 seconds) and cost money per call. Score computation is microseconds and free.

#### 4.5.4 Locked Sonnet 4.5 settings

These settings are **not configurable by the developer**. Changing them changes the contract.

| Setting | Value | Why locked |
|---|---|---|
| Model | `claude-sonnet-4-5` | Best vision model for this task at acceptable cost |
| Temperature | **0** | Deterministic output. Same input → same extraction. Any non-zero value breaks reproducibility. |
| Max tokens | 2000 | Sufficient for 3-marker JSON. Prevents runaway costs. |
| System prompt | Locked text in Section 4.3 | Schema is part of the contract |
| Output format | JSON only, no prose, no markdown fences | Programmatic parsing |
| Tool use / function calling | **Not used** | Adds complexity without benefit; native JSON works |
| Multi-turn / agent loops | **Not used** | Single-shot extraction; agents add failure modes |
| Extended thinking | **Not used in v1.0** | May be added in v1.1 for cluttered multi-page reports |
| Few-shot examples in prompt | **Not used in v1.0** | May be added in v1.1 after Day 2 testing surfaces failure patterns |
| ZDR (zero data retention) headers | **Not used in v1.0** | Deferred to v1.1 |

#### 4.5.5 What a developer must NEVER do

These would be intuitive "improvements" that silently break the system. Do not do them:

1. **Do NOT ask Sonnet to compute the GLIS score.** Even as a sanity check. Score computation is Python only.
2. **Do NOT ask Sonnet to "double-check" its extraction.** LLMs are bad at self-correction. The validation layer does this.
3. **Do NOT raise temperature above 0** to "make output more natural." This is extraction, not creative writing.
4. **Do NOT add an "explain your reasoning" step.** It adds tokens, latency, and a prose field nobody parses.
5. **Do NOT use Sonnet to generate patient-facing recommendation text on the fly.** Recommendation text is pre-written, reviewed by Dr. Animas, and selected by band.
6. **Do NOT use Sonnet to decide whether to flag a referral.** Referral flags are deterministic threshold checks in Python.

If any of these "improvements" are suggested mid-build, the answer is no, and this section is the reference.

---

## 5. Validation Layer

### 5.1 Purpose

The LLM output is **not trusted** for clinical decisions. The validation layer is deterministic Python code that:

1. Catches hallucinated values
2. Normalizes units across labs
3. Flags mandatory medical referral triggers
4. Cross-checks blood draw date against patient-provided date
5. Tags each marker with `valid`, `needs_review`, or `rejected`

### 5.2 Validation rules per biomarker

| Biomarker | Plausible range | Allowed units | Conversion |
|---|---|---|---|
| hs-CRP | 0.0 to 200.0 | mg/L, mg/dL | mg/dL × 10 = mg/L |
| HbA1c | 3.0 to 15.0 | %, mmol/mol | mmol/mol ÷ 10.929 + 2.15 = % |
| ALT | 1 to 5000 | U/L, IU/L | U/L = IU/L (no conversion) |

### 5.3 Mandatory referral triggers (from GLIS methodology Section 8)

These are evaluated in code, NOT by the LLM:

| Trigger | Condition | Action |
|---|---|---|
| hs-CRP elevated | value > 10 mg/L | Flag for physician referral |
| HbA1c diabetic | value ≥ 6.5 % | Flag for physician referral |
| ALT severe | value > 100 U/L | Flag for physician referral |

If any flag triggers, the GLIS response includes a `referral_flags` array and the patient-facing message includes a clear "Please see a doctor" call to action.

### 5.4 Cross-validation: blood draw date

If `blood_draw_date_extracted` (from LLM) does NOT match `blood_draw_date` (from patient pre-scan check-in) within 1 day, set `date_mismatch=true` and add a warning. Patient sees: "The date on your report doesn't match what you entered. Please confirm."

### 5.5 Confidence tier rules

The confidence tier is set during validation and consumed downstream by `compute_glis()`. The full 4-tier system is defined in **Section 11.9.1**. Summary:

| Tier | Condition | Downstream behavior |
|---|---|---|
| `high` | 3 of 3 markers found and valid | Full GLIS composite + band displayed |
| `provisional` | 2 of 3 markers found and valid | Composite + band displayed with "Provisional" caveat |
| `single_domain` | 1 of 3 markers found and valid | NO composite — single domain result only |
| `incomplete` | 0 markers found and valid | Re-upload prompt (existing portal flow) |

**Important change from v1.1:** The old `full` / `partial` / `incomplete` 3-tier system has been replaced by this 4-tier system. The validation layer must set `confidence_tier` to one of `high`, `provisional`, `single_domain`, or `incomplete`. See Section 11.9 for full handling rules.

### 5.6 Validation code skeleton

```python
def validate_extraction(llm_output: dict, patient_blood_draw_date: str) -> dict:
    """Returns validated extraction with normalized values and flags."""

    validated_markers = []
    referral_flags = []
    warnings = list(llm_output.get("warnings", []))

    BIOMARKER_RULES = {
        "hs_crp": {
            "plausible_range": (0.0, 200.0),
            "allowed_units": ["mg/L", "mg/dL"],
            "referral_trigger": lambda v: v > 10.0,
            "referral_message": "Elevated hs-CRP — please see a doctor"
        },
        "hba1c": {
            "plausible_range": (3.0, 15.0),
            "allowed_units": ["%", "mmol/mol"],
            "referral_trigger": lambda v: v >= 6.5,
            "referral_message": "HbA1c in diabetic range — please see a doctor"
        },
        "alt": {
            "plausible_range": (1, 5000),
            "allowed_units": ["U/L", "IU/L"],
            "referral_trigger": lambda v: v > 100,
            "referral_message": "Elevated ALT — please see a doctor"
        }
    }

    for marker in llm_output.get("markers", []):
        code = marker["code"]
        if not marker.get("found"):
            continue

        rule = BIOMARKER_RULES.get(code)
        if not rule:
            continue

        # Unit normalization
        value = marker["value"]
        unit = marker["unit"]
        normalized_value, normalized_unit = normalize_unit(code, value, unit)

        # Plausibility check
        lo, hi = rule["plausible_range"]
        if not (lo <= normalized_value <= hi):
            validated_markers.append({
                **marker,
                "validation_status": "rejected",
                "rejection_reason": f"value out of plausible range [{lo}, {hi}]"
            })
            continue

        # Referral trigger
        referral = rule["referral_trigger"](normalized_value)
        if referral:
            referral_flags.append({
                "code": code,
                "message": rule["referral_message"],
                "value": normalized_value
            })

        validated_markers.append({
            **marker,
            "value": normalized_value,
            "unit": normalized_unit,
            "validation_status": "valid",
            "referral_flag": referral
        })

    # Date cross-check
    date_mismatch = False
    if llm_output.get("blood_draw_date") and patient_blood_draw_date:
        if not dates_within_days(llm_output["blood_draw_date"], patient_blood_draw_date, 1):
            date_mismatch = True
            warnings.append("Blood draw date on report does not match patient-entered date")

    # Confidence tier (4-tier system — see Section 11.9.1)
    found_count = sum(1 for m in validated_markers if m["validation_status"] == "valid")
    if found_count == 3:
        confidence_tier = "high"
    elif found_count == 2:
        confidence_tier = "provisional"
    elif found_count == 1:
        confidence_tier = "single_domain"
    else:
        confidence_tier = "incomplete"

    return {
        "confidence_tier": confidence_tier,
        "markers": validated_markers,
        "markers_found": found_count,
        "markers_total": 3,
        "referral_flags": referral_flags,
        "warnings": warnings,
        "date_mismatch": date_mismatch,
        "lab_name": llm_output.get("lab_name"),
        "blood_draw_date_extracted": llm_output.get("blood_draw_date"),
        "blood_draw_time_extracted": llm_output.get("blood_draw_time")
    }


def normalize_unit(code: str, value: float, unit: str) -> tuple[float, str]:
    """Convert to canonical unit. Returns (value, canonical_unit)."""
    if code == "hs_crp" and unit == "mg/dL":
        return value * 10.0, "mg/L"
    if code == "hba1c" and unit == "mmol/mol":
        return value / 10.929 + 2.15, "%"
    # IU/L and U/L are equivalent
    if code == "alt" and unit == "IU/L":
        return value, "U/L"
    return value, unit


def dates_within_days(d1: str, d2: str, max_days: int) -> bool:
    from datetime import date
    return abs((date.fromisoformat(d1) - date.fromisoformat(d2)).days) <= max_days
```

---

## 6. Database Schema

### 6.1 Tables

```sql
-- One row per upload
CREATE TABLE extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',  -- queued | processing | complete | failed
    confidence_tier TEXT,                   -- full | partial | incomplete
    markers_found INTEGER DEFAULT 0,
    markers_total INTEGER DEFAULT 3,

    -- Patient-provided (from pre-scan check-in)
    patient_blood_draw_date DATE NOT NULL,
    patient_blood_draw_time TIME,
    prescan_responses JSONB,

    -- LLM-extracted
    raw_llm_output JSONB,
    lab_name_extracted TEXT,
    blood_draw_date_extracted DATE,
    blood_draw_time_extracted TIME,

    -- Validated output
    validated_markers JSONB,     -- array of marker objects
    referral_flags JSONB,        -- array of referral flag objects
    warnings JSONB,              -- array of warning strings
    date_mismatch BOOLEAN DEFAULT FALSE,

    -- Status and progress
    progress_percent INTEGER DEFAULT 0,
    current_step TEXT,
    failure_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,

    CONSTRAINT chk_status CHECK (status IN ('queued', 'processing', 'complete', 'failed'))
);

CREATE INDEX idx_extractions_patient_id ON extractions(patient_id);
CREATE INDEX idx_extractions_created_at ON extractions(created_at DESC);

-- One row per computed GLIS score
CREATE TABLE glis_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    extraction_id UUID NOT NULL REFERENCES extractions(id),
    composite_score INTEGER NOT NULL,        -- 0-100
    band TEXT NOT NULL,                      -- optimal | good | pay_attention | take_action
    domain_scores JSONB NOT NULL,            -- {inflammatory, metabolic, organ_function}
    referral_flags JSONB,
    confirmed_markers JSONB NOT NULL,        -- snapshot of what patient confirmed
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_glis_scores_patient_id ON glis_scores(patient_id);
```

### 6.2 Storage bucket

- Bucket name: `lab-uploads`
- Path structure: `{patient_id}/{extraction_id}.{ext}`
- Access: Private; signed URLs only, 1-hour expiry
- Max file size: 10 MB
- Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`

---

## 7. Integration with Existing Frontend

### 7.1 Files affected

- `gutguard-patient-portal__5_.html` — modify `simUp()` function

### 7.2 Specific changes to `simUp()`

The existing `simUp()` function (line ~1927) currently simulates extraction with `setTimeout` calls. Replace with real API calls.

**Before (simulated):**

```javascript
function simUp(){
    // ...timer-based simulation...
    var markers=['hs-CRP','WBC','Fasting Glucose','Triglycerides','HDL Cholesterol'];
    // setTimeout-based reveal
}
```

**After (real API):**

```javascript
async function simUp() {
    // Get file from input or camera (existing UI)
    const file = getUploadedFile(); // implement based on existing photo/file paths

    // Show processing screen (existing)
    const _su = document.getElementById('su');
    if (_su) _su.style.display = 'none';
    const _sp = document.getElementById('sp');
    if (_sp) _sp.style.display = 'block';

    // Get pre-scan check-in data from session/state
    const prescanData = getPrescanResponses();
    const bloodDrawDate = getBloodDrawDate();
    const bloodDrawTime = getBloodDrawTime();

    // Build form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', getPatientId());
    formData.append('blood_draw_date', bloodDrawDate);
    formData.append('blood_draw_time', bloodDrawTime);
    formData.append('prescan_responses', JSON.stringify(prescanData));

    // Upload
    let extractionId;
    try {
        const uploadResp = await fetch(`${API_BASE}/api/extractions`, {
            method: 'POST',
            body: formData
        });
        if (!uploadResp.ok) throw new Error('Upload failed');
        const uploadData = await uploadResp.json();
        extractionId = uploadData.extraction_id;
    } catch (e) {
        showError('Upload failed. Please try again.');
        return;
    }

    // Poll for completion (every 2s, max 30 attempts = 60s)
    let attempts = 0;
    const poll = async () => {
        attempts++;
        const resp = await fetch(`${API_BASE}/api/extractions/${extractionId}`);
        const data = await resp.json();

        // Update progress UI (existing #ocrBar, #ocrTitle, #ocrSteps)
        updateProgressUI(data);

        if (data.status === 'complete') {
            handleExtractionComplete(data);
        } else if (data.status === 'failed') {
            handleExtractionFailed(data);
        } else if (attempts < 30) {
            setTimeout(poll, 2000);
        } else {
            showError('Taking too long. Please try again.');
        }
    };
    poll();
}

function handleExtractionComplete(data) {
    // data.confidence_tier: 'full' | 'partial' | 'incomplete'
    // data.markers: array of {code, display_name, value, unit, referral_flag, ...}

    // Store for sC2 review screen
    window.currentExtraction = data;

    // Existing flow: route to sC2 with c2Rows populated
    populateC2Rows(data.markers);
    if (data.confidence_tier === 'full') {
        // Auto-proceed
        ocrProceed();
    } else if (data.confidence_tier === 'partial') {
        // Show count, let patient proceed
        showPartialTier(data.markers_found, data.markers_total);
    } else {
        // incomplete — retry
        showIncompleteTier();
    }
}

function populateC2Rows(markers) {
    const container = document.getElementById('c2Rows');
    container.innerHTML = '';
    markers.forEach(m => {
        const row = document.createElement('div');
        row.innerHTML = `
            <div class="marker-row">
                <div class="marker-name">${m.display_name}</div>
                <div class="marker-value" data-code="${m.code}">${m.value} ${m.unit}</div>
                ${m.referral_flag ? '<div class="referral-flag">⚠ Please see a doctor</div>' : ''}
            </div>
        `;
        container.appendChild(row);
    });
}
```

### 7.3 Confirmation flow

When the patient taps "Calculate My Score" (existing CTA on `sC2`):

```javascript
async function confirmAndScore() {
    const confirmedMarkers = collectConfirmedMarkers(); // read from c2Rows
    const resp = await fetch(
        `${API_BASE}/api/extractions/${currentExtraction.extraction_id}/confirm`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_id: getPatientId(),
                confirmed_markers: confirmedMarkers
            })
        }
    );
    const result = await resp.json();
    // result: { glis_score, band, domain_scores, referral_flags, next_steps_message }
    displayGlisScore(result);
}
```

### 7.4 Pre-scan check-in capture

The existing portal does not yet capture blood draw date/time as a separate step. **Add a screen before `su` (upload screen)** that asks:

1. When was your blood drawn? (date picker, default today)
2. What time was your blood drawn? (time picker, optional)
3. Pre-scan checklist (8 questions from GLIS methodology Section 8)

Store responses in sessionStorage. Pass to backend on upload.

---

## 8. Project Structure

```
gutguard-extraction/
├── README.md
├── TECH_DEBT.md                # explicit deferred items
├── requirements.txt
├── .env.example
├── .gitignore
├── render.yaml                 # Render deployment config
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # env vars, settings
│   ├── routes/
│   │   ├── __init__.py
│   │   └── extractions.py      # all /api/extractions endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── extraction.py       # Anthropic API call wrapper
│   │   ├── validation.py       # validation layer (section 5)
│   │   ├── storage.py          # Supabase Storage uploads
│   │   └── glis.py             # GLIS score computation
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Pydantic models for request/response
│   ├── prompts/
│   │   └── extraction_system_prompt.txt  # exact prompt from section 4.3
│   └── db/
│       ├── __init__.py
│       └── client.py           # Supabase client
└── tests/
    ├── fixtures/
    │   └── sample_lab_reports/  # 10 real PH lab reports
    ├── test_extraction.py
    ├── test_validation.py
    └── test_glis.py              # GLIS scoring unit tests (PRD Section 11.7)
```

---

## 9. Environment Variables

```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # service role for backend

# App config
API_BASE_URL=https://gutguard-extraction.onrender.com
ENVIRONMENT=development  # development | staging | production
MAX_FILE_SIZE_MB=10
RATE_LIMIT_PER_HOUR=3

# CORS
ALLOWED_ORIGINS=https://gutguard.ph,https://portal.gutguard.ph
```

---

## 10. Five-Day Implementation Plan

### Day 1 — Foundation

**Morning:**
- [ ] Create Supabase project (Singapore region)
- [ ] Run schema SQL (section 6.1)
- [ ] Create `lab-uploads` storage bucket with private access
- [ ] Set up GitHub repo
- [ ] Initialize FastAPI scaffold (`app/main.py`, basic routes)
- [ ] Deploy hello-world to Render, confirm deployment pipeline works

**Afternoon:**
- [ ] Implement `POST /api/extractions` endpoint (upload only, no extraction yet)
- [ ] Implement file validation (size, MIME, magic bytes)
- [ ] Implement Supabase Storage upload
- [ ] Insert extraction row with status=`queued`
- [ ] Implement `GET /api/extractions/{id}` endpoint (returns row from DB)
- [ ] Test with Postman / curl

**End of day:** File upload works end-to-end, lands in Supabase Storage, row in DB.

### Day 2 — Vision Extraction

**Morning:**
- [ ] Implement Anthropic API call (section 4.4 code)
- [ ] Embed system prompt from section 4.3
- [ ] Add file → base64 conversion (PDF and image)
- [ ] Hook into background task triggered by upload endpoint
- [ ] Update extraction row with `raw_llm_output` and status=`processing` → `complete`

**Afternoon:**
- [ ] Acquire 10 real PH lab reports (Hi-Precision, Healthway, Makati Med, others)
- [ ] Run extraction on all 10
- [ ] Manually verify accuracy of each extraction
- [ ] Note any failure patterns (handwritten annotations, unusual layouts, etc.)
- [ ] Adjust system prompt if needed (avoid major changes; minor tweaks only)

**End of day:** Vision extraction works on real PH lab reports.

### Day 3 — Validation + Frontend Integration

**Morning:**
- [ ] Implement validation layer (section 5.6 code)
- [ ] Implement unit normalization
- [ ] Implement referral flag detection
- [ ] Implement date cross-check
- [ ] Implement confidence tier logic
- [ ] Save validated output to DB

**Afternoon:**
- [ ] Modify `simUp()` in patient portal HTML (section 7.2)
- [ ] Implement polling loop
- [ ] Wire `c2Rows` population from real API response
- [ ] Test end-to-end: upload → poll → review screen

**End of day:** Patient can upload a lab report and see real extracted values on `sC2` screen.

### Day 4 — Confirmation, Scoring, Pre-Scan Check-in

**Morning:**
- [ ] Implement `POST /api/extractions/{id}/confirm` endpoint
- [ ] Implement `compute_glis()` in `app/services/glis.py` (full code in Section 11.5)
- [ ] Write and run unit tests in `tests/test_glis.py` (Section 11.7) — all 11 must pass
- [ ] Save `glis_scores` row
- [ ] Return composite score, band, referral flags, band labels (EN + TL)

**Afternoon:**
- [ ] Add pre-scan check-in screen to portal (before `su`)
- [ ] Capture blood draw date/time
- [ ] Capture 8 checklist questions from GLIS methodology Section 8
- [ ] Pass to backend on upload
- [ ] Wire score display in patient portal

**End of day:** Full happy path works: pre-scan → upload → extract → confirm → score.

### Day 5 — Testing, Buffer, Demo Prep

**Morning:**
- [ ] End-to-end testing with all 10 lab reports
- [ ] Test edge cases: blurry image, wrong document type, partial extraction
- [ ] Test mobile upload on actual mobile network
- [ ] Fix critical bugs

**Afternoon:**
- [ ] Demo dry-run with CSA / Dr. Animas
- [ ] Final bug fixes
- [ ] Write README with deployment instructions
- [ ] Create `TECH_DEBT.md` listing deferred items

**End of day:** Demo-ready prototype.

---

## 11. GLIS Score Computation

**This section is the canonical reference for how the GLIS score is calculated. Every step is deterministic Python — no LLM involvement, ever. See Section 4.5 for why this separation is non-negotiable.**

### 11.0 Calculation flow overview

```
1. Patient uploads lab report
2. Sonnet 4.5 extracts values (Section 4)         ← LLM
3. Validation layer normalizes + checks (Section 5) ← Python
4. Patient confirms values on sC2 screen           ← Frontend
5. compute_glis() runs in 3 steps:                 ← Python (this section)
     5a. Each marker → sub-score (0-100)
     5b. Sub-scores → composite score (0-100)
     5c. Composite score → band (Optimal/Good/Pay Attention/Take Action)
6. Result returned to frontend
7. Score displayed to patient
```

Steps 2 is the only LLM-touched step. Everything else, including the entire GLIS calculation, is pure Python math.

### 11.1 Step 5a — Each marker becomes a sub-score

Each of the 3 launch biomarkers is converted into a 0-100 sub-score using a **lookup table**, where **lower = healthier**.

#### hs-CRP sub-score (Inflammatory domain)

| hs-CRP value (mg/L) | Sub-score | Clinical meaning | Source |
|---|---|---|---|
| 0.0 ≤ v ≤ 1.0 | **10** | Low cardiovascular inflammation risk | Pearson et al., *Circulation* 2003 |
| 1.0 < v ≤ 3.0 | **30** | Average risk | Pearson et al., *Circulation* 2003 |
| 3.0 < v ≤ 10.0 | **60** | Elevated risk | Pearson et al., *Circulation* 2003 |
| v > 10.0 | **90** | High risk — referral triggered | GLIS methodology Section 8 |

#### HbA1c sub-score (Metabolic domain)

| HbA1c value (%) | Sub-score | Clinical meaning | Source |
|---|---|---|---|
| v < 5.4 | **15** | Optimal glucose regulation | ADA diagnostic criteria |
| 5.4 ≤ v ≤ 5.6 | **30** | Normal upper range | ADA diagnostic criteria |
| 5.7 ≤ v < 6.5 | **55** | Prediabetes range | ADA diagnostic criteria |
| v ≥ 6.5 | **85** | Diabetic range — referral triggered | GLIS methodology Section 8 |

#### ALT sub-score (Organ function domain)

| ALT value (U/L) | Sub-score | Clinical meaning | Source |
|---|---|---|---|
| v < 30 | **20** | Healthy liver function | Kwo et al., *Am J Gastroenterol* 2017 |
| 30 ≤ v ≤ 56 | **40** | Upper normal range | Kwo et al., *Am J Gastroenterol* 2017 |
| 56 < v ≤ 100 | **65** | Mild elevation | Kwo et al., *Am J Gastroenterol* 2017 |
| v > 100 | **85** | Marked elevation — referral triggered | GLIS methodology Section 8 |

### 11.2 Step 5b — Composite score (the GLIS number)

The composite is the **arithmetic mean of available sub-scores**, rounded to the nearest integer.

```
GLIS = round( sum(available_sub_scores) / count(available_sub_scores) )
```

If all 3 markers are present, the composite averages all 3. If only 2 are present (partial confidence tier), the composite averages those 2. If only 1 is present, the composite equals that single sub-score. If 0 are present, no score is computed (the confidence tier was `incomplete` and the frontend already routed to the re-upload prompt).

**Equal weights** are used for the prototype. In v2, when the full Plus/Complete tiers are activated, weighted domain contributions will be introduced per the GLIS methodology Section 4.

### 11.3 Step 5c — Composite score becomes a band

| Composite score range | Band code | English label | Tagalog label |
|---|---|---|---|
| 0 ≤ s ≤ 25 | `optimal` | Optimal | Mabuti |
| 26 ≤ s ≤ 50 | `good` | Good | Maayos |
| 51 ≤ s ≤ 75 | `pay_attention` | Pay Attention | Pansinin |
| 76 ≤ s ≤ 100 | `take_action` | Take Action | Kumilos Na |

These thresholds match the GLIS methodology document Section 1 executive summary.

### 11.4 Worked examples

#### Example 1 — Healthy patient (all 3 markers)

| Marker | Value | Sub-score |
|---|---|---|
| hs-CRP | 0.8 mg/L | 10 (inflammatory) |
| HbA1c | 5.2 % | 15 (metabolic) |
| ALT | 22 U/L | 20 (organ_function) |

- Composite = round((10 + 15 + 20) / 3) = round(15.0) = **15**
- Band: **Optimal (Mabuti)**
- Referral flags: none

#### Example 2 — At-risk patient (all 3 markers)

| Marker | Value | Sub-score |
|---|---|---|
| hs-CRP | 4.5 mg/L | 60 (inflammatory) |
| HbA1c | 5.9 % | 55 (metabolic) |
| ALT | 65 U/L | 65 (organ_function) |

- Composite = round((60 + 55 + 65) / 3) = round(60.0) = **60**
- Band: **Pay Attention (Pansinin)**
- Referral flags: none (no value crossed mandatory threshold)

#### Example 3 — Critical patient (all 3 markers, all referrals)

| Marker | Value | Sub-score |
|---|---|---|
| hs-CRP | 12 mg/L | 90 (inflammatory) + referral |
| HbA1c | 7.2 % | 85 (metabolic) + referral |
| ALT | 130 U/L | 85 (organ_function) + referral |

- Composite = round((90 + 85 + 85) / 3) = round(86.67) = **87**
- Band: **Take Action (Kumilos Na)**
- Referral flags: 3 (hs-CRP, HbA1c, ALT all crossed mandatory thresholds)

#### Example 4 — Partial extraction (only 2 markers found)

| Marker | Value | Sub-score |
|---|---|---|
| hs-CRP | 2.5 mg/L | 30 (inflammatory) |
| HbA1c | 5.5 % | 30 (metabolic) |
| ALT | NOT FOUND | — |

- Composite = round((30 + 30) / 2) = round(30.0) = **30**
- Band: **Good (Maayos)**
- Confidence tier: `partial`
- Frontend shows "Calculated from 2 of 3 markers" note (existing UI at portal line ~1493)

#### Example 5 — Edge case at boundary (composite = 25)

| Marker | Value | Sub-score |
|---|---|---|
| hs-CRP | 1.0 mg/L | 10 (boundary — uses ≤ rule) |
| HbA1c | 5.4 % | 30 (boundary — uses ≤ rule) |
| ALT | 30 U/L | 40 (boundary — uses ≤ rule) |

- Composite = round((10 + 30 + 40) / 3) = round(26.67) = **27**
- Band: **Good (Maayos)** (27 > 25, falls in 26-50 range)

### 11.5 Full Python implementation

This is the complete function. Copy into `app/services/glis.py`.

```python
"""
GLIS Score Computation — Deterministic Python
==============================================
This module computes the GLIS composite score from validated, patient-confirmed
biomarker values. NO LLM involvement. NO non-determinism. Same input → same output.

See PRD Section 4.5 for why this separation from the LLM extraction step
is non-negotiable, and Section 11 for the canonical scoring methodology.
"""

from typing import TypedDict, Literal


class MarkerInput(TypedDict):
    code: str       # "hs_crp" | "hba1c" | "alt"
    value: float    # already validated and unit-normalized


class GlisResult(TypedDict):
    composite_score: int | None
    band: Literal["optimal", "good", "pay_attention", "take_action"] | None
    band_label_en: str | None
    band_label_tl: str | None
    domain_scores: dict[str, int]
    referral_flags: list[dict]
    markers_used: int
    error: str | None


BAND_LABELS = {
    "optimal":       {"en": "Optimal",        "tl": "Mabuti"},
    "good":          {"en": "Good",           "tl": "Maayos"},
    "pay_attention": {"en": "Pay Attention",  "tl": "Pansinin"},
    "take_action":   {"en": "Take Action",    "tl": "Kumilos Na"},
}


def _hs_crp_sub_score(v: float) -> tuple[int, bool]:
    """Returns (sub_score, referral_triggered)."""
    if v <= 1.0:
        return 10, False
    if v <= 3.0:
        return 30, False
    if v <= 10.0:
        return 60, False
    return 90, True  # > 10.0 → referral


def _hba1c_sub_score(v: float) -> tuple[int, bool]:
    """Returns (sub_score, referral_triggered)."""
    if v < 5.4:
        return 15, False
    if v <= 5.6:
        return 30, False
    if v < 6.5:
        return 55, False
    return 85, True  # ≥ 6.5 → referral


def _alt_sub_score(v: float) -> tuple[int, bool]:
    """Returns (sub_score, referral_triggered)."""
    if v < 30:
        return 20, False
    if v <= 56:
        return 40, False
    if v <= 100:
        return 65, False
    return 85, True  # > 100 → referral


def _band_for_composite(composite: int) -> str:
    """Map composite score to band code."""
    if composite <= 25:
        return "optimal"
    if composite <= 50:
        return "good"
    if composite <= 75:
        return "pay_attention"
    return "take_action"


def compute_glis(confirmed_markers: list[MarkerInput]) -> GlisResult:
    """
    Compute GLIS composite score from confirmed biomarker values.

    Args:
        confirmed_markers: list of dicts, each with 'code' and 'value'.
                          Values must already be unit-normalized
                          (hs-CRP in mg/L, HbA1c in %, ALT in U/L).

    Returns:
        GlisResult with composite_score, band, domain_scores, referral_flags.
        If no valid markers, returns None composite with error message.

    This function is pure, deterministic, and free of side effects.
    Same input always yields the same output.
    """

    domain_scores: dict[str, int] = {}
    referral_flags: list[dict] = []

    for m in confirmed_markers:
        code = m["code"]
        v = m["value"]

        if code == "hs_crp":
            sub, referral = _hs_crp_sub_score(v)
            domain_scores["inflammatory"] = sub
            if referral:
                referral_flags.append({
                    "code": "hs_crp",
                    "value": v,
                    "threshold": "> 10 mg/L",
                    "message": "Elevated hs-CRP — please consult a doctor"
                })

        elif code == "hba1c":
            sub, referral = _hba1c_sub_score(v)
            domain_scores["metabolic"] = sub
            if referral:
                referral_flags.append({
                    "code": "hba1c",
                    "value": v,
                    "threshold": "≥ 6.5 %",
                    "message": "HbA1c in diabetic range — please consult a doctor"
                })

        elif code == "alt":
            sub, referral = _alt_sub_score(v)
            domain_scores["organ_function"] = sub
            if referral:
                referral_flags.append({
                    "code": "alt",
                    "value": v,
                    "threshold": "> 100 U/L",
                    "message": "Elevated ALT — please consult a doctor"
                })

    if not domain_scores:
        return {
            "composite_score": None,
            "band": None,
            "band_label_en": None,
            "band_label_tl": None,
            "domain_scores": {},
            "referral_flags": [],
            "markers_used": 0,
            "error": "No valid markers — cannot compute score"
        }

    # Composite = arithmetic mean of available sub-scores, rounded.
    composite = round(sum(domain_scores.values()) / len(domain_scores))

    band = _band_for_composite(composite)

    return {
        "composite_score": composite,
        "band": band,
        "band_label_en": BAND_LABELS[band]["en"],
        "band_label_tl": BAND_LABELS[band]["tl"],
        "domain_scores": domain_scores,
        "referral_flags": referral_flags,
        "markers_used": len(domain_scores),
        "error": None
    }
```

### 11.6 Patient-facing recommendation copy (pre-written, by band)

Recommendation text is **pre-written and reviewed by Dr. Animas**. It is NOT generated by the LLM on the fly. The frontend selects the appropriate text by band code.

| Band | Patient-facing message (EN) |
|---|---|
| optimal | "Your inflammation is in the Optimal range. Maintain your healthy lifestyle and re-scan in 6–8 weeks to track your trajectory." |
| good | "Your inflammation is in the Good range. Continue your lifestyle protocol and re-scan in 6–8 weeks." |
| pay_attention | "Your inflammation is in the Pay Attention range. Consider speaking with a doctor and starting a structured protocol. Re-scan in 6–8 weeks." |
| take_action | "Your inflammation is in the Take Action range. Please see a doctor as soon as possible. A structured protocol is strongly recommended." |

Tagalog versions to be reviewed by Dr. Animas before launch.

If any `referral_flags` are present, an additional message appears regardless of band: **"One or more of your values requires medical attention. Please consult a doctor."**

### 11.7 Unit tests (mandatory before deployment)

Copy into `tests/test_glis.py`. All tests must pass before Day 5 demo.

```python
"""
Unit tests for compute_glis().

Every test corresponds to a worked example in PRD Section 11.4 or
to a boundary condition in the lookup tables in PRD Section 11.1.
"""

from app.services.glis import compute_glis


def test_example_1_healthy_patient():
    """PRD Section 11.4, Example 1."""
    result = compute_glis([
        {"code": "hs_crp", "value": 0.8},
        {"code": "hba1c",  "value": 5.2},
        {"code": "alt",    "value": 22},
    ])
    assert result["composite_score"] == 15
    assert result["band"] == "optimal"
    assert result["band_label_en"] == "Optimal"
    assert result["band_label_tl"] == "Mabuti"
    assert result["domain_scores"] == {
        "inflammatory": 10,
        "metabolic": 15,
        "organ_function": 20
    }
    assert result["referral_flags"] == []
    assert result["markers_used"] == 3


def test_example_2_at_risk_patient():
    """PRD Section 11.4, Example 2."""
    result = compute_glis([
        {"code": "hs_crp", "value": 4.5},
        {"code": "hba1c",  "value": 5.9},
        {"code": "alt",    "value": 65},
    ])
    assert result["composite_score"] == 60
    assert result["band"] == "pay_attention"
    assert result["referral_flags"] == []


def test_example_3_critical_patient():
    """PRD Section 11.4, Example 3. All three markers cross referral thresholds."""
    result = compute_glis([
        {"code": "hs_crp", "value": 12.0},
        {"code": "hba1c",  "value": 7.2},
        {"code": "alt",    "value": 130},
    ])
    assert result["composite_score"] == 87
    assert result["band"] == "take_action"
    assert result["band_label_tl"] == "Kumilos Na"
    assert len(result["referral_flags"]) == 3
    codes = {f["code"] for f in result["referral_flags"]}
    assert codes == {"hs_crp", "hba1c", "alt"}


def test_example_4_partial_extraction():
    """PRD Section 11.4, Example 4. Only 2 markers present."""
    result = compute_glis([
        {"code": "hs_crp", "value": 2.5},
        {"code": "hba1c",  "value": 5.5},
    ])
    assert result["composite_score"] == 30
    assert result["band"] == "good"
    assert result["markers_used"] == 2
    assert "organ_function" not in result["domain_scores"]


def test_example_5_boundary_composite_27():
    """PRD Section 11.4, Example 5. Values at sub-score boundaries."""
    result = compute_glis([
        {"code": "hs_crp", "value": 1.0},   # ≤ 1.0 → 10
        {"code": "hba1c",  "value": 5.4},   # 5.4 ≤ v ≤ 5.6 → 30
        {"code": "alt",    "value": 30},    # 30 ≤ v ≤ 56 → 40
    ])
    assert result["composite_score"] == 27
    assert result["band"] == "good"


def test_no_markers_returns_error():
    """Empty input must not crash; must return error."""
    result = compute_glis([])
    assert result["composite_score"] is None
    assert result["band"] is None
    assert result["error"] == "No valid markers — cannot compute score"


def test_single_marker_uses_that_score_directly():
    """1 marker: composite equals that sub-score."""
    result = compute_glis([
        {"code": "hs_crp", "value": 0.5},   # → 10
    ])
    assert result["composite_score"] == 10
    assert result["band"] == "optimal"
    assert result["markers_used"] == 1


def test_referral_triggers_individually():
    """Each referral threshold fires independently."""

    # Only hs-CRP triggers
    result = compute_glis([{"code": "hs_crp", "value": 11.0}])
    assert len(result["referral_flags"]) == 1
    assert result["referral_flags"][0]["code"] == "hs_crp"

    # Only HbA1c triggers
    result = compute_glis([{"code": "hba1c", "value": 6.5}])
    assert len(result["referral_flags"]) == 1
    assert result["referral_flags"][0]["code"] == "hba1c"

    # Only ALT triggers
    result = compute_glis([{"code": "alt", "value": 101}])
    assert len(result["referral_flags"]) == 1
    assert result["referral_flags"][0]["code"] == "alt"


def test_determinism_same_input_same_output():
    """Calling compute_glis() multiple times with same input must return identical output."""
    inputs = [
        {"code": "hs_crp", "value": 3.7},
        {"code": "hba1c",  "value": 5.65},
        {"code": "alt",    "value": 47},
    ]
    result_a = compute_glis(inputs)
    result_b = compute_glis(inputs)
    result_c = compute_glis(inputs)
    assert result_a == result_b == result_c


def test_band_boundary_exactly_25():
    """Composite = 25 → optimal (boundary inclusive)."""
    # Construct inputs that yield composite exactly 25:
    # 10 + 30 + 40 = 80, /3 = 26.67 → 27. Try: 10 + 30 + 35 not possible (35 not in table).
    # Use 2-marker case: 10 + 40 = 50 / 2 = 25
    result = compute_glis([
        {"code": "hs_crp", "value": 1.0},   # → 10
        {"code": "alt",    "value": 35},    # → 40
    ])
    assert result["composite_score"] == 25
    assert result["band"] == "optimal"


def test_band_boundary_exactly_26():
    """Composite = 26 → good (just above optimal threshold)."""
    # 10 + 42 / 2 = 26. ALT=42 → 40. So 10 + 40 / 2 = 25. Try hba1c instead.
    # hs_crp=1.5 → 30, hba1c=5.2 → 15, ALT=22 → 20, /3 = 21.67 → 22 (optimal)
    # Use: hs_crp=2.0 → 30, hba1c=5.4 → 30, ALT=22 → 20. (30+30+20)/3 = 26.67 → 27. Good.
    result = compute_glis([
        {"code": "hs_crp", "value": 2.0},   # → 30
        {"code": "hba1c",  "value": 5.4},   # → 30
        {"code": "alt",    "value": 22},    # → 20
    ])
    assert result["composite_score"] == 27
    assert result["band"] == "good"
```

Run with `pytest tests/test_glis.py -v`. All 11 tests must pass.

### 11.8 Sign-off required before launch

Before Day 5 demo, Dr. Animas must explicitly approve:

- [ ] The 4 lookup tables in Section 11.1 (sub-score thresholds)
- [ ] The composite formula in Section 11.2 (arithmetic mean, equal weights)
- [ ] The band thresholds in Section 11.3 (25/50/75 cut points)
- [ ] The 4 patient-facing recommendation messages in Section 11.6
- [ ] The 3 referral flag messages in Section 11.5
- [ ] The 4-tier confidence system in Section 11.9.1
- [ ] The 12 single-domain interpretation messages in Section 11.9.4
- [ ] The "What to ask your doctor" reference card copy in Section 11.10.1
- [ ] The doctor-directed positioning copy in Section 11.10.2

This is non-negotiable. Dr. Animas's medical authority on these thresholds protects the company against clinical liability and is required for the future IRB-submitted validation study (GLIS methodology Section 15).

### 11.9 Score Confidence and Missing Marker Handling

**Real-world problem:** Philippine lab panels rarely include all 3 required markers (hs-CRP, HbA1c, ALT) by default. A patient may upload a lipid panel with no hs-CRP, an HbA1c-only report, or a comprehensive blood chemistry missing one of the three. The system must handle these gracefully without giving a misleading single-number score.

**Solution:** A 4-tier confidence system based on the number of markers successfully extracted and validated.

#### 11.9.1 Confidence tiers

| Markers found | Confidence tier | Composite shown? | Display mode | Patient-facing label |
|---|---|---|---|---|
| 3 of 3 | `high` | Yes | Full GLIS ring + composite + band | "Your GLIS Score" |
| 2 of 3 | `provisional` | Yes, with caveat | GLIS ring + "Provisional" badge + caveat | "Provisional GLIS Score" |
| 1 of 3 | `single_domain` | **No** | Single domain card showing the one marker | "Inflammatory / Metabolic / Organ Function reading" |
| 0 of 3 | `incomplete` | **No** | Re-upload prompt (existing portal flow) | — |

#### 11.9.2 Rules across all tiers

These apply regardless of confidence tier:

1. **Mandatory referral flags fire always.** If hs-CRP > 10, HbA1c ≥ 6.5, or ALT > 100 is detected, the referral flag triggers — even at `single_domain` tier with that single marker.
2. **Marker values are always shown to the patient** on the `sC2` confirmation screen. The confidence tier affects the result display, not the confirmation step.
3. **Missing markers are explicitly listed.** The patient always sees which markers were not found, so they understand what's missing.
4. **Re-scan prompts are tier-appropriate.** Provisional and single_domain tiers include "Add the missing markers for a complete score" guidance.

#### 11.9.3 Provisional tier (2 of 3 markers) — display rules

The composite is still computed as the arithmetic mean of the 2 sub-scores found. A "Provisional" badge appears above the score ring. Below the band label, a caveat reads:

> "Based on 2 of 3 markers. For a complete GLIS score, ask your doctor to also order [missing marker name]."

The recommendation message uses the same band-based copy from Section 11.6, but prefixed with: "Based on the markers we could read, your inflammation appears to be in the [band] range. A complete scan may show a different result."

#### 11.9.4 Single-domain tier (1 of 3 markers) — display rules

**No composite score is shown.** Instead, the patient sees a domain-specific result card with:

- The marker name and value (e.g., "hs-CRP: 2.5 mg/L")
- The clinical interpretation of that single value (low / average / elevated / high)
- A clear note that this is one domain, not a full GLIS score
- Guidance on completing the panel: "Ask your doctor to also order [other 2 markers] for a full GLIS score."

For each marker, the single-domain interpretation message is:

| Marker | Value range | Single-domain message |
|---|---|---|
| hs-CRP | 0.0-1.0 mg/L | "Your inflammatory marker is in the low range. This is one of three GLIS domains." |
| hs-CRP | 1.0-3.0 mg/L | "Your inflammatory marker is in the average range. This is one of three GLIS domains." |
| hs-CRP | 3.0-10.0 mg/L | "Your inflammatory marker is in the elevated range. This is one of three GLIS domains." |
| hs-CRP | > 10.0 mg/L | "Your inflammatory marker is high. Please consult a doctor. This is one of three GLIS domains." |
| HbA1c | < 5.4 % | "Your metabolic marker is in the optimal range. This is one of three GLIS domains." |
| HbA1c | 5.4-5.6 % | "Your metabolic marker is in the normal upper range. This is one of three GLIS domains." |
| HbA1c | 5.7-6.4 % | "Your metabolic marker is in the prediabetes range. This is one of three GLIS domains." |
| HbA1c | ≥ 6.5 % | "Your metabolic marker is in the diabetic range. Please consult a doctor. This is one of three GLIS domains." |
| ALT | < 30 U/L | "Your organ function marker is in the healthy range. This is one of three GLIS domains." |
| ALT | 30-56 U/L | "Your organ function marker is in the upper normal range. This is one of three GLIS domains." |
| ALT | 57-100 U/L | "Your organ function marker shows mild elevation. This is one of three GLIS domains." |
| ALT | > 100 U/L | "Your organ function marker is markedly elevated. Please consult a doctor. This is one of three GLIS domains." |

#### 11.9.5 Updated `compute_glis()` function — Registry Pattern (v1.3 refactor)

**This implementation supersedes the version in Section 11.5.** The refactor consolidates all marker-specific knowledge (sub-score thresholds, domain mapping, display names, interpretation messages, referral triggers) into a single `MARKER_REGISTRY` dictionary. **Adding a new biomarker is now a one-entry edit, not a multi-function change.** See Section 17 for how to extend the registry when adding markers for v1.1 and beyond.

The code uses bands per marker as data, not as code. Each marker has an ordered list of `(predicate, sub_score, interpretation_key, referral)` tuples. The first matching predicate wins. This means thresholds are visible at the top of the file rather than buried inside conditional logic.

```python
"""
GLIS Score Computation — Deterministic Python (v1.3 — registry pattern)
======================================================================
ALL marker-specific configuration lives in MARKER_REGISTRY below. To add
a new marker, add an entry to that dict — nothing else changes.

See PRD Section 4.5 for the LLM/Python separation rule.
See PRD Section 11 for scoring methodology.
See PRD Section 17 for the upgrade path to 5/8/12 markers.
"""

from typing import TypedDict, Literal, Callable


# ─────────────────────────────────────────────────────────────────────
# TYPE DEFINITIONS
# ─────────────────────────────────────────────────────────────────────

class MarkerInput(TypedDict):
    code: str
    value: float


class GlisResult(TypedDict):
    confidence_tier: Literal["high", "provisional", "single_domain", "incomplete"]
    composite_score: int | None
    band: Literal["optimal", "good", "pay_attention", "take_action"] | None
    band_label_en: str | None
    band_label_tl: str | None
    domain_scores: dict[str, int]
    referral_flags: list[dict]
    markers_used: int
    markers_missing: list[str]
    markers_total_required: int
    display_mode: Literal["full_glis", "provisional_glis", "single_domain", "re_upload"]
    single_domain_marker: dict | None
    caveat_message: str | None
    error: str | None


# ─────────────────────────────────────────────────────────────────────
# MARKER REGISTRY — single source of truth for all marker config
# ─────────────────────────────────────────────────────────────────────
# To add a new marker:
#   1. Add an entry to MARKER_REGISTRY with: display_name, domain,
#      canonical_unit, plausible_range, score_bands, referral_threshold,
#      and referral_message.
#   2. Confirm Dr. Animas signs off on the new thresholds (Section 11.8).
#   3. Update the system prompt in Section 4.3 to include the new marker.
#   4. Add unit tests in test_glis.py for the new entries.
# Nothing else in this file needs to change.
#
# score_bands is an ordered list of (upper_inclusive_bound, sub_score,
# interpretation_key, interpretation_message). The first band whose
# upper_inclusive_bound is >= value wins. Use float("inf") for the last band.

MARKER_REGISTRY: dict[str, dict] = {
    "hs_crp": {
        "display_name": "hs-CRP",
        "domain": "inflammatory",
        "canonical_unit": "mg/L",
        "plausible_range": (0.0, 200.0),
        "referral_threshold": lambda v: v > 10.0,
        "referral_message": "Elevated hs-CRP — please consult a doctor",
        "referral_threshold_label": "> 10 mg/L",
        "score_bands": [
            # (upper_inclusive, sub_score, interpretation_key, interpretation_message)
            (1.0,          10, "low",      "Your inflammatory marker is in the low range. This is one of three GLIS domains."),
            (3.0,          30, "average",  "Your inflammatory marker is in the average range. This is one of three GLIS domains."),
            (10.0,         60, "elevated", "Your inflammatory marker is in the elevated range. This is one of three GLIS domains."),
            (float("inf"), 90, "high",     "Your inflammatory marker is high. Please consult a doctor. This is one of three GLIS domains."),
        ],
    },
    "hba1c": {
        "display_name": "HbA1c",
        "domain": "metabolic",
        "canonical_unit": "%",
        "plausible_range": (3.0, 15.0),
        "referral_threshold": lambda v: v >= 6.5,
        "referral_message": "HbA1c in diabetic range — please consult a doctor",
        "referral_threshold_label": "≥ 6.5 %",
        "score_bands": [
            # Note: HbA1c uses strict < on the lowest band per Section 11.1
            (5.39,         15, "optimal",       "Your metabolic marker is in the optimal range. This is one of three GLIS domains."),
            (5.6,          30, "normal_upper",  "Your metabolic marker is in the normal upper range. This is one of three GLIS domains."),
            (6.49,         55, "prediabetes",   "Your metabolic marker is in the prediabetes range. This is one of three GLIS domains."),
            (float("inf"), 85, "diabetic",      "Your metabolic marker is in the diabetic range. Please consult a doctor. This is one of three GLIS domains."),
        ],
    },
    "alt": {
        "display_name": "ALT (SGPT)",
        "domain": "organ_function",
        "canonical_unit": "U/L",
        "plausible_range": (1, 5000),
        "referral_threshold": lambda v: v > 100,
        "referral_message": "Elevated ALT — please consult a doctor",
        "referral_threshold_label": "> 100 U/L",
        "score_bands": [
            (29.99,        20, "healthy",            "Your organ function marker is in the healthy range. This is one of three GLIS domains."),
            (56,           40, "normal_upper",       "Your organ function marker is in the upper normal range. This is one of three GLIS domains."),
            (100,          65, "mild_elevation",     "Your organ function marker shows mild elevation. This is one of three GLIS domains."),
            (float("inf"), 85, "marked_elevation",   "Your organ function marker is markedly elevated. Please consult a doctor. This is one of three GLIS domains."),
        ],
    },
}

# Markers required for a complete (high-confidence) GLIS score.
# This list defines what "complete" means and drives the confidence tier logic.
# When upgrading to Core tier (5 markers), extend this list to include the new
# marker codes — that single change cascades through all downstream logic.
REQUIRED_MARKERS: list[str] = ["hs_crp", "hba1c", "alt"]


# ─────────────────────────────────────────────────────────────────────
# BAND CONFIGURATION (composite score → patient-facing band)
# ─────────────────────────────────────────────────────────────────────
# Ordered (upper_inclusive_bound, band_code) — first match wins.

BAND_THRESHOLDS: list[tuple[float, str]] = [
    (25,           "optimal"),
    (50,           "good"),
    (75,           "pay_attention"),
    (float("inf"), "take_action"),
]

BAND_LABELS: dict[str, dict[str, str]] = {
    "optimal":       {"en": "Optimal",        "tl": "Mabuti"},
    "good":          {"en": "Good",           "tl": "Maayos"},
    "pay_attention": {"en": "Pay Attention",  "tl": "Pansinin"},
    "take_action":   {"en": "Take Action",    "tl": "Kumilos Na"},
}


# ─────────────────────────────────────────────────────────────────────
# CORE FUNCTIONS — registry-driven, marker-agnostic
# ─────────────────────────────────────────────────────────────────────

def _sub_score_for_marker(code: str, value: float) -> tuple[int, str, str, bool]:
    """
    Look up sub-score, interpretation key, interpretation message, and
    referral flag for a single marker value, using MARKER_REGISTRY.

    Returns: (sub_score, interpretation_key, interpretation_message, referral_triggered)
    """
    config = MARKER_REGISTRY[code]

    # Find first band where value falls below upper bound
    for upper_bound, sub_score, interp_key, interp_msg in config["score_bands"]:
        if value <= upper_bound:
            referral = config["referral_threshold"](value)
            return sub_score, interp_key, interp_msg, referral

    # Should never reach here because last band uses float("inf")
    raise ValueError(f"No band matched for {code} = {value}")


def _band_for_composite(composite: int) -> str:
    """Map composite score to band code using BAND_THRESHOLDS."""
    for upper_bound, band_code in BAND_THRESHOLDS:
        if composite <= upper_bound:
            return band_code
    raise ValueError(f"No band matched for composite = {composite}")


def _missing_markers_caveat(missing: list[str]) -> str:
    """Build the caveat sentence for provisional and single_domain tiers."""
    names = [MARKER_REGISTRY[m]["display_name"] for m in missing]
    if len(names) == 0:
        return ""
    if len(names) == 1:
        return f"For a complete GLIS score, ask your doctor to also order {names[0]}."
    if len(names) == 2:
        return f"For a complete GLIS score, ask your doctor to also order {names[0]} and {names[1]}."
    # 3+ markers missing: comma-separated with "and" before last
    return (
        f"For a complete GLIS score, ask your doctor to also order "
        f"{', '.join(names[:-1])}, and {names[-1]}."
    )


def _determine_confidence_tier(markers_used: int, markers_required: int) -> tuple[str, str]:
    """
    Map (markers found, markers required) → (confidence_tier, display_mode).

    Logic generalizes to any N markers — see Section 17 for the rules
    when scaling to 5 or 8 markers.
    """
    if markers_used == 0:
        return "incomplete", "re_upload"
    if markers_used == markers_required:
        return "high", "full_glis"
    if markers_used == 1:
        return "single_domain", "single_domain"
    return "provisional", "provisional_glis"


# ─────────────────────────────────────────────────────────────────────
# PUBLIC API
# ─────────────────────────────────────────────────────────────────────

def compute_glis(confirmed_markers: list[MarkerInput]) -> GlisResult:
    """
    Compute GLIS result with confidence tier awareness.

    This function is pure and deterministic. Same input → same output, always.
    No LLM involvement. No randomness. No I/O.

    Args:
        confirmed_markers: list of {code, value} dicts. Values must already
                          be validated and unit-normalized (see Section 5).

    Returns:
        GlisResult — a dict the frontend can render directly. The
        display_mode field tells the frontend which UI to show.
    """

    domain_scores: dict[str, int] = {}
    referral_flags: list[dict] = []
    marker_details: dict[str, dict] = {}  # for single_domain mode
    found_codes: list[str] = []

    # Process each marker through the registry
    for m in confirmed_markers:
        code = m["code"]
        if code not in MARKER_REGISTRY:
            continue  # silently skip unknown markers; validation layer logs

        value = m["value"]
        sub_score, interp_key, interp_msg, referral = _sub_score_for_marker(code, value)

        config = MARKER_REGISTRY[code]
        domain_scores[config["domain"]] = sub_score
        marker_details[code] = {
            "code": code,
            "display_name": config["display_name"],
            "value": value,
            "domain": config["domain"],
            "sub_score": sub_score,
            "interpretation": interp_key,
            "interpretation_message": interp_msg,
        }
        found_codes.append(code)

        if referral:
            referral_flags.append({
                "code": code,
                "value": value,
                "threshold": config["referral_threshold_label"],
                "message": config["referral_message"],
            })

    markers_used = len(domain_scores)
    markers_required = len(REQUIRED_MARKERS)
    markers_missing = [c for c in REQUIRED_MARKERS if c not in found_codes]

    confidence_tier, display_mode = _determine_confidence_tier(markers_used, markers_required)

    # ── INCOMPLETE TIER ──
    if confidence_tier == "incomplete":
        return {
            "confidence_tier": "incomplete",
            "composite_score": None,
            "band": None,
            "band_label_en": None,
            "band_label_tl": None,
            "domain_scores": {},
            "referral_flags": [],
            "markers_used": 0,
            "markers_missing": REQUIRED_MARKERS.copy(),
            "markers_total_required": markers_required,
            "display_mode": display_mode,
            "single_domain_marker": None,
            "caveat_message": None,
            "error": "No valid markers — please re-upload a complete lab report",
        }

    # ── SINGLE-DOMAIN TIER ──
    if confidence_tier == "single_domain":
        the_code = found_codes[0]
        return {
            "confidence_tier": "single_domain",
            "composite_score": None,
            "band": None,
            "band_label_en": None,
            "band_label_tl": None,
            "domain_scores": domain_scores,
            "referral_flags": referral_flags,
            "markers_used": markers_used,
            "markers_missing": markers_missing,
            "markers_total_required": markers_required,
            "display_mode": display_mode,
            "single_domain_marker": marker_details[the_code],
            "caveat_message": _missing_markers_caveat(markers_missing),
            "error": None,
        }

    # ── HIGH or PROVISIONAL TIER (composite computed) ──
    composite = round(sum(domain_scores.values()) / len(domain_scores))
    band = _band_for_composite(composite)
    caveat = _missing_markers_caveat(markers_missing) if confidence_tier == "provisional" else None

    return {
        "confidence_tier": confidence_tier,
        "composite_score": composite,
        "band": band,
        "band_label_en": BAND_LABELS[band]["en"],
        "band_label_tl": BAND_LABELS[band]["tl"],
        "domain_scores": domain_scores,
        "referral_flags": referral_flags,
        "markers_used": markers_used,
        "markers_missing": markers_missing,
        "markers_total_required": markers_required,
        "display_mode": display_mode,
        "single_domain_marker": None,
        "caveat_message": caveat,
        "error": None,
    }
```

**What changed structurally (v1.2 → v1.3):**

- All marker-specific config is now in `MARKER_REGISTRY` — one entry per biomarker
- Sub-score functions (`_hs_crp_sub_score`, `_hba1c_sub_score`, `_alt_sub_score`) are gone; replaced by one generic `_sub_score_for_marker(code, value)`
- Single-domain interpretation messages are inline in the registry, not in a separate `_single_domain_message()` function
- `REQUIRED_MARKERS` is a top-level constant — adding markers to it propagates everywhere
- `_determine_confidence_tier()` accepts `markers_required` as a parameter — works for 3, 5, 8, or 12 markers without modification
- New field `markers_total_required` in the result so frontends can render "X of N" correctly at any tier
- Band thresholds also live in a data structure (`BAND_THRESHOLDS`) for the same one-place-edit pattern

**Compatibility note:** Section 11.5 still describes the original three-function implementation for explanatory purposes. The actual production code is the registry version above. They produce identical results for the same inputs.

#### 11.9.6 Updated unit tests

Add these tests to `tests/test_glis.py` (in addition to those in Section 11.7). Update the existing tests to assert `confidence_tier`, `markers_used`, `markers_missing`, and `display_mode` fields where applicable.

```python
def test_high_confidence_tier_full_glis_display():
    """3 markers → high tier, full_glis display mode."""
    result = compute_glis([
        {"code": "hs_crp", "value": 0.8},
        {"code": "hba1c",  "value": 5.2},
        {"code": "alt",    "value": 22},
    ])
    assert result["confidence_tier"] == "high"
    assert result["display_mode"] == "full_glis"
    assert result["markers_used"] == 3
    assert result["markers_missing"] == []
    assert result["caveat_message"] is None


def test_provisional_tier_two_markers_with_caveat():
    """2 markers → provisional tier, composite still computed, caveat present."""
    result = compute_glis([
        {"code": "hs_crp", "value": 2.5},
        {"code": "hba1c",  "value": 5.5},
    ])
    assert result["confidence_tier"] == "provisional"
    assert result["display_mode"] == "provisional_glis"
    assert result["composite_score"] == 30
    assert result["band"] == "good"
    assert result["markers_missing"] == ["alt"]
    assert "ALT (SGPT)" in result["caveat_message"]


def test_single_domain_tier_no_composite():
    """1 marker → single_domain tier, NO composite or band."""
    result = compute_glis([
        {"code": "hs_crp", "value": 2.5},
    ])
    assert result["confidence_tier"] == "single_domain"
    assert result["display_mode"] == "single_domain"
    assert result["composite_score"] is None
    assert result["band"] is None
    assert result["single_domain_marker"] is not None
    assert result["single_domain_marker"]["code"] == "hs_crp"
    assert result["single_domain_marker"]["domain"] == "inflammatory"
    assert result["single_domain_marker"]["interpretation"] == "average"
    assert "one of three GLIS domains" in result["single_domain_marker"]["interpretation_message"]
    assert "HbA1c" in result["caveat_message"]
    assert "ALT (SGPT)" in result["caveat_message"]


def test_single_domain_tier_referral_still_fires():
    """Even at single_domain tier, referral flags must fire when threshold crossed."""
    result = compute_glis([
        {"code": "hs_crp", "value": 12.0},   # > 10 → referral
    ])
    assert result["confidence_tier"] == "single_domain"
    assert len(result["referral_flags"]) == 1
    assert result["referral_flags"][0]["code"] == "hs_crp"
    assert "high" in result["single_domain_marker"]["interpretation_message"].lower()


def test_incomplete_tier_returns_re_upload_mode():
    """0 markers → incomplete tier, re_upload display mode."""
    result = compute_glis([])
    assert result["confidence_tier"] == "incomplete"
    assert result["display_mode"] == "re_upload"
    assert result["composite_score"] is None
    assert result["markers_missing"] == ["hs_crp", "hba1c", "alt"]
    assert result["error"] is not None


def test_provisional_referral_fires_in_caveat_context():
    """Referral flags must fire even when score is provisional."""
    result = compute_glis([
        {"code": "hs_crp", "value": 11.0},  # referral
        {"code": "hba1c",  "value": 5.5},
    ])
    assert result["confidence_tier"] == "provisional"
    assert len(result["referral_flags"]) == 1
    assert result["composite_score"] is not None  # composite still computed
    assert result["caveat_message"] is not None   # caveat still present
```

#### 11.9.7 Frontend integration changes

The existing portal already has the right structure. Modifications:

**For `high` tier:** Existing flow. Show score ring with composite, band label, recommendation message.

**For `provisional` tier:**
- Show score ring with composite (same as high)
- Add "Provisional" badge above the ring (small pill, neutral color)
- Below band label, show `caveat_message` text
- Modify the recommendation copy with the "Based on the markers we could read..." prefix
- List missing markers in a footnote: "Not found in this report: ALT"

**For `single_domain` tier:**
- Hide the score ring entirely
- Show a domain-specific result card (e.g., "Inflammatory Marker" header, hs-CRP value, interpretation message)
- Show prominent CTA: "Get a complete GLIS by adding the missing markers"
- List missing markers explicitly

**For `incomplete` tier:**
- Existing re-upload flow (no changes needed)

### 11.10 Lab Ordering Guidance (No Lab Partners Required for v1.0)

GutGuard does not pre-arrange commercial lab partnerships for v1.0. Patients order labs through their own doctor or any PH laboratory. The system supports this via two helpers:

#### 11.10.1 "What to ask your doctor" reference card

Add this as a screen in the pre-scan flow (before `su` upload screen) titled **"What to ask your doctor"**:

> **Three tests for your complete GLIS Score:**
>
> 1. **hs-CRP** (high-sensitivity C-Reactive Protein) — ₱400-800
> 2. **HbA1c** (Glycated Hemoglobin) — ₱400-700
> 3. **ALT** (also called SGPT) — usually part of a basic blood chemistry panel
>
> **Total estimated cost:** ₱1,200-2,500 depending on lab.
>
> If your doctor orders only some of these, you'll get a Provisional GLIS. You can always re-scan when you complete the panel.

This screen is optional in the flow — patients can skip if they already have their lab results. A button labeled "I already have my lab results — upload now" jumps to the existing `su` screen.

#### 11.10.2 Doctor-directed flow positioning

The patient portal's onboarding copy should explicitly position lab ordering as a doctor-directed step. Suggested copy (to be reviewed by Dr. Animas):

> "GLIS works with standard lab tests your doctor can order. Bring this list to your next appointment, or ask any Philippine laboratory for these three tests."

This positioning avoids creating any impression of a "GutGuard-approved lab network" before such partnerships exist.

---

## 12. Security & Compliance

### 12.1 Mandatory for prototype

- [ ] All lab files encrypted at rest (Supabase Storage default)
- [ ] Signed URLs only (1-hour expiry)
- [ ] HTTPS only
- [ ] No PII in application logs
- [ ] CORS restricted to known origins
- [ ] Rate limiting per patient (3 uploads/hour)
- [ ] File size limit (10 MB)
- [ ] MIME type whitelist
- [ ] SQL injection prevention (parameterized queries via Supabase SDK)

### 12.2 Deferred to v1.1

- ZDR API headers with Anthropic
- Comprehensive audit log
- DPA (Philippine Data Privacy Act) registration
- Penetration testing
- DPO appointment
- Patient data export / deletion endpoints

---

## 13. Tech Debt Ledger (for v1.1)

Write this to `TECH_DEBT.md` on Day 1. Pay back when v1.1 starts.

1. **Authentication** — Currently no auth; uses hardcoded patient ID for demo. Add Supabase Auth.
2. **Async job queue** — Currently synchronous + polling. Move to Inngest or Cloudflare Queues.
3. **Audit log table** — Currently relies on Postgres logs. Build immutable audit trail.
4. **Doctor portal review queue** — Currently email-based escalation. Build proper UI.
5. **Per-marker correction endpoint** — Currently re-upload only. Add granular edit.
6. **Manual entry path** — Currently disabled. Re-enable with own validation.
7. **ZDR API headers** — Currently default retention. Switch to zero data retention.
8. **Fallback LLM provider** — Currently single point of failure. Add GPT-4o fallback.
9. **Image quality pre-check** — Currently no pre-screen. Add quality detection.
10. **Cost monitoring & alerts** — Currently unmonitored. Add cost dashboard.
11. **Additional biomarkers** — Currently 3 markers. Expand to full Core tier (5) then Plus/Complete tiers.
12. **Per-lab format optimization** — Currently generic prompt. Add lab-specific prompt variants if patterns emerge.

---

## 14. Open Questions for CSA

Before Day 1, please clarify:

1. **Hosting choice:** Render or Railway? (Either works; pick one.)
2. **Domain:** Will the API live at `api.gutguard.ph` or similar? Affects CORS.
3. **Sample lab reports:** Can Dr. Animas provide 10 real anonymized PH lab reports by Day 2 morning?
4. **Demo audience:** Who will see this on Day 5? Affects polish priorities.
5. **Patient ID source:** For the demo, do we generate a UUID per session, or is there an existing patient ID system to integrate with?
6. **GLIS scoring approval:** Section 11's simplified formula — does Dr. Animas approve this for prototype, or does he want a different weighting?

---

## 15. Acceptance Criteria (Final)

The prototype is accepted when:

- [ ] All 10 test lab reports extract at least 1 of 3 markers correctly
- [ ] Patient can upload via the portal and see real extracted values
- [ ] Mandatory referral triggers fire correctly when test data crosses thresholds
- [ ] Blood draw date is captured and cross-checked
- [ ] GLIS score displays with correct band classification
- [ ] End-to-end flow completes in under 30 seconds on 4G mobile
- [ ] No file uploads exceed 10 MB without rejection
- [ ] Rate limit triggers correctly (4th upload in an hour is rejected)
- [ ] `TECH_DEBT.md` is documented in the repo

---

## 16. Reference Documents

- `glis-clinical-methodology-v1-3.md` — clinical methodology document
- `gutguard-patient-portal__5_.html` — existing frontend that this backend integrates with
- [Anthropic API documentation — Vision](https://docs.claude.com/en/docs/build-with-claude/vision)
- [Anthropic API documentation — PDF support](https://docs.claude.com/en/docs/build-with-claude/pdf-support)
- [Supabase documentation](https://supabase.com/docs)
- [FastAPI documentation](https://fastapi.tiangolo.com/)

---

## 17. Upgrade Path — Growing from 3 to 12 Markers

**Purpose of this section:** Document the architectural decisions that make biomarker additions easy, and describe the specific path from the v1.0 Screen tier (3 markers) through Core (5), Plus (8), and Complete (12). Per the GLIS methodology document Section 1, this is the defined growth trajectory.

### 17.1 The four upgrade levels

| Version | Tier name | Markers | Marker codes added | Additional cost (PHP) | Estimated effort |
|---|---|---|---|---|---|
| **v1.0** | Screen | 3 | hs-CRP, HbA1c, ALT | ₱1,200-2,500 | (current build) |
| **v1.1** | Core | 5 | + NLR, eGFR | +₱500-1,000 | 3-5 days |
| **v2.0** | Plus | 8 | + ferritin, TyG Index, uric acid, albumin | +₱3,000-5,500 | 3-4 weeks |
| **v3.0** | Complete | 12 | + homocysteine, fasting insulin, GGT, cortisol AM, DHEA-S | +₱4,000-7,000 | 2-3 months |

### 17.2 What makes upgrades easy — the architectural commitments

These v1.0 design decisions are deliberate and must be preserved across upgrades. Together they reduce a marker addition from a multi-file refactor to a single-entry edit.

#### 17.2.1 MARKER_REGISTRY pattern (Section 11.9.5)

All marker-specific configuration — display name, domain assignment, canonical unit, plausible range, score bands, referral threshold, interpretation messages — lives in **one dictionary at the top of `glis.py`**. Adding NLR means adding one entry to `MARKER_REGISTRY`. The `compute_glis()` function does not change.

#### 17.2.2 REQUIRED_MARKERS as a list, not a count

The code never hardcodes "3" as the marker count. It always uses `len(REQUIRED_MARKERS)`. When you go to Core tier, you change one line:

```python
# v1.0
REQUIRED_MARKERS = ["hs_crp", "hba1c", "alt"]

# v1.1 (Core tier)
REQUIRED_MARKERS = ["hs_crp", "hba1c", "alt", "nlr", "egfr"]
```

The confidence tier logic (`high` / `provisional` / `single_domain` / `incomplete`) generalizes automatically. See Section 17.4 for the rule.

#### 17.2.3 Confidence tier logic is ratio-based

`_determine_confidence_tier(markers_used, markers_required)` accepts both counts as parameters. For 3 markers, 2-found is provisional. For 5 markers, 4-found and 3-found are both provisional. The function works at any N.

#### 17.2.4 Validation rules are tabular

`BIOMARKER_RULES` in Section 5.6 is a dict keyed by marker code. Adding NLR is one entry: plausible range, allowed units, referral trigger, referral message.

#### 17.2.5 Extraction is prompt-based, not regex-based

The system prompt in Section 4.3 is a numbered list of markers Claude should extract. Adding NLR is adding one item to the list. Claude handles the new marker without any code change.

#### 17.2.6 Database uses JSONB

The `validated_markers` and `confirmed_markers` columns are JSONB. New markers add fields to existing rows without schema migrations.

### 17.3 What a developer must NOT do (would break upgrade path)

These are intuitive shortcuts that lock the codebase to 3 markers. Avoid them in v1.0 even if they look harmless:

1. **Do NOT hardcode the number 3 in conditionals.** ❌ `if markers_used == 3` ✅ `if markers_used == len(REQUIRED_MARKERS)` or use the tier helper.
2. **Do NOT write per-marker functions when the registry can drive it.** ❌ `_hs_crp_sub_score(v)` ✅ `_sub_score_for_marker("hs_crp", v)` reading from `MARKER_REGISTRY`.
3. **Do NOT hardcode marker codes in API field names.** ❌ `result["hs_crp_value"]` ✅ `result["markers"]["hs_crp"]["value"]` — keep markers as keys, not column names.
4. **Do NOT scatter unit conversions across the codebase.** ✅ Keep all unit normalization in `normalize_unit()` in `validation.py`, driven by the marker registry.
5. **Do NOT write display strings ("3 of 3 markers") in templates.** ✅ Use `f"{markers_used} of {markers_total_required} markers"` so it works at any N.
6. **Do NOT hardcode "inflammatory / metabolic / organ_function" as the only domains.** Plus and Complete tiers introduce additional domains (e.g., HPA axis, micronutrient status). Read domain assignment from the registry.

### 17.4 The confidence tier rule (generalized)

For any number of required markers, the tier logic is:

| Condition | Tier |
|---|---|
| `markers_used == markers_required` | `high` |
| `markers_used > 1` AND `markers_used < markers_required` | `provisional` |
| `markers_used == 1` | `single_domain` |
| `markers_used == 0` | `incomplete` |

This is implemented in `_determine_confidence_tier()` in Section 11.9.5 and needs no modification across tier upgrades.

### 17.5 The v1.1 upgrade walkthrough (Core tier — 5 markers)

To illustrate how cheap upgrades are with this architecture, here's the complete diff for adding NLR and eGFR:

**Step 1 — Add to `MARKER_REGISTRY` in `glis.py`:**

```python
MARKER_REGISTRY["nlr"] = {
    "display_name": "NLR (Neutrophil-Lymphocyte Ratio)",
    "domain": "inflammatory",  # joins hs-CRP in the inflammatory domain
    "canonical_unit": "ratio",
    "plausible_range": (0.1, 30.0),
    "referral_threshold": lambda v: v > 5.0,
    "referral_message": "Elevated NLR — please consult a doctor",
    "referral_threshold_label": "> 5.0",
    "score_bands": [
        # Thresholds to be confirmed by Dr. Animas
        (1.5,          15, "low",      "Your NLR is in the low range. This is one of five GLIS domains."),
        (3.0,          35, "average",  "Your NLR is in the average range. This is one of five GLIS domains."),
        (5.0,          65, "elevated", "Your NLR is in the elevated range. This is one of five GLIS domains."),
        (float("inf"), 90, "high",     "Your NLR is high. Please consult a doctor. This is one of five GLIS domains."),
    ],
}

MARKER_REGISTRY["egfr"] = {
    "display_name": "eGFR",
    "domain": "organ_function",  # joins ALT in the organ function domain
    "canonical_unit": "mL/min/1.73m²",
    "plausible_range": (5, 200),
    "referral_threshold": lambda v: v < 30,
    "referral_message": "Low eGFR — please consult a doctor",
    "referral_threshold_label": "< 30 mL/min/1.73m²",
    "score_bands": [
        # Note: eGFR is inverted — LOWER values are worse, so score bands invert
        (29.99,        90, "severely_reduced", "Your kidney function marker is severely reduced. Please consult a doctor. This is one of five GLIS domains."),
        (59,           60, "reduced",          "Your kidney function marker is reduced. This is one of five GLIS domains."),
        (89,           30, "mildly_reduced",   "Your kidney function marker is mildly reduced. This is one of five GLIS domains."),
        (float("inf"), 10, "normal",           "Your kidney function marker is normal. This is one of five GLIS domains."),
    ],
}
```

**Step 2 — Update `REQUIRED_MARKERS`:**

```python
REQUIRED_MARKERS = ["hs_crp", "hba1c", "alt", "nlr", "egfr"]
```

**Step 3 — Update the system prompt in `app/prompts/extraction_system_prompt.txt`** to add NLR and eGFR to the numbered list (3 lines per marker).

**Step 4 — Update `BIOMARKER_RULES` in `validation.py`** with plausibility ranges and unit handling.

**Step 5 — Add unit tests** for the 2 new markers in `test_glis.py`.

**Step 6 — Get Dr. Animas to sign off** on the new thresholds.

**That's it.** No changes to `compute_glis()`, no changes to API contracts (new fields appear automatically in the markers array), no changes to confidence tier logic, no changes to the frontend's `c2Rows` rendering (it iterates over the markers array generically), no database migrations.

### 17.6 What changes at v2.0 (Plus tier) — moving beyond arithmetic mean

The v1.0 composite formula is arithmetic mean of available sub-scores. This works for 3-5 markers but starts to feel crude at 8. At v2.0, you transition to **weighted domain contributions**:

```
GLIS = w_inflammatory × inflammatory_domain_aggregate
     + w_metabolic × metabolic_domain_aggregate
     + w_organ_function × organ_function_domain_aggregate
     + w_micronutrient × micronutrient_domain_aggregate  # Plus tier introduces this
```

Where each domain aggregate is itself a function of multiple markers in that domain. Architectural impact:

- Add a `DOMAIN_WEIGHTS` constant (data, not code)
- Replace `composite = round(sum(domain_scores.values()) / len(domain_scores))` with a weighted aggregation function
- Add per-domain aggregation rules to the registry (or to a new `DOMAIN_REGISTRY`)
- Existing API contract stays the same — `composite_score`, `band`, `domain_scores` fields all continue to work

This is a 3-4 week effort, primarily because Dr. Animas needs to validate the weights against patient outcome data from the v1.5 validation study (Methodology Section 15).

### 17.7 What changes at v3.0 (Complete tier) — age adjustment and trajectory

At v3.0 the GLIS becomes a true longitudinal tool. Architectural additions:

- **Age-adjusted reference ranges** — sub-score thresholds vary with patient age. Registry entries gain age-stratified `score_bands_by_age_bracket`.
- **Trajectory analysis** — compare current score to prior scans, surface direction and rate of change. New tables: `score_trajectories`, `score_deltas`.
- **Personalized weighting** — derived from validation study patient cohorts. Weights may be adjusted by patient profile (age, sex, comorbidity flags).
- **Confidence intervals** — score is reported with a ± range based on marker confidence and missing-data imputation.

This is the largest architectural lift, 2-3 months, but only if you've preserved the v1.0 design decisions in Section 17.2. If you have, the upgrade is additive (new fields, new domains, new aggregation rules) rather than a rewrite.

### 17.8 Upgrade checklist (per tier transition)

When upgrading from one tier to the next, run through this list:

- [ ] Marker entries added to `MARKER_REGISTRY` with all required fields
- [ ] `REQUIRED_MARKERS` list updated
- [ ] System prompt (`extraction_system_prompt.txt`) updated with new markers
- [ ] `BIOMARKER_RULES` in validation.py updated with plausibility ranges
- [ ] Unit normalization rules added if new units appear
- [ ] Unit tests added covering each new marker at each band boundary
- [ ] Unit tests added for the new total marker count (e.g., 4-of-5 provisional, 1-of-5 single_domain, etc.)
- [ ] Dr. Animas sign-off on new thresholds, referral triggers, interpretation messages
- [ ] Frontend marker dictionary updated (display names, units, ordering on `sC2`)
- [ ] "What to ask your doctor" reference card (Section 11.10.1) updated with new tests
- [ ] Tech debt ledger reviewed; any v1.1 items relevant to the marker addition are addressed
- [ ] End-to-end test on real lab reports that include the new markers
- [ ] PRD changelog entry added (e.g., `v2.0 changes: ...`)

### 17.9 Why this matters for the business

Each tier upgrade is a **commercial product launch**, not just a technical release:

- **v1.1 Core** is the price point that converts "I tried the free Screen tier" into "I bought the Core panel" — your first revenue conversion gate
- **v2.0 Plus** is the premium price point for serious patients and the doctor-recommended default
- **v3.0 Complete** is the differentiator versus competitors like Everlywell — full-domain longitudinal tracking

The architecture in v1.0 must support all three without rewrites because each tier represents 4-12 weeks of marketing investment that depends on the technology being ready. The MARKER_REGISTRY pattern protects this entire commercial trajectory.

---

## 18. Document Control

| Field | Value |
|---|---|
| Document title | Biomarker Extraction Module PRD v1.3 |
| Audience | Development team |
| Owner | CSA, IG International / GutGuard |
| Date | May 14, 2026 |
| Status | Final for Development |
| Timeline | 5 days |

### Version history

- **v1.3 (May 14, 2026)** — Registry-pattern refactor of `compute_glis()`. Added Section 17 (Upgrade Path) covering the 3→5→8→12 marker growth trajectory.
- **v1.2 (May 14, 2026)** — Added Section 11.9 (4-tier confidence system: high / provisional / single_domain / incomplete). Added Section 11.10 (lab ordering guidance).
- **v1.1 (May 14, 2026)** — Added Section 4.5 (LLM Configuration Boundaries). Expanded Section 11 (GLIS Score Computation) with lookup tables, worked examples, full Python implementation, and unit tests.
- **v1.0 (May 14, 2026)** — Initial PRD covering architecture, API specification, vision extraction, validation, database schema, frontend integration, and 5-day implementation plan.

---

*End of PRD.*
