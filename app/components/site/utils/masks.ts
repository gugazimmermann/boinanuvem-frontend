export function maskCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
}

export function unmaskCNPJ(value: string): string {
  return value.replace(/\D/g, "");
}

export function maskPhone(value: string): string {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length === 0) return "";
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

export function unmaskPhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function maskCEP(value: string): string {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length === 0) return "";
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}-${numbers.slice(5, 8)}`;
}

export function unmaskCEP(value: string): string {
  return value.replace(/\D/g, "");
}

export function maskCPF(value: string): string {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length === 0) return "";
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

export function unmaskCPF(value: string): string {
  return value.replace(/\D/g, "");
}

export function createMaskHandler(
  maskFunction: (value: string) => string,
  onChange: (value: string) => void
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskFunction(e.target.value);
    onChange(maskedValue);
  };
}

