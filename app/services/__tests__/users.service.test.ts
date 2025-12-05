import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getCurrentUser,
  getTeamMembers,
  updateCurrentUser,
  updateTeamMember,
  createTeamMember,
  updateTeamMemberPermissions,
  type FullUserProfile,
} from "../users.service";
import { apiClient, ApiError } from "../api-client";
import type { UserFormData } from "~/types";
import type { UserPermissions } from "~/types/permissions";

// Mock the API client
vi.mock("../api-client", () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
  ApiError: class extends Error {
    constructor(
      message: string,
      public status: number
    ) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

describe("users.service", () => {
  const mockUserProfile: FullUserProfile = {
    id: "user-1",
    name: "User 1",
    cpf: "123.456.789-00",
    email: "user1@test.com",
    phone: "(11) 99999-9999",
    street: "Street 1",
    number: "123",
    complement: null,
    neighborhood: "Neighborhood 1",
    city: "City 1",
    state: "State 1",
    zipCode: "12345-678",
    mainUser: false,
    status: "active",
    companyId: "company-1",
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
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    emailVerifiedAt: null,
    company: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("should return current user profile", async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockUserProfile);

      const result = await getCurrentUser();

      expect(result).toEqual(mockUserProfile);
      expect(apiClient.get).toHaveBeenCalledWith("/users/me");
    });

    it("should throw error on 401", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(getCurrentUser()).rejects.toThrow("Authentication required");
    });

    it("should throw error on 404", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError("Not found", 404));

      await expect(getCurrentUser()).rejects.toThrow("User not found");
    });

    it("should throw original error for other status codes", async () => {
      const error = new ApiError("Server error", 500);
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(getCurrentUser()).rejects.toThrow("Server error");
    });
  });

  describe("getTeamMembers", () => {
    it("should return team members list", async () => {
      const mockMembers = [mockUserProfile];
      vi.mocked(apiClient.get).mockResolvedValue(mockMembers);

      const result = await getTeamMembers();

      expect(result).toEqual(mockMembers);
      expect(apiClient.get).toHaveBeenCalledWith("/users");
    });

    it("should throw error on 403", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(getTeamMembers()).rejects.toThrow("Only main users can view team members");
    });

    it("should throw error on 401", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(getTeamMembers()).rejects.toThrow("Authentication required");
    });
  });

  describe("updateCurrentUser", () => {
    it("should update current user profile", async () => {
      const updateData: UserFormData = {
        name: "Updated User",
        email: "updated@test.com",
        phone: "(11) 88888-8888",
      };

      const updatedProfile = { ...mockUserProfile, ...updateData };
      vi.mocked(apiClient.put).mockResolvedValue(updatedProfile);

      const result = await updateCurrentUser(updateData);

      expect(result).toEqual(updatedProfile);
      expect(apiClient.put).toHaveBeenCalledWith("/users/me", {
        name: "Updated User",
        email: "updated@test.com",
        phone: "(11) 88888-8888",
        cpf: undefined,
        street: undefined,
        number: undefined,
        complement: undefined,
        neighborhood: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
      });
    });

    it("should throw error on 401", async () => {
      const updateData: UserFormData = {
        name: "Updated User",
        email: "updated@test.com",
        phone: "",
      };
      vi.mocked(apiClient.put).mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(updateCurrentUser(updateData)).rejects.toThrow("Authentication required");
    });

    it("should throw error on 409", async () => {
      const updateData: UserFormData = {
        name: "Updated User",
        email: "updated@test.com",
        phone: "",
      };
      vi.mocked(apiClient.put).mockRejectedValue(new ApiError("Conflict", 409));

      await expect(updateCurrentUser(updateData)).rejects.toThrow("Email already exists");
    });
  });

  describe("updateTeamMember", () => {
    it("should update team member profile", async () => {
      const updateData: UserFormData = {
        name: "Updated User",
        email: "updated@test.com",
        phone: "(11) 88888-8888",
      };

      const updatedProfile = { ...mockUserProfile, ...updateData };
      vi.mocked(apiClient.put).mockResolvedValue(updatedProfile);

      const result = await updateTeamMember("user-1", updateData);

      expect(result).toEqual(updatedProfile);
      expect(apiClient.put).toHaveBeenCalledWith("/users/user-1", {
        name: "Updated User",
        email: "updated@test.com",
        phone: "(11) 88888-8888",
        cpf: undefined,
        street: undefined,
        number: undefined,
        complement: undefined,
        neighborhood: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
      });
    });

    it("should throw error on 403", async () => {
      const updateData: UserFormData = {
        name: "Updated User",
        email: "updated@test.com",
        phone: "",
      };
      vi.mocked(apiClient.put).mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(updateTeamMember("user-1", updateData)).rejects.toThrow(
        "Only main users can update team members"
      );
    });

    it("should throw error on 404", async () => {
      const updateData: UserFormData = {
        name: "Updated User",
        email: "updated@test.com",
        phone: "",
      };
      vi.mocked(apiClient.put).mockRejectedValue(new ApiError("Not found", 404));

      await expect(updateTeamMember("user-1", updateData)).rejects.toThrow("User not found");
    });
  });

  describe("createTeamMember", () => {
    it("should create team member", async () => {
      const createData: UserFormData & { password: string } = {
        name: "New User",
        email: "newuser@test.com",
        phone: "(11) 77777-7777",
        password: "password123",
      };

      const newProfile = { ...mockUserProfile, ...createData, id: "user-new" };
      vi.mocked(apiClient.post).mockResolvedValue(newProfile);

      const result = await createTeamMember(createData);

      expect(result).toEqual(newProfile);
      expect(apiClient.post).toHaveBeenCalledWith("/users", {
        name: "New User",
        email: "newuser@test.com",
        phone: "(11) 77777-7777",
        password: "password123",
        cpf: undefined,
        street: undefined,
        number: undefined,
        complement: undefined,
        neighborhood: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
      });
    });

    it("should throw error on 403", async () => {
      const createData: UserFormData & { password: string } = {
        name: "New User",
        email: "newuser@test.com",
        phone: "",
        password: "password123",
      };
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(createTeamMember(createData)).rejects.toThrow(
        "Only main users can create team members"
      );
    });

    it("should throw error on 409", async () => {
      const createData: UserFormData & { password: string } = {
        name: "New User",
        email: "newuser@test.com",
        phone: "",
        password: "password123",
      };
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError("Conflict", 409));

      await expect(createTeamMember(createData)).rejects.toThrow(
        "Um usuário com este email já existe. Por favor, use outro email."
      );
    });
  });

  describe("updateTeamMemberPermissions", () => {
    it("should update team member permissions", async () => {
      const permissions: UserPermissions = {
        registration: {
          animals: { view: true, add: true, edit: false, remove: false },
          property: { view: false, add: false, edit: false, remove: false },
          location: { view: false, add: false, edit: false, remove: false },
          employee: { view: false, add: false, edit: false, remove: false },
          serviceProvider: { view: false, add: false, edit: false, remove: false },
          supplier: { view: false, add: false, edit: false, remove: false },
          buyer: { view: false, add: false, edit: false, remove: false },
          inventory: { view: false, add: false, edit: false, remove: false },
        },
        records: {
          births: { view: false, add: false, edit: false, remove: false },
          acquisitions: { view: false, add: false, edit: false, remove: false },
          weighings: { view: false, add: false, edit: false, remove: false },
          sales: { view: true, add: true, edit: true, remove: false },
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
      };

      const updatedProfile = { ...mockUserProfile, permissions };
      vi.mocked(apiClient.put).mockResolvedValue(updatedProfile);

      const result = await updateTeamMemberPermissions("user-1", permissions);

      expect(result).toEqual(updatedProfile);
      expect(apiClient.put).toHaveBeenCalledWith("/users/user-1/permissions", {
        registration: {
          property: permissions.registration.property,
          location: permissions.registration.location,
          employee: permissions.registration.employee,
          serviceProvider: permissions.registration.serviceProvider,
          supplier: permissions.registration.supplier,
          buyer: permissions.registration.buyer,
          inventory: permissions.registration.inventory,
          animals: permissions.registration.animals,
        },
        records: {
          births: permissions.records.births,
          acquisitions: permissions.records.acquisitions,
          weighings: permissions.records.weighings,
          sales: permissions.records.sales,
          deaths: permissions.records.deaths,
          sanitaryControls: permissions.records.sanitaryControls,
          locationMovements: permissions.records.locationMovements,
          animalMovements: permissions.records.animalMovements,
          inventoryMovements: permissions.records.inventoryMovements,
        },
        breedings: {
          breedings: permissions.breedings.breedings,
          unconfirmedBreedings: permissions.breedings.unconfirmedBreedings,
          pregnantCows: permissions.breedings.pregnantCows,
          reproductiveIndexes: permissions.breedings.reproductiveIndexes,
          birthForecast: permissions.breedings.birthForecast,
        },
        finances: {
          cashFlow: permissions.finances.cashFlow,
          accountsPayable: permissions.finances.accountsPayable,
          accountsReceivable: permissions.finances.accountsReceivable,
          bankAccounts: permissions.finances.bankAccounts,
        },
      });
    });

    it("should throw error on 403", async () => {
      const permissions: UserPermissions = {
        registration: {
          animals: { view: true, add: false, edit: false, remove: false },
          property: { view: false, add: false, edit: false, remove: false },
          location: { view: false, add: false, edit: false, remove: false },
          employee: { view: false, add: false, edit: false, remove: false },
          serviceProvider: { view: false, add: false, edit: false, remove: false },
          supplier: { view: false, add: false, edit: false, remove: false },
          buyer: { view: false, add: false, edit: false, remove: false },
          inventory: { view: false, add: false, edit: false, remove: false },
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
      };
      vi.mocked(apiClient.put).mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(updateTeamMemberPermissions("user-1", permissions)).rejects.toThrow(
        "Only main users can update permissions"
      );
    });

    it("should throw error on 404", async () => {
      const permissions: UserPermissions = {
        registration: {
          animals: { view: true, add: false, edit: false, remove: false },
          property: { view: false, add: false, edit: false, remove: false },
          location: { view: false, add: false, edit: false, remove: false },
          employee: { view: false, add: false, edit: false, remove: false },
          serviceProvider: { view: false, add: false, edit: false, remove: false },
          supplier: { view: false, add: false, edit: false, remove: false },
          buyer: { view: false, add: false, edit: false, remove: false },
          inventory: { view: false, add: false, edit: false, remove: false },
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
      };
      vi.mocked(apiClient.put).mockRejectedValue(new ApiError("Not found", 404));

      await expect(updateTeamMemberPermissions("user-1", permissions)).rejects.toThrow(
        "User not found"
      );
    });
  });
});
