import { createSEOMeta } from "./seo-meta";

/**
 * @deprecated Use createSEOMeta directly instead
 * This function is kept for backward compatibility but will be removed in the future
 */
export function createAuthMeta(title: string, description: string) {
  return createSEOMeta({
    title,
    description,
    noindex: true,
  });
}
