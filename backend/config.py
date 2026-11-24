"""Central configuration for the NeuroVoice backend.

All values come from environment variables so the same code works locally and in
hosting without editing source files.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Tuple

# Languages exposed by the web UI. "auto" is handled by the API layer.
SUPPORTED_LANGUAGES: Tuple[str, ...] = ("en", "hi", "bn", "ta", "te", "mr")


def _csv_env(name: str, default: str) -> Tuple[str, ...]:
    """Read a comma-separated environment variable as a tuple."""
    raw = os.getenv(name, default)
    return tuple(item.strip() for item in raw.split(",") if item.strip())


def _bool_env(name: str, default: str) -> bool:
    """Read a boolean environment variable."""
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    """Runtime settings loaded once at import time."""

    host: str = field(default_factory=lambda: os.getenv("NEUVOICE_HOST", "0.0.0.0"))
    port: int = field(default_factory=lambda: int(os.getenv("NEUVOICE_PORT", "8000")))
    reload: bool = field(default_factory=lambda: _bool_env("NEUVOICE_RELOAD", "true"))

    model_id: str = field(
        default_factory=lambda: os.getenv("NEUVOICE_MODEL_ID", "openai/whisper-small")
    )
    default_language: str = field(
        default_factory=lambda: os.getenv("NEUVOICE_DEFAULT_LANGUAGE", "en")
    )
    training_language: str = field(
        default_factory=lambda: os.getenv("NEUVOICE_TRAINING_LANGUAGE", "hi")
    )

    allowed_origins: Tuple[str, ...] = field(
        default_factory=lambda: _csv_env("NEUVOICE_ALLOWED_ORIGINS", "*")
    )

    train_output_dir: str = field(
        default_factory=lambda: os.getenv(
            "NEUVOICE_TRAIN_OUTPUT_DIR", "./models/whisper-finetuned"
        )
    )
    final_model_dir: str = field(
        default_factory=lambda: os.getenv(
            "NEUVOICE_FINAL_MODEL_DIR", "./models/whisper-finetuned-final"
        )
    )
    max_steps: int = field(default_factory=lambda: int(os.getenv("NEUVOICE_MAX_STEPS", "20")))
    max_upload_mb: int = field(
        default_factory=lambda: int(os.getenv("NEUVOICE_MAX_UPLOAD_MB", "100"))
    )
    log_level: str = field(
        default_factory=lambda: os.getenv("NEUVOICE_LOG_LEVEL", "INFO").upper()
    )

    @property
    def max_upload_bytes(self) -> int:
        """Maximum accepted upload size in bytes."""
        return self.max_upload_mb * 1024 * 1024

    @staticmethod
    def is_supported_language(language: str) -> bool:
        """Return True when a language code is accepted by the web UI."""
        return language in SUPPORTED_LANGUAGES


settings = Settings()
