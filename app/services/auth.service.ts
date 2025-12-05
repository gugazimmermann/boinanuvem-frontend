import { apiClient, ApiError } from "./api-client";

export interface RegisterCompanyDto {
  cnpj: string;
  companyName: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  userName: string;
  userCpf?: string;
  userEmail: string;
  userPhone: string;
  userPassword: string;
  userStreet?: string;
  userNumber?: string;
  userComplement?: string;
  userNeighborhood?: string;
  userCity?: string;
  userState?: string;
  userZipCode?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    mainUser: boolean;
    companyId: string;
    permissions: unknown;
    company: unknown;
  };
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface RegisterResponse {
  company: {
    id: string;
    cnpj: string;
    companyName: string;
    email: string;
    phone: string;
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
    status: string;
    mainUser: boolean;
    companyId: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Auth service for handling authentication API calls
 */
export class AuthService {
  /**
   * Register a new company with main user
   */
  async registerCompany(data: RegisterCompanyDto): Promise<RegisterResponse> {
    try {
      return await apiClient.post<RegisterResponse>("/auth/register/company", data);
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle specific error cases
        if (error.status === 409) {
          throw new Error("Company or user with this email/CNPJ already exists");
        }
        if (error.status === 400) {
          throw new Error("Invalid registration data");
        }
      }
      throw error;
    }
  }

  /**
   * Extract error message from 401 response
   */
  private async extract401ErrorMessage(error: ApiError): Promise<string> {
    let errorMessage = "Invalid credentials";
    try {
      const errorData = await error.response?.json();
      if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // If we can't parse the error, use default message
    }
    return errorMessage;
  }

  /**
   * Handle API errors for login
   */
  private async handleLoginError(error: unknown): Promise<never> {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        const errorMessage = await this.extract401ErrorMessage(error);
        throw new Error(errorMessage);
      }
      if (error.status === 400) {
        throw new Error("Invalid login data");
      }
    }
    throw error;
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string, rememberMe = false): Promise<LoginResponse> {
    try {
      const loginDto: LoginDto = {
        email,
        password,
        rememberMe,
      };
      return await apiClient.post<LoginResponse>("/auth/login", loginDto);
    } catch (error) {
      return await this.handleLoginError(error);
    }
  }

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const forgotPasswordDto: ForgotPasswordDto = { email };
      return await apiClient.post<{ message: string }>("/auth/forgot-password", forgotPasswordDto);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          throw new Error("User not found");
        }
      }
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const resetPasswordDto: ResetPasswordDto = { token, password };
      return await apiClient.post<{ message: string }>("/auth/reset-password", resetPasswordDto);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          throw new Error("Invalid or expired reset token");
        }
      }
      throw error;
    }
  }

  /**
   * Verify email address with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const verifyEmailDto: VerifyEmailDto = { token };
      return await apiClient.post<{ message: string }>("/auth/verify-email", verifyEmailDto);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          throw new Error("Invalid or expired verification token");
        }
      }
      throw error;
    }
  }

  /**
   * Setup password and verify email (for team members)
   */
  async setupPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const resetPasswordDto: ResetPasswordDto = { token, password };
      return await apiClient.post<{ message: string }>("/auth/setup-password", resetPasswordDto);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          throw new Error("Invalid or expired verification token");
        }
      }
      throw error;
    }
  }

  /**
   * Resend email verification (requires authentication)
   */
  async resendVerification(): Promise<{ message: string }> {
    try {
      return await apiClient.post<{ message: string }>("/auth/resend-verification");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new Error("Authentication required");
        }
      }
      throw error;
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const changePasswordDto: ChangePasswordDto = { currentPassword, newPassword };
      return await apiClient.post<{ message: string }>("/auth/change-password", changePasswordDto);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new Error("Current password is incorrect");
        }
        if (error.status === 400) {
          throw new Error("Invalid password data");
        }
      }
      throw error;
    }
  }

  /**
   * Logout user (call backend to invalidate refresh token)
   */
  async logout(refreshToken?: string): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>("/auth/logout", {
      refresh_token: refreshToken,
    });
  }

  /**
   * Refresh access token
   * Note: retryOn401 is false to prevent infinite loops when refresh token is invalid
   */
  async refreshToken(
    refreshToken: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      return await apiClient.post<{ access_token: string; refresh_token: string }>(
        "/auth/refresh",
        {
          refresh_token: refreshToken,
        },
        false // Don't retry on 401 for refresh endpoint
      );
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new Error("Invalid refresh token");
        }
      }
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
