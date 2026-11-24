"""FastAPI entry point for the NeuroVoice transcription service."""

from __future__ import annotations

import logging
import shutil
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from src.pipeline.infer import transcribe_audio

logger = logging.getLogger(__name__)

app = FastAPI(title="NeuroVoice Speech-to-Text API")

# Credentials are not used, so a wildcard origin is valid. Restrict with
# NEUVOICE_ALLOWED_ORIGINS in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _upload_suffix(filename: Optional[str]) -> str:
    """Return a short, safe suffix derived from an uploaded filename."""
    if not filename:
        return ""
    suffix = Path(filename).suffix
    if not suffix or len(suffix) > 10 or not suffix[1:].isalnum():
        return ""
    return suffix


@app.post("/transcribe")
async def transcribe_endpoint(
    file: UploadFile = File(...),
    language: str = Form(settings.default_language),
):
    """Save an uploaded clip to a unique temp file, transcribe it, and return text."""
    content_type = file.content_type or ""
    if not content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio format")

    if language != "auto" and not settings.is_supported_language(language):
        raise HTTPException(status_code=400, detail=f"Unsupported language code: {language}")

    lang_arg = None if language == "auto" else language
    temp_path: Optional[Path] = None

    try:
        with tempfile.NamedTemporaryFile(
            prefix="neurovoice_",
            suffix=_upload_suffix(file.filename),
            delete=False,
        ) as temp_file:
            temp_path = Path(temp_file.name)
            shutil.copyfileobj(file.file, temp_file)

        text = transcribe_audio(str(temp_path), model_id=settings.model_id, language=lang_arg)
        return {"text": text, "language": language}
    except Exception as exc:
        logger.exception("Transcription failed for uploaded file %s", file.filename)
        raise HTTPException(status_code=500, detail="Transcription failed") from exc
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
    )
