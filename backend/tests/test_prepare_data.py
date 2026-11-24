"""Hermetic tests for dataset preparation."""

from __future__ import annotations

import sys
import types
from typing import Any, Dict

import pytest

from src.data.prepare_data import prepare_dataset


class FakeDataset:
    def __init__(self, items: list[dict]) -> None:
        self.items = items

    def cast_column(self, name: str, audio: Any) -> "FakeDataset":
        return self

    def take(self, count: int) -> list[dict]:
        return self.items[:count]


class FakeFeatureExtractor:
    def __call__(self, array: Any, sampling_rate: int, return_tensors: str) -> Any:
        return types.SimpleNamespace(input_features=[[array]])


class FakeTokenizer:
    bos_token_id = 90
    eos_token_id = 99

    def __call__(self, text: str, add_special_tokens: bool = True) -> Any:
        # HF BatchEncoding supports both attribute and key access.
        return types.SimpleNamespace(input_ids=[10, 11])


class FakeProcessor:
    feature_extractor = FakeFeatureExtractor()
    tokenizer = FakeTokenizer()

    @staticmethod
    def get_decoder_prompt_ids(language: str, task: str):
        return [
            (90, "<|startoftranscript|>"),
            (91, "<|hi|>"),
            (92, "<|transcribe|>"),
        ]


@pytest.fixture
def fake_hf(monkeypatch: pytest.MonkeyPatch) -> Dict[str, Any]:
    calls: Dict[str, Any] = {}
    datasets = types.ModuleType("datasets")
    transformers = types.ModuleType("transformers")

    class FakeAudio:
        def __init__(self, sampling_rate: int) -> None:
            self.sampling_rate = sampling_rate

    def load_dataset(*args: Any, **kwargs: Any) -> FakeDataset:
        calls["args"] = args
        calls["kwargs"] = kwargs
        return FakeDataset(
            [
                {
                    "audio": {"array": [0.0, 0.1], "sampling_rate": 16000},
                    "sentence": "नमस्ते",
                }
            ]
        )

    datasets.Audio = FakeAudio
    datasets.load_dataset = load_dataset
    transformers.WhisperProcessor = types.SimpleNamespace(
        from_pretrained=lambda *args, **kwargs: FakeProcessor()
    )

    monkeypatch.setitem(sys.modules, "datasets", datasets)
    monkeypatch.setitem(sys.modules, "transformers", transformers)
    return calls


def test_prepare_dataset_does_not_request_remote_code(fake_hf: Dict[str, Any]) -> None:
    data, processor = prepare_dataset(max_samples=1)

    assert "trust_remote_code" not in fake_hf["kwargs"]
    assert len(data) == 1
    assert data[0]["reference_text"] == "नमस्ते"
    assert data[0]["labels"] == [90, 91, 92, 10, 11, 99]
    assert isinstance(processor, FakeProcessor)


def test_prepare_dataset_raises_on_empty_slice(
    monkeypatch: pytest.MonkeyPatch, fake_hf: Dict[str, Any]
) -> None:
    def empty_load_dataset(*args: Any, **kwargs: Any) -> FakeDataset:
        return FakeDataset([])

    monkeypatch.setattr(sys.modules["datasets"], "load_dataset", empty_load_dataset)

    with pytest.raises(ValueError, match="No samples returned"):
        prepare_dataset(max_samples=1)
