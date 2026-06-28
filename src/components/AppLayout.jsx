import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Layout, Menu, Button, Typography } from "antd";
import {
  FormOutlined, CustomerServiceOutlined, CarryOutOutlined,
  UserOutlined, LogoutOutlined, MenuOutlined, SunOutlined, MoonOutlined,
  HomeOutlined
} from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { key: '/tickets', icon: <CustomerServiceOutlined />, label: <Link to="/tickets" style={{ color: 'inherit', textDecoration: 'none' }}>Support Tickets</Link> },
    { key: '/my-forms', icon: <FormOutlined />, label: <Link to="/my-forms" style={{ color: 'inherit', textDecoration: 'none' }}>My Forms</Link> },
    { key: '/travel-requests', icon: <CarryOutOutlined />, label: <Link to="/travel-requests" style={{ color: 'inherit', textDecoration: 'none' }}>Travel Requests</Link> },
    { key: '/profile', icon: <UserOutlined />, label: <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>Profile</Link> },
  ];

  const selectedKey = menuItems.find(m => isActive(m.key))?.key || '/tickets';

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 199, backdropFilter: 'blur(4px)' }} />
      )}
      <Sider
        width={280}
        collapsedWidth={0}
        breakpoint="lg"
        onBreakpoint={broken => setCollapsed(broken)}
        collapsed={collapsed}
        trigger={null}
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          height: '100vh', position: 'sticky', top: 0, left: 0,
          overflow: 'auto',
          ...(mobileOpen ? { position: 'fixed', zIndex: 200 } : {})
        }}
      >
        <div style={{ padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute', top: 8, right: 8, zIndex: 10,
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', cursor: 'pointer',
                fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700,
              }}
              title="Close menu">✕</button>
          )}
          <Link to="/tickets" style={{
            background: '#ffffff', padding: '14px 16px', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, boxShadow: '0 8px 22px rgba(0,0,0,0.22)'
          }}>
            <img src="/image.png" alt="Bluspring Logo" style={{ width: '100%', maxWidth: 200, height: 'auto', maxHeight: 52, objectFit: 'contain' }} />
          </Link>

          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)', margin: '0 0 10px', paddingLeft: 8 }}>Employee Portal</div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ background: 'transparent', borderInlineEnd: 'none' }}
            theme={isDark ? "dark" : "light"}
          />

          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-card)', padding: '10px 12px',
              borderRadius: 10, border: '1px solid var(--border-color)',
              marginBottom: 12
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: '#818cf8', flexShrink: 0
              }}>
                {(profile?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <Text style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', display: 'block' }} ellipsis>
                  {profile?.name || 'User'}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }} ellipsis>
                  {profile?.email || ''}
                </Text>
              </div>
            </div>
            <Button
              block
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              style={{ marginBottom: 8, color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button block danger icon={<LogoutOutlined />} onClick={handleLogout}>Sign Out</Button>
          </div>
        </div>
      </Sider>
      <Layout style={{ background: 'var(--bg-page)' }}>
        {collapsed && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileOpen(true)}
            style={{ position: 'fixed', top: 12, left: 12, zIndex: 210, color: 'var(--text-primary)', fontSize: 16 }}
          />
        )}
        <Content style={{ minHeight: '100vh' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
