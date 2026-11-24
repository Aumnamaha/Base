"""Whisper automatic speech recognition helpers."""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Any, Optional

from config import settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _get_transcriber(model_id: str) -> Any:
    """Create and cache one ASR pipeline per model id."""
    import torch
    from transformers import pipeline

    device = 0 if torch.cuda.is_available() else -1
    logger.info("Loading ASR pipeline for %s on device %s", model_id, device)
    return pipeline("automatic-speech-recognition", model=model_id, device=device)


def transcribe_audio(
    audio_path: str,
    model_id: str = settings.model_id,
    language: Optional[str] = settings.default_language,
) -> str:
    """Transcribe an audio file.

    Pass ``language=None`` (or "auto" via the API) to let Whisper detect the language.
    """
    generate_kwargs: dict[str, Any] = {"task": "transcribe"}
    if language:
        generate_kwargs["language"] = f"<|{language}|>"

    transcriber = _get_transcriber(model_id)
    logger.info("Transcribing %s", audio_path)
    result = transcriber(audio_path, generate_kwargs=generate_kwargs)
    return result["text"]


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python src/pipeline/infer.py <audio_path> [language_code]")
        sys.exit(1)

    path = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else settings.default_language

    text = transcribe_audio(path, language=lang)
    print("\nTranscription Result:")
    print("-" * 30)
    print(text)
    print("-" * 30)
