import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  createPropertyColumn,
  createCategoryColumn,
  createDescriptionColumn,
  createEntityColumn,
  createDateColumn,
  createAmountColumn,
  createStatusColumn,
  createPaidAmountColumn,
  createFinanceFilters,
} from "../finance-column-helpers";
import type { Property } from "~/types";
import { AreaType } from "~/types";

// Mock formatting functions
vi.mock("~/utils/formatting", () => ({
  formatDate: vi.fn((date: string, language: string) => {
    if (language === "en") return "01/15/2024";
    return "15/01/2024";
  }),
  formatCurrency: vi.fn((amount: number) => `$${amount.toFixed(2)}`),
}));

// Mock finance utils
vi.mock("~/utils/finance", () => ({
  getStatusVariant: vi.fn((status: string) => {
    if (status === "paid") return "success";
    if (status === "overdue") return "danger";
    if (status === "partial") return "warning";
    return "default";
  }),
}));

// Mock StatusBadge component
vi.mock("~/components/ui", () => ({
  StatusBadge: vi.fn(({ label, variant }: { label: string; variant: string }) => (
    <span data-testid="status-badge" data-variant={variant}>
      {label}
    </span>
  )),
}));

describe("createPropertyColumn", () => {
  const propertiesMap = new Map<string, Property>([
    [
      "property-1",
      {
        id: "property-1",
        name: "Property One",
        code: "PROP-1",
        companyId: "company-1",
        status: "active",
        createdAt: "2024-01-01T00:00:00Z",
        area: { value: 100, type: AreaType.HECTARES },
        street: "Main St",
        number: "123",
        complement: "",
        neighborhood: "Downtown",
        city: "City",
        state: "ST",
        zipCode: "12345-678",
      },
    ],
  ]);

  it("should create property column", () => {
    const column = createPropertyColumn({
      label: "Property",
      language: "en",
      propertiesMap,
    });

    expect(column.key).toBe("property");
    expect(column.label).toBe("Property");
    expect(column.sortable).toBe(true);
  });

  it("should render property name", () => {
    const column = createPropertyColumn({
      label: "Property",
      language: "en",
      propertiesMap,
    });

    const row = { propertyId: "property-1" };
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    expect(container.textContent).toBe("Property One");
  });

  it("should render dash when property not found", () => {
    const column = createPropertyColumn({
      label: "Property",
      language: "en",
      propertiesMap,
    });

    const row = { propertyId: "non-existent" };
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    expect(container.textContent).toBe("-");
  });
});

describe("createCategoryColumn", () => {
  const categories = {
    feed: "Feed",
    medicines: "Medicines",
  };

  it("should create category column", () => {
    const column = createCategoryColumn({
      label: "Category",
      categories,
    });

    expect(column.key).toBe("category");
    expect(column.label).toBe("Category");
  });

  it("should render category label", () => {
    const column = createCategoryColumn({
      label: "Category",
      categories,
    });

    const row = { category: "feed" };
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    expect(container.textContent).toBe("Feed");
  });

  it("should render dash when category is undefined", () => {
    const column = createCategoryColumn({
      label: "Category",
      categories,
    });

    const row = {};
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    expect(container.textContent).toBe("-");
  });
});

describe("createDescriptionColumn", () => {
  it("should create description column", () => {
    const column = createDescriptionColumn({
      label: "Description",
    });

    expect(column.key).toBe("description");
    expect(column.label).toBe("Description");
    expect(column.sortable).toBe(true);
  });

  it("should render description", () => {
    const column = createDescriptionColumn({
      label: "Description",
    });

    const row = { description: "Test description" };
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    expect(container.textContent).toBe("Test description");
  });
});

describe("createEntityColumn", () => {
  it("should create entity column with default key", () => {
    const column = createEntityColumn();
    expect(column.key).toBe("supplierBuyer");
    expect(column.label).toBe("");
    expect(column.sortable).toBe(false);
  });

  it("should create entity column with custom key", () => {
    const column = createEntityColumn({ key: "custom" });
    expect(column.key).toBe("custom");
  });

  it("should render entity name", () => {
    const column = createEntityColumn();
    const row = {
      supplierId: "supplier-1",
      type: "expense" as const,
    };
    const result = column.render?.(undefined, row, 0);
    expect(result).toBeDefined();
  });
});

describe("createDateColumn", () => {
  it("should create date column with date field", () => {
    const column = createDateColumn({
      label: "Date",
      language: "en",
      dateField: "date",
    });

    expect(column.key).toBe("date");
    expect(column.label).toBe("Date");
    expect(column.sortable).toBe(true);
  });

  it("should create date column with dueDate field", () => {
    const column = createDateColumn({
      label: "Due Date",
      language: "en",
      dateField: "dueDate",
    });

    expect(column.key).toBe("dueDate");
    expect(column.label).toBe("Due Date");
  });

  it("should render formatted date when date exists", () => {
    const column = createDateColumn({
      label: "Date",
      language: "en",
      dateField: "date",
    });

    const row = { date: "2024-01-15" };
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    expect(container.textContent).toContain("01/15/2024");
  });

  it("should render formatted dueDate when dueDate exists", () => {
    const column = createDateColumn({
      label: "Due Date",
      language: "en",
      dateField: "dueDate",
    });

    const row = { dueDate: "2024-01-15" };
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    expect(container.textContent).toContain("01/15/2024");
  });

  it("should render dash when date is missing", () => {
    const column = createDateColumn({
      label: "Date",
      language: "en",
      dateField: "date",
    });

    const row = {};
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    expect(container.textContent).toBe("-");
  });

  it("should render dash when dueDate is missing", () => {
    const column = createDateColumn({
      label: "Due Date",
      language: "en",
      dateField: "dueDate",
    });

    const row = {};
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    expect(container.textContent).toBe("-");
  });
});

describe("createAmountColumn", () => {
  it("should create amount column with default green color", () => {
    const column = createAmountColumn({
      label: "Amount",
    });

    expect(column.key).toBe("amount");
    expect(column.label).toBe("Amount");
    expect(column.sortable).toBe(true);
  });

  it("should render amount with green color class", () => {
    const column = createAmountColumn({
      label: "Amount",
      colorClass: "green",
    });

    const row = { amount: 1000 };
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    expect(container.textContent).toContain("$1000.00");
    expect(container.querySelector("span")?.className).toContain("text-green-600");
  });

  it("should render amount with red color class", () => {
    const column = createAmountColumn({
      label: "Amount",
      colorClass: "red",
    });

    const row = { amount: 1000 };
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    expect(container.textContent).toContain("$1000.00");
    expect(container.querySelector("span")?.className).toContain("text-red-600");
  });
});

describe("createStatusColumn", () => {
  it("should create status column", () => {
    const column = createStatusColumn({
      label: "Status",
      statusMap: {
        paid: "Paid",
        unpaid: "Unpaid",
      },
    });

    expect(column.key).toBe("status");
    expect(column.label).toBe("Status");
    expect(column.sortable).toBe(true);
  });

  it("should render status badge with mapped label", () => {
    const column = createStatusColumn({
      label: "Status",
      statusMap: {
        paid: "Paid",
        unpaid: "Unpaid",
      },
    });

    const row = { status: "paid" };
    const result = column.render?.(undefined, row, 0);
    const { getByTestId } = render(result!);
    const badge = getByTestId("status-badge");
    expect(badge.textContent).toBe("Paid");
    expect(badge.getAttribute("data-variant")).toBe("success");
  });

  it("should render status badge with original status when not in map", () => {
    const column = createStatusColumn({
      label: "Status",
      statusMap: {
        paid: "Paid",
      },
    });

    const row = { status: "unknown" };
    const result = column.render?.(undefined, row, 0);
    const { getByTestId } = render(result!);
    const badge = getByTestId("status-badge");
    expect(badge.textContent).toBe("unknown");
  });
});

describe("createPaidAmountColumn", () => {
  it("should create paid amount column", () => {
    const column = createPaidAmountColumn({
      label: "Paid Amount",
    });

    expect(column.key).toBe("paidAmount");
    expect(column.label).toBe("Paid Amount");
    expect(column.sortable).toBe(true);
  });

  it("should render formatted paid amount when paidAmount exists", () => {
    const column = createPaidAmountColumn({
      label: "Paid Amount",
    });

    const row = { paidAmount: 500 };
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    expect(container.textContent).toContain("$500.00");
  });

  it("should render dash when paidAmount is missing", () => {
    const column = createPaidAmountColumn({
      label: "Paid Amount",
    });

    const row = {};
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    expect(container.textContent).toBe("-");
  });

  it("should render dash when paidAmount is 0", () => {
    const column = createPaidAmountColumn({
      label: "Paid Amount",
    });

    const row = { paidAmount: 0 };
    const result = column.render?.(undefined, row, 0);
    const { container } = render(result!);
    // 0 is falsy, so it should render dash
    expect(container.textContent).toBe("-");
  });
});

describe("createFinanceFilters", () => {
  it("should create all finance filters", () => {
    const onFilterChange = vi.fn();
    const filters = createFinanceFilters({
      allLabel: "All",
      paidLabel: "Paid",
      unpaidLabel: "Unpaid",
      overdueLabel: "Overdue",
      partialLabel: "Partial",
      activeFilter: "all",
      onFilterChange,
    });

    expect(filters).toHaveLength(5);
    expect(filters[0].value).toBe("all");
    expect(filters[1].value).toBe("paid");
    expect(filters[2].value).toBe("unpaid");
    expect(filters[3].value).toBe("overdue");
    expect(filters[4].value).toBe("partial");
  });

  it("should mark active filter correctly", () => {
    const onFilterChange = vi.fn();
    const filters = createFinanceFilters({
      allLabel: "All",
      paidLabel: "Paid",
      unpaidLabel: "Unpaid",
      overdueLabel: "Overdue",
      partialLabel: "Partial",
      activeFilter: "paid",
      onFilterChange,
    });

    expect(filters[0].active).toBe(false);
    expect(filters[1].active).toBe(true);
    expect(filters[2].active).toBe(false);
  });

  it("should call onFilterChange when filter is clicked", () => {
    const onFilterChange = vi.fn();
    const filters = createFinanceFilters({
      allLabel: "All",
      paidLabel: "Paid",
      unpaidLabel: "Unpaid",
      overdueLabel: "Overdue",
      partialLabel: "Partial",
      activeFilter: "all",
      onFilterChange,
    });

    filters[1].onClick();
    expect(onFilterChange).toHaveBeenCalledWith("paid");

    filters[2].onClick();
    expect(onFilterChange).toHaveBeenCalledWith("unpaid");
  });

  it("should handle all filter states", () => {
    const onFilterChange = vi.fn();
    const testCases = ["all", "paid", "unpaid", "overdue", "partial"];

    testCases.forEach((activeFilter) => {
      const filters = createFinanceFilters({
        allLabel: "All",
        paidLabel: "Paid",
        unpaidLabel: "Unpaid",
        overdueLabel: "Overdue",
        partialLabel: "Partial",
        activeFilter,
        onFilterChange,
      });

      const activeFilterIndex = testCases.indexOf(activeFilter);
      filters.forEach((filter, index) => {
        expect(filter.active).toBe(index === activeFilterIndex);
      });
    });
  });
});
