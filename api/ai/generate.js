import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

const GEMINI_MODEL = "gemini-1.5-flash";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const REQUEST_TIMEOUT_MS = 25000;
const RETRY_ATTEMPTS = 2;
const SERVER_PROVIDER_ENV_KEYS = {
  gemini: ["GEMINI_API_KEY", "VITE_GEMINI_API_KEY"],
  groq: ["GROQ_API_KEY", "VITE_GROQ_API_KEY"],
};

class AIServiceError extends Error {
  constructor(code, message, meta = {}) {
    super(message);
    this.name = "AIServiceError";
    this.code = code;
    this.meta = meta;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryStatus(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function shouldFallback(code) {
  return ["TIMEOUT", "NETWORK", "RATE_LIMIT", "PROVIDER_HTTP", "EMPTY_RESPONSE", "PARSE", "MISSING_KEY"].includes(code);
}

function uniqueProviders(providers) {
  return [...new Set(providers.filter(Boolean))];
}

function getConfiguredApiKey(provider) {
  const keys = SERVER_PROVIDER_ENV_KEYS[provider] ?? [];
  for (const envKey of keys) {
    const value = String(process.env[envKey] ?? "").trim();
    if (value) {
      return value;
    }
  }
  return "";
}

function getPreferredEnvKey(provider) {
  return provider === "gemini" ? "GEMINI_API_KEY" : "GROQ_API_KEY";
}

function extractJsonPayload(raw) {
  const text = String(raw ?? "").trim();
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;

  const firstBrace = candidate.indexOf("{");
  const firstBracket = candidate.indexOf("[");
  const start = firstBrace === -1
    ? firstBracket
    : firstBracket === -1
      ? firstBrace
      : Math.min(firstBrace, firstBracket);

  if (start > 0) {
    return candidate.slice(start).trim();
  }

  return candidate;
}

function parseJsonOrThrow(raw, providerUsed) {
  try {
    return JSON.parse(extractJsonPayload(raw));
  } catch (error) {
    throw new AIServiceError("PARSE", `${providerUsed} returned malformed JSON.`, {
      provider: providerUsed,
      reason: String(error?.message || error),
    });
  }
}

function normalizeCard(card, index) {
  const answer = String(card?.answer ?? "").trim();
  const question = String(card?.question ?? "").trim();
  const rawChoices = Array.isArray(card?.choices) ? card.choices : [];
  const choices = [...new Set([answer, ...rawChoices.map((entry) => String(entry).trim()).filter(Boolean)])].slice(0, 4);

  let type = card?.type;
  if (type !== "mcq" && type !== "true-false" && type !== "basic") {
    type = choices.length >= 2 ? "mcq" : "basic";
  }

  if (type === "true-false" && !["true", "false"].includes(answer.toLowerCase())) {
    type = choices.length >= 2 ? "mcq" : "basic";
  }

  return {
    id: `ai-card-${Date.now()}-${index}`,
    question,
    answer,
    choices: type === "basic" ? [answer] : choices,
    type,
    explanation: card?.explanation ? String(card.explanation).trim() : null,
  };
}

function normalizeForCompare(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLowValueQuestion(value) {
  const question = normalizeForCompare(value);
  if (!question || question.length < 14) {
    return true;
  }

  return ["what is", "define", "true or false", "which is", "name the", "state the"]
    .some((prefix) => question.startsWith(prefix) && question.split(" ").length <= 5);
}

function normalizeQuizQuestion(question, index) {
  const answer = String(question?.answer ?? "").trim();
  const rawChoices = Array.isArray(question?.choices) ? question.choices.map((choice) => String(choice).trim()).filter(Boolean) : [];
  const uniqueChoices = [...new Set([answer, ...rawChoices])]
    .filter((choice) => normalizeForCompare(choice) !== normalizeForCompare(answer) || choice === answer)
    .slice(0, 4);
  const questionType = question?.type === "true-false" || question?.type === "identification" ? question.type : "mcq";

  return {
    id: `quiz-ai-${Date.now()}-${index}`,
    question: String(question?.question ?? "").trim(),
    answer,
    choices: questionType === "identification" ? [] : uniqueChoices,
    type: questionType,
    explanation: question?.explanation ? String(question.explanation).trim() : null,
  };
}

function createMaterialDigest(sourceText) {
  const normalized = String(sourceText ?? "")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const sentences = normalized
    .split(/(?<=[.!?])\s+|\n+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length >= 20)
    .slice(0, 60);

  const frequency = new Map();
  for (const token of normalized.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)) {
    if (!token || token.length < 4 || /^\d+$/.test(token)) continue;
    frequency.set(token, (frequency.get(token) ?? 0) + 1);
  }

  const keywords = [...frequency.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 18)
    .map(([token]) => token);

  const bigrams = new Map();
  for (let index = 0; index < keywords.length - 1; index += 1) {
    const pair = `${keywords[index]} ${keywords[index + 1]}`;
    bigrams.set(pair, (bigrams.get(pair) ?? 0) + 1);
  }
  const conceptPairs = [...bigrams.keys()].slice(0, 8);

  const excerpts = sentences.slice(0, 8);

  return {
    keywords,
    conceptPairs,
    excerpts,
    materialLength: normalized.length,
  };
}

function ensureApiKey(provider) {
  const resolved = getConfiguredApiKey(provider);
  if (!resolved) {
    throw new AIServiceError("MISSING_KEY", `AI is not configured for ${provider}. Add ${getPreferredEnvKey(provider)} to the deployment environment.`, {
      provider,
      envKey: getPreferredEnvKey(provider),
    });
  }

  return resolved;
}

function providerOrder(preferred, sourceFile) {
  const configured = ["gemini", "groq"].filter((provider) => Boolean(getConfiguredApiKey(provider)));

  if (preferred === "auto") {
    if (sourceFile?.type === "application/pdf") {
      return uniqueProviders(["gemini", ...configured, "groq"]);
    }

    return uniqueProviders([...configured, "gemini", "groq"]);
  }

  if (preferred === "groq" && sourceFile?.type === "application/pdf") {
    return ["gemini", "groq"];
  }

  return preferred === "gemini" ? ["gemini", "groq"] : ["groq", "gemini"];
}

function createModel(provider, apiKey) {
  if (provider === "gemini") {
    return google(GEMINI_MODEL, { apiKey });
  }
  return groq(GROQ_MODEL, { apiKey });
}

function mapProviderError(error, provider) {
  const status = Number(error?.statusCode || error?.response?.status || 0);
  const code = status === 401 || status === 403
    ? "AUTH"
    : status === 429
      ? "RATE_LIMIT"
      : status > 0
        ? "PROVIDER_HTTP"
        : error?.name === "AbortError"
          ? "TIMEOUT"
          : "NETWORK";

  return new AIServiceError(code, `${provider} request failed${status ? ` (${status})` : ""}.`, {
    provider,
    status,
    reason: String(error?.message || error),
  });
}

function withTimeout(promise, timeoutMs, provider) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new AIServiceError("TIMEOUT", `${provider} request timed out.`, { provider }));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

async function runProvider(provider, prompt) {
  const resolvedKey = ensureApiKey(provider);
  const model = createModel(provider, resolvedKey);

  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const result = await withTimeout(
        generateText({
          model,
          prompt,
          temperature: 0.3,
        }),
        REQUEST_TIMEOUT_MS,
        provider,
      );

      const text = String(result?.text ?? "").trim();
      if (!text) {
        throw new AIServiceError("EMPTY_RESPONSE", `${provider} returned empty output.`, { provider });
      }

      return text;
    } catch (error) {
      const normalized = error instanceof AIServiceError ? error : mapProviderError(error, provider);
      const retryable = normalized.code === "TIMEOUT"
        || normalized.code === "NETWORK"
        || normalized.code === "RATE_LIMIT"
        || (normalized.code === "PROVIDER_HTTP" && shouldRetryStatus(Number(normalized?.meta?.status || 0)));

      if (attempt < RETRY_ATTEMPTS && retryable) {
        await sleep(350 * (attempt + 1));
        continue;
      }

      throw normalized;
    }
  }

  throw new AIServiceError("NETWORK", `${provider} request failed after retries.`, { provider });
}

async function runProviderWithFallback(preferredProvider, prompt, sourceFile) {
  const ordered = providerOrder(preferredProvider, sourceFile);
  let lastError = null;

  for (let index = 0; index < ordered.length; index += 1) {
    const provider = ordered[index];

    try {
      const raw = await runProvider(provider, prompt);
      return { raw, providerUsed: provider };
    } catch (error) {
      lastError = error;
      const code = error instanceof AIServiceError ? error.code : "NETWORK";
      const hasNextProvider = index < ordered.length - 1;
      if (!hasNextProvider || !shouldFallback(code)) {
        break;
      }
    }
  }

  if (lastError instanceof AIServiceError) {
    throw lastError;
  }

  throw new AIServiceError("NETWORK", "AI provider request failed.", { reason: String(lastError?.message || lastError || "unknown") });
}

function alternateProvider(provider) {
  return provider === "gemini" ? "groq" : "gemini";
}

async function parseWithProviderFallback({ raw, providerUsed, preferredProvider, prompt, sourceFile }) {
  try {
    return {
      parsed: parseJsonOrThrow(raw, providerUsed),
      providerUsed,
      providerTrail: [providerUsed],
    };
  } catch (parseError) {
    const fallbackProvider = alternateProvider(providerUsed);
    const shouldTryAlternate = preferredProvider === "auto" || preferredProvider === providerUsed || preferredProvider === fallbackProvider;
    if (!shouldTryAlternate) {
      throw parseError;
    }

    const retry = await runProviderWithFallback(fallbackProvider, prompt, sourceFile);
    return {
      parsed: parseJsonOrThrow(retry.raw, retry.providerUsed),
      providerUsed: retry.providerUsed,
      providerTrail: [providerUsed, retry.providerUsed],
    };
  }
}

function buildPrompt(kind, { sourceText, cardCount, questionCount }) {
  const digest = createMaterialDigest(sourceText);
  const contextBlock = [
    `Material length: ${digest.materialLength} chars`,
    `Top keywords: ${digest.keywords.join(", ") || "none"}`,
    `Concept pairs: ${digest.conceptPairs.join(", ") || "none"}`,
    "Key excerpts:",
    ...digest.excerpts.map((entry, index) => `${index + 1}. ${entry}`),
  ].join("\n");

  if (kind === "flashcards") {
    return [
      "Create high-quality study flashcards from the provided material.",
      `Return ONLY JSON array with ${cardCount} items.`,
      "Each item fields: question, answer, choices (array), type (mcq|true-false|basic), explanation.",
      "Requirements:",
      "- Mix conceptual, applied, and definition-style cards.",
      "- Avoid duplicate questions and trivial wording.",
      "- At least 30% should require reasoning, not direct copy/paste.",
      "- Distractors must be plausible but clearly incorrect.",
      "- Keep explanation under 220 chars and grounded in source.",
      "- Do not include meta text, markdown, or commentary outside JSON.",
      contextBlock,
      `Material:\n${sourceText}`,
    ].join("\n\n");
  }

  if (kind === "quiz") {
    return [
      "Generate quiz questions from the provided material.",
      `Return ONLY JSON array with ${questionCount} items.`,
      "Fields: question, answer, choices (array), type (mcq|true-false|identification), explanation.",
      "Requirements:",
      "- Include a balanced spread of difficulty (easy/medium/hard).",
      "- Include at least some application and inference questions.",
      "- Keep choices concise and mutually exclusive.",
      "- Ensure at least 2 questions target weak/confusable concepts from concept pairs.",
      "- No duplicate questions or near-duplicates.",
      "- Explanations must reference why the correct answer is right and one distractor is wrong.",
      contextBlock,
      `Material:\n${sourceText}`,
    ].join("\n\n");
  }

  return [
    "Generate an optimized study plan from the material.",
    "Return ONLY JSON object with keys: summary, weeklyPlan (array), methods (array), priorityTopics (array).",
    "Requirements:",
    "- weeklyPlan should be actionable day-by-day with measurable outcomes.",
    "- priorityTopics should reflect repeated or high-importance concepts.",
    contextBlock,
    `Material:\n${sourceText}`,
  ].join("\n\n");
}

function dedupeByQuestion(items) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    const key = normalizeForCompare(item?.question ?? "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

function normalizeResult(kind, parsed) {
  if (kind === "flashcards") {
    if (!Array.isArray(parsed) || !parsed.length) {
      throw new AIServiceError("EMPTY_RESPONSE", "AI returned no flashcards.");
    }

    const cards = dedupeByQuestion(
      parsed
        .map((entry, index) => normalizeCard(entry, index))
        .filter((entry) => entry.question && entry.answer && !isLowValueQuestion(entry.question)),
    );
    if (!cards.length) {
      throw new AIServiceError("EMPTY_RESPONSE", "AI returned no valid flashcards.");
    }
    return cards;
  }

  if (kind === "quiz") {
    if (!Array.isArray(parsed) || !parsed.length) {
      throw new AIServiceError("EMPTY_RESPONSE", "AI returned no quiz questions.");
    }

    const questions = dedupeByQuestion(
      parsed
        .map((entry, index) => normalizeQuizQuestion(entry, index))
        .filter((entry) => entry.question && entry.answer && !isLowValueQuestion(entry.question)),
    );
    if (!questions.length) {
      throw new AIServiceError("EMPTY_RESPONSE", "AI returned no valid quiz questions.");
    }
    return questions;
  }

  return {
    summary: String(parsed?.summary ?? "").trim(),
    weeklyPlan: Array.isArray(parsed?.weeklyPlan) ? parsed.weeklyPlan : [],
    methods: Array.isArray(parsed?.methods) ? parsed.methods : [],
    priorityTopics: Array.isArray(parsed?.priorityTopics) ? parsed.priorityTopics : [],
  };
}

function getStatusCode(error) {
  switch (error?.code) {
    case "INVALID_REQUEST":
      return 400;
    case "MISSING_KEY":
      return 503;
    case "AUTH":
      return 401;
    case "RATE_LIMIT":
      return 429;
    case "UNSUPPORTED_FILE":
    case "PARSE":
    case "EMPTY_RESPONSE":
      return 400;
    default:
      return 500;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use POST for AI generation." } });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body ?? {});
    const {
      kind,
      provider = "auto",
      sourceText = "",
      sourceFile = null,
      cardCount = 12,
      questionCount = 10,
    } = body;

    if (!["flashcards", "quiz", "studyPlan"].includes(kind)) {
      throw new AIServiceError("INVALID_REQUEST", "Unsupported AI generation type.");
    }

    const normalizedSourceText = String(sourceText ?? "").trim();
    if (!normalizedSourceText && sourceFile) {
      throw new AIServiceError(
        "UNSUPPORTED_FILE",
        "Direct binary file parsing is handled by local fallback. Provide text content or let the client local generator handle this file.",
      );
    }

    if (!normalizedSourceText) {
      throw new AIServiceError("INVALID_REQUEST", "Please provide study material text.");
    }

    const prompt = buildPrompt(kind, {
      sourceText: normalizedSourceText,
      cardCount: Math.max(3, Math.min(40, Number(cardCount) || 12)),
      questionCount: Math.max(4, Math.min(30, Number(questionCount) || 10)),
    });

    const firstResult = await runProviderWithFallback(provider || "auto", prompt, sourceFile);
    const { parsed, providerUsed, providerTrail } = await parseWithProviderFallback({
      raw: firstResult.raw,
      providerUsed: firstResult.providerUsed,
      preferredProvider: provider || "auto",
      prompt,
      sourceFile,
    });

    res.status(200).json({
      data: normalizeResult(kind, parsed),
      providerUsed,
      providerTrail,
    });
  } catch (error) {
    const normalized = error instanceof AIServiceError
      ? error
      : new AIServiceError("UNKNOWN", error?.message || "AI request failed.");

    res.status(getStatusCode(normalized)).json({
      error: {
        code: normalized.code,
        message: normalized.message,
        meta: normalized.meta,
      },
    });
  }
}
