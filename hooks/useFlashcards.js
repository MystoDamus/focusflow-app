import { useState } from "react";
import { applyPetXp, getDayKey, parseDayKey } from "../gameState";

export default function useFlashcards(state, setState, showToast) {
  const [newSetTitle, setNewSetTitle] = useState("");
  const [newCardQuestion, setNewCardQuestion] = useState("");
  const [newCardAnswer, setNewCardAnswer] = useState("");
  const [newCardChoices, setNewCardChoices] = useState("");
  const [editingCardId, setEditingCardId] = useState(null);
  const [studyFilter, setStudyFilter] = useState("all"); // "all" | "hard" | "due"

  const activeSet = state.flashcards.sets.find((entry) => entry.id === state.flashcards.activeSetId) ?? null;
  const flashSession = state.flashcards.session;

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

  function addFlashcardCard(event) {
    event.preventDefault();
    if (!activeSet || !newCardQuestion.trim() || !newCardAnswer.trim()) {
      return;
    }

    const normalizedAnswer = newCardAnswer.trim();
    const choiceValues = [
      normalizedAnswer,
      ...(newCardChoices || "")
        .split("|")
        .map((entry) => entry.trim())
        .filter(Boolean),
    ].slice(0, 4);
    const isTrueFalse = !newCardChoices.trim() && ["true", "false"].includes(normalizedAnswer.toLowerCase());

    const card = {
      id: `card-${Date.now()}`,
      question: newCardQuestion.trim(),
      answer: normalizedAnswer,
      choices: isTrueFalse ? ["True", "False"] : choiceValues.length >= 2 ? choiceValues : [normalizedAnswer],
      type: isTrueFalse ? "true-false" : choiceValues.length >= 2 ? "mcq" : "basic",
    };

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

    setNewCardQuestion("");
    setNewCardAnswer("");
    setNewCardChoices("");
    showToast("Flashcard added");
  }

  function startFlashcardSession() {
    if (!activeSet || activeSet.cards.length === 0) {
      showToast("Add cards first");
      return;
    }

    const deck = [...activeSet.cards].sort(() => Math.random() - 0.5);
    setState((current) => ({
      ...current,
      flashcards: {
        ...current.flashcards,
        session: {
          index: 0,
          deck,
          correct: 0,
          answered: 0,
          reveal: false,
        },
      },
    }));
  }

  function answerFlashcard(choice) {
    setState((current) => {
      const session = current.flashcards.session;
      if (!session || session.reveal) {
        return current;
      }

      const card = session.deck[session.index];
      const correct = choice === card.answer;

      return {
        ...current,
        flashcards: {
          ...current.flashcards,
          session: {
            ...session,
            reveal: true,
            correct: session.correct + (correct ? 1 : 0),
            answered: session.answered + 1,
          },
        },
        petProfile: applyPetXp(current.petProfile, correct ? 6 : 2),
      };
    });
  }

  function answerOpenFlashcard(text) {
    setState((current) => {
      const session = current.flashcards.session;
      if (!session || session.reveal) {
        return current;
      }

      const card = session.deck[session.index];
      const correct = text.trim().toLowerCase() === String(card.answer).trim().toLowerCase();

      return {
        ...current,
        flashcards: {
          ...current.flashcards,
          session: {
            ...session,
            reveal: true,
            correct: session.correct + (correct ? 1 : 0),
            answered: session.answered + 1,
          },
        },
        petProfile: applyPetXp(current.petProfile, correct ? 6 : 2),
      };
    });
  }

  function advanceSession(current, session) {
    if (session.index >= session.deck.length - 1) {
      showToast(`Flashcards complete: ${session.correct}/${session.answered}`);
      return {
        ...current,
        flashcards: {
          ...current.flashcards,
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
      const session = current.flashcards.session;
      if (!session || !session.reveal) {
        return current;
      }

      const card = session.deck[session.index];
      const currentSubject = current.activeSubject;
      const nextSets = current.flashcards.sets.map((setEntry) => {
        if (setEntry.id !== current.flashcards.activeSetId) {
          return setEntry;
        }

        return {
          ...setEntry,
          cards: setEntry.cards.map((entry) => {
            if (entry.id !== card.id) {
              return entry;
            }

            const previousStrength = entry.strength ?? 1;
            const nextStrength = rating === "easy"
              ? Math.min(5, previousStrength + 1)
              : rating === "hard"
                ? Math.max(1, previousStrength)
                : 1;

            const intervals = {
              again: 1,
              hard: Math.max(2, previousStrength + 1),
              easy: Math.max(3, previousStrength * 2),
            };

            const today = parseDayKey(current.dayKey);
            const dueDay = getDayKey(new Date(today.getTime() + intervals[rating] * 24 * 60 * 60 * 1000));

            return {
              ...entry,
              strength: nextStrength,
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
        ...current,
        flashcards: {
          ...current.flashcards,
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

  function updateFlashcardCard(cardId, question, answer, choicesRaw) {
    const normalizedAnswer = answer.trim();
    const choiceValues = [
      normalizedAnswer,
      ...(choicesRaw || "").split("|").map((c) => c.trim()).filter(Boolean),
    ].slice(0, 4);
    const isTrueFalse = !choicesRaw.trim() && ["true", "false"].includes(normalizedAnswer.toLowerCase());

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
                        question: question.trim(),
                        answer: normalizedAnswer,
                        choices: isTrueFalse ? ["True", "False"] : choiceValues.length >= 2 ? choiceValues : [normalizedAnswer],
                        type: isTrueFalse ? "true-false" : choiceValues.length >= 2 ? "mcq" : "basic",
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

    const deck = cards.sort(() => Math.random() - 0.5);
    setState((current) => ({
      ...current,
      flashcards: {
        ...current.flashcards,
        session: { index: 0, deck, correct: 0, answered: 0, reveal: false },
      },
    }));
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
    deleteFlashcardCard,
    deleteFlashcardSet,
    updateFlashcardCard,
    startFlashcardSession,
    startFlashcardSessionFiltered,
    importCardsFromText,
    answerFlashcard,
    answerOpenFlashcard,
    rateFlashcard,
    nextFlashcard,
  };
}
