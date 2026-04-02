import sys
from datasets import load_dataset, Audio
from transformers import WhisperFeatureExtractor, WhisperTokenizer, WhisperProcessor

def prepare_dataset(model_id="openai/whisper-small", dataset_name="mozilla-foundation/common_voice_11_0", language="hi", split="test", max_samples=100):
    """
    Loads and prepares the dataset using HF Datasets and WhisperProcessor.
    This uses streaming=True by default to avoid large downloads, but then takes a slice.
    """
    print(f"Loading processor for {model_id}...")
    processor = WhisperProcessor.from_pretrained(model_id, language=language, task="transcribe")
    
    print(f"Loading {dataset_name} for language: {language}, split: {split}")
    # Load dataset in streaming mode to avoid massive downloads during debugging
    ds = load_dataset(dataset_name, language, split=split, streaming=True, trust_remote_code=True)
    
    # Cast audio column to 16kHz
    ds = ds.cast_column("audio", Audio(sampling_rate=16000))

    # Take a small subset to verify the pipeline
    print(f"Taking {max_samples} samples...")
    sample_ds = list(ds.take(max_samples))
    
    # Process the audio array into log-mel spectrogram and text into tokens
    processed_data = []
    
    for item in sample_ds:
        audio = item["audio"]
        sentence = item["sentence"]
        
        # Prepare audio features
        input_features = processor.feature_extractor(
            audio["array"], 
            sampling_rate=audio["sampling_rate"], 
            return_tensors="pt"
        ).input_features[0]

        # Prepare labels
        labels = processor.tokenizer(sentence).input_ids

        processed_data.append({
            "input_features": input_features,
            "labels": labels,
            "reference_text": sentence
        })
        
    print(f"Successfully processed {len(processed_data)} samples.")
    return processed_data, processor

if __name__ == "__main__":
    # Test execution
    print("Testing Dataset Preparation script...")
    docs, processor = prepare_dataset(max_samples=5)
    print("Sample feature shape:", docs[0]["input_features"].shape)
    print("Sample labels:", docs[0]["labels"][:10])
    print("Sample reference:", docs[0]["reference_text"])
