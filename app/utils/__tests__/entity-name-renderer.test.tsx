import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderEntityName } from "../entity-name-renderer";
import type { Supplier, Employee, ServiceProvider, Buyer } from "~/types";

describe("renderEntityName", () => {
  const suppliersMap = new Map<string, Supplier>([
    [
      "supplier-1",
      {
        id: "supplier-1",
        code: "SUP-001",
        name: "Supplier One",
        companyId: "company-1",
        status: "active",
        createdAt: "2024-01-01T00:00:00Z",
        propertyIds: [],
      },
    ],
  ]);
  const employeesMap = new Map<string, Employee>([
    [
      "employee-1",
      {
        id: "employee-1",
        code: "EMP-001",
        name: "Employee One",
        companyId: "company-1",
        status: "active",
        createdAt: "2024-01-01T00:00:00Z",
        propertyIds: [],
      },
    ],
  ]);
  const serviceProvidersMap = new Map<string, ServiceProvider>([
    [
      "provider-1",
      {
        id: "provider-1",
        code: "SP-001",
        name: "Provider One",
        companyId: "company-1",
        status: "active",
        createdAt: "2024-01-01T00:00:00Z",
        propertyIds: [],
      },
    ],
  ]);
  const buyersMap = new Map<string, Buyer>([
    [
      "buyer-1",
      {
        id: "buyer-1",
        code: "BUY-001",
        name: "Buyer One",
        companyId: "company-1",
        status: "active",
        createdAt: "2024-01-01T00:00:00Z",
        propertyIds: [],
      },
    ],
  ]);

  describe("expense type", () => {
    it("should render supplier name for expense", () => {
      const result = renderEntityName({
        supplierId: "supplier-1",
        type: "expense",
        suppliersMap,
      });
      const { container } = render(result);
      expect(container.textContent).toBe("Supplier One");
    });

    it("should render employee name when supplier not available", () => {
      const result = renderEntityName({
        employeeId: "employee-1",
        type: "expense",
        employeesMap,
      });
      const { container } = render(result);
      expect(container.textContent).toBe("Employee One");
    });

    it("should render service provider name when supplier and employee not available", () => {
      const result = renderEntityName({
        serviceProviderId: "provider-1",
        type: "expense",
        serviceProvidersMap,
      });
      const { container } = render(result);
      expect(container.textContent).toBe("Provider One");
    });

    it("should prioritize supplier over employee", () => {
      const result = renderEntityName({
        supplierId: "supplier-1",
        employeeId: "employee-1",
        type: "expense",
        suppliersMap,
        employeesMap,
      });
      const { container } = render(result);
      expect(container.textContent).toBe("Supplier One");
    });

    it("should render dash when no entity found", () => {
      const result = renderEntityName({
        type: "expense",
      });
      const { container } = render(result);
      expect(container.textContent).toBe("-");
    });
  });

  describe("income type", () => {
    it("should render buyer name for income", () => {
      const result = renderEntityName({
        buyerId: "buyer-1",
        type: "income",
        buyersMap,
      });
      const { container } = render(result);
      expect(container.textContent).toBe("Buyer One");
    });

    it("should render service provider name when buyer not available", () => {
      const result = renderEntityName({
        serviceProviderId: "provider-1",
        type: "income",
        serviceProvidersMap,
      });
      const { container } = render(result);
      expect(container.textContent).toBe("Provider One");
    });

    it("should prioritize buyer over service provider", () => {
      const result = renderEntityName({
        buyerId: "buyer-1",
        serviceProviderId: "provider-1",
        type: "income",
        buyersMap,
        serviceProvidersMap,
      });
      const { container } = render(result);
      expect(container.textContent).toBe("Buyer One");
    });
  });

  describe("default type (expense)", () => {
    it("should default to expense behavior when type not specified", () => {
      const result = renderEntityName({
        supplierId: "supplier-1",
        suppliersMap,
      });
      const { container } = render(result);
      expect(container.textContent).toBe("Supplier One");
    });
  });

  describe("edge cases", () => {
    it("should handle undefined IDs", () => {
      const result = renderEntityName({
        supplierId: undefined,
        type: "expense",
        suppliersMap,
      });
      const { container } = render(result);
      expect(container.textContent).toBe("-");
    });

    it("should handle missing maps", () => {
      const result = renderEntityName({
        supplierId: "supplier-1",
        type: "expense",
      });
      const { container } = render(result);
      expect(container.textContent).toBe("-");
    });

    it("should handle non-existent IDs", () => {
      const result = renderEntityName({
        supplierId: "non-existent",
        type: "expense",
        suppliersMap,
      });
      const { container } = render(result);
      expect(container.textContent).toBe("-");
    });
  });
});
