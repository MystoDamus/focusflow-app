import { useState } from "react";
import { getLeaderboardByType, formatRank, getRankBadge, LEADERBOARD_TYPES } from "../leaderboardSystem";

export default function LeaderboardPage({ userProfile, allLeaderboardData }) {
  const [selectedTab, setSelectedTab] = useState(LEADERBOARD_TYPES.GLOBAL);
  const [selectedMode, setSelectedMode] = useState("bossBattle");

  const leaderboardTabs = [
    { id: LEADERBOARD_TYPES.GLOBAL, name: "Global", icon: "🌍" },
    { id: LEADERBOARD_TYPES.MODE_SPECIFIC, name: "By Mode", icon: "⚔️" },
    { id: LEADERBOARD_TYPES.WEEKLY, name: "This Week", icon: "📅" },
  ];

  const modes = [
    { id: "bossBattle", name: "Boss Battle" },
    { id: "travelling", name: "Travelling" },
    { id: "gathering", name: "Gathering" },
    { id: "focus", name: "Focus Ritual" },
  ];

  const leaderboard = getLeaderboardByType(
    selectedTab,
    userProfile?.userId,
    allLeaderboardData,
    userProfile?.leaderboardStats?.friends || [],
    selectedMode
  );

  const userRank = leaderboard.find((e) => e.userId === userProfile?.userId);

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboards</h1>
        {userRank && (
          <div className="user-rank-banner">
            <span className="rank-text">Your Global Rank:</span>
            <span className="rank-display">{formatRank(userRank.rank)}</span>
            <span className="rank-score">{userRank.score} points</span>
          </div>
        )}
      </div>

      <div className="leaderboard-tabs">
        {leaderboardTabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${selectedTab === tab.id ? "active" : ""}`}
            onClick={() => setSelectedTab(tab.id)}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {selectedTab === LEADERBOARD_TYPES.MODE_SPECIFIC && (
        <div className="mode-selector">
          {modes.map((mode) => (
            <button
              key={mode.id}
              className={`mode-btn ${selectedMode === mode.id ? "active" : ""}`}
              onClick={() => setSelectedMode(mode.id)}
            >
              {mode.name}
            </button>
          ))}
        </div>
      )}

      <div className="leaderboard-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th className="rank-col">Rank</th>
              <th className="name-col">Player</th>
              <th className="level-col">Level</th>
              <th className="score-col">Score</th>
              <th className="stats-col">Quizzes</th>
              <th className="stats-col">Bosses</th>
              <th className="streak-col">Streak</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.slice(0, 100).map((entry, idx) => {
              const badge = getRankBadge(entry.rank, leaderboard.length);
              const isCurrentUser = entry.userId === userProfile?.userId;

              return (
                <tr
                  key={entry.userId}
                  className={`leaderboard-row ${isCurrentUser ? "current-user" : ""}`}
                >
                  <td className="rank-col">
                    <div className="rank-cell">
                      <span
                        className="rank-badge"
                        style={{ backgroundColor: badge.color }}
                        title={badge.label}
                      >
                        {entry.rank}
                      </span>
                    </div>
                  </td>
                  <td className="name-col">
                    <div className="player-info">
                      <strong>{entry.displayName}</strong>
                      {isCurrentUser && <span className="you-badge">You</span>}
                    </div>
                  </td>
                  <td className="level-col">
                    <span className="level-display">Lvl {entry.level}</span>
                  </td>
                  <td className="score-col">
                    <strong className="score-number">{entry.score.toLocaleString()}</strong>
                  </td>
                  <td className="stats-col">{entry.totalQuizzesCompleted}</td>
                  <td className="stats-col">{entry.totalBossesFought}</td>
                  <td className="streak-col">
                    <span className={`streak-number ${entry.currentStreak > 0 ? "active" : ""}`}>
                      {entry.currentStreak}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {leaderboard.length === 0 && (
          <div className="empty-state">
            <p>No entries yet for this leaderboard</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .leaderboard-page {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .leaderboard-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .leaderboard-header h1 {
          margin: 0 0 15px 0;
          font-size: 2rem;
          color: #fff;
        }

        .user-rank-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 15px;
          background: rgba(245, 158, 11, 0.1);
          border: 2px solid #f59e0b;
          border-radius: 8px;
          color: #fbbf24;
        }

        .rank-text {
          font-size: 0.95rem;
        }

        .rank-display {
          font-size: 1.3rem;
          font-weight: 700;
        }

        .rank-score {
          font-size: 0.9rem;
          color: #fcd34d;
        }

        .leaderboard-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 10px 16px;
          border: 2px solid #475569;
          background: rgba(30, 30, 40, 0.8);
          color: #cbd5e1;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          border-color: #3b82f6;
        }

        .tab-btn.active {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .mode-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          padding: 15px;
          background: rgba(30, 30, 40, 0.5);
          border-radius: 8px;
        }

        .mode-btn {
          padding: 8px 12px;
          border: 1px solid #475569;
          background: rgba(30, 30, 40, 0.8);
          color: #a0aec0;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .mode-btn:hover {
          border-color: #3b82f6;
          color: #60a5fa;
        }

        .mode-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #fff;
        }

        .leaderboard-container {
          overflow-x: auto;
          border: 2px solid #475569;
          border-radius: 8px;
          background: rgba(30, 30, 40, 0.8);
        }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .leaderboard-table thead {
          background: rgba(59, 130, 246, 0.1);
          border-bottom: 2px solid #475569;
        }

        .leaderboard-table th {
          padding: 12px;
          text-align: left;
          color: #cbd5e1;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .rank-col {
          width: 80px;
        }

        .name-col {
          min-width: 200px;
        }

        .level-col {
          width: 100px;
        }

        .score-col {
          width: 120px;
        }

        .stats-col {
          width: 90px;
        }

        .streak-col {
          width: 90px;
        }

        .leaderboard-row {
          border-bottom: 1px solid #334155;
          transition: background 0.2s;
        }

        .leaderboard-row:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .leaderboard-row.current-user {
          background: rgba(16, 185, 129, 0.1);
          border-left: 4px solid #10b981;
        }

        .leaderboard-table td {
          padding: 12px;
          color: #e2e8f0;
        }

        .rank-cell {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          border-radius: 50%;
          font-weight: 700;
          color: #fff;
          font-size: 0.85rem;
        }

        .player-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .player-info strong {
          color: #fff;
        }

        .you-badge {
          display: inline-block;
          padding: 2px 6px;
          background: #10b981;
          color: #fff;
          border-radius: 3px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .level-display {
          display: inline-block;
          padding: 4px 8px;
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border-radius: 4px;
          font-weight: 600;
        }

        .score-number {
          color: #60a5fa;
          font-size: 1rem;
        }

        .streak-number {
          display: inline-block;
          padding: 4px 8px;
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border-radius: 4px;
          font-weight: 600;
        }

        .streak-number.active {
          background: rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .leaderboard-table th,
          .leaderboard-table td {
            padding: 8px 4px;
            font-size: 0.8rem;
          }

          .rank-col,
          .stats-col,
          .streak-col {
            width: auto;
          }

          .name-col {
            min-width: 150px;
          }
        }
      `}</style>
    </div>
  );
}
