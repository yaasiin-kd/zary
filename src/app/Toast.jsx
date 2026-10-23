import { useZary } from './store.jsx';
import Icon from '../components/icons.jsx';

export default function Toast() {
  const { toast, undoToast } = useZary();
  if (!toast) return null;
  return (
    <div className="toast" key={toast.id} data-testid="success-toast" role="status">
      {toast.undo ? (
        <div className="toast-undo">
          <Icon name="check" size={14} />
          {toast.msg}
          <button className="undo-btn" type="button" data-testid="undo-button" onClick={undoToast}>Undo</button>
        </div>
      ) : (
        <>
          <Icon name="check" size={14} />
          {toast.msg}
        </>
      )}
    </div>
  );
}
