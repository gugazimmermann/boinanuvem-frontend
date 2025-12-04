import { FOOTER_SECTIONS } from "./constants";
import { FooterCopyright } from "./footer-copyright";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-sm uppercase mb-4 text-black dark:text-gray-100">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-gray-200 text-sm transition cursor-pointer"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <FooterCopyright />
      </div>
    </footer>
  );
}
