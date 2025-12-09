import type { Location, Employee, ServiceProvider, Animal } from "~/types";

export interface EntityGetters {
  getLocationById: (id: string) => { name: string; code: string } | null;
  getEmployeeById: (id: string) => { name: string } | null;
  getServiceProviderById: (id: string) => { name: string } | null;
  getAnimalById: (id: string) => { code: string; registrationNumber: string } | null;
}

export interface EntityGettersOptions {
  locations?: Location[];
  employees?: Employee[];
  serviceProviders?: ServiceProvider[];
  animals?: Animal[];
}

/**
 * Creates a set of entity getter functions for use in movements and table columns.
 * These getters transform service results into simplified objects for display.
 * If entity arrays are not provided, the getters will return null.
 */
export function createEntityGetters(options?: EntityGettersOptions): EntityGetters {
  const locationsMap = options?.locations
    ? new Map(options.locations.map((l) => [l.id, l]))
    : new Map();
  const employeesMap = options?.employees
    ? new Map(options.employees.map((e) => [e.id, e]))
    : new Map();
  const serviceProvidersMap = options?.serviceProviders
    ? new Map(options.serviceProviders.map((sp) => [sp.id, sp]))
    : new Map();
  const animalsMap = options?.animals ? new Map(options.animals.map((a) => [a.id, a])) : new Map();

  return {
    getLocationById: (id: string) => {
      const location = locationsMap.get(id);
      return location ? { name: location.name, code: location.code } : null;
    },
    getEmployeeById: (id: string) => {
      const employee = employeesMap.get(id);
      return employee ? { name: employee.name } : null;
    },
    getServiceProviderById: (id: string) => {
      const serviceProvider = serviceProvidersMap.get(id);
      return serviceProvider ? { name: serviceProvider.name } : null;
    },
    getAnimalById: (id: string) => {
      const animal = animalsMap.get(id);
      return animal ? { code: animal.code, registrationNumber: animal.registrationNumber } : null;
    },
  };
}
