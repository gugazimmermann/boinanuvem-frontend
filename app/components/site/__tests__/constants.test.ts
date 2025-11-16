import { describe, it, expect } from "vitest";
import {
  COLORS,
  NAV_LINKS,
  SERVICES,
  FEATURES,
  PRICING_PLANS,
  FAQS,
  BLOG_POSTS,
  FOOTER_SECTIONS,
  TRUSTED_BRANDS,
} from "../constants";

describe("constants", () => {
  describe("COLORS", () => {
    it("should export all color constants", () => {
      expect(COLORS).toBeDefined();
      expect(COLORS.primary).toBeDefined();
      expect(COLORS.secondary).toBeDefined();
      expect(COLORS.primaryDark).toBeDefined();
      expect(COLORS.secondaryDark).toBeDefined();
      expect(COLORS.primaryLight).toBeDefined();
      expect(COLORS.secondaryLight).toBeDefined();
      expect(COLORS.bgLight).toBeDefined();
      expect(COLORS.bgLightSecondary).toBeDefined();
      expect(COLORS.bgLightTertiary).toBeDefined();
      expect(COLORS.textDark).toBeDefined();
      expect(COLORS.textMedium).toBeDefined();
      expect(COLORS.textLight).toBeDefined();
    });

    it("should have valid color values", () => {
      Object.values(COLORS).forEach((color) => {
        expect(typeof color).toBe("string");
        expect(color.length).toBeGreaterThan(0);
      });
    });
  });

  describe("NAV_LINKS", () => {
    it("should export navigation links array", () => {
      expect(Array.isArray(NAV_LINKS)).toBe(true);
      expect(NAV_LINKS.length).toBeGreaterThan(0);
    });

    it("should have valid link structure", () => {
      NAV_LINKS.forEach((link) => {
        expect(link).toHaveProperty("href");
        expect(link).toHaveProperty("label");
        expect(typeof link.href).toBe("string");
        expect(typeof link.label).toBe("string");
        expect(link.href.startsWith("#")).toBe(true);
      });
    });
  });

  describe("SERVICES", () => {
    it("should export services array", () => {
      expect(Array.isArray(SERVICES)).toBe(true);
      expect(SERVICES.length).toBeGreaterThan(0);
    });

    it("should have valid service structure", () => {
      SERVICES.forEach((service) => {
        expect(service).toHaveProperty("title");
        expect(service).toHaveProperty("content");
        expect(typeof service.title).toBe("string");
        expect(typeof service.content).toBe("string");
        expect(service.title.length).toBeGreaterThan(0);
        expect(service.content.length).toBeGreaterThan(0);
      });
    });
  });

  describe("FEATURES", () => {
    it("should export features array", () => {
      expect(Array.isArray(FEATURES)).toBe(true);
      expect(FEATURES.length).toBeGreaterThan(0);
    });

    it("should have valid feature structure", () => {
      FEATURES.forEach((feature) => {
        expect(feature).toHaveProperty("badge");
        expect(feature).toHaveProperty("title");
        expect(feature).toHaveProperty("content");
        expect(feature).toHaveProperty("button");
        expect(typeof feature.badge).toBe("string");
        expect(typeof feature.title).toBe("string");
        expect(typeof feature.content).toBe("string");
        expect(typeof feature.button).toBe("string");
      });
    });
  });

  describe("PRICING_PLANS", () => {
    it("should export pricing plans array", () => {
      expect(Array.isArray(PRICING_PLANS)).toBe(true);
      expect(PRICING_PLANS.length).toBeGreaterThan(0);
    });

    it("should have valid pricing plan structure", () => {
      PRICING_PLANS.forEach((plan) => {
        expect(plan).toHaveProperty("name");
        expect(plan).toHaveProperty("description");
        expect(plan).toHaveProperty("monthlyPrice");
        expect(plan).toHaveProperty("annualPrice");
        expect(plan).toHaveProperty("features");
        expect(plan).toHaveProperty("popular");
        expect(typeof plan.name).toBe("string");
        expect(typeof plan.description).toBe("string");
        expect(typeof plan.monthlyPrice).toBe("string");
        expect(typeof plan.annualPrice).toBe("string");
        expect(Array.isArray(plan.features)).toBe(true);
        expect(typeof plan.popular).toBe("boolean");
      });
    });

    it("should have at least one popular plan", () => {
      const hasPopular = PRICING_PLANS.some((plan) => plan.popular === true);
      expect(hasPopular).toBe(true);
    });
  });

  describe("FAQS", () => {
    it("should export FAQs array", () => {
      expect(Array.isArray(FAQS)).toBe(true);
      expect(FAQS.length).toBeGreaterThan(0);
    });

    it("should have valid FAQ structure", () => {
      FAQS.forEach((faq) => {
        expect(faq).toHaveProperty("question");
        expect(faq).toHaveProperty("answer");
        expect(typeof faq.question).toBe("string");
        expect(typeof faq.answer).toBe("string");
        expect(faq.question.length).toBeGreaterThan(0);
        expect(faq.answer.length).toBeGreaterThan(0);
      });
    });
  });

  describe("BLOG_POSTS", () => {
    it("should export blog posts array", () => {
      expect(Array.isArray(BLOG_POSTS)).toBe(true);
      expect(BLOG_POSTS.length).toBeGreaterThan(0);
    });

    it("should have valid blog post structure", () => {
      BLOG_POSTS.forEach((post) => {
        expect(post).toHaveProperty("category");
        expect(post).toHaveProperty("categoryColor");
        expect(post).toHaveProperty("title");
        expect(post).toHaveProperty("date");
        expect(post).toHaveProperty("readTime");
        expect(typeof post.category).toBe("string");
        expect(typeof post.categoryColor).toBe("string");
        expect(typeof post.title).toBe("string");
        expect(typeof post.date).toBe("string");
        expect(typeof post.readTime).toBe("string");
      });
    });
  });

  describe("FOOTER_SECTIONS", () => {
    it("should export footer sections array", () => {
      expect(Array.isArray(FOOTER_SECTIONS)).toBe(true);
      expect(FOOTER_SECTIONS.length).toBeGreaterThan(0);
    });

    it("should have valid footer section structure", () => {
      FOOTER_SECTIONS.forEach((section) => {
        expect(section).toHaveProperty("title");
        expect(section).toHaveProperty("links");
        expect(typeof section.title).toBe("string");
        expect(Array.isArray(section.links)).toBe(true);
        expect(section.links.length).toBeGreaterThan(0);
        section.links.forEach((link) => {
          expect(typeof link).toBe("string");
        });
      });
    });
  });

  describe("TRUSTED_BRANDS", () => {
    it("should export trusted brands array", () => {
      expect(Array.isArray(TRUSTED_BRANDS)).toBe(true);
      expect(TRUSTED_BRANDS.length).toBeGreaterThan(0);
    });

    it("should have valid brand names", () => {
      TRUSTED_BRANDS.forEach((brand) => {
        expect(typeof brand).toBe("string");
        expect(brand.length).toBeGreaterThan(0);
      });
    });
  });
});
