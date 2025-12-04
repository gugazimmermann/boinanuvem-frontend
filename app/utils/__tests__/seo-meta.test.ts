import { describe, it, expect } from "vitest";
import { createSEOMeta, createCanonicalLink } from "../seo-meta";

describe("seo-meta", () => {
  describe("createSEOMeta", () => {
    it("should create basic SEO meta tags", () => {
      const meta = createSEOMeta({
        title: "Test Page",
        description: "Test description",
      });

      expect(meta).toBeDefined();
      expect(Array.isArray(meta)).toBe(true);
      expect(meta.length).toBeGreaterThan(0);
    });

    it("should include title with site name", () => {
      const meta = createSEOMeta({
        title: "Test Page",
      });

      const titleTag = meta.find((tag) => "title" in tag);
      expect(titleTag).toBeDefined();
      if (titleTag && "title" in titleTag) {
        expect(titleTag.title).toContain("Test Page");
        expect(titleTag.title).toContain("Boi na Nuvem");
      }
    });

    it("should use default description when not provided", () => {
      const meta = createSEOMeta({
        title: "Test Page",
      });

      const descriptionTag = meta.find((tag) => "name" in tag && tag.name === "description");
      expect(descriptionTag).toBeDefined();
    });

    it("should use custom description when provided", () => {
      const meta = createSEOMeta({
        title: "Test Page",
        description: "Custom description",
      });

      const descriptionTag = meta.find((tag) => "name" in tag && tag.name === "description");
      expect(descriptionTag).toBeDefined();
      if (descriptionTag && "content" in descriptionTag) {
        expect(descriptionTag.content).toBe("Custom description");
      }
    });

    it("should include noindex when specified", () => {
      const meta = createSEOMeta({
        title: "Test Page",
        noindex: true,
      });

      const robotsTag = meta.find((tag) => "name" in tag && tag.name === "robots");
      expect(robotsTag).toBeDefined();
      if (robotsTag && "content" in robotsTag) {
        expect(robotsTag.content).toContain("noindex");
      }
    });

    it("should include index when noindex is false", () => {
      const meta = createSEOMeta({
        title: "Test Page",
        noindex: false,
      });

      const robotsTag = meta.find((tag) => "name" in tag && tag.name === "robots");
      expect(robotsTag).toBeDefined();
      if (robotsTag && "content" in robotsTag) {
        expect(robotsTag.content).toContain("index");
      }
    });

    it("should include Open Graph tags", () => {
      const meta = createSEOMeta({
        title: "Test Page",
        description: "Test description",
      });

      const ogTitle = meta.find((tag) => "property" in tag && tag.property === "og:title");
      const ogDescription = meta.find(
        (tag) => "property" in tag && tag.property === "og:description"
      );
      expect(ogTitle).toBeDefined();
      expect(ogDescription).toBeDefined();
    });

    it("should include Twitter card tags", () => {
      const meta = createSEOMeta({
        title: "Test Page",
        description: "Test description",
      });

      const twitterCard = meta.find((tag) => "name" in tag && tag.name === "twitter:card");
      expect(twitterCard).toBeDefined();
    });

    it("should use custom image when provided", () => {
      const meta = createSEOMeta({
        title: "Test Page",
        image: "https://example.com/image.jpg",
      });

      const ogImage = meta.find((tag) => "property" in tag && tag.property === "og:image");
      expect(ogImage).toBeDefined();
      if (ogImage && "content" in ogImage) {
        expect(ogImage.content).toBe("https://example.com/image.jpg");
      }
    });

    it("should use custom URL when provided", () => {
      const meta = createSEOMeta({
        title: "Test Page",
        url: "/test-page",
      });

      const ogUrl = meta.find((tag) => "property" in tag && tag.property === "og:url");
      expect(ogUrl).toBeDefined();
      if (ogUrl && "content" in ogUrl) {
        expect(ogUrl.content).toContain("/test-page");
      }
    });

    it("should use article type when specified", () => {
      const meta = createSEOMeta({
        title: "Test Page",
        type: "article",
      });

      const ogType = meta.find((tag) => "property" in tag && tag.property === "og:type");
      expect(ogType).toBeDefined();
      if (ogType && "content" in ogType) {
        expect(ogType.content).toBe("article");
      }
    });
  });

  describe("createCanonicalLink", () => {
    it("should create canonical link with default URL", () => {
      const links = createCanonicalLink({});
      expect(links).toHaveLength(1);
      expect(links[0].rel).toBe("canonical");
      expect(links[0].href).toContain("boinanuvem.com.br");
    });

    it("should create canonical link with custom URL", () => {
      const links = createCanonicalLink({ url: "/test-page" });
      expect(links[0].href).toContain("/test-page");
    });

    it("should prioritize canonical over URL", () => {
      const links = createCanonicalLink({
        url: "/test-page",
        canonical: "/canonical-page",
      });
      expect(links[0].href).toContain("/canonical-page");
      expect(links[0].href).not.toContain("/test-page");
    });

    it("should use canonical when only canonical is provided", () => {
      const links = createCanonicalLink({ canonical: "/canonical-page" });
      expect(links[0].href).toContain("/canonical-page");
    });
  });
});
