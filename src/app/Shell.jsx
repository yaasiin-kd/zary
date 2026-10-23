import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useZary } from './store.jsx';
import Logo from '../components/Logo.jsx';
import { Avatar, Button, Icon, LinkButton } from './ui/index.jsx';

const NAV = [
  { to: 'dashboard', label: 'Overview', short: 'Home', icon: 'home' },
  { to: 'expenses', label: 'Expenses', short: 'Expenses', icon: 'receipt' },
  { to: 'budget', label: 'Budget', short: 'Budget', icon: 'pie' },
  { to: 'transfer', label: 'Transfer', short: 'Transfer', icon: 'swap' },
  { to: 'profile', label: 'Settings', short: 'Settings', icon: 'user' },
];
const IDLE_MS = 5 * 60 * 1000;
const WARN_SECONDS = 60;

function readCollapsed() {
  try { return localStorage.getItem('zary-sidebar') === 'collapsed'; } catch { return false; }
}

export default function Shell() {
  const { user, logout, theme, toggleTheme } = useZary();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [warn, setWarn] = useState(null);
  const restart = useRef(() => {});
  const signOut = useRef(null);
  signOut.current = () => { logout(); navigate('/app/login', { replace: true }); };

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

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
    return () => { events.forEach((ev) => document.removeEventListener(ev, start)); clearTimeout(idle); clearInterval(tick); };
  }, []);

  function toggleSidebar() {
    setCollapsed((c) => {
      try { localStorage.setItem('zary-sidebar', c ? 'open' : 'collapsed'); } catch { /* storage unavailable */ }
      return !c;
    });
  }

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const navClass = ({ isActive }) => `z-nav-item${isActive ? ' active' : ''}`;

  return (
    <div className="z-shell">
      <aside className={`z-side${collapsed ? ' is-collapsed' : ''}`} aria-label="Sidebar">
        <div className="z-side-brand">
          <Link className="z-brand" to="/app/dashboard" aria-label="Zary overview"><Logo /></Link>
          <Button variant="ghost" size="sm" iconOnly icon="panel" onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} data-testid="sidebar-toggle" />
        </div>
        <div className="z-side-label">Menu</div>
        <nav className="z-nav" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={`/app/${n.to}`} className={navClass} data-label={n.label} data-testid={`nav-${n.to}`}>
              <Icon name={n.icon} size={19} />
              <span className="z-nav-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="z-side-foot">
          <Link className="z-user" to="/app/profile" aria-label="Your profile">
            <Avatar name={user.name} data-testid="user-avatar" />
            <span className="z-user-text">
              <span className="z-user-name" data-testid="user-name">{user.name.split(' ')[0]}</span>
              <span className="z-user-email" data-testid="user-email">{user.email}</span>
            </span>
          </Link>
          <button className="z-nav-item" type="button" onClick={() => signOut.current()} data-label="Sign out" data-testid="logout-button">
            <Icon name="logout" size={19} />
            <span className="z-nav-label">Sign out</span>
          </button>
        </div>
      </aside>

      <div className="z-main">
        <header className="z-top">
          <Link className="z-brand" to="/app/dashboard" aria-label="Zary overview"><Logo /></Link>
          <span className="z-top-date">{today}</span>
          <div className="z-top-actions">
            <Button variant="ghost" iconOnly icon={theme === 'dark' ? 'sun' : 'moon'} onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} data-testid="theme-toggle" />
            <LinkButton className="z-hide-mobile" icon="plus" to="/app/expenses?new=1" data-testid="top-add-expense">Add expense</LinkButton>
            <Link to="/app/profile" aria-label="Your profile" className="z-avatar" data-testid="top-profile">{user.name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</Link>
          </div>
        </header>
        <main className="z-content" key={pathname}>
          <div className="z-page-enter"><Outlet /></div>
        </main>
      </div>

      <nav className="z-bottom" aria-label="Main">
        {NAV.map((n) => (
          <NavLink key={n.to} to={`/app/${n.to}`} className={({ isActive }) => `z-bottom-item${isActive ? ' active' : ''}`} data-testid={`bnav-${n.to}`}>
            <Icon name={n.icon} size={21} />
            {n.short}
          </NavLink>
        ))}
      </nav>

      <div className={`z-session${warn !== null ? ' show' : ''}`} data-testid="session-banner" role="alert" aria-hidden={warn === null}>
        <Icon name="clock" size={18} />
        <span>Session expires in <strong data-testid="session-countdown">{warn ?? WARN_SECONDS}s</strong></span>
        <Button size="sm" onClick={() => restart.current()} data-testid="stay-logged-in">Stay logged in</Button>
      </div>
    </div>
  );
}
