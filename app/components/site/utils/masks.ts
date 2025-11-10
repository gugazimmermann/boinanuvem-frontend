/**
 * Reusable input mask utilities
 */

/**
 * Apply CNPJ mask: 30584233000140 -> 30.584.233/0001-40
 */
export function maskCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
}

/**
 * Remove CNPJ mask: 30.584.233/0001-40 -> 30584233000140
 */
export function unmaskCNPJ(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Apply phone mask: (XX) XXXXX-XXXX (mobile) or (XX) XXXX-XXXX (landline)
 */
export function maskPhone(value: string): string {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length === 0) return "";
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) {
    // Landline: (XX) XXXX-XXXX (10 digits)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  // Mobile: (XX) XXXXX-XXXX (11 digits)
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

/**
 * Remove phone mask: (XX) XXXXX-XXXX -> XXXXXXXXXX
 */
export function unmaskPhone(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Apply CEP mask: 88303040 -> 88.303-040
 */
export function maskCEP(value: string): string {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length === 0) return "";
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}-${numbers.slice(5, 8)}`;
}

/**
 * Remove CEP mask: 88.303-040 -> 88303040
 */
export function unmaskCEP(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Generic mask handler for input onChange events
 */
export function createMaskHandler(
  maskFunction: (value: string) => string,
  onChange: (value: string) => void
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskFunction(e.target.value);
    onChange(maskedValue);
  };
}

