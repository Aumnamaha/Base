# NeuroVoice Speech-to-Text 🎙️

Multilingual Whisper transcription with a FastAPI backend and a zero-build vanilla JS frontend.

## Architecture

- `Speech_X_Text/frontend/` — static UI (HTML/CSS/JS), deployable to Vercel.
- `Speech_X_Text/backend/` — Python AI logic and HTTP API.
  - `api.py` — `POST /transcribe` endpoint.
  - `config.py` — environment-driven settings.
  - `src/pipeline/infer.py` — cached Whisper ASR pipeline.
  - `src/data/prepare_data.py` — Common Voice preprocessing.
  - `scripts/train.py` — optional fine-tuning loop.
  - `tests/` — hermetic unit tests plus opt-in integration tests; sample clips live in `tests/samples/`.

Audio is transcribed by the backend you point the UI at. It is **not** processed inside the browser.

## Run locally

```bash
cd Speech_X_Text/backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
python api.py                      # starts http://127.0.0.1:8000
```

Then either double-click `Speech_X_Text/frontend/index.html`, or serve the folder:

```bash
cd Speech_X_Text/frontend
python -m http.server 5500
```

Both local modes automatically target `http://127.0.0.1:8000/transcribe`.

## Configuration

The backend reads environment variables directly; it does not auto-load `.env`. See `.env.example`
for the full list. Useful defaults:

| Variable | Default | Purpose |
|---|---|---|
| `NEUVOICE_HOST` | `0.0.0.0` | Bind address |
| `NEUVOICE_PORT` | `8000` | Bind port |
| `NEUVOICE_RELOAD` | `true` | Uvicorn auto-reload when running `python api.py` |
| `NEUVOICE_MODEL_ID` | `openai/whisper-small` | Hugging Face model id |
| `NEUVOICE_DEFAULT_LANGUAGE` | `en` | Default API language |
| `NEUVOICE_TRAINING_LANGUAGE` | `hi` | Language used by data prep/training |
| `NEUVOICE_ALLOWED_ORIGINS` | `*` | Comma-separated CORS allow-list (no credentials are used) |
| `NEUVOICE_MAX_STEPS` | `20` | Training smoke-test length |

For a deployed frontend, set the backend URL before `app.js` loads:

```html
<script>window.NEUVOICE_API_URL = "https://your-backend.example/transcribe";</script>
<script src="app.js"></script>
```

## API

`POST /transcribe` accepts multipart form data:

- `file` — audio upload (`audio/*`).
- `language` — one of `en`, `hi`, `bn`, `ta`, `te`, `mr`, or `auto`.

Response: `{"text": "...", "language": "hi"}`. `"language"` echoes the requested value; `auto`
lets Whisper detect the spoken language.

## Tests and linting

```bash
cd Speech_X_Text/backend
pytest
ruff check .
```

Unit tests mock Hugging Face and PyTorch, so they need no model downloads. The original tests
that hit Hugging Face and gated Common Voice data are opt-in:

```bash
NEUVOICE_RUN_INTEGRATION=1 pytest -m integration
```

You will need Hugging Face credentials with access to `mozilla-foundation/common_voice_11_0`.

## CI/CD pipelines

GitHub Actions workflows live in `.github/workflows/` and are scoped to the `Neuro-Voice` branch.

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | Push/PR to `Neuro-Voice`, or manual | Ruff, bytecode compile, hermetic pytest, notebook reproducibility check, JS syntax check |
| `docker.yml` | Tag `neurovoice-v*`, or manual | Builds the backend image and publishes it to GitHub Container Registry |
| `full-stack.yml` | Manual only | Installs the real ML stack, verifies every runtime import, smoke-tests `openai/whisper-tiny` through `transcribe_audio`, validates the Dockerfile, and optionally runs gated integration tests |
| `deploy-frontend.yml` | Manual only | Deploys `Speech_X_Text/frontend` to Vercel as preview or production |

CI uses `Speech_X_Text/backend/requirements-ci.txt` so it never downloads the multi-GB ML stack;
the unit tests stub PyTorch and Hugging Face.

Required secrets:

- `deploy-frontend.yml`: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- `full-stack.yml`: `HF_TOKEN` is optional and is only needed when triggering with
  `run_integration: true` (the account must have access to `mozilla-foundation/common_voice_11_0`).
- `docker.yml`: uses the built-in `GITHUB_TOKEN` (the workflow requests `packages: write`).

Build the backend image locally with:

```bash
docker build -t neurovoice-backend Speech_X_Text/backend
docker run --rm -p 8000:8000 neurovoice-backend
```

## Deployment notes

- **Frontend (Vercel):** set the Root Directory to `Speech_X_Text/frontend`, Framework Preset to
  *Other*, and inject `window.NEUVOICE_API_URL` as shown above.
- **Backend:** run from `Speech_X_Text/backend`:
  `uvicorn api:app --host 0.0.0.0 --port 10000`. Set `NEUVOICE_ALLOWED_ORIGINS` to your
  frontend's origin.
- **Avoid Render's free tier:** Whisper needs roughly 1.5–2 GB RAM to load, while that tier
  provides 512 MB and will crash with a port-scan timeout. Use a paid host or a free AI platform
  such as Hugging Face Spaces.
