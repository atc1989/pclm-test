# Paddle OCR Service

Local OCR service for patient lab-result uploads.

Run from the repository root:

```bash
docker compose --env-file services/paddle-ocr/compose.env up --build paddle-ocr
```

The service exposes:

- `GET http://localhost:8001/health`
- `POST http://localhost:8001/ocr` with multipart field `file`

The Next.js app should use:

```dotenv
PADDLE_OCR_SERVICE_URL=http://localhost:8001/ocr
BYPASS_LAB_RESULT_PROCESSING=false
```

Use the explicit `--env-file` so Docker Compose does not parse the app `.env` secrets as Compose interpolation values.
