import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { savingsRate, useZary } from '../store.jsx';
import PageHead from './PageHead.jsx';

const COUNTRIES = ['Togo', "Côte d'Ivoire", 'Sénégal', 'Mali', 'Burkina Faso', 'Niger', 'Bénin', 'Guinée', 'Other'];

function Toggle({ checked, onChange, testid, label }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} data-testid={testid} aria-label={label} />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  );
}

function SettingRow({ label, desc, children }) {
  return (
    <div className="setting-row">
      <div className="setting-info"><div className="setting-label">{label}</div><div className="setting-desc">{desc}</div></div>
      {children}
    </div>
  );
}

export default function Profile() {
  const z = useZary();
  const navigate = useNavigate();
  const { user, expenses, transfers, theme, currency } = z;
  const parts = user.name.split(' ');
  const [fname, setFname] = useState(parts[0] || '');
  const [lname, setLname] = useState(parts.slice(1).join(' '));
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Togo');
  const [profileErr, setProfileErr] = useState('');
  const [pwd, setPwd] = useState({ cur: '', next: '', confirm: '' });
  const [pwdErr, setPwdErr] = useState('');
  const [prefs, setPrefs] = useState({ notifications: true, budget_alerts: true, '2fa': false });

  const initials = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  function saveProfile(e) {
    e.preventDefault();
    setProfileErr(z.saveProfile(fname.trim(), lname.trim(), email.trim()) || '');
  }
  function resetProfile() {
    const p = user.name.split(' ');
    setFname(p[0] || ''); setLname(p.slice(1).join(' ')); setEmail(user.email); setProfileErr('');
  }
  function changePassword(e) {
    e.preventDefault();
    const err = z.changePassword(pwd.cur, pwd.next, pwd.confirm);
    setPwdErr(err || '');
    if (!err) setPwd({ cur: '', next: '', confirm: '' });
  }
  function togglePref(key, val) {
    setPrefs((p) => ({ ...p, [key]: val }));
    z.showToast(`${val ? 'Enabled' : 'Disabled'} ${key.replace('_', ' ')}`);
  }
  function confirmThen(msg, fn) { if (window.confirm(msg)) fn(); }

  return (
    <div className="page on" id="p-profile" data-testid="page-profile">
      <PageHead title="Profile & Settings" sub="Manage your account and preferences" />
      <div className="profile-layout">
        <div>
          <div className="profile-card">
            <div className="profile-card-body" style={{ textAlign: 'center', padding: '24px 20px 0' }}>
              <div className="avatar-lg">{initials}</div>
              <div className="profile-name-display" data-testid="profile-name-display">{user.name}</div>
              <div className="profile-email-display">{user.email}</div>
              <span className="badge b-blue" style={{ marginBottom: 20 }}>Personal account</span>
            </div>
            <div className="profile-stat-row">
              <div className="profile-stat"><div className="profile-stat-val" data-testid="profile-stat-expenses">{expenses.length}</div><div className="profile-stat-lbl">Expenses</div></div>
              <div className="profile-stat"><div className="profile-stat-val" data-testid="profile-stat-transfers">{transfers.length}</div><div className="profile-stat-lbl">Transfers</div></div>
              <div className="profile-stat"><div className="profile-stat-val" data-testid="profile-stat-saved">{savingsRate(expenses)}%</div><div className="profile-stat-lbl">Saved</div></div>
            </div>
          </div>
          <div className="profile-card">
            <div className="profile-card-head"><h3>Preferences</h3></div>
            <div className="profile-card-body">
              <SettingRow label="Currency" desc="Display currency for all amounts">
                <select className="currency-select" value={currency} onChange={(e) => { z.setCurrency(e.target.value); z.showToast(`Currency set to ${e.target.value}`); }} data-testid="currency-select">
                  <option value="XOF">XOF</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option>
                </select>
              </SettingRow>
              <SettingRow label="Dark mode" desc="Toggle light / dark appearance">
                <Toggle checked={theme === 'dark'} onChange={(v) => z.setTheme(v ? 'dark' : 'light')} testid="toggle-theme" label="Dark mode" />
              </SettingRow>
              <SettingRow label="Email notifications" desc="Weekly spending summaries">
                <Toggle checked={prefs.notifications} onChange={(v) => togglePref('notifications', v)} testid="toggle-notifications" label="Email notifications" />
              </SettingRow>
              <SettingRow label="Budget alerts" desc="Alert when a category reaches 75%">
                <Toggle checked={prefs.budget_alerts} onChange={(v) => togglePref('budget_alerts', v)} testid="toggle-budget-alerts" label="Budget alerts" />
              </SettingRow>
              <SettingRow label="Two-factor auth" desc="OTP verification on sign in">
                <Toggle checked={prefs['2fa']} onChange={(v) => togglePref('2fa', v)} testid="toggle-2fa" label="Two-factor auth" />
              </SettingRow>
            </div>
          </div>
        </div>

        <div>
          <form className="profile-card" style={{ marginBottom: 20 }} onSubmit={saveProfile} noValidate>
            <div className="profile-card-head"><h3>Personal information</h3></div>
            <div className="profile-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field" style={{ margin: 0 }}><label htmlFor="p-fname">First name</label><input type="text" id="p-fname" value={fname} onChange={(e) => setFname(e.target.value)} data-testid="profile-firstname" /></div>
                <div className="field" style={{ margin: 0 }}><label htmlFor="p-lname">Last name</label><input type="text" id="p-lname" value={lname} onChange={(e) => setLname(e.target.value)} data-testid="profile-lastname" /></div>
              </div>
              <div className="field" style={{ marginTop: 12 }}><label htmlFor="p-email">Email address</label><input type="email" id="p-email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="profile-email" /></div>
              <div className="field"><label htmlFor="p-phone">Phone number</label><input type="tel" id="p-phone" placeholder="+228 XX XX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="profile-phone" /></div>
              <div className="field"><label htmlFor="p-country">Country</label>
                <select id="p-country" value={country} onChange={(e) => setCountry(e.target.value)} data-testid="profile-country">
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              {profileErr && <div className="err" data-testid="profile-error">{profileErr}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-sm" type="submit" data-testid="save-profile-button">Save changes</button>
                <button className="btn btn-sm btn-ghost" type="button" onClick={resetProfile} data-testid="reset-profile-button">Reset</button>
              </div>
            </div>
          </form>

          <form className="profile-card" style={{ marginBottom: 20 }} onSubmit={changePassword} noValidate>
            <div className="profile-card-head"><h3>Change password</h3></div>
            <div className="profile-card-body">
              <div className="field"><label htmlFor="p-curpwd">Current password</label><input type="password" id="p-curpwd" placeholder="••••••••" autoComplete="current-password" value={pwd.cur} onChange={(e) => setPwd({ ...pwd, cur: e.target.value })} data-testid="current-password" /></div>
              <div className="field"><label htmlFor="p-newpwd">New password</label><input type="password" id="p-newpwd" placeholder="At least 6 characters" autoComplete="new-password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} data-testid="new-password" /></div>
              <div className="field"><label htmlFor="p-confpwd">Confirm new password</label><input type="password" id="p-confpwd" placeholder="Repeat new password" autoComplete="new-password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} data-testid="confirm-password" /></div>
              {pwdErr && <div className="err" data-testid="password-error">{pwdErr}</div>}
              <button className="btn btn-sm" type="submit" data-testid="change-password-button">Update password</button>
            </div>
          </form>

          <div className="danger-zone">
            <h3>Danger zone</h3>
            <div className="danger-row">
              <div className="setting-info"><div className="setting-label">Clear all expenses</div><div className="setting-desc">Permanently delete all expense records</div></div>
              <button className="btn-danger-outline" type="button" onClick={() => confirmThen('Clear all expenses? This cannot be undone.', z.clearExpenses)} data-testid="clear-expenses-button">Clear expenses</button>
            </div>
            <div className="danger-row">
              <div className="setting-info"><div className="setting-label">Reset account data</div><div className="setting-desc">Reset balances and all transaction history</div></div>
              <button className="btn-danger-outline" type="button" onClick={() => confirmThen('Reset all account data? This cannot be undone.', z.resetAccount)} data-testid="reset-account-button">Reset data</button>
            </div>
            <div className="danger-row">
              <div className="setting-info"><div className="setting-label">Delete account</div><div className="setting-desc">Permanently delete your account and all data</div></div>
              <button className="btn-danger-outline" type="button" onClick={() => confirmThen('Delete your account permanently? This cannot be undone.', () => { z.deleteAccount(); navigate('/app/login', { replace: true }); })} data-testid="delete-account-button">Delete account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
