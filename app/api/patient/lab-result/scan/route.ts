import { NextResponse } from "next/server";
import {
  LabResultProcessingError,
  processLabResultFile,
} from "@/lib/lab-result-processing";

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/heic",
  "image/heif",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A lab result file is required." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a PDF or image file." },
        { status: 415 },
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File must be between 1 byte and 12 MB." },
        { status: 413 },
      );
    }

    const result = await processLabResultFile(file);

    return NextResponse.json({
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
      result,
    });
  } catch (error) {
    if (error instanceof LabResultProcessingError) {
      return NextResponse.json(
        {
          error: error.message,
          provider: error.provider,
          retryable: error.retryable,
          statusCode: error.status,
        },
        { status: error.status },
      );
    }

    const message = error instanceof Error ? error.message : "Unable to process lab result.";
    return NextResponse.json(
      {
        error: message,
        provider: "unknown",
        retryable: false,
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}
