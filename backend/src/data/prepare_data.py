"""Dataset preparation for Whisper fine-tuning and evaluation."""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Tuple

from config import settings

logger = logging.getLogger(__name__)


def prepare_dataset(
    model_id: str = settings.model_id,
    dataset_name: str = "mozilla-foundation/common_voice_11_0",
    language: str = settings.training_language,
    split: str = "test",
    max_samples: int = 100,
) -> Tuple[List[Dict[str, Any]], Any]:
    """Load a streaming dataset slice and convert it to Whisper-ready features."""
    from datasets import Audio, load_dataset
    from transformers import WhisperProcessor

    logger.info("Loading processor for %s", model_id)
    processor = WhisperProcessor.from_pretrained(
        model_id, language=language, task="transcribe"
    )

    logger.info("Streaming %s (%s) split=%s", dataset_name, language, split)
    ds = load_dataset(dataset_name, language, split=split, streaming=True)
    ds = ds.cast_column("audio", Audio(sampling_rate=16000))

    sample_ds = list(ds.take(max_samples))
    if not sample_ds:
        raise ValueError(f"No samples returned for {dataset_name}/{language} ({split})")

    processed_data: List[Dict[str, Any]] = []
    for item in sample_ds:
        audio = item["audio"]
        sentence = item["sentence"]

        input_features = processor.feature_extractor(
            audio["array"],
            sampling_rate=audio["sampling_rate"],
            return_tensors="pt",
        ).input_features[0]
        labels = processor.tokenizer(sentence).input_ids

        processed_data.append(
            {
                "input_features": input_features,
                "labels": labels,
                "reference_text": sentence,
            }
        )

    logger.info("Successfully processed %d samples", len(processed_data))
    return processed_data, processor


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    docs, processor = prepare_dataset(max_samples=5)
    print("Sample feature shape:", docs[0]["input_features"].shape)
    print("Sample labels:", docs[0]["labels"][:10])
    print("Sample reference:", docs[0]["reference_text"])
