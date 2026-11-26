import useTheme from '../../contexts/useTheme.js'
import './ThemeToggle.css'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const nextThemeLabel = theme === 'dark' ? 'claro' : 'oscuro'

  return (
    <button
      aria-label={`Cambiar a tema ${nextThemeLabel}`}
      className={['theme-toggle', className].filter(Boolean).join(' ')}
      onClick={toggleTheme}
      title={`Activar tema ${nextThemeLabel}`}
      type="button"
    >
      {theme === 'dark' ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" />
        </svg>
      )}
    </button>
  )
}
