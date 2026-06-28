export default function LoadingScreen() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", width: "100vw",
      background: "var(--bg-page, #f0f4f8)",
      flexDirection: "column", gap: 16
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: "4px solid var(--border-color, #e2e8f0)",
        borderTopColor: "#6366f1",
        animation: "spin 0.8s linear infinite"
      }} />
      <p style={{ color: "var(--text-secondary, #4b5565)", fontSize: 14, fontWeight: 600, margin: 0 }}>Loading...</p>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}
