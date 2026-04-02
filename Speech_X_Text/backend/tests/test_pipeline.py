import pytest
import torch
import warnings
# Filter UserWarnings from datasets which occur commonly
warnings.filterwarnings("ignore", category=UserWarning)

from src.data.prepare_data import prepare_dataset

def test_data_preparation_pipeline():
    """
    Tests if the pipeline can successfully load 2 samples of audio
    and process them using Whisper processor.
    """
    try:
        data, processor = prepare_dataset(max_samples=2)
    except Exception as e:
        pytest.fail(f"Dataset preparation failed: {e}")

    assert len(data) == 2, "Should return 2 samples"
    
    sample = data[0]
    
    # Check features and labels exist
    assert "input_features" in sample
    assert "labels" in sample
    
    # Check tensor properties
    assert isinstance(sample["input_features"], torch.Tensor)
    
    # In small model, whisper features dim is 80 (log mel spectrogram)
    assert sample["input_features"].shape[0] == 80  
    
    assert len(sample["labels"]) > 0, "Labels should not be empty"

def test_whisper_tokenizer():
    from transformers import WhisperTokenizer
    tokenizer = WhisperTokenizer.from_pretrained("openai/whisper-small", language="hi", task="transcribe")
    tokens = tokenizer("नमस्ते दुनिया")
    assert "input_ids" in tokens
    assert len(tokens["input_ids"]) > 0
