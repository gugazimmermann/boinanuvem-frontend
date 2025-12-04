import { describe, it, expect } from "vitest";
import { createAuthMeta } from "../auth-meta";

describe("auth-meta", () => {
  describe("createAuthMeta", () => {
    it("should create SEO meta with noindex flag", () => {
      const meta = createAuthMeta("Login", "Login page description");

      // createSEOMeta returns multiple meta tags (title, description, robots, og tags, twitter tags)
      expect(meta.length).toBeGreaterThan(2);

      // Check for title
      const titleTag = meta.find((tag) => "title" in tag);
      expect(titleTag).toBeDefined();
      if (titleTag && "title" in titleTag) {
        expect(titleTag.title).toBe("Login - Boi na Nuvem");
      }

      // Check for description
      const descriptionTag = meta.find((tag) => "name" in tag && tag.name === "description");
      expect(descriptionTag).toBeDefined();
      if (descriptionTag && "content" in descriptionTag) {
        expect(descriptionTag.content).toBe("Login page description");
      }
    });

    it("should include noindex in robots meta", () => {
      const meta = createAuthMeta("Register", "Register page");

      // The createSEOMeta function should add robots meta with noindex
      // Since createAuthMeta calls createSEOMeta with noindex: true
      const robotsTag = meta.find((tag) => "name" in tag && tag.name === "robots");
      expect(robotsTag).toBeDefined();
      if (robotsTag && "content" in robotsTag) {
        expect(robotsTag.content).toBe("noindex, nofollow");
      }
    });
  });
});
