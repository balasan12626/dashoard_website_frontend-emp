import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle' }}><polyline points="20 6 9 17 4 12"/></svg>;
}
function XIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle' }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

export default function Profile() {
  const { currentUser, profile, logout, hasMpin } = useAuth();
  const navigate = useNavigate();
  const [userCode, setUserCode] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('authUser') || '{}');
    setUserCode(stored?.user_code || stored?.employee_code || "");
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "linear-gradient(135deg, #050816 0%, #0B1020 100%)",
      fontFamily: "'Outfit', sans-serif", padding: "40px"
    }}>
      <div style={{
        width: "100%", maxWidth: 600, margin: "0 auto"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)",
          borderRadius: 16, padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 800, color: "#fff"
            }}>
              {(profile?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{profile?.name || "User"}</h1>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>{profile?.email || ""}</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 8, fontSize: 14 }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>User ID</span>
              <span style={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>{currentUser?.id}</span>
              {userCode && (
                <>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Code</span>
                  <span style={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>{userCode}</span>
                </>
              )}
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Email</span>
              <span style={{ color: "var(--text-muted)" }}>{currentUser?.email || profile?.email || "-"}</span>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Name</span>
              <span style={{ color: "var(--text-muted)" }}>{currentUser?.name || profile?.name || "-"}</span>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Phone</span>
              <span style={{ color: "var(--text-muted)" }}>{currentUser?.phone || "-"}</span>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Account Type</span>
              <span>
                <span style={{
                  padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                  background: currentUser?.userType === 'admin' ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                  color: currentUser?.userType === 'admin' ? "#818cf8" : "var(--text-muted)",
                  border: currentUser?.userType === 'admin' ? "1px solid rgba(99,102,241,0.3)" : "1px solid var(--border-color)"
                }}>
                  {(currentUser?.userType || "employee").toUpperCase()}
                </span>
              </span>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Status</span>
              <span>
                <span style={{
                  padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                  background: currentUser?.status === 'active' ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                  color: currentUser?.status === 'active' ? "#34d399" : "#fbbf24"
                }}>
                  {(currentUser?.status || "pending").toUpperCase()}
                </span>
              </span>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Email Verified</span>
              <span style={{ color: currentUser?.is_email_verified ? "#34d399" : "#fca5a5" }}>
                {currentUser?.is_email_verified ? <><CheckIcon /> Yes</> : <><XIcon /> No</>}
              </span>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>MPIN</span>
              <span style={{ color: hasMpin ? "#34d399" : "#fca5a5" }}>
                {hasMpin ? <><CheckIcon /> Active</> : <><XIcon /> Not Set</>}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <Link to="/change-password" style={{
              padding: "10px 20px", borderRadius: 8,
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              border: "none", color: "#fff", fontWeight: 700, fontSize: 13,
              textDecoration: "none", boxShadow: "0 8px 24px rgba(99,102,241,0.3)"
            }}>Change Password</Link>
            {!hasMpin && (
              <Link to="/create-mpin" style={{
                padding: "10px 20px", borderRadius: 8,
                background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
                color: "#6ee7b7", fontWeight: 700, fontSize: 13, textDecoration: "none",
              }}>Set MPIN</Link>
            )}
            <Link to="/tickets" style={{
              padding: "10px 20px", borderRadius: 8,
              background: "var(--border-color)", border: "1px solid rgba(255,255,255,0.15)",
              color: "var(--text-muted)", fontWeight: 600, fontSize: 13, textDecoration: "none"
            }}>Dashboard</Link>
            <button onClick={handleLogout} style={{
              padding: "10px 20px", borderRadius: 8,
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5", fontWeight: 700, fontSize: 13, cursor: "pointer"
            }}>Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
