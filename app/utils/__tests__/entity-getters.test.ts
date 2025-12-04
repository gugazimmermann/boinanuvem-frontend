import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEntityGetters } from "../entity-getters";
import * as locationsService from "~/services/locations.service";
import * as employeesService from "~/services/employees.service";
import * as serviceProvidersService from "~/services/service-providers.service";
import * as animalsService from "~/services/animals.service";

vi.mock("~/services/locations.service", () => ({
  getLocationById: vi.fn(),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: vi.fn(),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn(),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn(),
}));

describe("entity-getters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createEntityGetters", () => {
    it("should create getLocationById that returns name and code", () => {
      const mockLocation = {
        id: "loc-1",
        name: "Farm A",
        code: "FA",
        companyId: "company-1",
      };
      vi.mocked(locationsService.getLocationById).mockReturnValue(mockLocation);

      const getters = createEntityGetters();
      const result = getters.getLocationById("loc-1");

      expect(result).toEqual({ name: "Farm A", code: "FA" });
      expect(locationsService.getLocationById).toHaveBeenCalledWith("loc-1");
    });

    it("should return null when location is not found", () => {
      vi.mocked(locationsService.getLocationById).mockReturnValue(undefined);

      const getters = createEntityGetters();
      const result = getters.getLocationById("unknown-loc");

      expect(result).toBeNull();
    });

    it("should create getEmployeeById that returns name", () => {
      const mockEmployee = {
        id: "emp-1",
        name: "John Doe",
        companyId: "company-1",
      };
      vi.mocked(employeesService.getEmployeeById).mockReturnValue(mockEmployee);

      const getters = createEntityGetters();
      const result = getters.getEmployeeById("emp-1");

      expect(result).toEqual({ name: "John Doe" });
      expect(employeesService.getEmployeeById).toHaveBeenCalledWith("emp-1");
    });

    it("should return null when employee is not found", () => {
      vi.mocked(employeesService.getEmployeeById).mockReturnValue(undefined);

      const getters = createEntityGetters();
      const result = getters.getEmployeeById("unknown-emp");

      expect(result).toBeNull();
    });

    it("should create getServiceProviderById that returns name", () => {
      const mockServiceProvider = {
        id: "sp-1",
        name: "Vet Clinic",
        companyId: "company-1",
      };
      vi.mocked(serviceProvidersService.getServiceProviderById).mockReturnValue(
        mockServiceProvider
      );

      const getters = createEntityGetters();
      const result = getters.getServiceProviderById("sp-1");

      expect(result).toEqual({ name: "Vet Clinic" });
      expect(serviceProvidersService.getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    it("should return null when service provider is not found", () => {
      vi.mocked(serviceProvidersService.getServiceProviderById).mockReturnValue(undefined);

      const getters = createEntityGetters();
      const result = getters.getServiceProviderById("unknown-sp");

      expect(result).toBeNull();
    });

    it("should create getAnimalById that returns code and registrationNumber", () => {
      const mockAnimal = {
        id: "animal-1",
        code: "A001",
        registrationNumber: "REG123",
        companyId: "company-1",
      };
      vi.mocked(animalsService.getAnimalById).mockReturnValue(mockAnimal);

      const getters = createEntityGetters();
      const result = getters.getAnimalById("animal-1");

      expect(result).toEqual({ code: "A001", registrationNumber: "REG123" });
      expect(animalsService.getAnimalById).toHaveBeenCalledWith("animal-1");
    });

    it("should return null when animal is not found", () => {
      vi.mocked(animalsService.getAnimalById).mockReturnValue(undefined);

      const getters = createEntityGetters();
      const result = getters.getAnimalById("unknown-animal");

      expect(result).toBeNull();
    });

    it("should create all getters independently", () => {
      const mockLocation = { id: "loc-1", name: "Farm", code: "F", companyId: "c1" };
      const mockEmployee = { id: "emp-1", name: "John", companyId: "c1" };
      const mockServiceProvider = { id: "sp-1", name: "Vet", companyId: "c1" };
      const mockAnimal = { id: "a1", code: "A", registrationNumber: "R", companyId: "c1" };

      vi.mocked(locationsService.getLocationById).mockReturnValue(mockLocation);
      vi.mocked(employeesService.getEmployeeById).mockReturnValue(mockEmployee);
      vi.mocked(serviceProvidersService.getServiceProviderById).mockReturnValue(
        mockServiceProvider
      );
      vi.mocked(animalsService.getAnimalById).mockReturnValue(mockAnimal);

      const getters = createEntityGetters();

      expect(getters.getLocationById("loc-1")).toEqual({ name: "Farm", code: "F" });
      expect(getters.getEmployeeById("emp-1")).toEqual({ name: "John" });
      expect(getters.getServiceProviderById("sp-1")).toEqual({ name: "Vet" });
      expect(getters.getAnimalById("a1")).toEqual({ code: "A", registrationNumber: "R" });
    });
  });
});
