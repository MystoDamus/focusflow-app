import { useState } from "react";
import { Plus } from "lucide-react";

function FlashcardsPage({
  state,
  activeSet,
  flashSession,
  newSetTitle,
  newCardQuestion,
  newCardAnswer,
  newCardChoices,
  onSetNewSetTitle,
  onSetNewCardQuestion,
  onSetNewCardAnswer,
  onSetNewCardChoices,
  onAddFlashcardSet,
  onSelectSet,
  onAddFlashcardCard,
  onStartFlashcardSession,
  onAnswerFlashcard,
  onAnswerOpenFlashcard,
  onNextFlashcard,
  onRateFlashcard,
  onImportCards,
  onExportCards,
}) {
  const [openAnswer, setOpenAnswer] = useState("");
  const currentCard = flashSession ? flashSession.deck[flashSession.index] : null;
  const cardType = currentCard?.type ?? (currentCard?.choices?.length > 1 ? "mcq" : "basic");

  function handleOpenSubmit(event) {
    event.preventDefault();
    if (!openAnswer.trim()) {
      return;
    }
    onAnswerOpenFlashcard(openAnswer);
    setOpenAnswer("");
  }

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
          <button type="button" className="ghost-button" onClick={onExportCards}>Export CSV</button>
          <button type="button" className="accent-button" onClick={onStartFlashcardSession}>Start Session</button>
        </div>
      </div>

      <div className="feature-grid">
        <article className="panel">
          <h3>Create Set</h3>
          <form className="stack-form" onSubmit={onAddFlashcardSet}>
            <input value={newSetTitle} onChange={(event) => onSetNewSetTitle(event.target.value)} placeholder="Set name (e.g. Thermodynamics)" />
            <button type="submit" className="ghost-button"><Plus size={14} />Create Set</button>
          </form>
          <div className="list-block">
            {state.flashcards.sets.map((setEntry) => (
              <button
                key={setEntry.id}
                type="button"
                className={`list-item ${setEntry.id === state.flashcards.activeSetId ? "is-active" : ""}`}
                onClick={() => onSelectSet(setEntry.id)}
              >
                <strong>{setEntry.title}</strong>
                <span>{setEntry.cards.length} cards</span>
              </button>
            ))}
            {!state.flashcards.sets.length ? <p>No sets yet.</p> : null}
          </div>
        </article>

        <article className="panel">
          <h3>Add Card</h3>
          <form className="stack-form" onSubmit={onAddFlashcardCard}>
            <input value={newCardQuestion} onChange={(event) => onSetNewCardQuestion(event.target.value)} placeholder="Question" />
            <input value={newCardAnswer} onChange={(event) => onSetNewCardAnswer(event.target.value)} placeholder="Correct answer" />
            <input value={newCardChoices} onChange={(event) => onSetNewCardChoices(event.target.value)} placeholder="Other choices separated by |" />
            <button type="submit" className="ghost-button"><Plus size={14} />Add Card</button>
          </form>
          <p className="muted">Multiple choice is auto-enabled when you provide extra options.</p>
          {!activeSet ? <p className="muted">Choose a set first.</p> : null}
        </article>

        <article className="panel">
          <h3>Study Mode</h3>
          {currentCard ? (
            <div className="quiz-card">
              <strong>{currentCard.question}</strong>
              {cardType === "mcq" && (
                <div className="choice-grid">
                  {currentCard.choices.map((choice) => (
                    <button key={choice} type="button" className="ghost-button" onClick={() => onAnswerFlashcard(choice)} disabled={flashSession.reveal}>
                      {choice}
                    </button>
                  ))}
                </div>
              )}
              {cardType === "true-false" && (
                <div className="tf-buttons">
                  <button type="button" className="tf-btn tf-btn--true" onClick={() => onAnswerFlashcard("True")} disabled={flashSession.reveal}>✓ True</button>
                  <button type="button" className="tf-btn tf-btn--false" onClick={() => onAnswerFlashcard("False")} disabled={flashSession.reveal}>✗ False</button>
                </div>
              )}
              {cardType === "basic" && !flashSession.reveal && (
                <form className="open-answer-form" onSubmit={handleOpenSubmit}>
                  <input
                    value={openAnswer}
                    onChange={(event) => setOpenAnswer(event.target.value)}
                    className="open-answer-input"
                    placeholder="Type your answer"
                  />
                  <button type="submit" className="accent-button">Check</button>
                </form>
              )}
              {flashSession.reveal ? (
                <div className="result-banner result-banner--stack">
                  <span>Answer: {currentCard.answer}</span>
                  <div className="sm2-buttons">
                    <button type="button" className="ghost-button sm2-again" onClick={() => onRateFlashcard("again")}>Again</button>
                    <button type="button" className="ghost-button sm2-hard" onClick={() => onRateFlashcard("hard")}>Hard</button>
                    <button type="button" className="accent-button sm2-easy" onClick={() => onRateFlashcard("easy")}>Easy</button>
                    <button type="button" className="ghost-button" onClick={onNextFlashcard}>Skip</button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p>Select a set and start session.</p>
          )}
        </article>
      </div>
    </section>
  );
}

export default FlashcardsPage;
