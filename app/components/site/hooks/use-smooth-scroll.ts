import { useEffect } from "react";

const HEADER_HEIGHT = 80;

export function useSmoothScroll() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');

      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href && href !== "#" && href.startsWith("#")) {
          e.preventDefault();
          const targetId = href.substring(1);
          const element = document.getElementById(targetId);

          if (element) {
            const position =
              element.getBoundingClientRect().top + window.pageYOffset - HEADER_HEIGHT;
            window.scrollTo({ top: position, behavior: "smooth" });
          }
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
}
