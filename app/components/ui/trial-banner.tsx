import { useState } from "react";
import { Link } from "react-router";
import { ROUTES } from "~/routes.config";
import { useLanguage } from "~/contexts/language-context";
import { t } from "~/utils/translation-helpers";

interface TrialBannerProps {
  readonly daysRemaining: number;
  readonly onDismiss?: () => void;
  readonly className?: string;
}

export function TrialBanner({ daysRemaining, onDismiss, className = "" }: TrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { language } = useLanguage();

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
  const getMessageForDays = (days: number): string => {
    if (days >= 10) {
      return t(
        language,
        `Você tem ${days} dias restantes no seu teste.`,
        `Tienes ${days} días restantes en tu prueba.`,
        `You have ${days} days left in your trial.`
      );
    }
    if (days > 1) {
      return t(
        language,
        `Seu teste termina em ${days} dias.`,
        `Tu prueba termina en ${days} días.`,
        `Your trial ends in ${days} days.`
      );
    }
    if (days === 1) {
      return t(
        language,
        "Seu teste termina amanhã.",
        "Tu prueba termina mañana.",
        "Your trial ends tomorrow."
      );
    }
    return t(language, "Seu teste expirou.", "Tu prueba ha expirado.", "Your trial has ended.");
  };

  const getMessage = (): string => {
    return getMessageForDays(daysRemaining);
  };

  const getSubscribeLabel = (): string => {
    return t(language, "Assinar Plano", "Suscribirse", "Subscribe");
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const rootClassName = ["w-full", "text-white", getColorClass(), className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      <div className="container flex items-center justify-between px-6 py-4 mx-auto">
        <div className="flex items-center flex-1">
          <svg viewBox="0 0 40 40" className="w-6 h-6 fill-current shrink-0">
            <path d="M20 3.33331C10.8 3.33331 3.33337 10.8 3.33337 20C3.33337 29.2 10.8 36.6666 20 36.6666C29.2 36.6666 36.6667 29.2 36.6667 20C36.6667 10.8 29.2 3.33331 20 3.33331ZM16.6667 28.3333L8.33337 20L10.6834 17.65L16.6667 23.6166L29.3167 10.9666L31.6667 13.3333L16.6667 28.3333Z" />
          </svg>

          <p className="mx-3 flex-1">{getMessage()}</p>

          <Link
            to={ROUTES.SUBSCRIPTION}
            className="px-4 py-2 bg-white text-gray-900 font-medium rounded-md hover:bg-gray-100 transition-colors shadow-sm mr-3 shrink-0"
          >
            {getSubscribeLabel()}
          </Link>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 transition-colors duration-300 transform rounded-md hover:bg-opacity-25 hover:bg-gray-600 focus:outline-none shrink-0"
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
