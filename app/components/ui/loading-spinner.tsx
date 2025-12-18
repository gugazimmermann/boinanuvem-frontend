interface LoadingSpinnerProps {
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 border-b-2",
  md: "h-8 w-8 border-b-2",
  lg: "h-12 w-12 border-b-2",
};

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  return (
    <div
      className={`inline-block animate-spin rounded-full ${sizeClasses[size]} border-blue-600 dark:border-blue-400 ${className}`}
    />
  );
}
