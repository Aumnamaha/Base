# NeuroVoice Speech-to-Text 🎙️

A beautiful, multilingual Speech-To-Text application powered by a fine-tuned OpenAI Whisper AI module. This project splits a heavy Python Machine Learning brain from a lightweight, lightning-fast web browser frontend.

## 🌟 Features
- Modern UI: Full vanilla JS/HTML/CSS implementation featuring a stunning dark mode glassmorphism design.
- FastAPI Backend: A highly advanced REST API connecting the frontend directly to PyTorch.
- Multilingual: Supports seamless transcription across major global and regional languages.
- Zero OS Dependencies: Custom injected `librosa` array mapping bypasses the standard Windows `FFMPEG` pipeline requirements natively!

## 🏗️ Project Architecture
- `frontend/` - Contains everything needed for the Web UI. Deployed easily to Vercel.
- `backend/` - Contains the Python AI logic, Uvicorn server, and ML model inference codes.

---

## 🚀 Deployment Guide

### 1. Frontend (Vercel)
Vercel is perfect for the HTML/JS frontend because it deploys instantly.
1. Push this repository to your GitHub.
2. Go to [Vercel.com](https://vercel.com/) and click Add New Project.
3. Import your GitHub repository.
4. CRITICAL SETTINGS:
   - Root Directory: Click Edit, and perfectly type `frontend`
   - Framework Preset: Set to Other
   - Include files outside Root Directory...: Toggle this to OFF
5. Click Save and Deploy!
   
### 2. Backend (Hosting the AI)
⚠️ CRITICAL WARNING REGARDING RENDER.COM: 
OpenAI's Whisper model requires approximately 1.5GB to 2GB of RAM to load into active memory. Render.com's FREE tier only gives you 512MB RAM. If you attempt to deploy this to Render's free tier, the invisible computer will completely run out of memory, freeze, and throw a "Port scan timeout reached" crash. 

To host the backend publicly for free, you must use a dedicated AI cloud platform like Hugging Face Spaces (which provides 16GB free RAM), or use a paid tier.
Start Command: `uvicorn api:app --host 0.0.0.0 --port 10000`

---

## 💻 Running Locally (Highly Recommended)

Because modern personal desktop computers and laptops have excellent CPU and RAM hardware, running the environment locally is the absolute best way to experience the project.

### Step 1: Open Terminal & Activate Environment
Open PowerShell or VS Code Terminal inside your project folder.
```bash
python -m venv .venv
.venv\Scripts\activate
```

### Step 2: Install the AI Brain
Download the 2+ GB required to run PyTorch and HuggingFace locally:
```bash
pip install -r requirements.txt
```

### Step 3: Start the Backend Server
Wake up the FastAPI python server using your local environment.
```bash
python backend/api.py
```
Wait until you see `Application startup complete` in your terminal!

### Step 4: Open the Website!
Since the website is pure HTML, you don't even need a web server! Just open your standard Windows File Explorer, navigate into the `frontend` folder, and double-click `index.html` to open it natively in Google Chrome or Edge. 

Drag and drop an audio file into the box, click transcribe, and the Javascript will automatically detect that you are running locally and route the audio directly into your waiting terminal for instant results!
