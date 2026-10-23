import { useZary } from '../store.jsx';
import PageHead from './PageHead.jsx';

export default function Budget() {
  const { expenses, budgets } = useZary();
  return (
    <div className="page on" id="p-budget" data-testid="page-budget">
      <PageHead title="Budget" sub="Monthly spending limits by category" />
      <div className="budget-grid" data-testid="budget-grid">
        {budgets.map((b) => {
          const spent = expenses.filter((e) => e.cat === b.cat).reduce((s, e) => s + e.amount, 0);
          const pct = Math.min(Math.round((spent / b.limit) * 100), 100);
          const cls = pct >= 100 ? 'over' : pct >= 75 ? 'warn' : 'safe';
          const key = b.cat.toLowerCase();
          return (
            <div className="bcard" key={b.cat} data-testid={`budget-${key}`}>
              <div className="bcard-top">
                <div className="bcat">{b.cat}</div>
                <div className="bamts">{spent.toLocaleString('en-US')}<br /><span style={{ color: 'var(--dim)' }}>/ {b.limit.toLocaleString('en-US')}</span></div>
              </div>
              <div className="pbar"><div className={`pfill ${cls}`} style={{ width: `${pct}%` }} /></div>
              <div className="ppct" data-testid={`budget-pct-${key}`}>{pct}% used</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
