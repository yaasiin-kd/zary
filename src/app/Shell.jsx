import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useZary } from './store.jsx';
import Logo from '../components/Logo.jsx';
import Icon from '../components/icons.jsx';

const NAV = [
  { to: 'dashboard', label: 'Dashboard', short: 'Home' },
  { to: 'expenses', label: 'Expenses', short: 'Expenses' },
  { to: 'budget', label: 'Budget', short: 'Budget' },
  { to: 'transfer', label: 'Transfer', short: 'Transfer' },
  { to: 'profile', label: 'Profile', short: 'Profile' },
];
const IDLE_MS = 5 * 60 * 1000;
const WARN_SECONDS = 60;

export default function Shell() {
  const { user, logout } = useZary();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [warn, setWarn] = useState(null);
  const restart = useRef(() => {});
  const signOut = useRef(null);
  signOut.current = () => { logout(); navigate('/app/login', { replace: true }); };

  useEffect(() => {
    let idle = null;
    let tick = null;
    const start = () => {
      clearTimeout(idle); clearInterval(tick); setWarn(null);
      idle = setTimeout(() => {
        let s = WARN_SECONDS;
        setWarn(s);
        tick = setInterval(() => {
          s -= 1;
          if (s <= 0) { clearInterval(tick); setWarn(null); signOut.current(); } else setWarn(s);
        }, 1000);
      }, IDLE_MS);
    };
    restart.current = start;
    const events = ['mousemove', 'keydown', 'click', 'touchstart'];
    events.forEach((ev) => document.addEventListener(ev, start, { passive: true }));
    start();
    return () => {
      events.forEach((ev) => document.removeEventListener(ev, start));
      clearTimeout(idle); clearInterval(tick);
    };
  }, []);

  const initials = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const navClass = ({ isActive }) => `nav-item${isActive ? ' active' : ''}`;
  const bnavClass = ({ isActive }) => `bnav-item${isActive ? ' active' : ''}`;

  return (
    <div id="app">
      <div className={`shell${collapsed ? ' sidebar-collapsed' : ''}`}>
        <aside id="sidebar" className={collapsed ? 'collapsed' : ''}>
          <div className="sidebar-top">
            <div className="logo" aria-label="Zary"><Logo /></div>
            <button className="collapse-btn" type="button" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} data-testid="sidebar-toggle">
              <Icon name="chevron" className="collapse-icon" />
            </button>
          </div>
          <div className="nav-section">Main</div>
          {NAV.map((n) => (
            <NavLink key={n.to} to={`/app/${n.to}`} className={navClass} data-testid={`nav-${n.to}`}>
              <Icon name={n.to} className="nav-icon" />
              <span className="nav-label">{n.label}</span>
              <span className="nav-tooltip">{n.label}</span>
            </NavLink>
          ))}
          <div className="sidebar-bottom">
            <div className="user-row">
              <div className="avatar" data-testid="user-avatar">{initials}</div>
              <div className="user-text">
                <div className="user-name" data-testid="user-name">{user.name.split(' ')[0]}</div>
                <div className="user-email" data-testid="user-email">{user.email}</div>
              </div>
            </div>
            <button className="nav-item" type="button" onClick={() => signOut.current()} data-testid="logout-button">
              <Icon name="logout" className="nav-icon" />
              <span className="nav-label">Sign out</span>
              <span className="nav-tooltip">Sign out</span>
            </button>
          </div>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>

      <nav id="bottom-nav" aria-label="Main">
        {NAV.map((n) => (
          <NavLink key={n.to} to={`/app/${n.to}`} className={bnavClass} data-testid={`bnav-${n.to}`}>
            <Icon name={n.to} />
            {n.short}
          </NavLink>
        ))}
      </nav>

      <div className={`session-banner${warn !== null ? ' show' : ''}`} data-testid="session-banner" role="alert">
        <Icon name="info" size={16} fill="var(--yellow)" />
        <div className="session-banner-text">Session expires in <span id="session-countdown" data-testid="session-countdown">{warn ?? WARN_SECONDS}</span>s</div>
        <button className="stay-btn" type="button" onClick={() => restart.current()} data-testid="stay-logged-in">Stay logged in</button>
      </div>
    </div>
  );
}
