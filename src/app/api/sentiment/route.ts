import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  analyzeText,
  type AnalysisType,
} from "@/lib/sentiment-engine";

// ─────────────────────────────────────────────
// Request Validation Schema
// ─────────────────────────────────────────────

const requestSchema = z.object({
  text: z
    .string({ message: "Text must be a string." })
    .trim()
    .min(1, "Please provide valid text for analysis.")
    .max(5000, "Text exceeds maximum length of 5000 characters."),
  analysisType: z
    .enum(["sentiment", "emotion", "keywords", "toxicity", "all"], {
      message: "Invalid analysisType. Must be one of: sentiment, emotion, keywords, toxicity, all.",
    })
    .default("sentiment"),
});

// ─────────────────────────────────────────────
// Route Handlers
// ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body.",
        },
        { status: 400 }
      );
    }

    const parseResult = requestSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: issue?.message || "Invalid request parameters.",
          details: parseResult.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { text, analysisType } = parseResult.data;
    const responseData = analyzeText(text, analysisType as AnalysisType);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Sentiment API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "SentimentIQ API",
    version: "1.1.0",
    description: "Multi-dimensional text sentiment, emotion, keyword, and safety analysis service.",
    endpoints: {
      "POST /api/sentiment": {
        description: "Analyze text sentiment",
        body: {
          text: "string (1-5000 chars, required)",
          analysisType: "sentiment | emotion | keywords | toxicity | all (default: sentiment)",
        },
      },
      "GET /api/sentiment": {
        description: "API specifications, metadata, and service health",
      },
    },
    engine: {
      name: "lexicon-v1",
      version: "1.1.0",
      type: "rule-based",
      description: "Heuristic sentiment analyzer with contextual negation, intensifier weighting, and severity-tiered moderation.",
    },
    model: "Lexicon-v1 (Rule-based heuristic)",
  });
}
