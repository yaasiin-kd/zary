import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { savingsRate, useZary } from '../store.jsx';
import { Avatar, Badge, Button, Card, ConfirmDialog, Field, PageHeader, SelectInput, SettingRow, Switch, Tabs, TextInput } from '../ui/index.jsx';

const COUNTRIES = ['Togo', "Côte d'Ivoire", 'Sénégal', 'Mali', 'Burkina Faso', 'Niger', 'Bénin', 'Guinée', 'Other'];
const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'account', label: 'Account' },
];
const STRENGTH = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

function strength(pw) {
  if (pw.length < 6) return 0;
  let s = 1;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s);
}

function ProfileForm() {
  const { user, saveProfile } = useZary();
  const split = (n) => { const p = n.split(' '); return { fname: p[0] || '', lname: p.slice(1).join(' ') }; };
  const initial = { ...split(user.name), email: user.email };
  const [form, setForm] = useState({ ...initial, phone: '', country: 'Togo' });
  const [error, setError] = useState('');
  const dirty = form.fname !== initial.fname || form.lname !== initial.lname || form.email !== initial.email;
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setError(''); };

  function submit(e) {
    e.preventDefault();
    setError(saveProfile(form.fname.trim(), form.lname.trim(), form.email.trim()) || '');
  }

  return (
    <Card title="Personal information" subtitle="This is how you appear in Zary">
      <form className="z-form" onSubmit={submit} noValidate>
        <div className="z-form-row">
          <Field label="First name" htmlFor="p-fname"><TextInput id="p-fname" autoComplete="given-name" value={form.fname} onChange={set('fname')} invalid={!!error && !form.fname.trim()} data-testid="profile-firstname" /></Field>
          <Field label="Last name" optional htmlFor="p-lname"><TextInput id="p-lname" autoComplete="family-name" value={form.lname} onChange={set('lname')} data-testid="profile-lastname" /></Field>
        </div>
        <Field label="Email address" htmlFor="p-email"><TextInput id="p-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} invalid={!!error && !form.email.trim()} data-testid="profile-email" /></Field>
        <div className="z-form-row">
          <Field label="Phone number" optional htmlFor="p-phone"><TextInput id="p-phone" type="tel" autoComplete="tel" placeholder="+228 90 00 00 00" value={form.phone} onChange={set('phone')} data-testid="profile-phone" /></Field>
          <Field label="Country" htmlFor="p-country">
            <SelectInput id="p-country" value={form.country} onChange={set('country')} data-testid="profile-country">{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</SelectInput>
          </Field>
        </div>
        {error && <div className="z-form-alert" role="alert" data-testid="profile-error">{error}</div>}
        <div className="z-form-actions">
          <Button variant="ghost" disabled={!dirty} onClick={() => { setForm({ ...form, ...initial }); setError(''); }} data-testid="reset-profile-button">Discard changes</Button>
          <Button type="submit" disabled={!dirty} data-testid="save-profile-button">Save changes</Button>
        </div>
      </form>
    </Card>
  );
}

function SecurityForm() {
  const { changePassword } = useZary();
  const [pwd, setPwd] = useState({ cur: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const score = strength(pwd.next);
  const mismatch = pwd.confirm && pwd.next !== pwd.confirm;
  const set = (k) => (e) => { setPwd({ ...pwd, [k]: e.target.value }); setError(''); };

  function submit(e) {
    e.preventDefault();
    const err = changePassword(pwd.cur, pwd.next, pwd.confirm);
    setError(err || '');
    if (!err) setPwd({ cur: '', next: '', confirm: '' });
  }

  return (
    <Card title="Change password" subtitle="Use at least 6 characters. Longer is stronger.">
      <form className="z-form" onSubmit={submit} noValidate>
        <Field label="Current password" htmlFor="p-curpwd"><TextInput id="p-curpwd" type="password" autoComplete="current-password" value={pwd.cur} onChange={set('cur')} data-testid="current-password" /></Field>
        <Field label="New password" htmlFor="p-newpwd" hint={pwd.next ? `Strength: ${STRENGTH[score]}` : 'At least 6 characters'}>
          <TextInput id="p-newpwd" type="password" autoComplete="new-password" value={pwd.next} onChange={set('next')} data-testid="new-password" />
          <div className="z-strength" data-score={pwd.next ? Math.max(1, score) : 0} aria-hidden="true"><span /><span /><span /><span /></div>
        </Field>
        <Field label="Confirm new password" htmlFor="p-confpwd" error={mismatch ? 'Passwords do not match yet.' : undefined}>
          <TextInput id="p-confpwd" type="password" autoComplete="new-password" value={pwd.confirm} onChange={set('confirm')} invalid={!!mismatch} data-testid="confirm-password" />
        </Field>
        {error && <div className="z-form-alert" role="alert" data-testid="password-error">{error}</div>}
        <div className="z-form-actions">
          <Button type="submit" icon="lock" disabled={!pwd.cur || !pwd.next || !pwd.confirm} data-testid="change-password-button">Update password</Button>
        </div>
      </form>
    </Card>
  );
}

function Preferences() {
  const { theme, setTheme, currency, setCurrency, showToast } = useZary();
  const [prefs, setPrefs] = useState({ notifications: true, alerts: true, twofa: true });
  const toggle = (key, label) => (v) => { setPrefs({ ...prefs, [key]: v }); showToast(`${label} ${v ? 'on' : 'off'}`); };
  return (
    <div className="z-stack">
      <Card title="Display">
        <SettingRow title="Dark mode" description="Easier on the eyes at night">
          <Switch checked={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} label="Dark mode" testid="toggle-theme" />
        </SettingRow>
        <SettingRow title="Currency" description="Used to display amounts">
          <SelectInput aria-label="Currency" value={currency} onChange={(e) => { setCurrency(e.target.value); showToast(`Currency set to ${e.target.value}`); }} data-testid="currency-select">
            <option value="XOF">XOF, CFA franc</option><option value="EUR">EUR, Euro</option><option value="USD">USD, US dollar</option><option value="GBP">GBP, British pound</option>
          </SelectInput>
        </SettingRow>
      </Card>
      <Card title="Notifications">
        <SettingRow title="Weekly summary" description="A short email every Monday">
          <Switch checked={prefs.notifications} onChange={toggle('notifications', 'Weekly summary')} label="Weekly summary" testid="toggle-notifications" />
        </SettingRow>
        <SettingRow title="Budget alerts" description="When a category reaches 75% of its limit">
          <Switch checked={prefs.alerts} onChange={toggle('alerts', 'Budget alerts')} label="Budget alerts" testid="toggle-budget-alerts" />
        </SettingRow>
        <SettingRow title="Two-step sign-in" description="Ask for a one-time code when you sign in">
          <Switch checked={prefs.twofa} onChange={toggle('twofa', 'Two-step sign-in')} label="Two-step sign-in" testid="toggle-2fa" />
        </SettingRow>
      </Card>
    </div>
  );
}

function AccountZone() {
  const { clearExpenses, resetAccount, deleteAccount } = useZary();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(null);
  const close = useCallback(() => setConfirm(null), []);
  const ACTIONS = {
    clear: { title: 'Clear all expenses?', text: 'Every expense you’ve logged will be deleted. Your balances and transfers stay as they are.', label: 'Clear expenses', run: clearExpenses },
    reset: { title: 'Reset account data?', text: 'Expenses and transfers are deleted and both balances go back to their starting amounts.', label: 'Reset data', run: resetAccount },
    delete: { title: 'Delete your account?', text: 'Your account and all its data will be removed. You won’t be able to sign in with it again.', label: 'Delete account', run: () => { deleteAccount(); navigate('/app/login', { replace: true }); } },
  };
  const rows = [
    ['clear', 'Clear all expenses', 'Remove every expense record', 'clear-expenses-button'],
    ['reset', 'Reset account data', 'Start over with the original balances', 'reset-account-button'],
    ['delete', 'Delete account', 'Permanently remove your account', 'delete-account-button'],
  ];
  const a = confirm && ACTIONS[confirm];
  return (
    <Card title="Account" subtitle="These actions can’t be undone">
      {rows.map(([key, title, desc, testid]) => (
        <SettingRow key={key} title={title} description={desc}>
          <Button variant="danger-soft" size="sm" onClick={() => setConfirm(key)} data-testid={testid}>{ACTIONS[key].label}</Button>
        </SettingRow>
      ))}
      <ConfirmDialog open={!!a} title={a?.title} text={a?.text} confirmLabel={a?.label} onCancel={close}
        onConfirm={() => { const run = a.run; setConfirm(null); run(); }} />
    </Card>
  );
}

export default function Profile() {
  const { user, expenses, transfers } = useZary();
  const [tab, setTab] = useState('profile');
  return (
    <div data-testid="page-profile">
      <PageHeader title="Settings" subtitle="Manage your profile, security and preferences." />
      <div className="z-profile">
        <section className="z-card">
          <div className="z-profile-card">
            <Avatar name={user.name} size="lg" />
            <div className="z-profile-name" data-testid="profile-name-display">{user.name}</div>
            <div className="z-profile-email">{user.email}</div>
            <Badge tone="primary" icon="user">Personal account</Badge>
          </div>
          <div className="z-profile-stats">
            <div><strong data-testid="profile-stat-expenses">{expenses.length}</strong><span>Expenses</span></div>
            <div><strong data-testid="profile-stat-transfers">{transfers.length}</strong><span>Transfers</span></div>
            <div><strong data-testid="profile-stat-saved">{savingsRate(expenses)}%</strong><span>Saved</span></div>
          </div>
        </section>
        <div>
          <Tabs tabs={TABS} value={tab} onChange={setTab} label="Settings sections" />
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === 'profile' && <ProfileForm key={user.email + user.name} />}
            {tab === 'security' && <SecurityForm />}
            {tab === 'preferences' && <Preferences />}
            {tab === 'account' && <AccountZone />}
          </div>
        </div>
      </div>
    </div>
  );
}
