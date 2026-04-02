function ShadowSprite({ isDefeated }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" opacity={isDefeated ? 0.38 : 1}>
      {/* Outer aura */}
      <circle cx="32" cy="38" r="22" fill="#2d1458" opacity="0.6">
        <animate attributeName="r" values="22;27;22" dur="3.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0.3;0.6" dur="3.2s" repeatCount="indefinite"/>
      </circle>
      {/* Body blob */}
      <path d="M32,14 Q50,18 54,34 Q56,52 44,59 Q32,65 20,59 Q8,52 10,34 Q14,18 32,14Z" fill="#1a0030"/>
      <path d="M32,14 Q50,18 54,34 Q56,52 44,59 Q32,65 20,59 Q8,52 10,34 Q14,18 32,14Z" fill="url(#sdGrad)"/>
      <defs>
        <radialGradient id="sdGrad" cx="38%" cy="32%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#1a0030" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Tendrils */}
      <path d="M14,44 Q3,40 1,28" fill="none" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round">
        <animate attributeName="d" values="M14,44 Q3,40 1,28;M14,44 Q4,34 3,22;M14,44 Q3,40 1,28" dur="2.6s" repeatCount="indefinite"/>
      </path>
      <path d="M50,44 Q61,40 63,28" fill="none" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round">
        <animate attributeName="d" values="M50,44 Q61,40 63,28;M50,44 Q60,34 61,22;M50,44 Q61,40 63,28" dur="3s" begin="0.4s" repeatCount="indefinite"/>
      </path>
      <path d="M28,14 Q25,4 27,0" fill="none" stroke="#4c1d95" strokeWidth="2.5" strokeLinecap="round">
        <animate attributeName="d" values="M28,14 Q25,4 27,0;M28,14 Q29,2 31,-2;M28,14 Q25,4 27,0" dur="2.2s" begin="0.7s" repeatCount="indefinite"/>
      </path>
      {/* Eyes */}
      <ellipse cx="26" cy="32" rx="5.5" ry="4.5" fill="#ff6b00">
        <animate attributeName="ry" values="4.5;5.5;4.5" dur="3.5s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="38" cy="32" rx="5.5" ry="4.5" fill="#ff6b00">
        <animate attributeName="ry" values="4.5;5.5;4.5" dur="3.5s" begin="0.3s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="26" cy="32" rx="3.5" ry="3" fill="#ffcc44"/>
      <ellipse cx="38" cy="32" rx="3.5" ry="3" fill="#ffcc44"/>
      <circle cx="26" cy="32" r="1.4" fill="#1a0000"/>
      <circle cx="38" cy="32" r="1.4" fill="#1a0000"/>
      {/* Mouth */}
      <path d="M22,45 L26,41 L30,45 L34,41 L38,45 L42,41" stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function GolemSprite({ isDefeated }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" opacity={isDefeated ? 0.38 : 1}>
      {/* Shadow */}
      <ellipse cx="32" cy="62" rx="22" ry="4" fill="#1c1409" opacity="0.5"/>
      {/* Head */}
      <rect x="13" y="5" width="38" height="28" rx="5" fill="#6b5745"/>
      <rect x="13" y="5" width="38" height="28" rx="5" fill="url(#gGrad)"/>
      <defs>
        <radialGradient id="gGrad" cx="32%" cy="30%">
          <stop offset="0%" stopColor="#a08060" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#3d2e1e" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Rock cracks */}
      <path d="M20,12 L17,20 L23,18" stroke="#4a3624" strokeWidth="1.3" fill="none"/>
      <path d="M40,10 L44,19 L40,23" stroke="#4a3624" strokeWidth="1.3" fill="none"/>
      <path d="M30,7 L32,16" stroke="#4a3624" strokeWidth="1.1" fill="none"/>
      {/* Eyes */}
      <ellipse cx="24" cy="20" rx="5.5" ry="5" fill="#2d1f12"/>
      <ellipse cx="40" cy="20" rx="5.5" ry="5" fill="#2d1f12"/>
      <ellipse cx="24" cy="20" rx="4" ry="3.5" fill="#ff9500" opacity="0.95">
        <animate attributeName="opacity" values="0.95;0.5;0.95" dur="2.2s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="40" cy="20" rx="4" ry="3.5" fill="#ff9500" opacity="0.95">
        <animate attributeName="opacity" values="0.95;0.5;0.95" dur="2.2s" begin="0.35s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="24" cy="20" rx="2.2" ry="2" fill="#ffcc44"/>
      <ellipse cx="40" cy="20" rx="2.2" ry="2" fill="#ffcc44"/>
      {/* Mouth */}
      <path d="M21,29 L25,26 L29,29 L32,26 L35,29 L39,26 L43,29" stroke="#4a3624" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      {/* Body */}
      <rect x="9" y="36" width="46" height="24" rx="5" fill="#6b5745"/>
      <rect x="9" y="36" width="46" height="24" rx="5" fill="url(#gGrad2)"/>
      <defs>
        <radialGradient id="gGrad2" cx="38%" cy="28%">
          <stop offset="0%" stopColor="#a08060" stopOpacity="0.65"/>
          <stop offset="100%" stopColor="#3d2e1e" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <path d="M24,40 L27,50 L34,47 L37,57" stroke="#4a3624" strokeWidth="1.5" fill="none"/>
      {/* Chest crystal */}
      <ellipse cx="32" cy="48" rx="5.5" ry="6.5" fill="#ff9500" opacity="0.25">
        <animate attributeName="opacity" values="0.25;0.65;0.25" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="32" cy="48" rx="3" ry="4" fill="#ffcc44" opacity="0.85">
        <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      {/* Arms */}
      <rect x="0" y="36" width="11" height="22" rx="4" fill="#6b5745"/>
      <rect x="53" y="36" width="11" height="22" rx="4" fill="#6b5745"/>
      <rect x="0" y="56" width="13" height="8" rx="3" fill="#5a4535"/>
      <rect x="51" y="56" width="13" height="8" rx="3" fill="#5a4535"/>
      {/* Legs */}
      <rect x="14" y="58" width="14" height="6" rx="3" fill="#5a4535"/>
      <rect x="36" y="58" width="14" height="6" rx="3" fill="#5a4535"/>
    </svg>
  );
}

function DragonSprite({ isDefeated }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" opacity={isDefeated ? 0.38 : 1}>
      {/* Wings */}
      <path d="M10,30 Q1,12 5,6 Q14,18 21,31" fill="#991b1b" opacity="0.88"/>
      <path d="M10,30 Q1,12 5,6 Q14,18 21,31" fill="url(#dwG)"/>
      <path d="M54,30 Q63,12 59,6 Q50,18 43,31" fill="#991b1b" opacity="0.88"/>
      <path d="M54,30 Q63,12 59,6 Q50,18 43,31" fill="url(#dwG2)"/>
      <defs>
        <linearGradient id="dwG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="dwG2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Wing membrane veins */}
      <path d="M10,30 Q5,20 6,9" stroke="#dc2626" strokeWidth="1.2" fill="none" opacity="0.7"/>
      <path d="M54,30 Q59,20 58,9" stroke="#dc2626" strokeWidth="1.2" fill="none" opacity="0.7"/>
      {/* Neck */}
      <path d="M24,32 Q22,23 26,16 L38,16 Q42,23 40,32" fill="#991b1b"/>
      {/* Head */}
      <path d="M19,16 Q18,7 28,5 L36,5 Q46,7 45,16 Q43,25 32,27 Q21,25 19,16Z" fill="#dc2626"/>
      <path d="M19,16 Q18,7 28,5 L36,5 Q46,7 45,16 Q43,25 32,27 Q21,25 19,16Z" fill="url(#dhG)"/>
      <defs>
        <radialGradient id="dhG" cx="38%" cy="28%">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.75"/>
          <stop offset="80%" stopColor="#7f1d1d" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Horns */}
      <polygon points="27,6 24,0 29,5" fill="#b91c1c"/>
      <polygon points="37,6 40,0 35,5" fill="#b91c1c"/>
      {/* Eyes */}
      <ellipse cx="26" cy="14" rx="4.5" ry="4.5" fill="#ff8c00"/>
      <ellipse cx="38" cy="14" rx="4.5" ry="4.5" fill="#ff8c00"/>
      <ellipse cx="26" cy="14" rx="2" ry="3.5" fill="#1a0000"/>
      <ellipse cx="38" cy="14" rx="2" ry="3.5" fill="#1a0000"/>
      <ellipse cx="26" cy="14" rx="4.5" ry="4.5" fill="#fb923c" opacity="0.25">
        <animate attributeName="opacity" values="0.25;0.65;0.25" dur="2.8s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="38" cy="14" rx="4.5" ry="4.5" fill="#fb923c" opacity="0.25">
        <animate attributeName="opacity" values="0.25;0.65;0.25" dur="2.8s" begin="0.35s" repeatCount="indefinite"/>
      </ellipse>
      {/* Snout */}
      <ellipse cx="32" cy="21" rx="5.5" ry="3" fill="#b91c1c"/>
      <circle cx="30.5" cy="21" r="1.3" fill="#7f1d1d"/>
      <circle cx="33.5" cy="21" r="1.3" fill="#7f1d1d"/>
      {/* Mouth + teeth */}
      <path d="M23,24 Q32,30 41,24" stroke="#7f1d1d" strokeWidth="1.5" fill="none"/>
      <line x1="26.5" y1="24.5" x2="26.5" y2="28" stroke="#fff8f1" strokeWidth="1.8"/>
      <line x1="31" y1="25.5" x2="31" y2="29" stroke="#fff8f1" strokeWidth="1.8"/>
      <line x1="37.5" y1="24.5" x2="37.5" y2="28" stroke="#fff8f1" strokeWidth="1.8"/>
      {/* Body */}
      <ellipse cx="32" cy="48" rx="19" ry="16" fill="#991b1b"/>
      <path d="M19,40 Q32,37 45,40" stroke="#b91c1c" strokeWidth="1.3" fill="none"/>
      <path d="M17,47 Q32,44 47,47" stroke="#b91c1c" strokeWidth="1.3" fill="none"/>
      <path d="M19,54 Q32,51 45,54" stroke="#b91c1c" strokeWidth="1.3" fill="none"/>
      {/* Tail */}
      <path d="M48,52 Q60,58 58,48 Q64,42 54,42" fill="#7f1d1d" stroke="#991b1b" strokeWidth="0.6"/>
      {/* Claws */}
      <path d="M13,50 Q6,56 5,63 Q9,59 13,57 Q11,62 15,64 Q15,60 18,57" fill="#7f1d1d"/>
      <path d="M51,50 Q58,56 59,63 Q55,59 51,57 Q53,62 49,64 Q49,60 46,57" fill="#7f1d1d"/>
      {/* Fire flicker */}
      <ellipse cx="32" cy="28" rx="4.5" ry="2.5" fill="#fb923c" opacity="0">
        <animate attributeName="opacity" values="0;0.85;0" dur="3.8s" begin="1.2s" repeatCount="indefinite"/>
        <animate attributeName="ry" values="2.5;5;2.5" dur="3.8s" begin="1.2s" repeatCount="indefinite"/>
      </ellipse>
    </svg>
  );
}

function SpecterSprite({ isDefeated }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" opacity={isDefeated ? 0.38 : 1}>
      {/* Ghost aura */}
      <ellipse cx="32" cy="40" rx="22" ry="20" fill="#0d9488" opacity="0.12">
        <animate attributeName="opacity" values="0.12;0.28;0.12" dur="3.2s" repeatCount="indefinite"/>
        <animate attributeName="rx" values="22;27;22" dur="3.2s" repeatCount="indefinite"/>
      </ellipse>
      {/* Ghostly tail */}
      <path d="M16,58 Q20,64 24,57 Q28,64 32,57 Q36,64 40,57 Q44,64 48,57 L48,37 Q40,58 32,54 Q24,58 16,37Z" fill="#0f766e" opacity="0.8"/>
      {/* Main body */}
      <path d="M14,24 Q14,50 16,58 Q24,64 32,60 Q40,64 48,58 Q50,50 50,24 Q42,13 32,13 Q22,13 14,24Z" fill="#0f766e"/>
      <path d="M14,24 Q14,50 16,58 Q24,64 32,60 Q40,64 48,58 Q50,50 50,24 Q42,13 32,13 Q22,13 14,24Z" fill="url(#spG)"/>
      <defs>
        <radialGradient id="spG" cx="35%" cy="25%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.65"/>
          <stop offset="100%" stopColor="#0f766e" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Skull head */}
      <circle cx="32" cy="19" r="14" fill="#0d9488"/>
      <circle cx="32" cy="19" r="14" fill="url(#skG)"/>
      <defs>
        <radialGradient id="skG" cx="35%" cy="28%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.75"/>
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Eye sockets */}
      <ellipse cx="25" cy="17" rx="5.5" ry="6" fill="#064e3b"/>
      <ellipse cx="39" cy="17" rx="5.5" ry="6" fill="#064e3b"/>
      {/* Glowing eyes */}
      <ellipse cx="25" cy="17" rx="3.8" ry="4.5" fill="#5eead4">
        <animate attributeName="opacity" values="1;0.35;1" dur="2.8s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="39" cy="17" rx="3.8" ry="4.5" fill="#5eead4">
        <animate attributeName="opacity" values="1;0.35;1" dur="2.8s" begin="0.45s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="25" cy="17" rx="2" ry="2.5" fill="#a7f3d0"/>
      <ellipse cx="39" cy="17" rx="2" ry="2.5" fill="#a7f3d0"/>
      {/* Nasal */}
      <path d="M30,23 L32,25.5 L34,23 Q32,27.5 30,23Z" fill="#064e3b"/>
      {/* Skull teeth */}
      <line x1="27" y1="28" x2="27" y2="31" stroke="#064e3b" strokeWidth="2.2"/>
      <line x1="31.5" y1="29" x2="31.5" y2="32" stroke="#064e3b" strokeWidth="2.2"/>
      <line x1="36" y1="29" x2="36" y2="32" stroke="#064e3b" strokeWidth="2.2"/>
      <line x1="40" y1="28" x2="40" y2="31" stroke="#064e3b" strokeWidth="2.2"/>
      {/* Wisps */}
      <circle cx="13" cy="42" r="3.5" fill="#2dd4bf" opacity="0.5">
        <animate attributeName="cy" values="42;35;42" dur="3.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0.15;0.5" dur="3.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="51" cy="37" r="2.5" fill="#2dd4bf" opacity="0.4">
        <animate attributeName="cy" values="37;30;37" dur="2.7s" begin="0.9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.7s" begin="0.9s" repeatCount="indefinite"/>
      </circle>
      <circle cx="9" cy="30" r="2" fill="#2dd4bf" opacity="0.3">
        <animate attributeName="cy" values="30;23;30" dur="3.8s" begin="1.4s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

function TitanSprite({ isDefeated }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" opacity={isDefeated ? 0.38 : 1}>
      {/* Energy glow */}
      <ellipse cx="32" cy="42" rx="28" ry="21" fill="#1d4ed8" opacity="0.1">
        <animate attributeName="opacity" values="0.1;0.25;0.1" dur="3.2s" repeatCount="indefinite"/>
      </ellipse>
      {/* Body */}
      <rect x="8" y="27" width="48" height="32" rx="6" fill="#1e3a5f"/>
      <rect x="8" y="27" width="48" height="32" rx="6" fill="url(#tBG)"/>
      <defs>
        <radialGradient id="tBG" cx="38%" cy="28%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Armor lines */}
      <line x1="8" y1="36" x2="56" y2="36" stroke="#2563eb" strokeWidth="1.5" opacity="0.55"/>
      <line x1="8" y1="47" x2="56" y2="47" stroke="#2563eb" strokeWidth="1.5" opacity="0.55"/>
      <line x1="32" y1="27" x2="32" y2="59" stroke="#3b82f6" strokeWidth="2" opacity="0.4"/>
      {/* Chest core */}
      <ellipse cx="32" cy="41" rx="8.5" ry="7.5" fill="#1d4ed8" opacity="0.55">
        <animate attributeName="opacity" values="0.55;1;0.55" dur="2.2s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="32" cy="41" rx="5.5" ry="5" fill="#3b82f6">
        <animate attributeName="opacity" values="1;0.6;1" dur="2.2s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="32" cy="41" rx="3" ry="2.7" fill="#93c5fd"/>
      {/* Pauldrons */}
      <ellipse cx="8" cy="31" rx="10.5" ry="8" fill="#1e3a5f"/>
      <ellipse cx="8" cy="31" rx="8" ry="6" fill="#2563eb" opacity="0.28"/>
      <ellipse cx="56" cy="31" rx="10.5" ry="8" fill="#1e3a5f"/>
      <ellipse cx="56" cy="31" rx="8" ry="6" fill="#2563eb" opacity="0.28"/>
      {/* Arms */}
      <rect x="0" y="30" width="10" height="24" rx="4" fill="#1e3a5f" stroke="#2563eb" strokeWidth="0.9" strokeOpacity="0.5"/>
      <rect x="54" y="30" width="10" height="24" rx="4" fill="#1e3a5f" stroke="#2563eb" strokeWidth="0.9" strokeOpacity="0.5"/>
      {/* Fists */}
      <rect x="0" y="52" width="12" height="9" rx="3" fill="#152b47"/>
      <rect x="52" y="52" width="12" height="9" rx="3" fill="#152b47"/>
      {/* Energy joints */}
      <ellipse cx="5" cy="37" rx="3" ry="2" fill="#3b82f6" opacity="0.7"/>
      <ellipse cx="59" cy="37" rx="3" ry="2" fill="#3b82f6" opacity="0.7"/>
      {/* Neck */}
      <rect x="24" y="17" width="16" height="12" rx="4" fill="#152b47"/>
      {/* Helmet */}
      <rect x="15" y="3" width="34" height="19" rx="7" fill="#1e3a5f"/>
      <rect x="15" y="3" width="34" height="19" rx="7" fill="url(#tHG)"/>
      <defs>
        <radialGradient id="tHG" cx="38%" cy="28%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Visor */}
      <rect x="17" y="8" width="30" height="9" rx="3.5" fill="#1d4ed8"/>
      <rect x="17" y="8" width="30" height="9" rx="3.5" fill="#3b82f6" opacity="0.5">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="17" y="8" width="30" height="9" rx="3.5" fill="url(#vG)"/>
      <defs>
        <linearGradient id="vG" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8"/>
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.8"/>
        </linearGradient>
      </defs>
      {/* Scan line */}
      <rect x="17" y="11.5" width="30" height="2.5" rx="1" fill="#dbeafe" opacity="0.4">
        <animate attributeName="x" values="17;37;17" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="width" values="30;10;30" dur="2s" repeatCount="indefinite"/>
      </rect>
      {/* Legs */}
      <rect x="13" y="57" width="14" height="7" rx="3" fill="#152b47"/>
      <rect x="37" y="57" width="14" height="7" rx="3" fill="#152b47"/>
      <line x1="18" y1="57" x2="18" y2="63" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5"/>
      <line x1="46" y1="57" x2="46" y2="63" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  );
}

export default function BossSprite({ bossType, isDefeated }) {
  switch (bossType) {
    case "golem": return <GolemSprite isDefeated={isDefeated} />;
    case "dragon": return <DragonSprite isDefeated={isDefeated} />;
    case "specter": return <SpecterSprite isDefeated={isDefeated} />;
    case "titan": return <TitanSprite isDefeated={isDefeated} />;
    default: return <ShadowSprite isDefeated={isDefeated} />;
  }
}
