import { FOOTER_SECTIONS } from "./constants";

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

        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Copyrights © {new Date().getFullYear()} All Rights Reserved by Boi na Nuvem</p>
        </div>
      </div>
    </footer>
  );
}
