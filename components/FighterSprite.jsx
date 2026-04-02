function ScholarSVG() {
  return (
    <svg width="46" height="64" viewBox="0 0 46 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Staff behind character */}
      <line x1="39" y1="12" x2="44" y2="61" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Staff orb glow */}
      <circle cx="39" cy="10" r="8" fill="#7c3aed" opacity="0.35">
        <animate attributeName="r" values="8;11;8" dur="2.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.35;0.7;0.35" dur="2.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="39" cy="10" r="5.5" fill="#8b5cf6"/>
      <circle cx="39" cy="10" r="3" fill="#c4b5fd"/>
      <circle cx="37.5" cy="8.5" r="1.2" fill="white" opacity="0.95"/>
      {/* Wizard hat */}
      <polygon points="23,2 12,24 34,24" fill="#4c1d95"/>
      <ellipse cx="23" cy="24" rx="13.5" ry="4.5" fill="#6d28d9"/>
      <circle cx="23" cy="14" r="2.2" fill="#fbbf24"/>
      {/* Face */}
      <circle cx="23" cy="33" r="9.5" fill="#fde7c5"/>
      <circle cx="20" cy="32" r="2" fill="#1e1b4b"/>
      <circle cx="26" cy="32" r="2" fill="#1e1b4b"/>
      <circle cx="20.8" cy="31.3" r="0.7" fill="white"/>
      <circle cx="26.8" cy="31.3" r="0.7" fill="white"/>
      <path d="M20,36.5 Q23,38.5 26,36.5" stroke="#9d4e2b" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      {/* Robe body */}
      <path d="M15,41 L12,62 L34,62 L31,41 Q23,38 15,41Z" fill="#5b21b6"/>
      <path d="M23,42 L22,62" stroke="#7c3aed" strokeWidth="1.2" opacity="0.45"/>
      {/* Collar */}
      <path d="M19,41 L23,44 L27,41" fill="#7c3aed"/>
      {/* Left sleeve + hand */}
      <path d="M15,43 L7,55 L12,58 L17,48" fill="#5b21b6"/>
      <circle cx="7.5" cy="57" r="3.5" fill="#fde7c5"/>
      {/* Right sleeve holding staff */}
      <path d="M31,43 L37,45 L38,51 L33,51" fill="#5b21b6"/>
      {/* Shoes */}
      <ellipse cx="18" cy="62" rx="6" ry="2.5" fill="#3b0764"/>
      <ellipse cx="28" cy="62" rx="6" ry="2.5" fill="#3b0764"/>
    </svg>
  );
}

function StrategistSVG() {
  return (
    <svg width="46" height="64" viewBox="0 0 46 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sword */}
      <polygon points="40,2 38,6 42,6" fill="#e2e8f0"/>
      <rect x="38.5" y="6" width="3" height="30" rx="1" fill="#cbd5e1"/>
      <rect x="34" y="8" width="12" height="4" rx="1.5" fill="#94a3b8"/>
      {/* Sword gleam */}
      <rect x="39" y="9" width="2" height="6" rx="0.5" fill="white" opacity="0">
        <animate attributeName="opacity" values="0;0.85;0" dur="3.8s" begin="0.7s" repeatCount="indefinite"/>
        <animate attributeName="y" values="9;30;9" dur="3.8s" begin="0.7s" repeatCount="indefinite"/>
        <animate attributeName="height" values="6;3;6" dur="3.8s" begin="0.7s" repeatCount="indefinite"/>
      </rect>
      {/* Helmet */}
      <path d="M12,12 Q12,4 23,4 Q34,4 34,12 L34,22 L12,22Z" fill="#991b1b"/>
      <rect x="14" y="16" width="18" height="7" rx="2" fill="#7f1d1d"/>
      {/* Visor slits */}
      <line x1="15" y1="18" x2="31" y2="18" stroke="#ef4444" strokeWidth="0.9" opacity="0.8"/>
      <line x1="15" y1="20.5" x2="31" y2="20.5" stroke="#ef4444" strokeWidth="0.9" opacity="0.8"/>
      {/* Helmet ridge */}
      <rect x="21" y="4" width="4" height="8" rx="2" fill="#b91c1c"/>
      {/* Face below visor */}
      <circle cx="23" cy="30" r="8.5" fill="#fde7c5"/>
      <circle cx="20" cy="29" r="1.8" fill="#1e1b4b"/>
      <circle cx="26" cy="29" r="1.8" fill="#1e1b4b"/>
      <circle cx="20.7" cy="28.3" r="0.6" fill="white"/>
      <circle cx="26.7" cy="28.3" r="0.6" fill="white"/>
      <path d="M20,33 Q23,35 26,33" stroke="#9d4e2b" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Chest armor */}
      <rect x="11" y="37" width="24" height="20" rx="3" fill="#991b1b"/>
      <line x1="23" y1="37" x2="23" y2="57" stroke="#b91c1c" strokeWidth="1.6"/>
      <path d="M11,44 Q23,47 35,44" stroke="#b91c1c" strokeWidth="1.3" fill="none"/>
      {/* Pauldrons */}
      <ellipse cx="11" cy="39" rx="6.5" ry="4.5" fill="#7f1d1d"/>
      <ellipse cx="35" cy="39" rx="6.5" ry="4.5" fill="#7f1d1d"/>
      {/* Arms */}
      <rect x="5" y="39" width="7.5" height="15" rx="3.5" fill="#991b1b"/>
      <circle cx="8.5" cy="56" r="3.5" fill="#fde7c5"/>
      <rect x="33.5" y="39" width="7.5" height="15" rx="3.5" fill="#991b1b"/>
      <circle cx="37" cy="56" r="3.5" fill="#fde7c5"/>
      {/* Legs */}
      <rect x="13" y="56" width="9" height="8" rx="2" fill="#7f1d1d"/>
      <rect x="24" y="56" width="9" height="8" rx="2" fill="#7f1d1d"/>
      {/* Boots */}
      <ellipse cx="17.5" cy="64" rx="5.5" ry="2" fill="#6b0f0f"/>
      <ellipse cx="28.5" cy="64" rx="5.5" ry="2" fill="#6b0f0f"/>
    </svg>
  );
}

function AlchemistSVG() {
  return (
    <svg width="46" height="64" viewBox="0 0 46 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Flask */}
      <rect x="37" y="33" width="8" height="15" rx="3.5" fill="#6ee7b7" opacity="0.9"/>
      <ellipse cx="41" cy="32" rx="4.5" ry="2" fill="#34d399"/>
      <rect x="39.5" y="26" width="3" height="7" rx="1" fill="#64748b"/>
      {/* Flask bubbles */}
      <circle cx="39.5" cy="42" r="2" fill="#a7f3d0" opacity="0.7">
        <animate attributeName="cy" values="42;35;42" dur="1.9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0;0.7" dur="1.9s" repeatCount="indefinite"/>
      </circle>
      <circle cx="42.5" cy="45" r="1.3" fill="#a7f3d0" opacity="0.5">
        <animate attributeName="cy" values="45;38;45" dur="2.6s" begin="0.7s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0;0.5" dur="2.6s" begin="0.7s" repeatCount="indefinite"/>
      </circle>
      {/* Wide brim hat */}
      <ellipse cx="23" cy="19" rx="17.5" ry="5.5" fill="#0f766e"/>
      <path d="M13,19 L15,8 L31,8 L33,19" fill="#0d9488"/>
      {/* Buckle */}
      <rect x="20.5" y="12" width="5" height="4" rx="1" fill="#0f766e"/>
      <rect x="21.5" y="13" width="3" height="2" rx="0.5" fill="#fbbf24"/>
      {/* Face */}
      <circle cx="23" cy="29" r="9.5" fill="#fde7c5"/>
      <circle cx="20" cy="28" r="2" fill="#064e3b"/>
      <circle cx="26" cy="28" r="2" fill="#064e3b"/>
      <circle cx="20.8" cy="27.3" r="0.7" fill="white"/>
      <circle cx="26.8" cy="27.3" r="0.7" fill="white"/>
      <path d="M20,32.5 Q23,34.5 26,32.5" stroke="#9d4e2b" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      {/* Cloak body */}
      <path d="M14,37 L10,62 L36,62 L32,37 Q23,34 14,37Z" fill="#0d9488"/>
      <path d="M23,38 L21,62" stroke="#14b8a6" strokeWidth="1.5" opacity="0.5"/>
      {/* Collar */}
      <path d="M18,37 L23,41 L28,37" fill="#0f766e"/>
      {/* Left arm */}
      <path d="M14,39 L6,51 L11,54 L16,44" fill="#0d9488"/>
      <circle cx="6.5" cy="53" r="3.5" fill="#fde7c5"/>
      {/* Right arm holding flask */}
      <path d="M32,39 L37,41 L38,47 L34,48" fill="#0d9488"/>
      {/* Boots */}
      <ellipse cx="17" cy="62" rx="5.5" ry="2" fill="#134e4a"/>
      <ellipse cx="29" cy="62" rx="5.5" ry="2" fill="#134e4a"/>
    </svg>
  );
}

function EngineerSVG() {
  return (
    <svg width="46" height="64" viewBox="0 0 46 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Spinning gear */}
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 38 44" to="360 38 44" dur="5s" repeatCount="indefinite"/>
        <circle cx="38" cy="44" r="8" fill="#374151" stroke="#fb923c" strokeWidth="2"/>
        <circle cx="38" cy="44" r="3.5" fill="#ea580c"/>
        {/* Gear tooth marks */}
        <line x1="38" y1="34" x2="38" y2="37" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="38" y1="51" x2="38" y2="54" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="28" y1="44" x2="31" y2="44" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="45" y1="44" x2="48" y2="44" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="31.1" y1="37.1" x2="33.2" y2="39.2" stroke="#fb923c" strokeWidth="2" strokeLinecap="round"/>
        <line x1="44.8" y1="37.1" x2="42.8" y2="39.2" stroke="#fb923c" strokeWidth="2" strokeLinecap="round"/>
        <line x1="31.1" y1="50.9" x2="33.2" y2="48.8" stroke="#fb923c" strokeWidth="2" strokeLinecap="round"/>
        <line x1="44.8" y1="50.9" x2="42.8" y2="48.8" stroke="#fb923c" strokeWidth="2" strokeLinecap="round"/>
      </g>
      {/* Goggles headband */}
      <rect x="11" y="9" width="24" height="7" rx="3.5" fill="#374151"/>
      {/* Goggle lenses */}
      <circle cx="18" cy="12.5" r="5.5" fill="#1d4ed8" opacity="0.85"/>
      <circle cx="28" cy="12.5" r="5.5" fill="#1d4ed8" opacity="0.85"/>
      <circle cx="18" cy="12.5" r="4" fill="#3b82f6"/>
      <circle cx="28" cy="12.5" r="4" fill="#3b82f6"/>
      <circle cx="16.5" cy="11" r="1.5" fill="#93c5fd" opacity="0.9"/>
      <circle cx="26.5" cy="11" r="1.5" fill="#93c5fd" opacity="0.9"/>
      {/* Lens glow */}
      <circle cx="18" cy="12.5" r="5.5" fill="#60a5fa" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.55;0.2" dur="2.6s" repeatCount="indefinite"/>
      </circle>
      <circle cx="28" cy="12.5" r="5.5" fill="#60a5fa" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.55;0.2" dur="2.6s" begin="0.5s" repeatCount="indefinite"/>
      </circle>
      {/* Head */}
      <circle cx="23" cy="24" r="10" fill="#fde7c5"/>
      <circle cx="19.5" cy="23" r="1.7" fill="#1e1b4b"/>
      <circle cx="26.5" cy="23" r="1.7" fill="#1e1b4b"/>
      <path d="M20,27.5 Q23,29.5 26,27.5" stroke="#9d4e2b" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Coat body */}
      <rect x="12" y="33" width="22" height="22" rx="3" fill="#374151"/>
      <rect x="21" y="33" width="4" height="22" fill="#4b5563"/>
      {/* Belt */}
      <rect x="12" y="46" width="22" height="4" rx="1" fill="#1f2937"/>
      <rect x="20.5" y="47" width="5" height="2" rx="1" fill="#fbbf24"/>
      {/* Arms */}
      <rect x="5.5" y="33" width="7.5" height="17" rx="3.5" fill="#374151"/>
      <circle cx="9" cy="52" r="4" fill="#fde7c5"/>
      <rect x="33" y="33" width="7.5" height="17" rx="3.5" fill="#374151"/>
      <circle cx="37" cy="52" r="4" fill="#fde7c5"/>
      {/* Legs */}
      <rect x="14" y="54" width="8.5" height="10" rx="2" fill="#1f2937"/>
      <rect x="23.5" y="54" width="8.5" height="10" rx="2" fill="#1f2937"/>
      {/* Boots */}
      <ellipse cx="18" cy="64" rx="5.5" ry="2" fill="#111827"/>
      <ellipse cx="28" cy="64" rx="5.5" ry="2" fill="#111827"/>
    </svg>
  );
}

export default function FighterSprite({ charClass }) {
  switch (charClass) {
    case "Strategist": return <StrategistSVG />;
    case "Alchemist": return <AlchemistSVG />;
    case "Engineer": return <EngineerSVG />;
    default: return <ScholarSVG />;
  }
}
