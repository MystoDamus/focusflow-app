import { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { errorText: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      errorText: (error && error.message) || String(error) || "Unknown React render error",
    };
  }

  componentDidCatch(error) {
    writeBootError((error && error.message) || String(error));
  }

  render() {
    if (this.state.errorText) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "linear-gradient(180deg,#121826,#070b14)", color: "#e6edf8", fontFamily: "Segoe UI,Arial,sans-serif" }}>
          <div style={{ width: "min(720px,100%)", border: "1px solid #334155", borderRadius: "14px", padding: "18px 20px", background: "rgba(15,23,42,.72)" }}>
            <h1 style={{ margin: "0 0 8px 0", fontSize: "22px" }}>FocusFlow Runtime Error</h1>
            <p style={{ margin: "0 0 10px 0", color: "#9fb2d9" }}>The app crashed during render. Version: 2026-04-03-StudySuite-v4</p>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#fecaca", fontSize: "12px" }}>{this.state.errorText}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function isChunkLoadError(reason) {
  const message = typeof reason === "string"
    ? reason
    : reason instanceof Error
      ? reason.message
      : String(reason ?? "");

  return /loading chunk|failed to fetch dynamically imported module|importing a module script failed/i.test(message);
}

function recoverFromChunkError(reason) {
  if (typeof window === "undefined" || !isChunkLoadError(reason)) {
    return;
  }

  writeBootError(`Chunk load failure: ${String(reason?.message || reason || "unknown")}`);
}

function writeBootError(text) {
  if (typeof document === "undefined") {
    return;
  }

  const target = document.getElementById("boot-error");
  if (target) {
    target.textContent = String(text ?? "Unknown startup error");
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => recoverFromChunkError(event?.error ?? event?.message));
  window.addEventListener("unhandledrejection", (event) => recoverFromChunkError(event?.reason));

  window.addEventListener("error", (event) => {
    writeBootError((event && (event.message || (event.error && event.error.message))) || "Window error");
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason;
    writeBootError((reason && reason.message) || reason || "Unhandled promise rejection");
  });
}

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if (window.caches) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((key) => window.caches.delete(key)));
      }
    } catch {
      // Ignore cache cleanup errors.
    }
  });
}

async function bootstrap() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    return;
  }

  try {
    const module = await import("./App.jsx");
    const App = module.default;

    createRoot(rootElement).render(
      <StrictMode>
        <RootErrorBoundary>
          <App />
        </RootErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    writeBootError((error && error.message) || error || "Failed to bootstrap application");
  }
}

bootstrap();
