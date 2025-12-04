import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFinanceFilters } from "../use-finance-filters";
import * as translationHook from "~/i18n/use-translation";
import * as propertiesService from "~/services/properties.service";
import * as suppliersService from "~/services/suppliers.service";
import * as buyersService from "~/services/buyers.service";
import * as employeesService from "~/services/employees.service";
import * as serviceProvidersService from "~/services/service-providers.service";
import * as formattingUtils from "~/utils/formatting";
import { AccountsPayableStatus } from "~/types";

vi.mock("~/i18n/use-translation");
vi.mock("~/services/properties.service");
vi.mock("~/services/suppliers.service");
vi.mock("~/services/buyers.service");
vi.mock("~/services/employees.service");
vi.mock("~/services/service-providers.service");
vi.mock("~/utils/formatting");

describe("useFinanceFilters", () => {
  const mockTranslation = {
    cashFlow: {
      categories: { feed: "Feed", salary: "Salary" },
      paymentMethods: { cash: "Cash", pix: "PIX" },
    },
  };

  const mockTransaction = {
    id: "cf-1",
    type: "income" as const,
    amount: 1000,
    date: "2024-01-15",
    description: "Test transaction",
    category: "feed" as import("~/types").CashFlowCategory,
    paymentMethod: "cash" as import("~/types").PaymentMethod,
    status: "completed" as const,
    companyId: "company-1",
    propertyId: "prop-1",
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(translationHook.useTranslation).mockReturnValue(mockTranslation as never);
    vi.mocked(propertiesService.getPropertyById).mockReturnValue({ name: "Property 1" });
    vi.mocked(suppliersService.getSupplierById).mockReturnValue({ name: "Supplier 1" });
    vi.mocked(buyersService.getBuyerById).mockReturnValue({ name: "Buyer 1" });
    vi.mocked(employeesService.getEmployeeById).mockReturnValue({ name: "Employee 1" });
    vi.mocked(serviceProvidersService.getServiceProviderById).mockReturnValue({
      name: "Provider 1",
    });
    vi.mocked(formattingUtils.formatCurrency).mockReturnValue("R$ 1.000,00");
  });

  it("should return all transactions when no filters", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by search value in description", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "Test",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by search value in property name", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "Property",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by type when enableTypeFilter is true", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "",
          activeFilter: "income",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        { enableTypeFilter: true }
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by property", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "prop-1",
          selectedYear: "all",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by year", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "2024",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by month", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "1",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by supplier when enableSupplierFilter is true", () => {
    const transactionWithSupplier = {
      ...mockTransaction,
      supplierId: "supplier-1",
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [transactionWithSupplier],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
          selectedSupplier: "supplier-1",
        },
        { enableSupplierFilter: true }
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by buyer when enableBuyerFilter is true", () => {
    const transactionWithBuyer = {
      ...mockTransaction,
      buyerId: "buyer-1",
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [transactionWithBuyer],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
          selectedBuyer: "buyer-1",
        },
        { enableBuyerFilter: true }
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should return empty array when no matches", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "NonExistent",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(0);
  });

  it("should handle accounts payable with status filter", () => {
    const payableTransaction = {
      id: "ap-1",
      amount: 500,
      dueDate: "2024-01-15",
      status: AccountsPayableStatus.UNPAID,
      companyId: "company-1",
      propertyId: "prop-1",
      description: "Payable",
      createdAt: new Date().toISOString(),
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [payableTransaction],
        {
          searchValue: "",
          activeFilter: "unpaid",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by search value in referenceNumber", () => {
    const transactionWithRef = {
      ...mockTransaction,
      referenceNumber: "REF-123",
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [transactionWithRef],
        {
          searchValue: "REF-123",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by search value in category", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "Feed",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by search value in paymentMethod", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "Cash",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by search value in amount", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "1.000",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by type expense when enableTypeFilter is true", () => {
    const expenseTransaction = {
      ...mockTransaction,
      type: "expense" as const,
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [expenseTransaction],
        {
          searchValue: "",
          activeFilter: "expense",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        { enableTypeFilter: true }
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should not filter by type when enableTypeFilter is false", () => {
    const expenseTransaction = {
      ...mockTransaction,
      type: "expense" as const,
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [expenseTransaction],
        {
          searchValue: "",
          activeFilter: "all", // When enableTypeFilter is false, "all" should pass
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        { enableTypeFilter: false }
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter accounts payable by paid status", () => {
    const payableTransaction = {
      id: "ap-1",
      amount: 500,
      dueDate: "2024-01-15",
      status: AccountsPayableStatus.PAID,
      companyId: "company-1",
      propertyId: "prop-1",
      description: "Payable",
      createdAt: new Date().toISOString(),
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [payableTransaction],
        {
          searchValue: "",
          activeFilter: "paid",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter accounts payable by overdue status", () => {
    const payableTransaction = {
      id: "ap-1",
      amount: 500,
      dueDate: "2024-01-15",
      status: AccountsPayableStatus.OVERDUE,
      companyId: "company-1",
      propertyId: "prop-1",
      description: "Payable",
      createdAt: new Date().toISOString(),
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [payableTransaction],
        {
          searchValue: "",
          activeFilter: "overdue",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter accounts payable by partial status", () => {
    const payableTransaction = {
      id: "ap-1",
      amount: 500,
      dueDate: "2024-01-15",
      status: AccountsPayableStatus.PARTIAL,
      companyId: "company-1",
      propertyId: "prop-1",
      description: "Payable",
      createdAt: new Date().toISOString(),
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [payableTransaction],
        {
          searchValue: "",
          activeFilter: "partial",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by year and month together", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "2024",
          selectedMonth: "1",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by month with padded zero", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "2024",
          selectedMonth: "01",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should not filter by supplier when enableSupplierFilter is false", () => {
    const transactionWithSupplier = {
      ...mockTransaction,
      supplierId: "supplier-1",
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [transactionWithSupplier],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
          selectedSupplier: "supplier-2",
        },
        { enableSupplierFilter: false }
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should not filter by buyer when enableBuyerFilter is false", () => {
    const transactionWithBuyer = {
      ...mockTransaction,
      buyerId: "buyer-1",
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [transactionWithBuyer],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
          selectedBuyer: "buyer-2",
        },
        { enableBuyerFilter: false }
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by supplier when selectedSupplier is 'all'", () => {
    const transactionWithSupplier = {
      ...mockTransaction,
      supplierId: "supplier-1",
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [transactionWithSupplier],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
          selectedSupplier: "all",
        },
        { enableSupplierFilter: true }
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should filter by buyer when selectedBuyer is 'all'", () => {
    const transactionWithBuyer = {
      ...mockTransaction,
      buyerId: "buyer-1",
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [transactionWithBuyer],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
          selectedBuyer: "all",
        },
        { enableBuyerFilter: true }
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should handle transaction without supplierId when filtering by supplier", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
          selectedSupplier: "supplier-1",
        },
        { enableSupplierFilter: true }
      )
    );

    expect(result.current).toHaveLength(0);
  });

  it("should handle transaction without buyerId when filtering by buyer", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
          selectedBuyer: "buyer-1",
        },
        { enableBuyerFilter: true }
      )
    );

    expect(result.current).toHaveLength(0);
  });

  it("should handle transaction with date field instead of dueDate", () => {
    const { result } = renderHook(() =>
      useFinanceFilters(
        [mockTransaction],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "2024",
          selectedMonth: "1",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should handle transaction with dueDate field", () => {
    const payableTransaction = {
      id: "ap-1",
      amount: 500,
      dueDate: "2024-01-15",
      status: AccountsPayableStatus.UNPAID,
      companyId: "company-1",
      propertyId: "prop-1",
      description: "Payable",
      createdAt: new Date().toISOString(),
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [payableTransaction],
        {
          searchValue: "",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "2024",
          selectedMonth: "1",
        },
        {}
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should handle getEntityNameById with null id", () => {
    const transactionWithNullSupplier = {
      ...mockTransaction,
      supplierId: null as unknown as string,
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [transactionWithNullSupplier],
        {
          searchValue: "Supplier",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        { enableSupplierFilter: true }
      )
    );

    expect(result.current).toHaveLength(0);
  });

  it("should handle getEntityNameById with number id", () => {
    const transactionWithNumberSupplier = {
      ...mockTransaction,
      supplierId: 123 as unknown as string,
    };

    vi.mocked(suppliersService.getSupplierById).mockImplementation((id: string) => {
      if (id === "123") return { name: "Supplier 123" };
      return undefined;
    });

    const { result } = renderHook(() =>
      useFinanceFilters(
        [transactionWithNumberSupplier],
        {
          searchValue: "Supplier 123",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        { enableSupplierFilter: true }
      )
    );

    expect(result.current).toHaveLength(1);
  });

  it("should handle getEntityNameById with object id", () => {
    const transactionWithObjectSupplier = {
      ...mockTransaction,
      supplierId: {} as unknown as string,
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [transactionWithObjectSupplier],
        {
          searchValue: "Supplier",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        { enableSupplierFilter: true }
      )
    );

    expect(result.current).toHaveLength(0);
  });

  it("should handle getEntityNameById with empty string id", () => {
    const transactionWithEmptySupplier = {
      ...mockTransaction,
      supplierId: "",
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [transactionWithEmptySupplier],
        {
          searchValue: "Supplier",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        { enableSupplierFilter: true }
      )
    );

    expect(result.current).toHaveLength(0);
  });

  it("should handle getEntityNameById with entity that has no name", () => {
    vi.mocked(suppliersService.getSupplierById).mockReturnValue({});

    const transactionWithSupplier = {
      ...mockTransaction,
      supplierId: "supplier-1",
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [transactionWithSupplier],
        {
          searchValue: "Supplier",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        { enableSupplierFilter: true }
      )
    );

    expect(result.current).toHaveLength(0);
  });

  it("should handle getEntityNameById with entity that returns undefined", () => {
    vi.mocked(suppliersService.getSupplierById).mockReturnValue(undefined);

    const transactionWithSupplier = {
      ...mockTransaction,
      supplierId: "supplier-1",
    };

    const { result } = renderHook(() =>
      useFinanceFilters(
        [transactionWithSupplier],
        {
          searchValue: "Supplier",
          activeFilter: "all",
          propertyFilter: "all",
          selectedYear: "all",
          selectedMonth: "all",
        },
        { enableSupplierFilter: true }
      )
    );

    expect(result.current).toHaveLength(0);
  });
});
