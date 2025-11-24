import { createSEOMeta } from "./seo-meta";

export function createAuthMeta(title: string, description: string) {
  return createSEOMeta({
    title,
    description,
    noindex: true,
  });
}
