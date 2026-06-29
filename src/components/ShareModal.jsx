import React, { useState, useEffect, useMemo } from "react";
import { searchUsersForShare, shareTicket, listAllUsersForShare } from "../services/ticketApi";

export default function ShareModal({ ticketId, ticketSubject, onClose, onShared }) {
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const json = await listAllUsersForShare();
        setAllUsers(json.data || []);
      } catch { setAllUsers([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const users = useMemo(() => {
    if (!search.trim()) return allUsers;
    const q = search.toLowerCase();
    return allUsers.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [search, allUsers]);

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
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Share Ticket</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 20, cursor: "pointer" }}>x</button>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: "0 0 16px" }}>Sharing: <strong style={{ color: "var(--text-primary)" }}>{ticketSubject}</strong></p>

        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name or email..." autoFocus
          style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />

        {error && <div style={{ color: "#fca5a5", fontSize: 13, marginBottom: 8 }}>{error}</div>}

        <div style={{ flex: 1, overflowY: "auto", maxHeight: 400 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text-secondary)" }}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text-secondary)" }}>{search ? "No users found" : "No users available"}</div>
          ) : (
            users.map(u => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid var(--border-color)", cursor: "pointer", borderRadius: 6, transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onClick={() => handleShare(u.id)}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>{u.email} <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: u.user_type === 'admin' ? "rgba(99,102,241,0.15)" : "rgba(16,185,129,0.15)", color: u.user_type === 'admin' ? "#818cf8" : "#34d399", marginLeft: 6 }}>{u.role_name || u.user_type}</span></div>
                </div>
                <button onClick={e => { e.stopPropagation(); handleShare(u.id); }} disabled={sharing === u.id}
                  style={{ padding: "6px 14px", borderRadius: 6, background: sharing === u.id ? "rgba(99,102,241,0.3)" : "#6366f1", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: sharing === u.id ? "wait" : "pointer" }}>
                  {sharing === u.id ? "..." : "Share"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
