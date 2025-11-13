import { type ReactNode } from "react";
import { COLORS } from "./constants";
import { ROUTES } from "../../routes.config";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${COLORS.bgLight} 0%, ${COLORS.bgLightSecondary} 50%, ${COLORS.bgLightTertiary} 100%)`,
      }}
    >
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between py-2">
            <a
              href={ROUTES.HOME}
              className="text-xl font-bold cursor-pointer"
              style={{ color: COLORS.secondary }}
            >
              Boi na Nuvem
            </a>
            <a
              href={ROUTES.HOME}
              className="text-gray-600 hover:text-gray-900 transition-colors text-xs font-medium cursor-pointer"
            >
              Voltar ao Início
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center py-12 px-4">{children}</main>

      <footer className="bg-white/50 border-t border-gray-200 py-3">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500 text-center md:text-left">
              Copyrights © {new Date().getFullYear()} All Rights Reserved by Boi na Nuvem
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors cursor-pointer">
                Termos
              </a>
              <span className="text-gray-300">|</span>
              <a href="#" className="hover:text-gray-900 transition-colors cursor-pointer">
                Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
