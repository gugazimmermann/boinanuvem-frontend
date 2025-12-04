import { isValidEmail } from "./email-validation";

export function validateEmail(email: string): boolean {
  return isValidEmail(email);
}

export function validatePassword(password: string, minLength = 6): boolean {
  return password.length >= minLength;
}

export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

export function getErrorMessage(errorKey: string, translations: Record<string, string>): string {
  return translations[errorKey] || errorKey;
}
