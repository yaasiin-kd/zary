import { CAT_BADGE, MONTHLY_INCOME, fmt, savingsRate, useZary } from '../store.jsx';
import Icon from '../../components/icons.jsx';
import PageHead from './PageHead.jsx';

const BASE_TXN = [
  { desc: 'Salary deposit', cat: 'Income', date: 'Oct 1, 2026', amt: '+450,000', pos: true },
  { desc: 'Grocery shopping', cat: 'Food', date: 'Oct 3, 2026', amt: '-18,500', pos: false },
  { desc: 'Mobile data', cat: 'Utilities', date: 'Oct 5, 2026', amt: '-5,000', pos: false },
];

export default function Dashboard() {
  const { expenses, mainBal, savBal, theme, toggleTheme } = useZary();
  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const recent = [
    ...BASE_TXN,
    ...expenses.slice(-3).map((e) => ({ desc: e.desc, cat: e.cat, date: e.date, amt: `-${fmt(e.amount)}`, pos: false })),
  ];

  return (
    <div className="page on" id="p-dashboard" data-testid="page-dashboard">
      <PageHead title="Overview" sub="Your financial snapshot">
        <button className="theme-btn" type="button" onClick={toggleTheme} data-testid="theme-toggle">
          <Icon name="sun" size={14} />
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </PageHead>
      <div className="stats">
        <div className="stat stat-acc"><div className="stat-label">Total balance</div><div className="stat-val" data-testid="total-balance">XOF {fmt(mainBal + savBal)}</div><div className="stat-sub">Across 2 accounts</div></div>
        <div className="stat stat-green"><div className="stat-label">Income this month</div><div className="stat-val green" data-testid="monthly-income">XOF {fmt(MONTHLY_INCOME)}</div><div className="stat-sub">+8% vs last month</div></div>
        <div className="stat stat-red"><div className="stat-label">Expenses this month</div><div className="stat-val red" data-testid="monthly-expenses">XOF {fmt(spent)}</div><div className="stat-sub">Budget: XOF 300,000</div></div>
        <div className="stat stat-purple"><div className="stat-label">Savings rate</div><div className="stat-val purple" data-testid="savings-rate">{savingsRate(expenses)}%</div><div className="stat-sub">Goal: 40%</div></div>
      </div>
      <div className="table-wrap">
        <div className="table-head"><span className="table-title">Recent transactions</span></div>
        <table data-testid="transactions-table">
          <thead><tr><th>Description</th><th>Category</th><th>Date</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
          <tbody>
            {recent.map((t, i) => (
              <tr key={i}>
                <td>{t.desc}</td>
                <td><span className={`badge ${CAT_BADGE[t.cat] || 'b-blue'}`}>{t.cat}</span></td>
                <td>{t.date}</td>
                <td className={`mono ${t.pos ? 'pos' : 'neg'}`} style={{ textAlign: 'right' }}>{t.amt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
