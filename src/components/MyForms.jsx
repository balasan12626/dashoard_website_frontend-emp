import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMyForms } from "../services/formApi";

export default function MyForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadForms = useCallback(async () => {
    setLoading(true);
    try {
      const json = await getMyForms();
      setForms(json.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadForms(); }, [loadForms]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, var(--bg-page) 0%, var(--bg-deeper) 100%)", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", padding: "30px 40px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>ðŸ“ My Forms</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: "4px 0 0" }}>Forms assigned to you by admin</p>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>Loading forms...</div>
      ) : forms.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>ðŸ“‹</div>
          <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>No forms assigned yet</p>
          <p style={{ fontSize: 13, margin: 0 }}>When admin assigns you a form, it will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {forms.map(a => (
            <div key={a.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{a.form_title}</h3>
                  {a.form_description && <p style={{ color: "var(--text-secondary)", fontSize: 12, margin: 0, lineHeight: 1.4 }}>{a.form_description}</p>}
                </div>
                <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "rgba(245,158,11,0.12)", color: "#fbbf24" }}>PENDING</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 12 }}>
                <span>Assigned: {new Date(a.created_at).toLocaleDateString()}</span>
                {a.expires_at && <span style={{ marginLeft: 12, color: "#f59e0b" }}>Expires: {new Date(a.expires_at).toLocaleDateString()}</span>}
              </div>
              <Link to={`/my-forms/${a.id}/fill`} style={{ display: "block", padding: "10px 16px", borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", fontWeight: 700, fontSize: 13, textAlign: "center", textDecoration: "none" }}>
                Fill Form â†’
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
