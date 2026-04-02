import { useState } from "react";
import { getPartyBattlePower, getPartyComposition, PARTY_ROLES } from "../partySystem";

export default function PartyViewer({ party, onMemberClick }) {
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const battlePower = getPartyBattlePower(party);
  const composition = getPartyComposition(party);

  const selectedMember = selectedMemberId ? party.find((m) => m.id === selectedMemberId) : null;

  return (
    <div className="party-viewer">
      <div className="party-header">
        <h2>⚔️ Your Party</h2>
        <div className="party-stats">
          <span className="stat">Avg Level: <strong>{Math.round(party.reduce((sum, m) => sum + m.level, 0) / party.length)}</strong></span>
          <span className="stat">Battle Power: <strong>{battlePower}</strong></span>
        </div>
      </div>

      <div className="composition-overview">
        {Object.entries(composition).map(([role, count]) => (
          <div key={role} className="composition-item">
            <span className={`role-badge role-${role.toLowerCase()}`}>{role}</span>
            <span className="composition-count">× {count}</span>
          </div>
        ))}
      </div>

      <div className="party-grid">
        {party.map((member) => (
          <div
            key={member.id}
            className={`party-member-card ${selectedMemberId === member.id ? "selected" : ""}`}
            onClick={() => setSelectedMemberId(member.id)}
          >
            <div className="member-avatar">{member.class === "Scholar" ? "🧙" : member.class === "Strategist" ? "🛡️" : member.class === "Alchemist" ? "⚗️" : "⚙️"}</div>
            <h3>{member.name}</h3>
            <p className="role-text">{member.role}</p>
            <div className="level-badge">Lvl {member.level}</div>
            <div className="hp-bar">
              <div className="hp-fill" style={{ width: `${(member.currentHp / member.maxHp) * 100}%` }}></div>
            </div>
            <p className="hp-text">{member.currentHp}/{member.maxHp} HP</p>
          </div>
        ))}
      </div>

      {selectedMember && (
        <div className="member-details">
          <div className="details-header">
            <h3>{selectedMember.name} - {selectedMember.class}</h3>
            <button onClick={() => setSelectedMemberId(null)} className="close-btn">✕</button>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">Level</span>
              <span className="stat-value">{selectedMember.level}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">XP Progress</span>
              <span className="stat-value">{selectedMember.xp}/100</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Total XP</span>
              <span className="stat-value">{selectedMember.totalXp}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Role</span>
              <span className="stat-value">{selectedMember.role}</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">HP</span>
              <span className="stat-value">{selectedMember.hp}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">ATK</span>
              <span className="stat-value">{selectedMember.atk}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">DEF</span>
              <span className="stat-value">{selectedMember.def}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">SPD</span>
              <span className="stat-value">{selectedMember.spd}</span>
            </div>
          </div>

          <div className="activity-stats">
            <h4>Activity Statistics</h4>
            <div className="activity-row">
              <span>Boss Battles Participated:</span>
              <strong>{selectedMember.activityStats.bossBattlesParticipated}</strong>
            </div>
            <div className="activity-row">
              <span>Travelled:</span>
              <strong>{selectedMember.activityStats.travellingSessionsCompleted}</strong>
            </div>
            <div className="activity-row">
              <span>Gathering Sessions:</span>
              <strong>{selectedMember.activityStats.gatheringSessionsCompleted}</strong>
            </div>
            <div className="activity-row">
              <span>Focus Rituals:</span>
              <strong>{selectedMember.activityStats.focusSessionsCompleted}</strong>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .party-viewer {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .party-header {
          margin-bottom: 20px;
        }

        .party-header h2 {
          margin: 0 0 10px 0;
          font-size: 1.5rem;
          color: #fff;
        }

        .party-stats {
          display: flex;
          gap: 20px;
        }

        .stat {
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        .stat strong {
          color: #60a5fa;
          margin-left: 5px;
        }

        .composition-overview {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          padding: 15px;
          background: rgba(30, 30, 40, 0.8);
          border-radius: 8px;
          flex-wrap: wrap;
        }

        .composition-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .role-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #fff;
        }

        .role-badge.role-mage {
          background: #8b5cf6;
        }

        .role-badge.role-tank {
          background: #ef4444;
        }

        .role-badge.role-healer {
          background: #10b981;
        }

        .role-badge.role-dps {
          background: #f59e0b;
        }

        .role-badge.role-support {
          background: #06b6d4;
        }

        .composition-count {
          color: #94a3b8;
          font-weight: 600;
        }

        .party-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .party-member-card {
          padding: 15px;
          border: 2px solid #475569;
          background: rgba(30, 30, 40, 0.8);
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .party-member-card:hover {
          border-color: #3b82f6;
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
        }

        .party-member-card.selected {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .member-avatar {
          font-size: 2.5rem;
          margin-bottom: 8px;
        }

        .party-member-card h3 {
          margin: 8px 0;
          color: #fff;
        }

        .role-text {
          margin: 4px 0 10px 0;
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .level-badge {
          display: inline-block;
          padding: 4px 8px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #000;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 8px;
        }

        .hp-bar {
          width: 100%;
          height: 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          overflow: hidden;
          margin: 8px 0;
        }

        .hp-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          transition: width 0.3s;
        }

        .hp-text {
          margin: 0;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .member-details {
          padding: 20px;
          border: 2px solid #10b981;
          background: rgba(16, 185, 129, 0.05);
          border-radius: 10px;
          margin-top: 20px;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .details-header h3 {
          margin: 0;
          color: #fff;
        }

        .close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 1.2rem;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #fff;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin-bottom: 15px;
        }

        .stat-box {
          padding: 10px;
          background: rgba(30, 30, 40, 0.8);
          border: 1px solid #475569;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #60a5fa;
        }

        .activity-stats {
          padding-top: 15px;
          border-top: 1px solid #475569;
        }

        .activity-stats h4 {
          margin: 0 0 10px 0;
          color: #cbd5e1;
        }

        .activity-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 0.9rem;
          color: #a0aec0;
        }

        .activity-row strong {
          color: #fff;
        }

        @media (max-width: 768px) {
          .party-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
