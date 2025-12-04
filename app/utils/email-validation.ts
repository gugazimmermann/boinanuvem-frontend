/**
 * Validates an email address using a safe regex pattern that avoids ReDoS vulnerabilities.
 * Uses a more specific pattern to prevent super-linear runtime from backtracking.
 *
 * @param email - The email address to validate
 * @returns true if the email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  // Safer regex pattern that avoids nested quantifiers and backtracking issues
  // This pattern is more restrictive but prevents ReDoS attacks
  // Pattern breakdown:
  // - ^[a-zA-Z0-9._%+-]+ : One or more alphanumeric, dots, underscores, percent, plus, or hyphens
  // - @ : Required @ symbol
  // - [a-zA-Z0-9.-]+ : One or more alphanumeric, dots, or hyphens for domain
  // - \.[a-zA-Z]{2,}$ : Dot followed by 2+ letters for TLD
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
