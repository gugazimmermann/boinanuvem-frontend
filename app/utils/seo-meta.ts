const SITE_URL = "https://boinanuvem.com.br";
const SITE_NAME = "Boi na Nuvem";
const DEFAULT_IMAGE = `${SITE_URL}/images/farm.png`;
const DEFAULT_DESCRIPTION =
  "Sistema completo de gestão para fazendas de gado de corte. Gerencie propriedades, pastos, animais, pesos, nascimentos, finanças, estoque, vendas e muito mais.";

export interface SEOMetaOptions {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  noindex?: boolean;
  canonical?: string;
}

export function createSEOMeta(options: SEOMetaOptions) {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    url,
    type = "website",
    noindex = false,
    canonical: _canonical,
  } = options;

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} - ${SITE_NAME}`;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  const metaTags: Array<
    { title: string } | { name: string; content: string } | { property: string; content: string }
  > = [
    { title: fullTitle },
    { name: "description", content: description },
    { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" },

    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:url", content: fullUrl },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "pt_BR" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];

  return metaTags;
}

export interface CanonicalLinkOptions {
  url?: string;
  canonical?: string;
}

export function createCanonicalLink(options: CanonicalLinkOptions) {
  const { url, canonical } = options;
  const canonicalUrl = (() => {
    if (canonical) return `${SITE_URL}${canonical}`;
    if (url) return `${SITE_URL}${url}`;
    return SITE_URL;
  })();

  return [{ rel: "canonical", href: canonicalUrl }];
}
