interface AuthFormErrorProps {
  error?: string;
  className?: string;
}

export function AuthFormError({ error, className = "" }: AuthFormErrorProps) {
  if (!error) return null;

  return (
    <div
      className={`mb-4 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}
    >
      {error}
    </div>
  );
}
