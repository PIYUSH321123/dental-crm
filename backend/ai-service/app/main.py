from datetime import datetime, timezone
from fastapi import FastAPI, Header, HTTPException
from app.core.config import settings

app = FastAPI(
    title="DentFlow AI Service",
    version="1.0.0",
    description="Pluggable AI modules (X-ray YOLO, photo triage, voice receptionist, multilingual explainer/Rx/WhatsApp)",
)


def verify_internal_key(x_internal_key: str | None = Header(default=None)) -> None:
    if settings.ai_service_internal_key and x_internal_key != settings.ai_service_internal_key:
        raise HTTPException(status_code=401, detail="Invalid internal service key")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "dentflow-ai-service",
        "mock_mode": settings.ai_mock_mode,
        "provider": settings.ai_provider,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

