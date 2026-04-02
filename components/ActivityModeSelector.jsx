import { useState } from "react";
import { MODES, BossBattleMode, TravellingMode, GatheringMode, FocusMode } from "../activityModes";

export default function ActivityModeSelector({ onSelectMode, currentMode, partyLevel }) {
  const modes = [BossBattleMode, TravellingMode, GatheringMode, FocusMode];

  return (
    <div className="activity-selector">
      <div className="selector-header">
        <h2>Choose Your Activity</h2>
        <p>Party Average Level: <span className="level-badge">{partyLevel}</span></p>
      </div>

      <div className="modes-grid">
        {modes.map((mode) => (
          <button
            key={mode.id}
            className={`mode-card ${currentMode === mode.id ? "active" : ""}`}
            onClick={() => onSelectMode(mode.id)}
          >
            <div className="mode-icon">{mode.icon}</div>
            <h3>{mode.name}</h3>
            <p className="mode-description">{mode.description}</p>

            <div className="mode-rewards">
              {mode.rewards.baseXp > 0 && (
                <span className="reward-item">
                  ⭐ {mode.rewards.baseXp} XP
                </span>
              )}
              {mode.rewards.baseGold > 0 && (
                <span className="reward-item">
                  💰 {mode.rewards.baseGold} Gold
                </span>
              )}
              {mode.rewards.storyProgression && (
                <span className="reward-item">
                  📖 Story +{mode.rewards.storyProgression}
                </span>
              )}
            </div>

            <div className="mode-mechanics">
              {mode.mechanics.hasHealth && (
                <span className="mechanic-badge">Combat</span>
              )}
              {mode.mechanics.hasDefend && (
                <span className="mechanic-badge">Defend</span>
              )}
              {mode.mechanics.hasHeal && (
                <span className="mechanic-badge">Heal</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <style jsx>{`
        .activity-selector {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .selector-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .selector-header h2 {
          margin: 0 0 10px 0;
          font-size: 1.8rem;
          color: #fff;
        }

        .selector-header p {
          margin: 0;
          color: #94a3b8;
        }

        .level-badge {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #000;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 700;
          margin-left: 5px;
        }

        .modes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 15px;
        }

        .mode-card {
          padding: 20px;
          border: 2px solid #475569;
          background: rgba(30, 30, 40, 0.8);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          color: inherit;
          font-family: inherit;
        }

        .mode-card:hover {
          transform: translateY(-4px);
          border-color: #3b82f6;
          background: rgba(30, 30, 40, 1);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
        }

        .mode-card.active {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }

        .mode-icon {
          font-size: 3rem;
          margin-bottom: 10px;
        }

        .mode-card h3 {
          margin: 10px 0 8px 0;
          font-size: 1.1rem;
          color: #fff;
        }

        .mode-description {
          margin: 0 0 15px 0;
          font-size: 0.85rem;
          color: #cbd5e1;
          min-height: 40px;
          line-height: 1.4;
        }

        .mode-rewards {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin: 12px 0;
          padding: 10px 0;
          border-top: 1px solid #475569;
          border-bottom: 1px solid #475569;
        }

        .reward-item {
          font-size: 0.8rem;
          color: #a0aec0;
        }

        .mode-mechanics {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          margin-top: 10px;
        }

        .mechanic-badge {
          display: inline-block;
          padding: 4px 8px;
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .modes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
