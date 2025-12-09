import type { ReactElement } from "react";
import type { Supplier, Employee, ServiceProvider, Buyer } from "~/types";

interface EntityNameRendererOptions {
  supplierId?: string;
  employeeId?: string;
  serviceProviderId?: string;
  buyerId?: string;
  type?: "income" | "expense";
  suppliersMap?: Map<string, Supplier>;
  employeesMap?: Map<string, Employee>;
  serviceProvidersMap?: Map<string, ServiceProvider>;
  buyersMap?: Map<string, Buyer>;
}

/**
 * Renders the name of an entity (supplier, employee, service provider, or buyer)
 * based on the provided IDs. For CashFlow transactions, it considers the type
 * (income/expense) to determine which entity to show.
 * If entity maps are not provided, returns "-".
 */
const renderName = (name: string | undefined): ReactElement => (
  <span className="text-gray-700 dark:text-gray-300">{name || "-"}</span>
);

const getEntityName = (
  id: string | undefined,
  map: Map<string, { name: string }> | undefined
): string | undefined => {
  if (!id || !map) return undefined;
  return map.get(id)?.name;
};

export function renderEntityName({
  supplierId,
  employeeId,
  serviceProviderId,
  buyerId,
  type,
  suppliersMap,
  employeesMap,
  serviceProvidersMap,
  buyersMap,
}: EntityNameRendererOptions): ReactElement {
  const isExpense = type === "expense" || !type;
  const isIncome = type === "income";

  if (isExpense) {
    const supplierName = getEntityName(supplierId, suppliersMap);
    if (supplierName) return renderName(supplierName);

    const employeeName = getEntityName(employeeId, employeesMap);
    if (employeeName) return renderName(employeeName);

    const serviceProviderName = getEntityName(serviceProviderId, serviceProvidersMap);
    if (serviceProviderName) return renderName(serviceProviderName);
  }

  if (isIncome) {
    const buyerName = getEntityName(buyerId, buyersMap);
    if (buyerName) return renderName(buyerName);

    const serviceProviderName = getEntityName(serviceProviderId, serviceProvidersMap);
    if (serviceProviderName) return renderName(serviceProviderName);
  }

  return <span className="text-gray-400 dark:text-gray-500">-</span>;
}
