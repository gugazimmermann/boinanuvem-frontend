import { describe, it, expect } from "vitest";
import { createSEOMeta, createCanonicalLink } from "../seo-meta";

describe("createSEOMeta", () => {
  it("should create meta tags with title", () => {
    const meta = createSEOMeta({ title: "Test Page" });
    const titleTag = meta.find((tag): tag is { title: string } => "title" in tag);
    expect(titleTag?.title).toBe("Test Page - Boi na Nuvem");
  });

  it("should not duplicate site name in title", () => {
    const meta = createSEOMeta({ title: "Test Page - Boi na Nuvem" });
    const titleTag = meta.find((tag): tag is { title: string } => "title" in tag);
    expect(titleTag?.title).toBe("Test Page - Boi na Nuvem");
  });

  it("should use default description when not provided", () => {
    const meta = createSEOMeta({ title: "Test Page" });
    const descriptionTag = meta.find((tag) => "name" in tag && tag.name === "description");
    expect(descriptionTag).toBeDefined();
    expect((descriptionTag as { name: string; content: string }).content).toBeTruthy();
  });

  it("should use custom description when provided", () => {
    const meta = createSEOMeta({
      title: "Test Page",
      description: "Custom description",
    });
    const descriptionTag = meta.find((tag) => "name" in tag && tag.name === "description");
    expect((descriptionTag as { name: string; content: string }).content).toBe(
      "Custom description"
    );
  });

  it("should include Open Graph tags", () => {
    const meta = createSEOMeta({ title: "Test Page" });
    const ogTitle = meta.find((tag) => "property" in tag && tag.property === "og:title");
    expect(ogTitle).toBeDefined();
  });

  it("should include Twitter card tags", () => {
    const meta = createSEOMeta({ title: "Test Page" });
    const twitterCard = meta.find((tag) => "name" in tag && tag.name === "twitter:card");
    expect(twitterCard).toBeDefined();
  });

  it("should set noindex when specified", () => {
    const meta = createSEOMeta({ title: "Test Page", noindex: true });
    const robotsTag = meta.find((tag) => "name" in tag && tag.name === "robots");
    expect((robotsTag as { name: string; content: string }).content).toBe("noindex, nofollow");
  });

  it("should use custom URL when provided", () => {
    const meta = createSEOMeta({ title: "Test Page", url: "/test-page" });
    const ogUrl = meta.find((tag) => "property" in tag && tag.property === "og:url");
    expect((ogUrl as { property: string; content: string }).content).toContain("/test-page");
  });

  it("should use custom image when provided", () => {
    const meta = createSEOMeta({ title: "Test Page", image: "/custom-image.png" });
    const ogImage = meta.find((tag) => "property" in tag && tag.property === "og:image");
    expect((ogImage as { property: string; content: string }).content).toBe("/custom-image.png");
  });

  it("should use article type when specified", () => {
    const meta = createSEOMeta({ title: "Test Page", type: "article" });
    const ogType = meta.find((tag) => "property" in tag && tag.property === "og:type");
    expect((ogType as { property: string; content: string }).content).toBe("article");
  });
});

describe("createCanonicalLink", () => {
  it("should create canonical link with default URL", () => {
    const link = createCanonicalLink({});
    expect(link[0].href).toBe("https://boinanuvem.com.br");
  });

  it("should use provided URL", () => {
    const link = createCanonicalLink({ url: "/test-page" });
    expect(link[0].href).toBe("https://boinanuvem.com.br/test-page");
  });

  it("should prioritize canonical over URL", () => {
    const link = createCanonicalLink({
      url: "/test-page",
      canonical: "/canonical-page",
    });
    expect(link[0].href).toBe("https://boinanuvem.com.br/canonical-page");
  });

  it("should return array with rel and href", () => {
    const link = createCanonicalLink({ url: "/test" });
    expect(link[0].rel).toBe("canonical");
    expect(link[0].href).toBeDefined();
  });
});
