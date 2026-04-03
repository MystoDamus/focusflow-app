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
      background: "linear-gradient(135deg, rgba(11, 7, 20, 0.95) 0%, rgba(28, 17, 48, 0.95) 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px",
    }}>
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "rgba(214, 176, 92, 0.1)",
          border: "1px solid rgba(214, 176, 92, 0.25)",
          borderRadius: "8px",
          padding: "8px",
          cursor: "pointer",
          color: "#f7ecd0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Close fullscreen"
      >
        <X size={24} />
      </button>

      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <p style={{ color: "rgba(247, 236, 208, 0.6)", fontSize: "16px", margin: 0 }}>
          {timer.mode === "focus" ? "Focus Phase" : "Break Phase"}
        </p>
        <h1 style={{
          color: "#63c7ff",
          fontSize: "120px",
          margin: "20px 0",
          fontWeight: "bold",
          fontFamily: "monospace",
        }}>
          {formatTime(timer.secondsLeft)}
        </h1>
        <p style={{ color: "#ffd36c", fontSize: "18px", margin: "10px 0 0 0" }}>
          {activeSubject.focusMinutes}m focus / {activeSubject.breakMinutes}m break
        </p>
      </div>

      {/* Mana Bar - Large Version */}
      <div style={{
        width: "100%",
        maxWidth: "400px",
        marginBottom: "40px",
      }}>
        <div style={{
          height: "40px",
          background: "rgba(99, 199, 255, 0.1)",
          border: "2px solid rgba(99, 199, 255, 0.3)",
          borderRadius: "20px",
          overflow: "hidden",
          position: "relative",
        }}>
          <div style={{
            height: "100%",
            width: `${manaPercent}%`,
            background: "linear-gradient(90deg, #63c7ff 0%, #4a9fe6 100%)",
            transition: "width 0.1s linear",
          }} />
        </div>
        <p style={{
          color: "rgba(247, 236, 208, 0.5)",
          fontSize: "12px",
          textAlign: "center",
          margin: "12px 0 0 0",
        }}>
          {manaPercent.toFixed(1)}% Complete
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex",
        gap: "20px",
        justifyContent: "center",
      }}>
        <button
          onClick={onToggleTimer}
          style={{
            padding: "16px 32px",
            fontSize: "16px",
            background: "linear-gradient(135deg, #ffd36c 0%, #d6b05c 100%)",
            color: "#0b0714",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
        >
          {timer.isRunning ? <Pause size={20} /> : <Play size={20} />}
          {timer.isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={onResetTimer}
          style={{
            padding: "16px 32px",
            fontSize: "16px",
            background: "rgba(214, 176, 92, 0.1)",
            color: "#f7ecd0",
            border: "1px solid rgba(214, 176, 92, 0.25)",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(214, 176, 92, 0.2)";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(214, 176, 92, 0.1)";
            e.target.style.transform = "translateY(0)";
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
