import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Health', 'Entertainment', 'Other'];
export const BASE_BUDGETS = [
  { cat: 'Food', limit: 80000 },
  { cat: 'Transport', limit: 40000 },
  { cat: 'Utilities', limit: 30000 },
  { cat: 'Health', limit: 50000 },
  { cat: 'Entertainment', limit: 25000 },
  { cat: 'Other', limit: 20000 },
];
export const CAT_BADGE = {
  Food: 'b-yellow', Transport: 'b-purple', Utilities: 'b-blue', Health: 'b-green',
  Entertainment: 'b-purple', Income: 'b-green', Other: 'b-blue',
};
export const MONTHLY_INCOME = 450000;
const START_MAIN = 940000;
const START_SAVINGS = 300000;

export const fmt = (n) => Number(n).toLocaleString('en-US');
export const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const savingsRate = (expenses) => {
  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  return Math.max(0, Math.round(((MONTHLY_INCOME - spent) / MONTHLY_INCOME) * 100));
};

function readTheme() {
  try { return localStorage.getItem('zary-theme') || 'dark'; } catch { return 'dark'; }
}

const Ctx = createContext(null);
export const useZary = () => useContext(Ctx);

export function AppProvider({ children }) {
  const users = useRef({ 'demo@zary.app': { password: 'demo123', name: 'Demo User' } });
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [mainBal, setMainBal] = useState(START_MAIN);
  const [savBal, setSavBal] = useState(START_SAVINGS);
  const [transfers, setTransfers] = useState([]);
  const [budgets, setBudgets] = useState(BASE_BUDGETS);
  const [currency, setCurrency] = useState('XOF');
  const [theme, setThemeState] = useState(readTheme);
  const [toast, setToast] = useState(null);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    try { localStorage.setItem('zary-theme', t); } catch { /* storage unavailable */ }
  }, []);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const showToast = useCallback((msg, undo) => setToast({ id: Date.now() + Math.random(), msg, undo: undo || null }), []);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), toast.undo ? 4000 : 2500);
    return () => clearTimeout(t);
  }, [toast]);
  const undoToast = () => {
    if (toast && toast.undo) { toast.undo(); showToast('Action undone'); }
  };

  const resetData = () => {
    setExpenses([]); setTransfers([]); setMainBal(START_MAIN); setSavBal(START_SAVINGS);
  };

  function login(email, password) {
    if (!email || !password) return 'Please fill in all fields.';
    const u = users.current[email];
    if (!u || u.password !== password) return 'Invalid email or password.';
    setPending({ email, name: u.name, isNew: false });
    return null;
  }
  function register(name, email, password) {
    if (!name || !email || !password) return 'Please fill in all fields.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (users.current[email]) return 'An account with this email already exists.';
    users.current[email] = { password, name };
    setPending({ email, name, isNew: true });
    return null;
  }
  function finishAuth(newBudgets, newCurrency) {
    if (!pending) return;
    if (newBudgets) setBudgets(newBudgets);
    if (newCurrency) setCurrency(newCurrency);
    setUser({ email: pending.email, name: pending.name });
    setPending(null);
  }
  function logout() {
    setUser(null); setPending(null); resetData(); setBudgets(BASE_BUDGETS);
  }

  function addExpense({ desc, amount, cat, recurring }) {
    const exp = { id: Date.now(), desc, amount, cat, recurring, date: today() };
    setExpenses((p) => [...p, exp]);
    showToast('Expense added', () => setExpenses((p) => p.filter((e) => e.id !== exp.id)));
  }
  function deleteExpense(id) {
    const exp = expenses.find((e) => e.id === id);
    setExpenses((p) => p.filter((e) => e.id !== id));
    if (exp) showToast('Expense removed', () => setExpenses((p) => [...p, exp].sort((a, b) => a.id - b.id)));
  }
  function clearExpenses() { setExpenses([]); showToast('All expenses cleared'); }
  function resetAccount() { resetData(); showToast('Account data reset'); }
  function deleteAccount() { if (user) delete users.current[user.email]; logout(); }

  function transfer(amount, note, direction = 'toSavings') {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return 'Enter a valid amount.';
    const toSavings = direction === 'toSavings';
    if (amt > (toSavings ? mainBal : savBal)) return `Insufficient balance in ${toSavings ? 'Main' : 'Savings'} Account.`;
    setMainBal((b) => (toSavings ? b - amt : b + amt));
    setSavBal((b) => (toSavings ? b + amt : b - amt));
    setTransfers((p) => [...p, { id: Date.now(), note: note || 'Transfer', amount: amt, direction, date: today() }]);
    showToast('Transfer successful');
    return null;
  }
  function setBudgetLimit(cat, limit) {
    const v = parseFloat(limit);
    if (!v || v <= 0) return 'Enter a limit greater than 0.';
    setBudgets((p) => p.map((b) => (b.cat === cat ? { ...b, limit: v } : b)));
    showToast(`${cat} budget updated`);
    return null;
  }

  function saveProfile(fname, lname, email) {
    if (!fname || !email) return 'Please fill in your name and email.';
    const old = user.email;
    if (email !== old && users.current[email]) return 'An account with this email already exists.';
    const name = (fname + (lname ? ' ' + lname : '')).trim();
    const rec = users.current[old] || { password: '' };
    if (email !== old) delete users.current[old];
    users.current[email] = { ...rec, name };
    setUser({ email, name });
    showToast('Profile saved');
    return null;
  }
  function changePassword(cur, next, confirm) {
    if (!cur || !next || !confirm) return 'Please fill in all fields.';
    const rec = users.current[user.email];
    if (rec && rec.password !== cur) return 'Current password is incorrect.';
    if (next.length < 6) return 'New password must be at least 6 characters.';
    if (next !== confirm) return 'Passwords do not match.';
    if (rec) rec.password = next;
    showToast('Password updated');
    return null;
  }

  const value = {
    user, pending, expenses, mainBal, savBal, transfers, budgets, currency, theme, toast,
    setCurrency, setTheme, toggleTheme, showToast, undoToast,
    login, register, finishAuth, logout,
    addExpense, deleteExpense, clearExpenses, resetAccount, deleteAccount,
    transfer, setBudgetLimit, saveProfile, changePassword,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
