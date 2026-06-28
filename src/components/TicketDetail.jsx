import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTicket, updateTicket, addReply, deleteReply, listShares, unshareTicket } from "../services/ticketApi";
import ShareModal from "./ShareModal";

const statusColors = { open: { bg: "rgba(245,158,11,0.12)", color: "#fbbf24" }, in_progress: { bg: "rgba(99,102,241,0.12)", color: "#818cf8" }, resolved: { bg: "rgba(16,185,129,0.12)", color: "#34d399" }, closed: { bg: "rgba(148,163,184,0.12)", color: "var(--text-secondary)" }, reopened: { bg: "rgba(239,68,68,0.12)", color: "#fca5a5" } };
const priorityColors = { low: { bg: "rgba(148,163,184,0.12)", color: "var(--text-secondary)" }, medium: { bg: "rgba(245,158,11,0.12)", color: "#fbbf24" }, high: { bg: "rgba(249,115,22,0.12)", color: "#fb923c" }, urgent: { bg: "rgba(239,68,68,0.12)", color: "#fca5a5" } };

export default function TicketDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replyInternal, setReplyInternal] = useState(false);
  const [replying, setReplying] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [shares, setShares] = useState([]);
  const [statusRemarks, setStatusRemarks] = useState("");
  const [showRemarksFor, setShowRemarksFor] = useState(null);

  const loadTicket = useCallback(async () => {
    setLoading(true);
    try {
      const json = await getTicket(id);
      setTicket(json.data);
      setShares(json.data.shares || []);
    } catch (err) { setStatusMsg("Error: " + err.message); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadTicket(); }, [loadTicket]);
  useEffect(() => { if (!statusMsg) return; const t = setTimeout(() => setStatusMsg(""), 4000); return () => clearTimeout(t); }, [statusMsg]);

  const handleStatusChange = async (newStatus) => {
    try {
      const payload = { status: newStatus };
      if (statusRemarks.trim()) payload.status_remarks = statusRemarks.trim();
      await updateTicket(id, payload);
      setStatusRemarks(""); setShowRemarksFor(null);
      setStatusMsg(`Status changed to ${newStatus}`); loadTicket();
    }
    catch (err) { setStatusMsg("Error: " + err.message); }
  };

  const openRemarksDialog = (status) => {
    setShowRemarksFor(status);
    setStatusRemarks("");
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await addReply(id, { message: replyText, isInternal: replyInternal });
      setReplyText(""); setReplyInternal(false); setStatusMsg("Reply sent!"); loadTicket();
    } catch (err) { setStatusMsg("Error: " + err.message); }
    finally { setReplying(false); }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Delete this reply?")) return;
    try { await deleteReply(id, replyId); setStatusMsg("Reply deleted."); loadTicket(); }
    catch (err) { setStatusMsg("Error: " + err.message); }
  };

  const handleUnshare = async (userId) => {
    try { await unshareTicket(id, userId); setStatusMsg("Share removed."); loadTicket(); }
    catch (err) { setStatusMsg("Error: " + err.message); }
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--bg-page)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading ticket...</div>;
  if (!ticket) return <div style={{ minHeight: "100vh", background: "var(--bg-page)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>Ticket not found</div>;

  const sc = statusColors[ticket.status] || statusColors.open;
  const pc = priorityColors[ticket.priority] || priorityColors.medium;
  const isStaff = currentUser?.userType === "admin";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, var(--bg-page) 0%, var(--bg-deeper) 100%)", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", padding: "30px 40px" }}>
      {showShare && <ShareModal ticketId={id} ticketSubject={ticket.subject} onClose={() => setShowShare(false)} onShared={loadTicket} />}

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Link to="/tickets" style={{ color: "#818cf8", fontSize: 14, textDecoration: "none", fontWeight: 600 }}>â† Back to Tickets</Link>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowShare(true)} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>ðŸ”— Share</button>
        </div>
      </header>

      {statusMsg && <div style={{ background: statusMsg.startsWith("Error") ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", border: statusMsg.startsWith("Error") ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(16,185,129,0.3)", color: statusMsg.startsWith("Error") ? "#fca5a5" : "#6ee7b7", padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 20 }}>{statusMsg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
        <div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 25, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ padding: "4px 10px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.color }}>{ticket.status.replace("_", " ").toUpperCase()}</span>
              <span style={{ padding: "4px 10px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: pc.bg, color: pc.color }}>{ticket.priority.toUpperCase()}</span>
              <span style={{ padding: "4px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: ticket.visibility === "public" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", color: ticket.visibility === "public" ? "#34d399" : "#fbbf24" }}>{ticket.visibility === "public" ? "ðŸŒ Public" : "ðŸ”’ Private"}</span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", alignSelf: "center" }}>{ticket.category.replace("_", " ")}</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>{ticket.subject}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>{ticket.description}</p>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 12 }}>Created by {ticket.created_by_name} Â· {new Date(ticket.created_at).toLocaleString()}</div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 25, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px" }}>ðŸ’¬ Replies ({ticket.replies?.length || 0})</h3>
            {ticket.replies?.length === 0 && <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>No replies yet.</p>}
            {ticket.replies?.map(r => (
              <div key={r.id} style={{ padding: "12px 16px", background: r.is_internal ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.02)", border: r.is_internal ? "1px solid rgba(245,158,11,0.15)" : "1px solid rgba(255,255,255,0.04)", borderRadius: 10, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {r.user_name} {r.user_type === "admin" && <span style={{ fontSize: 10, color: "#ef4444", marginLeft: 4 }}>ADMIN</span>}
                    {r.is_internal && <span style={{ fontSize: 10, color: "#f59e0b", marginLeft: 4 }}>INTERNAL</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{new Date(r.created_at).toLocaleString()}</span>
                    {(r.user_id === currentUser?.id || currentUser?.userType === "admin") && (
                      <button onClick={() => handleDeleteReply(r.id)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 11, cursor: "pointer" }}>âœ•</button>
                    )}
                  </div>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0, whiteSpace: "pre-wrap" }}>{r.message}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleReply} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 25 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 12px" }}>âœï¸ Add Reply</h3>
            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." rows={4} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", marginBottom: 10 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {isStaff && (
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
                  <input type="checkbox" checked={replyInternal} onChange={e => setReplyInternal(e.target.checked)} style={{ accentColor: "#6366f1" }} />
                  Internal note (only visible to staff)
                </label>
              )}
              <button type="submit" disabled={replying || !replyText.trim()} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: replying ? "not-allowed" : "pointer", opacity: replying || !replyText.trim() ? 0.6 : 1 }}>
                {replying ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </form>
        </div>

        <div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 12px" }}>ðŸ“‹ Details</h3>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 8 }}>
              <div><span style={{ color: "var(--text-secondary)" }}>Created:</span> {ticket.created_by_name}</div>
              <div><span style={{ color: "var(--text-secondary)" }}>Assigned:</span> {ticket.assigned_to_name || "All admins"}</div>
              <div><span style={{ color: "var(--text-secondary)" }}>Updated:</span> {new Date(ticket.updated_at).toLocaleDateString()}</div>
              {ticket.resolved_at && <div><span style={{ color: "var(--text-secondary)" }}>Resolved:</span> {new Date(ticket.resolved_at).toLocaleDateString()}</div>}
              {ticket.status_remarks && <div style={{ marginTop: 4, padding: "8px 10px", background: "rgba(245,158,11,0.08)", borderRadius: 6, border: "1px solid rgba(245,158,11,0.15)" }}><span style={{ color: "#fbbf24", fontSize: 11, fontWeight: 700 }}>Remarks:</span><p style={{ color: "var(--text-muted)", fontSize: 12, margin: "4px 0 0", whiteSpace: "pre-wrap" }}>{ticket.status_remarks}</p></div>}
            </div>
          </div>

          {ticket.statusHistory && ticket.statusHistory.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 12px" }}>ðŸ“‹ Status History</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {ticket.statusHistory.map((h, i) => {
                  const sc = statusColors[h.new_status] || statusColors.open;
                  return (
                    <div key={h.id} style={{ display: "flex", gap: 12, paddingBottom: i < ticket.statusHistory.length - 1 ? 12 : 0, borderBottom: i < ticket.statusHistory.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc.color, marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: sc.color }}>{h.new_status?.replace("_", " ").toUpperCase()}</span>
                          <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>{new Date(h.created_at).toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>by {h.changed_by_name}</div>
                        {h.old_status && <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>from {h.old_status}</div>}
                        {h.remarks && <div style={{ fontSize: 11, color: "#fbbf24", marginTop: 2, fontStyle: "italic" }}> "{h.remarks}"</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(ticket.created_by === currentUser?.id || isStaff) && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 12px" }}>âš¡ Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ticket.status !== "in_progress" && <button onClick={() => handleStatusChange("in_progress")} style={{ padding: "8px 14px", borderRadius: 6, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center" }}>â–¶ Mark In Progress</button>}
                {ticket.status !== "resolved" && <button onClick={() => openRemarksDialog("resolved")} style={{ padding: "8px 14px", borderRadius: 6, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center" }}>âœ… Resolve</button>}
                {ticket.status !== "closed" && <button onClick={() => openRemarksDialog("closed")} style={{ padding: "8px 14px", borderRadius: 6, background: "rgba(148,163,184,0.15)", border: "1px solid rgba(148,163,184,0.3)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center" }}>ðŸ”’ Close</button>}
                {ticket.status !== "open" && <button onClick={() => handleStatusChange("open")} style={{ padding: "8px 14px", borderRadius: 6, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center" }}>ðŸ”„ Reopen</button>}
              </div>
              {showRemarksFor && (
                <div style={{ marginTop: 12, padding: 12, background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid var(--border-color)" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", margin: "0 0 8px" }}>Remarks (optional)</p>
                  <textarea value={statusRemarks} onChange={e => setStatusRemarks(e.target.value)} placeholder="Add notes about this status change..." rows={3} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", marginBottom: 8 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleStatusChange(showRemarksFor)} style={{ padding: "6px 14px", borderRadius: 6, background: showRemarksFor === "resolved" ? "rgba(16,185,129,0.3)" : "rgba(148,163,184,0.3)", color: "var(--text-primary)", fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none" }}>Confirm {showRemarksFor === "resolved" ? "Resolve" : "Close"}</button>
                    <button onClick={() => setShowRemarksFor(null)} style={{ padding: "6px 14px", borderRadius: 6, background: "var(--border-color)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 12px" }}>ðŸ”— Shared With ({shares.length})</h3>
            {shares.length === 0 ? <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>Not shared yet.</p> : shares.map(s => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize: 12 }}>
                  <div style={{ fontWeight: 600 }}>{s.shared_with_name}</div>
                  <div style={{ color: "var(--text-secondary)" }}>by {s.shared_by_name}</div>
                </div>
                <button onClick={() => handleUnshare(s.shared_with)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 11, cursor: "pointer" }}>âœ•</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
