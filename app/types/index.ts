/**
 * Centralized type exports
 *
 * This barrel file exports all types from the types directory,
 * making it easy to import types from a single location.
 *
 * Usage:
 *   import { Location, LocationType, AreaType } from "~/types";
 *   import type { Property, PropertyFormData } from "~/types";
 */

// Common types
export type { Language, Status, LanguageInfo } from "./common";

// Location types
export type { Area, Location, LocationFormData } from "./location";
export { AreaType, LocationType } from "./location";

// Property types
export type { Property, PropertyFormData } from "./property";

// User types
export type { UserRole, UserFormData, TeamUser } from "./user";

// Company types
export type { Company, CompanyFormData } from "./company";

// Address types
export type { AddressFormData, CEPData, CNPJData } from "./address";

// Table types
export type {
  SortDirection,
  TableColumn,
  TableAction,
  TableFilter,
  TablePagination,
  TableHeaderProps,
  TableEmptyState,
  TableProps,
} from "./table";

// Sidebar types
export type { SidebarItemConfig } from "./sidebar";

// Activity types
export type { ActivityLogEntry } from "./activity";

// Hooks types
export type {
  UseCEPLookupOptions,
  UseCEPLookupReturn,
  UseCNPJLookupOptions,
  UseCNPJLookupReturn,
} from "./hooks";

// Routes types
export type { RoutePath, RouteName } from "./routes";

// UI types
export type { ConfirmationModalProps } from "./ui";

// Geocoding types
export type { GeocodeResult, GeocodeError } from "./geocoding";

// Permissions types (already exists)
export type { PermissionAction, ResourcePermissions, UserPermissions } from "./permissions";
