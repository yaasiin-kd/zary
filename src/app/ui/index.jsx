import { forwardRef, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

export { Icon };

const cx = (...c) => c.filter(Boolean).join(' ');
export const fmt = (n) => Math.round(Number(n)).toLocaleString('en-US');
export const money = (n) => `XOF ${fmt(n)}`;
export const initialsOf = (name = '') => name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

/* Buttons */
function btnClass({ variant = 'primary', size, block, iconOnly, className }) {
  return cx('z-btn', `z-btn-${variant}`, size && `z-btn-${size}`, block && 'z-btn-block', iconOnly && 'z-btn-icon', className);
}
export const Button = forwardRef(function Button({ variant, size, block, icon, iconOnly, className, children, type = 'button', ...rest }, ref) {
  return (
    <button ref={ref} type={type} className={btnClass({ variant, size, block, iconOnly, className })} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}
      {children}
    </button>
  );
});
export function LinkButton({ variant, size, block, icon, className, children, ...rest }) {
  return (
    <Link className={btnClass({ variant, size, block, className })} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}
      {children}
    </Link>
  );
}

/* Layout pieces */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="z-page-head">
      <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      {actions && <div className="z-page-actions">{actions}</div>}
    </div>
  );
}
export function Card({ title, subtitle, action, children, className, bodyClass = 'z-card-body', footer, ...rest }) {
  return (
    <section className={cx('z-card', className)} {...rest}>
      {(title || action) && (
        <div className="z-card-head">
          <div>{title && <h2 className="z-card-title">{title}</h2>}{subtitle && <div className="z-card-sub">{subtitle}</div>}</div>
          {action}
        </div>
      )}
      {bodyClass === null ? children : <div className={bodyClass}>{children}</div>}
      {footer && <div className="z-card-foot">{footer}</div>}
    </section>
  );
}

/* Form controls */
export function Field({ label, htmlFor, optional, hint, error, errorTestId, children }) {
  return (
    <div className="z-field">
      {label && <label className="z-label" htmlFor={htmlFor}>{label}{optional && <span className="z-label-opt">Optional</span>}</label>}
      {children}
      {error ? (
        <div className="z-error" role="alert" id={htmlFor ? `${htmlFor}-error` : undefined} data-testid={errorTestId}><Icon name="alert" size={14} />{error}</div>
      ) : hint ? <div className="z-hint">{hint}</div> : null}
    </div>
  );
}
export const TextInput = forwardRef(function TextInput({ icon, suffix, invalid, className, id, ...rest }, ref) {
  return (
    <div className={cx('z-control', icon && 'has-icon', suffix && 'has-suffix')}>
      {icon && <span className="z-control-icon"><Icon name={icon} size={17} /></span>}
      <input ref={ref} id={id} className={cx('z-input', invalid && 'is-invalid', className)} aria-invalid={invalid || undefined} aria-describedby={invalid && id ? `${id}-error` : undefined} {...rest} />
      {suffix && <span className="z-control-suffix">{suffix}</span>}
    </div>
  );
});
export function SelectInput({ invalid, children, className, ...rest }) {
  return (
    <div className="z-control is-select">
      <select className={cx('z-input', invalid && 'is-invalid', className)} aria-invalid={invalid || undefined} {...rest}>{children}</select>
      <span className="z-control-chevron"><Icon name="chevronDown" size={16} /></span>
    </div>
  );
}
export function Switch({ checked, onChange, label, testid, id }) {
  return (
    <span className="z-switch">
      <input type="checkbox" role="switch" id={id} checked={checked} aria-label={label} onChange={(e) => onChange(e.target.checked)} data-testid={testid} />
      <span className="z-switch-track" />
      <span className="z-switch-thumb" />
    </span>
  );
}
export function SettingRow({ title, description, children }) {
  return (
    <div className="z-setting">
      <div><div className="z-setting-title">{title}</div>{description && <div className="z-setting-desc">{description}</div>}</div>
      {children}
    </div>
  );
}

/* Display */
export function Badge({ tone, icon, children, ...rest }) {
  return <span className={cx('z-badge', tone && `z-badge-${tone}`)} {...rest}>{icon && <Icon name={icon} size={13} strokeWidth={2.2} />}{children}</span>;
}
export function Progress({ value, tone = 'primary', large, label }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cx('z-progress', large && 'z-progress-lg')} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v)} aria-label={label}>
      <div className={cx('z-progress-fill', `tone-${tone}`)} style={{ width: `${v}%` }} />
    </div>
  );
}
export function StatCard({ label, value, foot, icon, tone, testid, children }) {
  return (
    <section className="z-card z-stat">
      <div className="z-stat-top"><span className="z-stat-label">{label}</span>{icon && <span className={cx('z-stat-icon', tone && `tone-${tone}`)}><Icon name={icon} size={17} /></span>}</div>
      <div className="z-stat-value" data-testid={testid}>{value}</div>
      {children}
      {foot && <div className="z-stat-foot">{foot}</div>}
    </section>
  );
}
export function Avatar({ name, size, ...rest }) {
  return <span className={cx('z-avatar', size && `z-avatar-${size}`)} aria-hidden="true" {...rest}>{initialsOf(name)}</span>;
}
const CAT_ICON = { Food: 'food', Transport: 'transport', Utilities: 'bolt', Health: 'heart', Entertainment: 'play', Other: 'dots', Income: 'arrowIn', Transfer: 'swap' };
export function CatIcon({ cat, small }) {
  return <span className={cx('z-cat', small && 'z-cat-sm')} data-cat={cat} aria-hidden="true"><Icon name={CAT_ICON[cat] || 'dots'} size={small ? 16 : 18} /></span>;
}
export function EmptyState({ icon = 'inbox', title, text, action, testid }) {
  return (
    <div className="z-empty" data-testid={testid}>
      <span className="z-empty-icon"><Icon name={icon} size={24} /></span>
      <div className="z-empty-title">{title}</div>
      {text && <div className="z-empty-text">{text}</div>}
      {action}
    </div>
  );
}
export function TxRow({ cat, title, meta, amount, positive, actions, testid }) {
  return (
    <div className="z-row" data-testid={testid}>
      <CatIcon cat={cat} />
      <div className="z-row-main">
        <div className="z-row-title">{title}</div>
        <div className="z-row-meta">{meta}</div>
      </div>
      <div className={cx('z-row-amount', positive && 'z-pos')}>{positive ? '+' : '\u2212'}{fmt(amount)}<small>XOF</small></div>
      {actions && <div className="z-row-actions">{actions}</div>}
    </div>
  );
}

/* Navigation helpers */
export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div className="z-tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={value === t.id} aria-controls={`panel-${t.id}`}
          className={cx('z-tab', value === t.id && 'active')} onClick={() => onChange(t.id)} data-testid={`tab-${t.id}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
export function Pagination({ page, total, pageSize, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return (
    <div className="z-pagination">
      <span data-testid="pagination-info">{total ? `Showing ${start + 1}–${Math.min(start + pageSize, total)} of ${total}` : 'Showing 0 of 0'}</span>
      {pages > 1 && (
        <div className="z-pages">
          <button className="z-page" type="button" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page" data-testid="pagination-prev"><Icon name="chevronLeft" size={16} /></button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={cx('z-page', p === page && 'active')} type="button" aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)} data-testid={`pagination-page-${p}`}>{p}</button>
          ))}
          <button className="z-page" type="button" disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Next page" data-testid="pagination-next"><Icon name="chevronRight" size={16} /></button>
        </div>
      )}
    </div>
  );
}

/* Confirmation dialog */
export function ConfirmDialog({ open, title, text, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  const cancelRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current && cancelRef.current.focus();
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="z-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="z-dialog" role="alertdialog" aria-modal="true" aria-labelledby="z-dialog-title" aria-describedby="z-dialog-text" data-testid="confirm-dialog">
        <div className="z-dialog-icon"><Icon name="alert" size={22} /></div>
        <h2 id="z-dialog-title">{title}</h2>
        <p id="z-dialog-text">{text}</p>
        <div className="z-dialog-actions">
          <Button variant="secondary" onClick={onCancel} ref={cancelRef} data-testid="confirm-cancel">Cancel</Button>
          <Button variant="danger" onClick={onConfirm} data-testid="confirm-accept">{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
