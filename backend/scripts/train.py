"""Whisper fine-tuning entry point."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Union

import evaluate
import torch
from transformers import (
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    WhisperForConditionalGeneration,
)

from config import settings
from src.data.prepare_data import prepare_dataset

logger = logging.getLogger(__name__)


@dataclass
class DataCollatorSpeechSeq2SeqWithPadding:
    """Pad input features and labels, masking out padded label tokens."""

    processor: Any

    def __call__(
        self, features: List[Dict[str, Union[List[int], torch.Tensor]]]
    ) -> Dict[str, torch.Tensor]:
        input_features = [{"input_features": feature["input_features"]} for feature in features]
        batch = self.processor.feature_extractor.pad(input_features, return_tensors="pt")

        label_features = [{"input_ids": feature["labels"]} for feature in features]
        labels_batch = self.processor.tokenizer.pad(label_features, return_tensors="pt")

        labels = labels_batch["input_ids"].masked_fill(
            labels_batch.attention_mask.ne(1), -100
        )

        # BOS is added again by the model, so drop an existing one.
        if (labels[:, 0] == self.processor.tokenizer.bos_token_id).all().cpu().item():
            labels = labels[:, 1:]

        batch["labels"] = labels
        return batch


def _build_training_args(**kwargs: Any) -> Seq2SeqTrainingArguments:
    """Build training args across old and new Transformers keyword names."""
    for strategy_key in ("evaluation_strategy", "eval_strategy"):
        try:
            return Seq2SeqTrainingArguments(**{**kwargs, strategy_key: "steps"})
        except TypeError:
            continue
    raise RuntimeError("Could not configure evaluation strategy for this Transformers version")


def _build_trainer(feature_extractor: Any, **kwargs: Any) -> Seq2SeqTrainer:
    """Build a trainer across old and new Transformers keyword names."""
    for tokenizer_key in ("tokenizer", "processing_class"):
        try:
            return Seq2SeqTrainer(**{**kwargs, tokenizer_key: feature_extractor})
        except TypeError:
            continue
    raise RuntimeError("Could not configure the feature extractor for this Transformers version")


def train(
    model_id: str = settings.model_id,
    language: str = settings.training_language,
) -> None:
    """Fine-tune Whisper on a small Common Voice slice."""
    logger.info("Preparing training and validation data")
    train_data, processor = prepare_dataset(
        model_id, split="test", language=language, max_samples=64
    )
    val_data, _ = prepare_dataset(
        model_id, split="test", language=language, max_samples=16
    )

    logger.info("Loading model %s", model_id)
    model = WhisperForConditionalGeneration.from_pretrained(model_id)
    model.config.forced_decoder_ids = None
    model.config.suppress_tokens = []

    data_collator = DataCollatorSpeechSeq2SeqWithPadding(processor=processor)
    metric = evaluate.load("wer")

    def compute_metrics(pred: Any) -> Dict[str, float]:
        pred_ids = pred.predictions
        label_ids = pred.label_ids
        label_ids[label_ids == -100] = processor.tokenizer.pad_token_id

        pred_str = processor.tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
        label_str = processor.tokenizer.batch_decode(label_ids, skip_special_tokens=True)

        wer = 100 * metric.compute(predictions=pred_str, references=label_str)
        return {"wer": wer}

    training_args = _build_training_args(
        output_dir=settings.train_output_dir,
        per_device_train_batch_size=8,
        gradient_accumulation_steps=1,
        learning_rate=1e-5,
        warmup_steps=5,
        max_steps=settings.max_steps,
        gradient_checkpointing=True,
        fp16=torch.cuda.is_available(),
        per_device_eval_batch_size=8,
        predict_with_generate=True,
        generation_max_length=225,
        save_steps=10,
        eval_steps=10,
        logging_steps=5,
        report_to=["tensorboard"],
        load_best_model_at_end=True,
        metric_for_best_model="wer",
        greater_is_better=False,
        push_to_hub=False,
    )

    trainer = _build_trainer(
        feature_extractor=processor.feature_extractor,
        args=training_args,
        model=model,
        train_dataset=train_data,
        eval_dataset=val_data,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )

    logger.info("Starting training")
    trainer.train()

    logger.info("Saving final model to %s", settings.final_model_dir)
    trainer.save_model(settings.final_model_dir)
    processor.save_pretrained(settings.final_model_dir)


if __name__ == "__main__":
    import sys

    lang = sys.argv[1] if len(sys.argv) > 1 else settings.training_language
    train(language=lang)
