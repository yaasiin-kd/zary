import { Link } from 'react-router-dom';
import { MONTHLY_INCOME, savingsRate, useZary } from '../store.jsx';
import { NOTE_LINES } from '../../landing/guilloche.js';
import { Badge, Card, EmptyState, Icon, LinkButton, PageHeader, Progress, StatCard, TxRow, fmt, money } from '../ui/index.jsx';

const SAVINGS_GOAL = 40;
const MONTH_BUDGET = 300000;
const BASE_ACTIVITY = [
  { id: 3, cat: 'Utilities', title: 'Mobile data', meta: 'Utilities', date: '5 Oct 2026', amount: 5000 },
  { id: 2, cat: 'Food', title: 'Grocery shopping', meta: 'Food', date: '3 Oct 2026', amount: 18500 },
  { id: 1, cat: 'Income', title: 'Salary deposit', meta: 'Income', date: '1 Oct 2026', amount: 450000, positive: true },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function SavingsRing({ value }) {
  const r = 48;
  const c = 2 * Math.PI * r;
  const shown = Math.min(value, 100);
  return (
    <div className="z-ring">
      <svg viewBox="0 0 112 112" aria-hidden="true">
        <circle className="z-ring-track" cx="56" cy="56" r={r} fill="none" strokeWidth="10" />
        <circle className="z-ring-fill" cx="56" cy="56" r={r} fill="none" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} />
      </svg>
      <div className="z-ring-center"><div><span className="z-ring-value" data-testid="savings-rate">{value}%</span><span className="z-ring-label">saved</span></div></div>
    </div>
  );
}

export default function Dashboard() {
  const { user, expenses, transfers, budgets, mainBal, savBal } = useZary();
  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const rate = savingsRate(expenses);
  const firstName = user.name.split(' ')[0];

  const activity = [
    ...expenses.map((e) => ({ id: e.id, cat: e.cat, title: e.desc, meta: e.recurring ? `${e.cat}, monthly` : e.cat, date: e.date, amount: e.amount })),
    ...transfers.map((t) => ({ id: t.id, cat: 'Transfer', title: t.note, meta: t.direction === 'toMain' ? 'Savings to Main' : 'Main to Savings', date: t.date, amount: t.amount, transfer: true })),
    ...BASE_ACTIVITY,
  ].sort((a, b) => b.id - a.id).slice(0, 6);

  const health = budgets
    .map((b) => ({ ...b, spent: expenses.filter((e) => e.cat === b.cat).reduce((s, e) => s + e.amount, 0) }))
    .map((b) => ({ ...b, pct: Math.round((b.spent / b.limit) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);

  return (
    <div data-testid="page-dashboard">
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        subtitle="Here’s where your money stands this month."
        actions={<>
          <LinkButton variant="secondary" icon="swap" to="/app/transfer">Transfer</LinkButton>
          <LinkButton icon="plus" to="/app/expenses?new=1" data-testid="dash-add-expense">Add expense</LinkButton>
        </>}
      />

      <div className="z-dash-top">
        <section className="z-balance" aria-label="Total balance">
          <svg className="z-guilloche" viewBox="0 0 560 270" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
            {NOTE_LINES.map((l, i) => <path key={i} d={l.d} fill="none" stroke={l.stroke} strokeWidth={l.w} />)}
          </svg>
          <div className="z-balance-top"><span className="z-balance-label">Total balance</span><span className="z-seal" aria-hidden="true">F</span></div>
          <div><div className="z-balance-value" data-testid="total-balance">{money(mainBal + savBal)}</div></div>
          <div className="z-balance-split">
            <div><span>Main account</span><strong>{money(mainBal)}</strong></div>
            <div><span>Savings</span><strong>{money(savBal)}</strong></div>
          </div>
          <div className="z-balance-actions">
            <LinkButton variant="light" size="sm" icon="plus" to="/app/expenses?new=1">Add expense</LinkButton>
            <LinkButton variant="glass" size="sm" icon="swap" to="/app/transfer">Move to savings</LinkButton>
          </div>
        </section>

        <Card title="Savings goal" subtitle={`Keep at least ${SAVINGS_GOAL}% of your income`}>
          <div className="z-goal">
            <SavingsRing value={rate} />
            <div>
              {rate >= SAVINGS_GOAL
                ? <Badge tone="green" icon="check">On track</Badge>
                : <Badge tone="gold" icon="alert">Below goal</Badge>}
              <p className="z-muted" style={{ marginTop: 10, fontSize: 14 }}>
                You’ve kept <strong style={{ color: 'var(--z-text)' }}>{money(Math.max(0, MONTHLY_INCOME - spent))}</strong> of {money(MONTHLY_INCOME)} this month.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="z-grid-3">
        <StatCard label="Income this month" value={money(MONTHLY_INCOME)} icon="trendUp" tone="green" testid="monthly-income" foot="+8% compared with last month" />
        <StatCard label="Spent this month" value={money(spent)} icon="receipt" tone="red" testid="monthly-expenses"
          foot={`${expenses.length} ${expenses.length === 1 ? 'expense' : 'expenses'} logged`} />
        <StatCard label="Monthly budget used" value={`${Math.round((spent / MONTH_BUDGET) * 100)}%`} icon="pie" tone="gold" testid="budget-used"
          foot={`${money(Math.max(0, MONTH_BUDGET - spent))} left of ${money(MONTH_BUDGET)}`}>
          <Progress value={(spent / MONTH_BUDGET) * 100} tone={spent > MONTH_BUDGET ? 'red' : spent > MONTH_BUDGET * 0.75 ? 'gold' : 'primary'} label="Monthly budget used" />
        </StatCard>
      </div>

      <div className="z-dash-bottom">
        <Card title="Recent activity" action={<LinkButton variant="ghost" size="sm" to="/app/expenses">View all</LinkButton>} bodyClass="z-card-flush">
          <div className="z-list" data-testid="transactions-table">
            {activity.map((a) => (
              <TxRow key={a.id} cat={a.cat} title={a.title} meta={<><span>{a.meta}</span><span aria-hidden="true">·</span><span>{a.date}</span></>}
                amount={a.amount} positive={a.positive} testid="activity-row" />
            ))}
          </div>
        </Card>

        <Card title="Budget health" subtitle="Categories closest to their limit" action={<LinkButton variant="ghost" size="sm" to="/app/budget">Manage</LinkButton>}>
          {spent === 0 ? (
            <EmptyState icon="pie" title="Nothing spent yet" text="Log an expense and you’ll see how each category tracks against its budget." />
          ) : (
            <div className="z-health">
              {health.map((b) => (
                <Link key={b.cat} to="/app/budget" className="z-health-row" style={{ textDecoration: 'none' }}>
                  <div className="z-health-main">
                    <div className="z-health-top"><span>{b.cat}</span><span>{fmt(b.spent)} of {fmt(b.limit)}</span></div>
                    <Progress value={b.pct} tone={b.pct >= 100 ? 'red' : b.pct >= 75 ? 'gold' : 'green'} label={`${b.cat} budget used`} />
                  </div>
                  <Icon name="chevronRight" size={16} />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
