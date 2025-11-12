/**
 * Location-related types and enums
 */

export enum AreaType {
  HECTARES = "hectares",
  SQUARE_METERS = "square_meters",
  SQUARE_FEET = "square_feet",
  ACRES = "acres",
  SQUARE_KILOMETERS = "square_kilometers",
  SQUARE_MILES = "square_miles",
}

export enum LocationType {
  PASTURE = "pasture",
  BARN = "barn",
  STORAGE = "storage",
  CORRAL = "corral",
  SILO = "silo",
  FIELD = "field",
  PADDOCK = "paddock",
  FEEDLOT = "feedlot",
  SEMI_FEEDLOT = "semi_feedlot",
  MILKING_PARLOR = "milking_parlor",
  WAREHOUSE = "warehouse",
  GARAGE = "garage",
  OFFICE = "office",
  RESIDENCE = "residence",
  OTHER = "other",
}

export interface Area {
  value: number;
  type: AreaType;
}

export interface Location extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  locationType: LocationType;
  area: Area;
  status: "active" | "inactive";
  createdAt: string;
  companyId: string;
  propertyId: string;
}

export interface LocationFormData {
  code: string;
  name: string;
  locationType: LocationType;
  area: Area;
  status: "active" | "inactive";
  companyId: string;
  propertyId: string;
}
