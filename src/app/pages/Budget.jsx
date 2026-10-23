import { useState } from 'react';
import { useZary } from '../store.jsx';
import { Badge, Button, Card, CatIcon, Field, PageHeader, Progress, TextInput, fmt, money } from '../ui/index.jsx';

function status(pct) {
  if (pct >= 100) return { tone: 'red', label: 'Over budget', icon: 'alert' };
  if (pct >= 75) return { tone: 'gold', label: 'Close to limit', icon: 'alert' };
  return { tone: 'green', label: 'On track', icon: 'check' };
}

function BudgetCard({ b, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(b.limit));
  const [error, setError] = useState('');
  const pct = Math.round((b.spent / b.limit) * 100);
  const s = status(pct);
  const key = b.cat.toLowerCase();
  const left = b.limit - b.spent;

  function save(e) {
    e.preventDefault();
    const err = onSave(b.cat, value);
    if (err) { setError(err); return; }
    setError(''); setEditing(false);
  }
  function cancel() { setValue(String(b.limit)); setError(''); setEditing(false); }

  return (
    <section className="z-card z-budget" data-testid={`budget-${key}`}>
      <div className="z-budget-head">
        <CatIcon cat={b.cat} />
        <span className="z-budget-name">{b.cat}</span>
        <Badge tone={s.tone} icon={s.icon}>{s.label}</Badge>
      </div>
      <div className="z-budget-amounts">
        <span className="z-budget-spent">{fmt(b.spent)} <small className="z-muted" style={{ fontSize: 13, fontWeight: 500 }}>XOF</small></span>
        <span className="z-muted" style={{ fontSize: 13 }}>of {money(b.limit)}</span>
      </div>
      <Progress value={pct} tone={s.tone} label={`${b.cat} budget used`} />
      {editing ? (
        <form className="z-budget-edit" onSubmit={save} noValidate>
          <Field htmlFor={`limit-${key}`} error={error}>
            <TextInput id={`limit-${key}`} type="number" min="1" suffix="XOF" value={value} invalid={!!error} autoFocus
              aria-label={`${b.cat} monthly limit`} onChange={(e) => setValue(e.target.value)} data-testid={`budget-limit-${key}`} />
          </Field>
          <Button type="submit" iconOnly icon="check" aria-label="Save limit" data-testid={`budget-save-${key}`} />
          <Button variant="ghost" iconOnly icon="x" onClick={cancel} aria-label="Cancel" />
        </form>
      ) : (
        <div className="z-budget-foot">
          <span data-testid={`budget-pct-${key}`}>{pct}% used</span>
          <span>{left >= 0 ? `${money(left)} left` : `${money(-left)} over`}</span>
          <Button variant="ghost" size="sm" icon="edit" onClick={() => setEditing(true)} data-testid={`budget-edit-${key}`}>Edit</Button>
        </div>
      )}
    </section>
  );
}

export default function Budget() {
  const { expenses, budgets, setBudgetLimit } = useZary();
  const rows = budgets.map((b) => ({ ...b, spent: expenses.filter((e) => e.cat === b.cat).reduce((s, e) => s + e.amount, 0) }));
  const totalLimit = rows.reduce((s, b) => s + b.limit, 0);
  const totalSpent = rows.reduce((s, b) => s + b.spent, 0);
  const totalPct = Math.round((totalSpent / totalLimit) * 100);
  const over = rows.filter((b) => b.spent >= b.limit).length;
  const close = rows.filter((b) => b.spent / b.limit >= 0.75 && b.spent < b.limit).length;

  return (
    <div data-testid="page-budget">
      <PageHeader title="Budget" subtitle="Set a monthly limit for each category and see how you’re tracking." />
      <Card>
        <div className="z-overview">
          <div>
            <div className="z-muted" style={{ fontSize: 13.5, fontWeight: 500 }}>Spent this month</div>
            <div className="z-overview-amount" data-testid="budget-total">{money(totalSpent)} <small>of {money(totalLimit)}</small></div>
            <Progress large value={totalPct} tone={totalPct >= 100 ? 'red' : totalPct >= 75 ? 'gold' : 'primary'} label="Total budget used" />
          </div>
          <div className="z-mini"><span>Remaining</span><strong>{fmt(Math.max(0, totalLimit - totalSpent))}</strong></div>
          <div className="z-mini"><span>Close to limit</span><strong>{close}</strong></div>
          <div className="z-mini"><span>Over budget</span><strong className={over ? 'z-neg' : undefined}>{over}</strong></div>
        </div>
      </Card>
      <div className="z-budget-grid" data-testid="budget-grid">
        {rows.map((b) => <BudgetCard key={`${b.cat}-${b.limit}`} b={b} onSave={setBudgetLimit} />)}
      </div>
    </div>
  );
}
