import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

function ThemedApp() {
  const { isDark } = useTheme();
  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 8,
          fontFamily: "'Outfit', sans-serif",
          ...(isDark
            ? { colorBgContainer: 'var(--bg-card)', colorBgLayout: 'var(--bg-page)', colorText: 'var(--text-primary)', colorTextSecondary: 'var(--text-secondary)', colorBorder: 'var(--border-color)' }
            : { colorBgContainer: '#ffffff', colorBgLayout: '#f0f2f5', colorText: '#1a1a2e', colorTextSecondary: 'var(--text-secondary)', colorBorder: '#e2e8f0' }
          ),
        },
      }}
    >
      <App />
    </ConfigProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
