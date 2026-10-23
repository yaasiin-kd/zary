import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useZary } from '../store.jsx';

export default function Register() {
  const { register } = useZary();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    const err = register(name.trim(), email.trim(), password);
    if (err) { setError(err); return; }
    navigate('/app/verify');
  }

  return (
    <form className="auth-card" id="s-register" onSubmit={submit} noValidate>
      <h2>Create your account</h2>
      <p>Free, no credit card required</p>
      <div className="field">
        <label htmlFor="rname">Full name</label>
        <input type="text" id="rname" placeholder="Your full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} data-testid="register-name" />
      </div>
      <div className="field">
        <label htmlFor="remail">Email</label>
        <input type="email" id="remail" placeholder="name@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="register-email" />
      </div>
      <div className="field">
        <label htmlFor="rpwd">Password</label>
        <input type="password" id="rpwd" placeholder="At least 6 characters" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="register-password" />
      </div>
      {error && <div className="err" data-testid="register-error">{error}</div>}
      <button className="btn" type="submit" data-testid="register-button">Create account</button>
      <div className="auth-switch">Already have one? <Link to="/app/login" data-testid="go-to-login">Sign in</Link></div>
    </form>
  );
}
