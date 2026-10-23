import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES, useZary } from '../store.jsx';
import { Badge, Button, Card, EmptyState, Field, PageHeader, Pagination, SelectInput, SettingRow, Switch, TextInput, TxRow, money } from '../ui/index.jsx';

const PAGE_SIZE = 8;

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, showToast } = useZary();
  const [params, setParams] = useSearchParams();
  const descRef = useRef(null);
  const [form, setForm] = useState({ desc: '', amount: '', cat: 'Food', recurring: false });
  const [errors, setErrors] = useState({});
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (params.get('new')) {
      descRef.current && descRef.current.focus();
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...expenses].reverse().filter((e) => (!q || e.desc.toLowerCase().includes(q) || e.cat.toLowerCase().includes(q)) && (!filterCat || e.cat === filterCat));
  }, [expenses, query, filterCat]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const items = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const filtering = query.trim() || filterCat;

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function submit(e) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    const next = {};
    if (!form.desc.trim()) next.desc = 'Add a short description.';
    if (!amt || amt <= 0) next.amount = 'Enter an amount greater than 0.';
    setErrors(next);
    if (Object.keys(next).length) { (next.desc ? descRef.current : document.getElementById('eamt')).focus(); return; }
    addExpense({ desc: form.desc.trim(), amount: amt, cat: form.cat, recurring: form.recurring });
    setForm((f) => ({ ...f, desc: '', amount: '', recurring: false }));
    descRef.current.focus();
  }

  function exportCSV() {
    if (!expenses.length) { showToast('No expenses to export'); return; }
    const rows = [['ID', 'Description', 'Category', 'Recurring', 'Amount (XOF)', 'Date'],
      ...expenses.map((x) => [x.id, `"${x.desc.replace(/"/g, '""')}"`, x.cat, x.recurring ? 'Yes' : 'No', x.amount, `"${x.date}"`])];
    const url = URL.createObjectURL(new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'zary-expenses.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${expenses.length} ${expenses.length === 1 ? 'expense' : 'expenses'}`);
  }

  const clearFilters = () => { setQuery(''); setFilterCat(''); setPage(1); };

  return (
    <div data-testid="page-expenses">
      <PageHeader
        title="Expenses"
        subtitle={expenses.length ? `${expenses.length} ${expenses.length === 1 ? 'expense' : 'expenses'}, ${money(total)} in total this month` : 'Log what you spend to see where your money goes.'}
        actions={<Button variant="secondary" icon="download" onClick={exportCSV} data-testid="export-csv">Export CSV</Button>}
      />

      <div className="z-split">
        <Card title="Add an expense" subtitle="It shows up in your budget straight away" className="z-sticky">
          <form className="z-form" onSubmit={submit} noValidate>
            <Field label="Description" htmlFor="edesc" error={errors.desc} errorTestId="expense-description-error">
              <TextInput id="edesc" ref={descRef} placeholder="e.g. Lunch at the market" value={form.desc} invalid={!!errors.desc}
                onChange={(e) => set('desc')(e.target.value)} data-testid="expense-description" maxLength={60} />
            </Field>
            <div className="z-form-row">
              <Field label="Amount" htmlFor="eamt" error={errors.amount} errorTestId="expense-amount-error">
                <TextInput id="eamt" type="number" inputMode="decimal" min="1" placeholder="0" suffix="XOF" value={form.amount} invalid={!!errors.amount}
                  onChange={(e) => set('amount')(e.target.value)} data-testid="expense-amount" />
              </Field>
              <Field label="Category" htmlFor="ecat">
                <SelectInput id="ecat" value={form.cat} onChange={(e) => set('cat')(e.target.value)} data-testid="expense-category">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </SelectInput>
              </Field>
            </div>
            <SettingRow title="Repeats monthly" description="Mark bills and subscriptions">
              <Switch checked={form.recurring} onChange={set('recurring')} label="Repeats monthly" testid="expense-recurring" />
            </SettingRow>
            {(errors.desc || errors.amount) && <div className="z-sr" role="status" data-testid="expense-error">Please fix the highlighted fields.</div>}
            <Button type="submit" size="lg" block icon="plus" data-testid="add-expense-button">Add expense</Button>
          </form>
        </Card>

        <Card bodyClass={null}>
          <div className="z-toolbar">
            <div className="z-grow">
              <TextInput icon="search" type="search" placeholder="Search expenses" aria-label="Search expenses" value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }} data-testid="search-expenses" />
            </div>
            <SelectInput aria-label="Filter by category" value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setPage(1); }} data-testid="filter-category">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </SelectInput>
            <Badge tone="primary" data-testid="expense-count">{filtered.length} entries</Badge>
          </div>

          {items.length === 0 ? (
            expenses.length === 0 ? (
              <EmptyState icon="receipt" title="No expenses yet" text="Add your first one with the form and it will appear here." testid="empty-expenses"
                action={<Button variant="secondary" size="sm" icon="plus" onClick={() => descRef.current.focus()}>Add an expense</Button>} />
            ) : (
              <EmptyState icon="search" title="No matching expenses" text="Try another search term or category." testid="empty-expenses"
                action={filtering ? <Button variant="secondary" size="sm" onClick={clearFilters} data-testid="clear-filters">Clear filters</Button> : null} />
            )
          ) : (
            <div className="z-list" data-testid="expenses-table">
              {items.map((x) => (
                <TxRow key={x.id} cat={x.cat} title={x.desc} amount={x.amount} testid={`expense-row-${x.id}`}
                  meta={<><span>{x.cat}</span><span aria-hidden="true">·</span><span>{x.date}</span>{x.recurring && <Badge tone="primary" icon="repeat">Monthly</Badge>}</>}
                  actions={<Button variant="ghost" size="sm" iconOnly icon="trash" onClick={() => deleteExpense(x.id)} aria-label={`Remove ${x.desc}`} data-testid={`delete-expense-${x.id}`} />} />
              ))}
            </div>
          )}
          <Pagination page={current} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </Card>
      </div>
    </div>
  );
}
