import { useState } from "react";

export default function AuthScreen({
  deployStamp,
  onLogin,
  onSignup,
  onRequestPasswordReset,
  onResendVerification,
  error,
  info,
  backendEnabled,
}) {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "login") {
      await onLogin(email, password);
    } else {
      await onSignup(email, password, displayName);
    }

    setLoading(false);
  };

  const handleReset = async () => {
    if (!onRequestPasswordReset) {
      return;
    }
    setLoading(true);
    await onRequestPasswordReset(email);
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!onResendVerification) {
      return;
    }
    setLoading(true);
    await onResendVerification(email);
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <h1>⚔️ FocusFlow v4</h1>
          <p>Master your studies through epic quests</p>
          <span className="auth-build">Build {deployStamp}</span>
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => setMode("signup")}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "signup" && (
              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {mode === "signup" && (
                <small>Must be at least 6 characters</small>
              )}
            </div>

            {error && <div className="auth-error">{error}</div>}
            {info && <div className="auth-info">{info}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading
                ? "Processing..."
                : mode === "login"
                  ? "Login to Your Guild"
                  : "Create Your Hero"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {mode === "login"
                ? "New to FocusFlow? Create an account to begin your journey."
                : "Already have an account? Login to continue your quest."}
            </p>
            {mode === "login" ? (
              <div className="auth-inline-actions">
                <button type="button" className="auth-link-btn" onClick={() => setShowReset((value) => !value)}>
                  {showReset ? "Hide password reset" : "Forgot password?"}
                </button>
                {backendEnabled ? (
                  <button type="button" className="auth-link-btn" onClick={handleResendVerification} disabled={loading || !email.trim()}>
                    Resend verification email
                  </button>
                ) : null}
              </div>
            ) : null}
            {mode === "signup" && backendEnabled ? (
              <div className="auth-inline-actions">
                <button type="button" className="auth-link-btn" onClick={handleResendVerification} disabled={loading || !email.trim()}>
                  Resend verification email
                </button>
              </div>
            ) : null}
            {showReset ? (
              <div className="auth-reset-box">
                <p>Use your email address above to request a reset.</p>
                <button type="button" className="ghost-reset-btn" onClick={handleReset} disabled={loading || !email.trim()}>
                  Send reset email
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #1a0f2e 0%, #0d0b08 100%);
          padding: 20px;
        }

        .auth-container {
          width: 100%;
          max-width: 450px;
          border-radius: 12px;
          background: rgba(20, 20, 30, 0.9);
          border: 2px solid #3b82f6;
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
          overflow: hidden;
        }

        .auth-header {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          padding: 30px 20px;
          text-align: center;
          color: #fff;
        }

        .auth-header h1 {
          margin: 0 0 8px 0;
          font-size: 2.5rem;
        }

        .auth-header p {
          margin: 0;
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .auth-build {
          margin-top: 10px;
          display: inline-block;
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 999px;
          padding: 3px 8px;
          background: rgba(255, 255, 255, 0.12);
        }

        .auth-form-wrapper {
          padding: 30px;
        }

        .auth-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 25px;
        }

        .auth-tab {
          flex: 1;
          padding: 10px;
          border: 2px solid transparent;
          background: rgba(59, 130, 246, 0.1);
          color: #a0aec0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .auth-tab:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .auth-tab.active {
          background: #3b82f6;
          color: #fff;
          border-color: #3b82f6;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 6px;
        }

        .form-group input {
          padding: 10px 12px;
          border: 1px solid #475569;
          background: rgba(15, 23, 42, 0.8);
          color: #e2e8f0;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(15, 23, 42, 0.95);
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
        }

        .form-group small {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 4px;
        }

        .auth-error {
          padding: 10px;
          background: rgba(220, 38, 38, 0.2);
          border: 1px solid #dc2626;
          border-radius: 6px;
          color: #fca5a5;
          font-size: 0.85rem;
        }

        .auth-submit {
          padding: 12px;
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 10px;
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
        }

        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .auth-info {
          padding: 10px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          border-radius: 6px;
          color: #86efac;
          font-size: 0.85rem;
        }

        .auth-inline-actions {
          margin-top: 10px;
          display: grid;
          gap: 6px;
          justify-items: center;
        }

        .auth-link-btn {
          background: none;
          border: none;
          color: #93c5fd;
          text-decoration: underline;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .auth-link-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .auth-reset-box {
          margin-top: 10px;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid rgba(147, 197, 253, 0.35);
          background: rgba(30, 58, 138, 0.2);
        }

        .auth-reset-box p {
          margin: 0 0 8px 0;
          color: #bfdbfe;
        }

        .ghost-reset-btn {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid rgba(147, 197, 253, 0.55);
          background: rgba(147, 197, 253, 0.15);
          color: #dbeafe;
          font-weight: 600;
          cursor: pointer;
        }

        .ghost-reset-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
