import { X, Pause, Play, RefreshCcw } from "lucide-react";

function FullscreenTimer({
  timer,
  manaPercent,
  formatTime,
  onToggleTimer,
  onResetTimer,
  onClose,
  activeSubject,
}) {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(135deg, rgba(11, 7, 20, 0.98) 0%, rgba(28, 17, 48, 0.98) 50%, rgba(11, 7, 20, 0.98) 100%)",
      backdropFilter: "blur(8px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px",
      animation: "fadeInScale 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    }}>
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 30px rgba(99, 199, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 50px rgba(99, 199, 255, 0.6);
          }
        }
        .fullscreen-timer-display {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `}</style>
      
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          background: "rgba(214, 176, 92, 0.15)",
          border: "1.5px solid rgba(214, 176, 92, 0.35)",
          borderRadius: "12px",
          padding: "10px",
          cursor: "pointer",
          color: "#f7ecd0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "rgba(214, 176, 92, 0.25)";
          e.target.style.boxShadow = "0 4px 12px rgba(214, 176, 92, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "rgba(214, 176, 92, 0.15)";
          e.target.style.boxShadow = "none";
        }}
        title="Close fullscreen"
      >
        <X size={24} />
      </button>

      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <p style={{ 
          color: "rgba(99, 199, 255, 0.8)", 
          fontSize: "18px", 
          margin: 0,
          letterSpacing: "2px",
          textTransform: "uppercase",
          fontWeight: "600",
        }}>
          {timer.mode === "focus" ? "FOCUS PHASE" : "BREAK PHASE"}
        </p>
        <h1 
          className="fullscreen-timer-display"
          style={{
            color: timer.mode === "focus" ? "#63c7ff" : "#ffd966",
            fontSize: "140px",
            margin: "30px 0",
            fontWeight: "bold",
            fontFamily: "monospace",
            letterSpacing: "8px",
            textShadow: `0 0 40px ${timer.mode === "focus" ? "rgba(99, 199, 255, 0.6)" : "rgba(255, 217, 102, 0.6)"}`,
          }}
        >
          {formatTime(timer.secondsLeft)}
        </h1>
        <p style={{ color: "#ffd36c", fontSize: "18px", margin: "10px 0 0 0" }}>
          {activeSubject.focusMinutes}m focus / {activeSubject.breakMinutes}m break
        </p>
      </div>

      {/* Mana Bar - Large Version */}
      <div style={{
        width: "100%",
        maxWidth: "500px",
        marginBottom: "60px",
        padding: "24px",
        background: "linear-gradient(135deg, rgba(14, 26, 54, 0.6), rgba(10, 18, 40, 0.8))",
        borderRadius: "20px",
        border: "1.5px solid rgba(99, 199, 255, 0.2)",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}>
          <span style={{
            color: "rgba(99, 199, 255, 0.8)",
            fontSize: "0.85rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontWeight: "700",
          }}>
            Arcane Reserves
          </span>
          <span style={{
            color: "rgba(99, 199, 255, 0.6)",
            fontSize: "0.9rem",
            fontWeight: "500",
          }}>
            {manaPercent.toFixed(1)}%
          </span>
        </div>
        <div style={{
          height: "32px",
          background: "rgba(10, 20, 40, 0.6)",
          border: "1px solid rgba(99, 199, 255, 0.15)",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
        }}>
          <div style={{
            height: "100%",
            width: `${manaPercent}%`,
            background: "linear-gradient(90deg, rgba(99, 199, 255, 0.3), rgba(99, 199, 255, 0.8), rgba(134, 239, 255, 1))",
            boxShadow: "0 0 20px rgba(99, 199, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
            transition: "width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
              animation: "shimmer 2s infinite",
            }} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex",
        gap: "24px",
        justifyContent: "center",
      }}>
        <button
          onClick={onToggleTimer}
          style={{
            padding: "16px 40px",
            fontSize: "16px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #ffd36c 0%, #d6b05c 100%)",
            color: "#0b0714",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            boxShadow: "0 8px 24px rgba(255, 211, 108, 0.3)",
            letterSpacing: "0.5px",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(255, 211, 108, 0.5)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 211, 108, 0.3)";
          }}
        >
          {timer.isRunning ? <Pause size={20} /> : <Play size={20} />}
          {timer.isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={onResetTimer}
          style={{
            padding: "16px 40px",
            fontSize: "16px",
            fontWeight: "700",
            background: "rgba(214, 176, 92, 0.15)",
            color: "#f7ecd0",
            border: "1.5px solid rgba(214, 176, 92, 0.4)",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            boxShadow: "0 4px 12px rgba(214, 176, 92, 0.1)",
            backdropFilter: "blur(8px)",
            letterSpacing: "0.5px",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(214, 176, 92, 0.25)";
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(214, 176, 92, 0.2)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(214, 176, 92, 0.15)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(214, 176, 92, 0.1)";
          }}
        >
          <RefreshCcw size={20} />
          Reset
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 72px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default FullscreenTimer;
