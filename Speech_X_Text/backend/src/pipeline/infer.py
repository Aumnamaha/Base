import torch
from transformers import pipeline

def transcribe_audio(audio_path, model_id="openai/whisper-small", language="hi"):
    """
    Runs inference on an audio file using either the base model or our fine-tuned version.
    """
    print(f"Loading pipeline for {model_id}...")
    device = 0 if torch.cuda.is_available() else -1
    
    transcriber = pipeline(
        "automatic-speech-recognition", 
        model=model_id, 
        device=device,
        generate_kwargs={"language": f"<|{language}|>", "task": "transcribe"}
    )
    
    print(f"Transcribing {audio_path}...")
    result = transcriber(audio_path)
    
    return result["text"]

if __name__ == "__main__":
    import sys
    # For testing from command line:
    # python src/pipeline/infer.py path/to/audio.wav hi
    if len(sys.argv) < 2:
        print("Usage: python src/pipeline/infer.py <audio_path> [language_code]")
        sys.exit(1)
        
    path = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else "hi"
    
    # You can change model_id to "./models/whisper-finetuned-final" once trained
    text = transcribe_audio(path, language=lang)
    print("\nTranscription Result:")
    print("-" * 30)
    print(text)
    print("-" * 30)
