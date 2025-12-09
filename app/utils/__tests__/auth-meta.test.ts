import { describe, it, expect } from "vitest";
import { createAuthMeta } from "../auth-meta";

describe("createAuthMeta", () => {
  it("should create SEO meta with title and description", () => {
    const meta = createAuthMeta("Login", "Login to your account");
    const titleTag = meta.find((tag): tag is { title: string } => "title" in tag);
    expect(titleTag?.title).toBe("Login - Boi na Nuvem");

    const descriptionTag = meta.find((tag) => "name" in tag && tag.name === "description");
    expect((descriptionTag as { name: string; content: string }).content).toBe(
      "Login to your account"
    );
  });

  it("should set noindex to true", () => {
    const meta = createAuthMeta("Login", "Login page");
    const robotsTag = meta.find((tag) => "name" in tag && tag.name === "robots");
    expect((robotsTag as { name: string; content: string }).content).toBe("noindex, nofollow");
  });

  it("should include all standard SEO tags", () => {
    const meta = createAuthMeta("Login", "Login page");
    expect(meta.length).toBeGreaterThan(5); // Should include title, description, robots, og tags, twitter tags
  });
});
