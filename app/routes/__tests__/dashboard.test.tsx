import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { loader, default as DashboardLayoutRoute } from "../dashboard";
import { ROUTES } from "~/routes.config";
import { DashboardLayout } from "~/components/dashboard";

vi.mock("~/components/dashboard", () => ({
  DashboardLayout: vi.fn(() => <div data-testid="dashboard-layout">Dashboard Layout</div>),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    redirect: vi.fn((path: string) => {
      const error = new Error(`Redirect to ${path}`);
      (error as { status?: number; location?: string }).status = 302;
      (error as { status?: number; location?: string }).location = path;
      throw error;
    }),
  };
});

const CURRENT_USER_ID_KEY = "currentUserId";

describe("dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    if (typeof Storage !== "undefined") {
      localStorage.clear();
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (typeof Storage !== "undefined") {
      localStorage.clear();
    }
  });

  describe("loader", () => {
    it("should return null when userId exists in localStorage", async () => {
      localStorage.setItem(CURRENT_USER_ID_KEY, "user-123");

      const result = await loader();

      expect(result).toBeNull();
    });

    it("should redirect to login when userId does not exist in localStorage", async () => {
      localStorage.removeItem(CURRENT_USER_ID_KEY);

      await expect(loader()).rejects.toThrow(`Redirect to ${ROUTES.LOGIN}`);
    });

    it("should return null when window is undefined (SSR)", async () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - intentionally removing window for SSR test
      delete globalThis.window;

      const result = await loader();

      expect(result).toBeNull();

      globalThis.window = originalWindow;
    });
  });

  describe("DashboardLayoutRoute component", () => {
    it("should render DashboardLayout component", () => {
      render(
        <MemoryRouter>
          <DashboardLayoutRoute />
        </MemoryRouter>
      );

      expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
      expect(DashboardLayout).toHaveBeenCalled();
    });
  });
});
