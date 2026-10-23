import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useZary } from '../store.jsx';

export default function Login() {
  const { login } = useZary();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    const err = login(email.trim(), password);
    if (err) { setError(err); return; }
    navigate('/app/verify');
  }

  return (
    <form className="auth-card" id="s-login" onSubmit={submit} noValidate>
      <h2>Welcome back</h2>
      <p>Sign in to your account to continue</p>
      <div className="field">
        <label htmlFor="lemail">Email</label>
        <input type="email" id="lemail" placeholder="demo@zary.app" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="email-input" />
      </div>
      <div className="field">
        <label htmlFor="lpwd">Password</label>
        <input type="password" id="lpwd" placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="password-input" />
      </div>
      {error && <div className="err" data-testid="login-error">{error}</div>}
      <button className="btn" type="submit" data-testid="login-button">Sign in</button>
      <div className="auth-switch">No account? <Link to="/app/register" data-testid="go-to-register">Create one</Link></div>
      <div className="auth-demo">Demo: <code>demo@zary.app</code> / <code>demo123</code></div>
    </form>
  );
}
