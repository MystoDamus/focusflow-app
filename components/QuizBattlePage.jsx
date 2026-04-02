import { useState } from "react";

function QuizBattlePage({
  quizSession,
  quizQuestion,
  quizState,
  accuracy,
  onStartQuizBattle,
  onAnswerQuiz,
  onAnswerOpenQuestion,
  onUseFiftyFifty,
  onUseExtraTime,
  onUseDefend,
  onUseHeal,
  onUsePotion,
  customQuizSets,
  activeCustomSet,
  onCreateCustomQuizSet,
  onAddCustomQuizQuestion,
  onSelectCustomQuizSet,
}) {
  const [openAnswer, setOpenAnswer] = useState("");
  const [newSetTitle, setNewSetTitle] = useState("");
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftAnswer, setDraftAnswer] = useState("");
  const [draftChoices, setDraftChoices] = useState("");
  const [draftType, setDraftType] = useState("mcq");
  const qType = quizQuestion?.type ?? "mcq";

  function handleOpenSubmit(event) {
    event.preventDefault();
    if (!openAnswer.trim()) return;
    onAnswerOpenQuestion(openAnswer.trim());
    setOpenAnswer("");
  }

  function handleCreateSet(event) {
    event.preventDefault();
    if (!newSetTitle.trim()) return;
    onCreateCustomQuizSet(newSetTitle.trim());
    setNewSetTitle("");
  }

  function handleAddQuestion(event) {
    event.preventDefault();
    if (!draftQuestion.trim() || !draftAnswer.trim()) return;

    onAddCustomQuizQuestion({
      question: draftQuestion,
      answer: draftAnswer,
      type: draftType,
      choices: draftType === "mcq" ? draftChoices.split("|") : [],
    });
    setDraftQuestion("");
    setDraftAnswer("");
    setDraftChoices("");
  }

  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>Quiz Battle</h2>
        <div className="flashcard-actions">
          <button type="button" className="accent-button" onClick={() => onStartQuizBattle("flashcards")}>
            Start Solo Boss Battle (Flashcards)
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={!activeCustomSet || activeCustomSet.cards.length < 2}
            onClick={() => onStartQuizBattle("custom", activeCustomSet?.id)}
          >
            Start Solo Boss Battle (Custom Quiz)
          </button>
          <button type="button" className="ghost-button" onClick={() => onStartQuizBattle("flashcards", null, "versus")}>
            Start Party Versus Battle
          </button>
        </div>
      </div>

      <div className="feature-grid">
        <article className="panel">
          <h3>Create a Dedicated Quiz</h3>
          <form className="stack-form" onSubmit={handleCreateSet}>
            <input
              value={newSetTitle}
              onChange={(event) => setNewSetTitle(event.target.value)}
              placeholder="Quiz set title"
            />
            <button type="submit" className="ghost-button">Create Quiz Set</button>
          </form>

          <div className="list-block">
            {(customQuizSets ?? []).map((setEntry) => (
              <button
                key={setEntry.id}
                type="button"
                className={`list-item ${activeCustomSet?.id === setEntry.id ? "is-active" : ""}`}
                onClick={() => onSelectCustomQuizSet(setEntry.id)}
              >
                <strong>{setEntry.title}</strong>
                <span>{setEntry.cards.length} questions</span>
              </button>
            ))}
            {!(customQuizSets ?? []).length ? <p className="muted">No custom quiz set yet.</p> : null}
          </div>

          <form className="stack-form" onSubmit={handleAddQuestion}>
            <select value={draftType} onChange={(event) => setDraftType(event.target.value)}>
              <option value="mcq">Multiple Choice</option>
              <option value="true-false">True / False</option>
              <option value="identification">Identification</option>
            </select>
            <input
              value={draftQuestion}
              onChange={(event) => setDraftQuestion(event.target.value)}
              placeholder="Question"
            />
            <input
              value={draftAnswer}
              onChange={(event) => setDraftAnswer(event.target.value)}
              placeholder="Correct answer"
            />
            {draftType === "mcq" ? (
              <input
                value={draftChoices}
                onChange={(event) => setDraftChoices(event.target.value)}
                placeholder="Other choices separated by |"
              />
            ) : null}
            <button type="submit" className="ghost-button" disabled={!activeCustomSet}>Add Question</button>
          </form>
          <p className="muted">Custom quizzes are separate from flashcards, but you can still launch a quiz using flashcards.</p>
        </article>

        <article className="panel">
          {quizSession?.isActive && quizQuestion ? (
            <div className="quiz-card">
              <div className="quiz-top">
                <span>Question {quizSession.index + 1}/{quizSession.questions.length}</span>
                <span className={`quiz-type-badge quiz-type-badge--${qType}`}>
                  {qType === "identification" ? "Identification" : qType === "true-false" ? "True / False" : "Multiple Choice"}
                </span>
                <strong className="quiz-timer">{quizSession.timeLeft}s</strong>
              </div>

              <div className="quiz-battle-bars">
                <div>
                  <span>{quizSession.battleMode === "versus" ? "Enemy Party HP" : "Boss HP"}</span>
                  <div className="qba-hp-track">
                    <div
                      className="qba-hp-fill qba-hp-critical"
                      style={{
                        width: `${(
                          (quizSession.battleMode === "versus" ? quizSession.enemyPartyHp : quizSession.bossHp) /
                          (quizSession.battleMode === "versus" ? quizSession.maxEnemyPartyHp : quizSession.maxBossHp)
                        ) * 100}%`,
                      }}
                    />
                  </div>
                  <strong>
                    {quizSession.battleMode === "versus" ? quizSession.enemyPartyHp : quizSession.bossHp}/
                    {quizSession.battleMode === "versus" ? quizSession.maxEnemyPartyHp : quizSession.maxBossHp}
                  </strong>
                </div>
                <div>
                  <span>Party HP</span>
                  <div className="qba-hp-track">
                    <div className="qba-hp-fill qba-hp-healthy" style={{ width: `${(quizSession.partyHp / quizSession.maxPartyHp) * 100}%` }} />
                  </div>
                  <strong>{quizSession.partyHp}/{quizSession.maxPartyHp}</strong>
                </div>
              </div>

              <h3 className="quiz-question">{quizQuestion.question}</h3>

              {qType === "true-false" && (
                <div className="tf-buttons">
                  <button type="button" className="tf-btn tf-btn--true" onClick={() => onAnswerQuiz("True")}>
                    True
                  </button>
                  <button type="button" className="tf-btn tf-btn--false" onClick={() => onAnswerQuiz("False")}>
                    False
                  </button>
                </div>
              )}

              {qType === "identification" && (
                <form className="open-answer-form" onSubmit={handleOpenSubmit}>
                  <input
                    className="open-answer-input"
                    value={openAnswer}
                    onChange={(e) => setOpenAnswer(e.target.value)}
                    placeholder="Type your answer and press Enter"
                    autoFocus
                  />
                  <button type="submit" className="accent-button">Submit</button>
                </form>
              )}

              {(qType === "mcq" || !qType) && (
                <div className="choice-grid">
                  {quizQuestion.choices.map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      className="ghost-button"
                      onClick={() => onAnswerQuiz(choice)}
                      disabled={quizSession.hiddenChoices.includes(choice)}
                    >
                      {quizSession.hiddenChoices.includes(choice) ? "-" : choice}
                    </button>
                  ))}
                </div>
              )}

              <div className="powerup-row">
                <button type="button" className="ghost-button" disabled={!quizSession.fiftyFifty || qType !== "mcq"} onClick={onUseFiftyFifty}>50-50</button>
                <button type="button" className="ghost-button" disabled={!quizSession.extraTime} onClick={onUseExtraTime}>+10s</button>
                <button type="button" className="ghost-button" onClick={onUseDefend}>Defend</button>
                <button type="button" className="ghost-button" onClick={onUseHeal} disabled={!quizSession.hasHealer}>Heal</button>
                <button type="button" className="ghost-button" onClick={onUsePotion} disabled={quizSession.potions <= 0}>Potion ({quizSession.potions})</button>
              </div>

              <div className="stat-grid">
                <div><span>Score</span><strong>{quizSession.score}</strong></div>
                <div><span>Streak</span><strong>{quizSession.streak}</strong></div>
              </div>
            </div>
          ) : (
            <div className="quiz-card">
              <h3>{quizSession?.result === "victory" ? "Victory" : quizSession?.result === "defeat" ? "Defeat" : "Arena Idle"}</h3>
              <p>
                Solo battles now include boss health and party health. Correct answers damage the boss.
                Wrong answers damage your party. Use Defend, Heal, and Potions to survive. You can also launch Party Versus battles.
              </p>
              <div className="stat-grid">
                <div><span>Best Score</span><strong>{quizState.bestScore}</strong></div>
                <div><span>Accuracy</span><strong>{accuracy}%</strong></div>
                <div><span>Total Answered</span><strong>{quizState.totalAnswered}</strong></div>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default QuizBattlePage;
