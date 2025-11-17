/**
 * Services Index
 * Central export point for all services
 *
 * This module provides a clean interface to access all data services.
 * Services abstract the data layer (mocks) and provide business logic.
 */

// Base service utilities
export * from "./base-service";

// Core entity services
export * from "./animals.service";
export * from "./users.service";
export * from "./companies.service";
export * from "./properties.service";
export * from "./locations.service";
export * from "./employees.service";
export * from "./suppliers.service";
export * from "./buyers.service";
export * from "./service-providers.service";

// Record services
export * from "./births.service";
export * from "./weighings.service";
export * from "./acquisitions.service";

// Movement services
export * from "./animal-movements.service";
export * from "./location-movements.service";

// Observation services
export * from "./animal-observations.service";
export * from "./location-observations.service";
export * from "./employee-observations.service";
export * from "./service-provider-observations.service";
export * from "./supplier-observations.service";
export * from "./buyer-observations.service";

// Cash flow services
export * from "./cash-flow.service";
export * from "./accounts-payable.service";
export * from "./accounts-receivable.service";
export * from "./bank-account.service";
