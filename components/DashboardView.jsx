import { useEffect, useMemo, useRef, useState } from "react";
import CalendarPage from "./CalendarPage";
import CompanionPanel from "./CompanionPanel";
import HeroPanel from "./HeroPanel";
import LeaderboardPage from "./LeaderboardPage";
import NotesPage from "./NotesPage";
import QuestPanel from "./QuestPanel";
import TimerPanel from "./TimerPanel";

function DashboardView({
  subjectPresets,
  state,
  activeSubject,
  levelFlash,
  onSwitchSubject,
  rewardToast,
  newQuestTitle,
  newQuestDifficulty,
  newTemplateTitle,
  newTemplateType,
  newTemplateDifficulty,
  revisionQueue,
  onCompleteQuest,
  onSetNewQuestTitle,
  onSetNewQuestDifficulty,
  onAddCustomQuest,
  onRegenerateQuests,
  onToggleAmbientAudio,
  onResolveRevision,
  getReviewUrgency,
  onSetNewTemplateTitle,
  onSetNewTemplateType,
  onSetNewTemplateDifficulty,
  onAddTemplate,
  manaPercent,
  partyContribution,
  partyPercent,
  goalPercent,
  goalLabel,
  goalSessions,
  formatTime,
  onToggleTimer,
  onResetTimer,
  onSaveGoal,
  onSetGoalLabel,
  onSetGoalSessions,
  semesterDeadline,
  onSetTimerPreset,
  petCelebrating,
  showSettings,
  currentTheme,
  prestigeThemeChoices,
  importFileRef,
  journalPreview,
  journalPrompt,
  reflectionText,
  prestigeEligible,
  streak,
  noteText,
  dailyQuote,
  dailyTip,
  onToggleSound,
  onToggleSettings,
  onUpdateSetting,
  onToggleNotifications,
  onChangeTheme,
  onExportBackup,
  onImportBackup,
  onSetReflectionText,
  onAddReflection,
  onUpdateNote,
  shopItems,
  onBuyShopItem,
  onApplyPrestige,
  battle,
  partyRoster,
  leaderboardPreview,
  examDates,
  notesItems,
  onOpenFlashcards,
  onOpenQuiz,
  onOpenPlanner,
  userProfile,
  leaderboardData,
  calendar,
  subjects,
  dayKey,
  onAddExam,
  onRemoveExam,
  notesData,
  activeSubjectKey,
  onAddNote,
  onDeleteNote,
  onUpdateNoteItem,
  onTogglePin,
  onToggleTag,
}) {
  const [hiddenWidgets, setHiddenWidgets] = useState([]);
  const [maximizedWidget, setMaximizedWidget] = useState(null);
  const [todayMode, setTodayMode] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);

  // Modal position and size (draggable/resizable)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [modalSize, setModalSize] = useState({ width: 1000, height: 600 });
  const [isModalDragging, setIsModalDragging] = useState(false);
  const [isModalResizing, setIsModalResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);

  // Center modal when it opens
  useEffect(() => {
    if (maximizedWidget) {
      const centerX = (window.innerWidth - modalSize.width) / 2;
      const centerY = (window.innerHeight - modalSize.height) / 2;
      setModalPosition({ x: Math.max(0, centerX), y: Math.max(0, centerY) });
    }
  }, [maximizedWidget]);

  const upcomingExams = [...examDates]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
  const recentNotes = [...notesItems].slice(0, 3);
  const visibleWidgets = useMemo(
    () => ["leaderboard", "calendar", "notes"].filter((id) => !hiddenWidgets.includes(id)),
    [hiddenWidgets],
  );

  function hideWidget(id) {
    setHiddenWidgets((current) => (current.includes(id) ? current : [...current, id]));
    if (maximizedWidget === id) {
      setMaximizedWidget(null);
    }
  }

  function showAllWidgets() {
    setHiddenWidgets([]);
  }

  function handleModalMouseDown(e) {
    if (e.target.closest("button")) return; // Don't drag when clicking buttons
    const rect = modalRef.current.getBoundingClientRect();
    setIsModalDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  function handleResizeMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsModalResizing(true);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ ...modalSize });
  }

  useEffect(() => {
    if (!isModalDragging && !isModalResizing) return;

    function handleMouseMove(e) {
      if (isModalDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        const maxX = window.innerWidth - modalSize.width;
        const maxY = window.innerHeight - modalSize.height;

        setModalPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }

      if (isModalResizing) {
        const deltaX = e.clientX - resizeStartPos.x;
        const deltaY = e.clientY - resizeStartPos.y;
        const newWidth = Math.max(400, resizeStartSize.width + deltaX);
        const newHeight = Math.max(300, resizeStartSize.height + deltaY);

        // Prevent modal from exceeding viewport
        const maxWidth = window.innerWidth - modalPosition.x - 18;
        const maxHeight = window.innerHeight - modalPosition.y - 18;

        setModalSize({
          width: Math.min(newWidth, maxWidth),
          height: Math.min(newHeight, maxHeight),
        });
      }
    }

    function handleMouseUp() {
      setIsModalDragging(false);
      setIsModalResizing(false);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isModalDragging, isModalResizing, dragOffset, resizeStartPos, resizeStartSize, modalSize, modalPosition]);

  function widgetHeader(title, meta, id) {
    return (
      <div className="dashboard-utility-head">
        <h3>{title}</h3>
        <div className="dashboard-widget-controls">
          <span>{meta}</span>
          <button type="button" className="ghost-button icon-btn" onClick={() => setMaximizedWidget(id)} title="Maximize">
            ⛶
          </button>
          <button type="button" className="ghost-button icon-btn" onClick={() => hideWidget(id)} title="Close">
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroPanel
        subjectPresets={subjectPresets}
        subjects={state.subjects}
        activeSubjectKey={state.activeSubject}
        activeSubject={activeSubject}
        event={state.event}
        guild={state.guild}
        levelFlash={levelFlash}
        dailyQuote={dailyQuote}
        onSwitchSubject={onSwitchSubject}
      />

      <div className="dashboard-layout">
        {/* Main column: quests */}
        <div className="dashboard-main" data-tutorial="quest-board">
          <QuestPanel
            activeSubject={activeSubject}
            dayKey={state.dayKey}
            event={state.event}
            rewardToast={rewardToast}
            newQuestTitle={newQuestTitle}
            newQuestDifficulty={newQuestDifficulty}
            newTemplateTitle={newTemplateTitle}
            newTemplateType={newTemplateType}
            newTemplateDifficulty={newTemplateDifficulty}
            revisionQueue={revisionQueue}
            ambientEnabled={state.settings.ambientEnabled}
            ambientMode={state.settings.ambientMode}
            onCompleteQuest={onCompleteQuest}
            onSetNewQuestTitle={onSetNewQuestTitle}
            onSetNewQuestDifficulty={onSetNewQuestDifficulty}
            onAddCustomQuest={onAddCustomQuest}
            onRegenerateQuests={onRegenerateQuests}
            onToggleAmbientAudio={onToggleAmbientAudio}
            onResolveRevision={onResolveRevision}
            getReviewUrgency={getReviewUrgency}
            onSetNewTemplateTitle={onSetNewTemplateTitle}
            battle={battle}
            party={partyRoster}
            profile={state.profile}
            onSetNewTemplateType={onSetNewTemplateType}
            onSetNewTemplateDifficulty={onSetNewTemplateDifficulty}
            onAddTemplate={onAddTemplate}
            compactMode={todayMode}
            showSecondary={showSecondary}
          />

          <section className="panel dashboard-utility-grid" data-tutorial="study-hub">
            <div className="dashboard-utility-topbar">
              <h3>Study Hub Widgets</h3>
              <div className="dashboard-action-row dashboard-action-row--inline">
                <button type="button" className={`ghost-button ${todayMode ? "is-active" : ""}`} onClick={() => setTodayMode((value) => !value)}>
                  {todayMode ? "Exit Today Mode" : "Today Mode"}
                </button>
                <button type="button" className={`ghost-button ${showSecondary ? "is-active" : ""}`} onClick={() => setShowSecondary((value) => !value)}>
                  {showSecondary ? "Hide Secondary" : "Show Secondary"}
                </button>
                <button type="button" className="ghost-button" onClick={showAllWidgets}>
                  Restore Widgets
                </button>
              </div>
            </div>

            {visibleWidgets.includes("leaderboard") ? (
              <article className="dashboard-utility-card dashboard-utility-card--large" data-tutorial="leaderboard-card">
                {widgetHeader("Leaderboard Snapshot", "Top 5", "leaderboard")}
                <div className="dashboard-utility-list">
                  {leaderboardPreview.slice(0, 5).map((entry, index) => (
                    <div key={`${entry.userId}-${index}`} className="dashboard-row">
                      <span>#{index + 1} {entry.displayName}</span>
                      <strong>{entry.score}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            {visibleWidgets.includes("calendar") ? (
              <article className="dashboard-utility-card dashboard-utility-card--large" data-tutorial="calendar-card">
                {widgetHeader("Upcoming Exams", String(upcomingExams.length), "calendar")}
                <div className="dashboard-utility-list">
                  {upcomingExams.length ? upcomingExams.map((exam, index) => (
                    <div key={`${exam.date}-${exam.label}-${index}`} className="dashboard-row">
                      <span>{exam.label}</span>
                      <strong>{exam.date}</strong>
                    </div>
                  )) : <p className="muted">No exam dates yet.</p>}
                </div>
              </article>
            ) : null}

            {visibleWidgets.includes("notes") ? (
              <article className="dashboard-utility-card dashboard-utility-card--large" data-tutorial="notes-card">
                {widgetHeader("Recent Notes", String(notesItems.length), "notes")}
                <div className="dashboard-utility-list">
                  {recentNotes.length ? recentNotes.map((note) => (
                    <div key={note.id} className="dashboard-row dashboard-row--stacked">
                      <strong>{note.title}</strong>
                      <span>{(note.body ?? note.content ?? "").slice(0, 112) || "No content"}</span>
                    </div>
                  )) : <p className="muted">No notes captured yet.</p>}
                </div>
              </article>
            ) : null}

            {!visibleWidgets.length ? (
              <article className="dashboard-utility-card">
                <p className="muted">All widgets are hidden. Use Restore Widgets to bring them back.</p>
              </article>
            ) : null}
          </section>
        </div>

        {/* Side column: timer + companion */}
        <div className="dashboard-side" data-tutorial="focus-panel">
          <TimerPanel
            timer={state.timer}
            manaPercent={manaPercent}
            activeSubject={activeSubject}
            party={state.party}
            partyContribution={partyContribution}
            partyPercent={partyPercent}
            goalPercent={goalPercent}
            goalLabel={goalLabel}
            goalSessions={goalSessions}
            formatTime={formatTime}
            onToggleTimer={onToggleTimer}
            onResetTimer={onResetTimer}
            onSaveGoal={onSaveGoal}
            onSetGoalLabel={onSetGoalLabel}
            onSetGoalSessions={onSetGoalSessions}
            semesterDeadline={semesterDeadline}
            onSetTimerPreset={onSetTimerPreset}
          />

          <section className="panel dashboard-quick-actions" data-tutorial="quick-actions">
            <h3>Study Flow</h3>
            <p className="muted">Use these three primary actions for your daily cycle.</p>
            <div className="dashboard-action-row">
              <button type="button" className="ghost-button" onClick={onOpenPlanner}>To-Do Planner</button>
              <button type="button" className="ghost-button" onClick={onOpenFlashcards}>Travel Drill (Flashcards)</button>
              <button type="button" className="ghost-button" onClick={onOpenQuiz}>Boss Quiz Battle</button>
            </div>
          </section>

          <CompanionPanel
            activeSubject={activeSubject}
            petCelebrating={petCelebrating}
            showSettings={showSettings}
            settings={state.settings}
            currentTheme={currentTheme}
            prestigeThemeChoices={prestigeThemeChoices}
            importFileRef={importFileRef}
            journalPreview={journalPreview}
            journalPrompt={journalPrompt}
            reflectionText={reflectionText}
            prestigeEligible={prestigeEligible}
            streak={streak}
            noteText={noteText}
            guild={state.guild}
            onToggleSound={onToggleSound}
            onToggleSettings={onToggleSettings}
            onUpdateSetting={onUpdateSetting}
            onToggleNotifications={onToggleNotifications}
            onToggleAmbientAudio={onToggleAmbientAudio}
            onChangeTheme={onChangeTheme}
            onExportBackup={onExportBackup}
            onImportBackup={onImportBackup}
            onSetReflectionText={onSetReflectionText}
            onAddReflection={onAddReflection}
            onUpdateNote={onUpdateNote}
            shopItems={shopItems}
            onBuyShopItem={onBuyShopItem}
            onApplyPrestige={onApplyPrestige}
            compactMode={todayMode}
            showSecondary={showSecondary}
          />
        </div>
      </div>

      {maximizedWidget ? (
        <div className="dashboard-modal-overlay" role="dialog" aria-modal="true">
          <div
            ref={modalRef}
            className={`dashboard-modal ${isModalDragging ? "is-dragging" : ""} ${isModalResizing ? "is-resizing" : ""}`}
            style={{
              left: `${modalPosition.x}px`,
              top: `${modalPosition.y}px`,
              width: `${modalSize.width}px`,
              height: `${modalSize.height}px`,
            }}
          >
            <div className="dashboard-modal__top" onMouseDown={handleModalMouseDown}>
              <h3>
                {maximizedWidget === "leaderboard" ? "Leaderboard" : maximizedWidget === "calendar" ? "Calendar" : "Notes"}
              </h3>
            </div>
            <div className="dashboard-modal__content">
              {maximizedWidget === "leaderboard" ? (
                <LeaderboardPage userProfile={userProfile} allLeaderboardData={leaderboardData} />
              ) : null}
              {maximizedWidget === "calendar" ? (
                <CalendarPage
                  calendar={calendar}
                  subjects={subjects}
                  dayKey={dayKey}
                  onAddExam={onAddExam}
                  onRemoveExam={onRemoveExam}
                />
              ) : null}
              {maximizedWidget === "notes" ? (
                <NotesPage
                  notesData={notesData}
                  activeSubjectKey={activeSubjectKey}
                  onAddNote={onAddNote}
                  onDeleteNote={onDeleteNote}
                  onUpdateNote={onUpdateNoteItem}
                  onTogglePin={onTogglePin}
                  onToggleTag={onToggleTag}
                />
              ) : null}
            </div>
            <div className="dashboard-modal__resize-handle" onMouseDown={handleResizeMouseDown} title="Drag to resize"></div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default DashboardView;
