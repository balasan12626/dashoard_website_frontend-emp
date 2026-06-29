import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createMpinApi } from "../services/authApi";

function LockIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}

function ShieldIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

function EyeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function EyeOffIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>;
}

function CheckCircleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}

function AlertTriangleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

export default function CreateMpin() {
  const [mpin, setMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [showMpin, setShowMpin] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { setHasMpin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (!stored) navigate('/login');
  }, [navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (mpin.length !== 6 || !/^\d{6}$/.test(mpin)) {
      setError("MPIN must be exactly 6 digits.");
      return;
    }
    if (mpin !== confirmMpin) {
      setError("MPIN and confirm MPIN do not match.");
      return;
    }

    setLoading(true);
    try {
      await createMpinApi(mpin);
      setMessage("MPIN created successfully!");
      setHasMpin(true);
      const stored = JSON.parse(localStorage.getItem('authUser') || '{}');
      localStorage.setItem('authUser', JSON.stringify({ ...stored, hasMpin: true }));
      setTimeout(() => navigate("/tickets"), 1500);
    } catch (err) {
      setError(err.message || "Failed to create MPIN");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    background: "var(--border-color)", border: "1px solid transparent",
    color: "var(--text-primary)", fontSize: 16, outline: "none",
    boxSizing: "border-box", transition: "all 0.2s",
    textAlign: "center", letterSpacing: "8px",
    caretColor: "#6366f1",
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "var(--bg-page)",
      fontFamily: "'Outfit', sans-serif",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 30%, rgba(79,70,229,0.12) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />
      <div style={{
        width: "100%", maxWidth: 420, padding: 30, position: "relative", zIndex: 1,
      }}>
        <div style={{
          background: "var(--bg-card)", borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          padding: "40px 32px",
        }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, margin: "0 auto 16px",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
            }}><LockIcon /></div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Create MPIN
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.5 }}>
              Set a 6-digit MPIN. This is mandatory for accessing the dashboard.
            </p>
          </div>

          {error && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5", padding: 14, borderRadius: 10, fontSize: 13, marginBottom: 20,
            }}>
              <div style={{ marginTop: 2, flexShrink: 0 }}><AlertTriangleIcon /></div>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
              color: "#6ee7b7", padding: 14, borderRadius: 10, fontSize: 13, marginBottom: 20,
            }}>
              <div style={{ marginTop: 2, flexShrink: 0 }}><CheckCircleIcon /></div>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              <ShieldIcon /><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>6-digit numeric code</span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: 0.5 }}>NEW MPIN</label>
              <div style={{ position: "relative" }}>
                <input type={showMpin ? "text" : "password"} value={mpin}
                  onChange={e => setMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022"
                  maxLength={6} inputMode="numeric"
                  style={inputBase}
                  onFocus={e => { e.target.style.background = "rgba(255,255,255,0.12)"; e.target.style.borderColor = "rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                  onBlur={e => { e.target.style.background = "var(--border-color)"; e.target.style.borderColor = "transparent"; e.target.style.boxShadow = "none"; }}
                  autoFocus
                />
                <button type="button" onClick={() => setShowMpin(!showMpin)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}>
                  {showMpin ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: 0.5 }}>CONFIRM MPIN</label>
              <input type={showMpin ? "text" : "password"} value={confirmMpin}
                onChange={e => setConfirmMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022"
                maxLength={6} inputMode="numeric"
                style={inputBase}
                onFocus={e => { e.target.style.background = "rgba(255,255,255,0.12)"; e.target.style.borderColor = "rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                onBlur={e => { e.target.style.background = "var(--border-color)"; e.target.style.borderColor = "transparent"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: "100%", padding: 12, borderRadius: 10, border: "none",
                background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                color: "#fff", fontWeight: 700, fontSize: 13, marginTop: 8,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
                transition: "all 0.2s",
              }}
            >{loading ? "Creating..." : "Create MPIN"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
