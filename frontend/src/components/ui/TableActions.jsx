import "./TableActions.css";

function EyeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" style={{ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

function PencilIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" style={{ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
}

function PowerIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" style={{ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>;
}

export default function TableActions({ children }) {
  return <div className="table-actions">{children}</div>;
}
export function ViewActionButton({ onClick }) {
  return (
    <button type="button" className="table-action-button table-action-button--view" onClick={onClick} title="Ver detalles" aria-label="Ver detalles">
      <EyeIcon />
    </button>
  );
}

export function EditActionButton({ onClick }) {
  return (
    <button type="button" className="table-action-button table-action-button--edit" onClick={onClick} title="Editar" aria-label="Editar">
      <PencilIcon />
    </button>
  );
}

export function DeleteActionButton({ onClick, disabled, title = "Eliminar" }) {
  return (
    <button type="button" className="table-action-button table-action-button--delete" onClick={onClick} disabled={disabled} title={title} aria-label={title}>
      <PowerIcon />
    </button>
  );
}
