import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createTicket, searchUsersForShare } from "../services/ticketApi";

function TicketIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle' }}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M9 9h.01"/><path d="M15 9h.01"/><path d="M9 15h.01"/><path d="M15 15h.01"/><path d="M9 12h.01"/><path d="M15 12h.01"/></svg>;
}

export default function CreateTicket() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: "", description: "", category: "general", priority: "medium", visibility: "private", assignedTo: "" });
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userSearch.length < 1) { setUsers([]); return; }
    const timer = setTimeout(async () => {
      try { const json = await searchUsersForShare(userSearch); setUsers(json.data || []); setShowUserDropdown(true); } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) { setError("Subject and description are required."); return; }
    setSaving(true); setError("");
    try {
      const data = { ...form };
      if (!data.assignedTo) delete data.assignedTo;
      const json = await createTicket(data);
      navigate(`/tickets/${json.data.id}`);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const selectUser = (u) => {
    setForm(p => ({ ...p, assignedTo: u.id }));
    setUserSearch(u.name || u.email);
    setShowUserDropdown(false);
  };

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, var(--bg-page) 0%, var(--bg-deeper) 100%)", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", padding: "30px 40px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}><TicketIcon /> Create New Ticket</h1>
        <Link to="/tickets" style={{ padding: "10px 20px", borderRadius: 8, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>â† Back to Tickets</Link>
      </header>

      {error && <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: 14, borderRadius: 10, fontSize: 13, marginBottom: 20 }}>âš ï¸ {error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 700 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Subject *</label>
          <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Brief summary of your issue" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Description *</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Detailed description..." rows={6} style={{ ...inputStyle, resize: "vertical" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 18 }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="general">General</option><option value="bug">Bug</option><option value="feature_request">Feature Request</option><option value="hr">HR</option><option value="it_support">IT Support</option><option value="finance">Finance</option><option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Priority</label>
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Visibility</label>
            <select value={form.visibility} onChange={e => setForm(p => ({ ...p, visibility: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="private">Private (Only you + assigned)</option><option value="public">Public (Everyone can see)</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 24, position: "relative" }}>
          <label style={labelStyle}>Assign to (optional — leave empty to notify all admins)</label>
          <input value={userSearch} onChange={e => { setUserSearch(e.target.value); if (!e.target.value) setForm(p => ({ ...p, assignedTo: "" })); }} placeholder="Search by name or email..." style={inputStyle} onFocus={() => users.length > 0 && setShowUserDropdown(true)} />
          {showUserDropdown && users.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--bg-elevated)", border: "1px solid var(--border-color)", borderRadius: 8, maxHeight: 200, overflowY: "auto", zIndex: 50, marginTop: 4 }}>
              {users.map(u => (
                <div key={u.id} onClick={() => selectUser(u)} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>{u.email} Â· {u.role_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" disabled={saving} style={{ padding: "12px 28px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}
