import { useEffect, useRef, useState } from "react";
import { BookOpen, Edit2, Plus, Trash2 } from "lucide-react";
import { getDefaultAIProvider } from "../services/aiGeneration";

function getComboRank(value) {
  if (value >= 10) return "Legendary";
  if (value >= 7) return "Rampage";
  if (value >= 5) return "Blazing";
  if (value >= 3) return "Combo";
  return null;
}

function getComboRankId(value) {
  if (value >= 10) return "legendary";
  if (value >= 7) return "rampage";
  if (value >= 5) return "blazing";
  if (value >= 3) return "combo";
  return "none";
}

function FlashcardsPage({
  pageMode = "study",
  state,
  activeSet,
  flashSession,
  newSetTitle,
  newCardQuestion,
  newCardAnswer,
  newCardChoices,
  editingCardId,
  studyFilter,
  onSetNewSetTitle,
  onSetNewCardQuestion,
  onSetNewCardAnswer,
  onSetNewCardChoices,
  onSetEditingCardId,
  onSetStudyFilter,
  onAddFlashcardSet,
  onOpenFlashcardsBuilder = () => {},
  onSelectSet,
  onDeleteSet,
  onAddFlashcardCard,
  onDuplicateCard,
  onMoveCard,
  onReorderCards,
  onDeleteCard,
  onUpdateCard,
  onStartFlashcardSession,
  onStartFiltered,
  onRestartMissedSession,
  onAnswerFlashcard,
  onAnswerOpenFlashcard,
  onNextFlashcard,
  onRateFlashcard,
  onImportCards,
  onExportCards,
  onImportFromText,
  onAIGenerateFlashcards,
  aiBusy,
  aiStatus,
  aiHealthLog,
  onClearAIHealthLog,
  weakAreaCount,
  onPracticeWeakAreas,
  soundEnabled,
  onToggleSoundEffects,
}) {
  const [openAnswer, setOpenAnswer] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [showPasteImport, setShowPasteImport] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiProvider, setAiProvider] = useState(() => getDefaultAIProvider());
  const [aiPromptText, setAiPromptText] = useState("");
  const [aiFile, setAiFile] = useState(null);
  const [aiCount, setAiCount] = useState("12");
  const [aiSetTitle, setAiSetTitle] = useState("");
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [editC, setEditC] = useState("");
  const [activeTab, setActiveTab] = useState("study"); // "study" | "builder" | "stats"
  const [builderTab, setBuilderTab] = useState("create"); // "create" | "edit" | "manage"
  const [createStep, setCreateStep] = useState(1);
  const [editStep, setEditStep] = useState(1);
  const [answerPulse, setAnswerPulse] = useState("idle");
  const [comboCount, setComboCount] = useState(0);
  const [newCardType, setNewCardType] = useState("basic");
  const [newMultiAnswers, setNewMultiAnswers] = useState("");
  const [newMatchingPairs, setNewMatchingPairs] = useState("");
  const [newSequenceItems, setNewSequenceItems] = useState("");
  const [editType, setEditType] = useState("basic");
  const [editMultiAnswers, setEditMultiAnswers] = useState("");
  const [editMatchingPairs, setEditMatchingPairs] = useState("");
  const [editSequenceItems, setEditSequenceItems] = useState("");
  const [studyPanelMaximized, setStudyPanelMaximized] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [multiResponseSelection, setMultiResponseSelection] = useState([]);
  const [matchingSelection, setMatchingSelection] = useState({});
  const [matchingOptions, setMatchingOptions] = useState([]);
  const [sequenceDraft, setSequenceDraft] = useState([]);
  const [newOptionDraft, setNewOptionDraft] = useState("");
  const [newChoiceItems, setNewChoiceItems] = useState([]);
  const [newMrqAnswers, setNewMrqAnswers] = useState([]);
  const [newPairDraft, setNewPairDraft] = useState({ left: "", right: "" });
  const [newPairs, setNewPairs] = useState([]);
  const [newSequenceDraft, setNewSequenceDraft] = useState("");
  const [newSequence, setNewSequence] = useState([]);
  const [editOptionDraft, setEditOptionDraft] = useState("");
  const [editChoiceItems, setEditChoiceItems] = useState([]);
  const [editMrqAnswers, setEditMrqAnswers] = useState([]);
  const [editPairDraft, setEditPairDraft] = useState({ left: "", right: "" });
  const [editPairs, setEditPairs] = useState([]);
  const [editSequenceDraft, setEditSequenceDraft] = useState("");
  const [editSequence, setEditSequence] = useState([]);
  const [draggedOptionIndex, setDraggedOptionIndex] = useState(null);
  const [draggedEditOptionIndex, setDraggedEditOptionIndex] = useState(null);
  const [draggedSequenceIndex, setDraggedSequenceIndex] = useState(null);
  const [draggedEditSequenceIndex, setDraggedEditSequenceIndex] = useState(null);
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [manageSearch, setManageSearch] = useState("");
  const [manageTypeFilter, setManageTypeFilter] = useState("all");
  const [manageSort, setManageSort] = useState("manual");
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [moveTargetSetId, setMoveTargetSetId] = useState("");
  const studyPanelRef = useRef(null);

  const currentCard = flashSession ? flashSession.deck[flashSession.index] : null;
  const cardType = currentCard?.type ?? (currentCard?.choices?.length > 1 ? "mcq" : "basic");
  const builderOnly = pageMode === "builder";
  const visibleTabs = builderOnly ? ["builder", "stats"] : ["study", "stats"];

  function parsePipeList(value) {
    return String(value ?? "")
      .split("|")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  function parseMatchingPairs(value) {
    return String(value ?? "")
      .split("|")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [left, right] = entry.split("=").map((part) => part?.trim() ?? "");
        return { left, right };
      })
      .filter((entry) => entry.left && entry.right);
  }

  function stringifyPairs(pairs) {
    return (pairs ?? []).map((entry) => `${entry.left}=${entry.right}`).join(" | ");
  }

  function reorderList(items, startIndex, endIndex) {
    if (startIndex === null || endIndex === null || startIndex === endIndex) {
      return items;
    }

    const next = [...items];
    const [moved] = next.splice(startIndex, 1);
    next.splice(endIndex, 0, moved);
    return next;
  }

  function buildPreviewCard(mode = "create") {
    const type = mode === "create" ? newCardType : editType;
    const question = mode === "create" ? newCardQuestion : editQ;
    const answer = mode === "create" ? newCardAnswer : editA;
    const choices = mode === "create" ? newChoiceItems : editChoiceItems;
    const answers = mode === "create" ? newMrqAnswers : editMrqAnswers;
    const pairs = mode === "create" ? newPairs : editPairs;
    const sequence = mode === "create" ? newSequence : editSequence;

    return {
      type,
      question,
      answer,
      choices,
      answers,
      pairs,
      sequence,
    };
  }

  function applyAnswerResult(isCorrect) {
    setAnswerPulse(isCorrect === true ? "correct" : isCorrect === false ? "wrong" : "idle");
    if (isCorrect === true) {
      setComboCount((prev) => prev + 1);
    } else if (isCorrect === false) {
      setComboCount(0);
    }
    return isCorrect;
  }

  function handleOpenSubmit(event) {
    event.preventDefault();
    if (!openAnswer.trim()) return;
    const isCorrect = onAnswerOpenFlashcard(openAnswer);
    applyAnswerResult(isCorrect);
    setOpenAnswer("");
    setFlipped(false);
  }

  function handleFlip() {
    setFlipped((prev) => !prev);
  }

  function handleAnswer(choice) {
    const isCorrect = onAnswerFlashcard(choice);
    applyAnswerResult(isCorrect);
    setFlipped(false);
  }

  function handleMultipleResponseToggle(choice) {
    setMultiResponseSelection((current) => (
      current.includes(choice)
        ? current.filter((entry) => entry !== choice)
        : [...current, choice]
    ));
  }

  function handleMultipleResponseSubmit() {
    if (!currentCard) return;
    const expected = [...new Set(currentCard.answers ?? [])].sort();
    const selected = [...new Set(multiResponseSelection)].sort();
    const isCorrect = expected.length > 0
      && expected.length === selected.length
      && expected.every((entry, index) => entry === selected[index]);
    const result = onAnswerFlashcard(isCorrect ? currentCard.answer : "__incorrect__");
    applyAnswerResult(result);
  }

  function handleMatchingSubmit() {
    if (!currentCard?.pairs?.length) return;
    const isCorrect = currentCard.pairs.every((pair) => matchingSelection[pair.left] === pair.right);
    const result = onAnswerFlashcard(isCorrect ? currentCard.answer : "__incorrect__");
    applyAnswerResult(result);
  }

  function moveSequenceItem(index, direction) {
    setSequenceDraft((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSequenceSubmit() {
    if (!currentCard?.sequence?.length) return;
    const expected = currentCard.sequence;
    const isCorrect = expected.length === sequenceDraft.length && expected.every((entry, index) => entry === sequenceDraft[index]);
    const result = onAnswerFlashcard(isCorrect ? currentCard.answer : "__incorrect__");
    applyAnswerResult(result);
  }

  function handleRate(rating) {
    onRateFlashcard(rating);
    setFlipped(false);
    setAnswerPulse("idle");
    if (rating === "again") {
      setComboCount(0);
    }
  }

  function handleEditStart(card) {
    setActiveTab("builder");
    setBuilderTab("edit");
    onSetEditingCardId(card.id);
    setEditType(card.type ?? "basic");
    setEditQ(card.question);
    setEditA(card.answer);
    const otherChoices = (card.choices ?? []).filter((c) => c !== card.answer);
    setEditC(otherChoices.join(" | "));
    setEditChoiceItems(otherChoices);
    setEditMrqAnswers(card.answers ?? []);
    setEditMultiAnswers((card.answers ?? []).join(" | "));
    setEditPairs(card.pairs ?? []);
    setEditMatchingPairs(stringifyPairs(card.pairs ?? []));
    setEditSequence(card.sequence ?? []);
    setEditSequenceItems((card.sequence ?? []).join(" | "));
  }

  function handleEditSave(cardId) {
    const resolvedChoices = editType === "mcq" || editType === "multiple-response"
      ? editChoiceItems
      : parsePipeList(editC);
    const resolvedAnswers = editType === "multiple-response"
      ? editMrqAnswers
      : parsePipeList(editMultiAnswers);
    const resolvedPairs = editType === "matching"
      ? editPairs
      : parseMatchingPairs(editMatchingPairs);
    const resolvedSequence = editType === "sequencing"
      ? editSequence
      : parsePipeList(editSequenceItems);

    onUpdateCard({
      id: cardId,
      question: editQ,
      answer: editA,
      choices: resolvedChoices,
      type: editType,
      answers: resolvedAnswers,
      pairs: resolvedPairs,
      sequence: resolvedSequence,
    });
    onSetEditingCardId(null);
  }

  function applyCardSort(sortMode) {
    const ordered = [...deckCards];
    if (sortMode === "question-asc") {
      ordered.sort((left, right) => left.question.localeCompare(right.question));
    } else if (sortMode === "question-desc") {
      ordered.sort((left, right) => right.question.localeCompare(left.question));
    } else if (sortMode === "type") {
      ordered.sort((left, right) => String(left.type ?? "basic").localeCompare(String(right.type ?? "basic")));
    } else if (sortMode === "strength") {
      ordered.sort((left, right) => (right.strength ?? 1) - (left.strength ?? 1));
    }

    onReorderCards?.(ordered.map((card) => card.id));
    setManageSort(sortMode);
  }

  function toggleManagedCard(cardId) {
    setSelectedCardIds((current) => (
      current.includes(cardId)
        ? current.filter((entry) => entry !== cardId)
        : [...current, cardId]
    ));
  }

  function duplicateSelectedCards() {
    selectedCardIds.forEach((cardId) => onDuplicateCard?.(cardId));
    setSelectedCardIds([]);
  }

  function deleteSelectedCards() {
    selectedCardIds.forEach((cardId) => onDeleteCard?.(cardId));
    setSelectedCardIds([]);
  }

  function moveSelectedCards() {
    if (!moveTargetSetId) {
      return;
    }

    selectedCardIds.forEach((cardId) => onMoveCard?.(cardId, moveTargetSetId));
    setSelectedCardIds([]);
    setMoveTargetSetId("");
  }

  function handleCreateCard(event) {
    event.preventDefault();

    const resolvedChoices = newCardType === "mcq" || newCardType === "multiple-response"
      ? newChoiceItems
      : parsePipeList(newCardChoices);
    const resolvedAnswers = newCardType === "multiple-response"
      ? newMrqAnswers
      : parsePipeList(newMultiAnswers);
    const resolvedPairs = newCardType === "matching"
      ? newPairs
      : parseMatchingPairs(newMatchingPairs);
    const resolvedSequence = newCardType === "sequencing"
      ? newSequence
      : parsePipeList(newSequenceItems);

    onAddFlashcardCard({
      question: newCardQuestion,
      answer: newCardAnswer,
      choices: resolvedChoices,
      type: newCardType,
      answers: resolvedAnswers,
      pairs: resolvedPairs,
      sequence: resolvedSequence,
    });

    onSetNewCardQuestion("");
    onSetNewCardAnswer("");
    onSetNewCardChoices("");
    setNewChoiceItems([]);
    setNewMrqAnswers([]);
    setNewPairs([]);
    setNewSequence([]);
    setNewOptionDraft("");
    setNewPairDraft({ left: "", right: "" });
    setNewSequenceDraft("");
    setNewMultiAnswers("");
    setNewMatchingPairs("");
    setNewSequenceItems("");
    setNewCardType("basic");
  }

  function handlePasteImport(event) {
    event.preventDefault();
    onImportFromText(pasteText);
    setPasteText("");
    setShowPasteImport(false);
  }

  async function handleAIGenerate(event) {
    event.preventDefault();
    if (!onAIGenerateFlashcards) {
      return;
    }

    await onAIGenerateFlashcards({
      provider: aiProvider,
      sourceText: aiPromptText,
      sourceFile: aiFile,
      cardCount: Math.max(3, Math.min(40, Number.parseInt(aiCount, 10) || 12)),
      createSetTitle: aiSetTitle,
    });

    setAiPromptText("");
    setAiFile(null);
  }

  useEffect(() => {
    if (answerPulse === "idle") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setAnswerPulse("idle"), 620);
    return () => window.clearTimeout(timeoutId);
  }, [answerPulse]);

  useEffect(() => {
    setActiveTab(builderOnly ? "builder" : "study");
    if (builderOnly) {
      setShowAiPanel(true);
      setStudyPanelMaximized(false);
    }
  }, [builderOnly]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsNativeFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  async function toggleNativeFullscreen() {
    if (!studyPanelRef.current) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await studyPanelRef.current.requestFullscreen();
    }
  }

  useEffect(() => {
    if (!currentCard) {
      setMultiResponseSelection([]);
      setMatchingSelection({});
      setMatchingOptions([]);
      setSequenceDraft([]);
      return;
    }

    if (cardType === "matching") {
      const options = (currentCard.pairs ?? []).map((pair) => pair.right).sort(() => Math.random() - 0.5);
      setMatchingOptions(options);
      setMatchingSelection({});
    }

    if (cardType === "sequencing") {
      const shuffled = [...(currentCard.sequence ?? [])].sort(() => Math.random() - 0.5);
      setSequenceDraft(shuffled);
    }

    setMultiResponseSelection([]);
  }, [currentCard?.id, cardType]);

  // Compute stats for active set
  const deckCards = activeSet?.cards ?? [];
  const hardCards = deckCards.filter((c) => (c.strength ?? 1) <= 1);
  const dueCards = deckCards.filter((c) => !c.dueDay || c.dueDay <= state.dayKey);
  const cardTypeCounts = deckCards.reduce((counts, card) => {
    const key = card.type ?? "basic";
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
  const managedCards = deckCards.filter((card) => {
    const matchesSearch = !manageSearch.trim()
      || card.question.toLowerCase().includes(manageSearch.toLowerCase())
      || String(card.answer ?? "").toLowerCase().includes(manageSearch.toLowerCase());
    const matchesType = manageTypeFilter === "all" || (card.type ?? "basic") === manageTypeFilter;
    return matchesSearch && matchesType;
  });
  const previewCard = buildPreviewCard(builderTab === "edit" ? "edit" : "create");
  const boxCounts = [1, 2, 3, 4, 5].reduce((acc, box) => ({ ...acc, [box]: 0 }), {});
  deckCards.forEach((card) => {
    const box = Math.min(5, Math.max(1, Number.isFinite(card.leitnerBox) ? card.leitnerBox : (card.strength ?? 1)));
    boxCounts[box] += 1;
  });
  const avgStrength = deckCards.length
    ? (deckCards.reduce((sum, c) => sum + (c.strength ?? 1), 0) / deckCards.length).toFixed(1)
    : 0;

  // Session stats
  const sessionProgress = flashSession
    ? `${flashSession.index + 1}/${flashSession.deck.length}`
    : null;
  const sessionAcc = flashSession?.answered
    ? Math.round((flashSession.correct / flashSession.answered) * 100)
    : null;
  const sessionStreak = flashSession?.streak ?? null;
  const sessionBestStreak = flashSession?.bestStreak ?? state.flashcards?.lastSession?.bestStreak ?? null;
  const aiTone = aiStatus?.state === "error"
    ? "#ff8f8f"
    : aiStatus?.state === "success"
      ? "#81f2a4"
      : "#ffe39a";
  const flashAiLog = (aiHealthLog ?? []).filter((entry) => entry.surface === "flashcards").slice(0, 5);
  const progressPct = flashSession?.deck?.length
    ? Math.round(((flashSession.index + 1) / flashSession.deck.length) * 100)
    : 0;
  const weakTopicEntries = Object.entries(state.flashcards?.weakStats?.byTopic ?? {}).sort((left, right) => right[1] - left[1]).slice(0, 3);
  const weakTypeEntries = Object.entries(state.flashcards?.weakStats?.byType ?? {}).sort((left, right) => right[1] - left[1]).slice(0, 3);
  const comboRank = getComboRank(comboCount);
  const comboRankId = getComboRankId(comboCount);
  const studyOptions = [
    { id: "all", label: "All Cards", count: deckCards.length, description: "Full deck review", recommended: true },
    { id: "hard", label: "Hard", count: hardCards.length, description: "Focus on your weakest cards" },
    { id: "due", label: "Due Today", count: dueCards.length, description: "Cards scheduled for review today" },
  ];
  const selectedStudyCount = studyFilter === "hard"
    ? hardCards.length
    : studyFilter === "due"
      ? dueCards.length
      : deckCards.length;
  const selectedStudyOption = studyOptions.find((option) => option.id === studyFilter) ?? studyOptions[0];

  useEffect(() => {
    if (!flashSession || !currentCard) {
      return undefined;
    }

    function handleStudyKeys(event) {
      const target = event.target;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }

      const key = event.key.toLowerCase();
      const code = event.code;
      const isKey1 = key === "1" || code === "Digit1" || code === "Numpad1";
      const isKey2 = key === "2" || code === "Digit2" || code === "Numpad2";
      const isKey3 = key === "3" || code === "Digit3" || code === "Numpad3";
      const isNext = key === "n" || code === "KeyN" || key === "arrowright";
      const isReveal = Boolean(flashSession.reveal);

      if (isReveal) {
        if (isKey1 || key === "a") {
          event.preventDefault();
          handleRate("again");
          return;
        }
        if (isKey2 || key === "h") {
          event.preventDefault();
          handleRate("hard");
          return;
        }
        if (isKey3 || key === "e") {
          event.preventDefault();
          handleRate("easy");
          return;
        }
        if (isNext) {
          event.preventDefault();
          onNextFlashcard();
          setFlipped(false);
        }
        return;
      }

      if (isKey1) {
        event.preventDefault();
        handleRate("again");
        return;
      }

      if (isKey2) {
        event.preventDefault();
        handleRate("hard");
        return;
      }

      if (isKey3) {
        event.preventDefault();
        handleRate("easy");
        return;
      }

      if (isNext) {
        event.preventDefault();
        onNextFlashcard();
        setFlipped(false);
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        handleFlip();
      }
    }

    window.addEventListener("keydown", handleStudyKeys);
    return () => window.removeEventListener("keydown", handleStudyKeys);
  }, [flashSession, currentCard, onNextFlashcard, handleRate]);

  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>{builderOnly ? "Flashcards Builder" : "Flashcards Lab"}</h2>
        <div className="flashcard-actions">
          <button type="button" className="ghost-button" onClick={onToggleSoundEffects}>
            SFX: {soundEnabled ? "On" : "Muted"}
          </button>
          <input
            id="flashcard-import"
            type="file"
            accept=".csv,text/csv"
            className="hidden-file-input"
            onChange={onImportCards}
          />
          <label htmlFor="flashcard-import" className="ghost-button">Import CSV</label>
          <button type="button" className="ghost-button" onClick={() => setShowPasteImport((v) => !v)}>Paste Import</button>
          <button type="button" className="ghost-button" onClick={onExportCards}>Export CSV</button>
        </div>
      </div>

      {builderOnly && (
        <>
          <div className="builder-workspace-bar" style={{ marginBottom: "10px" }}>
            <span className="arena-stats-heading">Workspace</span>
            <div className="arena-stat-chip"><span>Active Set</span><strong>{activeSet?.title ?? "—"}</strong></div>
            <div className="arena-stat-chip"><span>Cards</span><strong>{deckCards.length}</strong></div>
            <div className="arena-stat-chip"><span>Hard</span><strong>{hardCards.length}</strong></div>
            <div className="arena-stat-chip"><span>Types</span><strong>{Object.keys(cardTypeCounts).length || 0}</strong></div>
            <div className="arena-stat-chip"><span>Selected</span><strong>{selectedCardIds.length}</strong></div>
            <div className="arena-stat-chip"><span>Visible</span><strong>{managedCards.length}</strong></div>
            {previewCard.question && (
              <p className="muted" style={{ fontSize: "0.78rem", marginLeft: "8px" }}>
                Preview: <strong>{previewCard.question}</strong> → {previewCard.answer || "…"}
                {!!previewCard.choices?.length && ` (${previewCard.choices.join(" · ")})`}
              </p>
            )}
          </div>
          <div className="ai-builder-panel" style={{ marginBottom: "12px" }}>
            <div className="ai-builder-head">
              <strong>AI Flashcard Generator</strong>
            </div>
            <form onSubmit={handleAIGenerate} className="ai-builder-form">
              <div className="flashcard-actions">
                <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value)}>
                  <option value="auto">Auto</option>
                  <option value="gemini">Gemini</option>
                  <option value="groq">Groq</option>
                </select>
                <input value={aiCount} onChange={(e) => setAiCount(e.target.value)} type="number" min="3" max="40" placeholder="Card count" style={{ width: "90px" }} />
                <input value={aiSetTitle} onChange={(e) => setAiSetTitle(e.target.value)} placeholder="New set title (optional)" style={{ flex: 1 }} />
              </div>
              <textarea value={aiPromptText} onChange={(e) => setAiPromptText(e.target.value)} rows={3} placeholder="Paste notes or topic text to generate cards from…" />
              <div className="ai-builder-file-row">
                <input type="file" accept=".txt,.md,.csv,.json,.pdf" onChange={(e) => setAiFile(e.target.files?.[0] ?? null)} />
                <button type="submit" className="accent-button" disabled={Boolean(aiBusy)}>{aiBusy ? "Generating…" : "Generate"}</button>
              </div>
              {aiStatus && (
                <p className="muted" style={{ marginTop: "6px", color: aiTone, fontSize: "0.78rem" }}>
                  <strong>{aiStatus.badge}</strong> {aiStatus.message}{aiStatus.provider ? ` (${aiStatus.provider})` : ""}
                </p>
              )}
              {!!flashAiLog.length && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                  {flashAiLog.map((entry) => (
                    <span key={entry.id} className="arena-stat-chip" style={{ fontSize: "0.72rem" }}>
                      {entry.badge} · {entry.provider} · {entry.latencyClass}
                    </span>
                  ))}
                  <button type="button" className="ghost-button" style={{ fontSize: "0.72rem", padding: "4px 8px" }} onClick={onClearAIHealthLog}>Clear</button>
                </div>
              )}
            </form>
          </div>
        </>
      )}

      {showPasteImport && (
        <div className="panel paste-import-panel">
          <h3>Paste Import</h3>
          <p className="muted">One card per line: <code>Question[tab]Answer[tab]Choice2[tab]Choice3</code> or comma-separated.</p>
          <form onSubmit={handlePasteImport} className="stack-form">
            <textarea
              className="paste-import-textarea"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={"What is H2O?\tWater\tOxygen\tHydrogen\nCapital of France?\tParis\tLondon\tBerlin"}
              rows={6}
            />
            <div className="flashcard-actions">
              <button type="submit" className="accent-button">Import {pasteText.split("\n").filter(Boolean).length} rows</button>
              <button type="button" className="ghost-button" onClick={() => setShowPasteImport(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className={`fc-layout ${builderOnly ? "is-builder-page" : "is-study-expanded"}`}>
        {/* Left column: sets + cards */}
        <div className="fc-left">
          <article className="panel">
            <h3>Sets</h3>
            {builderOnly ? (
              <form className="stack-form" onSubmit={onAddFlashcardSet}>
                <input value={newSetTitle} onChange={(e) => onSetNewSetTitle(e.target.value)} placeholder="Set name (e.g. Thermodynamics)" />
                <button type="submit" className="ghost-button"><Plus size={14} /> Create Set</button>
              </form>
            ) : (
              <div className="stack-form">
                <button type="button" className="ghost-button" onClick={onOpenFlashcardsBuilder}>
                  <Plus size={14} /> Open Flashcard Builder
                </button>
              </div>
            )}
            {!builderOnly && (
              <div className="fc-set-start-wrap">
                <button
                  type="button"
                  className="accent-button fc-set-start-btn"
                  onClick={() => onStartFiltered(studyFilter)}
                  disabled={!activeSet || selectedStudyCount === 0}
                >
                  Start Session
                  <span>{selectedStudyCount} cards</span>
                </button>
                <p className="muted">Start from here after selecting your set.</p>
              </div>
            )}
            <div className="list-block">
              {state.flashcards.sets.map((setEntry) => (
                <div key={setEntry.id} className="fc-set-row">
                  <button
                    type="button"
                    className={`list-item ${setEntry.id === state.flashcards.activeSetId ? "is-active" : ""}`}
                    onClick={() => onSelectSet(setEntry.id)}
                  >
                    <strong>{setEntry.title}</strong>
                    <span>{setEntry.cards.length} cards</span>
                  </button>
                  <button
                    type="button"
                    className="icon-danger-btn"
                    onClick={() => onDeleteSet(setEntry.id)}
                    title="Delete set"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {!state.flashcards.sets.length && <p className="muted">No sets yet.</p>}
            </div>
          </article>

          {/* Tabs for cards/study/stats */}
          {activeSet && (
            <article className="panel">
              <div className="fc-tabs">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`fc-tab ${activeTab === tab ? "is-active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "study" ? "Study" : tab === "builder" ? "Builder" : "Stats"}
                  </button>
                ))}
              </div>

              {activeTab === "builder" && (
                <div className="fc-tab-panel">
                  <div className="fc-tabs">
                    {[
                      ["create", "Create"],
                      ["edit", "Edit"],
                      ["manage", "Manage"],
                    ].map(([tabId, label]) => (
                      <button
                        key={tabId}
                        type="button"
                        className={`fc-tab ${builderTab === tabId ? "is-active" : ""}`}
                        onClick={() => setBuilderTab(tabId)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {builderTab === "create" && (
                    <form className="stack-form" onSubmit={handleCreateCard}>
                      <div className="builder-stepper">
                        {[1, 2, 3].map((step) => (
                          <button key={step} type="button" className={`fc-tab ${createStep === step ? "is-active" : ""}`} onClick={() => setCreateStep(step)}>
                            {step === 1 ? "Details" : step === 2 ? "Content" : "Review"}
                          </button>
                        ))}
                      </div>
                      {createStep === 1 && (
                        <>
                          <select value={newCardType} onChange={(e) => setNewCardType(e.target.value)}>
                            <option value="basic">Basic</option>
                            <option value="mcq">Multiple Choice</option>
                            <option value="true-false">True / False</option>
                            <option value="multiple-response">Multiple Response</option>
                            <option value="matching">Matching</option>
                            <option value="sequencing">Sequencing / Ordering</option>
                          </select>
                          <input value={newCardQuestion} onChange={(e) => onSetNewCardQuestion(e.target.value)} placeholder="Question" />
                          {(newCardType === "basic" || newCardType === "mcq" || newCardType === "true-false") && (
                            <input value={newCardAnswer} onChange={(e) => onSetNewCardAnswer(e.target.value)} placeholder={newCardType === "true-false" ? "Correct answer: True or False" : "Correct answer"} />
                          )}
                        </>
                      )}
                      {createStep === 2 && (
                        <>
                          {newCardType === "mcq" && (
                            <div className="builder-choices-panel">
                              <div className="inline-form">
                                <input value={newOptionDraft} onChange={(e) => setNewOptionDraft(e.target.value)} placeholder="Add option" />
                                <button type="button" className="ghost-button" onClick={() => {
                                  const value = newOptionDraft.trim();
                                  if (!value) return;
                                  const next = [...newChoiceItems, value];
                                  setNewChoiceItems(next);
                                  onSetNewCardChoices(next.join(" | "));
                                  setNewOptionDraft("");
                                }}>
                                  Add Option
                                </button>
                              </div>
                              <div className="list-block">
                                {newChoiceItems.map((choice, index) => (
                                  <div
                                    key={`${choice}-${index}`}
                                    className="list-item-with-action builder-sortable-item"
                                    draggable
                                    onDragStart={() => setDraggedOptionIndex(index)}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={() => {
                                      const next = reorderList(newChoiceItems, draggedOptionIndex, index);
                                      setNewChoiceItems(next);
                                      onSetNewCardChoices(next.join(" | "));
                                      setDraggedOptionIndex(null);
                                    }}
                                  >
                                    <div className="list-item"><strong>Drag</strong><span>{choice}</span></div>
                                    <button type="button" className="icon-danger-btn" onClick={() => {
                                      const next = newChoiceItems.filter((_, optionIndex) => optionIndex !== index);
                                      setNewChoiceItems(next);
                                      onSetNewCardChoices(next.join(" | "));
                                    }}><Trash2 size={13} /></button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {newCardType === "multiple-response" && (
                            <div className="builder-choices-panel">
                              <div className="inline-form">
                                <input value={newOptionDraft} onChange={(e) => setNewOptionDraft(e.target.value)} placeholder="Add selectable option" />
                                <button type="button" className="ghost-button" onClick={() => {
                                  const value = newOptionDraft.trim();
                                  if (!value) return;
                                  const next = [...newChoiceItems, value];
                                  setNewChoiceItems(next);
                                  onSetNewCardChoices(next.join(" | "));
                                  setNewOptionDraft("");
                                }}>Add Option</button>
                              </div>
                              <div className="list-block">
                                {newChoiceItems.map((choice, index) => (
                                  <label key={`${choice}-${index}`} className="mrq-option">
                                    <input type="checkbox" checked={newMrqAnswers.includes(choice)} onChange={() => {
                                      const next = newMrqAnswers.includes(choice)
                                        ? newMrqAnswers.filter((entry) => entry !== choice)
                                        : [...newMrqAnswers, choice];
                                      setNewMrqAnswers(next);
                                      setNewMultiAnswers(next.join(" | "));
                                    }} />
                                    <span>{choice}</span>
                                    <button type="button" className="icon-danger-btn" onClick={() => {
                                      const nextChoices = newChoiceItems.filter((_, optionIndex) => optionIndex !== index);
                                      const nextAnswers = newMrqAnswers.filter((entry) => entry !== choice);
                                      setNewChoiceItems(nextChoices);
                                      setNewMrqAnswers(nextAnswers);
                                      onSetNewCardChoices(nextChoices.join(" | "));
                                      setNewMultiAnswers(nextAnswers.join(" | "));
                                    }}><Trash2 size={13} /></button>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          {newCardType === "matching" && (
                            <div className="builder-choices-panel">
                              <div className="inline-form">
                                <input value={newPairDraft.left} onChange={(e) => setNewPairDraft((current) => ({ ...current, left: e.target.value }))} placeholder="Left term" />
                                <input value={newPairDraft.right} onChange={(e) => setNewPairDraft((current) => ({ ...current, right: e.target.value }))} placeholder="Right match" />
                                <button type="button" className="ghost-button" onClick={() => {
                                  const left = newPairDraft.left.trim();
                                  const right = newPairDraft.right.trim();
                                  if (!left || !right) return;
                                  const next = [...newPairs, { left, right }];
                                  setNewPairs(next);
                                  setNewMatchingPairs(stringifyPairs(next));
                                  setNewPairDraft({ left: "", right: "" });
                                }}>Add Pair</button>
                              </div>
                              <div className="list-block">
                                {newPairs.map((pair, index) => (
                                  <div key={`${pair.left}-${pair.right}-${index}`} className="list-item-with-action">
                                    <div className="list-item"><strong>{pair.left}</strong><span>{pair.right}</span></div>
                                    <button type="button" className="icon-danger-btn" onClick={() => {
                                      const next = newPairs.filter((_, pairIndex) => pairIndex !== index);
                                      setNewPairs(next);
                                      setNewMatchingPairs(stringifyPairs(next));
                                    }}><Trash2 size={13} /></button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {newCardType === "sequencing" && (
                            <div className="builder-choices-panel">
                              <div className="inline-form">
                                <input value={newSequenceDraft} onChange={(e) => setNewSequenceDraft(e.target.value)} placeholder="Add step in correct order" />
                                <button type="button" className="ghost-button" onClick={() => {
                                  const value = newSequenceDraft.trim();
                                  if (!value) return;
                                  const next = [...newSequence, value];
                                  setNewSequence(next);
                                  setNewSequenceItems(next.join(" | "));
                                  setNewSequenceDraft("");
                                }}>Add Step</button>
                              </div>
                              <div className="list-block">
                                {newSequence.map((step, index) => (
                                  <div
                                    key={`${step}-${index}`}
                                    className="list-item-with-action builder-sortable-item"
                                    draggable
                                    onDragStart={() => setDraggedSequenceIndex(index)}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={() => {
                                      const next = reorderList(newSequence, draggedSequenceIndex, index);
                                      setNewSequence(next);
                                      setNewSequenceItems(next.join(" | "));
                                      setDraggedSequenceIndex(null);
                                    }}
                                  >
                                    <div className="list-item"><strong>{index + 1}</strong><span>{step}</span></div>
                                    <button type="button" className="icon-danger-btn" onClick={() => {
                                      const next = newSequence.filter((_, stepIndex) => stepIndex !== index);
                                      setNewSequence(next);
                                      setNewSequenceItems(next.join(" | "));
                                    }}><Trash2 size={13} /></button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {createStep === 3 && (
                        <div className="builder-review-card">
                          <strong>{previewCard.question || "Untitled card"}</strong>
                          <p className="muted">Type: {previewCard.type}</p>
                          <p className="muted">Answer: {previewCard.answer || "No answer yet"}</p>
                          {!!previewCard.choices?.length && <p className="muted">Choices: {previewCard.choices.join(" • ")}</p>}
                          {!!previewCard.answers?.length && <p className="muted">Correct selections: {previewCard.answers.join(" • ")}</p>}
                          {!!previewCard.sequence?.length && <p className="muted">Sequence: {previewCard.sequence.join(" → ")}</p>}
                          {!!previewCard.pairs?.length && <p className="muted">Pairs: {previewCard.pairs.map((pair) => `${pair.left} → ${pair.right}`).join(" • ")}</p>}
                        </div>
                      )}
                      <div className="fc-edit-actions">
                        <button type="button" className="ghost-button" onClick={() => setCreateStep((current) => Math.max(1, current - 1))} disabled={createStep === 1}>Back</button>
                        {createStep < 3 ? (
                          <button type="button" className="accent-button" onClick={() => setCreateStep((current) => Math.min(3, current + 1))}>Next</button>
                        ) : (
                          <button type="submit" className="accent-button"><Plus size={14} /> Add Card</button>
                        )}
                      </div>
                    </form>
                  )}

                  {builderTab === "edit" && (
                    <div className="stack-form">
                      {!editingCardId && <p className="muted">Select a card below to edit in this builder panel.</p>}
                      {editingCardId && (
                        <div className="fc-card-edit">
                          <div className="builder-stepper">
                            {[1, 2, 3].map((step) => (
                              <button key={step} type="button" className={`fc-tab ${editStep === step ? "is-active" : ""}`} onClick={() => setEditStep(step)}>
                                {step === 1 ? "Details" : step === 2 ? "Content" : "Review"}
                              </button>
                            ))}
                          </div>
                          {editStep === 1 && (
                            <>
                              <select value={editType} onChange={(e) => setEditType(e.target.value)}>
                                <option value="basic">Basic</option>
                                <option value="mcq">Multiple Choice</option>
                                <option value="true-false">True / False</option>
                                <option value="multiple-response">Multiple Response</option>
                                <option value="matching">Matching</option>
                                <option value="sequencing">Sequencing</option>
                              </select>
                              <input value={editQ} onChange={(e) => setEditQ(e.target.value)} placeholder="Question" />
                              {(editType === "basic" || editType === "mcq" || editType === "true-false") && (
                                <input value={editA} onChange={(e) => setEditA(e.target.value)} placeholder="Answer" />
                              )}
                            </>
                          )}
                          {editStep === 2 && editType === "mcq" && (
                            <div className="builder-choices-panel">
                              <div className="inline-form">
                                <input value={editOptionInput} onChange={(e) => setEditOptionInput(e.target.value)} placeholder="Add option" />
                                <button type="button" className="ghost-button" onClick={() => {
                                  const value = editOptionInput.trim();
                                  if (!value) return;
                                  setEditChoiceItems((current) => [...current, value]);
                                  setEditOptionInput("");
                                }}>Add Option</button>
                              </div>
                              <div className="list-block">
                                {editChoiceItems.map((choice, index) => (
                                  <div
                                    key={`${choice}-${index}`}
                                    className="list-item-with-action builder-sortable-item"
                                    draggable
                                    onDragStart={() => setDraggedEditOptionIndex(index)}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={() => {
                                      setEditChoiceItems((current) => reorderList(current, draggedEditOptionIndex, index));
                                      setDraggedEditOptionIndex(null);
                                    }}
                                  >
                                    <div className="list-item"><strong>Drag</strong><span>{choice}</span></div>
                                    <button type="button" className="icon-danger-btn" onClick={() => setEditChoiceItems((current) => current.filter((_, optionIndex) => optionIndex !== index))}><Trash2 size={13} /></button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {editStep === 2 && editType === "sequencing" && (
                            <div className="builder-choices-panel">
                              <div className="inline-form">
                                <input value={editSequenceDraft} onChange={(e) => setEditSequenceDraft(e.target.value)} placeholder="Add step" />
                                <button type="button" className="ghost-button" onClick={() => {
                                  const value = editSequenceDraft.trim();
                                  if (!value) return;
                                  setEditSequence((current) => [...current, value]);
                                  setEditSequenceDraft("");
                                }}>Add Step</button>
                              </div>
                              <div className="list-block">
                                {editSequence.map((step, index) => (
                                  <div
                                    key={`${step}-${index}`}
                                    className="list-item-with-action builder-sortable-item"
                                    draggable
                                    onDragStart={() => setDraggedEditSequenceIndex(index)}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={() => {
                                      setEditSequence((current) => reorderList(current, draggedEditSequenceIndex, index));
                                      setDraggedEditSequenceIndex(null);
                                    }}
                                  >
                                    <div className="list-item"><strong>{index + 1}</strong><span>{step}</span></div>
                                    <button type="button" className="icon-danger-btn" onClick={() => setEditSequence((current) => current.filter((_, stepIndex) => stepIndex !== index))}><Trash2 size={13} /></button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {editStep === 3 && (
                            <div className="builder-review-card">
                              <strong>{previewCard.question || "Untitled card"}</strong>
                              <p className="muted">Type: {previewCard.type}</p>
                              <p className="muted">Answer: {previewCard.answer || "No answer yet"}</p>
                              {!!previewCard.choices?.length && <p className="muted">Choices: {previewCard.choices.join(" • ")}</p>}
                              {!!previewCard.sequence?.length && <p className="muted">Sequence: {previewCard.sequence.join(" → ")}</p>}
                            </div>
                          )}
                          <div className="fc-edit-actions">
                            <button type="button" className="ghost-button" onClick={() => setEditStep((current) => Math.max(1, current - 1))} disabled={editStep === 1}>Back</button>
                            {editStep < 3 ? (
                              <button type="button" className="accent-button" onClick={() => setEditStep((current) => Math.min(3, current + 1))}>Next</button>
                            ) : (
                              <button type="button" className="accent-button" onClick={() => handleEditSave(editingCardId)}>Save</button>
                            )}
                            <button type="button" className="ghost-button" onClick={() => onSetEditingCardId(null)}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {builderTab === "manage" && (
                    <div className="stack-form">
                      <div className="flashcard-actions">
                        <input value={manageSearch} onChange={(e) => setManageSearch(e.target.value)} placeholder="Search cards" />
                        <select value={manageTypeFilter} onChange={(e) => setManageTypeFilter(e.target.value)}>
                          <option value="all">All types</option>
                          {Object.keys(cardTypeCounts).map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <select value={manageSort} onChange={(e) => applyCardSort(e.target.value)}>
                          <option value="manual">Manual order</option>
                          <option value="question-asc">Question A-Z</option>
                          <option value="question-desc">Question Z-A</option>
                          <option value="type">Sort by type</option>
                          <option value="strength">Sort by strength</option>
                        </select>
                      </div>
                      <div className="flashcard-actions">
                        <button type="button" className="ghost-button" onClick={() => setSelectedCardIds(managedCards.map((card) => card.id))}>Select Visible</button>
                        <button type="button" className="ghost-button" onClick={() => setSelectedCardIds([])}>Clear</button>
                        <button type="button" className="ghost-button" onClick={duplicateSelectedCards} disabled={!selectedCardIds.length}>Duplicate</button>
                        <button type="button" className="ghost-button" onClick={deleteSelectedCards} disabled={!selectedCardIds.length}>Delete</button>
                      </div>
                      <div className="flashcard-actions">
                        <select value={moveTargetSetId} onChange={(e) => setMoveTargetSetId(e.target.value)}>
                          <option value="">Move selected to...</option>
                          {state.flashcards.sets.filter((setEntry) => setEntry.id !== activeSet?.id).map((setEntry) => (
                            <option key={setEntry.id} value={setEntry.id}>{setEntry.title}</option>
                          ))}
                        </select>
                        <button type="button" className="accent-button" onClick={moveSelectedCards} disabled={!selectedCardIds.length || !moveTargetSetId}>Move</button>
                      </div>
                      <div className="list-block">
                        {managedCards.map((card, index) => (
                          <div
                            key={card.id}
                            className="list-item-with-action builder-sortable-item"
                            draggable
                            onDragStart={() => setDraggedCardId(card.id)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => {
                              const sourceIndex = deckCards.findIndex((entry) => entry.id === draggedCardId);
                              const targetIndex = deckCards.findIndex((entry) => entry.id === card.id);
                              const reordered = reorderList(deckCards.map((entry) => entry.id), sourceIndex, targetIndex);
                              onReorderCards?.(reordered);
                              setDraggedCardId(null);
                            }}
                          >
                            <label className="list-item" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <input type="checkbox" checked={selectedCardIds.includes(card.id)} onChange={() => toggleManagedCard(card.id)} />
                              <span>{index + 1}. {card.question}</span>
                            </label>
                            <button type="button" className="icon-btn" onClick={() => onDuplicateCard?.(card.id)} title="Duplicate"><Plus size={13} /></button>
                            <button type="button" className="icon-btn" onClick={() => handleEditStart(card)} title="Edit"><Edit2 size={13} /></button>
                            <button type="button" className="icon-danger-btn" onClick={() => onDeleteCard(card.id)} title="Delete"><Trash2 size={13} /></button>
                          </div>
                        ))}
                        {!managedCards.length && <p className="muted">No cards match the current filters.</p>}
                      </div>
                    </div>
                  )}

                  <p className="muted">Tip: use advanced types for richer recall checks and exam-style drills.</p>
                  <div className="fc-card-list">
                    {deckCards.map((card) => (
                      <div key={card.id} className="fc-card-item">
                        <div className="fc-card-body">
                          <strong>{card.question}</strong>
                          <span className="muted">{card.answer}</span>
                          <div className="fc-card-meta">
                            <span className={`fc-strength fc-strength--${card.type ?? "basic"}`}>{card.type ?? "basic"}</span>
                            {card.type === "multiple-response" && <span className="fc-strength">{card.answers?.length ?? 0} answers</span>}
                            {card.type === "matching" && <span className="fc-strength">{card.pairs?.length ?? 0} pairs</span>}
                            {card.type === "sequencing" && <span className="fc-strength">{card.sequence?.length ?? 0} steps</span>}
                            <span className="fc-strength">str {card.strength ?? 1}</span>
                          </div>
                        </div>
                        <div className="fc-card-actions">
                          <button type="button" className="icon-btn" onClick={() => handleEditStart(card)} title="Edit"><Edit2 size={13} /></button>
                          <button type="button" className="icon-danger-btn" onClick={() => onDeleteCard(card.id)} title="Delete"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                    {!deckCards.length && <p className="muted">No cards yet.</p>}
                  </div>
                </div>
              )}

              {activeTab === "study" && (
                <div className="fc-study-compact">
                  <p className="pill-inline">Study Setup</p>
                  <h3>Choose Cards to Study</h3>
                  <p className="muted">Current: {selectedStudyOption.label} ({selectedStudyCount} cards)</p>
                  <div className="fc-filter-picker fc-filter-picker--compact" role="tablist" aria-label="Choose cards to study">
                    {studyOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`fc-filter-chip fc-filter-chip--compact ${studyFilter === option.id ? "is-active" : ""}`}
                        onClick={() => onSetStudyFilter(option.id)}
                      >
                        <strong>{option.label}</strong>
                        <span>{option.count} cards</span>
                      </button>
                    ))}
                  </div>
                  <div className="fc-secondary-actions">
                    {(state.flashcards?.lastSession?.missedCardIds?.length ?? 0) > 0 && (
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={onRestartMissedSession}
                      >
                        Review Missed ({state.flashcards.lastSession.missedCardIds.length})
                      </button>
                    )}
                    {weakAreaCount > 0 && (
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={onPracticeWeakAreas}
                      >
                        Practice Weak Areas ({weakAreaCount})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "stats" && (
                <div className="fc-stats-shell">
                  <div className="fc-stats-hero">
                    <div>
                      <p className="pill-inline">Performance Snapshot</p>
                      <h3>Study Health</h3>
                    </div>
                    <div className="fc-stats-hero-metrics">
                      <div><span>Session Accuracy</span><strong>{sessionAcc !== null ? `${sessionAcc}%` : "—"}</strong></div>
                      <div><span>Progress</span><strong>{sessionProgress ?? "—"}</strong></div>
                    </div>
                  </div>

                  <div className="fc-stats-grid fc-stats-grid--enhanced">
                    <div className="stat-card"><span>Total Cards</span><strong>{deckCards.length}</strong></div>
                    <div className="stat-card"><span>Hard Cards</span><strong>{hardCards.length}</strong></div>
                    <div className="stat-card"><span>Due Today</span><strong>{dueCards.length}</strong></div>
                    <div className="stat-card"><span>Avg Strength</span><strong>{avgStrength}</strong></div>
                    <div className="stat-card"><span>Current Streak</span><strong>{sessionStreak ?? "—"}</strong></div>
                    <div className="stat-card"><span>Best Streak</span><strong>{sessionBestStreak ?? "—"}</strong></div>
                    <div className="stat-card"><span>Leitner Box 1</span><strong>{boxCounts[1]}</strong></div>
                    <div className="stat-card"><span>Leitner Box 2</span><strong>{boxCounts[2]}</strong></div>
                    <div className="stat-card"><span>Leitner Box 3</span><strong>{boxCounts[3]}</strong></div>
                    <div className="stat-card"><span>Leitner Box 4</span><strong>{boxCounts[4]}</strong></div>
                    <div className="stat-card"><span>Leitner Box 5</span><strong>{boxCounts[5]}</strong></div>
                  </div>

                  <div className="fc-weakness-grid">
                    <article className="panel">
                      <h3>Top Weak Topics</h3>
                      <div className="list-block">
                        {weakTopicEntries.map(([topic, count]) => (
                          <div key={topic} className="list-item">
                            <strong>{topic}</strong>
                            <span>{count} misses</span>
                          </div>
                        ))}
                        {!weakTopicEntries.length && <p className="muted">No weakness trend yet.</p>}
                      </div>
                    </article>
                    <article className="panel">
                      <h3>Top Weak Types</h3>
                      <div className="list-block">
                        {weakTypeEntries.map(([type, count]) => (
                          <div key={type} className="list-item">
                            <strong>{type}</strong>
                            <span>{count} misses</span>
                          </div>
                        ))}
                        {!weakTypeEntries.length && <p className="muted">No weakness trend yet.</p>}
                      </div>
                    </article>
                  </div>
                </div>
              )}
            </article>
          )}
        </div>

        {/* Right column: study mode */}
        <div className="fc-right">
          {!builderOnly && (
          <>
          {studyPanelMaximized && <div className="study-window-backdrop" onClick={() => setStudyPanelMaximized(false)} />}
          <article ref={studyPanelRef} className={`panel fc-study-panel ${studyPanelMaximized ? "is-windowed" : ""} feedback-mode-standard rank-fx-${comboRankId} ${answerPulse === "correct" ? "is-correct" : answerPulse === "wrong" ? "is-wrong" : ""}`}>
            <div className="fc-study-header">
              <h3>Study Mode</h3>
              {sessionProgress && (
                <div className="fc-session-meta">
                  <span>{sessionProgress}</span>
                  {sessionAcc !== null && <span>{sessionAcc}% acc</span>}
                </div>
              )}
              <div className="flashcard-actions" style={{ marginLeft: "auto" }}>
                <button type="button" className="ghost-button" onClick={() => setStudyPanelMaximized((prev) => !prev)}>
                  {studyPanelMaximized ? "Exit Window" : "Near Fullscreen"}
                </button>
                <button type="button" className="ghost-button" onClick={toggleNativeFullscreen}>
                  {isNativeFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </button>
              </div>
            </div>
            {flashSession && (
              <div style={{ marginBottom: "10px" }}>
                <div style={{ height: "8px", borderRadius: "999px", background: "rgba(124, 224, 255, 0.18)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${progressPct}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #63c7ff, #56d77f)",
                      transition: "width 220ms ease",
                    }}
                  />
                </div>
                <p className="muted" style={{ marginTop: "6px" }}>
                  Shortcuts: space=flip, 1/2/3=again-hard-easy after reveal, n=next.
                </p>
              </div>
            )}

            {currentCard ? (
              <div className="fc-flashcard-wrapper">
                <div
                  className={`fc-flashcard ${flipped ? "is-flipped" : ""}`}
                  onClick={handleFlip}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleFlip()}
                >
                  <div className="fc-flashcard__front">
                    <p className="fc-question">{currentCard.question}</p>
                    {!flashSession.reveal && (
                      <span className="fc-flip-hint">Click to flip</span>
                    )}
                  </div>
                  <div className="fc-flashcard__back">
                    <p className="fc-answer">{currentCard.answer}</p>
                  </div>
                </div>

                {!flashSession.reveal && flipped && (
                  <div className="fc-self-rate">
                    <p className="muted">How well did you know this?</p>
                    <div className="sm2-buttons">
                      <button type="button" className="ghost-button sm2-again" onClick={() => handleRate("again")}>Again</button>
                      <button type="button" className="ghost-button sm2-hard" onClick={() => handleRate("hard")}>Hard</button>
                      <button type="button" className="accent-button sm2-easy" onClick={() => handleRate("easy")}>Easy</button>
                    </div>
                  </div>
                )}

                {!flashSession.reveal && (
                  <form className="open-answer-form" onSubmit={handleOpenSubmit}>
                    <input
                      value={openAnswer}
                      onChange={(e) => setOpenAnswer(e.target.value)}
                      className="open-answer-input"
                      placeholder="Type your answer, then press Check"
                    />
                    <button type="submit" className="accent-button">Check</button>
                  </form>
                )}

                {flashSession.reveal && (
                  <div className="result-banner result-banner--stack">
                    <span>
                      Answer: <strong>{currentCard.answer}</strong>
                    </span>
                    <div className="sm2-buttons">
                      <button type="button" className="ghost-button sm2-again" onClick={() => handleRate("again")}>Again</button>
                      <button type="button" className="ghost-button sm2-hard" onClick={() => handleRate("hard")}>Hard</button>
                      <button type="button" className="accent-button sm2-easy" onClick={() => handleRate("easy")}>Easy</button>
                      <button type="button" className="ghost-button" onClick={() => { onNextFlashcard(); setFlipped(false); }}>Skip</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="fc-empty-study">
                <BookOpen size={32} className="muted" />
                <p className="muted">
                  {activeSet
                    ? "Use the Study Setup panel to choose a lane and start your next session."
                    : "Select a set and start a session."}
                </p>
              </div>
            )}
          </article>
          </>
          )}
        </div>
      </div>
    </section>
  );
}

export default FlashcardsPage;
