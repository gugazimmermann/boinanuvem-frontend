import { LoadingSpinner } from "./loading-spinner";
import { ErrorState } from "./error-state";

interface LoadingErrorWrapperProps {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly loadingText?: string;
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function LoadingErrorWrapper({
  isLoading,
  error,
  loadingText,
  onRetry,
  retryLabel,
  children,
  className = "",
}: LoadingErrorWrapperProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <LoadingSpinner size="md" />
          {loadingText && <p className="mt-4 text-gray-600 dark:text-gray-400">{loadingText}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} retryLabel={retryLabel} />;
  }

  return <>{children}</>;
}
