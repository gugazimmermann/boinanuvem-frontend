// Utility function for smooth scrolling
export function scrollToSection(sectionId: string, offset = 80) {
  const element = document.getElementById(sectionId);
  if (element) {
    const position = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: position, behavior: "smooth" });
  }
}

// Hook for handling anchor clicks
export function useSmoothScroll() {
  if (typeof window === "undefined") return;

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
    
    if (anchor) {
      const href = anchor.getAttribute("href");
      if (href && href !== "#" && href.startsWith("#")) {
        e.preventDefault();
        scrollToSection(href.substring(1));
      }
    }
  };

  document.addEventListener("click", handleClick);
  return () => document.removeEventListener("click", handleClick);
}

// Re-export CNPJ utilities
export {
  formatCNPJ,
  formatPhone,
  mapCNPJDataToCompanyForm,
  type CompanyFormData,
} from "./utils/cnpj-utils";

// Re-export mask utilities
export {
  maskCNPJ,
  unmaskCNPJ,
  maskPhone,
  unmaskPhone,
  maskCEP,
  unmaskCEP,
  createMaskHandler,
} from "./utils/masks";

// Re-export CEP utilities
export {
  mapCEPDataToAddressForm,
  type AddressFormData,
} from "./utils/cep-utils";

