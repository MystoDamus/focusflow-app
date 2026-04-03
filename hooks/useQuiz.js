import { useEffect } from "react";

function normalizeAnswerText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(a|an|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function incrementWeakStats(stats, topic, type) {
  const safeStats = stats ?? { byTopic: {}, byType: {} };
  const safeTopic = String(topic || "General");
  const safeType = String(type || "mcq");
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

function buildQuizChoices(card, allCards) {
  const wrongPool = allCards
    .filter((entry) => entry.id !== card.id)
    .map((entry) => entry.answer)
    .filter((answer, index, array) => array.indexOf(answer) === index)
    .slice(0, 3);

  const choices = [...wrongPool, card.answer].sort(() => Math.random() - 0.5);
  return choices.length >= 2 ? choices : [card.answer, "Skip"].sort(() => Math.random() - 0.5);
}

function questionPriority(card, weakStats, dayKey) {
  const topicWeight = Number(weakStats?.byTopic?.[card?.sourceLabel || "General"] ?? 0);
  const typeWeight = Number(weakStats?.byType?.[card?.type || "mcq"] ?? 0);
  const dueWeight = (!card?.dueDay || card?.dueDay <= dayKey) ? 3 : 0;
  const strength = Number.isFinite(card?.strength) ? card.strength : 1;
  return dueWeight + ((5 - Math.max(1, strength)) * 1.5) + topicWeight + (typeWeight * 0.8);
}

function buildSmartQuestionPool(cards, count, weakStats, dayKey) {
  const enriched = [...cards]
    .map((card) => ({ card, priority: questionPriority(card, weakStats, dayKey) }))
    .sort((left, right) => {
      if (right.priority !== left.priority) {
        return right.priority - left.priority;
      }
      return Math.random() - 0.5;
    });

  const buckets = {
    mcq: [],
    "true-false": [],
    identification: [],
  };

  for (const entry of enriched) {
    const type = entry.card?.type === "true-false"
      ? "true-false"
      : entry.card?.choices?.length >= 2
        ? "mcq"
        : "identification";
    buckets[type].push(entry.card);
  }

  const picks = [];
  const order = ["mcq", "identification", "true-false"];
  let guard = 0;

  while (picks.length < count && guard < (count * 6)) {
    for (const type of order) {
      if (picks.length >= count) break;
      const candidate = buckets[type].shift();
      if (candidate) {
        picks.push(candidate);
      }
    }
    guard += 1;
    if (!buckets.mcq.length && !buckets.identification.length && !buckets["true-false"].length) {
      break;
    }
  }

  return picks.slice(0, count).sort(() => Math.random() - 0.5);
}

function getComboBonus(streakAfterAnswer, battleMode) {
  const base = battleMode === "competitive-solo" ? 20 : 14;
  if (streakAfterAnswer >= 10) return base * 5;
  if (streakAfterAnswer >= 7) return base * 3;
  if (streakAfterAnswer >= 5) return base * 2;
  if (streakAfterAnswer >= 3) return base;
  return 0;
}

function advanceQuiz(current, answeredCorrectly) {
  const session = current.quiz.session;
  if (!session) return current;
  const isCompetitiveSolo = session.battleMode === "competitive-solo";
  const recentResults = [...(session.recentResults ?? []), answeredCorrectly].slice(-5);
  const correctInRecent = recentResults.filter(Boolean).length;
  const pressureMode = correctInRecent >= 4
    ? "hard"
    : correctInRecent <= 1
      ? "assist"
      : "steady";

  const currentQuestion = session.questions[session.index];
  const nextAnsweredCount = (session.answeredCount ?? 0) + 1;
  const nextCorrectCount = (session.correctCount ?? 0) + (answeredCorrectly ? 1 : 0);
  const nextWeakStats = !answeredCorrectly && currentQuestion
    ? incrementWeakStats(current.quiz.weakStats, currentQuestion.sourceLabel, currentQuestion.type)
    : current.quiz.weakStats;
  const wrongAnswersUpdate = !answeredCorrectly && currentQuestion
    ? [
        ...(session.wrongAnswers ?? []),
        {
          id: currentQuestion.id,
          question: currentQuestion.question,
          correctAnswer: currentQuestion.answer,
          explanation: currentQuestion.explanation ?? null,
          type: currentQuestion.type ?? "mcq",
        },
      ]
    : (session.wrongAnswers ?? []);

  // Speed run mode: just count answers, no HP system
  if (session.battleMode === "speedrun") {
    const nextIndex = session.index + 1;
    const typePoints = (currentQuestion?.type === "identification") ? 120 : currentQuestion?.type === "true-false" ? 90 : 100;
    const nextStreak = answeredCorrectly ? session.streak + 1 : 0;
    const comboBonus = answeredCorrectly ? getComboBonus(nextStreak, session.battleMode) : 0;
    const nextScore = session.score + (answeredCorrectly ? typePoints + comboBonus : 0);
    const timeExpired = session.timeLeft <= 1;

    if (nextIndex >= session.questions.length || timeExpired) {
      const totalAnswered = current.quiz.totalAnswered + nextAnsweredCount;
      const totalCorrect = current.quiz.totalCorrect + nextCorrectCount;
      return {
        ...current,
        quiz: {
          ...current.quiz,
          weakStats: nextWeakStats,
          session: {
            ...session,
            isActive: false,
            score: nextScore,
            streak: nextStreak,
            answeredCount: nextAnsweredCount,
            correctCount: nextCorrectCount,
            wrongAnswers: wrongAnswersUpdate,
            result: "speedrun-done",
          },
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
        weakStats: nextWeakStats,
        session: {
          ...session,
          index: nextIndex,
          score: nextScore,
          streak: nextStreak,
            comboBonus,
          answeredCount: nextAnsweredCount,
          correctCount: nextCorrectCount,
          hiddenChoices: [],
          wrongAnswers: wrongAnswersUpdate,
        },
      },
    };
  }

  const nextIndex = session.index + 1;
  const basePoints = isCompetitiveSolo ? 140 : 100;
  const streakPoints = isCompetitiveSolo ? session.streak * 30 : session.streak * 20;
  const typePoints = (currentQuestion?.type === "identification") ? 20 : currentQuestion?.type === "true-false" ? 0 : 10;
  const nextStreak = answeredCorrectly ? session.streak + 1 : 0;
  const comboBonus = answeredCorrectly ? getComboBonus(nextStreak, session.battleMode) : 0;
  const nextScore = session.score + (answeredCorrectly ? basePoints + streakPoints + typePoints + comboBonus : 0);
  const damageBoost = pressureMode === "hard" ? 4 : 0;
  const damageRelief = pressureMode === "assist" ? 4 : 0;
  const rawDamage = answeredCorrectly
    ? Math.max(6, 12 + session.streak * 4 + damageBoost)
    : Math.max(8, (isCompetitiveSolo ? 22 : 18) - damageRelief);
  const streakShield = !answeredCorrectly && session.streak >= 3 ? 0.75 : 1;
  const defendedDamage = !answeredCorrectly && session.defendReady ? rawDamage * 0.5 : rawDamage;
  const mitigatedDamage = Math.ceil(defendedDamage * streakShield);
  const nextBossHp = answeredCorrectly ? Math.max(0, session.bossHp - rawDamage) : session.bossHp;
  const nextEnemyPartyHp = answeredCorrectly ? Math.max(0, (session.enemyPartyHp ?? session.bossHp) - rawDamage) : (session.enemyPartyHp ?? session.bossHp);
  const nextPartyHp = answeredCorrectly ? session.partyHp : Math.max(0, session.partyHp - mitigatedDamage);
  const bossDefeated = session.battleMode === "versus" ? nextEnemyPartyHp === 0 : nextBossHp === 0;
  const partyDefeated = nextPartyHp === 0;

  if (nextIndex >= session.questions.length || bossDefeated || partyDefeated) {
    const totalAnswered = current.quiz.totalAnswered + nextAnsweredCount;
    const totalCorrect = current.quiz.totalCorrect + nextCorrectCount;
    const nextQuizState = {
      ...current.quiz,
      weakStats: nextWeakStats,
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
        recentResults,
        pressureMode,
        comboBonus,
        answeredCount: nextAnsweredCount,
        correctCount: nextCorrectCount,
        result: bossDefeated ? "victory" : partyDefeated ? "defeat" : "timeout",
      },
      bestScore: Math.max(current.quiz.bestScore, nextScore),
      totalAnswered,
      totalCorrect,
    };

    if (isCompetitiveSolo) {
      nextQuizState.competitive = {
        currentStreak: nextStreak,
        bestStreak: Math.max(current.quiz.competitive?.bestStreak ?? 0, nextStreak),
        accuracyRecord: Math.max(current.quiz.competitive?.accuracyRecord ?? 0, totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0),
        bestScore: Math.max(current.quiz.competitive?.bestScore ?? 0, nextScore),
      };
    }

    return {
      ...current,
      quiz: nextQuizState,
      season: {
        ...current.season,
        xp: current.season.xp + Math.floor(nextScore / 30),
        tier: 1 + Math.floor((current.season.xp + Math.floor(nextScore / 30)) / 150),
      },
    };
  }

  const timeShift = pressureMode === "hard" ? -2 : pressureMode === "assist" ? 3 : 0;
  const nextTime = Math.max(8, Math.min(55, (session.baseTimePerQuestion ?? 20) + timeShift));

  return {
    ...current,
    quiz: {
      ...current.quiz,
      weakStats: nextWeakStats,
      session: {
        ...session,
        index: nextIndex,
        score: nextScore,
        streak: nextStreak,
        bossHp: nextBossHp,
        enemyPartyHp: nextEnemyPartyHp,
        partyHp: nextPartyHp,
        timeLeft: nextTime,
        recentResults,
        pressureMode,
        comboBonus,
        answeredCount: nextAnsweredCount,
        correctCount: nextCorrectCount,
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

  function startQuizBattle(source = "flashcards", customSetId = null, battleMode = "solo", options = {}) {
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
    const requestedQuestionCount = Number.parseInt(options?.questionCount, 10);
    const questionCount = Number.isFinite(requestedQuestionCount)
      ? Math.max(5, Math.min(20, requestedQuestionCount))
      : 10;
    const requestedTimePerQuestion = Number.parseInt(options?.timePerQuestion, 10);
    const baseTimePerQuestion = Number.isFinite(requestedTimePerQuestion)
      ? Math.max(10, Math.min(45, requestedTimePerQuestion))
      : 20;

    const questions = buildSmartQuestionPool(sourceSet.cards, questionCount, state.quiz?.weakStats, state.dayKey)
      .map((card) => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
        explanation: card.explanation ?? null,
        sourceLabel: sourceSet.title,
        type: card.type === "true-false" ? "true-false" : card.choices?.length >= 2 ? "mcq" : "identification",
        choices: card.type === "true-false"
          ? ["True", "False"]
          : card.choices?.length >= 2
            ? [...card.choices].sort(() => Math.random() - 0.5)
            : [],
      }))
      .sort(() => Math.random() - 0.5);

    const isCompetitiveSolo = battleMode === "competitive-solo";

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
          answeredCount: 0,
          correctCount: 0,
          timeLeft: isCompetitiveSolo ? Math.max(10, baseTimePerQuestion - 5) : baseTimePerQuestion,
          baseTimePerQuestion,
          recentResults: [],
          pressureMode: "steady",
          bossHp: baseBossHp,
          enemyPartyHp: baseBossHp,
          partyHp: isCompetitiveSolo ? 180 : 220,
          maxBossHp: baseBossHp,
          maxEnemyPartyHp: baseBossHp,
          maxPartyHp: isCompetitiveSolo ? 180 : 220,
          defendReady: false,
          potions: isCompetitiveSolo ? 0 : 2,
          hasHealer: isCompetitiveSolo ? false : hasHealer,
          battleMode,
          result: null,
          fiftyFifty: !isCompetitiveSolo,
          extraTime: !isCompetitiveSolo,
          hiddenChoices: [],
          wrongAnswers: [],
        },
      },
      ui: { ...current.ui, activeView: "quiz" },
    }));
  }

  function startSpeedRun(source = "flashcards", customSetId = null, options = {}) {
    const sourceSet = source === "custom"
      ? customQuizSets.find((setEntry) => setEntry.id === customSetId)
      : activeSet;

    if (!sourceSet || sourceSet.cards.length < 2) {
      showToast("Need at least 2 cards for speed run");
      return;
    }

    const requestedDuration = Number.parseInt(options?.durationSeconds, 10);
    const durationSeconds = Number.isFinite(requestedDuration)
      ? Math.max(30, Math.min(180, requestedDuration))
      : 60;

    const requestedQuestionCount = Number.parseInt(options?.questionCount, 10);
    const questionCount = Number.isFinite(requestedQuestionCount)
      ? Math.max(10, Math.min(120, requestedQuestionCount))
      : sourceSet.cards.length;

    const questions = buildSmartQuestionPool(sourceSet.cards, questionCount, state.quiz?.weakStats, state.dayKey)
      .map((card) => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
        explanation: card.explanation ?? null,
        sourceLabel: sourceSet.title,
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
          answeredCount: 0,
          correctCount: 0,
          timeLeft: durationSeconds,
          recentResults: [],
          pressureMode: "steady",
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

  function updateCustomQuizQuestion(questionId, payload) {
    if (!questionId || !state.quiz.activeCustomSetId) return;

    const question = String(payload?.question ?? "").trim();
    const answer = String(payload?.answer ?? "").trim();
    const type = String(payload?.type ?? "mcq").trim();
    const explanation = String(payload?.explanation ?? "").trim();
    const choices = Array.isArray(payload?.choices)
      ? payload.choices.map((entry) => String(entry ?? "").trim()).filter(Boolean)
      : [];

    if (!question || !answer) {
      return;
    }

    setState((current) => ({
      ...current,
      quiz: {
        ...current.quiz,
        customSets: (current.quiz.customSets ?? []).map((setEntry) => {
          if (setEntry.id !== current.quiz.activeCustomSetId) {
            return setEntry;
          }

          return {
            ...setEntry,
            cards: (setEntry.cards ?? []).map((card) => {
              if (card.id !== questionId) {
                return card;
              }

              return {
                ...card,
                question,
                answer,
                type,
                explanation: explanation || null,
                choices: type === "mcq"
                  ? [answer, ...choices.filter((entry) => entry !== answer)].slice(0, 4)
                  : type === "true-false"
                    ? ["True", "False"]
                    : [],
              };
            }),
          };
        }),
      },
    }));
  }

  function deleteCustomQuizQuestion(questionId) {
    if (!questionId || !state.quiz.activeCustomSetId) return;

    setState((current) => ({
      ...current,
      quiz: {
        ...current.quiz,
        customSets: (current.quiz.customSets ?? []).map((setEntry) => (
          setEntry.id === current.quiz.activeCustomSetId
            ? { ...setEntry, cards: (setEntry.cards ?? []).filter((card) => card.id !== questionId) }
            : setEntry
        )),
      },
    }));
  }

  function duplicateCustomQuizQuestion(questionId) {
    if (!questionId || !state.quiz.activeCustomSetId) return;

    setState((current) => ({
      ...current,
      quiz: {
        ...current.quiz,
        customSets: (current.quiz.customSets ?? []).map((setEntry) => {
          if (setEntry.id !== current.quiz.activeCustomSetId) {
            return setEntry;
          }

          const sourceCard = (setEntry.cards ?? []).find((card) => card.id === questionId);
          if (!sourceCard) {
            return setEntry;
          }

          const duplicateCard = {
            ...sourceCard,
            id: `quiz-card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            question: `${sourceCard.question} (Copy)`,
          };

          return { ...setEntry, cards: [duplicateCard, ...(setEntry.cards ?? [])] };
        }),
      },
    }));
  }

  function moveCustomQuizQuestion(questionId, targetSetId) {
    if (!questionId || !targetSetId || !state.quiz.activeCustomSetId || targetSetId === state.quiz.activeCustomSetId) return;

    setState((current) => {
      const sourceSet = (current.quiz.customSets ?? []).find((setEntry) => setEntry.id === current.quiz.activeCustomSetId);
      const sourceCard = (sourceSet?.cards ?? []).find((card) => card.id === questionId);
      if (!sourceCard) {
        return current;
      }

      return {
        ...current,
        quiz: {
          ...current.quiz,
          customSets: (current.quiz.customSets ?? []).map((setEntry) => {
            if (setEntry.id === current.quiz.activeCustomSetId) {
              return { ...setEntry, cards: (setEntry.cards ?? []).filter((card) => card.id !== questionId) };
            }

            if (setEntry.id === targetSetId) {
              return { ...setEntry, cards: [sourceCard, ...(setEntry.cards ?? [])] };
            }

            return setEntry;
          }),
        },
      };
    });
  }

  function reorderCustomQuizQuestions(nextQuestionIds) {
    if (!Array.isArray(nextQuestionIds) || !state.quiz.activeCustomSetId) return;

    setState((current) => ({
      ...current,
      quiz: {
        ...current.quiz,
        customSets: (current.quiz.customSets ?? []).map((setEntry) => {
          if (setEntry.id !== current.quiz.activeCustomSetId) {
            return setEntry;
          }

          const questionMap = new Map((setEntry.cards ?? []).map((card) => [card.id, card]));
          const reordered = nextQuestionIds.map((questionId) => questionMap.get(questionId)).filter(Boolean);
          const remaining = (setEntry.cards ?? []).filter((card) => !nextQuestionIds.includes(card.id));
          return { ...setEntry, cards: [...reordered, ...remaining] };
        }),
      },
    }));
  }

  function deleteCustomQuizSet(setId) {
    if (!setId) return;

    setState((current) => {
      const remaining = (current.quiz.customSets ?? []).filter((setEntry) => setEntry.id !== setId);
      const nextActive = current.quiz.activeCustomSetId === setId ? (remaining[0]?.id ?? null) : current.quiz.activeCustomSetId;
      return {
        ...current,
        quiz: {
          ...current.quiz,
          customSets: remaining,
          activeCustomSetId: nextActive,
        },
      };
    });
  }

  function answerOpenQuestion(text) {
    const question = quizQuestion;
    const isCorrect = question
      ? (() => {
          const expected = normalizeAnswerText(question.answer);
          const given = normalizeAnswerText(text);
          return given === expected || given.includes(expected) || expected.includes(given);
        })()
      : null;

    setState((current) => {
      const session = current.quiz.session;
      if (!session?.isActive) return current;
      const question = session.questions[session.index];
      const expected = normalizeAnswerText(question.answer);
      const given = normalizeAnswerText(text);
      const isCorrect = given === expected || given.includes(expected) || expected.includes(given);
      return advanceQuiz(current, isCorrect);
    });

    return isCorrect;
  }

  function answerQuiz(choice) {
    const isCorrect = quizQuestion ? choice === quizQuestion.answer : null;

    setState((current) => {
      const session = current.quiz.session;
      if (!session?.isActive) return current;
      const question = session.questions[session.index];
      return advanceQuiz(current, choice === question.answer);
    });

    return isCorrect;
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
      if (!session?.isActive || session.battleMode === "competitive-solo") return current;
      return { ...current, quiz: { ...current.quiz, session: { ...session, defendReady: true } } };
    });
  }

  function useHeal() {
    setState((current) => {
      const session = current.quiz.session;
      if (!session?.isActive || !session.hasHealer || session.battleMode === "competitive-solo") return current;
      return { ...current, quiz: { ...current.quiz, session: { ...session, partyHp: Math.min(session.maxPartyHp, session.partyHp + 28) } } };
    });
  }

  function usePotion() {
    setState((current) => {
      const session = current.quiz.session;
      if (!session?.isActive || session.potions <= 0 || session.battleMode === "competitive-solo") return current;
      return { ...current, quiz: { ...current.quiz, session: { ...session, potions: session.potions - 1, partyHp: Math.min(session.maxPartyHp, session.partyHp + 60) } } };
    });
  }

  function restartWrongAnswerChallenge() {
    const session = state.quiz.session;
    const wrongIds = new Set((session?.wrongAnswers ?? []).map((entry) => entry.id).filter(Boolean));
    if (!session || session.isActive || !wrongIds.size) {
      showToast("No wrong answers to retry yet");
      return;
    }

    const wrongQuestions = (session.questions ?? []).filter((entry) => wrongIds.has(entry.id));
    if (!wrongQuestions.length) {
      showToast("No wrong answers to retry yet");
      return;
    }

    const baseTimePerQuestion = session.baseTimePerQuestion ?? 20;
    const retryQuestions = wrongQuestions.sort(() => Math.random() - 0.5);
    setState((current) => ({
      ...current,
      quiz: {
        ...current.quiz,
        session: {
          ...session,
          isActive: true,
          questions: retryQuestions,
          index: 0,
          score: 0,
          streak: 0,
          timeLeft: baseTimePerQuestion,
          baseTimePerQuestion,
          hiddenChoices: [],
          wrongAnswers: [],
          recentResults: [],
          pressureMode: "assist",
          defendReady: false,
          result: null,
        },
      },
      ui: { ...current.ui, activeView: "quiz" },
    }));
    showToast(`Retrying ${retryQuestions.length} missed questions`);
  }

  function returnToQuizLobby() {
    setState((current) => ({
      ...current,
      quiz: {
        ...current.quiz,
        session: null,
      },
      ui: {
        ...current.ui,
        activeView: "quiz",
      },
    }));
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
    updateCustomQuizQuestion,
    deleteCustomQuizQuestion,
    deleteCustomQuizSet,
    duplicateCustomQuizQuestion,
    moveCustomQuizQuestion,
    reorderCustomQuizQuestions,
    useDefend,
    useHeal,
    usePotion,
    restartWrongAnswerChallenge,
    returnToQuizLobby,
  };
}
