import { type ReactNode } from "react";
import { ROUTES } from "~/routes.config";
import { FooterCopyright } from "./footer-copyright";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between py-2">
            <a
              href={ROUTES.HOME}
              className="text-xl font-bold cursor-pointer text-secondary dark:text-secondary-light"
            >
              Boi na Nuvem
            </a>
            <a
              href={ROUTES.HOME}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-xs font-medium cursor-pointer"
            >
              Voltar ao Início
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center py-12 px-4">{children}</main>

      <footer className="bg-white/50 dark:bg-gray-900/50 py-3">
        <div className="container mx-auto px-4 max-w-7xl">
          <FooterCopyright variant="transparent" />
        </div>
      </footer>
    </div>
  );
}
