"""Network-dependent integration tests for the real Whisper/Common Voice stack.

Opt in with NEUVOICE_RUN_INTEGRATION=1 and a Hugging Face account that has access
to mozilla-foundation/common_voice_11_0.
"""

import os
import warnings

import pytest

warnings.filterwarnings("ignore", category=UserWarning)

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(
        os.getenv("NEUVOICE_RUN_INTEGRATION") != "1",
        reason="Set NEUVOICE_RUN_INTEGRATION=1 to run network-dependent tests",
    ),
]

from src.data.prepare_data import prepare_dataset  # noqa: E402


def test_data_preparation_pipeline() -> None:
    """Load 2 real samples and process them with the Whisper processor."""
    torch = pytest.importorskip("torch")
    data, processor = prepare_dataset(max_samples=2)

    assert len(data) == 2, "Should return 2 samples"
    sample = data[0]
    assert "input_features" in sample
    assert "labels" in sample
    assert isinstance(sample["input_features"], torch.Tensor)
    assert sample["input_features"].shape[0] == 80
    assert len(sample["labels"]) > 0, "Labels should not be empty"
    assert processor is not None


def test_whisper_tokenizer() -> None:
    from transformers import WhisperTokenizer

    tokenizer = WhisperTokenizer.from_pretrained(
        "openai/whisper-small", language="hi", task="transcribe"
    )
    tokens = tokenizer("नमस्ते दुनिया")
    assert "input_ids" in tokens
    assert len(tokens["input_ids"]) > 0
