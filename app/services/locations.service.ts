import type { Location, LocationFormData } from "~/types";
import { mockLocations } from "~/mocks/locations";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "660e8400-e29b-41d4-a716";
const DEFAULT_ID = "660e8400-e29b-41d4-a716-446655440009";

/**
 * Get location by ID
 */
export function getLocationById(locationId: string | undefined): Location | undefined {
  return findById(mockLocations, locationId);
}

/**
 * Get locations by property ID
 */
export function getLocationsByPropertyId(propertyId: string): Location[] {
  return findByField(mockLocations, "propertyId", propertyId);
}

/**
 * Get locations by company ID
 */
export function getLocationsByCompanyId(companyId: string): Location[] {
  return findByField(mockLocations, "companyId", companyId);
}

/**
 * Add a new location
 */
export function addLocation(data: LocationFormData): Location {
  return createEntity(mockLocations, data, ID_PREFIX, DEFAULT_ID);
}

/**
 * Update a location
 */
export function updateLocation(locationId: string, data: Partial<LocationFormData>): boolean {
  return updateEntity(mockLocations, locationId, data);
}

/**
 * Delete a location
 */
export function deleteLocation(locationId: string): boolean {
  return deleteEntity(mockLocations, locationId);
}
