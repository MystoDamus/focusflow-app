import {
  generateLocalFlashcards,
  generateLocalQuiz,
  generateLocalStudyPlan,
} from "./localStudyGeneration";

const REQUEST_TIMEOUT_MS = 30000;
const TEXT_FILE_EXTENSIONS = new Set(["txt", "md", "csv", "json"]);

class AIServiceError extends Error {
  constructor(code, message, meta = {}) {
    super(message);
    this.name = "AIServiceError";
    this.code = code;
    this.meta = meta;
  }
}

function createTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timerId };
}

function isTextFile(file) {
  const extension = file?.name?.split(".").pop()?.toLowerCase();
  return TEXT_FILE_EXTENSIONS.has(extension);
}

async function readFileAsText(file) {
  if (!file || !isTextFile(file)) {
    return "";
  }

  return file.text();
}

async function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed reading file"));
    reader.readAsDataURL(file);
  });
}

async function buildSourcePayload(sourceText, sourceFile) {
  const normalizedText = String(sourceText ?? "").trim();

  if (!sourceFile) {
    return { sourceText: normalizedText, sourceFile: null };
  }

  if (isTextFile(sourceFile)) {
    const fileText = normalizedText || await readFileAsText(sourceFile);
    return { sourceText: fileText.trim(), sourceFile: null };
  }

  return {
    sourceText: normalizedText,
    sourceFile: {
      name: sourceFile.name,
      type: sourceFile.type || "application/octet-stream",
      base64: await readFileAsBase64(sourceFile),
    },
  };
}

async function postAIGeneration(payload) {
  const { controller, timerId } = createTimeoutSignal(REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = data?.error ?? {};
      throw new AIServiceError(
        error.code || "PROVIDER_HTTP",
        error.message || "AI request failed.",
        error.meta || {},
      );
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new AIServiceError("TIMEOUT", "AI request timed out.");
    }

    if (error instanceof AIServiceError) {
      throw error;
    }

    throw new AIServiceError("NETWORK", error?.message || "AI request failed.");
  } finally {
    clearTimeout(timerId);
  }
}

function shouldUseLocalFallback(error) {
  return ["MISSING_KEY", "NETWORK", "TIMEOUT", "PROVIDER_HTTP", "AUTH", "RATE_LIMIT", "UNSUPPORTED_FILE"].includes(error?.code);
}

function buildLocalMeta(error, provider) {
  const fromProvider = error?.meta?.provider || provider || "auto";
  return {
    providerUsed: "local",
    providerTrail: [fromProvider, "local"],
  };
}

function attachProviderMeta(result, meta) {
  if (Array.isArray(result)) {
    result._providerUsed = meta.providerUsed || "auto";
    result._providerTrail = meta.providerTrail || [meta.providerUsed || "auto"];
    return result;
  }

  return {
    ...result,
    _providerUsed: meta.providerUsed || "auto",
    _providerTrail: meta.providerTrail || [meta.providerUsed || "auto"],
  };
}

export function getDefaultAIProvider() {
  return "auto";
}

export function formatAIError(error) {
  const code = error?.code || "UNKNOWN";
  const message = error?.message || String(error || "AI request failed");
  return {
    badge: `AI-${code}`,
    message,
    code,
  };
}

export async function generateFlashcardsAI({ provider, sourceText, sourceFile, cardCount = 12 }) {
  const material = await buildSourcePayload(sourceText, sourceFile);
  try {
    const response = await postAIGeneration({
      kind: "flashcards",
      provider: provider || "auto",
      cardCount,
      ...material,
    });

    return attachProviderMeta(response.data ?? [], response);
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      throw error;
    }

    const localCards = await generateLocalFlashcards({
      sourceText: material.sourceText,
      sourceFile: material.sourceFile,
      cardCount,
    });

    if (!localCards.length) {
      throw error;
    }

    return attachProviderMeta(localCards, buildLocalMeta(error, provider));
  }
}

export async function generateQuizAI({ provider, sourceText, sourceFile, questionCount = 10 }) {
  const material = await buildSourcePayload(sourceText, sourceFile);
  try {
    const response = await postAIGeneration({
      kind: "quiz",
      provider: provider || "auto",
      questionCount,
      ...material,
    });

    return attachProviderMeta(response.data ?? [], response);
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      throw error;
    }

    const localQuestions = await generateLocalQuiz({
      sourceText: material.sourceText,
      sourceFile: material.sourceFile,
      questionCount,
    });

    if (!localQuestions.length) {
      throw error;
    }

    return attachProviderMeta(localQuestions, buildLocalMeta(error, provider));
  }
}

export async function generateStudyPlanAI({ provider, sourceText, sourceFile }) {
  const material = await buildSourcePayload(sourceText, sourceFile);
  try {
    const response = await postAIGeneration({
      kind: "studyPlan",
      provider: provider || "auto",
      ...material,
    });

    return attachProviderMeta(response.data ?? {}, response);
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      throw error;
    }

    const localPlan = await generateLocalStudyPlan({
      sourceText: material.sourceText,
      sourceFile: material.sourceFile,
    });

    if (!localPlan || !Object.keys(localPlan).length) {
      throw error;
    }

    return attachProviderMeta(localPlan, buildLocalMeta(error, provider));
  }
}
