import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { verifyMpinApi } from "../services/authApi";

function LockIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}

function AlertTriangleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

export default function MpinPopup({ onClose: externalOnClose }) {
  const { onMpinVerified, showMpinPopup, setShowMpinPopup, logout } = useAuth();
  const [mpin, setMpin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    if (showMpinPopup && inputRef.current) {
      inputRef.current.focus();
      setMpin("");
      setError("");
    }
  }, [showMpinPopup]);

  const handleClose = () => {
    setShowMpinPopup(false);
    setMpin("");
    setError("");
    setAttempts(0);
    if (externalOnClose) externalOnClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mpin.length !== 6 || !/^\d{6}$/.test(mpin)) {
      setError("Enter a valid 6-digit MPIN.");
      return;
    }

    setLoading(true);
    try {
      await verifyMpinApi(mpin);
      setMpin("");
      setError("");
      setAttempts(0);
      onMpinVerified();
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setError("Too many incorrect attempts. Redirecting to login...");
        setTimeout(() => {
          logout().then(() => {
            window.location.href = "/login?reason=mpin_blocked";
          }).catch(() => {
            window.location.href = "/login?reason=mpin_blocked";
          });
        }, 1000);
      } else {
        setError(`Incorrect MPIN. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
        setMpin("");
        if (inputRef.current) inputRef.current.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!showMpinPopup) return null;

  const overlayStyle = {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  const cardStyle = {
    background: "var(--bg-card, #0f1322)", borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
    padding: "36px 32px", width: "100%", maxWidth: 380,
    textAlign: "center",
  };

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div onClick={e => e.stopPropagation()} style={cardStyle}>
        <div style={{
          width: 56, height: 56, margin: "0 auto 16px",
          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
          borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff",
        }}><LockIcon /></div>

        <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          Verify Your Identity
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, marginBottom: 20 }}>
          Enter your MPIN to continue this action.
        </p>

        {error && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#fca5a5", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16,
          }}>
            <AlertTriangleIcon /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input ref={inputRef} type="password" value={mpin}
            onChange={e => setMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022"
            maxLength={6} inputMode="numeric"
            autoComplete="off"
            style={{
              width: "100%", padding: "14px", borderRadius: 12,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--text-primary)", fontSize: 20,
              textAlign: "center", letterSpacing: 12,
              outline: "none", boxSizing: "border-box",
            }}
            onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
          />
          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: 12, marginTop: 16, borderRadius: 10, border: "none",
              background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#fff", fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >{loading ? "Verifying..." : "Verify MPIN"}</button>
        </form>

        <button onClick={handleClose}
          style={{
            marginTop: 16, background: "none", border: "none",
            color: "var(--text-secondary)", fontSize: 12, cursor: "pointer",
          }}
        >Cancel</button>
      </div>
    </div>
  );
}
