import io
import os
import tempfile
from typing import Any

import fitz
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image
from paddleocr import PaddleOCR


app = FastAPI(title="GutGuard Paddle OCR")

LANG = os.getenv("PADDLE_OCR_LANG", "en")
MAX_PDF_PAGES = int(os.getenv("PADDLE_OCR_MAX_PDF_PAGES", "3"))

ocr: PaddleOCR | None = None


@app.on_event("startup")
def load_ocr() -> None:
    global ocr
    ocr = PaddleOCR(use_angle_cls=True, lang=LANG, show_log=False)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ocr")
async def read_lab_result(file: UploadFile = File(...)) -> dict[str, Any]:
    if ocr is None:
        raise HTTPException(status_code=503, detail="OCR engine is not ready.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    mime_type = file.content_type or ""
    try:
        images = render_pdf(content) if mime_type == "application/pdf" else [read_image(content)]
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Unable to read file: {exc}") from exc

    pages = []
    all_lines: list[str] = []

    for page_index, image in enumerate(images):
        result = run_ocr(image)
        lines = flatten_result(result)
        all_lines.extend(line["text"] for line in lines)
        pages.append(
            {
                "page": page_index + 1,
                "line_count": len(lines),
                "lines": lines,
            }
        )

    return {
        "provider": "paddleocr",
        "provider_model": f"paddleocr:{LANG}",
        "filename": file.filename,
        "mime_type": mime_type,
        "raw_text": "\n".join(all_lines).strip(),
        "pages": pages,
    }


def read_image(content: bytes) -> np.ndarray:
    image = Image.open(io.BytesIO(content)).convert("RGB")
    return np.array(image)


def render_pdf(content: bytes) -> list[np.ndarray]:
    images: list[np.ndarray] = []
    with fitz.open(stream=content, filetype="pdf") as document:
        for page in document[:MAX_PDF_PAGES]:
            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            image = Image.open(io.BytesIO(pixmap.tobytes("png"))).convert("RGB")
            images.append(np.array(image))
    if not images:
        raise ValueError("PDF has no renderable pages.")
    return images


def run_ocr(image: np.ndarray) -> Any:
    assert ocr is not None
    with tempfile.NamedTemporaryFile(suffix=".png") as temp:
        Image.fromarray(image).save(temp.name)
        return ocr.ocr(temp.name, cls=True)


def flatten_result(result: Any) -> list[dict[str, Any]]:
    lines: list[dict[str, Any]] = []

    def visit(node: Any) -> None:
        if not isinstance(node, list):
            return
        if len(node) >= 2 and isinstance(node[1], tuple):
            text = node[1][0]
            confidence = node[1][1] if len(node[1]) > 1 else None
            if isinstance(text, str) and text.strip():
                lines.append(
                    {
                        "text": text.strip(),
                        "confidence": confidence,
                        "box": node[0] if isinstance(node[0], list) else None,
                    }
                )
            return
        for child in node:
            visit(child)

    visit(result)
    return lines
