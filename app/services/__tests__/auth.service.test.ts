import { describe, it, expect, beforeEach, vi } from "vitest";
import { authService } from "../auth.service";
import { apiClient, ApiError } from "../api-client";
import type { RegisterCompanyDto, LoginResponse, RegisterResponse } from "../auth.service";

// Mock the API client
vi.mock("../api-client", () => ({
  apiClient: {
    post: vi.fn(),
  },
  ApiError: class extends Error {
    constructor(
      message: string,
      public status: number,
      public response?: Response
    ) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerCompany", () => {
    const mockRegisterData: RegisterCompanyDto = {
      cnpj: "12345678000190",
      companyName: "Test Company",
      email: "company@test.com",
      phone: "11999999999",
      street: "Test Street",
      number: "123",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345678",
      userName: "Test User",
      userEmail: "user@test.com",
      userPhone: "11888888888",
      userPassword: "password123",
    };

    const mockRegisterResponse: RegisterResponse = {
      company: {
        id: "company-1",
        cnpj: "12345678000190",
        companyName: "Test Company",
        email: "company@test.com",
        phone: "11999999999",
        street: "Test Street",
        number: "123",
        complement: null,
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SP",
        zipCode: "12345678",
        latitude: null,
        longitude: null,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
      user: {
        id: "user-1",
        email: "user@test.com",
        name: "Test User",
        status: "pending",
        mainUser: true,
        companyId: "company-1",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    };

    it("should register company successfully", async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockRegisterResponse);

      const result = await authService.registerCompany(mockRegisterData);

      expect(result).toEqual(mockRegisterResponse);
      expect(apiClient.post).toHaveBeenCalledWith("/auth/register/company", mockRegisterData);
    });

    it("should throw error on 409 conflict", async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError("Conflict", 409));

      await expect(authService.registerCompany(mockRegisterData)).rejects.toThrow(
        "Company or user with this email/CNPJ already exists"
      );
    });

    it("should throw error on 400 bad request", async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError("Bad request", 400));

      await expect(authService.registerCompany(mockRegisterData)).rejects.toThrow(
        "Invalid registration data"
      );
    });
  });

  describe("login", () => {
    const mockLoginResponse: LoginResponse = {
      access_token: "access-token-123",
      refresh_token: "refresh-token-456",
      user: {
        id: "user-1",
        email: "user@test.com",
        name: "Test User",
        mainUser: true,
        companyId: "company-1",
        permissions: {},
        company: {},
      },
    };

    it("should login successfully", async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockLoginResponse);

      const result = await authService.login("user@test.com", "password123", false);

      expect(result).toEqual(mockLoginResponse);
      expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
        email: "user@test.com",
        password: "password123",
        rememberMe: false,
      });
    });

    it("should login with rememberMe true", async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockLoginResponse);

      const result = await authService.login("user@test.com", "password123", true);

      expect(result).toEqual(mockLoginResponse);
      expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
        email: "user@test.com",
        password: "password123",
        rememberMe: true,
      });
    });

    it("should throw error on 401 with default message", async () => {
      const error = new ApiError("Unauthorized", 401);
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(authService.login("user@test.com", "wrongpassword", false)).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("should throw error on 401 with custom message from response", async () => {
      const mockResponse = {
        json: vi
          .fn()
          .mockResolvedValue({ message: "Account is not active. Please verify your email." }),
      } as unknown as Response;
      const error = new ApiError("Unauthorized", 401, mockResponse);
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(authService.login("user@test.com", "password123", false)).rejects.toThrow(
        "Account is not active. Please verify your email."
      );
    });

    it("should throw error on 400", async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError("Bad request", 400));

      await expect(authService.login("user@test.com", "password123", false)).rejects.toThrow(
        "Invalid login data"
      );
    });
  });

  describe("forgotPassword", () => {
    it("should send forgot password email", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ message: "Password reset email sent" });

      const result = await authService.forgotPassword("user@test.com");

      expect(result).toEqual({ message: "Password reset email sent" });
      expect(apiClient.post).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "user@test.com",
      });
    });

    it("should throw error on 400", async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError("Bad request", 400));

      await expect(authService.forgotPassword("user@test.com")).rejects.toThrow("User not found");
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ message: "Password reset successfully" });

      const result = await authService.resetPassword("reset-token-123", "newpassword123");

      expect(result).toEqual({ message: "Password reset successfully" });
      expect(apiClient.post).toHaveBeenCalledWith("/auth/reset-password", {
        token: "reset-token-123",
        password: "newpassword123",
      });
    });

    it("should throw error on 400", async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError("Bad request", 400));

      await expect(authService.resetPassword("invalid-token", "newpassword123")).rejects.toThrow(
        "Invalid or expired reset token"
      );
    });
  });

  describe("verifyEmail", () => {
    it("should verify email successfully", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ message: "Email verified successfully" });

      const result = await authService.verifyEmail("verification-token-123");

      expect(result).toEqual({ message: "Email verified successfully" });
      expect(apiClient.post).toHaveBeenCalledWith("/auth/verify-email", {
        token: "verification-token-123",
      });
    });

    it("should throw error on 400", async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError("Bad request", 400));

      await expect(authService.verifyEmail("invalid-token")).rejects.toThrow(
        "Invalid or expired verification token"
      );
    });
  });

  describe("resendVerification", () => {
    it("should resend verification email", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ message: "Verification email sent" });

      const result = await authService.resendVerification();

      expect(result).toEqual({ message: "Verification email sent" });
      expect(apiClient.post).toHaveBeenCalled();
      const calls = vi.mocked(apiClient.post).mock.calls;
      expect(calls[0][0]).toBe("/auth/resend-verification");
    });

    it("should throw error on 401", async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(authService.resendVerification()).rejects.toThrow("Authentication required");
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ message: "Password changed successfully" });

      const result = await authService.changePassword("oldpassword", "newpassword123");

      expect(result).toEqual({ message: "Password changed successfully" });
      expect(apiClient.post).toHaveBeenCalledWith("/auth/change-password", {
        currentPassword: "oldpassword",
        newPassword: "newpassword123",
      });
    });

    it("should throw error on 401", async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(authService.changePassword("wrongpassword", "newpassword123")).rejects.toThrow(
        "Current password is incorrect"
      );
    });

    it("should throw error on 400", async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError("Bad request", 400));

      await expect(authService.changePassword("oldpassword", "short")).rejects.toThrow(
        "Invalid password data"
      );
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ message: "Logout successful" });

      const result = await authService.logout("refresh-token-456");

      expect(result).toEqual({ message: "Logout successful" });
      expect(apiClient.post).toHaveBeenCalledWith("/auth/logout", {
        refresh_token: "refresh-token-456",
      });
    });

    it("should logout without refresh token", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ message: "Logout successful" });

      const result = await authService.logout();

      expect(result).toEqual({ message: "Logout successful" });
      expect(apiClient.post).toHaveBeenCalledWith("/auth/logout", {
        refresh_token: undefined,
      });
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      });

      const result = await authService.refreshToken("refresh-token-456");

      expect(result).toEqual({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      });
      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/refresh",
        {
          refresh_token: "refresh-token-456",
        },
        false
      );
    });

    it("should throw error on 401", async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(authService.refreshToken("invalid-token")).rejects.toThrow(
        "Invalid refresh token"
      );
    });
  });
});
