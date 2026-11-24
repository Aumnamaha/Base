// ─────────────────────────────────────────────
// Sentiment & Text Analysis Engine (Lexicon v1)
// ─────────────────────────────────────────────

export interface SentimentResult {
  label: "Positive" | "Negative" | "Neutral";
  confidence: number;
  scores: {
    positive: number;
    negative: number;
  };
  wordCounts: {
    positive: number;
    negative: number;
  };
}

export interface EmotionResult {
  dominant: string;
  emotions: Record<string, number>;
}

export interface KeywordResult {
  word: string;
  frequency: number;
}

export type ToxicitySeverity = "none" | "low" | "medium" | "high";

export interface ToxicityResult {
  isToxic: boolean;
  score: number;
  severity: ToxicitySeverity;
  flags: string[];
  categories: {
    threat: boolean;
    hateSpeech: boolean;
    harassment: boolean;
    profanity: boolean;
  };
}

export type AnalysisType = "sentiment" | "emotion" | "keywords" | "toxicity" | "all";

export interface AnalysisResults {
  sentiment?: SentimentResult;
  emotion?: EmotionResult;
  keywords?: KeywordResult[];
  toxicity?: ToxicityResult;
}

export interface EngineMetadata {
  processingTime: string;
  wordCount: number;
  characterCount: number;
  model: string;
  engine: {
    name: string;
    version: string;
    type: "rule-based" | "hybrid" | "neural";
    description: string;
  };
}

export interface AnalysisResponseData {
  success: boolean;
  text: string;
  analysisType: AnalysisType;
  results: AnalysisResults;
  metadata: EngineMetadata;
}

// ─────────────────────────────────────────────
// Word lists and weights
// ─────────────────────────────────────────────

export const POSITIVE_WORDS = new Map<string, number>([
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
  ["heartwarming", 2], ["thankful", 1.5], ["appreciate", 1.5], ["appreciated", 1.5],
  ["treasure", 1.5], ["valuable", 1], ["worth", 1], ["reliable", 1.5], ["trustworthy", 1.5],
  ["innovative", 1.5], ["creative", 1], ["elegant", 1.5], ["sophisticated", 1.5], ["premium", 1],
  ["quality", 1], ["superior", 2], ["top-notch", 2], ["first-class", 2], ["world-class", 2],
  ["fun", 1.5], ["exciting", 1.5], ["fascinating", 1.5], ["captivating", 2], ["engaging", 1.5],
]);

export const NEGATIVE_WORDS = new Map<string, number>([
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
  ["suffer", 2], ["sucks", 2], ["suck", 2], ["sucked", 2], ["crap", 1.5],
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

export const NEGATION_WORDS = new Set<string>([
  "not", "no", "never", "neither", "nobody", "nothing", "nowhere",
  "nor", "cannot", "can't", "don't", "doesn't", "didn't",
  "won't", "wouldn't", "shouldn't", "couldn't", "isn't", "aren't",
  "wasn't", "weren't", "haven't", "hasn't", "hadn't", "hardly", "barely",
]);

export const INTENSIFIERS = new Map<string, number>([
  ["very", 1.5], ["extremely", 2], ["incredibly", 2], ["absolutely", 2],
  ["really", 1.3], ["truly", 1.5], ["utterly", 2], ["completely", 1.8],
  ["totally", 1.8], ["highly", 1.5], ["deeply", 1.5], ["so", 1.3],
  ["quite", 1.2], ["rather", 1.2], ["fairly", 1.1], ["pretty", 1.2],
  ["remarkably", 1.8], ["exceptionally", 2], ["particularly", 1.3],
]);

export const EMOTION_KEYWORDS: Record<string, { words: Set<string>; weight: number }> = {
  joy: {
    words: new Set([
      "happy", "joy", "joyful", "delighted", "cheerful", "glad", "thrilled", "ecstatic",
      "elated", "jubilant", "blissful", "euphoric", "merry", "gleeful", "content", "pleased",
      "excited", "amazing", "wonderful", "fantastic", "awesome", "excellent", "outstanding",
      "brilliant", "superb", "love", "loved", "loving", "beautiful", "perfect", "incredible",
      "magnificent", "terrific", "marvelous", "delightful", "fun", "great", "best",
      "radiant", "vibrant", "uplifting", "heartwarming", "blessed", "grateful", "thankful"
    ]),
    weight: 1.0,
  },
  anger: {
    words: new Set([
      "angry", "furious", "rage", "outraged", "irate", "livid", "annoyed", "frustrated",
      "irritated", "hostile", "aggressive", "bitter", "resentful", "enraged", "infuriated",
      "mad", "hate", "hated", "loathe", "resent", "displeased", "wrathful", "indignant"
    ]),
    weight: 1.3,
  },
  sadness: {
    words: new Set([
      "sad", "depressed", "miserable", "gloomy", "heartbroken", "melancholy", "sorrowful",
      "despondent", "lonely", "grief", "mournful", "woeful", "dismal", "crying", "tears",
      "regret", "hopeless", "devastated", "tragic", "painful", "suffering", "unhappy",
      "disappointed", "upset", "somber", "bleak", "despair"
    ]),
    weight: 1.2,
  },
  surprise: {
    words: new Set([
      "surprise", "surprised", "shocked", "astonished", "amazed", "stunned", "startled",
      "bewildered", "dumbfounded", "flabbergasted", "unexpected", "unbelievable", "wow",
      "remarkable", "extraordinary", "phenomenal", "speechless", "awe", "sudden"
    ]),
    weight: 0.9,
  },
  fear: {
    words: new Set([
      "fear", "afraid", "scared", "terrified", "anxious", "worried", "nervous", "panicked",
      "frightened", "alarmed", "dread", "horror", "petrified", "phobia", "nightmare",
      "creepy", "eerie", "intimidating", "threatening", "dangerous", "paranoid", "uneasy"
    ]),
    weight: 1.1,
  },
  disgust: {
    words: new Set([
      "disgust", "disgusted", "revolting", "repulsive", "repulsed", "nauseating", "gross",
      "vile", "loathsome", "abhorrent", "sickening", "nasty", "filthy", "rotten", "putrid",
      "repugnant", "foul", "ghastly", "atrocious", "appalling"
    ]),
    weight: 1.2,
  },
  trust: {
    words: new Set([
      "trust", "trusted", "reliable", "honest", "faithful", "loyal", "dependable",
      "sincere", "genuine", "authentic", "credible", "confident", "believe", "believes",
      "secure", "safe", "comfortable", "assured", "transparent", "consistent"
    ]),
    weight: 0.8,
  },
  anticipation: {
    words: new Set([
      "anticipation", "eager", "hopeful", "optimistic", "impatient", "awaiting",
      "upcoming", "soon", "ready", "prepared", "planning", "countdown"
    ]),
    weight: 0.7,
  },
  malice: {
    words: new Set([
      "kill", "destroy", "murder", "slaughter", "massacre", "eliminate", "execute", "strangle",
      "stab", "shoot", "blood", "bleed", "vengeance", "revenge", "threaten", "torture", "poison"
    ]),
    weight: 2.0,
  },
};

// ─────────────────────────────────────────────
// Tokenization & Negation Helpers
// ─────────────────────────────────────────────

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

function isNegationToken(token: string): boolean {
  if (NEGATION_WORDS.has(token)) return true;
  if (token.endsWith("n't")) return true;
  return false;
}

// ─────────────────────────────────────────────
// Sentiment Analysis
// ─────────────────────────────────────────────

function cleanTextForSentiment(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/\b(?:to|would)\s+die\s+for\b/gi, "delicious");
  cleaned = cleaned.replace(/\b(?:kill|killed|killing)\s+it\b/gi, "great");
  cleaned = cleaned.replace(/\bwhat\s+the\s+hell\b/gi, "wow");
  cleaned = cleaned.replace(/\bhell\s+(?:yeah|yes)\b/gi, "yes definitely");
  cleaned = cleaned.replace(/\b(?:kill|killing)\s+time\b/gi, "waiting");
  return cleaned;
}

export function analyzeSentiment(text: string): SentimentResult {
  const cleanedText = cleanTextForSentiment(text);
  const tokens = tokenize(cleanedText);
  let positiveScore = 0;
  let negativeScore = 0;
  let positiveCount = 0;
  let negativeCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    const prevWord = i > 0 ? tokens[i - 1] : "";
    const prevPrevWord = i > 1 ? tokens[i - 2] : "";

    const isNegated = isNegationToken(prevWord) || isNegationToken(prevPrevWord);
    const intensifier = (prevWord ? INTENSIFIERS.get(prevWord) : 1) || 1;

    const posWeight = POSITIVE_WORDS.get(word);
    const negWeight = NEGATIVE_WORDS.get(word);

    if (posWeight !== undefined) {
      if (isNegated) {
        // Negated positive e.g. "not good" counts toward negative
        negativeScore += posWeight * intensifier * 0.75;
        negativeCount++;
      } else {
        positiveScore += posWeight * intensifier;
        positiveCount++;
      }
    } else if (negWeight !== undefined) {
      if (isNegated) {
        // Negated negative e.g. "not bad" counts slightly toward positive
        positiveScore += negWeight * intensifier * 0.75;
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

// ─────────────────────────────────────────────
// Emotion Detection
// ─────────────────────────────────────────────

export function detectEmotions(
  text: string,
  sentimentLabel: string
): EmotionResult {
  const cleanedText = cleanTextForSentiment(text);
  const tokens = tokenize(cleanedText);
  const emotionScores: Record<string, number> = {};

  for (const [emotion, data] of Object.entries(EMOTION_KEYWORDS)) {
    let score = 0;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (data.words.has(token)) {
        const prevWord = i > 0 ? tokens[i - 1] : "";
        if (isNegationToken(prevWord)) {
          continue; // Negated emotion skipped
        }
        const intensifier = INTENSIFIERS.get(prevWord) || 1;
        score += data.weight * intensifier;
      }
    }
    if (score > 0) {
      emotionScores[emotion] = Math.round(score * 100) / 100;
    }
  }

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

// ─────────────────────────────────────────────
// Keyword Extraction
// ─────────────────────────────────────────────

const STOP_WORDS = new Set<string>([
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

export function extractKeywords(text: string): KeywordResult[] {
  const tokens = tokenize(text);
  const wordFreq: Record<string, number> = {};

  for (const token of tokens) {
    if (token.length < 3 || STOP_WORDS.has(token)) continue;
    wordFreq[token] = (wordFreq[token] || 0) + 1;
  }

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, freq]) => ({ word, frequency: freq }));
}

// ─────────────────────────────────────────────
// Toxicity Detection with Context & Severity
// ─────────────────────────────────────────────

interface ToxicityPattern {
  regex: RegExp;
  category: "threat" | "hateSpeech" | "harassment" | "profanity";
  severity: "high" | "medium" | "low";
  weight: number;
  label: string;
}

// Benign idioms that contain sensitive words but are not toxic
const BENIGN_IDIOM_PATTERNS: RegExp[] = [
  /\bkilling\s+time\b/i,
  /\bkill\s+time\b/i,
  /\bkill\s+it\b/i,
  /\bkilled\s+it\b/i,
  /\bto\s+die\s+for\b/i,
  /\bwould\s+die\s+for\b/i,
  /\bdying\s+to\s+see\b/i,
  /\bdying\s+of\s+laughter\b/i,
  /\bwhat\s+the\s+hell\b/i,
  /\bhell\s+yeah\b/i,
  /\bhell\s+yes\b/i,
  /\bshot\s+in\s+the\s+dark\b/i,
  /\bshot\s+at\s+goal\b/i,
  /\bdead\s+serious\b/i,
  /\bdead\s+tired\b/i,
  /\bstupid\s+(?:mistake|error|typo|bug)\b/i,
];

const TOXICITY_RULES: ToxicityPattern[] = [
  // High-severity threats
  {
    regex: /\b(?:i\s+will|i'll|gonna|going\s+to)\s+(?:kill|murder|slaughter|shoot|stab|destroy)\s+(?:you|everyone|all\s+of\s+you)\b/i,
    category: "threat",
    severity: "high",
    weight: 0.85,
    label: "Direct violent threat",
  },
  {
    regex: /\b(?:i\s+will|i'll|gonna)\s+murder\s+anyone\b/i,
    category: "threat",
    severity: "high",
    weight: 0.85,
    label: "Indiscriminate violent threat",
  },
  {
    regex: /\b(?:kill\s+yourself|kys)\b/i,
    category: "threat",
    severity: "high",
    weight: 0.95,
    label: "Self-harm incitement",
  },
  {
    regex: /\bwatch\s+your\s+back\b/i,
    category: "threat",
    severity: "high",
    weight: 0.6,
    label: "Intimidation threat",
  },
  {
    regex: /\bi\s+will\s+find\s+you\b/i,
    category: "threat",
    severity: "high",
    weight: 0.6,
    label: "Stalking threat",
  },
  {
    regex: /\b(?:murder|slaughter|execute)\b/i,
    category: "threat",
    severity: "high",
    weight: 0.5,
    label: "Violent language",
  },

  // Hate Speech (high severity)
  {
    regex: /\b(?:nigger|faggot|cunt|slut|whore)\b/i,
    category: "hateSpeech",
    severity: "high",
    weight: 0.9,
    label: "Hate speech / slur",
  },

  // Targeted Harassment / Severe Insults (medium severity)
  {
    regex: /\b(?:you\s+piece\s+of\s+worthless\s+trash|worthless\s+piece\s+of\s+trash)\b/i,
    category: "harassment",
    severity: "medium",
    weight: 0.6,
    label: "Severe targeted insult",
  },
  {
    regex: /\bgo\s+to\s+hell\b/i,
    category: "harassment",
    severity: "medium",
    weight: 0.45,
    label: "Hostile harassment",
  },
  {
    regex: /\b(?:screw\s+you|fuck\s+you|hate\s+you)\b/i,
    category: "harassment",
    severity: "medium",
    weight: 0.5,
    label: "Targeted hostility",
  },
  {
    regex: /\b(?:you\s+are\s+a\s+|you're\s+a\s+)(?:moron|idiot|bastard|bitch|asshole)\b/i,
    category: "harassment",
    severity: "medium",
    weight: 0.45,
    label: "Direct personal insult",
  },

  // General Profanity / Expletives (low severity)
  {
    regex: /\b(?:fuck|fucking|fucked)\b/i,
    category: "profanity",
    severity: "low",
    weight: 0.3,
    label: "Expletive",
  },
  {
    regex: /\b(?:shit|asshole|bitch|bastard)\b/i,
    category: "profanity",
    severity: "low",
    weight: 0.25,
    label: "Profanity",
  },
  {
    regex: /\b(?:damn|hell|crap)\b/i,
    category: "profanity",
    severity: "low",
    weight: 0.15,
    label: "Mild expletive",
  },
];

export function checkToxicity(text: string): ToxicityResult {
  const flags: string[] = [];
  let score = 0;
  let highestSeverity: ToxicitySeverity = "none";

  const categories = {
    threat: false,
    hateSpeech: false,
    harassment: false,
    profanity: false,
  };

  // Strip benign idioms before running harsher patterns
  let cleanedText = text;
  for (const idiom of BENIGN_IDIOM_PATTERNS) {
    cleanedText = cleanedText.replace(idiom, " ");
  }

  for (const rule of TOXICITY_RULES) {
    if (rule.regex.test(cleanedText)) {
      const match = cleanedText.match(rule.regex)?.[0] || "";
      flags.push(`"${match}": ${rule.label}`);
      score = Math.max(score, score + rule.weight);
      categories[rule.category] = true;

      if (rule.severity === "high") {
        highestSeverity = "high";
      } else if (rule.severity === "medium" && highestSeverity !== "high") {
        highestSeverity = "medium";
      } else if (rule.severity === "low" && highestSeverity === "none") {
        highestSeverity = "low";
      }
    }
  }

  // Capitalization check: Only flag if text is shouting AND contains aggressive/negative indicators
  const upperLetters = (text.match(/[A-Z]/g) || []).length;
  const totalLetters = (text.match(/[A-Za-z]/g) || []).length;
  const upperRatio = totalLetters > 0 ? upperLetters / totalLetters : 0;

  if (upperRatio > 0.65 && text.length > 8 && (score > 0 || categories.threat || categories.harassment)) {
    flags.push("Aggressive capitalization (shouting)");
    score += 0.15;
    if (highestSeverity === "none") highestSeverity = "low";
  }

  // Normalization
  const finalScore = Math.min(1, Math.round(score * 100) / 100);
  const isToxic = finalScore >= 0.25 || highestSeverity === "high";

  return {
    isToxic,
    score: finalScore,
    severity: isToxic ? highestSeverity : "none",
    flags,
    categories,
  };
}

// ─────────────────────────────────────────────
// Full Text Analyzer
// ─────────────────────────────────────────────

export function analyzeText(
  text: string,
  analysisType: AnalysisType = "sentiment"
): AnalysisResponseData {
  const startTime = Date.now();
  const results: AnalysisResults = {};

  // Sentiment Analysis is always included
  results.sentiment = analyzeSentiment(text);

  if (analysisType === "emotion" || analysisType === "all") {
    results.emotion = detectEmotions(text, results.sentiment.label);
  }

  if (analysisType === "keywords" || analysisType === "all") {
    results.keywords = extractKeywords(text);
  }

  if (analysisType === "toxicity" || analysisType === "all") {
    results.toxicity = checkToxicity(text);
  }

  const processingTime = Date.now() - startTime;
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return {
    success: true,
    text: text.substring(0, 200),
    analysisType,
    results,
    metadata: {
      processingTime: `${processingTime}ms`,
      wordCount,
      characterCount: text.length,
      model: "Lexicon-v1 (Rule-based heuristic)",
      engine: {
        name: "lexicon-v1",
        version: "1.1.0",
        type: "rule-based",
        description: "Rule-based lexicon analyzer with contextual negation, intensifier weighting, and severity-tiered moderation.",
      },
    },
  };
}
