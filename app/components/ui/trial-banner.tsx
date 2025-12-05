import { useState } from "react";

interface TrialBannerProps {
  readonly daysRemaining: number;
  readonly onDismiss?: () => void;
  readonly className?: string;
}

export function TrialBanner({ daysRemaining, onDismiss, className = "" }: TrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  // Determine color based on days remaining
  // >= 10 days: blue, 9-2 days: orange, 1 day: red
  const getColorClass = () => {
    if (daysRemaining >= 10) {
      return "bg-blue-500";
    } else if (daysRemaining > 1) {
      return "bg-orange-500";
    } else {
      return "bg-red-500";
    }
  };

  // Get message based on days remaining
  const getMessage = () => {
    if (daysRemaining >= 10) {
      return `You have ${daysRemaining} days left in your trial.`;
    } else if (daysRemaining > 1) {
      return `Your trial ends in ${daysRemaining} days.`;
    } else if (daysRemaining === 1) {
      return "Your trial ends tomorrow.";
    } else {
      return "Your trial has ended.";
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`w-full text-white ${getColorClass()} ${className}`.trim()}>
      <div className="container flex items-center justify-between px-6 py-4 mx-auto">
        <div className="flex">
          <svg viewBox="0 0 40 40" className="w-6 h-6 fill-current">
            <path d="M20 3.33331C10.8 3.33331 3.33337 10.8 3.33337 20C3.33337 29.2 10.8 36.6666 20 36.6666C29.2 36.6666 36.6667 29.2 36.6667 20C36.6667 10.8 29.2 3.33331 20 3.33331ZM16.6667 28.3333L8.33337 20L10.6834 17.65L16.6667 23.6166L29.3167 10.9666L31.6667 13.3333L16.6667 28.3333Z" />
          </svg>

          <p className="mx-3">{getMessage()}</p>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 transition-colors duration-300 transform rounded-md hover:bg-opacity-25 hover:bg-gray-600 focus:outline-none"
          aria-label="Dismiss trial banner"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 18L18 6M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
