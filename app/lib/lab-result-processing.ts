type LabMarkerKey =
  | "crp"
  | "wbc"
  | "neut"
  | "lymph"
  | "glu"
  | "alt"
  | "trig"
  | "hdl";

export type NormalizedLabMarkers = Partial<Record<LabMarkerKey, number | null>>;

export type NormalizedLabResult = {
  markers: NormalizedLabMarkers;
  confidence: Partial<Record<LabMarkerKey, "clear" | "low" | "missing">>;
  missingFields: LabMarkerKey[];
  warnings: string[];
  rawText: string;
  provider: {
    ocr: string;
    normalizer: string;
    bypassed: boolean;
  };
};

export class LabResultProcessingError extends Error {
  status: number;
  provider: "paddle" | "gemini" | "config" | "unknown";
  retryable: boolean;

  constructor({
    message,
    status = 500,
    provider = "unknown",
    retryable = false,
  }: {
    message: string;
    status?: number;
    provider?: "paddle" | "gemini" | "config" | "unknown";
    retryable?: boolean;
  }) {
    super(message);
    this.name = "LabResultProcessingError";
    this.status = status;
    this.provider = provider;
    this.retryable = retryable;
  }
}

const MARKER_KEYS: LabMarkerKey[] = [
  "crp",
  "wbc",
  "neut",
  "lymph",
  "glu",
  "alt",
  "trig",
  "hdl",
];

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";

export async function processLabResultFile(file: File): Promise<NormalizedLabResult> {
  if (process.env.BYPASS_LAB_RESULT_PROCESSING === "true") {
    return buildBypassResult(file);
  }

  const rawText = await runPaddleOcr(file);
  const normalized = await runGeminiNormalizer(rawText);

  return {
    ...normalized,
    rawText,
    provider: {
      ocr: "paddle",
      normalizer: process.env.GEMINI_LAB_NORMALIZER_MODEL || "gemini",
      bypassed: false,
    },
  };
}

async function runPaddleOcr(file: File): Promise<string> {
  const serviceUrl = process.env.PADDLE_OCR_SERVICE_URL;
  if (!serviceUrl) {
    throw new LabResultProcessingError({
      message: "PADDLE_OCR_SERVICE_URL is not configured.",
      provider: "config",
    });
  }

  const formData = new FormData();
  formData.append("file", file, file.name || "lab-result");

  const headers = new Headers();
  const token = process.env.PADDLE_OCR_SERVICE_TOKEN;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(serviceUrl, {
    method: "POST",
    headers,
    body: formData,
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new LabResultProcessingError({
      message: `Paddle OCR failed (${response.status}): ${responseText.slice(0, 300)}`,
      status: response.status,
      provider: "paddle",
      retryable: isRetryableStatus(response.status),
    });
  }

  const parsed = tryParseJson(responseText);
  const rawText = extractText(parsed) || responseText;
  if (!rawText.trim()) {
    throw new LabResultProcessingError({
      message: "Paddle OCR returned no readable text.",
      status: 422,
      provider: "paddle",
    });
  }

  return rawText.trim();
}

async function runGeminiNormalizer(rawText: string): Promise<Omit<NormalizedLabResult, "rawText" | "provider">> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new LabResultProcessingError({
      message: "GEMINI_API_KEY is not configured.",
      provider: "config",
    });
  }

  const model = process.env.GEMINI_LAB_NORMALIZER_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `${GEMINI_ENDPOINT}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: [
                  "Extract these blood-test markers from OCR text and return JSON only.",
                  "Use null for absent markers. Use these keys exactly:",
                  "crp hs-CRP mg/L, wbc WBC x10^3/uL, neut neutrophil percent, lymph lymphocyte percent, glu fasting glucose mg/dL, alt ALT U/L, trig triglycerides mg/dL, hdl HDL cholesterol mg/dL.",
                  "Return shape: {\"markers\":{\"crp\":number|null,\"wbc\":number|null,\"neut\":number|null,\"lymph\":number|null,\"glu\":number|null,\"alt\":number|null,\"trig\":number|null,\"hdl\":number|null},\"confidence\":{\"crp\":\"clear|low|missing\",...},\"missingFields\":[...],\"warnings\":[...]}",
                  "Do not infer values that are not present. If units differ, convert to the requested units only when conversion is unambiguous.",
                  "",
                  "OCR text:",
                  rawText,
                ].join("\n"),
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0,
        },
      }),
    },
  );

  const body = await response.text();
  if (!response.ok) {
    throw new LabResultProcessingError({
      message: `Gemini normalizer failed (${response.status}): ${extractProviderErrorMessage(body)}`,
      status: response.status,
      provider: "gemini",
      retryable: isRetryableStatus(response.status),
    });
  }

  const payload = tryParseJson(body);
  const text = extractGeminiText(payload) || body;
  const normalized = tryParseJson(stripJsonFence(text));

  return normalizePayload(normalized);
}

function normalizePayload(payload: unknown): Omit<NormalizedLabResult, "rawText" | "provider"> {
  const record = isRecord(payload) ? payload : {};
  const rawMarkers = isRecord(record.markers) ? record.markers : record;
  const rawConfidence = isRecord(record.confidence) ? record.confidence : {};
  const markers: NormalizedLabMarkers = {};
  const confidence: NormalizedLabResult["confidence"] = {};
  const missingFields: LabMarkerKey[] = [];

  for (const key of MARKER_KEYS) {
    const value = toNumberOrNull(rawMarkers[key]);
    markers[key] = value;
    const conf = rawConfidence[key];
    confidence[key] =
      conf === "clear" || conf === "low" || conf === "missing"
        ? conf
        : value === null
          ? "missing"
          : "low";
    if (value === null) missingFields.push(key);
  }

  const warnings = Array.isArray(record.warnings)
    ? record.warnings.filter((warning): warning is string => typeof warning === "string")
    : [];

  return {
    markers,
    confidence,
    missingFields,
    warnings,
  };
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

function extractProviderErrorMessage(body: string): string {
  const parsed = tryParseJson(body);
  if (isRecord(parsed) && isRecord(parsed.error) && typeof parsed.error.message === "string") {
    return parsed.error.message;
  }

  return body.slice(0, 300);
}

function buildBypassResult(file: File): NormalizedLabResult {
  return {
    markers: {
      crp: 4.8,
      wbc: 8.2,
      neut: 72,
      lymph: 20,
      glu: 112,
      alt: null,
      trig: 210,
      hdl: 38,
    },
    confidence: {
      crp: "clear",
      wbc: "clear",
      neut: "low",
      lymph: "low",
      glu: "clear",
      alt: "missing",
      trig: "clear",
      hdl: "clear",
    },
    missingFields: ["alt"],
    warnings: [
      "Lab result processing is bypassed in this environment. A real file was selected, but OCR and Gemini were not called.",
    ],
    rawText: `Bypassed OCR for ${file.name || "uploaded lab result"}.`,
    provider: {
      ocr: "bypass",
      normalizer: "bypass",
      bypassed: true,
    },
  };
}

function extractText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";

  for (const key of ["raw_text", "rawText", "text", "ocr_text", "ocrText", "result"]) {
    const text = extractText(value[key]);
    if (text) return text;
  }

  for (const key of ["pages", "data", "results", "tables", "lines"]) {
    const nested = value[key];
    if (Array.isArray(nested)) {
      const text = nested.map(extractText).filter(Boolean).join("\n");
      if (text) return text;
    }
  }

  return "";
}

function extractGeminiText(value: unknown): string {
  if (!isRecord(value) || !Array.isArray(value.candidates)) return "";

  return value.candidates
    .map((candidate) => {
      if (!isRecord(candidate) || !isRecord(candidate.content)) return "";
      const parts = candidate.content.parts;
      if (!Array.isArray(parts)) return "";

      return parts
        .map((part) => (isRecord(part) && typeof part.text === "string" ? part.text : ""))
        .join("");
    })
    .filter(Boolean)
    .join("\n");
}

function stripJsonFence(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const cleaned = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!cleaned) return null;

  const parsed = Number(cleaned[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
