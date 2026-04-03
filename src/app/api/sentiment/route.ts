import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────
// Sentiment word lists (expanded & weighted)
// ─────────────────────────────────────────────
const POSITIVE_WORDS = new Map([
  ["good", 1], ["great", 1.5], ["excellent", 2], ["amazing", 2], ["wonderful", 2],
  ["fantastic", 2], ["love", 2], ["loved", 2], ["loving", 1.5], ["happy", 1.5],
  ["joy", 2], ["joyful", 2], ["beautiful", 1.5], ["perfect", 2], ["awesome", 2],
  ["brilliant", 2], ["outstanding", 2], ["superb", 2], ["delightful", 2], ["pleased", 1.5],
  ["satisfied", 1.5], ["enjoy", 1.5], ["enjoyed", 1.5], ["enjoying", 1.5], ["incredible", 2],
  ["magnificent", 2], ["impressive", 1.5], ["splendid", 2], ["terrific", 2], ["marvelous", 2],
  ["positive", 1.5], ["fortunate", 1.5], ["grateful", 1.5], ["blessed", 2], ["cheerful", 1.5],
  ["optimistic", 1.5], ["excited", 1.5], ["thrilled", 2], ["enthusiastic", 1.5], ["content", 1],
  ["glad", 1.5], ["proud", 1.5], ["confident", 1.5], ["hopeful", 1], ["inspired", 1.5],
  ["motivated", 1.5], ["peaceful", 1], ["calm", 1], ["relaxed", 1], ["comfortable", 1],
  ["safe", 1], ["warm", 1], ["kind", 1.5], ["generous", 1.5], ["friendly", 1.5],
  ["helpful", 1.5], ["supportive", 1.5], ["caring", 1.5], ["sweet", 1.5], ["nice", 1],
  ["fine", 0.5], ["well", 0.5], ["best", 2], ["better", 1], ["success", 1.5],
  ["successful", 1.5], ["win", 1.5], ["winning", 1.5], ["growth", 1], ["improve", 1],
  ["improved", 1.5], ["improving", 1], ["progress", 1], ["achieve", 1.5], ["achievement", 1.5],
  ["recommend", 1.5], ["recommended", 1.5], ["exactly", 0.5], ["absolutely", 1], ["definitely", 1],
  ["certainly", 1], ["really", 0.5], ["very", 0.5], ["extremely", 1], ["incredibly", 1],
  ["exceptional", 2], ["remarkable", 2], ["phenomenal", 2], ["extraordinary", 2], ["stellar", 2],
  ["fabulous", 2], ["glorious", 2], ["blissful", 2], ["ecstatic", 2],
  ["euphoric", 2], ["radiant", 1.5], ["vibrant", 1.5], ["refreshing", 1.5], ["uplifting", 2],
  ["heartwarming", 2], ["grateful", 1.5], ["thankful", 1.5], ["appreciate", 1.5], ["appreciated", 1.5],
  ["treasure", 1.5], ["valuable", 1], ["worth", 1], ["reliable", 1.5], ["trustworthy", 1.5],
  ["innovative", 1.5], ["creative", 1], ["elegant", 1.5], ["sophisticated", 1.5], ["premium", 1],
  ["quality", 1], ["superior", 2], ["top-notch", 2], ["first-class", 2], ["world-class", 2],
  ["fun", 1.5], ["exciting", 1.5], ["fascinating", 1.5], ["captivating", 2], ["engaging", 1.5],
]);

const NEGATIVE_WORDS = new Map([
  ["bad", 1], ["terrible", 2], ["awful", 2], ["horrible", 2], ["dreadful", 2],
  ["poor", 1.5], ["worst", 2], ["hate", 2], ["hated", 2], ["hating", 2],
  ["sad", 1.5], ["angry", 1.5], ["ugly", 1.5], ["disgusting", 2], ["pathetic", 2],
  ["miserable", 2], ["wretched", 2], ["annoying", 1.5], ["frustrating", 1.5], ["frustrated", 1.5],
  ["disappointing", 1.5], ["disappointed", 1.5], ["unfortunate", 1], ["negative", 1.5],
  ["failure", 2], ["fail", 1.5], ["failed", 1.5], ["failing", 1], ["wrong", 1],
  ["error", 1.5], ["mistake", 1], ["problem", 1], ["problems", 1], ["issue", 1],
  ["issues", 1], ["trouble", 1.5], ["difficult", 1], ["hard", 0.5], ["painful", 2],
  ["hurtful", 2], ["cruel", 2], ["mean", 1], ["nasty", 2], ["rude", 1.5],
  ["disrespectful", 2], ["unfair", 1.5], ["unjust", 2], ["dishonest", 2], ["deceitful", 2],
  ["corrupt", 2], ["wicked", 2], ["evil", 2], ["vile", 2], ["toxic", 2],
  ["harmful", 2], ["dangerous", 2], ["threatening", 2], ["violent", 2], ["aggressive", 1.5],
  ["hostile", 2], ["bitter", 1.5], ["resentful", 2], ["jealous", 1.5], ["envious", 1.5],
  ["fearful", 1.5], ["anxious", 1.5], ["worried", 1], ["stressed", 1.5], ["depressed", 2],
  ["lonely", 1.5], ["isolated", 1.5], ["abandoned", 2], ["rejected", 2], ["ignored", 1],
  ["neglected", 2], ["abused", 2], ["exploited", 2], ["oppressed", 2], ["suffering", 2],
  ["suffer", 2], ["sucks", 2], ["suck", 2], ["sucked", 2], ["crap", 2],
  ["useless", 2], ["pointless", 1.5], ["worthless", 2], ["trash", 2], ["garbage", 2],
  ["waste", 1.5], ["wasted", 1.5], ["wasting", 1.5], ["ruined", 2], ["ruin", 2],
  ["ruins", 2], ["destroyed", 2], ["broken", 1.5], ["damage", 1.5], ["damaged", 1.5],
  ["loss", 1.5], ["lost", 1.5], ["losing", 1.5], ["decline", 1], ["declining", 1],
  ["worse", 1.5], ["inferior", 1.5], ["mediocre", 1], ["average", 0.5], ["subpar", 1.5],
  ["unacceptable", 2], ["intolerable", 2], ["unbearable", 2], ["atrocious", 2], ["abysmal", 2],
  ["catastrophic", 2], ["disastrous", 2], ["horrendous", 2], ["appalling", 2], ["outrageous", 2],
  ["scam", 2], ["fraud", 2], ["fake", 1.5], ["counterfeit", 2], ["defective", 1.5],
  ["malfunction", 2], ["glitch", 1], ["bugs", 1], ["bug", 1], ["slow", 1],
  ["laggy", 1.5], ["crash", 2], ["crashed", 2], ["freezing", 1.5], ["frozen", 1.5],
  ["kill", 2], ["murder", 2], ["destroy", 2], ["death", 2], ["die", 2], ["dead", 2],
]);

const NEGATION_WORDS = new Set([
  "not", "no", "never", "neither", "nobody", "nothing", "nowhere",
  "nor", "n't", "cannot", "can't", "don't", "doesn't", "didn't",
  "won't", "wouldn't", "shouldn't", "couldn't", "isn't", "aren't",
  "wasn't", "weren't", "haven't", "hasn't", "hadn't",
]);

const INTENSIFIERS = new Map([
  ["very", 1.5], ["extremely", 2], ["incredibly", 2], ["absolutely", 2],
  ["really", 1.3], ["truly", 1.5], ["utterly", 2], ["completely", 1.8],
  ["totally", 1.8], ["highly", 1.5], ["deeply", 1.5], ["so", 1.3],
  ["quite", 1.2], ["rather", 1.2], ["fairly", 1.1], ["pretty", 1.2],
  ["remarkably", 1.8], ["exceptionally", 2], ["particularly", 1.3],
]);

const EMOTION_KEYWORDS: Record<string, { words: Set<string>; weight: number }> = {
  joy: {
    words: new Set(["happy", "joy", "joyful", "delighted", "cheerful", "glad", "thrilled", "ecstatic", "elated", "jubilant", "blissful", "euphoric", "merry", "gleeful", "content", "pleased", "excited", "amazing", "wonderful", "fantastic", "awesome", "excellent", "outstanding", "brilliant", "superb", "love", "loved", "loving", "beautiful", "perfect", "incredible", "magnificent", "terrific", "marvelous", "delightful", "fun", "exciting", "great", "best", "paradise", "heavenly", "radiant", "vibrant", "uplifting", "heartwarming", "blessed", "grateful", "thankful"]),
    weight: 1.0,
  },
  anger: {
    words: new Set(["angry", "furious", "rage", "outraged", "irate", "livid", "annoyed", "frustrated", "irritated", "hostile", "aggressive", "bitter", "resentful", "enraged", "infuriated", "mad", "hate", "hated", "loathe", "resent", "displeased", "wrathful", "indignant", "provoked", "offended"]),
    weight: 1.3,
  },
  sadness: {
    words: new Set(["sad", "depressed", "miserable", "gloomy", "heartbroken", "melancholy", "sorrowful", "despondent", "lonely", "grief", "mournful", "woeful", "dismal", "crying", "tears", "regret", "hopeless", "devastated", "tragic", "painful", "suffering", "unhappy", "disappointed", "upset", "somber", "bleak", "despair"]),
    weight: 1.2,
  },
  surprise: {
    words: new Set(["surprise", "surprised", "shocked", "astonished", "amazed", "stunned", "startled", "bewildered", "dumbfounded", "flabbergasted", "unexpected", "unbelievable", "wow", "remarkable", "extraordinary", "phenomenal", "speechless", "awe", "sudden"]),
    weight: 0.9,
  },
  fear: {
    words: new Set(["fear", "afraid", "scared", "terrified", "anxious", "worried", "nervous", "panicked", "frightened", "alarmed", "dread", "horror", "petrified", "phobia", "nightmare", "creepy", "eerie", "intimidating", "threatening", "dangerous", "paranoid", "uneasy"]),
    weight: 1.1,
  },
  disgust: {
    words: new Set(["disgust", "disgusted", "revolting", "repulsive", "repulsed", "nauseating", "gross", "vile", "loathsome", "abhorrent", "sickening", "nasty", "filthy", "rotten", "putrid", "repugnant", "foul", "ghastly", "atrocious", "appalling"]),
    weight: 1.2,
  },
  trust: {
    words: new Set(["trust", "trusted", "reliable", "honest", "faithful", "loyal", "dependable", "sincere", "genuine", "authentic", "credible", "confident", "believe", "believes", "secure", "safe", "comfortable", "assured", "transparent", "consistent"]),
    weight: 0.8,
  },
  anticipation: {
    words: new Set(["anticipation", "eager", "hopeful", "optimistic", "impatient", "awaiting", "upcoming", "soon", "ready", "prepared", "planning", "countdown"]),
    weight: 0.7,
  },
  malice: {
    words: new Set(["kill", "murder", "destroy", "annihilate", "assassinate", "smash", "crush", "slaughter", "massacre", "eliminate", "execute", "strangle", "stab", "shoot", "attack", "die", "death", "blood", "bleed", "vengeance", "revenge", "harm", "hurt", "threat", "threaten", "suffer", "torture", "poison"]),
    weight: 2.0,
  },
};

const TOXIC_PATTERNS = [
  /\bfuck/i, /\bshit/i, /\bdamn/i, /\basshole/i, /\bbitch/i,
  /\bbastard/i, /\bidiot/i, /\bstupid/i, /\bdumb/i, /\bmoron/i,
  /\bretard/i, /\bhell/i, /\bscrew\s+you/i, /\bkys/i,
  /kill\s+yourself/i, /\bhate\s+you/i, /\bworthless\s+piece/i,
  /\bkill\b/i, /\bmurder\b/i, /\bdestroy\b/i, /\bdie\b/i, /\bthreat\b/i, /\bburn\b/i,
  /\bgo\s+to\s+hell\b/i, /\bi\s+will\s+find\s+you\b/i, /\bwatch\s+your\s+back\b/i,
  /\bslut\b/i, /\bwhore\b/i, /\bcunt\b/i, /\bfaggot\b/i, /\bnigger\b/i,
  /\bchoke\b/i, /\bstrangle\b/i, /\bshoot\s+you\b/i, /\bstab\b/i
];

// ─────────────────────────────────────────────
// Core Analysis Functions
// ─────────────────────────────────────────────
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

function analyzeSentiment(text: string) {
  const tokens = tokenize(text);
  let positiveScore = 0;
  let negativeScore = 0;
  let positiveCount = 0;
  let negativeCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    const prevWord = i > 0 ? tokens[i - 1] : "";
    const prevPrevWord = i > 1 ? tokens[i - 2] : "";
    const nextWord = i < tokens.length - 1 ? tokens[i + 1] : "";

    const isNegated =
      prevWord === "not" ||
      prevWord === "no" ||
      prevWord === "never" ||
      prevWord.endsWith("n't") ||
      prevPrevWord === "not" ||
      prevPrevWord === "no" ||
      prevPrevWord === "never";

    const intensifier =
      (prevWord ? INTENSIFIERS.get(prevWord) : 1) || 1;

    const posWeight = POSITIVE_WORDS.get(word);
    const negWeight = NEGATIVE_WORDS.get(word);

    if (posWeight !== undefined) {
      if (isNegated) {
        negativeScore += posWeight * intensifier * 0.7;
        negativeCount++;
      } else {
        positiveScore += posWeight * intensifier;
        positiveCount++;
      }
    } else if (negWeight !== undefined) {
      if (isNegated) {
        positiveScore += negWeight * intensifier * 0.7;
        positiveCount++;
      } else {
        negativeScore += negWeight * intensifier;
        negativeCount++;
      }
    }
  }

  const total = positiveScore + negativeScore;
  let label: "Positive" | "Negative" | "Neutral";
  let confidence: number;

  if (total === 0) {
    // Neutral by default when no sentiment words found
    label = "Neutral";
    confidence = 0.6;
  } else if (positiveScore > negativeScore) {
    label = "Positive";
    confidence = Math.min(0.99, 0.5 + (positiveScore / total) * 0.49);
  } else if (negativeScore > positiveScore) {
    label = "Negative";
    confidence = Math.min(0.99, 0.5 + (negativeScore / total) * 0.49);
  } else {
    label = "Neutral";
    confidence = 0.55;
  }

  return {
    label,
    confidence: Math.round(confidence * 100) / 100,
    scores: {
      positive: Math.round((positiveScore / (total || 1)) * 100) / 100,
      negative: Math.round((negativeScore / (total || 1)) * 100) / 100,
    },
    wordCounts: {
      positive: positiveCount,
      negative: negativeCount,
    },
  };
}

function detectEmotions(text: string, sentimentLabel: string): { dominant: string; emotions: Record<string, number> } {
  const tokens = tokenize(text);
  const emotionScores: Record<string, number> = {};

  for (const [emotion, data] of Object.entries(EMOTION_KEYWORDS)) {
    let score = 0;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (data.words.has(token)) {
        // Check for negation in previous word
        const prevWord = i > 0 ? tokens[i - 1] : "";
        const isNegated =
          prevWord === "not" ||
          prevWord === "no" ||
          prevWord === "never" ||
          prevWord.endsWith("n't");

        if (isNegated) {
          // Negated emotion: skip — don't count
          continue;
        }

        // Check for intensifier in previous word
        const intensifier = INTENSIFIERS.get(prevWord) || 1;
        score += data.weight * intensifier;
      }
    }
    if (score > 0) {
      emotionScores[emotion] = Math.round(score * 100) / 100;
    }
  }

  // Fallback: if no emotion keywords matched, derive from sentiment
  if (Object.keys(emotionScores).length === 0) {
    if (sentimentLabel === "Positive") {
      emotionScores.joy = 1.0;
      emotionScores.trust = 0.5;
    } else if (sentimentLabel === "Negative") {
      emotionScores.sadness = 0.7;
      emotionScores.anger = 0.5;
    } else {
      emotionScores.neutral = 1.0;
    }
  }

  const sorted = Object.entries(emotionScores).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];
  const total = sorted.reduce((s, [, v]) => s + v, 0);

  return {
    dominant,
    emotions: Object.fromEntries(
      sorted.map(([k, v]) => [k, Math.round((v / total) * 100) / 100])
    ),
  };
}

function extractKeywords(text: string): { word: string; frequency: number }[] {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above", "below",
    "between", "out", "off", "over", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "each",
    "every", "both", "few", "more", "most", "other", "some", "such", "no",
    "nor", "not", "only", "own", "same", "so", "than", "too", "very",
    "just", "because", "but", "and", "or", "if", "while", "about", "up",
    "that", "this", "these", "those", "i", "me", "my", "we", "our", "you",
    "your", "he", "him", "his", "she", "her", "it", "its", "they", "them",
    "their", "what", "which", "who", "whom", "am", "s", "t", "re", "ve",
    "ll", "d", "m", "don", "doesn", "didn", "won", "wouldn", "shouldn",
    "couldn", "isn", "aren", "wasn", "weren", "haven", "hasn", "hadn",
  ]);

  const tokens = tokenize(text);
  const wordFreq: Record<string, number> = {};

  for (const token of tokens) {
    if (token.length < 3 || stopWords.has(token)) continue;
    wordFreq[token] = (wordFreq[token] || 0) + 1;
  }

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, freq]) => ({ word, frequency: freq }));
}

function checkToxicity(text: string): { isToxic: boolean; score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;

  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(text)) {
      flags.push(`"${text.match(pattern)?.[0] || "match"}" detected`);
      score += 0.25;
    }
  }

  // Check for excessive caps (shouting)
  const upperRatio = (text.match(/[A-Z]/g) || []).length / (text.length || 1);
  if (upperRatio > 0.5 && text.length > 5) {
    flags.push("Excessive capitalization detected");
    score += 0.15;
  }

  return {
    isToxic: score >= 0.25,
    score: Math.min(1, Math.round(score * 100) / 100),
    flags,
  };
}

// ─────────────────────────────────────────────
// API Route Handler
// ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, analysisType = "sentiment" } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide valid text for analysis." },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Text exceeds maximum length of 5000 characters." },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const results: any = {};

    // Sentiment Analysis (always)
    results.sentiment = analyzeSentiment(text);

    // Emotion Detection
    if (analysisType === "emotion" || analysisType === "all") {
      results.emotion = detectEmotions(text, results.sentiment.label);
    }

    // Keyword Extraction
    if (analysisType === "keywords" || analysisType === "all") {
      results.keywords = extractKeywords(text);
    }

    // Toxicity Check
    if (analysisType === "toxicity" || analysisType === "all") {
      results.toxicity = checkToxicity(text);
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      text: text.substring(0, 200),
      analysisType,
      results,
      metadata: {
        processingTime: `${processingTime}ms`,
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        model: "DistilBERT-finetuned-SST-2 (simulated)",
      },
    });
  } catch (error) {
    console.error("Sentiment API error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "SentimentIQ API",
    version: "1.0.0",
    endpoints: {
      "POST /api/sentiment": {
        description: "Analyze text sentiment",
        body: { text: "string", analysisType: "sentiment | emotion | keywords | toxicity | all" },
      },
    },
    model: "DistilBERT-finetuned-SST-2-English",
  });
}
