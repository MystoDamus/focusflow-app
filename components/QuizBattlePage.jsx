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
  partyRoster,
  bossData,
}) {
  const [openAnswer, setOpenAnswer] = useState("");
  const [newSetTitle, setNewSetTitle] = useState("");
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftAnswer, setDraftAnswer] = useState("");
  const [draftChoices, setDraftChoices] = useState("");
  const [draftType, setDraftType] = useState("mcq");
  const [lastAnswerState, setLastAnswerState] = useState(null); // Track for animations
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

  // Render full-screen battle view when active
  if (quizSession?.isActive && quizQuestion) {
    return (
      <div className="quiz-fullscreen-battle">
        {/* Battle Arena */}
        <div className="battle-arena">
          {/* Boss Side */}
          <div className="battle-side battle-side--boss">
            <div className="boss-arena">
              <div 
                className={`boss-sprite-battle ${quizSession.bossHp <= 0 ? "boss-dead" : ""}`}
                style={{ fontSize: "4rem" }}
              >
                👹
              </div>
              <div className="boss-info">
                <h4>Boss</h4>
                <div className="arena-hp-bar">
                  <div
                    className={`arena-hp-fill ${
                      (quizSession.bossHp / quizSession.maxBossHp) > 0.5
                        ? "arena-hp-healthy"
                        : (quizSession.bossHp / quizSession.maxBossHp) > 0.2
                          ? "arena-hp-wounded"
                          : "arena-hp-critical"
                    }`}
                    style={{
                      width: `${(quizSession.bossHp / quizSession.maxBossHp) * 100}%`,
                    }}
                  />
                </div>
                <p className="arena-hp-text">
                  {quizSession.bossHp}/{quizSession.maxBossHp}
                </p>
              </div>
            </div>
          </div>

          {/* VS Indicator */}
          <div className="battle-vs-container">
            <div className="battle-vs-text">VS</div>
          </div>

          {/* Party Side */}
          <div className="battle-side battle-side--party">
            <div className="party-arena">
              <div className="party-roster-battle">
                {(partyRoster ?? []).slice(0, 3).map((member, index) => (
                  <div key={`${member.id}-${index}`} className="party-member-battle">
                    <div className="member-sprite-battle">
                      {member.emoji ?? "⚔️"}
                    </div>
                    <p className="member-name-battle">{member.displayName?.slice(0, 8) ?? "Member"}</p>
                  </div>
                ))}
              </div>
              <div className="party-health-battle">
                <h4>Party HP</h4>
                <div className="arena-hp-bar">
                  <div
                    className="arena-hp-fill arena-hp-healthy"
                    style={{
                      width: `${(quizSession.partyHp / quizSession.maxPartyHp) * 100}%`,
                    }}
                  />
                </div>
                <p className="arena-hp-text">
                  {quizSession.partyHp}/{quizSession.maxPartyHp}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="battle-question-container">
          <div className="battle-question-header">
            <span className="battle-progress">
              Q{quizSession.index + 1}/{quizSession.questions.length}
            </span>
            <span className={`battle-type-badge battle-type-badge--${qType}`}>
              {qType === "identification"
                ? "Identification"
                : qType === "true-false"
                  ? "True / False"
                  : "Multiple Choice"}
            </span>
            <span className="battle-timer">⏱️ {quizSession.timeLeft}s</span>
          </div>

          <h2 className="battle-question-text">{quizQuestion.question}</h2>

          <div className="battle-options-container">
            {qType === "true-false" && (
              <div className="tf-buttons-battle">
                <button
                  type="button"
                  className="tf-btn-battle tf-btn--true"
                  onClick={() => onAnswerQuiz("True")}
                >
                  True
                </button>
                <button
                  type="button"
                  className="tf-btn-battle tf-btn--false"
                  onClick={() => onAnswerQuiz("False")}
                >
                  False
                </button>
              </div>
            )}

            {qType === "identification" && (
              <form className="open-answer-form-battle" onSubmit={handleOpenSubmit}>
                <input
                  className="open-answer-input-battle"
                  value={openAnswer}
                  onChange={(e) => setOpenAnswer(e.target.value)}
                  placeholder="Type your answer and press Enter"
                  autoFocus
                />
                <button type="submit" className="accent-button">
                  Submit
                </button>
              </form>
            )}

            {(qType === "mcq" || !qType) && (
              <div className="choice-grid-battle">
                {quizQuestion.choices.map((choice, index) => (
                  <button
                    key={choice}
                    type="button"
                    className="choice-btn-battle"
                    onClick={() => onAnswerQuiz(choice)}
                    disabled={quizSession.hiddenChoices.includes(choice)}
                  >
                    {quizSession.hiddenChoices.includes(choice) ? "-" : choice}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Powerups and Stats */}
          <div className="battle-bottom-bar">
            <div className="battle-powerups">
              <button
                type="button"
                className="powerup-btn"
                disabled={!quizSession.fiftyFifty || qType !== "mcq"}
                onClick={onUseFiftyFifty}
                title="50-50"
              >
                50-50
              </button>
              <button
                type="button"
                className="powerup-btn"
                disabled={!quizSession.extraTime}
                onClick={onUseExtraTime}
                title="Extra Time"
              >
                +10s
              </button>
              <button
                type="button"
                className="powerup-btn"
                onClick={onUseDefend}
                title="Defend"
              >
                🛡️
              </button>
              <button
                type="button"
                className="powerup-btn"
                disabled={!quizSession.hasHealer}
                onClick={onUseHeal}
                title="Heal"
              >
                ❤️
              </button>
              <button
                type="button"
                className="powerup-btn"
                disabled={quizSession.potions <= 0}
                onClick={onUsePotion}
                title="Potion"
              >
                🧪 {quizSession.potions}
              </button>
            </div>

            <div className="battle-stats">
              <div className="stat-item">
                <span>Score</span>
                <strong>{quizSession.score}</strong>
              </div>
              <div className="stat-item">
                <span>Streak</span>
                <strong>{quizSession.streak}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default page view
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
            <button type="submit" className="ghost-button" disabled={!activeCustomSet}>
              Add Question
            </button>
          </form>
          <p className="muted">
            Custom quizzes are separate from flashcards, but you can still launch a quiz using flashcards.
          </p>
        </article>

        <article className="panel">
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
        </article>
      </div>
    </section>
  );
}

export default QuizBattlePage;
