import { getLocationById } from "~/services/locations.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getAnimalById } from "~/services/animals.service";

export interface EntityGetters {
  getLocationById: (id: string) => { name: string; code: string } | null;
  getEmployeeById: (id: string) => { name: string } | null;
  getServiceProviderById: (id: string) => { name: string } | null;
  getAnimalById: (id: string) => { code: string; registrationNumber: string } | null;
}

/**
 * Generic factory function to create entity getters.
 * Takes a service getter function and a mapper function to extract the needed fields.
 */
function createEntityGetter<TEntity, TResult>(
  serviceGetter: (id: string) => TEntity | undefined,
  mapper: (entity: TEntity) => TResult
): (id: string) => TResult | null {
  return (id: string) => {
    const entity = serviceGetter(id);
    return entity ? mapper(entity) : null;
  };
}

/**
 * Creates a set of entity getter functions for use in movements and table columns.
 * These getters transform service results into simplified objects for display.
 */
export function createEntityGetters(): EntityGetters {
  return {
    getLocationById: createEntityGetter(getLocationById, (location) => ({
      name: location.name,
      code: location.code,
    })),
    getEmployeeById: createEntityGetter(getEmployeeById, (employee) => ({ name: employee.name })),
    getServiceProviderById: createEntityGetter(getServiceProviderById, (serviceProvider) => ({
      name: serviceProvider.name,
    })),
    getAnimalById: createEntityGetter(getAnimalById, (animal) => ({
      code: animal.code,
      registrationNumber: animal.registrationNumber,
    })),
  };
}
