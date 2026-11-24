"""Hermetic tests for inference language handling."""

from __future__ import annotations

import pytest

import src.pipeline.infer as infer


class RecordingTranscriber:
    def __init__(self) -> None:
        self.calls: list[tuple[str, dict]] = []

    def __call__(self, audio_path: str, generate_kwargs: dict | None = None) -> dict:
        self.calls.append((audio_path, generate_kwargs or {}))
        return {"text": "ok"}


@pytest.fixture
def transcriber(monkeypatch: pytest.MonkeyPatch) -> RecordingTranscriber:
    fake = RecordingTranscriber()
    monkeypatch.setattr(infer, "_get_transcriber", lambda model_id: fake)
    return fake


def test_explicit_language_becomes_whisper_token(transcriber: RecordingTranscriber) -> None:
    assert infer.transcribe_audio("clip.wav", language="hi") == "ok"

    kwargs = transcriber.calls[0][1]
    assert kwargs["language"] == "<|hi|>"
    assert kwargs["task"] == "transcribe"


def test_auto_detect_omits_language_token(transcriber: RecordingTranscriber) -> None:
    assert infer.transcribe_audio("clip.wav", language=None) == "ok"

    kwargs = transcriber.calls[0][1]
    assert "language" not in kwargs
    assert kwargs["task"] == "transcribe"


def test_model_id_is_forwarded_to_pipeline_factory(monkeypatch: pytest.MonkeyPatch) -> None:
    seen: list[str] = []

    def factory(model_id: str):
        seen.append(model_id)
        return RecordingTranscriber()

    monkeypatch.setattr(infer, "_get_transcriber", factory)
    infer.transcribe_audio("clip.wav", model_id="custom/model")

    assert seen == ["custom/model"]
