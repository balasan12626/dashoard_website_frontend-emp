import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listTickets, getTicketStats, deleteTicket } from "../services/ticketApi";

function TicketIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle' }}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M9 9h.01"/><path d="M15 9h.01"/><path d="M9 15h.01"/><path d="M15 15h.01"/><path d="M9 12h.01"/><path d="M15 12h.01"/></svg>;
}
function LockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}

const statusColors = {
  open: { bg: "rgba(245,158,11,0.12)", color: "#fbbf24" },
  in_progress: { bg: "rgba(99,102,241,0.12)", color: "#818cf8" },
  resolved: { bg: "rgba(16,185,129,0.12)", color: "#34d399" },
  closed: { bg: "rgba(148,163,184,0.12)", color: "var(--text-secondary)" },
  reopened: { bg: "rgba(239,68,68,0.12)", color: "#fca5a5" },
};
const priorityColors = {
  low: { bg: "rgba(148,163,184,0.12)", color: "var(--text-secondary)" },
  medium: { bg: "rgba(245,158,11,0.12)", color: "#fbbf24" },
  high: { bg: "rgba(249,115,22,0.12)", color: "#fb923c" },
  urgent: { bg: "rgba(239,68,68,0.12)", color: "#fca5a5" },
};

export default function TicketList() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", category: "", priority: "", search: "" });
  const [statusMsg, setStatusMsg] = useState("");
  const [loadError, setLoadError] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const params = { limit: 50, offset: 0 };
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      const json = await listTickets(params);
      setTickets(json.data || []);
    } catch (err) { setLoadError(err.message || "Failed to load tickets"); }
    finally { setLoading(false); }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try { const json = await getTicketStats(); setStats(json.data); } catch {}
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);
  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    if (!statusMsg) return;
    const t = setTimeout(() => setStatusMsg(""), 4000);
    return () => clearTimeout(t);
  }, [statusMsg]);

  const handleDelete = async (ticket) => {
    if (!window.confirm(`Delete ticket "${ticket.subject}"?`)) return;
    try {
      await deleteTicket(ticket.id);
      setStatusMsg("Ticket deleted.");
      loadTickets();
      loadStats();
    } catch (err) { setStatusMsg("Error: " + err.message); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, var(--bg-page) 0%, var(--bg-deeper) 100%)", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", padding: "30px 40px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}><TicketIcon /> {currentUser?.userType === 'employee' ? 'My Tickets' : 'All Tickets'}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: "4px 0 0" }}>{currentUser?.userType === 'employee' ? 'Tickets created by you or assigned to you' : 'Raise and track support requests'}</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/tickets/new" style={{ padding: "10px 20px", borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>+ New Ticket</Link>
        </div>
      </header>

      {statusMsg && (
        <div style={{ background: statusMsg.startsWith("Error") ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", border: statusMsg.startsWith("Error") ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(16,185,129,0.3)", color: statusMsg.startsWith("Error") ? "#fca5a5" : "#6ee7b7", padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 20 }}>
          {statusMsg}
        </div>
      )}

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total", val: stats.total, color: "#6366f1" },
            { label: "Open", val: stats.open_count, color: "#f59e0b" },
            { label: "In Progress", val: stats.in_progress_count, color: "#818cf8" },
            { label: "Resolved", val: stats.resolved_count, color: "#10b981" },
            { label: "Closed", val: stats.closed_count, color: "var(--text-secondary)" },
            { label: "Urgent", val: stats.urgent_count, color: "#ef4444" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(255,255,255,0.06)`, borderLeft: `4px solid ${s.color}`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input type="text" value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} placeholder="ðŸ” Search tickets..." style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "8px 14px", color: "var(--text-primary)", fontSize: 13, outline: "none", width: 250 }} />
        <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} style={{ background: "var(--bg-page)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none" }}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="reopened">Reopened</option>
        </select>
        <select value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))} style={{ background: "var(--bg-page)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none" }}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <select value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))} style={{ background: "var(--bg-page)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none" }}>
          <option value="">All Categories</option>
          <option value="general">General</option>
          <option value="bug">Bug</option>
          <option value="feature_request">Feature Request</option>
          <option value="hr">HR</option>
          <option value="it_support">IT Support</option>
          <option value="finance">Finance</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loadError && (
        <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: 14, borderRadius: 10, fontSize: 14, marginBottom: 20, textAlign: "center" }}>
          {loadError}
        </div>
      )}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>No tickets found. <Link to="/tickets/new" style={{ color: "#818cf8" }}>Create one</Link></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tickets.map(t => {
            const sc = statusColors[t.status] || statusColors.open;
            const pc = priorityColors[t.priority] || priorityColors.medium;
            return (
              <div key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>{t.status.replace("_", " ").toUpperCase()}</span>
                      <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: pc.bg, color: pc.color }}>{t.priority.toUpperCase()}</span>
                      <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: t.visibility === "public" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", color: t.visibility === "public" ? "#34d399" : "#fbbf24" }}>{t.visibility === "public" ? "ðŸŒ Public" : <><LockIcon /> Private</>}</span>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{t.category.replace("_", " ")}</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{t.subject}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 600 }}>{t.description}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>
                      by {t.created_by_name || "Unknown"} {t.assigned_to_name && <>→ assigned to <span style={{ color: "#818cf8" }}>{t.assigned_to_name}</span></>}
                      {" Â· "}{t.reply_count || 0} replies
                      {" Â· "}{new Date(t.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {(t.created_by === currentUser?.id || currentUser?.userType === "admin") && (
                      <button onClick={e => { e.stopPropagation(); handleDelete(t); }} style={{ padding: "5px 10px", borderRadius: 6, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 11, cursor: "pointer" }}>Delete</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
