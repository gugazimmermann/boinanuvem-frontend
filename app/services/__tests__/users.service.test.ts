import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
import {
  getCurrentUser,
  getTeamMembers,
  updateCurrentUser,
  updateTeamMember,
  createTeamMember,
  updateTeamMemberPermissions,
  deleteTeamMember,
} from "../users.service";

// Mock apiClient
vi.mock("../api-client", async () => {
  const actual = await vi.importActual("../api-client");
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

import { apiClient } from "../api-client";

describe("users.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("should fetch current user successfully", async () => {
      const mockUser = {
        id: "1",
        name: "John Doe",
        email: "john@test.com",
        mainUser: true,
        companyId: "company-1",
        permissions: {},
        status: "active",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        emailVerifiedAt: "2024-01-01",
        company: {},
      };
      mockGet.mockResolvedValue(mockUser);

      const result = await getCurrentUser();

      expect(mockGet).toHaveBeenCalledWith("/users/me");
      expect(result).toEqual(mockUser);
    });

    it("should throw error on 401 unauthorized", async () => {
      mockGet.mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(getCurrentUser()).rejects.toThrow("Authentication required");
    });

    it("should throw error on 404 not found", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(getCurrentUser()).rejects.toThrow("User not found");
    });

    it("should re-throw non-ApiError errors", async () => {
      const error = new Error("Network error");
      mockGet.mockRejectedValue(error);

      await expect(getCurrentUser()).rejects.toThrow("Network error");
    });
  });

  describe("getTeamMembers", () => {
    it("should fetch team members successfully", async () => {
      const mockMembers = [
        {
          id: "1",
          name: "John Doe",
          email: "john@test.com",
          mainUser: true,
          companyId: "company-1",
          permissions: {},
          status: "active",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          emailVerifiedAt: "2024-01-01",
          company: {},
        },
      ];
      mockGet.mockResolvedValue(mockMembers);

      const result = await getTeamMembers();

      expect(mockGet).toHaveBeenCalledWith("/users");
      expect(result).toEqual(mockMembers);
    });

    it("should throw error on 403 forbidden", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(getTeamMembers()).rejects.toThrow("Only main users can view team members");
    });

    it("should throw error on 401 unauthorized", async () => {
      mockGet.mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(getTeamMembers()).rejects.toThrow("Authentication required");
    });
  });

  describe("updateCurrentUser", () => {
    const mockFormData = {
      name: "John Doe",
      email: "john@test.com",
      cpf: "12345678900",
      phone: "11987654321",
      street: "Main St",
      number: "123",
      complement: "Apt 4",
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234567",
      status: "active" as const,
      propertyIds: [],
    };

    it("should update current user successfully", async () => {
      const mockUser = {
        id: "1",
        ...mockFormData,
        mainUser: true,
        companyId: "company-1",
        permissions: {},
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        emailVerifiedAt: "2024-01-01",
        company: {},
      };
      mockPut.mockResolvedValue(mockUser);

      const result = await updateCurrentUser(mockFormData);

      expect(mockPut).toHaveBeenCalledWith("/users/me", {
        name: "John Doe",
        cpf: "12345678900",
        email: "john@test.com",
        phone: "11987654321",
        street: "Main St",
        number: "123",
        complement: "Apt 4",
        neighborhood: "Downtown",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234567",
      });
      expect(result).toEqual(mockUser);
    });

    it("should handle optional fields", async () => {
      const formDataWithoutOptional = {
        name: "John Doe",
        email: "john@test.com",
        status: "active" as const,
        phone: "",
        propertyIds: [],
      };
      mockPut.mockResolvedValue({ id: "1", ...formDataWithoutOptional });

      await updateCurrentUser(formDataWithoutOptional);

      expect(mockPut).toHaveBeenCalledWith("/users/me", {
        name: "John Doe",
        cpf: undefined,
        email: "john@test.com",
        phone: undefined,
        street: undefined,
        number: undefined,
        complement: undefined,
        neighborhood: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
      });
    });

    it("should convert empty strings to undefined", async () => {
      const formDataWithEmpty = {
        name: "John Doe",
        email: "john@test.com",
        cpf: "",
        phone: "",
        status: "active" as const,
        propertyIds: [],
      };
      mockPut.mockResolvedValue({ id: "1" });

      await updateCurrentUser(formDataWithEmpty);

      expect(mockPut).toHaveBeenCalledWith(
        "/users/me",
        expect.objectContaining({
          cpf: undefined,
          phone: undefined,
        })
      );
    });

    it("should throw error on 401 unauthorized", async () => {
      mockPut.mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(updateCurrentUser(mockFormData)).rejects.toThrow("Authentication required");
    });

    it("should throw error on 409 conflict", async () => {
      mockPut.mockRejectedValue(new ApiError("Conflict", 409));

      await expect(updateCurrentUser(mockFormData)).rejects.toThrow("Email already exists");
    });

    it("should throw error on 400 bad request", async () => {
      mockPut.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(updateCurrentUser(mockFormData)).rejects.toThrow("Invalid user data");
    });
  });

  describe("updateTeamMember", () => {
    const mockFormData = {
      name: "Jane Doe",
      email: "jane@test.com",
      phone: "1234567890",
      status: "active" as const,
      propertyIds: [],
    };

    it("should update team member successfully", async () => {
      const mockUser = {
        id: "2",
        ...mockFormData,
        mainUser: false,
        companyId: "company-1",
        permissions: {},
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        emailVerifiedAt: "2024-01-01",
        company: {},
      };
      mockPut.mockResolvedValue(mockUser);

      const result = await updateTeamMember("2", mockFormData);

      expect(mockPut).toHaveBeenCalledWith(
        "/users/2",
        expect.objectContaining({
          name: "Jane Doe",
          email: "jane@test.com",
        })
      );
      expect(result).toEqual(mockUser);
    });

    it("should throw error on 403 forbidden", async () => {
      mockPut.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(updateTeamMember("2", mockFormData)).rejects.toThrow(
        "Only main users can update team members"
      );
    });

    it("should throw error on 404 not found", async () => {
      mockPut.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(updateTeamMember("2", mockFormData)).rejects.toThrow("User not found");
    });

    it("should throw error on 409 conflict", async () => {
      mockPut.mockRejectedValue(new ApiError("Conflict", 409));

      await expect(updateTeamMember("2", mockFormData)).rejects.toThrow("Email already exists");
    });
  });

  describe("createTeamMember", () => {
    const mockFormData = {
      name: "New User",
      email: "new@test.com",
      phone: "1234567890",
      password: "password123",
      status: "active" as const,
      propertyIds: [],
    };

    it("should create team member successfully", async () => {
      const mockUser = {
        id: "3",
        name: "New User",
        email: "new@test.com",
        mainUser: false,
        companyId: "company-1",
        permissions: {},
        status: "active",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        emailVerifiedAt: null,
        company: {},
      };
      mockPost.mockResolvedValue(mockUser);

      const result = await createTeamMember(mockFormData);

      expect(mockPost).toHaveBeenCalledWith(
        "/users",
        expect.objectContaining({
          name: "New User",
          email: "new@test.com",
          password: "password123",
        })
      );
      expect(result).toEqual(mockUser);
    });

    it("should create team member without password", async () => {
      const formDataWithoutPassword = {
        name: "New User",
        email: "new@test.com",
        status: "active" as const,
        phone: "1234567890",
        propertyIds: [],
      };
      mockPost.mockResolvedValue({ id: "3", ...formDataWithoutPassword });

      await createTeamMember(formDataWithoutPassword);

      expect(mockPost).toHaveBeenCalledWith(
        "/users",
        expect.objectContaining({
          password: undefined,
        })
      );
    });

    it("should throw error on 403 forbidden", async () => {
      mockPost.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(createTeamMember(mockFormData)).rejects.toThrow(
        "Only main users can create team members"
      );
    });

    it("should throw error on 409 conflict", async () => {
      mockPost.mockRejectedValue(new ApiError("Conflict", 409));

      await expect(createTeamMember(mockFormData)).rejects.toThrow(
        "Um usuário com este email já existe. Por favor, use outro email."
      );
    });

    it("should throw error on 400 bad request", async () => {
      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(createTeamMember(mockFormData)).rejects.toThrow("Invalid user data");
    });
  });

  describe("updateTeamMemberPermissions", () => {
    const mockPermissions = {
      registration: {
        property: { view: true, add: true, edit: true, remove: false },
        location: { view: true, add: false, edit: false, remove: false },
        employee: { view: true, add: true, edit: true, remove: true },
        serviceProvider: { view: true, add: false, edit: false, remove: false },
        supplier: { view: true, add: true, edit: true, remove: false },
        buyer: { view: true, add: false, edit: false, remove: false },
        inventory: { view: true, add: true, edit: true, remove: true },
        animals: { view: true, add: true, edit: true, remove: false },
      },
      records: {
        births: { view: true, add: true, edit: true, remove: false },
        acquisitions: { view: true, add: true, edit: true, remove: false },
        weighings: { view: true, add: true, edit: true, remove: false },
        sales: { view: true, add: true, edit: true, remove: false },
        deaths: { view: true, add: true, edit: true, remove: false },
        sanitaryControls: { view: true, add: true, edit: true, remove: false },
        locationMovements: { view: true, add: true, edit: true, remove: false },
        animalMovements: { view: true, add: true, edit: true, remove: false },
        inventoryMovements: { view: true, add: true, edit: true, remove: false },
      },
      breedings: {
        breedings: { view: true, add: true, edit: true, remove: false },
        unconfirmedBreedings: { view: true, add: false, edit: false, remove: false },
        pregnantCows: { view: true, add: false, edit: false, remove: false },
        reproductiveIndexes: { view: true, add: false, edit: false, remove: false },
        birthForecast: { view: true, add: false, edit: false, remove: false },
      },
      finances: {
        cashFlow: { view: true, add: true, edit: true, remove: false },
        accountsPayable: { view: true, add: true, edit: true, remove: false },
        accountsReceivable: { view: true, add: true, edit: true, remove: false },
        bankAccounts: { view: true, add: false, edit: false, remove: false },
      },
      reports: {
        analytics: { view: true, add: false, edit: false, remove: false },
        financialReports: { view: true, add: false, edit: false, remove: false },
        animalReports: { view: true, add: false, edit: false, remove: false },
        productionReports: { view: true, add: false, edit: false, remove: false },
        inventoryReports: { view: true, add: false, edit: false, remove: false },
      },
    };

    it("should update permissions successfully", async () => {
      const mockUser = {
        id: "2",
        name: "Jane Doe",
        email: "jane@test.com",
        permissions: mockPermissions,
        mainUser: false,
        companyId: "company-1",
        status: "active",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        emailVerifiedAt: "2024-01-01",
        company: {},
      };
      mockPut.mockResolvedValue(mockUser);

      const result = await updateTeamMemberPermissions("2", mockPermissions);

      expect(mockPut).toHaveBeenCalledWith(
        "/users/2/permissions",
        expect.objectContaining({
          registration: expect.objectContaining({
            property: mockPermissions.registration.property,
          }),
        })
      );
      expect(result).toEqual(mockUser);
    });

    it("should throw error on 403 forbidden", async () => {
      mockPut.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(updateTeamMemberPermissions("2", mockPermissions)).rejects.toThrow(
        "Only main users can update permissions"
      );
    });

    it("should throw error on 404 not found", async () => {
      mockPut.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(updateTeamMemberPermissions("2", mockPermissions)).rejects.toThrow(
        "User not found"
      );
    });

    it("should throw error on 400 bad request", async () => {
      mockPut.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(updateTeamMemberPermissions("2", mockPermissions)).rejects.toThrow(
        "Invalid permissions data"
      );
    });
  });

  describe("deleteTeamMember", () => {
    it("should delete team member successfully", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteTeamMember("2");

      expect(mockDelete).toHaveBeenCalledWith("/users/2");
    });

    it("should throw error on 403 forbidden", async () => {
      mockDelete.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(deleteTeamMember("2")).rejects.toThrow(
        "Only main users can delete team members"
      );
    });

    it("should throw error on 404 not found", async () => {
      mockDelete.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(deleteTeamMember("2")).rejects.toThrow("User not found");
    });
  });
});
