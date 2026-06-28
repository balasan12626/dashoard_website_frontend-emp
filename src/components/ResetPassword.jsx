import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordApi } from "../services/authApi";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !token || !newPassword || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi(token, email, newPassword);
      setMessage("Password reset successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #050816 0%, #0B1020 100%)",
      fontFamily: "'Outfit', sans-serif", padding: "20px"
    }}>
      <div style={{ width: "100%", maxWidth: 420, animation: "slideIn 0.4s ease-out" }}>
        <div style={{ marginBottom: 30, textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Reset Password</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>Enter your new password</p>
        </div>

        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5", padding: 14, borderRadius: 10, fontSize: 13, marginBottom: 20,
            display: "flex", alignItems: "flex-start", gap: 10
          }}><span>âš ï¸</span><span>{error}</span></div>
        )}
        {message && (
          <div style={{
            background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#6ee7b7", padding: 14, borderRadius: 10, fontSize: 13, marginBottom: 20,
            display: "flex", alignItems: "flex-start", gap: 10
          }}><span>âœ“</span><span>{message}</span></div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Email</label>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                width: "100%", padding: "11px 13px", borderRadius: 8,
                background: "var(--border-color)", border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box", caretColor: "#6366f1"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Reset Token</label>
            <input
              type="text" value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token from email"
              style={{
                width: "100%", padding: "11px 13px", borderRadius: 8,
                background: "var(--border-color)", border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box", caretColor: "#6366f1"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>New Password</label>
            <input
              type="password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              style={{
                width: "100%", padding: "11px 13px", borderRadius: 8,
                background: "var(--border-color)", border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box", caretColor: "#6366f1"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Confirm Password</label>
            <input
              type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              style={{
                width: "100%", padding: "11px 13px", borderRadius: 8,
                background: "var(--border-color)", border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box", caretColor: "#6366f1"
              }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: 12, borderRadius: 8,
              background: loading ? "rgba(99, 102, 241, 0.5)" : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              border: "none", color: "#ffffff", fontWeight: 700, fontSize: 13,
              cursor: loading ? "not-allowed" : "pointer", marginTop: 10,
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.25)", textTransform: "uppercase", letterSpacing: 0.5
            }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            onClick={() => navigate("/login")}
            style={{ background: "none", border: "none", color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
          >
            â† Back to Login
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: rgba(255, 255, 255, 0.4); }
      `}</style>
    </div>
  );
}
