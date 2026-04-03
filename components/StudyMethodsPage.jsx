import { useEffect, useMemo, useState } from "react";
import { generateStudyPlanAI, getDefaultAIProvider } from "../services/aiGeneration";

const PARA_TAGS = [
  { id: "projects", label: "Projects", color: "#ffcc72" },
  { id: "areas", label: "Areas", color: "#7ce0ff" },
  { id: "resources", label: "Resources", color: "#56d77f" },
  { id: "archives", label: "Archives", color: "#c79bff" },
];

const LEITNER_INTERVALS = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 14,
};

const STUDY_TABS = [
  ["leitner", "Leitner"],
  ["sq3r", "SQ3R"],
  ["blurting", "Blurting"],
  ["interleaving", "Interleaving"],
  ["second-brain", "Second Brain"],
  ["code-trace", "Code Trace"],
];

const TAB_HERO = {
  leitner: {
    title: "Leitner Retention Engine",
    subtitle: "Prioritize what you are about to forget and reduce wasted review time.",
    accent: "linear-gradient(135deg, rgba(255,211,108,0.2), rgba(124,224,255,0.18))",
  },
  sq3r: {
    title: "SQ3R Active Reading Studio",
    subtitle: "Convert dense material into answerable questions and durable recall.",
    accent: "linear-gradient(135deg, rgba(124,224,255,0.2), rgba(86,215,127,0.18))",
  },
  blurting: {
    title: "Recall Pressure Lab",
    subtitle: "Stress-test memory under time and compare against hidden references.",
    accent: "linear-gradient(135deg, rgba(255,126,95,0.22), rgba(255,211,108,0.2))",
  },
  interleaving: {
    title: "Adaptive Topic Mixer",
    subtitle: "Weighted rotation that keeps weak topics returning at the right frequency.",
    accent: "linear-gradient(135deg, rgba(86,215,127,0.22), rgba(124,224,255,0.2))",
  },
  "second-brain": {
    title: "PARA Knowledge Graph",
    subtitle: "Organize notes by purpose and retrieve them through tags and relevance.",
    accent: "linear-gradient(135deg, rgba(199,155,255,0.22), rgba(124,224,255,0.2))",
  },
  "code-trace": {
    title: "Logic Annotation Workbench",
    subtitle: "Attach reasoning directly to lines so steps and intent stay visible.",
    accent: "linear-gradient(135deg, rgba(255,211,108,0.22), rgba(199,155,255,0.22))",
  },
};

function parseDay(day) {
  if (!day) {
    return null;
  }

  const parsed = new Date(`${day}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addDays(day, offset) {
  const parsed = parseDay(day);
  const base = parsed ?? new Date();
  const next = new Date(base.getTime() + offset * 24 * 60 * 60 * 1000);
  return next.toISOString().slice(0, 10);
}

function extractKeywords(value) {
  return new Set(
    String(value ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 4),
  );
}

function computeRecallScore(reference, blurt) {
  const ref = extractKeywords(reference);
  const out = extractKeywords(blurt);
  if (!ref.size || !out.size) {
    return null;
  }

  let overlap = 0;
  ref.forEach((token) => {
    if (out.has(token)) {
      overlap += 1;
    }
  });

  return Math.round((overlap / ref.size) * 100);
}

function getLeitnerBox(card) {
  if (Number.isFinite(card?.leitnerBox)) {
    return Math.min(5, Math.max(1, card.leitnerBox));
  }

  const strength = Number.isFinite(card?.strength) ? card.strength : 1;
  return Math.min(5, Math.max(1, strength));
}

function buildDefaultStudyLab() {
  return {
    sq3rEntries: [],
    blurting: {
      reference: "",
      lastBlurt: "",
      missed: "",
      durationMinutes: 20,
      history: [],
    },
    interleaving: {
      customTopics: [],
      topicWeights: {},
      lastSession: null,
    },
    reminders: {
      lastSyncDay: null,
      autoSync: false,
    },
    secondBrainNotes: [],
    codeTrace: {
      snippet: "",
      annotations: [],
    },
  };
}

export default function StudyMethodsPage({
  forcedTab,
  deployStamp,
  studyLab,
  flashcardSets,
  subjects,
  dayKey,
  onUpdateStudyLab,
  onCreateLeitnerReminders,
  onToast,
}) {
  const normalizedStudyLab = studyLab ?? buildDefaultStudyLab();
  const [activeTab, setActiveTab] = useState(forcedTab ?? "leitner");
  const isSingleMethodView = Boolean(forcedTab);

  const [sq3rDraft, setSq3rDraft] = useState({
    title: "",
    source: "",
    survey: "",
    questions: "",
    readNotes: "",
    recite: "",
    review: "",
  });
  const [sq3rQuestionHints, setSq3rQuestionHints] = useState([]);

  const [blurtingText, setBlurtingText] = useState(normalizedStudyLab.blurting?.lastBlurt ?? "");
  const [blurtingMissed, setBlurtingMissed] = useState(normalizedStudyLab.blurting?.missed ?? "");
  const [blurtingReference, setBlurtingReference] = useState(normalizedStudyLab.blurting?.reference ?? "");
  const [blurtingDuration, setBlurtingDuration] = useState(String(normalizedStudyLab.blurting?.durationMinutes ?? 20));
  const [blurtingSecondsLeft, setBlurtingSecondsLeft] = useState(0);
  const [blurtingRunning, setBlurtingRunning] = useState(false);

  const [mixerTopicsInput, setMixerTopicsInput] = useState("");
  const [mixerCurrent, setMixerCurrent] = useState(null);
  const [mixerSecondsLeft, setMixerSecondsLeft] = useState(25 * 60);
  const [mixerRunning, setMixerRunning] = useState(false);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteTags, setNoteTags] = useState([]);
  const [noteSearch, setNoteSearch] = useState("");
  const [noteFilterTag, setNoteFilterTag] = useState("all");

  const [snippetText, setSnippetText] = useState(normalizedStudyLab.codeTrace?.snippet ?? "");
  const [annotationDraft, setAnnotationDraft] = useState({ start: "1", end: "1", note: "" });
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [aiProvider, setAiProvider] = useState(() => getDefaultAIProvider());
  const [aiInputText, setAiInputText] = useState("");
  const [aiInputFile, setAiInputFile] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiPlan, setAiPlan] = useState(null);

  useEffect(() => {
    if (forcedTab) {
      setActiveTab(forcedTab);
    }
  }, [forcedTab]);

  useEffect(() => {
    if (isSingleMethodView) {
      return undefined;
    }

    function handleShortcut(event) {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      const numeric = Number.parseInt(event.key, 10);
      if (!Number.isFinite(numeric) || numeric < 1 || numeric > STUDY_TABS.length) {
        return;
      }

      event.preventDefault();
      setActiveTab(STUDY_TABS[numeric - 1][0]);
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [isSingleMethodView]);

  useEffect(() => {
    if (!blurtingRunning) return undefined;

    const id = window.setInterval(() => {
      setBlurtingSecondsLeft((prev) => {
        if (prev <= 1) {
          setBlurtingRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [blurtingRunning]);

  useEffect(() => {
    if (!mixerRunning || !mixerCurrent) return undefined;

    const id = window.setInterval(() => {
      setMixerSecondsLeft((prev) => {
        if (prev <= 1) {
          setMixerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [mixerRunning, mixerCurrent]);

  const allCards = useMemo(
    () => (flashcardSets ?? []).flatMap((setEntry) => (setEntry.cards ?? []).map((card) => ({ ...card, setTitle: setEntry.title }))),
    [flashcardSets],
  );

  const leitnerStats = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let dueToday = 0;

    allCards.forEach((card) => {
      const box = getLeitnerBox(card);
      counts[box] += 1;
      if (!card.dueDay || card.dueDay <= dayKey) {
        dueToday += 1;
      }
    });

    return {
      counts,
      dueToday,
      total: allCards.length,
    };
  }, [allCards, dayKey]);

  const interleavingTopicPool = useMemo(() => {
    const subjectNames = Object.values(subjects ?? {}).map((subject) => subject.name).filter(Boolean);
    const setNames = (flashcardSets ?? []).map((setEntry) => setEntry.title).filter(Boolean);
    const custom = normalizedStudyLab.interleaving?.customTopics ?? [];
    return [...new Set([...subjectNames, ...setNames, ...custom])].slice(0, 50);
  }, [subjects, flashcardSets, normalizedStudyLab.interleaving?.customTopics]);

  const topicWeights = normalizedStudyLab.interleaving?.topicWeights ?? {};

  const mixedNotes = normalizedStudyLab.secondBrainNotes ?? [];
  const filteredNotes = mixedNotes.filter((note) => {
    const matchesSearch = !noteSearch.trim() || note.title.toLowerCase().includes(noteSearch.toLowerCase()) || note.body.toLowerCase().includes(noteSearch.toLowerCase());
    const matchesTag = noteFilterTag === "all" || (note.tags ?? []).includes(noteFilterTag);
    return matchesSearch && matchesTag;
  });
  const sq3rEntries = normalizedStudyLab.sq3rEntries ?? [];
  const codeTrace = normalizedStudyLab.codeTrace ?? { snippet: "", annotations: [] };
  const blurtingScore = useMemo(
    () => computeRecallScore(blurtingReference || normalizedStudyLab.blurting?.reference, blurtingText),
    [blurtingReference, normalizedStudyLab.blurting?.reference, blurtingText],
  );
  const blurtingHistory = normalizedStudyLab.blurting?.history ?? [];

  const leitnerForecast = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => addDays(dayKey, index));
    return days.map((day) => ({
      day,
      count: allCards.filter((card) => (card.dueDay ?? dayKey) <= day).length,
    }));
  }, [allCards, dayKey]);

  const recallTrend = useMemo(() => blurtingHistory.slice(-7), [blurtingHistory]);

  const radarAxes = useMemo(() => {
    const topics = interleavingTopicPool.slice(0, 6);
    return topics.map((topic) => ({
      topic,
      weight: Math.max(1, Number.parseInt(topicWeights[topic], 10) || 1),
    }));
  }, [interleavingTopicPool, topicWeights]);

  useEffect(() => {
    const autoSync = Boolean(normalizedStudyLab.reminders?.autoSync);
    const alreadySyncedToday = normalizedStudyLab.reminders?.lastSyncDay === dayKey;
    if (!autoSync || alreadySyncedToday) {
      return;
    }

    const dueCards = allCards
      .filter((card) => !card.dueDay || card.dueDay <= dayKey)
      .slice(0, 30)
      .map((card) => ({
        date: dayKey,
        label: `Leitner Review: ${card.question.slice(0, 48)}`,
        reminderKey: `leitner-${card.id}`,
      }));

    if (!dueCards.length) {
      updateStudyLab((current) => ({
        ...current,
        reminders: {
          ...(current.reminders ?? {}),
          lastSyncDay: dayKey,
        },
      }));
      return;
    }

    onCreateLeitnerReminders?.(dueCards);
    updateStudyLab((current) => ({
      ...current,
      reminders: {
        ...(current.reminders ?? {}),
        lastSyncDay: dayKey,
      },
    }));
    onToast?.("Auto-synced due Leitner reminders to calendar");
  }, [dayKey, allCards, normalizedStudyLab.reminders?.autoSync, normalizedStudyLab.reminders?.lastSyncDay]);

  function updateStudyLab(partialOrUpdater) {
    onUpdateStudyLab((current) => {
      const safeCurrent = current ?? buildDefaultStudyLab();
      if (typeof partialOrUpdater === "function") {
        return partialOrUpdater(safeCurrent);
      }
      return { ...safeCurrent, ...partialOrUpdater };
    });
  }

  function pickWeightedTopics(topics, weights, count = 3) {
    const weightedPool = topics.map((topic) => ({
      topic,
      weight: Math.max(1, Number.parseInt(weights[topic], 10) || 1),
    }));

    const selected = [];
    const pool = [...weightedPool];

    while (selected.length < count && pool.length) {
      const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
      let roll = Math.random() * totalWeight;
      let pickedIndex = 0;

      for (let index = 0; index < pool.length; index += 1) {
        roll -= pool[index].weight;
        if (roll <= 0) {
          pickedIndex = index;
          break;
        }
      }

      selected.push(pool[pickedIndex].topic);
      pool.splice(pickedIndex, 1);
    }

    return selected;
  }

  function addSq3rEntry(event) {
    event.preventDefault();
    if (!sq3rDraft.title.trim()) return;

    updateStudyLab((current) => ({
      ...current,
      sq3rEntries: [
        {
          id: `sq3r-${Date.now()}`,
          ...sq3rDraft,
          createdAt: new Date().toISOString(),
        },
        ...(current.sq3rEntries ?? []),
      ],
    }));

    setSq3rDraft({ title: "", source: "", survey: "", questions: "", readNotes: "", recite: "", review: "" });
    setSq3rQuestionHints([]);
  }

  function generateSq3rQuestionsFromSurvey() {
    const headings = sq3rDraft.survey
      .split("\n")
      .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 12);

    if (!headings.length) {
      onToast?.("Add headings in Survey first");
      return;
    }

    const generated = headings.map((heading) => `What is ${heading.toLowerCase()}?`);
    setSq3rQuestionHints(generated);
    setSq3rDraft((current) => ({
      ...current,
      questions: generated.join("\n"),
    }));
  }

  function saveBlurtingReference() {
    const duration = Number.parseInt(blurtingDuration, 10);
    const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 20;
    const nextScore = computeRecallScore(blurtingReference, blurtingText);

    updateStudyLab((current) => ({
      ...current,
      blurting: {
        ...(current.blurting ?? {}),
        reference: blurtingReference,
        durationMinutes: safeDuration,
        lastBlurt: blurtingText,
        missed: blurtingMissed,
        history: nextScore === null
          ? (current.blurting?.history ?? [])
          : [
              ...(current.blurting?.history ?? []),
              {
                day: dayKey,
                score: nextScore,
              },
            ].slice(-30),
      },
    }));
  }

  function startBlurtingSession() {
    const duration = Number.parseInt(blurtingDuration, 10);
    const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 20;
    setBlurtingSecondsLeft(safeDuration * 60);
    setBlurtingRunning(true);
  }

  function buildMixerSession() {
    const topics = pickWeightedTopics(interleavingTopicPool, topicWeights, 3);
    if (topics.length < 3) return;

    const nextSession = {
      topics,
      index: 0,
      startedAt: new Date().toISOString(),
    };

    setMixerCurrent(nextSession);
    setMixerSecondsLeft(25 * 60);
    setMixerRunning(true);

    updateStudyLab((current) => ({
      ...current,
      interleaving: {
        ...(current.interleaving ?? {}),
        lastSession: nextSession,
      },
    }));
  }

  function nextMixerBlock() {
    if (!mixerCurrent) return;
    if (mixerCurrent.index >= mixerCurrent.topics.length - 1) {
      setMixerRunning(false);
      return;
    }

    const next = {
      ...mixerCurrent,
      index: mixerCurrent.index + 1,
    };
    setMixerCurrent(next);
    setMixerSecondsLeft(25 * 60);
    setMixerRunning(true);
  }

  function rateCurrentMixerBlock(level) {
    if (!mixerCurrent) return;
    const topic = mixerCurrent.topics[mixerCurrent.index];
    const currentWeight = topicWeights[topic] ?? 1;
    const delta = level === "hard" ? 1 : level === "easy" ? -1 : 0;
    const nextWeight = Math.max(1, Math.min(10, currentWeight + delta));

    updateStudyLab((current) => ({
      ...current,
      interleaving: {
        ...(current.interleaving ?? {}),
        topicWeights: {
          ...(current.interleaving?.topicWeights ?? {}),
          [topic]: nextWeight,
        },
      },
    }));
  }

  function addMixerTopics() {
    const parsed = mixerTopicsInput
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (!parsed.length) return;

    updateStudyLab((current) => ({
      ...current,
      interleaving: {
        ...(current.interleaving ?? {}),
        customTopics: [...new Set([...(current.interleaving?.customTopics ?? []), ...parsed])],
      },
    }));
    setMixerTopicsInput("");
  }

  function setTopicWeight(topic, value) {
    const parsed = Number.parseInt(value, 10);
    const nextWeight = Number.isFinite(parsed) ? Math.max(1, Math.min(10, parsed)) : 1;

    updateStudyLab((current) => ({
      ...current,
      interleaving: {
        ...(current.interleaving ?? {}),
        topicWeights: {
          ...(current.interleaving?.topicWeights ?? {}),
          [topic]: nextWeight,
        },
      },
    }));
  }

  function syncLeitnerRemindersToCalendar() {
    const dueCards = allCards
      .filter((card) => !card.dueDay || card.dueDay <= dayKey)
      .slice(0, 30)
      .map((card) => ({
        date: dayKey,
        label: `Leitner Review: ${card.question.slice(0, 48)}`,
        reminderKey: `leitner-${card.id}`,
      }));

    if (!dueCards.length) {
      onToast?.("No due Leitner cards to sync");
      return;
    }

    onCreateLeitnerReminders?.(dueCards);
    updateStudyLab((current) => ({
      ...current,
      reminders: {
        ...(current.reminders ?? {}),
        lastSyncDay: dayKey,
      },
    }));
  }

  function exportStudyMethodsData() {
    if (typeof window === "undefined") {
      return;
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      studyLab: normalizedStudyLab,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `focusflow-study-methods-${dayKey}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  function importStudyMethodsData(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const nextStudyLab = parsed?.studyLab ?? parsed;
        if (!nextStudyLab || typeof nextStudyLab !== "object") {
          throw new Error("Invalid payload");
        }

        updateStudyLab((current) => ({
          ...buildDefaultStudyLab(),
          ...current,
          ...nextStudyLab,
          interleaving: {
            ...(buildDefaultStudyLab().interleaving ?? {}),
            ...(current?.interleaving ?? {}),
            ...(nextStudyLab.interleaving ?? {}),
          },
        }));
        onToast?.("Study methods data imported");
      } catch {
        onToast?.("Import failed: invalid study methods file");
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  }

  function toggleParaTag(tagId) {
    setNoteTags((current) => (
      current.includes(tagId)
        ? current.filter((entry) => entry !== tagId)
        : [...current, tagId]
    ));
  }

  function addSecondBrainNote(event) {
    event.preventDefault();
    if (!noteTitle.trim() || !noteBody.trim()) return;

    updateStudyLab((current) => ({
      ...current,
      secondBrainNotes: [
        {
          id: `brain-note-${Date.now()}`,
          title: noteTitle.trim(),
          body: noteBody.trim(),
          tags: noteTags,
          createdAt: new Date().toISOString(),
        },
        ...(current.secondBrainNotes ?? []),
      ],
    }));

    setNoteTitle("");
    setNoteBody("");
    setNoteTags([]);
  }

  function toggleArchiveNote(noteId) {
    updateStudyLab((current) => ({
      ...current,
      secondBrainNotes: (current.secondBrainNotes ?? []).map((note) => {
        if (note.id !== noteId) {
          return note;
        }

        const tags = note.tags ?? [];
        return {
          ...note,
          tags: tags.includes("archives")
            ? tags.filter((entry) => entry !== "archives")
            : [...tags, "archives"],
        };
      }),
    }));
  }

  function addCodeAnnotation(event) {
    event.preventDefault();
    const start = Number.parseInt(annotationDraft.start, 10);
    const end = Number.parseInt(annotationDraft.end, 10);
    if (!Number.isFinite(start) || !Number.isFinite(end) || !annotationDraft.note.trim()) return;

    updateStudyLab((current) => ({
      ...current,
      codeTrace: {
        snippet: snippetText,
        annotations: [
          {
            id: `annotation-${Date.now()}`,
            start,
            end,
            note: annotationDraft.note.trim(),
          },
          ...(current.codeTrace?.annotations ?? []),
        ],
      },
    }));

    setAnnotationDraft({ start: "1", end: "1", note: "" });
  }

  function saveSnippet() {
    updateStudyLab((current) => ({
      ...current,
      codeTrace: {
        ...(current.codeTrace ?? {}),
        snippet: snippetText,
        annotations: current.codeTrace?.annotations ?? [],
      },
    }));
  }

  async function handleGenerateAIStudyPack(event) {
    event.preventDefault();

    try {
      setAiBusy(true);
      const plan = await generateStudyPlanAI({
        provider: aiProvider,
        sourceText: aiInputText,
        sourceFile: aiInputFile,
      });

      setAiPlan(plan);
      onToast?.("AI study pack generated");
    } catch (error) {
      onToast?.(`AI error: ${error?.message || error}`);
    } finally {
      setAiBusy(false);
    }
  }

  function applyAIToSq3r() {
    if (!aiPlan) return;

    const weekly = Array.isArray(aiPlan.weeklyPlan)
      ? aiPlan.weeklyPlan.map((entry, index) => `${index + 1}. ${typeof entry === "string" ? entry : entry?.title ?? JSON.stringify(entry)}`).join("\n")
      : "";

    const generatedQuestions = Array.isArray(aiPlan.priorityTopics)
      ? aiPlan.priorityTopics.map((topic) => `What is ${topic}?`).join("\n")
      : "";

    setSq3rDraft((current) => ({
      ...current,
      title: current.title || "AI Study Session",
      survey: aiPlan.summary || current.survey,
      questions: generatedQuestions || current.questions,
      review: weekly || current.review,
    }));

    setSq3rQuestionHints(generatedQuestions ? generatedQuestions.split("\n") : []);
    setActiveTab("sq3r");
    onToast?.("Applied AI plan to SQ3R");
  }

  function applyAIToInterleaving() {
    if (!aiPlan) return;
    const topics = [
      ...(Array.isArray(aiPlan.priorityTopics) ? aiPlan.priorityTopics : []),
      ...(Array.isArray(aiPlan.methods) ? aiPlan.methods : []),
    ].map((entry) => String(entry).trim()).filter(Boolean);

    if (!topics.length) {
      onToast?.("AI plan had no topics to apply");
      return;
    }

    updateStudyLab((current) => {
      const merged = [...new Set([...(current.interleaving?.customTopics ?? []), ...topics])];
      const nextWeights = { ...(current.interleaving?.topicWeights ?? {}) };
      topics.slice(0, 8).forEach((topic, index) => {
        nextWeights[topic] = Math.max(nextWeights[topic] ?? 1, Math.max(3, 8 - index));
      });

      return {
        ...current,
        interleaving: {
          ...(current.interleaving ?? {}),
          customTopics: merged,
          topicWeights: nextWeights,
        },
      };
    });

    setActiveTab("interleaving");
    onToast?.("Applied AI plan to Interleaving");
  }

  function applyAIToBlurting() {
    if (!aiPlan?.summary) return;

    setBlurtingReference(String(aiPlan.summary));
    updateStudyLab((current) => ({
      ...current,
      blurting: {
        ...(current.blurting ?? {}),
        reference: String(aiPlan.summary),
      },
    }));

    setActiveTab("blurting");
    onToast?.("Applied AI summary as Blurting reference");
  }

  function applyAIToSecondBrain() {
    if (!aiPlan?.summary) return;

    const planTags = Array.isArray(aiPlan.priorityTopics) && aiPlan.priorityTopics.length
      ? ["projects", "resources"]
      : ["resources"];

    updateStudyLab((current) => ({
      ...current,
      secondBrainNotes: [
        {
          id: `brain-note-ai-${Date.now()}`,
          title: "AI Study Plan",
          body: `${aiPlan.summary}\n\n${Array.isArray(aiPlan.weeklyPlan) ? aiPlan.weeklyPlan.map((entry, index) => `${index + 1}. ${typeof entry === "string" ? entry : entry?.title ?? JSON.stringify(entry)}`).join("\n") : ""}`,
          tags: planTags,
          createdAt: new Date().toISOString(),
        },
        ...(current.secondBrainNotes ?? []),
      ],
    }));

    setActiveTab("second-brain");
    onToast?.("Saved AI plan into Second Brain");
  }

  const snippetLines = (snippetText || codeTrace.snippet || "").split("\n");

  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>{isSingleMethodView ? TAB_HERO[activeTab]?.title ?? "Study Method" : "Study Methods Lab"}</h2>
        <p className="muted">
          {isSingleMethodView
            ? TAB_HERO[activeTab]?.subtitle
            : "Leitner, SQ3R, Blurting, Interleaving, Second Brain, and Code-Trace in one place."}
        </p>
        <p className="muted" style={{ fontSize: "0.78rem", marginTop: "4px" }}>Study Methods {deployStamp}</p>
        <div className="flashcard-actions">
          <input
            id="study-methods-import"
            type="file"
            accept="application/json,.json"
            className="hidden-file-input"
            onChange={importStudyMethodsData}
          />
          <label htmlFor="study-methods-import" className="ghost-button">Import Methods Data</label>
          <button type="button" className="ghost-button" onClick={exportStudyMethodsData}>Export Methods Data</button>
        </div>
      </div>

      <article className="panel" style={{ marginBottom: "16px" }}>
        <h3 style={{ marginTop: 0 }}>AI Method Generator (Gemini / Groq)</h3>
        <p className="muted">Generate one optimized study pack and apply it to SQ3R, Interleaving, Blurting, and PARA notes using deployment-configured AI access.</p>
        <form className="stack-form" onSubmit={handleGenerateAIStudyPack}>
          <div className="flashcard-actions">
            <select value={aiProvider} onChange={(event) => setAiProvider(event.target.value)}>
              <option value="auto">Auto (best available)</option>
              <option value="gemini">Google Gemini</option>
              <option value="groq">Groq</option>
            </select>
          </div>
          <p className="muted" style={{ marginTop: "-2px" }}>
            Cloud AI runs automatically when deployment keys exist. If not, FocusFlow falls back to local smart generation from your text or PDF.
          </p>
          <textarea
            rows={4}
            value={aiInputText}
            onChange={(event) => setAiInputText(event.target.value)}
            placeholder="Paste topic notes, chapter text, or learning objectives"
          />
          <input type="file" accept=".txt,.md,.csv,.json,.pdf" onChange={(event) => setAiInputFile(event.target.files?.[0] ?? null)} />
          <div className="flashcard-actions">
            <button type="submit" className="accent-button" disabled={aiBusy}>{aiBusy ? "Generating..." : "Generate Study Pack"}</button>
            <button type="button" className="ghost-button" onClick={applyAIToSq3r} disabled={!aiPlan}>Apply to SQ3R</button>
            <button type="button" className="ghost-button" onClick={applyAIToInterleaving} disabled={!aiPlan}>Apply to Interleaving</button>
            <button type="button" className="ghost-button" onClick={applyAIToBlurting} disabled={!aiPlan}>Apply to Blurting</button>
            <button type="button" className="ghost-button" onClick={applyAIToSecondBrain} disabled={!aiPlan}>Save to PARA</button>
          </div>
        </form>

        {aiPlan && (
          <div className="list-block" style={{ marginTop: "10px" }}>
            <div className="list-item" style={{ display: "block" }}>
              <strong>AI Summary</strong>
              <p className="muted" style={{ marginTop: "6px" }}>{aiPlan.summary ?? "No summary returned"}</p>
              <p style={{ marginTop: "8px" }}><strong>Priority Topics:</strong> {Array.isArray(aiPlan.priorityTopics) ? aiPlan.priorityTopics.join(", ") : "None"}</p>
            </div>
          </div>
        )}
      </article>

      {!isSingleMethodView && (
        <article className="panel" style={{ marginBottom: "16px" }}>
          <div className="stat-grid">
            <div><span>Leitner Due</span><strong>{leitnerStats.dueToday}</strong></div>
            <div><span>SQ3R Sessions</span><strong>{sq3rEntries.length}</strong></div>
            <div><span>Blurting Recall</span><strong>{blurtingScore ?? "—"}{blurtingScore !== null ? "%" : ""}</strong></div>
            <div><span>Interleaving Topics</span><strong>{interleavingTopicPool.length}</strong></div>
            <div><span>PARA Notes</span><strong>{mixedNotes.length}</strong></div>
            <div><span>Code Annotations</span><strong>{(codeTrace.annotations ?? []).length}</strong></div>
          </div>
        </article>
      )}

      {!isSingleMethodView && (
        <article className="panel" style={{ marginBottom: "16px" }}>
          <div className="fc-tabs">
            {STUDY_TABS.map(([id, label], index) => (
              <button
                key={id}
                type="button"
                className={`fc-tab ${activeTab === id ? "is-active" : ""}`}
                onClick={() => setActiveTab(id)}
                title={`Shortcut: Alt+${index + 1}`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="muted" style={{ marginTop: "8px" }}>Shortcuts: Alt+1..Alt+6</p>
        </article>
      )}

      <article
        className="panel study-hero-banner"
        style={{
          marginBottom: "16px",
          background: TAB_HERO[activeTab]?.accent,
          animation: "studyHeroIn 320ms ease",
        }}
      >
        <h3 style={{ marginBottom: "4px" }}>{TAB_HERO[activeTab]?.title}</h3>
        <p className="muted" style={{ marginBottom: "0" }}>{TAB_HERO[activeTab]?.subtitle}</p>
      </article>

      {!isSingleMethodView && (
        <article className="panel" style={{ marginBottom: "16px" }}>
          <div className="feature-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div>
              <h3 style={{ marginTop: 0 }}>7-Day Leitner Forecast</h3>
              <svg viewBox="0 0 240 120" style={{ width: "100%", height: "120px" }}>
                {leitnerForecast.map((entry, index) => {
                  const max = Math.max(1, ...leitnerForecast.map((item) => item.count));
                  const x = 20 + index * 30;
                  const y = 100 - (entry.count / max) * 70;
                  return (
                    <g key={`lf-${entry.day}`}>
                      <rect x={x - 8} y={y} width="16" height={100 - y} fill="rgba(124,224,255,0.45)" />
                      <text x={x} y="112" textAnchor="middle" fontSize="8" fill="#9fb2d9">{entry.day.slice(5)}</text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div>
              <h3 style={{ marginTop: 0 }}>Recall Trendline</h3>
              <svg viewBox="0 0 240 120" style={{ width: "100%", height: "120px" }}>
                <polyline
                  fill="none"
                  stroke="#ffd36c"
                  strokeWidth="3"
                  points={recallTrend.length
                    ? recallTrend.map((entry, index) => `${20 + index * (200 / Math.max(1, recallTrend.length - 1))},${100 - (entry.score / 100) * 70}`).join(" ")
                    : "20,100 220,100"}
                />
                {recallTrend.map((entry, index) => {
                  const x = 20 + index * (200 / Math.max(1, recallTrend.length - 1));
                  const y = 100 - (entry.score / 100) * 70;
                  return <circle key={`rt-${entry.day}-${index}`} cx={x} cy={y} r="3" fill="#ffd36c" />;
                })}
              </svg>
            </div>

            <div>
              <h3 style={{ marginTop: 0 }}>Topic Weight Radar</h3>
              <svg viewBox="0 0 240 120" style={{ width: "100%", height: "120px" }}>
                {radarAxes.length > 0 ? (
                  <>
                    {radarAxes.map((axis, index) => {
                      const angle = (Math.PI * 2 * index) / radarAxes.length - Math.PI / 2;
                      const magnitude = (axis.weight / 10) * 38;
                      const x = 120 + Math.cos(angle) * magnitude;
                      const y = 60 + Math.sin(angle) * magnitude;
                      return <circle key={`ra-${axis.topic}`} cx={x} cy={y} r="4" fill="#56d77f" />;
                    })}
                    <polygon
                      fill="rgba(86,215,127,0.18)"
                      stroke="#56d77f"
                      strokeWidth="2"
                      points={radarAxes
                        .map((axis, index) => {
                          const angle = (Math.PI * 2 * index) / radarAxes.length - Math.PI / 2;
                          const magnitude = (axis.weight / 10) * 38;
                          const x = 120 + Math.cos(angle) * magnitude;
                          const y = 60 + Math.sin(angle) * magnitude;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                  </>
                ) : (
                  <text x="120" y="64" textAnchor="middle" fill="#9fb2d9" fontSize="11">No topics yet</text>
                )}
              </svg>
            </div>
          </div>
        </article>
      )}

      {activeTab === "leitner" && (
        <div className="feature-grid">
          <article className="panel">
            <h3>Leitner System (Digital Flashcards)</h3>
            <p className="muted">Cards move through boxes based on mastery. Higher boxes are reviewed less often.</p>
            <div className="flashcard-actions" style={{ marginBottom: "12px" }}>
              <button type="button" className="ghost-button" onClick={syncLeitnerRemindersToCalendar}>
                Sync Due Cards to Calendar
              </button>
              <button
                type="button"
                className={`ghost-button ${normalizedStudyLab.reminders?.autoSync ? "is-active" : ""}`}
                onClick={() => updateStudyLab((current) => ({
                  ...current,
                  reminders: {
                    ...(current.reminders ?? {}),
                    autoSync: !current.reminders?.autoSync,
                    lastSyncDay: current.reminders?.lastSyncDay ?? null,
                  },
                }))}
              >
                {normalizedStudyLab.reminders?.autoSync ? "Auto-Sync On" : "Auto-Sync Off"}
              </button>
              <span className="muted">
                Last Sync: {normalizedStudyLab.reminders?.lastSyncDay ?? "Never"}
              </span>
            </div>
            <div className="stat-grid">
              {[1, 2, 3, 4, 5].map((box) => (
                <div key={box}>
                  <span>Box {box} ({LEITNER_INTERVALS[box]}d)</span>
                  <strong>{leitnerStats.counts[box]}</strong>
                </div>
              ))}
              <div>
                <span>Due Today</span>
                <strong>{leitnerStats.dueToday}</strong>
              </div>
              <div>
                <span>Total Cards</span>
                <strong>{leitnerStats.total}</strong>
              </div>
            </div>
          </article>
          <article className="panel">
            <h3>Smart Review Queue</h3>
            <div className="list-block">
              {allCards
                .filter((card) => !card.dueDay || card.dueDay <= dayKey)
                .slice(0, 12)
                .map((card) => (
                  <div key={card.id} className="list-item">
                    <strong>{card.question}</strong>
                    <span>{card.setTitle} • Box {getLeitnerBox(card)} • due {card.dueDay ?? "today"}</span>
                  </div>
                ))}
              {!allCards.length && <p className="muted">Create flashcards first to activate the Leitner queue.</p>}
            </div>
          </article>
        </div>
      )}

      {activeTab === "sq3r" && (
        <div className="feature-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <article className="panel">
            <h3>SQ3R Reading Mode</h3>
            <form className="stack-form" onSubmit={addSq3rEntry}>
              <input value={sq3rDraft.title} onChange={(e) => setSq3rDraft((c) => ({ ...c, title: e.target.value }))} placeholder="Topic / Chapter" />
              <input value={sq3rDraft.source} onChange={(e) => setSq3rDraft((c) => ({ ...c, source: e.target.value }))} placeholder="Doc URL or source" />
              <textarea value={sq3rDraft.survey} onChange={(e) => setSq3rDraft((c) => ({ ...c, survey: e.target.value }))} placeholder="Survey: headings and structure" rows={3} />
              <textarea value={sq3rDraft.questions} onChange={(e) => setSq3rDraft((c) => ({ ...c, questions: e.target.value }))} placeholder="Questions from headings" rows={3} />
              <button type="button" className="ghost-button" onClick={generateSq3rQuestionsFromSurvey}>Auto-Generate Questions from Survey</button>
              {!!sq3rQuestionHints.length && (
                <div className="list-block">
                  {sq3rQuestionHints.map((hint, index) => (
                    <div key={`sq3r-hint-${index}`} className="list-item"><span>{hint}</span></div>
                  ))}
                </div>
              )}
              <textarea value={sq3rDraft.readNotes} onChange={(e) => setSq3rDraft((c) => ({ ...c, readNotes: e.target.value }))} placeholder="Read: key points" rows={3} />
              <textarea value={sq3rDraft.recite} onChange={(e) => setSq3rDraft((c) => ({ ...c, recite: e.target.value }))} placeholder="Recite: answer without looking" rows={3} />
              <textarea value={sq3rDraft.review} onChange={(e) => setSq3rDraft((c) => ({ ...c, review: e.target.value }))} placeholder="Review summary" rows={3} />
              <button type="submit" className="accent-button">Save SQ3R Session</button>
            </form>
          </article>
          <article className="panel">
            <h3>Saved SQ3R Sessions</h3>
            <div className="list-block">
              {sq3rEntries.map((entry) => (
                <div key={entry.id} className="list-item" style={{ alignItems: "flex-start", flexDirection: "column" }}>
                  <strong>{entry.title}</strong>
                  <span>{entry.source || "No source"}</span>
                  <span>Q: {entry.questions?.slice(0, 80) || "—"}</span>
                  <span>A: {entry.recite?.slice(0, 80) || "—"}</span>
                </div>
              ))}
              {!sq3rEntries.length && <p className="muted">No SQ3R sessions yet.</p>}
            </div>
          </article>
        </div>
      )}

      {activeTab === "blurting" && (
        <div className="feature-grid">
          <article className="panel">
            <h3>Active Recall Blurting</h3>
            <p className="muted">Study first, then blurt everything you remember with no reference visible.</p>
            <div className="stack-form">
              <label>Hidden Reference (saved answer key)</label>
              <textarea value={blurtingReference} onChange={(e) => setBlurtingReference(e.target.value)} rows={4} placeholder="Paste the reference notes to reveal after timer ends" />
              <label>Duration (minutes)</label>
              <input type="number" min="1" max="120" value={blurtingDuration} onChange={(e) => setBlurtingDuration(e.target.value)} />
              <div className="flashcard-actions">
                <button type="button" className="ghost-button" onClick={saveBlurtingReference}>Save Setup</button>
                <button type="button" className="accent-button" onClick={startBlurtingSession}>Start Blurting Timer</button>
              </div>
              <strong>{Math.floor(blurtingSecondsLeft / 60)}:{String(blurtingSecondsLeft % 60).padStart(2, "0")}</strong>
            </div>
          </article>
          <article className="panel">
            <h3>Your Blurt</h3>
            <textarea value={blurtingText} onChange={(e) => setBlurtingText(e.target.value)} rows={7} placeholder="Write everything you remember..." />
            <textarea value={blurtingMissed} onChange={(e) => setBlurtingMissed(e.target.value)} rows={4} placeholder="After checking reference, list missed points" style={{ marginTop: "10px" }} />
            <button type="button" className="ghost-button" style={{ marginTop: "10px" }} onClick={saveBlurtingReference}>Save Blurt</button>
            <div className="result-banner" style={{ marginTop: "10px", display: "block" }}>
              <strong>Recall Score</strong>
              <p style={{ marginTop: "6px" }}>{blurtingScore !== null ? `${blurtingScore}% keyword overlap with reference` : "Add reference and blurt to compute score"}</p>
            </div>
            {!blurtingRunning && blurtingSecondsLeft === 0 && (blurtingReference || normalizedStudyLab.blurting?.reference) && (
              <div className="result-banner" style={{ marginTop: "12px", display: "block" }}>
                <strong>Reference Revealed</strong>
                <p style={{ marginTop: "8px" }}>{blurtingReference || normalizedStudyLab.blurting?.reference}</p>
              </div>
            )}
          </article>
        </div>
      )}

      {activeTab === "interleaving" && (
        <div className="feature-grid">
          <article className="panel">
            <h3>Interleaving Study Mixer</h3>
            <p className="muted">Randomly rotates 3 topics with 25-minute blocks.</p>
            <div className="stack-form">
              <input
                value={mixerTopicsInput}
                onChange={(e) => setMixerTopicsInput(e.target.value)}
                placeholder="Add topics separated by comma"
              />
              <button type="button" className="ghost-button" onClick={addMixerTopics}>Add Topics</button>
              <div className="list-block">
                {interleavingTopicPool.slice(0, 12).map((topic) => (
                  <div key={topic} className="list-item" style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "8px", alignItems: "center" }}>
                    <strong>{topic}</strong>
                    <span className="muted">w</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={topicWeights[topic] ?? 1}
                      onChange={(e) => setTopicWeight(topic, e.target.value)}
                      style={{ width: "64px" }}
                      title={`Weight for ${topic}`}
                    />
                  </div>
                ))}
              </div>
              <p className="muted">Higher weight means higher chance to appear in the 3-topic mixer.</p>
              <button type="button" className="accent-button" onClick={buildMixerSession} disabled={interleavingTopicPool.length < 3}>
                Start 3-Topic Mixer
              </button>
            </div>
          </article>
          <article className="panel">
            <h3>Mixer Session</h3>
            {mixerCurrent ? (
              <div className="stack-form">
                <strong>Current: {mixerCurrent.topics[mixerCurrent.index]}</strong>
                <span>Block {mixerCurrent.index + 1}/3</span>
                <strong>{Math.floor(mixerSecondsLeft / 60)}:{String(mixerSecondsLeft % 60).padStart(2, "0")}</strong>
                <div className="flashcard-actions">
                  <button type="button" className="ghost-button" onClick={() => setMixerRunning((v) => !v)}>{mixerRunning ? "Pause" : "Resume"}</button>
                  <button type="button" className="ghost-button" onClick={() => rateCurrentMixerBlock("easy")}>Rated Easy</button>
                  <button type="button" className="ghost-button" onClick={() => rateCurrentMixerBlock("hard")}>Rated Hard</button>
                  <button type="button" className="accent-button" onClick={nextMixerBlock}>Next Block</button>
                </div>
              </div>
            ) : (
              <p className="muted">Start a mixer session to begin interleaving practice.</p>
            )}
          </article>
        </div>
      )}

      {activeTab === "second-brain" && (
        <div className="feature-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <article className="panel">
            <h3>Second Brain (PARA)</h3>
            <form className="stack-form" onSubmit={addSecondBrainNote}>
              <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Note title" />
              <textarea value={noteBody} onChange={(e) => setNoteBody(e.target.value)} rows={5} placeholder="Write your note" />
              <div className="flashcard-actions">
                {PARA_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleParaTag(tag.id)}
                    className="ghost-button"
                    style={{ borderColor: noteTags.includes(tag.id) ? tag.color : undefined, color: noteTags.includes(tag.id) ? tag.color : undefined }}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
              <button type="submit" className="accent-button">Save Tagged Note</button>
            </form>
          </article>
          <article className="panel">
            <h3>Tagged Notes</h3>
            <div className="flashcard-actions" style={{ marginBottom: "10px" }}>
              <input value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)} placeholder="Search notes" />
              <select value={noteFilterTag} onChange={(e) => setNoteFilterTag(e.target.value)}>
                <option value="all">All Tags</option>
                {PARA_TAGS.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.label}</option>
                ))}
              </select>
            </div>
            <div className="list-block">
              {filteredNotes.map((note) => (
                <div key={note.id} className="list-item" style={{ alignItems: "flex-start", flexDirection: "column" }}>
                  <strong>{note.title}</strong>
                  <span>{note.body.slice(0, 120)}</span>
                  <div className="flashcard-actions" style={{ marginTop: "6px" }}>
                    {(note.tags ?? []).map((tagId) => {
                      const tag = PARA_TAGS.find((entry) => entry.id === tagId);
                      if (!tag) return null;
                      return <span key={tag.id} className="preset-btn" style={{ borderColor: tag.color, color: tag.color }}>{tag.label}</span>;
                    })}
                    <button type="button" className="ghost-button" onClick={() => toggleArchiveNote(note.id)}>
                      {(note.tags ?? []).includes("archives") ? "Unarchive" : "Archive"}
                    </button>
                  </div>
                </div>
              ))}
              {!filteredNotes.length && <p className="muted">No PARA notes match your filter.</p>}
            </div>
          </article>
        </div>
      )}

      {activeTab === "code-trace" && (
        <div className="feature-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <article className="panel">
            <h3>Code-Trace Annotated Snippet</h3>
            <textarea value={snippetText} onChange={(e) => setSnippetText(e.target.value)} rows={10} placeholder="Paste code or text snippet" />
            <button type="button" className="ghost-button" style={{ marginTop: "8px" }} onClick={saveSnippet}>Save Snippet</button>
            <form className="stack-form" onSubmit={addCodeAnnotation} style={{ marginTop: "10px" }}>
              <div className="flashcard-actions">
                <input type="number" min="1" value={annotationDraft.start} onChange={(e) => setAnnotationDraft((c) => ({ ...c, start: e.target.value }))} placeholder="Start line" />
                <input type="number" min="1" value={annotationDraft.end} onChange={(e) => setAnnotationDraft((c) => ({ ...c, end: e.target.value }))} placeholder="End line" />
              </div>
              <textarea value={annotationDraft.note} onChange={(e) => setAnnotationDraft((c) => ({ ...c, note: e.target.value }))} rows={3} placeholder="Explain the logic from step A to B" />
              <button type="submit" className="accent-button">Add Annotation</button>
            </form>
            <div className="list-block" style={{ marginTop: "12px" }}>
              {(codeTrace.annotations ?? []).map((annotation) => (
                <button
                  key={annotation.id}
                  type="button"
                  className={`list-item ${selectedAnnotationId === annotation.id ? "is-active" : ""}`}
                  onClick={() => setSelectedAnnotationId(annotation.id)}
                >
                  <strong>L{annotation.start}-L{annotation.end}</strong>
                  <span>{annotation.note.slice(0, 80)}</span>
                </button>
              ))}
              {!(codeTrace.annotations ?? []).length && <p className="muted">No annotations yet.</p>}
            </div>
          </article>
          <article className="panel">
            <h3>Annotated View</h3>
            <pre style={{ whiteSpace: "pre-wrap", background: "rgba(7, 12, 30, 0.8)", borderRadius: "10px", padding: "12px", maxHeight: "420px", overflow: "auto" }}>
              {snippetLines.map((line, index) => {
                const lineNo = index + 1;
                const matching = (codeTrace.annotations ?? []).filter((entry) => lineNo >= entry.start && lineNo <= entry.end);
                const tooltip = matching.map((entry) => entry.note).join(" | ");
                const selected = matching.some((entry) => entry.id === selectedAnnotationId);
                return (
                  <div
                    key={`line-${lineNo}`}
                    title={tooltip || undefined}
                    style={{
                      background: selected
                        ? "rgba(255, 211, 108, 0.2)"
                        : matching.length
                          ? "rgba(124,224,255,0.12)"
                          : "transparent",
                    }}
                  >
                    <span style={{ color: "#9fb2d9", marginRight: "10px" }}>{String(lineNo).padStart(2, "0")}</span>
                    <span>{line}</span>
                  </div>
                );
              })}
            </pre>
          </article>
        </div>
      )}
    </section>
  );
}
