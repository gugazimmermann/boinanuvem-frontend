import { useState, useEffect, useCallback } from "react";
import { getProperties } from "~/services/properties.service";
import { getSuppliers } from "~/services/suppliers.service";
import { getBuyers } from "~/services/buyers.service";
import { getEmployees } from "~/services/employees.service";
import { getServiceProviders } from "~/services/service-providers.service";
import type { Property, Supplier, Buyer, Employee, ServiceProvider } from "~/types";

export interface UseEntityLoadersOptions {
  /** Whether to silently fail on errors (default: false) */
  readonly silentFail?: boolean;
  /** Company ID to filter entities by (optional) */
  readonly companyId?: string;
  /** Whether to filter by active status (default: false) */
  readonly activeOnly?: boolean;
}

export interface UseEntityLoadersResult {
  readonly properties: Map<string, Property>;
  readonly suppliers: Map<string, Supplier>;
  readonly buyers: Map<string, Buyer>;
  readonly employees: Map<string, Employee>;
  readonly serviceProviders: Map<string, ServiceProvider>;
  readonly isLoading: boolean;
  readonly getPropertyName: (id: string) => string | undefined;
  readonly getSupplierName: (id: string) => string | undefined;
  readonly getBuyerName: (id: string) => string | undefined;
  readonly getEmployeeName: (id: string) => string | undefined;
  readonly getServiceProviderName: (id: string) => string | undefined;
}

/**
 * Hook to load and manage all entity types (properties, suppliers, buyers, employees, service providers)
 * Returns Maps keyed by entity ID for efficient lookups
 */
export function useEntityLoaders(options: UseEntityLoadersOptions = {}): UseEntityLoadersResult {
  const { silentFail = false, companyId, activeOnly = false } = options;

  const [properties, setProperties] = useState<Map<string, Property>>(new Map());
  const [suppliers, setSuppliers] = useState<Map<string, Supplier>>(new Map());
  const [buyers, setBuyers] = useState<Map<string, Buyer>>(new Map());
  const [employees, setEmployees] = useState<Map<string, Employee>>(new Map());
  const [serviceProviders, setServiceProviders] = useState<Map<string, ServiceProvider>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEntities = async () => {
      try {
        setIsLoading(true);
        const [propertiesData, suppliersData, buyersData, employeesData, serviceProvidersData] =
          await Promise.all([
            getProperties(),
            getSuppliers(),
            getBuyers(),
            getEmployees(),
            getServiceProviders(),
          ]);

        // Filter by companyId and activeOnly if specified
        let filteredProperties = propertiesData;
        let filteredSuppliers = suppliersData;
        let filteredBuyers = buyersData;
        let filteredEmployees = employeesData;
        let filteredServiceProviders = serviceProvidersData;

        if (companyId) {
          filteredProperties = filteredProperties.filter((p) => p.companyId === companyId);
          filteredSuppliers = filteredSuppliers.filter((s) => s.companyId === companyId);
          filteredBuyers = filteredBuyers.filter((b) => b.companyId === companyId);
          filteredEmployees = filteredEmployees.filter((e) => e.companyId === companyId);
          filteredServiceProviders = filteredServiceProviders.filter(
            (sp) => sp.companyId === companyId
          );
        }

        if (activeOnly) {
          filteredSuppliers = filteredSuppliers.filter((s) => s.status === "active");
          filteredBuyers = filteredBuyers.filter((b) => b.status === "active");
          filteredEmployees = filteredEmployees.filter((e) => e.status === "active");
          filteredServiceProviders = filteredServiceProviders.filter(
            (sp) => sp.status === "active"
          );
        }

        setProperties(new Map(filteredProperties.map((p) => [p.id, p])));
        setSuppliers(new Map(filteredSuppliers.map((s) => [s.id, s])));
        setBuyers(new Map(filteredBuyers.map((b) => [b.id, b])));
        setEmployees(new Map(filteredEmployees.map((e) => [e.id, e])));
        setServiceProviders(new Map(filteredServiceProviders.map((sp) => [sp.id, sp])));
      } catch (error) {
        if (!silentFail) {
          console.error("Failed to load entities:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadEntities();
  }, [companyId, activeOnly, silentFail]);

  const getPropertyName = useCallback((id: string) => properties.get(id)?.name, [properties]);
  const getSupplierName = useCallback((id: string) => suppliers.get(id)?.name, [suppliers]);
  const getBuyerName = useCallback((id: string) => buyers.get(id)?.name, [buyers]);
  const getEmployeeName = useCallback((id: string) => employees.get(id)?.name, [employees]);
  const getServiceProviderName = useCallback(
    (id: string) => serviceProviders.get(id)?.name,
    [serviceProviders]
  );

  return {
    properties,
    suppliers,
    buyers,
    employees,
    serviceProviders,
    isLoading,
    getPropertyName,
    getSupplierName,
    getBuyerName,
    getEmployeeName,
    getServiceProviderName,
  };
}
