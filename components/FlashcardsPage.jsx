import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Edit2, Plus, RotateCcw, Trash2 } from "lucide-react";

function FlashcardsPage({
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
  onSelectSet,
  onDeleteSet,
  onAddFlashcardCard,
  onDeleteCard,
  onUpdateCard,
  onStartFlashcardSession,
  onStartFiltered,
  onAnswerFlashcard,
  onAnswerOpenFlashcard,
  onNextFlashcard,
  onRateFlashcard,
  onImportCards,
  onExportCards,
  onImportFromText,
}) {
  const [openAnswer, setOpenAnswer] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [showPasteImport, setShowPasteImport] = useState(false);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [editC, setEditC] = useState("");
  const [activeTab, setActiveTab] = useState("cards"); // "cards" | "study" | "stats"

  const currentCard = flashSession ? flashSession.deck[flashSession.index] : null;
  const cardType = currentCard?.type ?? (currentCard?.choices?.length > 1 ? "mcq" : "basic");

  function handleOpenSubmit(event) {
    event.preventDefault();
    if (!openAnswer.trim()) return;
    onAnswerOpenFlashcard(openAnswer);
    setOpenAnswer("");
    setFlipped(false);
  }

  function handleFlip() {
    setFlipped((prev) => !prev);
  }

  function handleAnswer(choice) {
    onAnswerFlashcard(choice);
    setFlipped(false);
  }

  function handleRate(rating) {
    onRateFlashcard(rating);
    setFlipped(false);
  }

  function handleEditStart(card) {
    onSetEditingCardId(card.id);
    setEditQ(card.question);
    setEditA(card.answer);
    const otherChoices = (card.choices ?? []).filter((c) => c !== card.answer).join(" | ");
    setEditC(otherChoices);
  }

  function handleEditSave(cardId) {
    onUpdateCard(cardId, editQ, editA, editC);
    onSetEditingCardId(null);
  }

  function handlePasteImport(event) {
    event.preventDefault();
    onImportFromText(pasteText);
    setPasteText("");
    setShowPasteImport(false);
  }

  // Compute stats for active set
  const deckCards = activeSet?.cards ?? [];
  const hardCards = deckCards.filter((c) => (c.strength ?? 1) <= 1);
  const dueCards = deckCards.filter((c) => !c.dueDay || c.dueDay <= state.dayKey);
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

  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>Flashcards Lab</h2>
        <div className="flashcard-actions">
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

      <div className="fc-layout">
        {/* Left column: sets + cards */}
        <div className="fc-left">
          <article className="panel">
            <h3>Sets</h3>
            <form className="stack-form" onSubmit={onAddFlashcardSet}>
              <input value={newSetTitle} onChange={(e) => onSetNewSetTitle(e.target.value)} placeholder="Set name (e.g. Thermodynamics)" />
              <button type="submit" className="ghost-button"><Plus size={14} /> Create Set</button>
            </form>
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
            <article className="panel fc-tab-panel">
              <div className="fc-tabs">
                {["cards", "study", "stats"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`fc-tab ${activeTab === tab ? "is-active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === "cards" && (
                <div className="fc-cards-list">
                  <form className="stack-form" onSubmit={onAddFlashcardCard}>
                    <input value={newCardQuestion} onChange={(e) => onSetNewCardQuestion(e.target.value)} placeholder="Question" />
                    <input value={newCardAnswer} onChange={(e) => onSetNewCardAnswer(e.target.value)} placeholder="Correct answer" />
                    <input value={newCardChoices} onChange={(e) => onSetNewCardChoices(e.target.value)} placeholder="Other choices separated by |" />
                    <button type="submit" className="ghost-button"><Plus size={14} /> Add Card</button>
                  </form>
                  <p className="muted">MCQ auto-enabled when you provide extra choices.</p>
                  <div className="fc-card-list">
                    {deckCards.map((card) => (
                      <div key={card.id} className="fc-card-item">
                        {editingCardId === card.id ? (
                          <div className="fc-card-edit">
                            <input value={editQ} onChange={(e) => setEditQ(e.target.value)} placeholder="Question" />
                            <input value={editA} onChange={(e) => setEditA(e.target.value)} placeholder="Answer" />
                            <input value={editC} onChange={(e) => setEditC(e.target.value)} placeholder="Other choices | separated" />
                            <div className="fc-edit-actions">
                              <button type="button" className="accent-button" onClick={() => handleEditSave(card.id)}>Save</button>
                              <button type="button" className="ghost-button" onClick={() => onSetEditingCardId(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="fc-card-body">
                              <strong>{card.question}</strong>
                              <span className="muted">{card.answer}</span>
                              <div className="fc-card-meta">
                                <span className={`fc-strength fc-strength--${card.type ?? "basic"}`}>{card.type ?? "basic"}</span>
                                <span className="fc-strength">str {card.strength ?? 1}</span>
                              </div>
                            </div>
                            <div className="fc-card-actions">
                              <button type="button" className="icon-btn" onClick={() => handleEditStart(card)} title="Edit"><Edit2 size={13} /></button>
                              <button type="button" className="icon-danger-btn" onClick={() => onDeleteCard(card.id)} title="Delete"><Trash2 size={13} /></button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {!deckCards.length && <p className="muted">No cards yet.</p>}
                  </div>
                </div>
              )}

              {activeTab === "study" && (
                <div className="fc-study-settings">
                  <p className="muted">Choose which cards to study:</p>
                  <div className="fc-filter-row">
                    {["all", "hard", "due"].map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={`ghost-button ${studyFilter === f ? "is-active" : ""}`}
                        onClick={() => onSetStudyFilter(f)}
                      >
                        {f === "all" ? "All Cards" : f === "hard" ? `Hard (${hardCards.length})` : `Due Today (${dueCards.length})`}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="accent-button"
                    onClick={() => onStartFiltered(studyFilter)}
                    disabled={!deckCards.length}
                  >
                    Start Session ({studyFilter === "hard" ? hardCards.length : studyFilter === "due" ? dueCards.length : deckCards.length} cards)
                  </button>
                </div>
              )}

              {activeTab === "stats" && (
                <div className="fc-stats-grid">
                  <div className="stat-card"><span>Total Cards</span><strong>{deckCards.length}</strong></div>
                  <div className="stat-card"><span>Hard Cards</span><strong>{hardCards.length}</strong></div>
                  <div className="stat-card"><span>Due Today</span><strong>{dueCards.length}</strong></div>
                  <div className="stat-card"><span>Avg Strength</span><strong>{avgStrength}</strong></div>
                  <div className="stat-card"><span>Session Acc</span><strong>{sessionAcc !== null ? `${sessionAcc}%` : "—"}</strong></div>
                  <div className="stat-card"><span>Progress</span><strong>{sessionProgress ?? "—"}</strong></div>
                </div>
              )}
            </article>
          )}
        </div>

        {/* Right column: study mode */}
        <div className="fc-right">
          <article className="panel fc-study-panel">
            <div className="fc-study-header">
              <h3>Study Mode</h3>
              {sessionProgress && (
                <div className="fc-session-meta">
                  <span>{sessionProgress}</span>
                  {sessionAcc !== null && <span>{sessionAcc}% acc</span>}
                </div>
              )}
            </div>

            {currentCard ? (
              <div className="fc-flashcard-wrapper">
                <div
                  className={`fc-flashcard ${flipped ? "is-flipped" : ""}`}
                  onClick={cardType === "basic" ? handleFlip : undefined}
                  role={cardType === "basic" ? "button" : undefined}
                  tabIndex={cardType === "basic" ? 0 : undefined}
                  onKeyDown={cardType === "basic" ? (e) => e.key === "Enter" && handleFlip() : undefined}
                >
                  <div className="fc-flashcard__front">
                    <p className="fc-question">{currentCard.question}</p>
                    {cardType === "basic" && !flashSession.reveal && (
                      <span className="fc-flip-hint">Click to flip</span>
                    )}
                  </div>
                  <div className="fc-flashcard__back">
                    <p className="fc-answer">{currentCard.answer}</p>
                  </div>
                </div>

                {cardType === "mcq" && !flashSession.reveal && (
                  <div className="choice-grid">
                    {currentCard.choices.map((choice) => (
                      <button key={choice} type="button" className="ghost-button" onClick={() => handleAnswer(choice)}>
                        {choice}
                      </button>
                    ))}
                  </div>
                )}

                {cardType === "true-false" && !flashSession.reveal && (
                  <div className="tf-buttons">
                    <button type="button" className="tf-btn tf-btn--true" onClick={() => handleAnswer("True")}>✓ True</button>
                    <button type="button" className="tf-btn tf-btn--false" onClick={() => handleAnswer("False")}>✗ False</button>
                  </div>
                )}

                {cardType === "basic" && !flashSession.reveal && flipped && (
                  <div className="fc-self-rate">
                    <p className="muted">How well did you know this?</p>
                    <div className="sm2-buttons">
                      <button type="button" className="ghost-button sm2-again" onClick={() => handleRate("again")}>Again</button>
                      <button type="button" className="ghost-button sm2-hard" onClick={() => handleRate("hard")}>Hard</button>
                      <button type="button" className="accent-button sm2-easy" onClick={() => handleRate("easy")}>Easy</button>
                    </div>
                  </div>
                )}

                {cardType === "basic" && !flashSession.reveal && !flipped && (
                  <form className="open-answer-form" onSubmit={handleOpenSubmit}>
                    <input
                      value={openAnswer}
                      onChange={(e) => setOpenAnswer(e.target.value)}
                      className="open-answer-input"
                      placeholder="Type your answer, or click card to flip"
                    />
                    <button type="submit" className="accent-button">Check</button>
                  </form>
                )}

                {flashSession.reveal && (
                  <div className="result-banner result-banner--stack">
                    <span>Answer: <strong>{currentCard.answer}</strong></span>
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
                <p className="muted">Select a set and start a session.</p>
                {activeSet && (
                  <button type="button" className="accent-button" onClick={() => onStartFiltered(studyFilter)}>
                    Start Session
                  </button>
                )}
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

export default FlashcardsPage;
