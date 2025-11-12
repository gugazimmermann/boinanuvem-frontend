import { useTheme } from "~/contexts/theme-context";

export function ThemeToggleMenuItem() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 capitalize transition-colors duration-300 transform hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        {theme === "dark" ? (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
        <span>Tema {theme === "dark" ? "Claro" : "Escuro"}</span>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {theme === "dark" ? "Escuro" : "Claro"}
      </span>
    </button>
  );
}
