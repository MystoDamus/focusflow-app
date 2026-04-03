import { useEffect, useMemo, useRef, useState } from "react";
import CalendarPage from "./CalendarPage";
import CompanionPanel from "./CompanionPanel";
import HeroPanel from "./HeroPanel";
import LeaderboardPage from "./LeaderboardPage";
import ManaBar from "./ManaBar";
import MissionsPanel from "./MissionsPanel";
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
  onDeleteQuest,
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
  onMaximizeTimer,
  onSetCustomTimer,
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
  onDeleteReflection,
  onApplyPrestige,
  battle,
  partyRoster,
  leaderboardPreview,
  examDates,
  notesItems,
  onOpenFlashcards,
  onOpenQuiz,
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
  plannerCompletion,
  plannerDraft,
  onSetPlannerDraft,
  onAddPlannerMission,
  onToggleMissionStatus,
  onDeletePlannerMission,
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
  const weakTopicRows = useMemo(() => {
    const flashTopics = Object.entries(state.flashcards?.weakStats?.byTopic ?? {}).map(([topic, count]) => ({
      topic,
      count,
      source: "Flashcards",
    }));
    const quizTopics = Object.entries(state.quiz?.weakStats?.byTopic ?? {}).map(([topic, count]) => ({
      topic,
      count,
      source: "Quiz",
    }));

    return [...flashTopics, ...quizTopics]
      .sort((left, right) => right.count - left.count)
      .slice(0, 4);
  }, [state.flashcards?.weakStats?.byTopic, state.quiz?.weakStats?.byTopic]);
  const weakTypeRows = useMemo(() => {
    const merged = {};
    for (const [type, count] of Object.entries(state.flashcards?.weakStats?.byType ?? {})) {
      merged[type] = (merged[type] ?? 0) + count;
    }
    for (const [type, count] of Object.entries(state.quiz?.weakStats?.byType ?? {})) {
      merged[type] = (merged[type] ?? 0) + count;
    }
    return Object.entries(merged).sort((left, right) => right[1] - left[1]).slice(0, 3);
  }, [state.flashcards?.weakStats?.byType, state.quiz?.weakStats?.byType]);

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
            onDeleteQuest={onDeleteQuest}
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
            onMaximizeTimer={onMaximizeTimer}
            onSetCustomTimer={onSetCustomTimer}
          />

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
            onDeleteReflection={onDeleteReflection}
            onApplyPrestige={onApplyPrestige}
            compactMode={todayMode}
            showSecondary={showSecondary}
          />
        </div>
      </div>

      <div className="dashboard-utilities">
        <article className="utility-card" onClick={() => setMaximizedWidget("calendar")}>
          <h4>📅 Calendar</h4>
          <p>{examDates?.length || 0} exams scheduled</p>
        </article>
        <article className="utility-card" onClick={() => setMaximizedWidget("notes")}>
          <h4>📝 Notes</h4>
          <p>{notesItems?.length || 0} notes saved</p>
        </article>
        <article className="utility-card" onClick={() => setMaximizedWidget("leaderboard")}>
          <h4>🏆 Leaderboard</h4>
          <p>View rankings</p>
        </article>
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
              <button type="button" className="ghost-button" onClick={() => setMaximizedWidget(null)}>
                Close
              </button>
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
