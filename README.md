# SentimentIQ

A cinematic sentiment analysis dashboard built with Next.js + TypeScript + Tailwind CSS.

It analyzes text for:
- Sentiment (Positive / Negative / Neutral)
- Emotions
- Keywords
- Toxicity risk

The UI includes advanced interaction effects (cursor FX, click particles, floating layers, section motion), with automatic low-performance fallback for older hardware.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui components
- Lucide icons

## Features

- Real-time text analysis through API route
- Multiple analysis modes:
  - `sentiment`
  - `emotion`
  - `keywords`
  - `toxicity`
  - `all`
- Result dashboard with:
  - confidence metrics
  - progress bars
  - dominant emotion
  - toxicity flags
  - keyword chips
- Performance-aware rendering:
  - full effects on stronger devices
  - reduced but visible animation on low-end devices
- Reduced-motion accessibility support

## Project Structure

```text
src/
  app/
    page.tsx                  # Main UI and interaction logic
    globals.css               # Global styles, animations, cursor/parallax effects
    layout.tsx                # App shell and metadata
    api/
      sentiment/
        route.ts              # Analysis API endpoint
```

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Run in development

```bash
bunx next dev -p 3000
```

Then open:

```text
http://localhost:3000
```

> Note: `bun run dev` uses `tee` in the current script. If your shell does not have `tee`, use `bunx next dev -p 3000`.

### 3. Lint

```bash
bun run lint
```

### 4. Build

```bash
bun run build
```

## API

### POST `/api/sentiment`

Analyze text with a selected mode.

Request body:

```json
{
  "text": "Your input text",
  "analysisType": "all"
}
```

`analysisType` accepts:
- `sentiment`
- `emotion`
- `keywords`
- `toxicity`
- `all`

Response includes:
- `results.sentiment`
- `results.emotion` (when requested)
- `results.keywords` (when requested)
- `results.toxicity` (when requested)
- `metadata` (`processingTime`, `wordCount`, `characterCount`, `model`)

### GET `/api/sentiment`

Returns API metadata and endpoint description.

## Performance Notes

- The UI auto-detects lower-spec devices (for example older i3 laptops) and enables a lighter animation profile.
- Heavy effects like deep parallax and 3D tilt are reduced automatically in performance mode.
- A lightweight animated experience is still preserved.

## Git Quick Commands

Push latest changes:

```bash
git add .
git commit -m "Update SentimentIQ"
git push
```

## License

Private project (update this section if you plan to open-source it).
