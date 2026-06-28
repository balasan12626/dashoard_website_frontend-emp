import React from "react";
import { APP_CONFIG } from "../config";

function MailIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle' }}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
}
function AlertTriangleIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1em', height: '1em', verticalAlign: 'middle' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof window !== "undefined" && window.__ERROR_REPORT__) {
      try { window.__ERROR_REPORT__(error, errorInfo); } catch (_) {}
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/login";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #050816 0%, #0B1020 100%)",
          fontFamily: "'Outfit', sans-serif",
          padding: 24,
          boxSizing: "border-box"
        }}>
          <div style={{
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            padding: "48px 32px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 16,
            boxShadow: "0 24px 48px rgba(0,0,0,0.4)"
          }}>
            <div style={{
              width: 64, height: 64, margin: "0 auto 24px",
              background: "linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 100%)",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28
            }}><AlertTriangleIcon /></div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 12px" }}>Something went wrong</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 32px" }}>
              The application encountered an unexpected error. Please try reloading the page or contact your administrator if the issue persists.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={this.handleReload} style={{
                padding: "12px 28px", borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                border: "none", color: "#ffffff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                boxShadow: "0 8px 24px rgba(99,102,241,0.3)", transition: "all 0.2s"
              }}>Reload Page</button>
              <button onClick={this.handleGoHome} style={{
                padding: "12px 28px", borderRadius: 10, background: "var(--border-color)",
                border: "1px solid rgba(255,255,255,0.15)", color: "var(--text-muted)", fontWeight: 600, fontSize: 14, cursor: "pointer"
              }}>Go to Login</button>
            </div>
            <div style={{ marginTop: 24, fontSize: 12, color: "var(--text-secondary)" }}>
              <a href={`mailto:${APP_CONFIG.ADMIN_EMAIL}`} style={{ color: "#14b8a6", textDecoration: "none" }}><MailIcon /> Contact Support</a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
