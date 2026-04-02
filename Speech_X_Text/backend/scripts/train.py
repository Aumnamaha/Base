import os
import evaluate
import numpy as np
import torch
from dataclasses import dataclass
from typing import Any, Dict, List, Union
from transformers import (
    WhisperForConditionalGeneration,
    WhisperProcessor,
    Seq2SeqTrainingArguments,
    Seq2SeqTrainer,
)

# We import the data prep function we just made
from src.data.prepare_data import prepare_dataset

@dataclass
class DataCollatorSpeechSeq2SeqWithPadding:
    processor: Any

    def __call__(self, features: List[Dict[str, Union[List[int], torch.Tensor]]]) -> Dict[str, torch.Tensor]:
        input_features = [{"input_features": feature["input_features"]} for feature in features]
        batch = self.processor.feature_extractor.pad(input_features, return_tensors="pt")

        label_features = [{"input_ids": feature["labels"]} for feature in features]
        labels_batch = self.processor.tokenizer.pad(label_features, return_tensors="pt")

        labels = labels_batch["input_ids"].masked_fill(labels_batch.attention_mask.ne(1), -100)
        
        # if bos token is appended in previous tokenization step,
        # cut bos token here as it's append later anyways
        if (labels[:, 0] == self.processor.tokenizer.bos_token_id).all().cpu().item():
            labels = labels[:, 1:]

        batch["labels"] = labels
        return batch

def train(model_id="openai/whisper-small", language="hi"):
    print("Preparing training and validation data...")
    # NOTE: In reality, we'll want train split. Using test split for dummy test.
    train_data, processor = prepare_dataset(model_id, split="test", language=language, max_samples=64)
    val_data, _ = prepare_dataset(model_id, split="test", language=language, max_samples=16)

    print("Loading model...")
    model = WhisperForConditionalGeneration.from_pretrained(model_id)
    
    # Required parameters for fine-tuning
    model.config.forced_decoder_ids = None
    model.config.suppress_tokens = []
    
    data_collator = DataCollatorSpeechSeq2SeqWithPadding(processor=processor)

    metric = evaluate.load("wer")

    def compute_metrics(pred):
        pred_ids = pred.predictions
        label_ids = pred.label_ids
        label_ids[label_ids == -100] = processor.tokenizer.pad_token_id

        pred_str = processor.tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
        label_str = processor.tokenizer.batch_decode(label_ids, skip_special_tokens=True)

        wer = 100 * metric.compute(predictions=pred_str, references=label_str)
        return {"wer": wer}

    training_args = Seq2SeqTrainingArguments(
        output_dir="./models/whisper-finetuned",
        per_device_train_batch_size=8,
        gradient_accumulation_steps=1,
        learning_rate=1e-5,
        warmup_steps=5,
        max_steps=20, # Dummy size to verify it trains
        gradient_checkpointing=True,
        fp16=True if torch.cuda.is_available() else False,
        evaluation_strategy="steps",
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

    trainer = Seq2SeqTrainer(
        args=training_args,
        model=model,
        train_dataset=train_data,
        eval_dataset=val_data,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
        tokenizer=processor.feature_extractor,
    )

    print("Starting training...")
    trainer.train()
    
    print("Training complete. Saving Final Model...")
    trainer.save_model("./models/whisper-finetuned-final")
    processor.save_pretrained("./models/whisper-finetuned-final")

if __name__ == "__main__":
    import sys
    lang = sys.argv[1] if len(sys.argv) > 1 else 'hi'
    train(language=lang)
