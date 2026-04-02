import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarPage({ calendar, subjects, dayKey, onAddExam, onRemoveExam }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [examLabel, setExamLabel] = useState("");
  const [examSubject, setExamSubject] = useState("alchemy");

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const examDates = calendar?.examDates ?? [];

  function navMonth(delta) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  function getStudyCount(dateStr) {
    return Object.values(subjects).reduce((sum, subj) => {
      return sum + (subj.history ?? []).filter((h) => h.dayKey === dateStr).length;
    }, 0);
  }

  function handleAddExam(event) {
    event.preventDefault();
    if (!examLabel.trim() || !selectedDay) return;
    onAddExam({ date: selectedDay, label: examLabel.trim(), subject: examSubject });
    setExamLabel("");
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${monthStr}-${String(d).padStart(2, "0")}`);
  }

  const selectedExams = selectedDay ? examDates.filter((e) => e.date === selectedDay) : [];
  const selectedStudy = selectedDay
    ? Object.entries(subjects).flatMap(([key, subj]) =>
        (subj.history ?? [])
          .filter((h) => h.dayKey === selectedDay)
          .map((h) => ({ ...h, subjectKey: key, subjectName: subj.name }))
      )
    : [];

  const upcomingExams = [...examDates]
    .filter((e) => e.date >= dayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>Study Calendar</h2>
        <span className="muted">{upcomingExams.length} upcoming deadline{upcomingExams.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="calendar-layout">
        <article className="panel calendar-main">
          <div className="calendar-nav">
            <button type="button" className="ghost-button icon-btn" onClick={() => navMonth(-1)}>
              <ChevronLeft size={16} />
            </button>
            <strong>{MONTHS[viewMonth]} {viewYear}</strong>
            <button type="button" className="ghost-button icon-btn" onClick={() => navMonth(1)}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="cal-grid cal-header">
            {DAYS.map((d) => <span key={d} className="cal-dow">{d}</span>)}
          </div>

          <div className="cal-grid cal-days">
            {cells.map((dateStr, i) => {
              if (!dateStr) return <span key={`e-${i}`} className="cal-cell cal-cell--empty" />;
              const dayNum = parseInt(dateStr.split("-")[2], 10);
              const isToday = dateStr === dayKey;
              const isSelected = dateStr === selectedDay;
              const studyCount = getStudyCount(dateStr);
              const hasExam = examDates.some((e) => e.date === dateStr);
              return (
                <button
                  key={dateStr}
                  type="button"
                  className={`cal-cell ${isToday ? "cal-cell--today" : ""} ${isSelected ? "cal-cell--selected" : ""}`}
                  onClick={() => setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                >
                  <span className="cal-day-num">{dayNum}</span>
                  <div className="cal-day-dots">
                    {studyCount > 0 && <span className="cal-dot cal-dot--study" />}
                    {hasExam && <span className="cal-dot cal-dot--exam" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="cal-legend">
            <span><span className="cal-dot cal-dot--study" /> Study session</span>
            <span><span className="cal-dot cal-dot--exam" /> Exam / deadline</span>
          </div>
        </article>

        <div className="calendar-sidebar">
          {selectedDay ? (
            <article className="panel">
              <h3>{selectedDay}</h3>

              {selectedStudy.length > 0 && (
                <div className="cal-section">
                  <span className="eyebrow">Completed Activities</span>
                  {selectedStudy.map((entry) => (
                    <div key={entry.id} className="cal-entry">
                      <span className="cal-entry-subject">{entry.subjectName}</span>
                      <span>{entry.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedExams.length > 0 && (
                <div className="cal-section">
                  <span className="eyebrow">Exams &amp; Deadlines</span>
                  {selectedExams.map((exam, i) => (
                    <div key={i} className="cal-exam-item">
                      <span>{exam.label}</span>
                      <div className="cal-exam-right">
                        <span className="cal-exam-subject">{exam.subject}</span>
                        <button
                          type="button"
                          className="icon-btn muted"
                          onClick={() => onRemoveExam(exam.date, exam.label)}
                          title="Remove"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="cal-section">
                <span className="eyebrow">Add Deadline / Exam</span>
                <form className="stack-form" onSubmit={handleAddExam}>
                  <input
                    value={examLabel}
                    onChange={(e) => setExamLabel(e.target.value)}
                    placeholder="e.g. Midterm Exam"
                  />
                  <select value={examSubject} onChange={(e) => setExamSubject(e.target.value)}>
                    <option value="alchemy">Alchemy</option>
                    <option value="chronicles">Chronicles</option>
                    <option value="mechanics">Mechanics</option>
                  </select>
                  <button type="submit" className="ghost-button">
                    <Plus size={14} /> Add
                  </button>
                </form>
              </div>
            </article>
          ) : (
            <article className="panel">
              <h3>Schedule Guide</h3>
              <ul className="cal-guide-list">
                <li>Click any day to view sessions and add exam dates</li>
                <li>Green dots show completed study quests</li>
                <li>Orange dots mark exams and deadlines</li>
                <li>Today is highlighted with a gold border</li>
              </ul>
              {upcomingExams.length > 0 && (
                <div className="cal-section" style={{ marginTop: "16px" }}>
                  <span className="eyebrow">Upcoming Exams</span>
                  {upcomingExams.map((exam, i) => (
                    <div key={i} className="cal-exam-item">
                      <div>
                        <strong>{exam.label}</strong>
                        <span className="muted" style={{ marginLeft: "6px" }}>{exam.subject}</span>
                      </div>
                      <span className="muted">{exam.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

export default CalendarPage;
