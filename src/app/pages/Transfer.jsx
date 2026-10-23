import { useState } from 'react';
import { fmt, useZary } from '../store.jsx';
import PageHead from './PageHead.jsx';

export default function Transfer() {
  const { mainBal, savBal, transfers, transfer } = useZary();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    const err = transfer(amount, note.trim());
    if (err) { setError(err); return; }
    setError(''); setAmount(''); setNote('');
  }

  return (
    <div className="page on" id="p-transfer" data-testid="page-transfer">
      <PageHead title="Transfer" sub="Move funds between your accounts" />
      <div className="acc-cards">
        <div className="acc-card"><div className="acc-lbl">From</div><div className="acc-name">Main Account</div><div className="acc-bal" data-testid="main-balance">XOF {fmt(mainBal)}</div></div>
        <div className="acc-card"><div className="acc-lbl">To</div><div className="acc-name">Savings Account</div><div className="acc-bal" data-testid="savings-balance">XOF {fmt(savBal)}</div></div>
      </div>
      <form className="transfer-form" onSubmit={submit} noValidate>
        <h3>New transfer</h3>
        <div className="field"><label htmlFor="tamt">Amount (XOF)</label><input type="number" id="tamt" placeholder="0" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} data-testid="transfer-amount" /></div>
        <div className="field"><label htmlFor="tnote">Note (optional)</label><input type="text" id="tnote" placeholder="e.g. Monthly savings" value={note} onChange={(e) => setNote(e.target.value)} data-testid="transfer-note" /></div>
        {error && <div className="err" data-testid="transfer-error">{error}</div>}
        <button className="btn" type="submit" data-testid="transfer-button">Transfer funds</button>
      </form>
      <div className="table-wrap">
        <div className="table-head"><span className="table-title">Transfer history</span></div>
        <table data-testid="transfer-history-table">
          <thead><tr><th>Note</th><th>Date</th><th style={{ textAlign: 'right' }}>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr className="empty-row"><td colSpan={4} data-testid="empty-transfers">No transfers yet.</td></tr>
            ) : transfers.map((t) => (
              <tr key={t.id} data-testid={`transfer-row-${t.id}`}>
                <td>{t.note}</td><td>{t.date}</td>
                <td className="mono neg" style={{ textAlign: 'right' }}>-{fmt(t.amount)}</td>
                <td><span className="badge b-green">Completed</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
