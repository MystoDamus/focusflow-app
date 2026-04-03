import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const PASS_THRESHOLD = 0.7; // 70% to pass

function PracticeTestPage({ flashcardSets, dayKey }) {
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [testSession, setTestSession] = useState(null); // { questions, index, answers, startTime, timeLeft }
  const [openAnswer, setOpenAnswer] = useState("");
  const [result, setResult] = useState(null); // { score, total, wrong }

  const selectedSet = flashcardSets.find((s) => s.id === selectedSetId) ?? null;

  function startTest() {
    if (!selectedSet || selectedSet.cards.length < 2) return;
    const questions = [...selectedSet.cards]
      .sort(() => Math.random() - 0.5)
      .map((card) => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
        type: card.type ?? "basic",
        choices: card.choices ?? [],
      }));

    setTestSession({
      questions,
      index: 0,
      answers: [],
      timeLeft: timerMinutes * 60,
    });
    setResult(null);
  }

  function submitAnswer(answer) {
    if (!testSession) return;
    const q = testSession.questions[testSession.index];
    const correct = answer.trim().toLowerCase() === q.answer.trim().toLowerCase();
    const newAnswers = [...testSession.answers, { questionId: q.id, question: q.question, correct, given: answer, correct_answer: q.answer }];
    const nextIndex = testSession.index + 1;

    if (nextIndex >= testSession.questions.length) {
      const score = newAnswers.filter((a) => a.correct).length;
      setResult({ score, total: testSession.questions.length, answers: newAnswers });
      setTestSession(null);
    } else {
      setTestSession((prev) => ({ ...prev, index: nextIndex, answers: newAnswers }));
    }
    setOpenAnswer("");
  }

  function handleOpenSubmit(e) {
    e.preventDefault();
    if (!openAnswer.trim()) return;
    submitAnswer(openAnswer);
  }

  if (result) {
    const pct = Math.round((result.score / result.total) * 100);
    const passed = pct >= PASS_THRESHOLD * 100;
    return (
      <section className="feature-page">
        <div className="feature-header">
          <h2>Practice Test Results</h2>
          <button type="button" className="accent-button" onClick={() => { setResult(null); }}>New Test</button>
        </div>
        <div className="feature-grid">
          <article className="panel">
            <div className={`test-result-badge ${passed ? "test-result-badge--pass" : "test-result-badge--fail"}`}>
              {passed ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
              <div>
                <strong>{pct}%</strong>
                <span>{passed ? "PASSED" : "NOT YET"}</span>
              </div>
            </div>
            <div className="stat-grid" style={{ marginTop: 12 }}>
              <div><span>Correct</span><strong>{result.score}/{result.total}</strong></div>
              <div><span>Pass mark</span><strong>{Math.round(PASS_THRESHOLD * 100)}%</strong></div>
            </div>
          </article>
          <article className="panel">
            <h3>Question Review</h3>
            <div className="wrong-review-list">
              {result.answers.map((a, i) => (
                <div key={i} className={`wrong-review-item ${a.correct ? "wrong-review-item--correct" : ""}`}>
                  <p className="wrong-review-q">{i + 1}. {a.question}</p>
                  {!a.correct && (
                    <>
                      <p className="wrong-review-a" style={{ color: "rgba(255,80,80,0.9)" }}>✗ You: {a.given || "(skipped)"}</p>
                      <p className="wrong-review-a">✓ {a.correct_answer}</p>
                    </>
                  )}
                  {a.correct && <p className="wrong-review-a">✓ Correct</p>}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    );
  }

  if (testSession) {
    const q = testSession.questions[testSession.index];
    const qType = q.type ?? "basic";
    return (
      <section className="feature-page">
        <div className="feature-header">
          <h2>Practice Test</h2>
          <span className="pill-inline">{testSession.index + 1} / {testSession.questions.length}</span>
        </div>
        <div className="feature-grid">
          <article className="panel" style={{ gridColumn: "1 / -1" }}>
            <p className="muted">No XP rewards — pure practice mode.</p>
            <div className="fc-flashcard-wrapper">
              <div className="fc-flashcard" style={{ cursor: "default" }}>
                <div className="fc-flashcard__front" style={{ transform: "none", backfaceVisibility: "visible" }}>
                  <p className="fc-question">{q.question}</p>
                </div>
              </div>

              {qType === "mcq" && (
                <div className="choice-grid">
                  {q.choices.map((choice) => (
                    <button key={choice} type="button" className="ghost-button" onClick={() => submitAnswer(choice)}>{choice}</button>
                  ))}
                </div>
              )}
              {qType === "true-false" && (
                <div className="tf-buttons">
                  <button type="button" className="tf-btn tf-btn--true" onClick={() => submitAnswer("True")}>✓ True</button>
                  <button type="button" className="tf-btn tf-btn--false" onClick={() => submitAnswer("False")}>✗ False</button>
                </div>
              )}
              {qType === "basic" && (
                <form className="open-answer-form" onSubmit={handleOpenSubmit}>
                  <input value={openAnswer} onChange={(e) => setOpenAnswer(e.target.value)} className="open-answer-input" placeholder="Type your answer" autoFocus />
                  <button type="submit" className="accent-button">Submit</button>
                  <button type="button" className="ghost-button" onClick={() => submitAnswer("")}>Skip</button>
                </form>
              )}
            </div>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>🧪 Practice Test</h2>
      </div>
      <div className="feature-grid">
        <article className="panel">
          <h3>Setup</h3>
          <p className="muted">Take a timed exam with your flashcards. No XP awarded — just your score.</p>
          <div className="stack-form">
            <label>
              <span>Flashcard Set</span>
              <select value={selectedSetId ?? ""} onChange={(e) => setSelectedSetId(e.target.value)}>
                <option value="">— select a set —</option>
                {flashcardSets.map((s) => (
                  <option key={s.id} value={s.id}>{s.title} ({s.cards.length} cards)</option>
                ))}
              </select>
            </label>
            <label>
              <span>Time Limit (minutes)</span>
              <input type="number" min={1} max={120} value={timerMinutes} onChange={(e) => setTimerMinutes(Number(e.target.value))} />
            </label>
            <button
              type="button"
              className="accent-button"
              disabled={!selectedSet || selectedSet.cards.length < 2}
              onClick={startTest}
            >
              Start Test ({selectedSet?.cards.length ?? 0} questions)
            </button>
          </div>
          {selectedSet && (
            <div className="fc-stats-grid" style={{ marginTop: 12 }}>
              <div className="stat-card"><span>Cards</span><strong>{selectedSet.cards.length}</strong></div>
              <div className="stat-card"><span>Pass mark</span><strong>70%</strong></div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default PracticeTestPage;
