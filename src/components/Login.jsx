import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { submitUnlockRequest } from "../services/adminApi";
import { APP_CONFIG } from "../config";

function MailIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
}
function LockIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function EyeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function EyeOffIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>;
}
function ShieldIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function AlertTriangleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function CheckCircleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function AlertCircleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function ChevronRightIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}
function BriefcaseIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="1" y1="12" x2="23" y2="12"/></svg>;
}

const getFriendlyErrorMessage = (err) => {
  if (err.status === 423) {
    const match = err.message.match(/(\d+)/);
    const mins = match ? match[0] : 'several';
    return `Account temporarily locked. Too many failed attempts. Try again in ${mins} minute(s).`;
  }
  return err.message || "Failed to sign in. Please verify credentials.";
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [lastForgotTimestamp, setLastForgotTimestamp] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [lockedEmail, setLockedEmail] = useState("");
  const [showUnlockForm, setShowUnlockForm] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState("");
  const [unlockSending, setUnlockSending] = useState(false);
  const [unlockSent, setUnlockSent] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const { currentUser, login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (currentUser) {
      navigate("/tickets");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const stored = localStorage.getItem("forgotCooldown");
    if (stored) {
      const ts = parseInt(stored, 10);
      const diff = Date.now() - ts;
      if (diff < 30000) {
        setLastForgotTimestamp(ts);
        setCooldownRemaining(Math.ceil((30000 - diff) / 1000));
      }
    }
    const interval = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1) {
          localStorage.removeItem("forgotCooldown");
          setLastForgotTimestamp(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePasswordKeyDown = (e) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
  };

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email || !password) {
      setError("Please enter email and password.");
      triggerShake();
      return;
    }
    setAuthLoading(true);
    try {
      const json = await login(email, password);
      if (json.data?.hasMpin === false) {
        navigate("/create-mpin");
      }
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
      triggerShake();
      if (err.status === 423) {
        setLockedEmail(email);
        setShowUnlockForm(true);
        setUnlockSent(false);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!forgotEmail) {
      setError("Please enter your email address.");
      triggerShake();
      return;
    }
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(forgotEmail)) {
      setError("Please enter a valid email address.");
      triggerShake();
      return;
    }
    if (Date.now() - lastForgotTimestamp < 30000) {
      setError("Please wait before requesting another password reset.");
      triggerShake();
      return;
    }
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail);
      setMessage("Password reset instructions have been sent to your email.");
      const now = Date.now();
      setLastForgotTimestamp(now);
      setCooldownRemaining(30);
      localStorage.setItem("forgotCooldown", now.toString());
      setTimeout(() => setShowForgot(false), 3000);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
      triggerShake();
    } finally {
      setForgotLoading(false);
    }
  };

  const handleUnlockSubmit = async () => {
    setError(""); setMessage("");
    if (!lockedEmail) { setError("No email provided."); triggerShake(); return; }
    setUnlockSending(true);
    try {
      await submitUnlockRequest(lockedEmail, unlockMessage);
      setUnlockSent(true);
      setShowUnlockForm(false);
      setMessage("Unlock request sent! An administrator will review it shortly.");
    } catch (err) {
      setError(err.message || "Failed to send unlock request.");
      triggerShake();
    } finally {
      setUnlockSending(false);
    }
  };

  useEffect(() => {
    const remembered = localStorage.getItem("rememberedEmail");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const inputBase = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "var(--rounded-md, 10px)",
    background: "var(--border-color)",
    border: "1px solid transparent",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 200ms ease",
    fontFamily: "var(--font-body)",
    caretColor: "var(--color-primary)",
  };

  const inputFocus = (e) => {
    e.target.style.background = "rgba(255,255,255,0.08)";
    e.target.style.borderColor = "var(--color-primary)";
    e.target.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.15)";
  };

  const inputBlur = (e) => {
    e.target.style.background = "var(--border-color)";
    e.target.style.borderColor = "transparent";
    e.target.style.boxShadow = "none";
  };

  const pStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "var(--bg-page)",
    fontFamily: "var(--font-body)",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div style={pStyle}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 20% 50%, rgba(79,70,229,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(14,165,233,0.08) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "-20%", right: "-10%", width: "400px", height: "400px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", left: "-5%", width: "350px", height: "350px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="slide-in" style={{
        width: "100%", maxWidth: "440px", padding: "40px 32px",
        margin: "20px",
        background: "var(--bg-card)",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, var(--color-primary) 0%, #4338CA 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", margin: "0 auto 12px",
          }}>
            <BriefcaseIcon />
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>Bluspring</div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>Employee Portal</div>
        </div>

        {!showForgot ? (
          <div>
            <div style={{ marginBottom: "28px", textAlign: "center" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--text-primary)", margin: 0 }}>Welcome Back</h2>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "6px" }}>Sign in to your account to continue</p>
            </div>

            {error && (
              <div className={shakeError ? "shake" : ""} style={{
                display: "flex", alignItems: "flex-start", gap: "10px",
                background: "var(--color-danger-container, rgba(239,68,68,0.1))",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "var(--color-danger, #EF4444)",
                padding: "12px 14px", borderRadius: "10px",
                fontSize: "13px", lineHeight: 1.5,
                marginBottom: "16px",
              }}>
                <div style={{ flexShrink: 0, marginTop: "2px", color: "var(--color-danger)" }}><AlertTriangleIcon /></div>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: "10px",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "var(--color-tertiary, #10B981)",
                padding: "12px 14px", borderRadius: "10px",
                fontSize: "13px", lineHeight: 1.5,
                marginBottom: "16px",
              }}>
                <div style={{ flexShrink: 0, marginTop: "2px" }}><CheckCircleIcon /></div>
                <span>{message}</span>
              </div>
            )}

            {showUnlockForm && lockedEmail && (
              <div style={{
                background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.2)",
                borderRadius: "12px", padding: "14px", marginBottom: "16px", fontSize: "13px", lineHeight: 1.5,
              }}>
                <div style={{ fontWeight: 700, color: "var(--color-primary)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircleIcon /> Request Emergency Unlock
                </div>
                <p style={{ color: "var(--text-secondary)", margin: "0 0 8px", fontSize: "12px" }}>
                  Send a request to an administrator to unlock your account immediately.
                </p>
                <textarea
                  value={unlockMessage}
                  onChange={(e) => setUnlockMessage(e.target.value)}
                  placeholder="Optional: Briefly explain why you need emergency access..."
                  rows={2}
                  style={{
                    width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)",
                    background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", fontSize: "12px", outline: "none",
                    resize: "vertical", boxSizing: "border-box", fontFamily: "var(--font-body)",
                  }}
                />
                <button
                  onClick={handleUnlockSubmit}
                  disabled={unlockSending}
                  style={{
                    marginTop: "8px", padding: "8px 16px", borderRadius: "8px", border: "none",
                    background: unlockSending ? "var(--color-primary)" : "var(--color-primary)",
                    color: "#fff", fontWeight: 600, fontSize: "12px",
                    cursor: unlockSending ? "not-allowed" : "pointer",
                    width: "100%", opacity: unlockSending ? 0.7 : 1,
                    transition: "all 200ms ease",
                  }}
                >
                  {unlockSending ? "Sending..." : "Send Unlock Request"}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{
                  display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)",
                  marginBottom: "6px", letterSpacing: "0.03em",
                }}>EMAIL ADDRESS</label>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                    color: "var(--text-muted)", pointerEvents: "none",
                  }}><MailIcon /></div>
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    style={{ ...inputBase, paddingLeft: "44px" }}
                    onFocus={inputFocus} onBlur={inputBlur}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{
                    fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.03em",
                  }}>PASSWORD</label>
                  <button type="button" onClick={() => setShowForgot(true)}
                    style={{
                      background: "none", border: "none", color: "var(--color-primary)",
                      fontSize: "12px", fontWeight: 600, cursor: "pointer", padding: 0,
                    }}
                  >Forgot?</button>
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                    color: "var(--text-muted)", pointerEvents: "none",
                  }}><LockIcon /></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handlePasswordKeyDown}
                    placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                    autoComplete="current-password"
                    style={{ ...inputBase, paddingLeft: "44px", paddingRight: "44px" }}
                    onFocus={inputFocus} onBlur={inputBlur}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", color: "var(--text-muted)",
                      cursor: "pointer", padding: "4px",
                      display: "flex", alignItems: "center",
                    }}
                  >{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                </div>
                {capsLockOn && (
                  <div style={{
                    fontSize: "12px", color: "#F59E0B", marginTop: "6px",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}>
                    <AlertTriangleIcon /> Caps Lock is on
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Remember me</span>
                </label>
              </div>

              <button type="submit" disabled={authLoading}
                style={{
                  width: "100%", padding: "13px",
                  borderRadius: "10px", border: "none",
                  background: authLoading ? "var(--color-primary)" : "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover, #4338CA) 100%)",
                  color: "#fff", fontWeight: 700, fontSize: "14px",
                  cursor: authLoading ? "not-allowed" : "pointer",
                  opacity: authLoading ? 0.7 : 1,
                  boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
                  transition: "all 200ms ease",
                  letterSpacing: "0.02em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
                onMouseEnter={(e) => { if (!authLoading) { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 6px 20px rgba(79,70,229,0.4)"; } }}
                onMouseLeave={(e) => { if (!authLoading) { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 14px rgba(79,70,229,0.35)"; } }}
              >
                {authLoading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                    Signing in...
                  </>
                ) : "Sign In"}
              </button>
            </form>

            <div style={{
              marginTop: "20px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)",
            }}>
              <p style={{ margin: 0, marginBottom: "4px", lineHeight: 1.6 }}>
                Need help signing in?<br/>Contact Administrator
              </p>
              <a href={`mailto:${APP_CONFIG.ADMIN_EMAIL}`} style={{
                color: "var(--color-primary)", textDecoration: "none", fontWeight: 700,
                display: "inline-flex", alignItems: "center", gap: "6px",
              }}>
                <MailIcon /> {APP_CONFIG.ADMIN_EMAIL}
              </a>
            </div>

            <div style={{
              marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)",
            }}>
              Don't have an account?{" "}
              <Link to="/register" style={{
                color: "var(--color-primary)", textDecoration: "none", fontWeight: 700,
              }}>Create one</Link>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: "28px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--text-primary)", margin: 0 }}>Reset Password</h2>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.5 }}>
                Enter your email and we'll send you instructions to reset your password.
              </p>
            </div>

            {error && (
              <div className={shakeError ? "shake" : ""} style={{
                display: "flex", alignItems: "flex-start", gap: "10px",
                background: "var(--color-danger-container, rgba(239,68,68,0.1))",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "var(--color-danger, #EF4444)",
                padding: "12px 14px", borderRadius: "10px",
                fontSize: "13px", lineHeight: 1.5, marginBottom: "16px",
              }}>
                <div style={{ flexShrink: 0, marginTop: "2px", color: "var(--color-danger)" }}><AlertTriangleIcon /></div>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: "10px",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "var(--color-tertiary, #10B981)",
                padding: "12px 14px", borderRadius: "10px",
                fontSize: "13px", lineHeight: 1.5, marginBottom: "16px",
              }}>
                <div style={{ flexShrink: 0, marginTop: "2px" }}><CheckCircleIcon /></div>
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {cooldownRemaining > 0 && (
                <div role="status" aria-live="polite" style={{
                  fontSize: "13px", color: "var(--text-secondary)", textAlign: "center",
                }}>
                  {`You can request another reset email in ${cooldownRemaining} seconds.`}
                </div>
              )}
              <div>
                <label style={{
                  display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)",
                  marginBottom: "6px", letterSpacing: "0.03em",
                }}>EMAIL ADDRESS</label>
                <input type="email" value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{ ...inputBase }}
                  onFocus={inputFocus} onBlur={inputBlur}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button type="button" onClick={() => setShowForgot(false)}
                  style={{
                    flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)",
                    background: "transparent", color: "var(--text-secondary)",
                    fontWeight: 600, fontSize: "13px", cursor: "pointer",
                    transition: "all 200ms ease", fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={(e) => e.target.style.background = "var(--border-color)"}
                  onMouseLeave={(e) => e.target.style.background = "transparent"}
                >Back</button>
                <button type="submit" disabled={forgotLoading || cooldownRemaining > 0}
                  style={{
                    flex: 1, padding: "12px", borderRadius: "10px", border: "none",
                    background: forgotLoading || cooldownRemaining > 0 ? "var(--color-primary)" : "linear-gradient(135deg, var(--color-primary) 0%, #4338CA 100%)",
                    color: "#fff", fontWeight: 700, fontSize: "13px",
                    cursor: forgotLoading || cooldownRemaining > 0 ? "not-allowed" : "pointer",
                    opacity: forgotLoading || cooldownRemaining > 0 ? 0.7 : 1,
                    transition: "all 200ms ease", fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={(e) => { if (!(forgotLoading || cooldownRemaining > 0)) { e.target.style.transform = "translateY(-1px)"; }}}
                  onMouseLeave={(e) => { if (!(forgotLoading || cooldownRemaining > 0)) { e.target.style.transform = "translateY(0)"; }}}
                >
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          .slide-in > div { padding: 24px 16px; }
        }
      `}</style>
    </div>
  );
}
