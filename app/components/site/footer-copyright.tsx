import { ROUTES } from "~/routes.config";

export interface FooterCopyrightProps {
  readonly className?: string;
  readonly variant?: "default" | "transparent";
}

export function FooterCopyright({ className = "", variant = "default" }: FooterCopyrightProps) {
  const borderClass =
    variant === "transparent"
      ? "border-gray-200/50 dark:border-gray-800/50"
      : "border-gray-200 dark:border-gray-800";

  return (
    <div className={`border-t ${borderClass} pt-4 ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left">
          Copyrights © {new Date().getFullYear()} All Rights Reserved by Boi na Nuvem
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <a
            href={ROUTES.TERMS}
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            Termos
          </a>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <a
            href={ROUTES.PRIVACY}
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            Privacidade
          </a>
        </div>
      </div>
    </div>
  );
}
