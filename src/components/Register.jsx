import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { APP_CONFIG } from "../config";

function MailIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
}
function LockIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function EyeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function EyeOffIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>;
}
function AlertTriangleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function CheckCircleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function UserIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function AtSignIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>;
}

function calculatePasswordStrength(password) {
  if (!password) return { score: 0, label: "None", color: "var(--text-secondary)" };
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  Object.values(checks).forEach(check => { if (check) score++; });
  const strength = [
    { min: 0, label: "Weak", color: "#ef4444" },
    { min: 1, label: "Fair", color: "#f59e0b" },
    { min: 2, label: "Fair", color: "#f59e0b" },
    { min: 3, label: "Good", color: "#eab308" },
    { min: 4, label: "Strong", color: "#22c55e" },
    { min: 5, label: "Very Strong", color: "#10b981" }
  ];
  const level = strength.find((s, i) => i === score) || strength[strength.length - 1];
  return { score, label: level.label, color: level.color, checks };
}

const getFriendlyErrorMessage = (err) => {
  return err.message || "Failed to create account. Please try again.";
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const { currentUser, register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  useEffect(() => {
    if (currentUser) navigate("/tickets");
  }, [currentUser, navigate]);

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email || !password || !name || !username) {
      setError("Please fill out all fields.");
      triggerShake();
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      triggerShake();
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      triggerShake();
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain uppercase, lowercase, and numbers.");
      triggerShake();
      return;
    }
    setAuthLoading(true);
    try {
      await register({ name, email, password, username });
      setShowSuccess(true);
      setEmail("");
      setName("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/login"), 3500);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
      triggerShake();
    } finally {
      setAuthLoading(false);
    }
  };

  const inputBase = {
    width: "100%", padding: "11px 13px", borderRadius: "8px",
    background: "var(--border-color)", border: "1px solid transparent",
    color: "var(--text-primary)", fontSize: "13px", outline: "none",
    boxSizing: "border-box", transition: "all 200ms ease",
    fontFamily: "var(--font-body)", caretColor: "var(--color-primary)",
  };
  const inputFocus = (e) => {
    e.target.style.background = "rgba(255,255,255,0.08)";
    e.target.style.borderColor = "var(--color-primary)";
    e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.15)";
  };
  const inputBlur = (e) => {
    e.target.style.background = "var(--border-color)";
    e.target.style.borderColor = "transparent";
    e.target.style.boxShadow = "none";
  };

  if (showSuccess) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-page)", fontFamily: "var(--font-body)", padding: "20px" }}>
        <div className="slide-in" style={{ textAlign: "center", maxWidth: "420px" }}>
          <div style={{
            width: "72px", height: "72px", margin: "0 auto 20px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-tertiary) 0%, #059669 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 12px 32px rgba(16,185,129,0.3)",
            color: "#fff",
          }}>
            <CheckCircleIcon />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--text-primary)", margin: "0 0 10px" }}>Account Created!</h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.6 }}>
            Your account has been successfully created. A verification email has been sent to your inbox.
          </p>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Redirecting to login in 3 seconds...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "var(--bg-page)",
      fontFamily: "var(--font-body)", padding: "20px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 30% 40%, rgba(79,70,229,0.1) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(16,185,129,0.06) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      <div className="slide-in" style={{
        width: "100%", maxWidth: "480px",
        padding: "36px 32px",
        background: "var(--bg-card)",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        border: "1px solid rgba(255,255,255,0.08)",
        position: "relative", zIndex: 1,
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--text-primary)", margin: 0 }}>Create Account</h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>Join thousands of companies using Bluspring</p>
        </div>

        {error && (
          <div className={shakeError ? "shake" : ""} style={{
            display: "flex", alignItems: "flex-start", gap: "8px",
            background: "var(--color-danger-container, rgba(239,68,68,0.1))",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "var(--color-danger, #EF4444)",
            padding: "12px 14px", borderRadius: "10px",
            fontSize: "13px", lineHeight: 1.5, marginBottom: "16px",
          }}>
            <div style={{ flexShrink: 0, marginTop: "2px" }}><AlertTriangleIcon /></div>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px" }}>FULL NAME</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
              style={{ ...inputBase, paddingLeft: "36px" }}
              onFocus={inputFocus} onBlur={inputBlur}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px" }}>EMAIL ADDRESS</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
              style={{ ...inputBase, paddingLeft: "36px" }}
              onFocus={inputFocus} onBlur={inputBlur}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px" }}>USERNAME</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe"
              style={{ ...inputBase, paddingLeft: "36px" }}
              onFocus={inputFocus} onBlur={inputBlur}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px" }}>PASSWORD</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                style={{ ...inputBase, paddingRight: "36px" }}
                onFocus={inputFocus} onBlur={inputBlur}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px", display: "flex" }}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {password && (
              <div style={{ marginTop: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>STRENGTH</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: passwordStrength.color }}>{passwordStrength.label}</span>
                </div>
                <div style={{ height: "4px", background: "var(--border-color)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${(passwordStrength.score / 5) * 100}%`, height: "100%", background: passwordStrength.color, transition: "width 0.3s ease", borderRadius: "2px" }} />
                </div>
                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
                  {[
                    { check: passwordStrength.checks.length, label: "8+ characters" },
                    { check: passwordStrength.checks.uppercase, label: "Uppercase letter" },
                    { check: passwordStrength.checks.lowercase, label: "Lowercase letter" },
                    { check: passwordStrength.checks.number, label: "Number" },
                    { check: passwordStrength.checks.special, label: "Special character" }
                  ].map((req, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: req.check ? "var(--color-tertiary)" : "var(--text-secondary)", transition: "color 0.2s" }}>
                      <span style={{
                        width: "14px", height: "14px", borderRadius: "50%",
                        border: `1px solid ${req.check ? "var(--color-tertiary)" : "var(--text-muted)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "9px", fontWeight: 700,
                        background: req.check ? "var(--color-tertiary-container, rgba(16,185,129,0.1))" : "transparent",
                        color: req.check ? "var(--color-tertiary)" : "transparent",
                      }}>{req.check ? "\u2713" : ""}</span>
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px" }}>CONFIRM PASSWORD</label>
            <div style={{ position: "relative" }}>
              <input type={showConfirm ? "text" : "password"} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                style={{ ...inputBase, paddingRight: "36px", borderColor: confirmPassword ? (passwordsMatch ? "var(--color-tertiary)" : "var(--color-danger)") : "transparent" }}
                onFocus={inputFocus} onBlur={inputBlur}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px", display: "flex" }}>
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {confirmPassword && (
              <div style={{ marginTop: "5px", fontSize: "11px", color: passwordsMatch ? "var(--color-tertiary)" : "var(--color-danger)", display: "flex", alignItems: "center", gap: "4px" }}>
                {passwordsMatch ? "\u2713 Passwords match" : "\u2717 Passwords don't match"}
              </div>
            )}
          </div>

          <button type="submit" disabled={authLoading || !passwordsMatch || passwordStrength.score < 3}
            style={{
              width: "100%", padding: "12px", borderRadius: "10px", border: "none", marginTop: "4px",
              background: authLoading || !passwordsMatch || passwordStrength.score < 3
                ? "var(--color-primary)"
                : "linear-gradient(135deg, var(--color-primary) 0%, #4338CA 100%)",
              color: "#fff", fontWeight: 700, fontSize: "14px",
              cursor: authLoading || !passwordsMatch || passwordStrength.score < 3 ? "not-allowed" : "pointer",
              opacity: authLoading || !passwordsMatch || passwordStrength.score < 3 ? 0.7 : 1,
              boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
              transition: "all 200ms ease", letterSpacing: "0.02em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => { if (!(authLoading || !passwordsMatch || passwordStrength.score < 3)) { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 6px 20px rgba(79,70,229,0.4)"; } }}
            onMouseLeave={(e) => { if (!(authLoading || !passwordsMatch || passwordStrength.score < 3)) { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 14px rgba(79,70,229,0.35)"; } }}
          >
            {authLoading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                </svg>
                Creating Account...
              </>
            ) : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)" }}>
          <p style={{ margin: "0 0 4px", lineHeight: 1.6 }}>Need help?<br/>Contact Administrator</p>
          <a href={`mailto:${APP_CONFIG.ADMIN_EMAIL}`} style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <MailIcon /> {APP_CONFIG.ADMIN_EMAIL}
          </a>
        </div>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 700 }}>Login</Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
