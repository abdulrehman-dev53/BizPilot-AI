import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Package,
  Users2,
  Sparkles,
  MessageSquareText,
  Megaphone,
  FileStack,
  LogOut,
  Menu,
  X,
  Radar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  {
    label: 'Overview',
    items: [{ to: '/', icon: LayoutDashboard, text: 'Dashboard', end: true }],
  },
  {
    label: 'Business',
    items: [
      { to: '/business', icon: Building2, text: 'Business profile' },
      { to: '/products', icon: Package, text: 'Products & services' },
      { to: '/competitors', icon: Radar, text: 'Competitors' },
    ],
  },
  {
    label: 'AI studio',
    items: [
      { to: '/ai/analysis', icon: Sparkles, text: 'Business analysis' },
      { to: '/ai/marketing', icon: Megaphone, text: 'Marketing generator' },
      { to: '/ai/content', icon: FileStack, text: 'Content generator' },
      { to: '/ai/calendar', icon: FileStack, text: 'Content calendar' },
      { to: '/chat', icon: MessageSquareText, text: 'Business assistant' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { to: '/campaigns', icon: Megaphone, text: 'Campaigns' },
      { to: '/content-history', icon: FileStack, text: 'Content history' },
    ],
  },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Radar color="#0A0F1D" strokeWidth={2.5} />
          </div>
          <div className="brand-name">
            Biz<span>Pilot</span> AI
          </div>
        </div>

        {nav.map((group) => (
          <div className="nav-group" key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <item.icon />
                {item.text}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 12px' }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'var(--bg-panel-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--cyan)',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <span className="plan-chip">{user?.plan} plan</span>
            </div>
          </div>
          <button className="nav-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }} onClick={handleLogout}>
            <LogOut />
            Log out
          </button>
        </div>
      </aside>

      {open && <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setOpen(false)} />}

      <div className="main">
        <div className="topbar">
          <button className="icon-btn mobile-nav-toggle" onClick={() => setOpen((o) => !o)}>
            {open ? <X /> : <Menu />}
          </button>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <span className="badge badge-cyan">
            <Sparkles size={12} /> Groq-powered
          </span>
        </div>
        <div className="page">{children}</div>
      </div>
    </div>
  );
}
