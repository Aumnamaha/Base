# SentimentIQ (Base Next.js Starter)

A modern full-stack web application starter featuring a dark "holographic" sentiment analysis dashboard built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Prisma ORM**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
  - [Health / Metadata Endpoint](#health--metadata-endpoint)
  - [Sentiment Analysis Endpoint](#sentiment-analysis-endpoint)
- [Testing](#testing)
- [CI/CD Pipelines](#cicd-pipelines)
- [Container Deployment](#container-deployment)
- [Project Structure](#project-structure)
- [Architecture & Roadmap](#architecture--roadmap)

---

## Features

- **Interactive Dashboard**: Real-time sentiment scoring, emotion breakdown, toxicity indicator with severity levels, and keyword frequency cloud with responsive UI and particles.
- **Multi-faceted Text Analysis Engine (`lexicon-v1`)**:
  - **Sentiment Scoring**: Rule-based lexicon with contextual negation handling (e.g., `"not good"`, `"wasn't happy"`), intensifiers (`"extremely"`, `"deeply"`), and confidence metrics.
  - **Context-Aware Safety / Moderation**: Severity tiers (`none`, `low`, `medium`, `high`) across categories (`threat`, `hateSpeech`, `harassment`, `profanity`). Benign idioms (`"killing time"`, `"to die for"`, `"what the hell"`) and enthusiastic all-caps (`"I LOVE THIS!"`) are protected against false positives.
  - **Emotion Radar**: Dominant emotion detection (`joy`, `anger`, `sadness`, `surprise`, `fear`, `disgust`, `trust`, `malice`).
  - **Keyword Extraction**: Top keywords with stop-word filtering.
- **Strict Validation**: Request validation with [Zod](https://zod.dev/) ensuring valid bounds, sanitized inputs, and structured error responses.
- **Production Build Ready**: Strict TypeScript type checks (`tsc --noEmit`), Next.js `reactStrictMode: true`, and clean ESLint rules.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI Library**: [React 19](https://react.dev/), [Lucide React](https://lucide.dev/), Radix UI primitives
- **Validation**: [Zod v4](https://zod.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & ORM**: [Prisma v6](https://www.prisma.io/) with SQLite
- **Runtime & Testing**: [Bun](https://bun.sh/) (unit testing & fast package management) / [Node.js](https://nodejs.org/) (v18+)

---

## Prerequisites

Ensure you have either **Bun** (>= 1.0) or **Node.js** (>= 18) installed:

```bash
bun --version
# or
node --version
npm --version
```

---

## Getting Started

### 1. Clone & Navigate to Project

```bash
cd /path/to/Base
```

### 2. Configure Environment Variables

Create `.env` based on `.env.example`:

```bash
cp .env.example .env
```

Default configuration:
```env
DATABASE_URL="file:./db/custom.db"
PORT=3000
```

### 3. Install Dependencies

Using Bun:
```bash
bun install
```

Using npm:
```bash
npm install
```

### 4. Generate Prisma Client

Generate the Prisma Client types:

```bash
bun run db:generate
# or
npm run db:generate
```

### 5. Run the Development Server

```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Bun | npm | Description |
|---|---|---|---|
| **dev** | `bun run dev` | `npm run dev` | Starts dev server on port 3000 |
| **build** | `bun run build` | `npm run build` | Creates production standalone build |
| **start** | `bun run start` | `npm run start` | Runs production standalone server |
| **lint** | `bun run lint` | `npm run lint` | Runs ESLint check across all code |
| **test** | `bun run test` | `npm test` | Runs the Bun unit test suite |
| **test:integration** | `bun run test:integration` | `npm run test:integration` | Runs integration tests against live server |
| **db:generate** | `bun run db:generate` | `npm run db:generate` | Generates Prisma client |
| **db:push** | `bun run db:push` | `npm run db:push` | Pushes schema directly to DB |
| **db:migrate** | `bun run db:migrate` | `npm run db:migrate` | Runs Prisma database migrations |

---

## API Reference

### Health / Metadata Endpoint

**`GET /api/sentiment`**

Returns API service metadata, engine details, and supported parameter definitions.

**Response (200 OK):**
```json
{
  "name": "SentimentIQ API",
  "version": "1.1.0",
  "description": "Multi-dimensional text sentiment, emotion, keyword, and safety analysis service.",
  "endpoints": {
    "POST /api/sentiment": {
      "description": "Analyze text sentiment",
      "body": {
        "text": "string (1-5000 chars, required)",
        "analysisType": "sentiment | emotion | keywords | toxicity | all (default: sentiment)"
      }
    },
    "GET /api/sentiment": {
      "description": "API specifications, metadata, and service health"
    }
  },
  "engine": {
    "name": "lexicon-v1",
    "version": "1.1.0",
    "type": "rule-based",
    "description": "Heuristic sentiment analyzer with contextual negation, intensifier weighting, and severity-tiered moderation."
  },
  "model": "Lexicon-v1 (Rule-based heuristic)"
}
```

---

### Sentiment Analysis Endpoint

**`POST /api/sentiment`**

Analyzes the input text according to the requested analysis mode.

**Request Body:**
```json
{
  "text": "I am so happy and having a fantastic day!",
  "analysisType": "all"
}
```

- `text` *(string, required)*: Input text (1 to 5000 characters).
- `analysisType` *(string, optional)*: One of `"sentiment"`, `"emotion"`, `"keywords"`, `"toxicity"`, or `"all"` (default: `"sentiment"`).

**Validation Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Please provide valid text for analysis.",
  "details": [
    {
      "field": "text",
      "message": "Please provide valid text for analysis."
    }
  ]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "text": "I am so happy and having a fantastic day!",
  "analysisType": "all",
  "results": {
    "sentiment": {
      "label": "Positive",
      "confidence": 0.99,
      "scores": {
        "positive": 1,
        "negative": 0
      },
      "wordCounts": {
        "positive": 2,
        "negative": 0
      }
    },
    "emotion": {
      "dominant": "joy",
      "emotions": {
        "joy": 1
      }
    },
    "keywords": [
      { "word": "fantastic", "frequency": 1 },
      { "word": "happy", "frequency": 1 },
      { "word": "day", "frequency": 1 }
    ],
    "toxicity": {
      "isToxic": false,
      "score": 0,
      "severity": "none",
      "flags": [],
      "categories": {
        "threat": false,
        "hateSpeech": false,
        "harassment": false,
        "profanity": false
      }
    }
  },
  "metadata": {
    "processingTime": "1ms",
    "wordCount": 8,
    "characterCount": 42,
    "model": "Lexicon-v1 (Rule-based heuristic)",
    "engine": {
      "name": "lexicon-v1",
      "version": "1.1.0",
      "type": "rule-based",
      "description": "Rule-based lexicon analyzer with contextual negation, intensifier weighting, and severity-tiered moderation."
    }
  }
}
```

---

## Testing

### Unit Test Suite
Runs unit tests for sentiment scoring, negation, intensifiers, sarcasm/contradiction cases, toxicity false-positive filters, and validation:

```bash
bun test
# or
bun run test
```

### Integration Test Runner
Runs tests against a live server:

```bash
# Start dev server in one terminal
bun run dev

# Run integration test runner in another terminal
bun run test:integration
# or
PORT=3000 node test-runner.js
```

---

## CI/CD Pipelines

Automated GitHub Actions workflow configured in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) triggers on every `push` and `pull_request` targeting `main`:

1. **Code Quality**: Runs ESLint (`bun run lint`) and TypeScript strict checking (`bun x tsc --noEmit`).
2. **Unit Tests**: Executes the Bun test suite (`bun test`) validating all scoring rules, negation, and moderation filters.
3. **Integration Tests**: Starts the local server and runs the end-to-end sentiment test runner (`bun run test:integration`).
4. **Standalone Production Build**: Compiles Next.js with Turbopack and build cache caching (`.next/cache`).
5. **Docker Build Check**: Verifies that the multi-stage production Docker container builds cleanly.

---

## Container Deployment

A multi-stage [Dockerfile](Dockerfile) creates a lightweight, unprivileged production container:

```bash
# Build the container image
docker build -t sentiment-iq:latest .

# Run the container
docker run -p 3000:3000 --env-file .env sentiment-iq:latest
```

The container runs an unprivileged `nextjs` system user with `node server.js` serving the compiled standalone output.

---

## Project Structure

```text
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI/CD pipeline
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── route.ts            # Root API route
│   │   │   └── sentiment/route.ts  # Sentiment analysis endpoint with Zod validation
│   │   ├── layout.tsx              # Root HTML & fonts layout
│   │   └── page.tsx                # Holographic sentiment dashboard UI
│   ├── components/ui/              # Radix + Tailwind UI components
│   └── lib/
│       ├── sentiment-engine.ts     # Core lexicon analysis & safety moderation engine
│       ├── db.ts                   # Prisma client singleton
│       └── utils.ts                # Styling & helper utilities
├── tests/
│   ├── sentiment-engine.test.ts    # Unit tests for scoring, negation, and moderation
│   └── api-route.test.ts           # Route handler validation & response tests
├── prisma/
│   ├── schema.prisma               # Prisma data schema
│   └── db/custom.db                # SQLite database file
├── Dockerfile                      # Multi-stage production container definition
├── .dockerignore                   # Docker build ignore patterns
├── test-runner.js                  # Integration test runner script
├── .env.example                    # Template environment variables
├── package.json                    # Project scripts & dependencies
└── tsconfig.json                   # TypeScript configuration
```

---

## Architecture & Roadmap

- [x] **Phase 0 (Runnable)**: Dependencies installed, Prisma generated, dev/build scripts verified, configurable integration test runner, README.md created.
- [x] **Phase 1 (Honesty & Correctness)**:
  - Zod request validation on `/api/sentiment`.
  - Honestly labeled engine as `Lexicon-v1 (Rule-based heuristic)`.
  - Severity-tiered toxicity detection with false positive protections (`"killing time"`, `"to die for"`, `"I LOVE THIS!"`).
  - Unit tests covering negation, intensifiers, false positives, and empty inputs (34/34 passing).
  - Strict type checking (`tsc --noEmit`) and strict ESLint rules enabled (`ignoreBuildErrors: false`, `reactStrictMode: true`).
- [ ] **Phase 2 (Production Hardening)**:
  - Production authentication (Auth.js v5).
  - Dedicated `AnalysisRecord` table with SQLite/PostgreSQL migrations to persist results.
  - Rate limiting, security headers, and structured logging.
- [ ] **Phase 3 (Product & Ops)**:
  - [x] GitHub Actions CI pipeline (.github/workflows/ci.yml) with lint, typecheck, unit test, integration test, standalone build, and Docker validation.
  - [x] Multi-stage minimal `Dockerfile` and `.dockerignore`.
  - Analysis history UI, charts, CSV/JSON export.
