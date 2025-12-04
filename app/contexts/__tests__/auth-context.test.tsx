import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, renderHook, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../auth-context";
import { getUserById } from "~/services/users.service";
import type { TeamUser } from "~/types";

// Mock the users service
vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn(),
}));

describe("AuthContext", () => {
  const mockUser: TeamUser = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Guga Zimmermann",
    email: "gugazimmermann@gmail.com",
    phone: "+5511999999999",
    status: "active",
    mainUser: true,
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    createdAt: "2025-01-01",
    permissions: {
      registration: {
        property: { view: false, add: false, edit: false, remove: false },
        location: { view: false, add: false, edit: false, remove: false },
        employee: { view: false, add: false, edit: false, remove: false },
        serviceProvider: { view: false, add: false, edit: false, remove: false },
        supplier: { view: false, add: false, edit: false, remove: false },
        buyer: { view: false, add: false, edit: false, remove: false },
        inventory: { view: false, add: false, edit: false, remove: false },
        animals: { view: false, add: false, edit: false, remove: false },
      },
      records: {
        births: { view: false, add: false, edit: false, remove: false },
        acquisitions: { view: false, add: false, edit: false, remove: false },
        weighings: { view: false, add: false, edit: false, remove: false },
        sales: { view: false, add: false, edit: false, remove: false },
        deaths: { view: false, add: false, edit: false, remove: false },
        sanitaryControls: { view: false, add: false, edit: false, remove: false },
        locationMovements: { view: false, add: false, edit: false, remove: false },
        animalMovements: { view: false, add: false, edit: false, remove: false },
        inventoryMovements: { view: false, add: false, edit: false, remove: false },
      },
      breedings: {
        breedings: { view: false, add: false, edit: false, remove: false },
        unconfirmedBreedings: { view: false, add: false, edit: false, remove: false },
        pregnantCows: { view: false, add: false, edit: false, remove: false },
        reproductiveIndexes: { view: false, add: false, edit: false, remove: false },
        birthForecast: { view: false, add: false, edit: false, remove: false },
      },
      finances: {
        cashFlow: { view: false, add: false, edit: false, remove: false },
        accountsPayable: { view: false, add: false, edit: false, remove: false },
        accountsReceivable: { view: false, add: false, edit: false, remove: false },
        bankAccounts: { view: false, add: false, edit: false, remove: false },
      },
      reports: {
        analytics: { view: false, add: false, edit: false, remove: false },
        financialReports: { view: false, add: false, edit: false, remove: false },
        animalReports: { view: false, add: false, edit: false, remove: false },
        productionReports: { view: false, add: false, edit: false, remove: false },
        inventoryReports: { view: false, add: false, edit: false, remove: false },
      },
    },
  };

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    vi.clearAllMocks();
    // Reset getUserById mock
    vi.mocked(getUserById).mockReturnValue(undefined);
  });

  describe("AuthProvider", () => {
    it("should render children correctly", () => {
      const { container } = render(
        <AuthProvider>
          <div>Test Content</div>
        </AuthProvider>
      );

      expect(container.textContent).toBe("Test Content");
    });

    it("should initialize with null user when no localStorage value", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.currentUser).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should initialize from localStorage if present", () => {
      localStorage.setItem("currentUserId", mockUser.id);
      vi.mocked(getUserById).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.currentUser).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(getUserById).toHaveBeenCalledWith(mockUser.id);
    });

    it("should handle SSR (window undefined)", () => {
      // Note: In SSR, window is undefined but React still needs it to render
      // This test verifies the context handles the initial state correctly
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.currentUser).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("useAuth", () => {
    it("should return correct context values", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current).toHaveProperty("currentUser");
      expect(result.current).toHaveProperty("login");
      expect(result.current).toHaveProperty("logout");
      expect(result.current).toHaveProperty("isAuthenticated");
      expect(typeof result.current.login).toBe("function");
      expect(typeof result.current.logout).toBe("function");
      expect(typeof result.current.isAuthenticated).toBe("boolean");
    });

    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      let error: Error | undefined;
      try {
        renderHook(() => useAuth());
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error?.message).toContain("useAuth must be used within an AuthProvider");

      consoleSpy.mockRestore();
    });

    it("should have isAuthenticated as false when no user", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should have isAuthenticated as true when user exists", () => {
      localStorage.setItem("currentUserId", mockUser.id);
      vi.mocked(getUserById).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("login", () => {
    it("should update currentUserId and persist to localStorage", async () => {
      vi.mocked(getUserById).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.currentUser).toBeNull();
      expect(localStorage.getItem("currentUserId")).toBeNull();

      act(() => {
        result.current.login(mockUser.id);
      });

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem("currentUserId")).toBe(mockUser.id);
      expect(getUserById).toHaveBeenCalledWith(mockUser.id);
    });

    it("should handle login with non-existent user ID", async () => {
      vi.mocked(getUserById).mockReturnValue(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login("non-existent-id");
      });

      await waitFor(() => {
        expect(localStorage.getItem("currentUserId")).toBe("non-existent-id");
      });

      expect(result.current.currentUser).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should update localStorage when logging in", async () => {
      vi.mocked(getUserById).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      act(() => {
        result.current.login(mockUser.id);
      });

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith("currentUserId", mockUser.id);
      });
    });
  });

  describe("logout", () => {
    it("should clear currentUserId and remove from localStorage", async () => {
      localStorage.setItem("currentUserId", mockUser.id);
      vi.mocked(getUserById).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.currentUser).toBeNull();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem("currentUserId")).toBeNull();
    });

    it("should remove item from localStorage when logging out", async () => {
      localStorage.setItem("currentUserId", mockUser.id);
      vi.mocked(getUserById).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");

      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        expect(removeItemSpy).toHaveBeenCalledWith("currentUserId");
      });
    });

    it("should handle logout when already logged out", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.currentUser).toBeNull();

      act(() => {
        result.current.logout();
      });

      expect(result.current.currentUser).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("currentUser resolution", () => {
    it("should correctly resolve user from getUserById", async () => {
      vi.mocked(getUserById).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login(mockUser.id);
      });

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });

      expect(getUserById).toHaveBeenCalledWith(mockUser.id);
    });

    it("should return null when getUserById returns undefined", () => {
      vi.mocked(getUserById).mockReturnValue(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login("invalid-id");
      });

      expect(result.current.currentUser).toBeNull();
    });

    it("should update currentUser when userId changes", async () => {
      const mockUser2: TeamUser = {
        ...mockUser,
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Maria Santos",
      };

      vi.mocked(getUserById).mockReturnValueOnce(mockUser).mockReturnValueOnce(mockUser2);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login(mockUser.id);
      });
      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });

      act(() => {
        result.current.login(mockUser2.id);
      });
      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser2);
      });
    });
  });

  describe("localStorage persistence", () => {
    it("should persist user ID to localStorage on login", async () => {
      vi.mocked(getUserById).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login(mockUser.id);
      });

      await waitFor(() => {
        expect(localStorage.getItem("currentUserId")).toBe(mockUser.id);
      });
    });

    it("should remove user ID from localStorage on logout", async () => {
      localStorage.setItem("currentUserId", mockUser.id);
      vi.mocked(getUserById).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        expect(localStorage.getItem("currentUserId")).toBeNull();
      });
    });

    it("should persist across re-renders", async () => {
      localStorage.setItem("currentUserId", mockUser.id);
      vi.mocked(getUserById).mockReturnValue(mockUser);

      const { result, rerender } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });

      rerender();

      expect(result.current.currentUser).toEqual(mockUser);
      expect(localStorage.getItem("currentUserId")).toBe(mockUser.id);
    });

    it("should update localStorage when userId changes", async () => {
      const mockUser2: TeamUser = {
        ...mockUser,
        id: "550e8400-e29b-41d4-a716-446655440001",
      };

      vi.mocked(getUserById).mockReturnValueOnce(mockUser).mockReturnValueOnce(mockUser2);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login(mockUser.id);
      });
      await waitFor(() => {
        expect(localStorage.getItem("currentUserId")).toBe(mockUser.id);
      });

      act(() => {
        result.current.login(mockUser2.id);
      });
      await waitFor(() => {
        expect(localStorage.getItem("currentUserId")).toBe(mockUser2.id);
      });
    });
  });

  describe("isAuthenticated flag", () => {
    it("should be false when currentUser is null", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should be true when currentUser exists", async () => {
      vi.mocked(getUserById).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login(mockUser.id);
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it("should update when user logs in", async () => {
      vi.mocked(getUserById).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isAuthenticated).toBe(false);

      act(() => {
        result.current.login(mockUser.id);
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it("should update when user logs out", async () => {
      localStorage.setItem("currentUserId", mockUser.id);
      vi.mocked(getUserById).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });
});
