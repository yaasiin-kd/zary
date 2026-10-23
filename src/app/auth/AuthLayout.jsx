import { Link, Outlet } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';

export default function AuthLayout() {
  return (
    <div id="auth">
      <div className="auth-wrap">
        <Link className="auth-logo" to="/" aria-label="Zary home page" data-testid="auth-logo-link">
          <Logo />
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
