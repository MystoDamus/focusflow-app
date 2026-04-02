import {
  CheckCircle2,
  Plus,
  RefreshCcw,
  ScrollText,
  Skull,
  Sparkles,
  Swords,
  Volume2,
  VolumeX,
} from "lucide-react";

function QuestPanel({
  activeSubject,
  dayKey,
  event,
  rewardToast,
  newQuestTitle,
  newQuestDifficulty,
  newTemplateTitle,
  newTemplateType,
  newTemplateDifficulty,
  revisionQueue,
  ambientEnabled,
  ambientMode,
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
  battle,
  compactMode = false,
  showSecondary = false,
}) {
  return (
    <article className="panel quest-panel">
      {!compactMode ? (
        <div className="quest-gathering-scene">
          <div className="quest-gathering-icons" aria-hidden>
            <span>🌾</span>
            <span>🪵</span>
            <span>⛏️</span>
            <span>🧺</span>
          </div>
          <p>Daily quests now represent gathering supplies and preparation missions.</p>
        </div>
      ) : null}

      <div className="panel-heading">
        <div>
          <span className="eyebrow">Daily Quests</span>
          <h2>{compactMode ? "Today board" : "Adventure board"}</h2>
        </div>
        <div className="quest-stats">
          <span>{activeSubject.quests.filter((quest) => quest.completed).length}/{activeSubject.quests.length}</span>
          <ScrollText size={16} />
        </div>
      </div>

      {!compactMode ? (
        <div className="daily-reset-banner">
          <Sparkles size={16} />
          <span>{event.detail}</span>
        </div>
      ) : null}

      {rewardToast ? <div className="reward-toast">{rewardToast}</div> : null}

      <div className="quest-list">
        {activeSubject.quests.map((quest) => {
          const prerequisite = quest.requiresId
            ? activeSubject.quests.find((entry) => entry.id === quest.requiresId)
            : null;
          const locked = prerequisite ? !prerequisite.completed : false;

          return (
            <button
              key={quest.id}
              type="button"
              className={`quest-card ${quest.completed ? "is-looted" : ""} ${locked ? "is-locked" : ""}`}
              onClick={() => onCompleteQuest(quest.id)}
              disabled={quest.completed || locked}
            >
              <div className="quest-card__icon">
                {quest.completed ? <CheckCircle2 size={18} /> : quest.type === "boss" ? <Skull size={18} /> : <Swords size={18} />}
              </div>
              <div className="quest-card__body">
                <strong>{quest.title}</strong>
                <span>
                  {quest.type} / {quest.difficulty}
                  {locked ? " / chain locked" : ""}
                </span>
              </div>
              <span className="quest-card__tag">{quest.xpReward} XP</span>
            </button>
          );
        })}
      </div>

      <form className="quest-form" onSubmit={onAddCustomQuest}>
        <label>
          <span>Custom quest</span>
          <input
            type="text"
            value={newQuestTitle}
            onChange={(event) => onSetNewQuestTitle(event.target.value)}
            placeholder="Do one active recall sprint"
          />
        </label>
        <label>
          <span>Difficulty</span>
          <select value={newQuestDifficulty} onChange={(event) => onSetNewQuestDifficulty(event.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="boss">Boss</option>
          </select>
        </label>
        <button type="submit" className="accent-button">
          <Plus size={16} />
          Add
        </button>
      </form>

      <div className="quest-actions-row">
        <button type="button" className="ghost-button" onClick={onRegenerateQuests}>
          <RefreshCcw size={16} />
          Refresh board
        </button>
        <button type="button" className="ghost-button" onClick={onToggleAmbientAudio}>
          {ambientEnabled ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {ambientEnabled ? "Stop ambient" : `Play ${ambientMode}`}
        </button>
      </div>

      {showSecondary ? (
        <>
          <div className="revision-panel">
            <div className="history-panel__header">
              <span className="eyebrow">Revision Queue</span>
              <span>{revisionQueue.length} due</span>
            </div>
            <div className="history-list">
              {revisionQueue.slice(0, 4).map((card) => (
                <button key={card.id} type="button" className="history-item revision-item" onClick={() => onResolveRevision(card.id)}>
                  <div>
                    <strong>{card.title}</strong>
                    <span>{card.dueDay}</span>
                  </div>
                  <span>{getReviewUrgency(dayKey, card.dueDay)}</span>
                </button>
              ))}
              {!revisionQueue.length ? <p>No urgent review cards right now.</p> : null}
            </div>
          </div>

          <div className="template-panel">
            <div className="history-panel__header">
              <span className="eyebrow">Quest Forge</span>
              <span>{activeSubject.customTemplates.length} templates</span>
            </div>
            <form className="template-form" onSubmit={onAddTemplate}>
              <input
                type="text"
                value={newTemplateTitle}
                onChange={(event) => onSetNewTemplateTitle(event.target.value)}
                placeholder="Create reusable quest template"
              />
              <div className="template-controls">
                <select value={newTemplateType} onChange={(event) => onSetNewTemplateType(event.target.value)}>
                  <option value="review">Review</option>
                  <option value="practice">Practice</option>
                  <option value="explain">Explain</option>
                  <option value="boss">Boss</option>
                </select>
                <select value={newTemplateDifficulty} onChange={(event) => onSetNewTemplateDifficulty(event.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="boss">Boss</option>
                </select>
                <button type="submit" className="ghost-button">Forge</button>
              </div>
            </form>
          </div>
        </>
      ) : null}
    </article>
  );
}

export default QuestPanel;