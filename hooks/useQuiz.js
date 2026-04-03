import { useEffect } from "react";

function buildQuizChoices(card, allCards) {
  const wrongPool = allCards
    .filter((entry) => entry.id !== card.id)
    .map((entry) => entry.answer)
    .filter((answer, index, array) => array.indexOf(answer) === index)
    .slice(0, 3);

  const choices = [...wrongPool, card.answer].sort(() => Math.random() - 0.5);
  return choices.length >= 2 ? choices : [card.answer, "Skip"].sort(() => Math.random() - 0.5);
}

function advanceQuiz(current, answeredCorrectly) {
  const session = current.quiz.session;
  if (!session) return current;

  const currentQuestion = session.questions[session.index];
  const wrongAnswersUpdate = !answeredCorrectly && currentQuestion
    ? [...(session.wrongAnswers ?? []), { question: currentQuestion.question, correctAnswer: currentQuestion.answer, explanation: currentQuestion.explanation ?? null }]
    : (session.wrongAnswers ?? []);

  // Speed run mode: just count answers, no HP system
  if (session.battleMode === "speedrun") {
    const nextIndex = session.index + 1;
    const nextScore = session.score + (answeredCorrectly ? 100 : 0);
    const nextStreak = answeredCorrectly ? session.streak + 1 : 0;
    const timeExpired = session.timeLeft <= 1;

    if (nextIndex >= session.questions.length || timeExpired) {
      const totalAnswered = current.quiz.totalAnswered + (nextIndex);
      const totalCorrect = current.quiz.totalCorrect + Math.round(nextScore / 100);
      return {
        ...current,
        quiz: {
          ...current.quiz,
          session: { ...session, isActive: false, score: nextScore, streak: nextStreak, wrongAnswers: wrongAnswersUpdate, result: "speedrun-done" },
          bestScore: Math.max(current.quiz.bestScore, nextScore),
          totalAnswered,
          totalCorrect,
        },
      };
    }

    return {
      ...current,
      quiz: {
        ...current.quiz,
        session: { ...session, index: nextIndex, score: nextScore, streak: nextStreak, hiddenChoices: [], wrongAnswers: wrongAnswersUpdate },
      },
    };
  }

  const nextIndex = session.index + 1;
  const nextScore = session.score + (answeredCorrectly ? 100 + session.streak * 20 : 0);
  const nextStreak = answeredCorrectly ? session.streak + 1 : 0;
  const rawDamage = answeredCorrectly ? 12 + session.streak * 4 : 18;
  const mitigatedDamage = !answeredCorrectly && session.defendReady ? Math.ceil(rawDamage * 0.5) : rawDamage;
  const nextBossHp = answeredCorrectly ? Math.max(0, session.bossHp - rawDamage) : session.bossHp;
  const nextEnemyPartyHp = answeredCorrectly ? Math.max(0, (session.enemyPartyHp ?? session.bossHp) - rawDamage) : (session.enemyPartyHp ?? session.bossHp);
  const nextPartyHp = answeredCorrectly ? session.partyHp : Math.max(0, session.partyHp - mitigatedDamage);
  const bossDefeated = session.battleMode === "versus" ? nextEnemyPartyHp === 0 : nextBossHp === 0;
  const partyDefeated = nextPartyHp === 0;

  if (nextIndex >= session.questions.length || bossDefeated || partyDefeated) {
    const totalAnswered = current.quiz.totalAnswered + session.questions.length;
    const totalCorrect = current.quiz.totalCorrect + Math.max(0, Math.round(nextScore / 100));
    return {
      ...current,
      quiz: {
        ...current.quiz,
        session: {
          ...session,
          isActive: false,
          score: nextScore,
          streak: nextStreak,
          bossHp: nextBossHp,
          enemyPartyHp: nextEnemyPartyHp,
          partyHp: nextPartyHp,
          defendReady: false,
          wrongAnswers: wrongAnswersUpdate,
          result: bossDefeated ? "victory" : partyDefeated ? "defeat" : "timeout",
        },
        bestScore: Math.max(current.quiz.bestScore, nextScore),
        totalAnswered,
        totalCorrect,
      },
      season: {
        ...current.season,
        xp: current.season.xp + Math.floor(nextScore / 30),
        tier: 1 + Math.floor((current.season.xp + Math.floor(nextScore / 30)) / 150),
      },
    };
  }

  return {
    ...current,
    quiz: {
      ...current.quiz,
      session: {
        ...session,
        index: nextIndex,
        score: nextScore,
        streak: nextStreak,
        bossHp: nextBossHp,
        enemyPartyHp: nextEnemyPartyHp,
        partyHp: nextPartyHp,
        timeLeft: 20,
        hiddenChoices: [],
        defendReady: false,
        wrongAnswers: wrongAnswersUpdate,
      },
    },
  };
}

export default function useQuiz(state, setState, activeSet, showToast, hasHealer = false) {
  const quizSession = state.quiz.session;
  const quizQuestion = quizSession?.questions?.[quizSession.index];
  const customQuizSets = state.quiz.customSets ?? [];
  const activeCustomSet = customQuizSets.find((setEntry) => setEntry.id === state.quiz.activeCustomSetId) ?? null;
  const accuracy = state.quiz.totalAnswered
    ? Math.round((state.quiz.totalCorrect / state.quiz.totalAnswered) * 100)
    : 0;

  useEffect(() => {
    if (!quizSession?.isActive) return undefined;

    // Speed run mode uses a single countdown for the whole session
    if (quizSession.battleMode === "speedrun") {
      const id = window.setInterval(() => {
        setState((current) => {
          if (!current.quiz.session?.isActive) return current;
          if (current.quiz.session.timeLeft > 1) {
            return { ...current, quiz: { ...current.quiz, session: { ...current.quiz.session, timeLeft: current.quiz.session.timeLeft - 1 } } };
          }
          return advanceQuiz(current, false);
        });
      }, 1000);
      return () => window.clearInterval(id);
    }

    const intervalId = window.setInterval(() => {
      setState((current) => {
        if (!current.quiz.session?.isActive) return current;
        if (current.quiz.session.timeLeft > 1) {
          return { ...current, quiz: { ...current.quiz, session: { ...current.quiz.session, timeLeft: current.quiz.session.timeLeft - 1 } } };
        }
        return advanceQuiz(current, false);
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [quizSession?.isActive, quizSession?.battleMode]);

  function startQuizBattle(source = "flashcards", customSetId = null, battleMode = "solo") {
    const sourceSet = source === "custom"
      ? customQuizSets.find((setEntry) => setEntry.id === customSetId)
      : activeSet;

    if (!sourceSet || sourceSet.cards.length < 2) {
      showToast("Need at least 2 cards for quiz battle");
      return;
    }

    // Difficulty scaling: higher accuracy = more boss HP
    const diffScale = Math.max(1, 1 + (accuracy - 50) / 100);
    const baseBossHp = Math.round(220 * diffScale);

    const questions = [...sourceSet.cards]
      .slice(0, 10)
      .map((card) => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
        explanation: card.explanation ?? null,
        type: card.type === "true-false" ? "true-false" : card.choices?.length >= 2 ? "mcq" : "identification",
        choices: card.type === "true-false"
          ? ["True", "False"]
          : card.choices?.length >= 2
            ? [...card.choices].sort(() => Math.random() - 0.5)
            : [],
      }))
      .sort(() => Math.random() - 0.5);

    setState((current) => ({
      ...current,
      quiz: {
        ...current.quiz,
        session: {
          isActive: true,
          questions,
          index: 0,
          score: 0,
          streak: 0,
          timeLeft: 20,
          bossHp: baseBossHp,
          enemyPartyHp: baseBossHp,
          partyHp: 220,
          maxBossHp: baseBossHp,
          maxEnemyPartyHp: baseBossHp,
          maxPartyHp: 220,
          defendReady: false,
          potions: 2,
          hasHealer,
          battleMode,
          result: null,
          fiftyFifty: true,
          extraTime: true,
          hiddenChoices: [],
          wrongAnswers: [],
        },
      },
      ui: { ...current.ui, activeView: "quiz" },
    }));
  }

  function startSpeedRun(source = "flashcards", customSetId = null) {
    const sourceSet = source === "custom"
      ? customQuizSets.find((setEntry) => setEntry.id === customSetId)
      : activeSet;

    if (!sourceSet || sourceSet.cards.length < 2) {
      showToast("Need at least 2 cards for speed run");
      return;
    }

    const questions = [...sourceSet.cards]
      .map((card) => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
        explanation: card.explanation ?? null,
        type: card.type === "true-false" ? "true-false" : card.choices?.length >= 2 ? "mcq" : "identification",
        choices: card.type === "true-false"
          ? ["True", "False"]
          : card.choices?.length >= 2
            ? [...card.choices].sort(() => Math.random() - 0.5)
            : [],
      }))
      .sort(() => Math.random() - 0.5);

    setState((current) => ({
      ...current,
      quiz: {
        ...current.quiz,
        session: {
          isActive: true,
          questions,
          index: 0,
          score: 0,
          streak: 0,
          timeLeft: 60,
          bossHp: 0,
          partyHp: 220,
          maxBossHp: 0,
          maxPartyHp: 220,
          battleMode: "speedrun",
          result: null,
          hiddenChoices: [],
          wrongAnswers: [],
          fiftyFifty: false,
          extraTime: false,
          defendReady: false,
          potions: 0,
          hasHealer: false,
        },
      },
      ui: { ...current.ui, activeView: "quiz" },
    }));
  }

  function createCustomQuizSet(title) {
    if (!title.trim()) return;

    const setId = `quiz-set-${Date.now()}`;
    setState((current) => ({
      ...current,
      quiz: {
        ...current.quiz,
        activeCustomSetId: setId,
        customSets: [
          {
            id: setId,
            title: title.trim(),
            cards: [],
            createdAt: Date.now(),
          },
          ...(current.quiz.customSets ?? []),
        ],
      },
    }));
  }

  function addCustomQuizQuestion(payload) {
    const { question, answer, choices, type, explanation } = payload;
    if (!state.quiz.activeCustomSetId || !question?.trim() || !answer?.trim()) return;

    const nextCard = {
      id: `quiz-card-${Date.now()}`,
      question: question.trim(),
      answer: answer.trim(),
      explanation: explanation?.trim() ?? null,
      choices: type === "mcq"
        ? [answer.trim(), ...(choices ?? []).filter(Boolean).map((entry) => entry.trim())].slice(0, 4)
        : type === "true-false"
          ? ["True", "False"]
          : [],
      type,
      strength: 1,
      dueDay: state.dayKey,
    };

    setState((current) => ({
      ...current,
      quiz: {
        ...current.quiz,
        customSets: (current.quiz.customSets ?? []).map((setEntry) =>
          setEntry.id === current.quiz.activeCustomSetId
            ? { ...setEntry, cards: [nextCard, ...setEntry.cards] }
            : setEntry,
        ),
      },
    }));
  }

  function selectCustomQuizSet(setId) {
    setState((current) => ({
      ...current,
      quiz: { ...current.quiz, activeCustomSetId: setId },
    }));
  }

  function answerOpenQuestion(text) {
    setState((current) => {
      const session = current.quiz.session;
      if (!session?.isActive) return current;
      const question = session.questions[session.index];
      const isCorrect = text.trim().toLowerCase() === String(question.answer).trim().toLowerCase();
      return advanceQuiz(current, isCorrect);
    });
  }

  function answerQuiz(choice) {
    setState((current) => {
      const session = current.quiz.session;
      if (!session?.isActive) return current;
      const question = session.questions[session.index];
      return advanceQuiz(current, choice === question.answer);
    });
  }

  function useFiftyFifty() {
    setState((current) => {
      const session = current.quiz.session;
      if (!session?.isActive || !session.fiftyFifty) return current;
      const question = session.questions[session.index];
      const wrong = question.choices.filter((choice) => choice !== question.answer);
      const hiddenChoices = wrong.sort(() => Math.random() - 0.5).slice(0, 2);
      return { ...current, quiz: { ...current.quiz, session: { ...session, fiftyFifty: false, hiddenChoices } } };
    });
  }

  function useExtraTime() {
    setState((current) => {
      const session = current.quiz.session;
      if (!session?.isActive || !session.extraTime) return current;
      return { ...current, quiz: { ...current.quiz, session: { ...session, extraTime: false, timeLeft: session.timeLeft + 10 } } };
    });
  }

  function useDefend() {
    setState((current) => {
      const session = current.quiz.session;
      if (!session?.isActive) return current;
      return { ...current, quiz: { ...current.quiz, session: { ...session, defendReady: true } } };
    });
  }

  function useHeal() {
    setState((current) => {
      const session = current.quiz.session;
      if (!session?.isActive || !session.hasHealer) return current;
      return { ...current, quiz: { ...current.quiz, session: { ...session, partyHp: Math.min(session.maxPartyHp, session.partyHp + 28) } } };
    });
  }

  function usePotion() {
    setState((current) => {
      const session = current.quiz.session;
      if (!session?.isActive || session.potions <= 0) return current;
      return { ...current, quiz: { ...current.quiz, session: { ...session, potions: session.potions - 1, partyHp: Math.min(session.maxPartyHp, session.partyHp + 60) } } };
    });
  }

  return {
    quizSession,
    quizQuestion,
    accuracy,
    startQuizBattle,
    startSpeedRun,
    answerQuiz,
    answerOpenQuestion,
    useFiftyFifty,
    useExtraTime,
    customQuizSets,
    activeCustomSet,
    createCustomQuizSet,
    addCustomQuizQuestion,
    selectCustomQuizSet,
    useDefend,
    useHeal,
    usePotion,
  };
}
