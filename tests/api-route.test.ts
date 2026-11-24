import { describe, it, expect } from "bun:test";
import { POST, GET } from "@/app/api/sentiment/route";
import { NextRequest } from "next/server";

function createPostRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/sentiment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("Sentiment API Route Handler (/api/sentiment)", () => {
  describe("GET /api/sentiment", () => {
    it("should return API metadata and honest model description", async () => {
      const response = await GET();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.name).toBe("SentimentIQ API");
      expect(data.model).toBe("Lexicon-v1 (Rule-based heuristic)");
      expect(data.engine.name).toBe("lexicon-v1");
      expect(data.engine.type).toBe("rule-based");
    });
  });

  describe("POST /api/sentiment Validation", () => {
    it("should reject empty text with 400 Bad Request", async () => {
      const request = createPostRequest({ text: "" });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it("should reject whitespace-only text with 400 Bad Request", async () => {
      const request = createPostRequest({ text: "    " });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should reject missing text field with 400 Bad Request", async () => {
      const request = createPostRequest({ analysisType: "sentiment" });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should reject invalid analysisType with 400 Bad Request", async () => {
      const request = createPostRequest({
        text: "Valid text",
        analysisType: "unknown_mode_123",
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid analysisType");
    });

    it("should reject text exceeding 5000 characters with 400 Bad Request", async () => {
      const oversizedText = "a".repeat(5001);
      const request = createPostRequest({ text: oversizedText });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("5000 characters");
    });

    it("should succeed and return structured analysis for valid input", async () => {
      const request = createPostRequest({
        text: "This product is fantastic and super easy to use!",
        analysisType: "all",
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.results.sentiment.label).toBe("Positive");
      expect(data.metadata.model).toContain("Lexicon-v1 (Rule-based heuristic)");
    });
  });
});
