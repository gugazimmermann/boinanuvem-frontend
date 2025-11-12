/**
 * Property-related types
 */

import type { Area } from "./location";

export interface Property extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  area: Area;
  status: "active" | "inactive";
  createdAt: string;
  companyId: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyFormData {
  code: string;
  name: string;
  area: Area;
  status: "active" | "inactive";
  companyId: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}
