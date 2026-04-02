from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil

# Make sure the paths load correctly since we moved folders
from src.pipeline.infer import transcribe_audio

app = FastAPI(title="NeuroVoice Speech-to-Text API")

# Allow CORS for the Vercel frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this to your Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/transcribe")
async def transcribe_endpoint(
    file: UploadFile = File(...),
    language: str = Form("en")
):
    """
    Receives an audio file from the frontend, saves it temporarily, 
    runs Whisper inference, and returns the transcribed text.
    """
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio format")

    temp_path = f"temp_{file.filename}"
    
    try:
        # Save file temporarily
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Run inference
        # Automatically detects if 'auto' is passed by setting language=None
        lang_arg = None if language == "auto" else language
        transcription = transcribe_audio(temp_path, language=lang_arg)
        
        return {"text": transcription, "language": language}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Cleanup temporary audio file
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    # Make sure to run inside the /backend directory
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
