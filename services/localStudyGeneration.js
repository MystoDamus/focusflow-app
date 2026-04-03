import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

if (typeof window !== "undefined" && pdfjsLib.GlobalWorkerOptions.workerSrc !== pdfWorkerUrl) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

const STOPWORDS = new Set([
  "about", "after", "again", "also", "among", "because", "before", "being", "between", "chapter",
  "could", "does", "each", "from", "have", "into", "itself", "just", "many", "might", "other",
  "research", "should", "since", "some", "than", "that", "their", "there", "these", "they", "this",
  "through", "topic", "under", "using", "very", "what", "when", "where", "which", "while", "with",
  "would", "your", "were", "been", "them", "then", "such", "more", "most", "into", "onto", "across",
]);

function normalizeWhitespace(text) {
  return String(text ?? "")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function splitIntoSentences(text) {
  return normalizeWhitespace(text)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length >= 40);
}

function toTitleCase(value) {
  return String(value ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenize(text) {
  return normalizeWhitespace(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function extractKeywords(text, maxCount = 18) {
  const frequency = new Map();
  for (const token of tokenize(text)) {
    if (token.length < 4 || /^\d+$/.test(token) || STOPWORDS.has(token)) {
      continue;
    }
    frequency.set(token, (frequency.get(token) ?? 0) + 1);
  }

  return [...frequency.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, maxCount)
    .map(([token]) => token);
}

function trimSentence(sentence, maxLength = 180) {
  const normalized = normalizeWhitespace(sentence);
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1).trim()}...`;
}

function chooseSentenceKeyword(sentence, keywords) {
  const lower = sentence.toLowerCase();
  return keywords.find((keyword) => lower.includes(keyword)) || null;
}

function buildChoices(answer, keywordPool) {
  const distractors = keywordPool
    .filter((entry) => entry.toLowerCase() !== answer.toLowerCase())
    .slice(0, 3)
    .map((entry) => toTitleCase(entry));

  return [...new Set([toTitleCase(answer), ...distractors])].slice(0, 4);
}

function buildConceptCards(sentences, keywords, targetCount) {
  const cards = [];
  const usedSentences = new Set();

  for (const keyword of keywords) {
    const sentence = sentences.find((entry, index) => {
      if (usedSentences.has(index)) {
        return false;
      }
      return entry.toLowerCase().includes(keyword);
    });

    if (!sentence) {
      continue;
    }

    const sentenceIndex = sentences.indexOf(sentence);
    usedSentences.add(sentenceIndex);
    cards.push({
      question: `Which concept is best described by: \"${trimSentence(sentence, 170)}\"`,
      answer: toTitleCase(keyword),
      choices: buildChoices(keyword, keywords),
      type: "mcq",
      explanation: sentence,
    });

    if (cards.length >= targetCount) {
      break;
    }
  }

  return { cards, usedSentences };
}

function buildClozeCards(sentences, keywords, targetCount, usedSentences = new Set()) {
  const cards = [];

  for (let index = 0; index < sentences.length && cards.length < targetCount; index += 1) {
    if (usedSentences.has(index)) {
      continue;
    }

    const sentence = sentences[index];
    const keyword = chooseSentenceKeyword(sentence, keywords);
    if (!keyword) {
      continue;
    }

    const answer = toTitleCase(keyword);
    const masked = sentence.replace(new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i"), "_____");
    if (masked === sentence) {
      continue;
    }

    cards.push({
      question: `Complete the statement: ${trimSentence(masked, 180)}`,
      answer,
      choices: buildChoices(keyword, keywords),
      type: "mcq",
      explanation: sentence,
    });
  }

  return cards;
}

function buildSummary(text, sentences) {
  const summaryParts = sentences.slice(0, 3).map((entry) => trimSentence(entry, 180));
  if (!summaryParts.length) {
    return trimSentence(text, 220);
  }
  return summaryParts.join(" ");
}

async function extractPdfTextFromBase64(base64) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    pages.push(textContent.items.map((item) => item.str).join(" "));
  }

  return normalizeWhitespace(pages.join("\n\n"));
}

export async function extractStudyMaterialText(sourceText, sourceFile) {
  const normalizedText = normalizeWhitespace(sourceText);
  if (normalizedText) {
    return normalizedText;
  }

  if (!sourceFile) {
    return "";
  }

  if (sourceFile.base64 && sourceFile.type === "application/pdf") {
    return extractPdfTextFromBase64(sourceFile.base64);
  }

  if (sourceFile.base64 && sourceFile.type?.startsWith("text/")) {
    return normalizeWhitespace(atob(sourceFile.base64));
  }

  return "";
}

export async function generateLocalFlashcards({ sourceText, sourceFile, cardCount = 12 }) {
  const text = await extractStudyMaterialText(sourceText, sourceFile);
  const sentences = splitIntoSentences(text);
  const keywords = extractKeywords(text, Math.max(cardCount * 2, 12));

  if (!text || (!sentences.length && !keywords.length)) {
    return [];
  }

  const conceptResult = buildConceptCards(sentences, keywords, Math.ceil(cardCount / 2));
  const clozeCards = buildClozeCards(sentences, keywords, cardCount - conceptResult.cards.length, conceptResult.usedSentences);

  return [...conceptResult.cards, ...clozeCards].slice(0, cardCount);
}

export async function generateLocalQuiz({ sourceText, sourceFile, questionCount = 10 }) {
  const cards = await generateLocalFlashcards({
    sourceText,
    sourceFile,
    cardCount: Math.max(questionCount, 8),
  });

  return cards.slice(0, questionCount).map((card, index) => ({
    question: card.question,
    answer: card.answer,
    choices: card.choices,
    type: card.type === "basic" ? "identification" : card.type,
    explanation: card.explanation ?? `Locally generated question ${index + 1}`,
  }));
}

export async function generateLocalStudyPlan({ sourceText, sourceFile }) {
  const text = await extractStudyMaterialText(sourceText, sourceFile);
  const sentences = splitIntoSentences(text);
  const keywords = extractKeywords(text, 8).map((entry) => toTitleCase(entry));
  const summary = buildSummary(text, sentences);

  return {
    summary: summary || "Focus on extracting the core ideas, turning them into recall prompts, and reviewing them in short cycles.",
    weeklyPlan: [
      `Day 1: Preview the material and identify the core ideas: ${keywords.slice(0, 3).join(", ") || "key concepts"}.`,
      "Day 2: Convert the main ideas into flashcards and test active recall.",
      "Day 3: Run a mixed quiz session and review every wrong answer.",
      "Day 4: Revisit the weakest concepts and rewrite them in your own words.",
      "Day 5: Do a timed review session and summarize the material from memory.",
    ],
    methods: ["flashcards", "quiz battle", "blurting", "leitner"],
    priorityTopics: keywords.slice(0, 5),
  };
}
