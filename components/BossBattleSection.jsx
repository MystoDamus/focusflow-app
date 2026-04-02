import { useEffect, useRef, useState } from "react";

import BossSprite from "./BossSprite";
import FighterSprite from "./FighterSprite";
import { damagePartyMember, healPartyMember } from "../partySystem";

const ROLE_CLASS = {
  Healer: "Scholar", Tank: "Strategist", Ranger: "Alchemist",
  Warrior: "Strategist", Mage: "Scholar", Solver: "Engineer",
};

const SLASH_ICONS = ["⚡", "✦", "🗡️", "💥", "🌀"];

function getSlashIcon(combo) {
  return SLASH_ICONS[combo % SLASH_ICONS.length];
}

function BossBattleSection({ battle, activeSubject, party, profile, onPartyUpdate, hasHealer, consumables, onUsePotion }) {
  const prevPulseRef = useRef(battle.pulse);
  const [activeAttacker, setActiveAttacker] = useState(-1);
  const [shakeStage, setShakeStage] = useState(false);
  const [lastSlash, setLastSlash] = useState("⚡");
  const [isDefending, setIsDefending] = useState(false);
  const [combatLog, setCombatLog] = useState([]);
  const [activeParty, setActiveParty] = useState(party);

  // Sync active party with prop
  useEffect(() => {
    setActiveParty(party);
  }, [party]);

  // Handle combat animation and damage application
  useEffect(() => {
    if (battle.pulse === prevPulseRef.current) return;
    prevPulseRef.current = battle.pulse;

    const idx = battle.combo > 0 ? (battle.combo - 1) % 3 : 0;
    const slash = getSlashIcon(battle.combo);

    setActiveAttacker(idx);
    setLastSlash(slash);

    // Delay the screen shake to coincide with impact
    const shakeDelay = setTimeout(() => {
      setShakeStage(true);
      setTimeout(() => setShakeStage(false), 340);
    }, 280);

    const resetAttack = setTimeout(() => setActiveAttacker(-1), 620);

    return () => {
      clearTimeout(shakeDelay);
      clearTimeout(resetAttack);
    };
  }, [battle.pulse, battle.combo]);

  // Handle wrong answer - party takes damage
  const handlePartyDamage = (damage) => {
    const defended = isDefending;
    const actualDamage = defended ? Math.ceil(damage * 0.5) : damage;
    
    const updatedParty = activeParty.map((member, idx) => {
      // Damage is distributed to all members
      return damagePartyMember(member, Math.ceil(actualDamage / activeParty.length));
    });

    setActiveParty(updatedParty);
    if (onPartyUpdate) onPartyUpdate(updatedParty);

    const log = defended ? `Defended! Took ${actualDamage} damage` : `Party took ${actualDamage} damage!`;
    addCombatLog(log, "damage");
    setIsDefending(false);
  };

  const handleDefend = () => {
    setIsDefending(true);
    addCombatLog("Party braces for impact!", "defend");
  };

  const handleHeal = () => {
    if (!hasHealer) return;
    
    const updatedParty = activeParty.map((member) => healPartyMember(member, 30));
    setActiveParty(updatedParty);
    if (onPartyUpdate) onPartyUpdate(updatedParty);
    
    addCombatLog("Healer recovers party +30 HP!", "heal");
  };

  const handleUsePotion = (potionId) => {
    if (potionId === "potion_health_small") {
      const updatedParty = activeParty.map((member) => healPartyMember(member, Math.ceil(member.maxHp * 0.25)));
      setActiveParty(updatedParty);
      if (onPartyUpdate) onPartyUpdate(updatedParty);
      addCombatLog("Used Minor Health Potion +25%!", "potion");
      if (onUsePotion) onUsePotion(potionId);
    } else if (potionId === "potion_health_large") {
      const updatedParty = activeParty.map((member) => healPartyMember(member, Math.ceil(member.maxHp * 0.75)));
      setActiveParty(updatedParty);
      if (onPartyUpdate) onPartyUpdate(updatedParty);
      addCombatLog("Used Major Health Potion +75%!", "potion");
      if (onUsePotion) onUsePotion(potionId);
    }
  };

  const addCombatLog = (message, type) => {
    const newLog = { id: Date.now(), message, type, timestamp: new Date().toLocaleTimeString() };
    setCombatLog((prev) => [newLog, ...prev].slice(0, 5)); // Keep last 5 logs
  };

  const fighters = [
    { charClass: profile?.className ?? "Scholar", name: profile?.name ?? "Hero", hp: 100, maxHp: 100, isHero: true },
    ...activeParty.map((m) => ({ charClass: m.class, name: m.name, hp: m.currentHp, maxHp: m.maxHp })),
  ];

  const hpPct = activeSubject.boss.maxHp > 0
    ? Math.max(0, (activeSubject.boss.hp / activeSubject.boss.maxHp) * 100)
    : 0;
  const hpClass = hpPct > 50 ? "healthy" : hpPct > 20 ? "wounded" : "critical";
  const bossDefeated = activeSubject.boss.hp === 0;
  const bossType = activeSubject.boss.type ?? "shadow";
  const isHighCombo = battle.combo >= 3;
  
  const totalPartyHp = activeParty.reduce((sum, m) => sum + m.currentHp, 0);
  const maxPartyHp = activeParty.reduce((sum, m) => sum + m.maxHp, 0);
  const partyHpPct = maxPartyHp > 0 ? (totalPartyHp / maxPartyHp) * 100 : 100;
  const partyHpClass = partyHpPct > 50 ? "healthy" : partyHpPct > 20 ? "wounded" : "critical";

  return (
    <div className={`quest-boss-arena ${shakeStage ? "qba-shake" : ""} ${isHighCombo && activeAttacker >= 0 ? "qba-combo-burst" : ""}`}>
      <div className="qba-header">
        <div>
          <span className="eyebrow">Boss Encounter</span>
          <strong className="qba-boss-name">{activeSubject.boss.name}</strong>
        </div>
        <div className="qba-meta">
          {battle.combo > 1 && (
            <span className={`combo-badge ${battle.combo >= 5 ? "combo-badge--blazing" : battle.combo >= 3 ? "combo-badge--hot" : ""}`}>
              Combo ×{battle.combo}
            </span>
          )}
          <span>{activeSubject.boss.hp}/{activeSubject.boss.maxHp} HP</span>
        </div>
      </div>

      <div className="qba-hp-track">
        <div className={`qba-hp-fill qba-hp-${hpClass}`} style={{ width: `${hpPct}%` }} />
        {[25, 50, 75].map((mark) => (
          <div key={mark} className="qba-hp-mark" style={{ left: `${mark}%` }} />
        ))}
      </div>

      {/* Party Health Status */}
      <div className="party-hp-status">
        <span className="party-label">Party Health:</span>
        <div className="party-hp-bar">
          <div className={`party-hp-fill qba-hp-${partyHpClass}`} style={{ width: `${partyHpPct}%` }} />
        </div>
        <span className="party-hp-text">{totalPartyHp}/{maxPartyHp} HP</span>
      </div>

      {/* Party Members Health Individual */}
      <div className="party-members-health">
        {activeParty.map((member, idx) => {
          const memberHpPct = member.maxHp > 0 ? (member.currentHp / member.maxHp) * 100 : 100;
          return (
            <div key={member.id} className="member-hp-widget">
              <span className="member-name">{member.name}</span>
              <div className="member-hp-bar">
                <div className="member-hp-fill" style={{ width: `${memberHpPct}%` }} />
              </div>
              <span className="member-hp-num">{member.currentHp}/{member.maxHp}</span>
            </div>
          );
        })}
      </div>

      <div className="fight-stage">
        <div className="fighter-team">
          {fighters.slice(0, 2).map((fighter, idx) => (
            <div
              key={fighter.name}
              className={`fighter ${activeAttacker === idx ? "is-attacking" : ""}`}
            >
              <div
                className="fighter-sprite"
                style={{ "--idle-delay": `${idx * 0.55}s` }}
              >
                <FighterSprite charClass={fighter.charClass} />
              </div>
              <span className="fighter-name">{fighter.isHero ? "You" : fighter.name}</span>
            </div>
          ))}
        </div>

        <div className="fight-center">
          {activeAttacker >= 0 ? (
            <span
              key={`slash-${battle.pulse}`}
              className={`slash-fly ${isHighCombo ? "slash-fly--wild" : ""}`}
            >
              {lastSlash}
            </span>
          ) : (
            <span className="fight-vs">VS</span>
          )}
        </div>

        <div className="boss-side">
          <div className="boss-sprite-wrap">
            <div
              key={`boss-${battle.pulse}`}
              className={`boss-sprite-new ${battle.pulse > 0 ? "boss-just-hit" : ""} ${bossDefeated ? "boss-dead" : ""}`}
            >
              <BossSprite bossType={bossType} isDefeated={bossDefeated} />
            </div>
            {battle.damage > 0 && battle.pulse > 0 && (
              <div key={`dmg-${battle.pulse}`} className={`boss-dmg-float ${battle.damage >= 5 ? "boss-dmg-float--big" : ""}`}>
                -{battle.damage}
              </div>
            )}
          </div>
          <span className="fighter-name boss-label">{activeSubject.boss.name}</span>
        </div>
      </div>

      {/* Combat Mechanics */}
      {!bossDefeated && (
        <div className="combat-mechanics">
          <button
            className={`mechanic-btn defend-btn ${isDefending ? "active" : ""}`}
            onClick={handleDefend}
            title="Reduce incoming damage by 50%"
          >
            🛡️ Defend
          </button>
          {hasHealer && (
            <button
              className="mechanic-btn heal-btn"
              onClick={handleHeal}
              title="Heal party for 30 HP"
            >
              💚 Heal
            </button>
          )}
          {consumables && consumables.length > 0 && (
            <div className="potion-buttons">
              {consumables.map((potion) => (
                <button
                  key={potion.id}
                  className="mechanic-btn potion-btn"
                  onClick={() => handleUsePotion(potion.id)}
                  title={`Use ${potion.name}`}
                >
                  🧪 {potion.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Combat Log */}
      {combatLog.length > 0 && (
        <div className="combat-log">
          {combatLog.map((log) => (
            <div key={log.id} className={`log-entry log-${log.type}`}>
              {log.message}
            </div>
          ))}
        </div>
      )}

      {bossDefeated ? (
        <div className="qba-victory">🏆 Boss Defeated! A new challenge rises.</div>
      ) : (
        <p className="qba-hint">✦ Complete quests to strike the boss</p>
      )}
    </div>
  );
}

export default BossBattleSection;
