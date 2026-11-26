const paths = {
  email: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 6 9 6 9-6" /></>,
  user: <><circle cx="12" cy="7" r="3" /><path d="M5 21v-3a7 7 0 0 1 14 0v3Z" /></>,
  phone: <path d="M21 16v3a2 2 0 0 1-2.2 2A18 18 0 0 1 3 5.2 2 2 0 0 1 5 3h3l1 5-2 2a14 14 0 0 0 7 7l2-2Z" />,
  lock: <><rect x="5" y="10" width="14" height="11" rx="1" /><path d="M8 10V6a4 4 0 0 1 8 0v4" /><circle cx="12" cy="15" r="1" /><path d="M12 16v2" /></>,
  confirm: <><rect x="5" y="10" width="14" height="11" rx="1" /><path d="M8 10V6a4 4 0 0 1 8 0v4m-7 12 2 2 4-4" /></>,
  arrow: <path d="M4 12h16m-7-7 7 7-7 7" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 7.6A16.6 16.6 0 0 0 2 12s3.5 6 10 6c1.5 0 2.8-.3 4-.8" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
};

/**
 * Reutiliza los trazos originales de los formularios como decoración del texto visible.
 * @param {object} props Nombre del icono: email, user, phone, lock, confirm o arrow.
 * @returns {import('react').ReactElement} Icono excluido del árbol de accesibilidad.
 * @author Equipo Sportify
 */
export default function FormIcon({ name }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
