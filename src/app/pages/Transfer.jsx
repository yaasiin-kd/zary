import { useState } from 'react';
import { useZary } from '../store.jsx';
import { Badge, Button, Card, EmptyState, Field, Icon, PageHeader, TextInput, TxRow, fmt, money } from '../ui/index.jsx';

const QUICK = [10000, 25000, 50000, 100000];

export default function Transfer() {
  const { mainBal, savBal, transfers, transfer } = useZary();
  const [direction, setDirection] = useState('toSavings');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const toSavings = direction === 'toSavings';
  const from = toSavings ? { name: 'Main account', icon: 'wallet', bal: mainBal } : { name: 'Savings', icon: 'bank', bal: savBal };
  const to = toSavings ? { name: 'Savings', icon: 'bank', bal: savBal } : { name: 'Main account', icon: 'wallet', bal: mainBal };
  const amt = parseFloat(amount) || 0;

  function submit(e) {
    e.preventDefault();
    const err = transfer(amount, note.trim(), direction);
    if (err) { setError(err); document.getElementById('tamt').focus(); return; }
    setError(''); setAmount(''); setNote('');
  }
  function pick(v) { setAmount(String(v)); setError(''); }

  return (
    <div data-testid="page-transfer">
      <PageHeader title="Transfer" subtitle="Move money between your main account and savings." />

      <div className="z-split">
        <Card title="New transfer" className="z-sticky">
          <form className="z-form" onSubmit={submit} noValidate>
            <div className="z-accounts">
              <div className="z-account">
                <div className="z-account-role">From</div>
                <div className="z-account-name"><Icon name={from.icon} size={17} />{from.name}</div>
                <div className="z-account-bal">{money(from.bal)}</div>
              </div>
              <button type="button" className={`z-swap${toSavings ? '' : ' is-flipped'}`} onClick={() => { setDirection(toSavings ? 'toMain' : 'toSavings'); setError(''); }}
                aria-label="Swap accounts" title="Swap accounts" data-testid="transfer-swap">
                <Icon name="chevronRight" size={18} />
              </button>
              <div className="z-account">
                <div className="z-account-role">To</div>
                <div className="z-account-name"><Icon name={to.icon} size={17} />{to.name}</div>
                <div className="z-account-bal">{money(to.bal)}</div>
              </div>
            </div>

            <Field label="Amount" htmlFor="tamt" error={error} errorTestId="transfer-error" hint={`Available: ${money(from.bal)}`}>
              <TextInput id="tamt" type="number" inputMode="decimal" min="1" placeholder="0" suffix="XOF" value={amount} invalid={!!error}
                onChange={(e) => { setAmount(e.target.value); setError(''); }} data-testid="transfer-amount" />
            </Field>
            <div className="z-chips" role="group" aria-label="Quick amounts">
              {QUICK.map((v) => (
                <button key={v} type="button" className={`z-chip${amt === v ? ' active' : ''}`} onClick={() => pick(v)} data-testid={`transfer-quick-${v}`}>{fmt(v)}</button>
              ))}
            </div>
            <Field label="Note" optional htmlFor="tnote">
              <TextInput id="tnote" placeholder="e.g. Monthly savings" value={note} maxLength={40} onChange={(e) => setNote(e.target.value)} data-testid="transfer-note" />
            </Field>
            <Button type="submit" size="lg" block icon="swap" data-testid="transfer-button">
              {amt > 0 ? `Transfer ${money(amt)}` : 'Transfer funds'}
            </Button>
          </form>
        </Card>

        <div className="z-stack">
          <div className="z-wallets">
            <section className="z-card z-wallet">
              <span className="z-stat-icon"><Icon name="wallet" size={18} /></span>
              <div><div className="z-wallet-label">Main account</div><div className="z-wallet-value" data-testid="main-balance">{money(mainBal)}</div></div>
            </section>
            <section className="z-card z-wallet">
              <span className="z-stat-icon tone-green"><Icon name="bank" size={18} /></span>
              <div><div className="z-wallet-label">Savings</div><div className="z-wallet-value" data-testid="savings-balance">{money(savBal)}</div></div>
            </section>
          </div>

          <Card title="Transfer history" subtitle={transfers.length ? `${transfers.length} ${transfers.length === 1 ? 'transfer' : 'transfers'} this month` : undefined} bodyClass="z-card-flush">
            {transfers.length === 0 ? (
              <EmptyState icon="swap" title="No transfers yet" text="Money you move between accounts will be listed here." testid="empty-transfers" />
            ) : (
              <div className="z-list" data-testid="transfer-history-table">
                {[...transfers].reverse().map((t) => (
                  <TxRow key={t.id} cat="Transfer" title={t.note} amount={t.amount} positive={t.direction === 'toMain'} testid={`transfer-row-${t.id}`}
                    meta={<><span>{t.direction === 'toMain' ? 'Savings to Main' : 'Main to Savings'}</span><span aria-hidden="true">·</span><span>{t.date}</span><Badge tone="green" icon="check">Completed</Badge></>} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
