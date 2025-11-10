export function scrollToSection(sectionId: string, offset = 80) {
  const element = document.getElementById(sectionId);
  if (element) {
    const position = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: position, behavior: "smooth" });
  }
}

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

export {
  formatCNPJ,
  formatPhone,
  mapCNPJDataToCompanyForm,
  type CompanyFormData,
} from "./utils/cnpj-utils";

export {
  maskCNPJ,
  unmaskCNPJ,
  maskPhone,
  unmaskPhone,
  maskCEP,
  unmaskCEP,
  createMaskHandler,
} from "./utils/masks";

export {
  mapCEPDataToAddressForm,
  type AddressFormData,
} from "./utils/cep-utils";

export {
  geocodeAddress,
  buildAddressString,
  type GeocodeResult,
  type GeocodeError,
} from "./utils/geocoding";

