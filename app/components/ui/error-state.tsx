interface ErrorStateProps {
  readonly message: string;
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
  readonly className?: string;
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = "Tentar Novamente",
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="text-center max-w-md">
        <p className="text-red-600 dark:text-red-400 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
