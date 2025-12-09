import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
import { AuthService, authService } from "../auth.service";

// Mock apiClient
vi.mock("../api-client", async () => {
  const actual = await vi.importActual("../api-client");
  return {
    ...actual,
    apiClient: {
      post: vi.fn(),
    },
  };
});

import { apiClient } from "../api-client";

describe("AuthService", () => {
  let service: AuthService;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    service = new AuthService();
    vi.clearAllMocks();
  });

  describe("registerCompany", () => {
    const mockRegisterData = {
      cnpj: "12345678000190",
      companyName: "Test Company",
      email: "company@test.com",
      phone: "11987654321",
      street: "Main St",
      number: "123",
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234567",
      userName: "John Doe",
      userEmail: "user@test.com",
      userPhone: "11987654321",
      userPassword: "password123",
    };

    it("should register company successfully", async () => {
      const mockResponse = {
        company: { id: "1", ...mockRegisterData },
        user: { id: "1", email: "user@test.com", name: "John Doe" },
      };
      mockPost.mockResolvedValue(mockResponse);

      const result = await service.registerCompany(mockRegisterData);

      expect(mockPost).toHaveBeenCalledWith("/auth/register/company", mockRegisterData);
      expect(result).toEqual(mockResponse);
    });

    it("should throw error on 409 conflict", async () => {
      mockPost.mockRejectedValue(new ApiError("Conflict", 409));

      await expect(service.registerCompany(mockRegisterData)).rejects.toThrow(
        "Company or user with this email/CNPJ already exists"
      );
    });

    it("should throw error on 400 bad request", async () => {
      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(service.registerCompany(mockRegisterData)).rejects.toThrow(
        "Invalid registration data"
      );
    });

    it("should re-throw non-ApiError errors", async () => {
      const error = new Error("Network error");
      mockPost.mockRejectedValue(error);

      await expect(service.registerCompany(mockRegisterData)).rejects.toThrow("Network error");
    });
  });

  describe("login", () => {
    it("should login successfully", async () => {
      const mockResponse = {
        access_token: "access-token",
        refresh_token: "refresh-token",
        user: {
          id: "1",
          email: "user@test.com",
          name: "John Doe",
          mainUser: true,
          companyId: "company-1",
          permissions: {},
          company: {},
        },
      };
      mockPost.mockResolvedValue(mockResponse);

      const result = await service.login("user@test.com", "password123");

      expect(mockPost).toHaveBeenCalledWith("/auth/login", {
        email: "user@test.com",
        password: "password123",
        rememberMe: false,
      });
      expect(result).toEqual(mockResponse);
    });

    it("should include rememberMe when true", async () => {
      mockPost.mockResolvedValue({ access_token: "token", refresh_token: "refresh", user: {} });

      await service.login("user@test.com", "password123", true);

      expect(mockPost).toHaveBeenCalledWith("/auth/login", {
        email: "user@test.com",
        password: "password123",
        rememberMe: true,
      });
    });

    it("should extract error message from 401 response", async () => {
      const mockResponse = {
        json: async () => ({ message: "Invalid email or password" }),
      } as Response;
      const apiError = new ApiError("Unauthorized", 401, mockResponse);
      mockPost.mockRejectedValue(apiError);

      await expect(service.login("user@test.com", "wrong")).rejects.toThrow(
        "Invalid email or password"
      );
    });

    it("should use default error message when 401 response has no message", async () => {
      const mockResponse = {
        json: async () => ({}),
      } as Response;
      const apiError = new ApiError("Unauthorized", 401, mockResponse);
      mockPost.mockRejectedValue(apiError);

      await expect(service.login("user@test.com", "wrong")).rejects.toThrow("Invalid credentials");
    });

    it("should handle 401 when response json parsing fails", async () => {
      const mockResponse = {
        json: async () => {
          throw new Error("Parse error");
        },
      } as unknown as Response;
      const apiError = new ApiError("Unauthorized", 401, mockResponse);
      mockPost.mockRejectedValue(apiError);

      await expect(service.login("user@test.com", "wrong")).rejects.toThrow("Invalid credentials");
    });

    it("should throw error on 400 bad request", async () => {
      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(service.login("user@test.com", "password")).rejects.toThrow(
        "Invalid login data"
      );
    });

    it("should re-throw non-ApiError errors", async () => {
      const error = new Error("Network error");
      mockPost.mockRejectedValue(error);

      await expect(service.login("user@test.com", "password")).rejects.toThrow("Network error");
    });
  });

  describe("forgotPassword", () => {
    it("should send forgot password request successfully", async () => {
      const mockResponse = { message: "Password reset email sent" };
      mockPost.mockResolvedValue(mockResponse);

      const result = await service.forgotPassword("user@test.com");

      expect(mockPost).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "user@test.com",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should throw error on 400 bad request", async () => {
      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(service.forgotPassword("user@test.com")).rejects.toThrow("User not found");
    });

    it("should re-throw non-ApiError errors", async () => {
      const error = new Error("Network error");
      mockPost.mockRejectedValue(error);

      await expect(service.forgotPassword("user@test.com")).rejects.toThrow("Network error");
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      const mockResponse = { message: "Password reset successfully" };
      mockPost.mockResolvedValue(mockResponse);

      const result = await service.resetPassword("token123", "newpassword");

      expect(mockPost).toHaveBeenCalledWith("/auth/reset-password", {
        token: "token123",
        password: "newpassword",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should throw error on 400 bad request", async () => {
      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(service.resetPassword("token", "password")).rejects.toThrow(
        "Invalid or expired reset token"
      );
    });
  });

  describe("verifyEmail", () => {
    it("should verify email successfully", async () => {
      const mockResponse = { message: "Email verified successfully" };
      mockPost.mockResolvedValue(mockResponse);

      const result = await service.verifyEmail("token123");

      expect(mockPost).toHaveBeenCalledWith("/auth/verify-email", { token: "token123" });
      expect(result).toEqual(mockResponse);
    });

    it("should throw error on 400 bad request", async () => {
      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(service.verifyEmail("token")).rejects.toThrow(
        "Invalid or expired verification token"
      );
    });
  });

  describe("setupPassword", () => {
    it("should setup password successfully", async () => {
      const mockResponse = { message: "Password setup successfully" };
      mockPost.mockResolvedValue(mockResponse);

      const result = await service.setupPassword("token123", "newpassword");

      expect(mockPost).toHaveBeenCalledWith("/auth/setup-password", {
        token: "token123",
        password: "newpassword",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should throw error on 400 bad request", async () => {
      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(service.setupPassword("token", "password")).rejects.toThrow(
        "Invalid or expired verification token"
      );
    });
  });

  describe("resendVerification", () => {
    it("should resend verification email successfully", async () => {
      const mockResponse = { message: "Verification email sent" };
      mockPost.mockResolvedValue(mockResponse);

      const result = await service.resendVerification();

      expect(mockPost).toHaveBeenCalledWith("/auth/resend-verification");
      expect(result).toEqual(mockResponse);
    });

    it("should throw error on 401 unauthorized", async () => {
      mockPost.mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(service.resendVerification()).rejects.toThrow("Authentication required");
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const mockResponse = { message: "Password changed successfully" };
      mockPost.mockResolvedValue(mockResponse);

      const result = await service.changePassword("oldpassword", "newpassword");

      expect(mockPost).toHaveBeenCalledWith("/auth/change-password", {
        currentPassword: "oldpassword",
        newPassword: "newpassword",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should throw error on 401 unauthorized", async () => {
      mockPost.mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(service.changePassword("wrong", "new")).rejects.toThrow(
        "Current password is incorrect"
      );
    });

    it("should throw error on 400 bad request", async () => {
      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(service.changePassword("old", "new")).rejects.toThrow("Invalid password data");
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const mockResponse = { message: "Logged out successfully" };
      mockPost.mockResolvedValue(mockResponse);

      const result = await service.logout("refresh-token");

      expect(mockPost).toHaveBeenCalledWith("/auth/logout", {
        refresh_token: "refresh-token",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should logout without refresh token", async () => {
      const mockResponse = { message: "Logged out successfully" };
      mockPost.mockResolvedValue(mockResponse);

      await service.logout();

      expect(mockPost).toHaveBeenCalledWith("/auth/logout", {
        refresh_token: undefined,
      });
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      const mockResponse = {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      };
      mockPost.mockResolvedValue(mockResponse);

      const result = await service.refreshToken("refresh-token");

      expect(mockPost).toHaveBeenCalledWith(
        "/auth/refresh",
        { refresh_token: "refresh-token" },
        false
      );
      expect(result).toEqual(mockResponse);
    });

    it("should not retry on 401 for refresh endpoint", async () => {
      mockPost.mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(service.refreshToken("invalid-token")).rejects.toThrow("Invalid refresh token");
    });

    it("should throw error on 401", async () => {
      mockPost.mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(service.refreshToken("invalid")).rejects.toThrow("Invalid refresh token");
    });
  });

  describe("authService singleton", () => {
    it("should be an instance of AuthService", () => {
      expect(authService).toBeInstanceOf(AuthService);
    });
  });
});
