import { getSupplierById } from "~/services/suppliers.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getBuyerById } from "~/services/buyers.service";

interface EntityNameRendererOptions {
  supplierId?: string;
  employeeId?: string;
  serviceProviderId?: string;
  buyerId?: string;
  type?: "income" | "expense";
}

/**
 * Renders the name of an entity (supplier, employee, service provider, or buyer)
 * based on the provided IDs. For CashFlow transactions, it considers the type
 * (income/expense) to determine which entity to show.
 */
import type { ReactElement } from "react";

export function renderEntityName({
  supplierId,
  employeeId,
  serviceProviderId,
  buyerId,
  type,
}: EntityNameRendererOptions): ReactElement {
  // For expense transactions or accounts payable, check supplier/employee/serviceProvider
  if (type === "expense" || !type) {
    if (supplierId) {
      const supplier = getSupplierById(supplierId);
      return <span className="text-gray-700 dark:text-gray-300">{supplier?.name || "-"}</span>;
    }
    if (employeeId) {
      const employee = getEmployeeById(employeeId);
      return <span className="text-gray-700 dark:text-gray-300">{employee?.name || "-"}</span>;
    }
    if (serviceProviderId) {
      const serviceProvider = getServiceProviderById(serviceProviderId);
      return (
        <span className="text-gray-700 dark:text-gray-300">{serviceProvider?.name || "-"}</span>
      );
    }
  }

  // For income transactions, check buyer/serviceProvider
  if (type === "income") {
    if (buyerId) {
      const buyer = getBuyerById(buyerId);
      return <span className="text-gray-700 dark:text-gray-300">{buyer?.name || "-"}</span>;
    }
    if (serviceProviderId) {
      const serviceProvider = getServiceProviderById(serviceProviderId);
      return (
        <span className="text-gray-700 dark:text-gray-300">{serviceProvider?.name || "-"}</span>
      );
    }
  }

  return <span className="text-gray-400 dark:text-gray-500">-</span>;
}
