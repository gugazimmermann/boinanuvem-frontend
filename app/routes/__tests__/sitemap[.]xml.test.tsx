import { describe, it, expect, beforeEach } from "vitest";
import { loader } from "../sitemap[.]xml";
import { ROUTES } from "~/routes.config";

describe("sitemap[.]xml", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loader", () => {
    it("should return XML sitemap with correct content type", async () => {
      const response = await loader();

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/xml; charset=utf-8");
      expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600, s-maxage=3600");
    });

    it("should include XML declaration", async () => {
      const response = await loader();
      const xml = await response.text();

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    });

    it("should include urlset with correct namespace", async () => {
      const response = await loader();
      const xml = await response.text();

      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    });

    it("should include home route", async () => {
      const response = await loader();
      const xml = await response.text();

      expect(xml).toContain(`<loc>https://boinanuvem.com.br${ROUTES.HOME}</loc>`);
      expect(xml).toContain("<priority>1.0</priority>");
      expect(xml).toContain("<changefreq>weekly</changefreq>");
    });

    it("should include terms route", async () => {
      const response = await loader();
      const xml = await response.text();

      expect(xml).toContain(`<loc>https://boinanuvem.com.br${ROUTES.TERMS}</loc>`);
      expect(xml).toContain("<priority>0.5</priority>");
      expect(xml).toContain("<changefreq>monthly</changefreq>");
    });

    it("should include privacy route", async () => {
      const response = await loader();
      const xml = await response.text();

      expect(xml).toContain(`<loc>https://boinanuvem.com.br${ROUTES.PRIVACY}</loc>`);
      expect(xml).toContain("<priority>0.5</priority>");
      expect(xml).toContain("<changefreq>monthly</changefreq>");
    });

    it("should include lastmod date in ISO format", async () => {
      const response = await loader();
      const xml = await response.text();
      const today = new Date().toISOString().split("T")[0];

      expect(xml).toContain(`<lastmod>${today}</lastmod>`);
    });

    it("should have valid XML structure", async () => {
      const response = await loader();
      const xml = await response.text();

      // Check that all URLs are properly closed
      const urlCount = (xml.match(/<url>/g) || []).length;
      const urlCloseCount = (xml.match(/<\/url>/g) || []).length;
      expect(urlCount).toBe(urlCloseCount);
      expect(urlCount).toBeGreaterThan(0);

      // Check that urlset is properly closed
      expect(xml).toContain("</urlset>");
    });

    it("should include all public routes", async () => {
      const response = await loader();
      const xml = await response.text();

      const publicRoutes = [ROUTES.HOME, ROUTES.TERMS, ROUTES.PRIVACY];
      for (const route of publicRoutes) {
        expect(xml).toContain(`https://boinanuvem.com.br${route}`);
      }
    });

    it("should not include private routes", async () => {
      const response = await loader();
      const xml = await response.text();

      expect(xml).not.toContain(ROUTES.DASHBOARD);
      expect(xml).not.toContain(ROUTES.LOGIN);
      expect(xml).not.toContain(ROUTES.REGISTER);
    });
  });
});
