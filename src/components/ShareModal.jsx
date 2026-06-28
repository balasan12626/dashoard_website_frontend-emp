import React, { useState, useEffect } from "react";
import { searchUsersForShare, shareTicket } from "../services/ticketApi";

function LinkIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle' }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}
function CloseIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle' }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

export default function ShareModal({ ticketId, ticketSubject, onClose, onShared }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(null);

  useEffect(() => {
    if (search.length < 1) { setUsers([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const json = await searchUsersForShare(search);
        setUsers(json.data || []);
      } catch { }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleShare = async (userId) => {
    setSharing(userId); setError("");
    try {
      await shareTicket(ticketId, { sharedWith: userId, permission: "view" });
      onShared();
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSharing(null); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 30, width: 480, maxWidth: "90vw", maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}><LinkIcon /> Share Ticket</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 20, cursor: "pointer" }}><CloseIcon /></button>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: "0 0 16px" }}>Sharing: <strong style={{ color: "var(--text-primary)" }}>{ticketSubject}</strong></p>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}><SearchIcon /></span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name or email..." autoFocus
            style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 8, border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        {error && <div style={{ color: "#fca5a5", fontSize: 13, marginBottom: 8 }}>{error}</div>}
        <div style={{ flex: 1, overflowY: "auto", maxHeight: 400 }}>
          {loading ? (<div style={{ textAlign: "center", padding: 20, color: "var(--text-secondary)" }}>Searching...</div>)
          : users.length === 0 ? (<div style={{ textAlign: "center", padding: 20, color: "var(--text-secondary)" }}>{search ? "No users found" : "Type to search users"}</div>)
          : users.map(u => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>{u.email} · {u.role_name}</div>
              </div>
              <button onClick={() => handleShare(u.id)} disabled={sharing === u.id}
                style={{ padding: "6px 14px", borderRadius: 6, background: sharing === u.id ? "rgba(99,102,241,0.3)" : "#6366f1", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: sharing === u.id ? "wait" : "pointer" }}>
                {sharing === u.id ? "..." : "Share"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
