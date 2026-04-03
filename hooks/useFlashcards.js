import { useState } from "react";
import { applyPetXp, getDayKey, parseDayKey } from "../gameState";

function normalizeAnswerText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(a|an|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function useFlashcards(state, setState, showToast) {
  const [newSetTitle, setNewSetTitle] = useState("");
  const [newCardQuestion, setNewCardQuestion] = useState("");
  const [newCardAnswer, setNewCardAnswer] = useState("");
  const [newCardChoices, setNewCardChoices] = useState("");
  const [editingCardId, setEditingCardId] = useState(null);
  const [studyFilter, setStudyFilter] = useState("all"); // "all" | "hard" | "due"

  const activeSet = state.flashcards.sets.find((entry) => entry.id === state.flashcards.activeSetId) ?? null;
  const flashSession = state.flashcards.session;

  function buildCardFromPayload(payload) {
    const question = String(payload?.question ?? "").trim();
    const normalizedAnswer = String(payload?.answer ?? "").trim();
    const requestedType = String(payload?.type ?? "").trim();

    if (!question) {
      return null;
    }

    const parsedChoices = Array.isArray(payload?.choices)
      ? payload.choices.map((entry) => String(entry).trim()).filter(Boolean)
      : [];

    if (requestedType === "multiple-response") {
      const parsedAnswers = Array.isArray(payload?.answers)
        ? payload.answers.map((entry) => String(entry).trim()).filter(Boolean)
        : [];
      const uniqueChoices = [...new Set(parsedChoices)].slice(0, 8);
      const uniqueAnswers = [...new Set(parsedAnswers)].filter((entry) => uniqueChoices.includes(entry));

      if (uniqueChoices.length < 2 || uniqueAnswers.length < 2) {
        return null;
      }

      return {
        id: payload?.id ?? `card-${Date.now()}`,
        question,
        answer: uniqueAnswers.join(" | "),
        answers: uniqueAnswers,
        choices: uniqueChoices,
        type: "multiple-response",
      };
    }

    if (requestedType === "matching") {
      const pairs = Array.isArray(payload?.pairs)
        ? payload.pairs
          .map((entry) => ({
            left: String(entry?.left ?? "").trim(),
            right: String(entry?.right ?? "").trim(),
          }))
          .filter((entry) => entry.left && entry.right)
        : [];

      if (pairs.length < 2) {
        return null;
      }

      return {
        id: payload?.id ?? `card-${Date.now()}`,
        question,
        answer: pairs.map((entry) => `${entry.left}=${entry.right}`).join(" | "),
        pairs,
        choices: [],
        type: "matching",
      };
    }

    if (requestedType === "sequencing") {
      const sequence = Array.isArray(payload?.sequence)
        ? payload.sequence.map((entry) => String(entry).trim()).filter(Boolean)
        : [];

      if (sequence.length < 2) {
        return null;
      }

      return {
        id: payload?.id ?? `card-${Date.now()}`,
        question,
        answer: sequence.join(" -> "),
        sequence,
        choices: [],
        type: "sequencing",
      };
    }

    const choiceValues = [normalizedAnswer, ...parsedChoices].filter(Boolean).slice(0, 4);
    const isTrueFalse = parsedChoices.length === 0 && ["true", "false"].includes(normalizedAnswer.toLowerCase());

    if (!normalizedAnswer) {
      return null;
    }

    return {
      id: payload?.id ?? `card-${Date.now()}`,
      question,
      answer: normalizedAnswer,
      choices: isTrueFalse ? ["True", "False"] : choiceValues.length >= 2 ? choiceValues : [normalizedAnswer],
      type: isTrueFalse ? "true-false" : choiceValues.length >= 2 ? "mcq" : "basic",
    };
  }

  function incrementWeakStats(stats, topic, type) {
    const safeStats = stats ?? { byTopic: {}, byType: {} };
    const safeTopic = String(topic || "General");
    const safeType = String(type || "basic");
    return {
      byTopic: {
        ...(safeStats.byTopic ?? {}),
        [safeTopic]: ((safeStats.byTopic ?? {})[safeTopic] ?? 0) + 1,
      },
      byType: {
        ...(safeStats.byType ?? {}),
        [safeType]: ((safeStats.byType ?? {})[safeType] ?? 0) + 1,
      },
    };
  }

  function createSession(deck) {
    return {
      index: 0,
      deck,
      correct: 0,
      answered: 0,
      streak: 0,
      bestStreak: 0,
      reveal: false,
      missedCardIds: [],
    };
  }

  function getCardPriority(card) {
    const topic = card?.sourceLabel || activeSet?.title || "General";
    const type = card?.type || "basic";
    const topicWeight = Number(state.flashcards?.weakStats?.byTopic?.[topic] ?? 0);
    const typeWeight = Number(state.flashcards?.weakStats?.byType?.[type] ?? 0);
    const isDue = !card?.dueDay || card.dueDay <= state.dayKey;
    const strength = Number.isFinite(card?.strength) ? card.strength : 1;
    const box = Number.isFinite(card?.leitnerBox) ? card.leitnerBox : strength;

    return (
      (isDue ? 5 : 0)
      + (Math.max(1, 5 - strength) * 2)
      + (Math.max(1, 5 - box) * 1.5)
      + (topicWeight * 1.2)
      + (typeWeight * 0.8)
    );
  }

  function buildSmartDeck(cards) {
    return [...cards]
      .map((card) => ({
        card,
        priority: getCardPriority(card),
      }))
      .sort((left, right) => {
        if (right.priority !== left.priority) {
          return right.priority - left.priority;
        }
        return Math.random() - 0.5;
      })
      .map((entry) => entry.card);
  }

  function addFlashcardSet(event) {
    event.preventDefault();
    if (!newSetTitle.trim()) {
      return;
    }

    const newSet = {
      id: `set-${Date.now()}`,
      title: newSetTitle.trim(),
      subjectKey: state.activeSubject,
      cards: [],
    };

    setState((current) => ({
      ...current,
      flashcards: {
        ...current.flashcards,
        sets: [newSet, ...current.flashcards.sets],
        activeSetId: newSet.id,
      },
    }));
    setNewSetTitle("");
    showToast("Flashcard set created");
  }

  function addFlashcardCard(input) {
    const isEvent = typeof input?.preventDefault === "function";
    if (isEvent) {
      input.preventDefault();
    }

    if (!activeSet) {
      return;
    }

    const payload = isEvent
      ? {
          question: newCardQuestion,
          answer: newCardAnswer,
          choices: (newCardChoices || "").split("|").map((entry) => entry.trim()).filter(Boolean),
        }
      : input;

    const card = buildCardFromPayload(payload);
    if (!card) {
      showToast("Please complete the required fields for this question type");
      return;
    }

    setState((current) => ({
      ...current,
      flashcards: {
        ...current.flashcards,
        sets: current.flashcards.sets.map((setEntry) =>
          setEntry.id === current.flashcards.activeSetId
            ? { ...setEntry, cards: [card, ...setEntry.cards] }
            : setEntry,
        ),
      },
    }));

    if (isEvent) {
      setNewCardQuestion("");
      setNewCardAnswer("");
      setNewCardChoices("");
    }
    showToast("Flashcard added");
  }

  function applyFlashcardResult(current, isCorrect) {
    const session = current.flashcards.session;
    if (!session || session.reveal) {
      return current;
    }

    const card = session.deck[session.index];
    const correct = Boolean(isCorrect);
    const nextStreak = correct ? (session.streak ?? 0) + 1 : 0;
    const comboXpBonus = correct ? Math.min(8, Math.floor(nextStreak / 2)) : 0;

    return {
      ...current,
      flashcards: {
        ...current.flashcards,
        weakStats: correct
          ? current.flashcards.weakStats
          : incrementWeakStats(current.flashcards.weakStats, card.sourceLabel || activeSet?.title, card.type),
        session: {
          ...session,
          reveal: true,
          correct: session.correct + (correct ? 1 : 0),
          answered: session.answered + 1,
          streak: nextStreak,
          bestStreak: Math.max(session.bestStreak ?? 0, nextStreak),
          missedCardIds: correct ? session.missedCardIds : [...new Set([...(session.missedCardIds ?? []), card.id])],
        },
      },
      petProfile: applyPetXp(current.petProfile, correct ? 6 + comboXpBonus : 2),
    };
  }

  function startFlashcardSession() {
    if (!activeSet || activeSet.cards.length === 0) {
      showToast("Add cards first");
      return;
    }

    const deck = buildSmartDeck(activeSet.cards);
    setState((current) => ({
      ...current,
      flashcards: {
        ...current.flashcards,
        session: createSession(deck),
      },
    }));
  }

  function answerFlashcard(choice) {
    const session = flashSession;
    const card = session?.deck?.[session.index];
    const isCorrect = card ? choice === card.answer : null;

    setState((current) => applyFlashcardResult(current, isCorrect));

    return isCorrect;
  }

  function answerOpenFlashcard(text) {
    const session = flashSession;
    const card = session?.deck?.[session.index];
    const isCorrect = card
      ? (() => {
          const userAnswer = normalizeAnswerText(text);
          const expected = normalizeAnswerText(card.answer);
          return userAnswer === expected || userAnswer.includes(expected) || expected.includes(userAnswer);
        })()
      : null;

    setState((current) => applyFlashcardResult(current, isCorrect));
    return isCorrect;
  }

  function answerFlashcardResult(isCorrect) {
    setState((current) => applyFlashcardResult(current, isCorrect));
    return Boolean(isCorrect);
  }

  function advanceSession(current, session) {
    if (session.index >= session.deck.length - 1) {
      const missedCount = (session.missedCardIds ?? []).length;
      showToast(`Flashcards complete: ${session.correct}/${session.answered}${missedCount ? ` • missed ${missedCount}` : ""}`);
      return {
        ...current,
        flashcards: {
          ...current.flashcards,
          lastSession: {
            finishedAt: Date.now(),
            total: session.answered,
            correct: session.correct,
            bestStreak: session.bestStreak ?? 0,
            missedCardIds: session.missedCardIds ?? [],
          },
          session: null,
        },
      };
    }

    return {
      ...current,
      flashcards: {
        ...current.flashcards,
        session: {
          ...session,
          index: session.index + 1,
          reveal: false,
        },
      },
    };
  }

  function rateFlashcard(rating) {
    setState((current) => {
      let workingState = current;
      let session = workingState.flashcards.session;
      if (!session) {
        return current;
      }

      if (!session.reveal) {
        const inferredCorrect = rating !== "again";
        workingState = applyFlashcardResult(workingState, inferredCorrect);
        session = workingState.flashcards.session;

        if (!session || !session.reveal) {
          return workingState;
        }
      }

      const card = session.deck[session.index];
      const currentSubject = workingState.activeSubject;
      const nextSets = workingState.flashcards.sets.map((setEntry) => {
        if (setEntry.id !== workingState.flashcards.activeSetId) {
          return setEntry;
        }

        return {
          ...setEntry,
          cards: setEntry.cards.map((entry) => {
            if (entry.id !== card.id) {
              return entry;
            }

            const previousStrength = entry.strength ?? 1;
            const previousBox = Number.isFinite(entry.leitnerBox)
              ? Math.min(5, Math.max(1, entry.leitnerBox))
              : Math.min(5, Math.max(1, previousStrength));
            const nextStrength = rating === "easy"
              ? Math.min(5, previousStrength + 1)
              : rating === "hard"
                ? Math.max(1, previousStrength)
                : 1;

            const nextBox = rating === "again"
              ? 1
              : rating === "hard"
                ? Math.min(5, Math.max(1, previousBox))
                : Math.min(5, previousBox + 1);

            const intervals = {
              again: 1,
              hard: Math.max(2, previousStrength + 1),
              easy: Math.max(3, previousStrength * 2),
            };

            const leitnerIntervals = {
              1: 1,
              2: 2,
              3: 4,
              4: 7,
              5: 14,
            };

            const today = parseDayKey(workingState.dayKey);
            const dueInDays = rating === "again" ? intervals[rating] : leitnerIntervals[nextBox] ?? intervals[rating];
            const dueDay = getDayKey(new Date(today.getTime() + dueInDays * 24 * 60 * 60 * 1000));

            return {
              ...entry,
              strength: nextStrength,
              leitnerBox: nextBox,
              dueDay,
              lastReviewedDay: current.dayKey,
              subjectKey: currentSubject,
            };
          }),
        };
      });

      let nextDeck = [...session.deck];
      if (rating === "again" && session.index < nextDeck.length - 1) {
        const [failedCard] = nextDeck.splice(session.index, 1);
        nextDeck.push(failedCard);
      }

      const nextSession = {
        ...session,
        deck: nextDeck,
        reveal: false,
      };

      const nextState = {
        ...workingState,
        flashcards: {
          ...workingState.flashcards,
          sets: nextSets,
          session: nextSession,
        },
      };

      return advanceSession(nextState, nextSession);
    });
  }

  function nextFlashcard() {
    setState((current) => {
      const session = current.flashcards.session;
      if (!session) {
        return current;
      }

      return advanceSession(current, session);
    });
  }

  function deleteFlashcardCard(cardId) {
    setState((current) => ({
      ...current,
      flashcards: {
        ...current.flashcards,
        sets: current.flashcards.sets.map((setEntry) =>
          setEntry.id !== current.flashcards.activeSetId
            ? setEntry
            : { ...setEntry, cards: setEntry.cards.filter((card) => card.id !== cardId) },
        ),
      },
    }));
    showToast("Card deleted");
  }

  function duplicateFlashcardCard(cardId) {
    if (!cardId || !activeSet) {
      return;
    }

    setState((current) => ({
      ...current,
      flashcards: {
        ...current.flashcards,
        sets: current.flashcards.sets.map((setEntry) => {
          if (setEntry.id !== current.flashcards.activeSetId) {
            return setEntry;
          }

          const sourceCard = setEntry.cards.find((card) => card.id === cardId);
          if (!sourceCard) {
            return setEntry;
          }

          const duplicateCard = {
            ...sourceCard,
            id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            question: `${sourceCard.question} (Copy)`,
          };

          return { ...setEntry, cards: [duplicateCard, ...setEntry.cards] };
        }),
      },
    }));
    showToast("Card duplicated");
  }

  function moveFlashcardCard(cardId, targetSetId) {
    if (!cardId || !targetSetId || !activeSet || activeSet.id === targetSetId) {
      return;
    }

    setState((current) => {
      const sourceSet = current.flashcards.sets.find((setEntry) => setEntry.id === current.flashcards.activeSetId);
      const sourceCard = sourceSet?.cards.find((card) => card.id === cardId);
      if (!sourceCard) {
        return current;
      }

      return {
        ...current,
        flashcards: {
          ...current.flashcards,
          sets: current.flashcards.sets.map((setEntry) => {
            if (setEntry.id === current.flashcards.activeSetId) {
              return { ...setEntry, cards: setEntry.cards.filter((card) => card.id !== cardId) };
            }

            if (setEntry.id === targetSetId) {
              return { ...setEntry, cards: [sourceCard, ...setEntry.cards] };
            }

            return setEntry;
          }),
        },
      };
    });
    showToast("Card moved");
  }

  function reorderFlashcardCards(nextCardIds) {
    if (!Array.isArray(nextCardIds) || !activeSet) {
      return;
    }

    setState((current) => ({
      ...current,
      flashcards: {
        ...current.flashcards,
        sets: current.flashcards.sets.map((setEntry) => {
          if (setEntry.id !== current.flashcards.activeSetId) {
            return setEntry;
          }

          const cardMap = new Map(setEntry.cards.map((card) => [card.id, card]));
          const reordered = nextCardIds.map((cardId) => cardMap.get(cardId)).filter(Boolean);
          const remaining = setEntry.cards.filter((card) => !nextCardIds.includes(card.id));
          return { ...setEntry, cards: [...reordered, ...remaining] };
        }),
      },
    }));
  }

  function deleteFlashcardSet(setId) {
    setState((current) => {
      const remaining = current.flashcards.sets.filter((setEntry) => setEntry.id !== setId);
      return {
        ...current,
        flashcards: {
          ...current.flashcards,
          sets: remaining,
          activeSetId: current.flashcards.activeSetId === setId ? (remaining[0]?.id ?? null) : current.flashcards.activeSetId,
        },
      };
    });
    showToast("Set deleted");
  }

  function updateFlashcardCard(cardIdOrPayload, question, answer, choicesRaw) {
    const payload = typeof cardIdOrPayload === "object"
      ? cardIdOrPayload
      : {
          id: cardIdOrPayload,
          question,
          answer,
          choices: (choicesRaw || "").split("|").map((c) => c.trim()).filter(Boolean),
        };

    const cardId = payload?.id;
    const nextCard = buildCardFromPayload(payload);
    if (!cardId || !nextCard) {
      showToast("Please complete the required fields for this question type");
      return;
    }

    setState((current) => ({
      ...current,
      flashcards: {
        ...current.flashcards,
        sets: current.flashcards.sets.map((setEntry) =>
          setEntry.id !== current.flashcards.activeSetId
            ? setEntry
            : {
                ...setEntry,
                cards: setEntry.cards.map((card) =>
                  card.id !== cardId
                    ? card
                    : {
                        ...card,
                        question: nextCard.question,
                        answer: nextCard.answer,
                        choices: nextCard.choices,
                        answers: nextCard.answers,
                        pairs: nextCard.pairs,
                        sequence: nextCard.sequence,
                        type: nextCard.type,
                      },
                ),
              },
        ),
      },
    }));
    showToast("Card updated");
  }

  function startFlashcardSessionFiltered(filter = "all") {
    if (!activeSet || activeSet.cards.length === 0) {
      showToast("Add cards first");
      return;
    }

    let cards = [...activeSet.cards];
    if (filter === "hard") {
      cards = cards.filter((card) => (card.strength ?? 1) <= 1);
      if (!cards.length) {
        showToast("No hard cards — studying all");
        cards = [...activeSet.cards];
      }
    } else if (filter === "due") {
      cards = cards.filter((card) => !card.dueDay || card.dueDay <= state.dayKey);
      if (!cards.length) {
        showToast("No due cards today — studying all");
        cards = [...activeSet.cards];
      }
    }

    const deck = buildSmartDeck(cards);
    setState((current) => ({
      ...current,
      flashcards: {
        ...current.flashcards,
        session: createSession(deck),
      },
    }));
  }

  function restartMissedSession() {
    if (!activeSet) {
      return;
    }

    const missed = new Set(state.flashcards?.lastSession?.missedCardIds ?? []);
    const deck = activeSet.cards.filter((card) => missed.has(card.id)).sort(() => Math.random() - 0.5);
    if (!deck.length) {
      showToast("No missed cards from last session");
      return;
    }

    setState((current) => ({
      ...current,
      flashcards: {
        ...current.flashcards,
        session: createSession(deck),
      },
    }));
    showToast(`Restarted missed-only session (${deck.length})`);
  }

  function importCardsFromText(text) {
    if (!activeSet || !text.trim()) return;
    const rows = text.trim().split("\n").filter(Boolean);
    const newCards = rows
      .map((row) => {
        const parts = row.split(/\t|,/).map((p) => p.trim());
        if (parts.length < 2) return null;
        const [question, answer, ...rest] = parts;
        if (!question || !answer) return null;
        const choiceValues = [answer, ...rest].slice(0, 4);
        return {
          id: `card-${Date.now()}-${Math.random()}`,
          question,
          answer,
          choices: choiceValues.length >= 2 ? choiceValues : [answer],
          type: choiceValues.length >= 2 ? "mcq" : "basic",
        };
      })
      .filter(Boolean);

    if (!newCards.length) {
      showToast("No valid rows found. Use: Question[tab]Answer[tab]Choice2...");
      return;
    }

    setState((current) => ({
      ...current,
      flashcards: {
        ...current.flashcards,
        sets: current.flashcards.sets.map((setEntry) =>
          setEntry.id === current.flashcards.activeSetId
            ? { ...setEntry, cards: [...newCards, ...setEntry.cards] }
            : setEntry,
        ),
      },
    }));
    showToast(`${newCards.length} cards imported`);
  }

  return {
    activeSet,
    flashSession,
    newSetTitle,
    newCardQuestion,
    newCardAnswer,
    newCardChoices,
    editingCardId,
    studyFilter,
    setNewSetTitle,
    setNewCardQuestion,
    setNewCardAnswer,
    setNewCardChoices,
    setEditingCardId,
    setStudyFilter,
    addFlashcardSet,
    addFlashcardCard,
    duplicateFlashcardCard,
    moveFlashcardCard,
    reorderFlashcardCards,
    deleteFlashcardCard,
    deleteFlashcardSet,
    updateFlashcardCard,
    startFlashcardSession,
    startFlashcardSessionFiltered,
    restartMissedSession,
    importCardsFromText,
    answerFlashcard,
    answerFlashcardResult,
    answerOpenFlashcard,
    rateFlashcard,
    nextFlashcard,
  };
}
