import { useEffect, useState } from "react";

function Confetti({ active }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) return;
    const COLORS = ["#ffd36c", "#63c7ff", "#ff7e5f", "#b97fff", "#7cff9c", "#ff93b8"];
    setParticles(
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        left: 10 + Math.random() * 80,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 8,
        delay: Math.random() * 0.5,
        duration: 0.9 + Math.random() * 0.7,
        rotDir: Math.random() > 0.5 ? 1 : -1,
      })),
    );
    const t = setTimeout(() => setParticles([]), 1800);
    return () => clearTimeout(t);
  }, [active]);

  if (!particles.length) return null;

  return (
    <div className="confetti-wrap" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-dot"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            "--rot": `${360 * p.rotDir}deg`,
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;
