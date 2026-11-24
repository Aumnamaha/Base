"""Hermetic tests for the FastAPI transcription endpoint."""

from __future__ import annotations

import io
from dataclasses import replace
from pathlib import Path

import pytest

pytest.importorskip("fastapi")
pytest.importorskip("multipart")

from fastapi.testclient import TestClient  # noqa: E402

import api  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    return TestClient(api.app)


@pytest.fixture
def transcribe_calls(monkeypatch: pytest.MonkeyPatch) -> list[dict[str, object]]:
    calls: list[dict[str, object]] = []

    def fake_transcribe(
        path: str, model_id: str | None = None, language: str | None = None
    ) -> str:
        calls.append({"path": path, "model_id": model_id, "language": language})
        return "नमस्ते दुनिया"

    monkeypatch.setattr(api, "transcribe_audio", fake_transcribe)
    return calls


def _upload(content_type: str = "audio/wav", filename: str = "sample.wav") -> dict:
    return {"file": (filename, io.BytesIO(b"RIFFfake"), content_type)}


def test_health_endpoint(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["model"] == api.settings.model_id


def test_oversized_upload_is_rejected(client: TestClient, monkeypatch) -> None:
    monkeypatch.setattr(api, "settings", replace(api.settings, max_upload_mb=1))
    oversized = io.BytesIO(b"x" * (1024 * 1024 + 1))

    response = client.post(
        "/transcribe", files={"file": ("big.wav", oversized, "audio/wav")}
    )

    assert response.status_code == 413
    assert "exceeds" in response.json()["detail"]


def test_transcribe_returns_text_and_removes_temp_file(
    client: TestClient, transcribe_calls: list[dict[str, object]]
) -> None:
    response = client.post("/transcribe", files=_upload(), data={"language": "hi"})

    assert response.status_code == 200, response.text
    assert response.json() == {"text": "नमस्ते दुनिया", "language": "hi"}
    assert len(transcribe_calls) == 1
    call = transcribe_calls[0]
    assert call["language"] == "hi"
    assert str(call["path"]).endswith(".wav")
    assert not Path(str(call["path"])).exists()


def test_auto_language_is_forwarded_as_none(
    client: TestClient, transcribe_calls: list[dict[str, object]]
) -> None:
    response = client.post("/transcribe", files=_upload(), data={"language": "auto"})

    assert response.status_code == 200, response.text
    assert response.json()["language"] == "auto"
    assert transcribe_calls[0]["language"] is None


def test_missing_language_uses_configured_default(
    client: TestClient, transcribe_calls: list[dict[str, object]]
) -> None:
    response = client.post("/transcribe", files=_upload())

    assert response.status_code == 200, response.text
    assert response.json()["language"] == api.settings.default_language


def test_non_audio_upload_is_rejected(client: TestClient) -> None:
    response = client.post("/transcribe", files=_upload(content_type="text/plain"))

    assert response.status_code == 400
    assert response.json()["detail"] == "File must be an audio format"


def test_unsupported_language_is_rejected(client: TestClient) -> None:
    response = client.post("/transcribe", files=_upload(), data={"language": "xx"})

    assert response.status_code == 400
    assert "Unsupported language" in response.json()["detail"]


def test_internal_error_detail_is_generic(client: TestClient, monkeypatch) -> None:
    def boom(*args, **kwargs):
        raise RuntimeError("secret model detail")

    monkeypatch.setattr(api, "transcribe_audio", boom)
    response = client.post("/transcribe", files=_upload())

    assert response.status_code == 500
    assert response.json()["detail"] == "Transcription failed"
    assert "secret" not in response.text
