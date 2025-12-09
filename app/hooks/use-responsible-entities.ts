import { useState, useEffect } from "react";
import { getEmployees } from "~/services/employees.service";
import { getServiceProviders } from "~/services/service-providers.service";
import type { Employee, ServiceProvider } from "~/types";

export interface UseResponsibleEntitiesOptions {
  /** Company ID to filter entities by */
  readonly companyId: string;
  /** Whether to filter by active status (default: false) */
  readonly activeOnly?: boolean;
}

export interface UseResponsibleEntitiesResult {
  readonly employees: Employee[];
  readonly serviceProviders: ServiceProvider[];
  readonly isLoading: boolean;
}

/**
 * Hook to load employees and service providers for responsible selection in forms
 * Returns arrays for use in selection components
 */
export function useResponsibleEntities(
  options: UseResponsibleEntitiesOptions
): UseResponsibleEntitiesResult {
  const { companyId, activeOnly = false } = options;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const [employeesData, serviceProvidersData] = await Promise.all([
          getEmployees(),
          getServiceProviders(),
        ]);

        let filteredEmployees = employeesData.filter((e) => e.companyId === companyId);
        let filteredServiceProviders = serviceProvidersData.filter(
          (sp) => sp.companyId === companyId
        );

        if (activeOnly) {
          filteredEmployees = filteredEmployees.filter((e) => e.status === "active");
          filteredServiceProviders = filteredServiceProviders.filter(
            (sp) => sp.status === "active"
          );
        }

        setEmployees(filteredEmployees);
        setServiceProviders(filteredServiceProviders);
      } catch (error) {
        console.error("Failed to load employees or service providers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (companyId) {
      fetchEntities();
    } else {
      setIsLoading(false);
    }
  }, [companyId, activeOnly]);

  return {
    employees,
    serviceProviders,
    isLoading,
  };
}
