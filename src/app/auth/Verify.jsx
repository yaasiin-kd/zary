import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useZary } from '../store.jsx';

const newCode = () => String(Math.floor(100000 + Math.random() * 900000));
const EMPTY = ['', '', '', '', '', ''];
const CODE_SECONDS = 120;

export default function Verify() {
  const { pending, finishAuth } = useZary();
  const navigate = useNavigate();
  const [code, setCode] = useState(newCode);
  const [digits, setDigits] = useState(EMPTY);
  const [secs, setSecs] = useState(CODE_SECONDS);
  const [error, setError] = useState('');
  const refs = useRef([]);

  useEffect(() => {
    if (secs <= 0) return undefined;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  useEffect(() => { refs.current[0] && refs.current[0].focus(); }, [code]);

  function verify(ds) {
    const entered = ds.join('');
    if (entered.length < 6) { setError('Please enter all 6 digits.'); return; }
    if (secs <= 0) { setError('This code has expired. Request a new one.'); return; }
    if (entered !== code) { setError('Incorrect code. Try again.'); return; }
    if (pending.isNew) { navigate('/app/welcome'); return; }
    finishAuth();
    navigate('/app/dashboard');
  }

  function onChange(i, value) {
    const d = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    setError('');
    if (d && i < 5) refs.current[i + 1].focus();
    if (d && i === 5) verify(next);
  }

  function onKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = '';
      setDigits(next);
      refs.current[i - 1].focus();
      e.preventDefault();
    }
  }

  function onPaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = EMPTY.map((_, i) => pasted[i] || '');
    setDigits(next);
    refs.current[Math.min(pasted.length, 5)].focus();
    if (pasted.length === 6) verify(next);
  }

  function resend() {
    setCode(newCode());
    setDigits(EMPTY);
    setSecs(CODE_SECONDS);
    setError('');
  }

  const timer = secs > 0
    ? `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
    : 'Expired';

  return (
    <form className="auth-card" id="s-otp" onSubmit={(e) => { e.preventDefault(); verify(digits); }} noValidate>
      <h2>Verify your identity</h2>
      <p>Enter the 6-digit code sent to your phone</p>
      <div className="otp-timer">Code expires in <span id="otp-timer-val" data-testid="otp-timer">{timer}</span></div>
      <div className="otp-inputs">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            className="otp-digit"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={d}
            aria-label={`Digit ${i + 1}`}
            data-testid={`otp-digit-${i + 1}`}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
          />
        ))}
      </div>
      {error && <div className="err" data-testid="otp-error">{error}</div>}
      <button className="btn" type="submit" data-testid="verify-otp-button">Verify</button>
      <div className="otp-hint">Your code is <b id="otp-display" data-testid="otp-display">{code}</b></div>
      <div className="auth-switch"><button type="button" className="link-btn" onClick={resend} data-testid="resend-otp">Resend code</button></div>
    </form>
  );
}
