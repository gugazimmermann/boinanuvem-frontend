import { type ReactNode } from "react";

interface AuthCardProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly subtitle?: string;
  readonly maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  readonly footer?: ReactNode;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function AuthCard({ children, title, subtitle, maxWidth = "sm", footer }: AuthCardProps) {
  return (
    <div
      className={`w-full ${maxWidthClasses[maxWidth]} mx-auto overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-md`}
    >
      <div className="px-6 py-4">
        <div className="flex justify-center mx-auto mb-4">
          <div className="w-auto h-7 sm:h-8 flex items-center text-2xl font-bold text-secondary dark:text-secondary-light">
            Boi na Nuvem
          </div>
        </div>

        {title && (
          <h3 className="mt-3 text-xl font-medium text-center text-gray-600 dark:text-gray-300">
            {title}
          </h3>
        )}

        {subtitle && (
          <p className="mt-1 text-center text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}

        {children}
      </div>

      {footer}
    </div>
  );
}
