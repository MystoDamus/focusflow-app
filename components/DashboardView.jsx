import CompanionPanel from "./CompanionPanel";
import HeroPanel from "./HeroPanel";
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
}) {
  const upcomingExams = [...examDates]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
  const recentNotes = [...notesItems].slice(0, 3);

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
          />

          <section className="panel dashboard-utility-grid" data-tutorial="study-hub">
            <article className="dashboard-utility-card" data-tutorial="leaderboard-card">
              <div className="dashboard-utility-head">
                <h3>Leaderboard Snapshot</h3>
                <span>Top 5</span>
              </div>
              <div className="dashboard-utility-list">
                {leaderboardPreview.slice(0, 5).map((entry, index) => (
                  <div key={`${entry.userId}-${index}`} className="dashboard-row">
                    <span>#{index + 1} {entry.displayName}</span>
                    <strong>{entry.score}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-utility-card" data-tutorial="calendar-card">
              <div className="dashboard-utility-head">
                <h3>Upcoming Exams</h3>
                <span>{upcomingExams.length}</span>
              </div>
              <div className="dashboard-utility-list">
                {upcomingExams.length ? upcomingExams.map((exam, index) => (
                  <div key={`${exam.date}-${exam.label}-${index}`} className="dashboard-row">
                    <span>{exam.label}</span>
                    <strong>{exam.date}</strong>
                  </div>
                )) : <p className="muted">No exam dates yet.</p>}
              </div>
            </article>

            <article className="dashboard-utility-card" data-tutorial="notes-card">
              <div className="dashboard-utility-head">
                <h3>Recent Notes</h3>
                <span>{notesItems.length}</span>
              </div>
              <div className="dashboard-utility-list">
                {recentNotes.length ? recentNotes.map((note) => (
                  <div key={note.id} className="dashboard-row dashboard-row--stacked">
                    <strong>{note.title}</strong>
                    <span>{note.content?.slice(0, 72) || "No content"}</span>
                  </div>
                )) : <p className="muted">No notes captured yet.</p>}
              </div>
            </article>
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
            <p className="muted">Focus everything through these core actions.</p>
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
          />
        </div>
      </div>
    </>
  );
}

export default DashboardView;
