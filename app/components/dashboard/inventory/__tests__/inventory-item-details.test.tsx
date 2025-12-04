import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryItemDetails } from "../inventory-item-details";
import { LanguageProvider } from "~/contexts/language-context";
import { InventoryItemCategory } from "~/types";
import { mockSuppliers } from "~/mocks/suppliers";
import { mockProperties } from "~/mocks/properties";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn((id: string) => {
    return mockSuppliers.find((s) => s.id === id);
  }),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => {
    return mockProperties.find((p) => p.id === id);
  }),
}));

vi.mock("~/utils/inventory-utils", () => ({
  getUnitLabel: vi.fn((_unit: string, _quantity: number, _t: unknown) => "kg"),
  formatInventoryDate: vi.fn((date: string) => date),
}));

describe("InventoryItemDetails", () => {
  const mockItem = {
    id: "item-1",
    code: "ITEM001",
    name: "Test Item",
    description: "Test description",
    category: InventoryItemCategory.MEDICINES,
    unit: "kg",
    supplierId: mockSuppliers[0].id,
    minimumStock: 10,
    hasExpiration: true,
    expirationDate: "2025-12-31",
    propertyIds: [mockProperties[0].id],
    companyId: "company-1",
    createdAt: "2025-01-01",
  };

  const defaultProps = {
    item: mockItem,
    currentStock: 15,
    isLowStock: false,
    isExpiring: false,
    translations: {
      inventory: {
        table: {
          code: "Code",
          name: "Name",
          description: "Description",
          category: "Category",
          unit: "Unit",
          supplier: "Supplier",
          currentStock: "Current Stock",
          minimumStock: "Minimum Stock",
          expirationDate: "Expiration Date",
          lowStock: "Low Stock",
          expiring: "Expiring",
        },
        categories: {
          [InventoryItemCategory.MEDICINES]: "Medicines",
        },
        new: {
          usageMethod: "Usage Method",
          usageBasisOptions: {
            perAnimal: "per animal",
            perKg: "per kg",
          },
        },
        details: {
          itemInfo: "Item Information",
          stockInfo: "Stock Information",
          properties: "Properties",
        },
        units: {
          kg: "kg",
        },
      },
    },
    language: "pt" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render item code", () => {
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("ITEM001")).toBeInTheDocument();
  });

  it("should render item name", () => {
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("should render item description", () => {
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("should render current stock", () => {
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/15.*kg/)).toBeInTheDocument();
  });

  it("should render minimum stock", () => {
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/10.*kg/)).toBeInTheDocument();
  });

  it("should render expiration date when hasExpiration is true", () => {
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("2025-12-31")).toBeInTheDocument();
  });

  it("should highlight low stock", () => {
    const { container } = render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} isLowStock={true} />
      </TestWrapper>
    );
    const stockElement = container.querySelector(".text-red-600");
    expect(stockElement).toBeInTheDocument();
  });

  it("should highlight expiring items", () => {
    const { container } = render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} isExpiring={true} />
      </TestWrapper>
    );
    const expirationElement = container.querySelector(".text-orange-600");
    expect(expirationElement).toBeInTheDocument();
  });

  it("should render supplier name", () => {
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(mockSuppliers[0].name)).toBeInTheDocument();
  });

  it("should call onSupplierClick when supplier is clicked", async () => {
    const onSupplierClick = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} onSupplierClick={onSupplierClick} />
      </TestWrapper>
    );
    const supplierButton = screen.getByText(mockSuppliers[0].name);
    await user.click(supplierButton);
    expect(onSupplierClick).toHaveBeenCalledWith(mockSuppliers[0].id);
  });

  it("should render property badges", () => {
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(mockProperties[0].name)).toBeInTheDocument();
  });

  it("should render usage method for medicines", () => {
    const itemWithUsage = {
      ...mockItem,
      usageAmount: 5,
      usageUnit: "ml",
      usageBasis: "per_animal" as const,
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithUsage} />
      </TestWrapper>
    );
    expect(screen.getByText(/Usage Method/)).toBeInTheDocument();
  });

  it("should render usage method with per_animal basis", () => {
    const itemWithUsage = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageAmount: 5,
      usageUnit: "ml",
      usageBasis: "per_animal" as const,
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithUsage} />
      </TestWrapper>
    );
    expect(screen.getByText(/per animal/)).toBeInTheDocument();
  });

  it("should render usage method with per_kg basis", () => {
    const itemWithUsage = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageAmount: 5,
      usageUnit: "ml",
      usageBasis: "per_kg" as const,
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithUsage} />
      </TestWrapper>
    );
    expect(screen.getByText(/per kg/)).toBeInTheDocument();
  });

  it("should render usage method with unknown basis", () => {
    const itemWithUsage = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageAmount: 5,
      usageUnit: "ml",
      usageBasis: "unknown" as string,
    };
    const { container } = render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithUsage} />
      </TestWrapper>
    );
    expect(screen.getByText(/Usage Method/)).toBeInTheDocument();
    // The unknown basis should be rendered as-is
    expect(container.textContent).toContain("unknown");
  });

  it("should render usage method for vaccines", () => {
    const itemWithUsage = {
      ...mockItem,
      category: InventoryItemCategory.VACCINES,
      usageAmount: 2,
      usageUnit: "dose",
      usageBasis: "per_animal" as const,
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithUsage} />
      </TestWrapper>
    );
    expect(screen.getByText(/Usage Method/)).toBeInTheDocument();
  });

  it("should not render usage method when category is not medicines or vaccines", () => {
    const itemWithoutUsage = {
      ...mockItem,
      category: InventoryItemCategory.FEED,
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithoutUsage} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Usage Method/)).not.toBeInTheDocument();
  });

  it("should not render usage method when usageAmount is missing", () => {
    const itemWithoutUsage = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageUnit: "ml",
      usageBasis: "per_animal" as const,
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithoutUsage} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Usage Method/)).not.toBeInTheDocument();
  });

  it("should not render usage method when usageUnit is missing", () => {
    const itemWithoutUsage = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageAmount: 5,
      usageBasis: "per_animal" as const,
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithoutUsage} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Usage Method/)).not.toBeInTheDocument();
  });

  it("should not render usage method when usageBasis is missing", () => {
    const itemWithoutUsage = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageAmount: 5,
      usageUnit: "ml",
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithoutUsage} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Usage Method/)).not.toBeInTheDocument();
  });

  it("should render supplier without onSupplierClick", () => {
    const itemWithSupplier = {
      ...mockItem,
      supplierId: mockSuppliers[0].id,
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithSupplier} />
      </TestWrapper>
    );
    expect(screen.getByText(mockSuppliers[0].name)).toBeInTheDocument();
  });

  it("should not render supplier when supplierId is missing", () => {
    const itemWithoutSupplier = {
      ...mockItem,
      supplierId: undefined,
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithoutSupplier} />
      </TestWrapper>
    );
    expect(screen.queryByText(mockSuppliers[0].name)).not.toBeInTheDocument();
  });

  it("should render custom category", () => {
    const itemWithCustomCategory = {
      ...mockItem,
      category: InventoryItemCategory.CUSTOM,
      customCategory: "Custom Category Name",
    };
    render(
      <TestWrapper>
        <InventoryItemDetails
          {...defaultProps}
          item={itemWithCustomCategory}
          translations={{
            ...defaultProps.translations,
            inventory: {
              ...defaultProps.translations.inventory,
              categories: {
                ...defaultProps.translations.inventory.categories,
                [InventoryItemCategory.CUSTOM]: "Custom",
              },
            },
          }}
        />
      </TestWrapper>
    );
    expect(screen.getByText("Custom Category Name")).toBeInTheDocument();
  });

  it("should render category fallback when customCategory is missing", () => {
    const itemWithCustomCategory = {
      ...mockItem,
      category: InventoryItemCategory.CUSTOM,
      customCategory: undefined,
    };
    render(
      <TestWrapper>
        <InventoryItemDetails
          {...defaultProps}
          item={itemWithCustomCategory}
          translations={{
            ...defaultProps.translations,
            inventory: {
              ...defaultProps.translations.inventory,
              categories: {
                ...defaultProps.translations.inventory.categories,
                [InventoryItemCategory.CUSTOM]: "Custom",
              },
            },
          }}
        />
      </TestWrapper>
    );
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("should render properties when propertyIds is empty", () => {
    const itemWithoutProperties = {
      ...mockItem,
      propertyIds: [],
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithoutProperties} />
      </TestWrapper>
    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("should render properties when propertyIds is empty", () => {
    const itemWithoutProperties = {
      ...mockItem,
      propertyIds: [],
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithoutProperties} />
      </TestWrapper>
    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("should not render expiration date when hasExpiration is false", () => {
    const itemWithoutExpiration = {
      ...mockItem,
      hasExpiration: false,
      expirationDate: undefined,
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithoutExpiration} />
      </TestWrapper>
    );
    expect(screen.queryByText("2025-12-31")).not.toBeInTheDocument();
  });

  it("should not render expiration date when expirationDate is missing", () => {
    const itemWithoutExpiration = {
      ...mockItem,
      hasExpiration: true,
      expirationDate: undefined,
    };
    render(
      <TestWrapper>
        <InventoryItemDetails {...defaultProps} item={itemWithoutExpiration} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Expiration Date/)).not.toBeInTheDocument();
  });
});
