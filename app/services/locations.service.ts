import type { Location, LocationFormData } from "~/types";
import { mockLocations } from "~/mocks/locations";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "660e8400-e29b-41d4-a716";
const DEFAULT_ID = "660e8400-e29b-41d4-a716-446655440009";

export function getLocationById(locationId: string | undefined): Location | undefined {
  return findById(mockLocations, locationId);
}

export function getLocationsByPropertyId(propertyId: string): Location[] {
  return findByField(mockLocations, "propertyId", propertyId);
}

export function getLocationsByCompanyId(companyId: string): Location[] {
  return findByField(mockLocations, "companyId", companyId);
}

export function addLocation(data: LocationFormData): Location {
  return createEntity(mockLocations, data, ID_PREFIX, DEFAULT_ID);
}

export function updateLocation(locationId: string, data: Partial<LocationFormData>): boolean {
  return updateEntity(mockLocations, locationId, data);
}

export function deleteLocation(locationId: string): boolean {
  return deleteEntity(mockLocations, locationId);
}
