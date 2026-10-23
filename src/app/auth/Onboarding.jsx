import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_BUDGETS, useZary } from '../store.jsx';

const FIELDS = [
  { cat: 'Food', id: 'ob-food' },
  { cat: 'Transport', id: 'ob-transport' },
  { cat: 'Utilities', id: 'ob-utilities' },
  { cat: 'Health', id: 'ob-health' },
  { cat: 'Entertainment', id: 'ob-entertain' },
  { cat: 'Other', id: 'ob-other' },
];
const COUNTRIES = ['Togo', "Côte d'Ivoire", 'Sénégal', 'Mali', 'Burkina Faso', 'Niger', 'Bénin', 'Guinée', 'Other'];

export default function Onboarding() {
  const { finishAuth } = useZary();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [limits, setLimits] = useState(BASE_BUDGETS.map((b) => String(b.limit)));
  const [currency, setCurrency] = useState('XOF');
  const [country, setCountry] = useState('Togo');

  function finish() {
    const budgets = BASE_BUDGETS.map((b, i) => {
      const v = parseFloat(limits[i]);
      return { ...b, limit: v > 0 ? v : b.limit };
    });
    finishAuth(budgets, currency);
    navigate('/app/dashboard');
  }

  const s2 = step === 1 ? 'active' : 'done';
  return (
    <div className="auth-card" id="s-onboard" data-testid="onboarding" data-country={country}>
      <div className="wizard-steps">
        <div className="wizard-step done" id="ws1"><div className="step-dot">✓</div><span>Verified</span></div>
        <div className="step-line" />
        <div className={`wizard-step ${s2}`} id="ws2"><div className="step-dot">{step === 1 ? '2' : '✓'}</div><span>Budget</span></div>
        <div className="step-line" />
        <div className={`wizard-step ${step === 2 ? 'active' : ''}`} id="ws3"><div className="step-dot">3</div><span>Currency</span></div>
      </div>

      {step === 1 ? (
        <div id="ob-step1">
          <h2>Set your monthly budgets</h2>
          <p style={{ marginBottom: 20 }}>You can change these anytime in Settings</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {FIELDS.map((f, i) => (
              <div className="field" style={{ margin: 0 }} key={f.id}>
                <label htmlFor={f.id}>{f.cat} (XOF)</label>
                <input
                  type="number" id={f.id} data-testid={f.id} value={limits[i]}
                  onChange={(e) => setLimits(limits.map((v, j) => (j === i ? e.target.value : v)))}
                />
              </div>
            ))}
          </div>
          <button className="btn" type="button" style={{ marginTop: 20 }} onClick={() => setStep(2)} data-testid="ob-next-1">Continue</button>
        </div>
      ) : (
        <div id="ob-step2">
          <h2>Choose your currency</h2>
          <p style={{ marginBottom: 20 }}>Used to display all amounts in the app</p>
          <div className="field">
            <label htmlFor="ob-currency">Display currency</label>
            <select id="ob-currency" data-testid="ob-currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="XOF">XOF, West African CFA franc</option>
              <option value="EUR">EUR, Euro</option>
              <option value="USD">USD, US Dollar</option>
              <option value="GBP">GBP, British Pound</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="ob-country">Country</label>
            <select id="ob-country" data-testid="ob-country" value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn" type="button" onClick={finish} data-testid="ob-finish">Get started</button>
          <button className="btn btn-ghost" type="button" style={{ marginTop: 8 }} onClick={() => setStep(1)} data-testid="ob-back">Back</button>
        </div>
      )}
    </div>
  );
}
