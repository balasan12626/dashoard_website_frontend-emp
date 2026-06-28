import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DynamicFormRenderer from "./FormBuilder/DynamicFormRenderer";
import { getAccessToken } from "../services/authApi";

function CheckCircleIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const FORM_BASE = `${BASE}/form-builder`;
const ASSIGN_BASE = `${BASE}/form-assignments`;

export default function FillAssignedForm() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const loadAssignment = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ASSIGN_BASE}/my-forms`, {
        headers: { 'Authorization': `Bearer ${getAccessToken()}` }
      });
      const json = await res.json();
      const found = (json.data || []).find(a => a.id === assignmentId);
      if (found) {
        setAssignment(found);
        const schemaFields = found.field_types || found.schema_definition?.fields || [];
        setFields(schemaFields);
        const initialValues = {};
        schemaFields.forEach(f => { initialValues[f.key] = f.defaultValue || ''; });
        setValues(initialValues);
      }
    } catch (err) { setStatusMsg("Error loading form"); }
    finally { setLoading(false); }
  }, [assignmentId]);

  useEffect(() => { loadAssignment(); }, [loadAssignment]);

  const handleSubmit = async (data) => {
    setErrors([]);
    setSubmitting(true);
    try {
      const slug = assignment?.form_slug;
      const res = await fetch(`${FORM_BASE}/public/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAccessToken()}` },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Submit failed');
      setSubmitted(true);
    } catch (err) { setStatusMsg("Error: " + err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--bg-page)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading form...</div>;
  if (!assignment) return <div style={{ minHeight: "100vh", background: "var(--bg-page)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>Assignment not found</div>;

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, var(--bg-page) 0%, var(--bg-deeper) 100%)", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}><CheckCircleIcon /></div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Form Submitted!</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 24px" }}>Your response has been recorded successfully.</p>
          <Link to="/my-forms" style={{ padding: "10px 24px", borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>â† Back to My Forms</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, var(--bg-page) 0%, var(--bg-deeper) 100%)", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", padding: "30px 40px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Link to="/my-forms" style={{ color: "#818cf8", fontSize: 14, textDecoration: "none", fontWeight: 600 }}>â† Back to My Forms</Link>
      </header>

      {statusMsg && (
        <div style={{ background: statusMsg.startsWith("Error") ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", border: statusMsg.startsWith("Error") ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(16,185,129,0.3)", color: statusMsg.startsWith("Error") ? "#fca5a5" : "#6ee7b7", padding: 12, borderRadius: 10, fontSize: 14, marginBottom: 20 }}>
          {statusMsg}
        </div>
      )}

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 30, maxWidth: 800 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>{assignment.form_title}</h1>
        {assignment.form_description && <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 24px" }}>{assignment.form_description}</p>}

        <div style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
          <DynamicFormRenderer
            fields={fields}
            values={values}
            onChange={setValues}
            onSubmit={handleSubmit}
            errors={errors}
            submitText={submitting ? "Submitting..." : "Submit Form"}
          />
        </div>
      </div>
    </div>
  );
}
