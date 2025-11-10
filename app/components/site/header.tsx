import { memo } from "react";
import { NAV_LINKS, COLORS } from "./constants";
import { Button } from "./ui";
import { useSmoothScroll } from "./hooks";

export const Header = memo(function Header() {
  useSmoothScroll();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <a href="/" className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
            Boi na Nuvem
          </a>

          <nav className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:opacity-80"
                style={{ color: COLORS.textDark }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button href="#" size="sm" variant="primary">
              Get Started
            </Button>
            <button className="md:hidden" aria-label="Toggle menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});
