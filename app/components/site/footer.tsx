import { FOOTER_SECTIONS } from "./constants";
import { ROUTES } from "../../routes.config";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {FOOTER_SECTIONS.map((section, index) => (
            <div key={index}>
              <h4 className="font-bold text-sm uppercase mb-4 text-black dark:text-gray-100">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-gray-200 text-sm transition cursor-pointer"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
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
      </div>
    </footer>
  );
}
