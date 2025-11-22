import { memo } from "react";
import { NAV_LINKS } from "./constants";
import { Button } from "./ui";
import { useSmoothScroll } from "./hooks";
import { ROUTES } from "../../routes.config";
import { useTranslation } from "~/i18n/use-translation";

export const Header = memo(function Header() {
  const t = useTranslation();
  useSmoothScroll();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between py-4">
          <a
            href={ROUTES.HOME}
            className="text-2xl font-bold cursor-pointer text-secondary dark:text-secondary-light"
          >
            Boi na Nuvem
          </a>

          <nav className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:opacity-80 cursor-pointer text-gray-800 dark:text-gray-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button href={ROUTES.LOGIN} size="sm" variant="primary">
              Começar
            </Button>
            <button
              className="md:hidden cursor-pointer text-gray-800 dark:text-gray-200"
              aria-label={t.common.toggleMenu}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});
