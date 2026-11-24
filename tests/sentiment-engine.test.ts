import { describe, it, expect } from "bun:test";
import {
  analyzeSentiment,
  checkToxicity,
  detectEmotions,
  extractKeywords,
  analyzeText,
} from "@/lib/sentiment-engine";

describe("Sentiment Analysis Engine", () => {
  describe("Basic Sentiment Scoring", () => {
    it("should classify positive statements with high confidence", () => {
      const result = analyzeSentiment("I am so happy and having a fantastic day!");
      expect(result.label).toBe("Positive");
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.wordCounts.positive).toBeGreaterThanOrEqual(2);
      expect(result.wordCounts.negative).toBe(0);
    });

    it("should classify negative statements with high confidence", () => {
      const result = analyzeSentiment("This product sucks. I wasted my money. It's absolute garbage and I hate it.");
      expect(result.label).toBe("Negative");
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.wordCounts.negative).toBeGreaterThanOrEqual(3);
    });

    it("should classify neutral statements with default baseline confidence", () => {
      const result = analyzeSentiment("The package arrived on Tuesday afternoon by standard mail.");
      expect(result.label).toBe("Neutral");
      expect(result.scores.positive).toBe(0);
      expect(result.scores.negative).toBe(0);
    });
  });

  describe("Negation Handling", () => {
    it("should invert positive sentiment when negated with 'not'", () => {
      const positiveResult = analyzeSentiment("The service was good.");
      const negatedResult = analyzeSentiment("The service was not good.");

      expect(positiveResult.label).toBe("Positive");
      expect(negatedResult.label).toBe("Negative");
    });

    it("should invert positive sentiment with contraction 'wasn't'", () => {
      const result = analyzeSentiment("The meal wasn't great and the staff wasn't friendly.");
      expect(result.label).toBe("Negative");
    });

    it("should handle double-token negation like 'not really happy'", () => {
      const result = analyzeSentiment("I am not really happy with the outcome.");
      expect(result.label).toBe("Negative");
    });

    it("should flip negative words when negated ('not bad')", () => {
      const result = analyzeSentiment("The presentation was not bad at all.");
      expect(result.scores.positive).toBeGreaterThan(result.scores.negative);
    });
  });

  describe("Intensifiers", () => {
    it("should amplify positive sentiment weight with 'extremely' or 'incredibly'", () => {
      const regular = analyzeSentiment("This is good.");
      const intensified = analyzeSentiment("This is extremely good.");

      expect(intensified.confidence).toBeGreaterThanOrEqual(regular.confidence);
    });

    it("should amplify negative sentiment weight with 'deeply' or 'terribly'", () => {
      const regular = analyzeSentiment("I am sad.");
      const intensified = analyzeSentiment("I am deeply depressed and miserable.");

      expect(intensified.confidence).toBeGreaterThanOrEqual(regular.confidence);
      expect(intensified.wordCounts.negative).toBeGreaterThan(regular.wordCounts.negative);
    });
  });

  describe("Sarcasm-like & Ambivalent Expressions", () => {
    it("should capture negative polarity when positive words are negated", () => {
      const result = analyzeSentiment("I expected something decent, but the result was not good at all.");
      expect(result.label).toBe("Negative");
    });

    it("should detect conflict in mixed-polarity statements", () => {
      const result = analyzeSentiment("The design is beautiful but the performance is terrible.");
      expect(result.wordCounts.positive).toBeGreaterThanOrEqual(1);
      expect(result.wordCounts.negative).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Toxicity: False Positive Prevention", () => {
    it("should NOT flag enthusiastic all-caps positive text ('I LOVE THIS!')", () => {
      const result = checkToxicity("I LOVE THIS PRODUCT SO MUCH! WOW!");
      expect(result.isToxic).toBe(false);
      expect(result.severity).toBe("none");
      expect(result.categories.threat).toBe(false);
      expect(result.categories.harassment).toBe(false);
    });

    it("should NOT flag benign idioms containing 'kill' ('killing time')", () => {
      const result = checkToxicity("I am just killing time until the next train arrives.");
      expect(result.isToxic).toBe(false);
      expect(result.categories.threat).toBe(false);
    });

    it("should NOT flag benign idioms containing 'die' ('to die for')", () => {
      const result = checkToxicity("This chocolate cake is absolutely to die for!");
      expect(result.isToxic).toBe(false);
      expect(result.categories.threat).toBe(false);
    });

    it("should NOT flag benign colloquial expletives ('what the hell', 'hell yeah')", () => {
      const result = checkToxicity("What the hell, that was an awesome performance! Hell yeah!");
      expect(result.isToxic).toBe(false);
      expect(result.categories.threat).toBe(false);
      expect(result.categories.harassment).toBe(false);
    });

    it("should NOT flag non-harassing minor error remarks ('stupid mistake')", () => {
      const result = checkToxicity("I made a stupid mistake on line 42 of my code.");
      expect(result.isToxic).toBe(false);
      expect(result.categories.harassment).toBe(false);
    });
  });

  describe("Toxicity: True Positives & Severity Tiers", () => {
    it("should flag violent threats with HIGH severity", () => {
      const result = checkToxicity("I will kill you and destroy everything you love. Watch your back!");
      expect(result.isToxic).toBe(true);
      expect(result.severity).toBe("high");
      expect(result.categories.threat).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(0.7);
    });

    it("should flag indiscriminate threats with HIGH severity", () => {
      const result = checkToxicity("I will murder anyone who steps in my way, you hear me?");
      expect(result.isToxic).toBe(true);
      expect(result.severity).toBe("high");
      expect(result.categories.threat).toBe(true);
    });

    it("should flag self-harm incitement with HIGH severity", () => {
      const result = checkToxicity("Kill yourself right now.");
      expect(result.isToxic).toBe(true);
      expect(result.severity).toBe("high");
      expect(result.categories.threat).toBe(true);
    });

    it("should flag targeted personal harassment with MEDIUM severity", () => {
      const result = checkToxicity("You piece of worthless trash, go to hell!");
      expect(result.isToxic).toBe(true);
      expect(["medium", "high"]).toContain(result.severity);
      expect(result.categories.harassment).toBe(true);
    });

    it("should categorize mild expletives appropriately", () => {
      const result = checkToxicity("Damn, this task is taking longer than expected.");
      expect(result.categories.profanity).toBe(true);
      expect(result.categories.threat).toBe(false);
    });
  });

  describe("Emotion Detection", () => {
    it("should identify joy as dominant emotion for joyful statements", () => {
      const result = detectEmotions("I am so thrilled, joyful, and excited about this!", "Positive");
      expect(result.dominant).toBe("joy");
      expect(result.emotions.joy).toBeGreaterThan(0.5);
    });

    it("should identify sadness for lonely and depressed text", () => {
      const result = detectEmotions("I feel so lonely, abandoned, and depressed. Nobody cares.", "Negative");
      expect(result.dominant).toBe("sadness");
      expect(result.emotions.sadness).toBeGreaterThan(0);
    });

    it("should identify malice for violent threats", () => {
      const result = detectEmotions("I will murder anyone who gets in my way.", "Negative");
      expect(result.dominant).toBe("malice");
    });

    it("should identify surprise for unexpected events", () => {
      const result = detectEmotions("Wow, what an incredible and breathtaking surprise!", "Positive");
      expect(result.dominant).toBe("surprise");
    });
  });

  describe("Keyword Extraction", () => {
    it("should extract meaningful words and filter stop words", () => {
      const keywords = extractKeywords("The quick brown fox jumped over the lazy sleeping dog.");
      const words = keywords.map((k) => k.word);
      expect(words).toContain("quick");
      expect(words).toContain("brown");
      expect(words).not.toContain("the");
      expect(words).not.toContain("over");
    });
  });

  describe("Full Analysis & Engine Metadata", () => {
    it("should return honest model label and engine metadata", () => {
      const analysis = analyzeText("Antigravity is amazing!", "all");
      expect(analysis.success).toBe(true);
      expect(analysis.metadata.model).toContain("Lexicon-v1 (Rule-based heuristic)");
      expect(analysis.metadata.engine.type).toBe("rule-based");
      expect(analysis.metadata.engine.name).toBe("lexicon-v1");
      expect(analysis.results.sentiment).toBeDefined();
      expect(analysis.results.emotion).toBeDefined();
      expect(analysis.results.keywords).toBeDefined();
      expect(analysis.results.toxicity).toBeDefined();
    });
  });
});
