import { useZary } from './store.jsx';
import { Icon } from './ui/index.jsx';

export default function Toast() {
  const { toast, undoToast } = useZary();
  if (!toast) return null;
  return (
    <div className="z-toast" key={toast.id} role="status" data-testid="success-toast">
      <span className="z-toast-icon"><Icon name="check" size={13} strokeWidth={3} /></span>
      <span>{toast.msg}</span>
      {toast.undo && <button className="z-toast-undo" type="button" onClick={undoToast} data-testid="undo-button">Undo</button>}
    </div>
  );
}
