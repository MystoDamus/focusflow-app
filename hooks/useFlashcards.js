import { useState } from "react";
import { applyPetXp, getDayKey, parseDayKey } from "../gameState";

export default function useFlashcards(state, setState, showToast) {
  const [newSetTitle, setNewSetTitle] = useState("");
  const [newCardQuestion, setNewCardQuestion] = useState("");
  const [newCardAnswer, setNewCardAnswer] = useState("");
  const [newCardChoices, setNewCardChoices] = useState("");

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

  return {
    activeSet,
    flashSession,
    newSetTitle,
    newCardQuestion,
    newCardAnswer,
    newCardChoices,
    setNewSetTitle,
    setNewCardQuestion,
    setNewCardAnswer,
    setNewCardChoices,
    addFlashcardSet,
    addFlashcardCard,
    startFlashcardSession,
    answerFlashcard,
    answerOpenFlashcard,
    rateFlashcard,
    nextFlashcard,
  };
}
