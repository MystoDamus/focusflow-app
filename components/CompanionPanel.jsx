import { BookOpen, Settings, Target, Trophy, Users, Volume2, VolumeX } from "lucide-react";

function CompanionPanel({
  activeSubject,
  petCelebrating,
  showSettings,
  settings,
  currentTheme,
  prestigeThemeChoices,
  rewardToast,
  importFileRef,
  journalPreview,
  journalPrompt,
  reflectionText,
  prestigeEligible,
  streak,
  guild,
  onToggleSound,
  onToggleSettings,
  onUpdateSetting,
  onToggleNotifications,
  onToggleAmbientAudio,
  onChangeTheme,
  onExportBackup,
  onImportBackup,
  onSetReflectionText,
  onAddReflection,
  onDeleteReflection,
  onApplyPrestige,
  compactMode = false,
  showSecondary = false,
}) {
  return (
    <article className="panel companion-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Companion</span>
          <h2>Campaign systems</h2>
        </div>
        <div className="companion-controls">
          <button type="button" className="icon-toggle" onClick={onToggleSound}>
            {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button type="button" className="icon-toggle" onClick={onToggleSettings}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className={`pet-card ${petCelebrating ? "is-bouncing" : ""}`}>
        <div className="pet-card__avatar" role="img" aria-label="Pet companion">
          {activeSubject.progress.petSkin === "crystal" ? "💠" : activeSubject.pet}
        </div>
        <div className="pet-card__copy">
          <strong>{activeSubject.name} Familiar</strong>
          {!compactMode ? <p>Reflects the active subject loadout and celebrates every quest you loot.</p> : null}
        </div>
      </div>

      {showSettings ? (
        <div className="settings-drawer">
          <label className="checkbox-row">
            <input type="checkbox" checked={settings.reducedMotion} onChange={(event) => onUpdateSetting("reducedMotion", event.target.checked)} />
            <span>Reduced motion</span>
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={settings.highContrast} onChange={(event) => onUpdateSetting("highContrast", event.target.checked)} />
            <span>High contrast</span>
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={settings.largeText} onChange={(event) => onUpdateSetting("largeText", event.target.checked)} />
            <span>Large text</span>
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={settings.notificationsEnabled} onChange={(event) => void onToggleNotifications(event.target.checked)} />
            <span>Desktop notifications</span>
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={settings.ambientEnabled} onChange={onToggleAmbientAudio} />
            <span>Ambient audio playback</span>
          </label>
          <label>
            <span>Ambient mode</span>
            <select value={settings.ambientMode} onChange={(event) => onUpdateSetting("ambientMode", event.target.value)}>
              <option value="library">Library hush</option>
              <option value="rain">Rain chamber</option>
              <option value="campfire">Campfire</option>
              <option value="dungeon">Dungeon hum</option>
            </select>
          </label>
          <label>
            <span>Theme unlocks</span>
            <select value={currentTheme} onChange={(event) => onChangeTheme(event.target.value)}>
              {prestigeThemeChoices.map((theme) => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </label>
          <div className="quest-actions-row">
            <button type="button" className="ghost-button" onClick={onExportBackup}>
              Export backup
            </button>
            <button type="button" className="ghost-button" onClick={() => importFileRef.current?.click()}>
              Import backup
            </button>
            <input ref={importFileRef} type="file" accept="application/json" hidden onChange={onImportBackup} />
          </div>
        </div>
      ) : null}

      <div className="journal-card">
        <div className="badge-header">
          <span className="eyebrow">Reflection Journal</span>
          <span>{journalPreview.length} recent</span>
        </div>
        <form className="journal-form" onSubmit={onAddReflection}>
          <textarea value={reflectionText} onChange={(event) => onSetReflectionText(event.target.value)} placeholder={journalPrompt} />
          <button type="submit" className="accent-button">Save note</button>
        </form>
        <div className="journal-list">
          {journalPreview.map((entry) => (
            <div key={entry.id} className="journal-item">
              <div className="journal-item__body">
                <strong>{entry.title}</strong>
                <span>{entry.note}</span>
              </div>
              <button
                type="button"
                className="journal-item__delete"
                onClick={() => onDeleteReflection(entry.id)}
                title="Delete entry"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {showSecondary ? (
      <div className="streak-card">
        <div>
          <span className="eyebrow">Prestige</span>
          <strong>{activeSubject.progress.prestigeRank} rebirths</strong>
          <p>Prestige at level 10 to reset the loadout and toughen future bosses.</p>
        </div>
        <div className="streak-card__totals">
          <div>
            <span>Eligible</span>
            <strong>{prestigeEligible ? "Yes" : "No"}</strong>
          </div>
          <div>
            <span>Guild tokens</span>
            <strong>{guild.revivalTokens}</strong>
          </div>
        </div>
      </div>
      ) : null}

      {showSecondary ? (
      <div className="heatmap-card">
        <div className="heatmap-card__header">
          <span className="eyebrow">Streak Calendar</span>
          <span>{streak.current} day run</span>
        </div>
        <div className="streak-display">
          <span className="streak-flame">🔥</span>
          <strong className="streak-count">{streak.current}</strong>
          <span className="muted">Best {streak.longest}</span>
        </div>
      </div>
      ) : null}

      <button type="button" className="ghost-button prestige-button" onClick={onApplyPrestige} disabled={!prestigeEligible}>
        <Trophy size={16} />
        Prestige Subject
      </button>

      {!compactMode && showSecondary ? (
      <div className="companion-notes">
        <div>
          <BookOpen size={16} />
          <span>Each completed quest feeds a spaced revision queue.</span>
        </div>
        <div>
          <Users size={16} />
          <span>Party goals create a local accountability board for the week.</span>
        </div>
        <div>
          <Target size={16} />
          <span>Semester goals track session progress toward your exam campaign.</span>
        </div>
      </div>
      ) : null}
    </article>
  );
}

export default CompanionPanel;