import { ROUTES } from "../routes.config";

const SITE_URL = "https://boinanuvem.com.br";

// Public routes that should be included in sitemap
const publicRoutes = [
  { path: ROUTES.HOME, priority: "1.0", changefreq: "weekly" },
  { path: ROUTES.TERMS, priority: "0.5", changefreq: "monthly" },
  { path: ROUTES.PRIVACY, priority: "0.5", changefreq: "monthly" },
];

export async function loader() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes
  .map(
    (route) => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
