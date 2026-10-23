import { useMemo, useState } from 'react';
import { CATEGORIES, CAT_BADGE, fmt, useZary } from '../store.jsx';
import Icon from '../../components/icons.jsx';
import PageHead from './PageHead.jsx';

const PAGE_SIZE = 8;

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, showToast } = useZary();
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('Food');
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return expenses.filter((e) => (!q || e.desc.toLowerCase().includes(q) || e.cat.toLowerCase().includes(q)) && (!filterCat || e.cat === filterCat));
  }, [expenses, query, filterCat]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const items = filtered.slice(start, start + PAGE_SIZE);

  function submit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!desc.trim() || !amt || amt <= 0) { setError(true); return; }
    setError(false);
    addExpense({ desc: desc.trim(), amount: amt, cat, recurring });
    setDesc(''); setAmount(''); setRecurring(false);
  }

  function exportCSV() {
    if (!expenses.length) { showToast('No expenses to export'); return; }
    const rows = [['ID', 'Description', 'Category', 'Recurring', 'Amount', 'Date'],
      ...expenses.map((e) => [e.id, `"${e.desc.replace(/"/g, '""')}"`, e.cat, e.recurring ? 'Yes' : 'No', e.amount, `"${e.date}"`])];
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'zary-expenses.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${expenses.length} expenses`);
  }

  return (
    <div className="page on" id="p-expenses" data-testid="page-expenses">
      <PageHead title="Expenses" sub="Track where your money goes" />
      <form className="form-card" onSubmit={submit} noValidate>
        <h3>Add an expense</h3>
        <div className="form-row">
          <div className="field"><label htmlFor="edesc">Description</label><input type="text" id="edesc" placeholder="e.g. Lunch at the market" value={desc} onChange={(e) => setDesc(e.target.value)} data-testid="expense-description" /></div>
          <div className="field"><label htmlFor="eamt">Amount (XOF)</label><input type="number" id="eamt" placeholder="0" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} data-testid="expense-amount" /></div>
          <div className="field"><label htmlFor="ecat">Category</label>
            <select id="ecat" value={cat} onChange={(e) => setCat(e.target.value)} data-testid="expense-category">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <label className={`recurring-chip${recurring ? ' checked' : ''}`}>
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} data-testid="expense-recurring" /> Monthly
          </label>
          <button className="btn btn-sm" type="submit" data-testid="add-expense-button">Add</button>
        </div>
        {error && <div className="err" data-testid="expense-error">Please fill in all fields with valid values.</div>}
      </form>

      <div className="table-wrap">
        <div className="table-head">
          <span className="table-title">All expenses</span>
          <div className="filter-bar">
            <input type="text" placeholder="Search…" aria-label="Search expenses" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} data-testid="search-expenses" />
            <select aria-label="Filter by category" value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setPage(1); }} data-testid="filter-category">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button className="export-btn" type="button" onClick={exportCSV} data-testid="export-csv"><Icon name="download" size={12} />Export CSV</button>
            <span className="badge b-blue" data-testid="expense-count">{filtered.length} entries</span>
          </div>
        </div>
        <table data-testid="expenses-table">
          <thead><tr><th>Description</th><th>Category</th><th>Recurring</th><th>Date</th><th style={{ textAlign: 'right' }}>Amount</th><th /></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr className="empty-row"><td colSpan={6} data-testid="empty-expenses">{expenses.length ? 'No expenses found.' : 'No expenses yet. Add your first one above.'}</td></tr>
            ) : items.map((e) => (
              <tr key={e.id} data-testid={`expense-row-${e.id}`}>
                <td>{e.desc}</td>
                <td><span className={`badge ${CAT_BADGE[e.cat] || 'b-blue'}`}>{e.cat}</span></td>
                <td>{e.recurring ? <span className="badge b-purple">Monthly</span> : '-'}</td>
                <td>{e.date}</td>
                <td className="mono neg" style={{ textAlign: 'right' }}>-{fmt(e.amount)}</td>
                <td style={{ textAlign: 'right' }}><button className="btn-del" type="button" onClick={() => deleteExpense(e.id)} data-testid={`delete-expense-${e.id}`}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <div className="pagination-info" data-testid="pagination-info">
            {filtered.length ? `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length}` : 'Showing 0 of 0'}
          </div>
          {filtered.length > 0 && (
            <div className="pagination-btns">
              <button className="pg-btn" type="button" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Previous page" data-testid="pagination-prev">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`pg-btn${p === current ? ' active' : ''}`} type="button" onClick={() => setPage(p)} data-testid={`pagination-page-${p}`}>{p}</button>
              ))}
              <button className="pg-btn" type="button" disabled={current === totalPages} onClick={() => setPage(current + 1)} aria-label="Next page" data-testid="pagination-next">›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
