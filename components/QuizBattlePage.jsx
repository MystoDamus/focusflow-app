import { useState } from "react";

function QuizBattlePage({
  quizSession,
  quizQuestion,
  quizState,
  accuracy,
  onStartQuizBattle,
  onStartSpeedRun,
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
  partyRoster,
}) {
  const [openAnswer, setOpenAnswer] = useState("");
  const [newSetTitle, setNewSetTitle] = useState("");
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftAnswer, setDraftAnswer] = useState("");
  const [draftChoices, setDraftChoices] = useState("");
  const [draftType, setDraftType] = useState("mcq");
  const [draftExplanation, setDraftExplanation] = useState("");
  const [showWrongReview, setShowWrongReview] = useState(false);
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
      explanation: draftExplanation,
    });
    setDraftQuestion("");
    setDraftAnswer("");
    setDraftChoices("");
    setDraftExplanation("");
  }

  // Speed Run view
  if (quizSession?.isActive && quizSession.battleMode === "speedrun" && quizQuestion) {
    return (
      <div className="quiz-speedrun-view">
        <div className="speedrun-header">
          <div className="speedrun-timer-ring">
            <span className="speedrun-timer-value">{quizSession.timeLeft}</span>
            <span className="speedrun-timer-label">sec left</span>
          </div>
          <div className="speedrun-stats">
            <div><span>Score</span><strong>{quizSession.score}</strong></div>
            <div><span>Streak</span><strong>{quizSession.streak}</strong></div>
            <div><span>Q</span><strong>{quizSession.index + 1}/{quizSession.questions.length}</strong></div>
          </div>
        </div>

        <div className="speedrun-question-area">
          <p className="speedrun-question">{quizQuestion.question}</p>
          {qType === "true-false" && (
            <div className="tf-buttons-battle">
              <button type="button" className="tf-btn-battle tf-btn--true" onClick={() => onAnswerQuiz("True")}>True</button>
              <button type="button" className="tf-btn-battle tf-btn--false" onClick={() => onAnswerQuiz("False")}>False</button>
            </div>
          )}
          {qType === "identification" && (
            <form className="open-answer-form-battle" onSubmit={handleOpenSubmit}>
              <input className="open-answer-input-battle" value={openAnswer} onChange={(e) => setOpenAnswer(e.target.value)} placeholder="Type your answer..." autoFocus />
              <button type="submit" className="accent-button">Submit</button>
            </form>
          )}
          {(qType === "mcq" || !qType) && (
            <div className="choice-grid-battle">
              {quizQuestion.choices.map((choice) => (
                <button key={choice} type="button" className="choice-btn-battle" onClick={() => onAnswerQuiz(choice)}>
                  {choice}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render full-screen battle view when active
  if (quizSession?.isActive && quizQuestion) {
    return (
      <div className="quiz-fullscreen-battle">
        <div className="battle-fx-layer" aria-hidden>
          <span className="battle-fx-orb battle-fx-orb--one" />
          <span className="battle-fx-orb battle-fx-orb--two" />
          <span className="battle-fx-orb battle-fx-orb--three" />
          <span className="battle-fx-streak battle-fx-streak--one" />
          <span className="battle-fx-streak battle-fx-streak--two" />
        </div>
        {/* Battle Arena */}
        <div className="battle-arena">
          {/* Boss Side */}
          <div className="battle-side battle-side--boss">
            <div className="boss-arena">
              <div className={`boss-sprite-battle ${quizSession.bossHp <= 0 ? "boss-dead" : ""}`} style={{ fontSize: "4rem" }}>
                👹
              </div>
              <div className="boss-info">
                <h4>Boss</h4>
                <div className="arena-hp-bar">
                  <div
                    className={`arena-hp-fill ${
                      (quizSession.bossHp / quizSession.maxBossHp) > 0.5 ? "arena-hp-healthy"
                      : (quizSession.bossHp / quizSession.maxBossHp) > 0.2 ? "arena-hp-wounded"
                      : "arena-hp-critical"
                    }`}
                    style={{ width: `${(quizSession.bossHp / quizSession.maxBossHp) * 100}%` }}
                  />
                </div>
                <p className="arena-hp-text">{quizSession.bossHp}/{quizSession.maxBossHp}</p>
              </div>
            </div>
          </div>

          <div className="battle-vs-container">
            <div className="battle-vs-text">VS</div>
          </div>

          {/* Party Side */}
          <div className="battle-side battle-side--party">
            <div className="party-arena">
              <div className="party-roster-battle">
                {(partyRoster ?? []).slice(0, 3).map((member, index) => (
                  <div key={`${member.id}-${index}`} className="party-member-battle">
                    <div className="member-sprite-battle">{member.emoji ?? "⚔️"}</div>
                    <p className="member-name-battle">{member.displayName?.slice(0, 8) ?? "Member"}</p>
                  </div>
                ))}
              </div>
              <div className="party-health-battle">
                <h4>Party HP</h4>
                <div className="arena-hp-bar">
                  <div className="arena-hp-fill arena-hp-healthy" style={{ width: `${(quizSession.partyHp / quizSession.maxPartyHp) * 100}%` }} />
                </div>
                <p className="arena-hp-text">{quizSession.partyHp}/{quizSession.maxPartyHp}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="battle-question-container">
          <div className="battle-question-header">
            <span className="battle-progress">Q{quizSession.index + 1}/{quizSession.questions.length}</span>
            <span className={`battle-type-badge battle-type-badge--${qType}`}>
              {qType === "identification" ? "Identification" : qType === "true-false" ? "True / False" : "Multiple Choice"}
            </span>
            <span className="battle-timer">⏱️ {quizSession.timeLeft}s</span>
          </div>

          <h2 className="battle-question-text">{quizQuestion.question}</h2>

          <div className="battle-options-container">
            {qType === "true-false" && (
              <div className="tf-buttons-battle">
                <button type="button" className="tf-btn-battle tf-btn--true" onClick={() => onAnswerQuiz("True")}>True</button>
                <button type="button" className="tf-btn-battle tf-btn--false" onClick={() => onAnswerQuiz("False")}>False</button>
              </div>
            )}
            {qType === "identification" && (
              <form className="open-answer-form-battle" onSubmit={handleOpenSubmit}>
                <input className="open-answer-input-battle" value={openAnswer} onChange={(e) => setOpenAnswer(e.target.value)} placeholder="Type your answer and press Enter" autoFocus />
                <button type="submit" className="accent-button">Submit</button>
              </form>
            )}
            {(qType === "mcq" || !qType) && (
              <div className="choice-grid-battle">
                {quizQuestion.choices.map((choice) => (
                  <button key={choice} type="button" className="choice-btn-battle" onClick={() => onAnswerQuiz(choice)} disabled={quizSession.hiddenChoices.includes(choice)}>
                    {quizSession.hiddenChoices.includes(choice) ? "-" : choice}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Explanation hint (shown in bottom bar if available but session still active) */}
          <div className="battle-bottom-bar">
            <div className="battle-powerups">
              <button type="button" className="powerup-btn" disabled={!quizSession.fiftyFifty || qType !== "mcq"} onClick={onUseFiftyFifty} title="50-50">50-50</button>
              <button type="button" className="powerup-btn" disabled={!quizSession.extraTime} onClick={onUseExtraTime} title="Extra Time">+10s</button>
              <button type="button" className="powerup-btn" onClick={onUseDefend} title="Defend">🛡️</button>
              <button type="button" className="powerup-btn" disabled={!quizSession.hasHealer} onClick={onUseHeal} title="Heal">❤️</button>
              <button type="button" className="powerup-btn" disabled={quizSession.potions <= 0} onClick={onUsePotion} title="Potion">🧪 {quizSession.potions}</button>
            </div>
            <div className="battle-stats">
              <div className="stat-item"><span>Score</span><strong>{quizSession.score}</strong></div>
              <div className="stat-item"><span>Streak</span><strong>{quizSession.streak}</strong></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // After battle: show result + wrong answer review
  if (quizSession && !quizSession.isActive && quizSession.result) {
    const wrongAnswers = quizSession.wrongAnswers ?? [];
    return (
      <section className="feature-page">
        <div className="feature-header">
          <h2>
            {quizSession.result === "victory" ? "⚔️ Victory!" :
             quizSession.result === "defeat" ? "💀 Defeat" :
             quizSession.result === "speedrun-done" ? "⚡ Speed Run Complete" :
             "⏱️ Time's Up"}
          </h2>
          <div className="flashcard-actions">
            <button type="button" className="accent-button" onClick={() => onStartQuizBattle("flashcards")}>Play Again</button>
            {quizSession.battleMode === "speedrun" && (
              <button type="button" className="ghost-button" onClick={() => onStartSpeedRun("flashcards")}>Speed Run Again</button>
            )}
          </div>
        </div>
        <div className="feature-grid">
          <article className="panel">
            <h3>Results</h3>
            <div className="stat-grid">
              <div><span>Score</span><strong>{quizSession.score}</strong></div>
              <div><span>Streak</span><strong>{quizSession.streak}</strong></div>
              <div><span>Best Score</span><strong>{quizState.bestScore}</strong></div>
              <div><span>Accuracy</span><strong>{accuracy}%</strong></div>
            </div>
          </article>

          {wrongAnswers.length > 0 && (
            <article className="panel">
              <div className="wrong-review-header">
                <h3>Mistakes to Review ({wrongAnswers.length})</h3>
                <button type="button" className="ghost-button" onClick={() => setShowWrongReview((v) => !v)}>
                  {showWrongReview ? "Hide" : "Show"}
                </button>
              </div>
              {showWrongReview && (
                <div className="wrong-review-list">
                  {wrongAnswers.map((item, i) => (
                    <div key={i} className="wrong-review-item">
                      <p className="wrong-review-q">Q: {item.question}</p>
                      <p className="wrong-review-a">✓ {item.correctAnswer}</p>
                      {item.explanation && <p className="wrong-review-exp">💡 {item.explanation}</p>}
                    </div>
                  ))}
                </div>
              )}
            </article>
          )}
        </div>
      </section>
    );
  }

  // Default page view
  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>Quiz Battle</h2>
        <div className="flashcard-actions">
          <button type="button" className="accent-button" onClick={() => onStartQuizBattle("flashcards")}>
            Start Boss Battle
          </button>
          <button type="button" className="ghost-button" onClick={() => onStartSpeedRun("flashcards")}>
            ⚡ Speed Run (60s)
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={!activeCustomSet || activeCustomSet.cards.length < 2}
            onClick={() => onStartQuizBattle("custom", activeCustomSet?.id)}
          >
            Custom Quiz Battle
          </button>
          <button type="button" className="ghost-button" onClick={() => onStartQuizBattle("flashcards", null, "versus")}>
            Party Versus
          </button>
        </div>
      </div>

      <div className="feature-grid">
        <article className="panel">
          <h3>Create a Dedicated Quiz</h3>
          <form className="stack-form" onSubmit={handleCreateSet}>
            <input value={newSetTitle} onChange={(event) => setNewSetTitle(event.target.value)} placeholder="Quiz set title" />
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
            {!(customQuizSets ?? []).length && <p className="muted">No custom quiz set yet.</p>}
          </div>

          <form className="stack-form" onSubmit={handleAddQuestion}>
            <select value={draftType} onChange={(event) => setDraftType(event.target.value)}>
              <option value="mcq">Multiple Choice</option>
              <option value="true-false">True / False</option>
              <option value="identification">Identification</option>
            </select>
            <input value={draftQuestion} onChange={(event) => setDraftQuestion(event.target.value)} placeholder="Question" />
            <input value={draftAnswer} onChange={(event) => setDraftAnswer(event.target.value)} placeholder="Correct answer" />
            {draftType === "mcq" && (
              <input value={draftChoices} onChange={(event) => setDraftChoices(event.target.value)} placeholder="Other choices separated by |" />
            )}
            <input value={draftExplanation} onChange={(event) => setDraftExplanation(event.target.value)} placeholder="Explanation (optional - shown after wrong answer)" />
            <button type="submit" className="ghost-button" disabled={!activeCustomSet}>Add Question</button>
          </form>
          <p className="muted">Custom quizzes are separate from flashcards.</p>
        </article>

        <article className="panel">
          <h3>Arena Stats</h3>
          <p className="muted">Solo battles scale boss HP based on your accuracy. Higher accuracy = tougher boss.</p>
          <div className="stat-grid">
            <div><span>Best Score</span><strong>{quizState.bestScore}</strong></div>
            <div><span>Accuracy</span><strong>{accuracy}%</strong></div>
            <div><span>Total Answered</span><strong>{quizState.totalAnswered}</strong></div>
          </div>

          {/* Competitive Solo Section */}
          <article className="panel" style={{ marginTop: "20px", background: "linear-gradient(135deg, rgba(255, 211, 108, 0.1), rgba(99, 199, 255, 0.1))", borderColor: "rgba(255, 211, 108, 0.3)" }}>
            <h3 style={{ color: "#ffd36c" }}>🏆 Competitive Solo Challenges</h3>
            <p className="muted">Beat your personal records and climb the ranks.</p>
            <div className="stat-grid" style={{ marginBottom: "16px" }}>
              <div><span>Current Streak</span><strong style={{ color: "#63c7ff" }}>—</strong></div>
              <div><span>Best Streak</span><strong style={{ color: "#ffe7a6" }}>—</strong></div>
              <div><span>Accuracy Record</span><strong style={{ color: "#56d77f" }}>—</strong></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button
                type="button"
                className="ghost-button"
                onClick={() => onStartQuizBattle("flashcards")}
                title="Timed challenge: Answer as many questions correctly as possible before accuracy drops"
                style={{ minHeight: "50px", fontSize: "0.95rem" }}
              >
                ⏱️ Accuracy Challenge
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => onStartSpeedRun("flashcards")}
                title="60-second speed round with unlimited questions"
                style={{ minHeight: "50px", fontSize: "0.95rem" }}
              >
                ⚡ Speed Challenge
              </button>
            </div>
          </article>

          <div className="quiz-mode-info">
            <div className="quiz-mode-card">
              <strong>⚔️ Boss Battle</strong>
              <span>10 questions, boss HP scales with your skill. Powerups available.</span>
            </div>
            <div className="quiz-mode-card">
              <strong>⚡ Speed Run</strong>
              <span>60 seconds, unlimited questions, answer as fast as you can.</span>
            </div>
            <div className="quiz-mode-card">
              <strong>👥 Party Versus</strong>
              <span>Fight alongside your party roster with enhanced abilities.</span>
            </div>
            <div className="quiz-mode-card">
              <strong>🏆 Competitive Solo</strong>
              <span>Personal records, streaks, and ranked challenges. No powerups allowed.</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default QuizBattlePage;
