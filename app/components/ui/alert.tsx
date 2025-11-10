import { type ReactNode } from "react";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertProps {
  title: string;
  message?: string;
  variant?: AlertVariant;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; text: string; iconBg: string }> = {
  success: {
    bg: "bg-white",
    text: "text-emerald-500",
    iconBg: "bg-emerald-500",
  },
  error: {
    bg: "bg-white",
    text: "text-red-500",
    iconBg: "bg-red-500",
  },
  warning: {
    bg: "bg-white",
    text: "text-yellow-500",
    iconBg: "bg-yellow-500",
  },
  info: {
    bg: "bg-white",
    text: "text-blue-500",
    iconBg: "bg-blue-500",
  },
};

const defaultIcons: Record<AlertVariant, ReactNode> = {
  success: (
    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 3.33331C10.8 3.33331 3.33337 10.8 3.33337 20C3.33337 29.2 10.8 36.6666 20 36.6666C29.2 36.6666 36.6667 29.2 36.6667 20C36.6667 10.8 29.2 3.33331 20 3.33331ZM16.6667 28.3333L8.33337 20L10.6834 17.65L16.6667 23.6166L29.3167 10.9666L31.6667 13.3333L16.6667 28.3333Z" />
    </svg>
  ),
  error: (
    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 3.36667C10.8167 3.36667 3.3667 10.8167 3.3667 20C3.3667 29.1833 10.8167 36.6333 20 36.6333C29.1834 36.6333 36.6334 29.1833 36.6334 20C36.6334 10.8167 29.1834 3.36667 20 3.36667ZM21.6667 28.3333H18.3334V25H21.6667V28.3333ZM21.6667 21.6667H18.3334V11.6667H21.6667V21.6667Z" />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 3.33331L3.33337 33.3333H36.6667L20 3.33331ZM20 28.3333C19.0834 28.3333 18.3334 29.0833 18.3334 30C18.3334 30.9166 19.0834 31.6666 20 31.6666C20.9167 31.6666 21.6667 30.9166 21.6667 30C21.6667 29.0833 20.9167 28.3333 20 28.3333ZM18.3334 25H21.6667V21.6666H18.3334V25Z" />
    </svg>
  ),
  info: (
    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 3.33331C10.8 3.33331 3.33337 10.8 3.33337 20C3.33337 29.2 10.8 36.6666 20 36.6666C29.2 36.6666 36.6667 29.2 36.6667 20C36.6667 10.8 29.2 3.33331 20 3.33331ZM21.6667 28.3333H18.3334V18.3333H21.6667V28.3333ZM21.6667 15H18.3334V11.6667H21.6667V15Z" />
    </svg>
  ),
};

export function Alert({ title, message, variant = "success", icon, className = "" }: AlertProps) {
  const styles = variantStyles[variant];
  const displayIcon = icon || defaultIcons[variant];

  return (
    <div
      className={`flex w-full max-w-sm overflow-hidden rounded-lg shadow-md ${styles.bg} ${className}`.trim()}
    >
      <div className={`flex items-center justify-center w-12 ${styles.iconBg}`}>
        {displayIcon}
      </div>

      <div className="px-4 py-2 -mx-3">
        <div className="mx-3">
          <span className={`font-semibold ${styles.text}`}>{title}</span>
          {message && (
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

