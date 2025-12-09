import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryItemDetails } from "../inventory-item-details";
import { InventoryItemCategory } from "~/types";

vi.mock("~/utils/inventory-utils", () => ({
  getUnitLabel: vi.fn((unit: string, amount: number) => `${amount} ${unit}`),
  formatInventoryDate: vi.fn((date: string) => date),
}));

const mockItem: import("~/types").InventoryItem = {
  id: "1",
  code: "I001",
  name: "Item 1",
  description: "Description",
  category: InventoryItemCategory.MEDICINES,
  unit: "unit",
  supplierId: "supplier-1",
  minimumStock: 0,
  hasExpiration: false,
  companyId: "company-1",
  propertyIds: [],
  createdAt: "2024-01-01T00:00:00Z",
};

const mockTranslations = {
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
      medicines: "Medicines",
    },
    new: {
      usageMethod: "Usage Method",
      usageBasisOptions: {
        perAnimal: "Per Animal",
        perKg: "Per Kg",
      },
    },
    details: {
      itemInfo: "Item Info",
      stockInfo: "Stock Info",
      properties: "Properties",
    },
    units: {
      unit: "Unit",
    },
  },
};

describe("InventoryItemDetails", () => {
  it("should render item code", () => {
    render(
      <InventoryItemDetails
        item={mockItem}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    expect(screen.getByText("I001")).toBeInTheDocument();
  });

  it("should render item name", () => {
    render(
      <InventoryItemDetails
        item={mockItem}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("should render description when provided", () => {
    const itemWithDescription = { ...mockItem, description: "Test Description" };
    render(
      <InventoryItemDetails
        item={itemWithDescription}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("should render current stock", () => {
    render(
      <InventoryItemDetails
        item={mockItem}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    expect(screen.getByText("Current Stock")).toBeInTheDocument();
  });

  it("should call onSupplierClick when supplier is clicked", async () => {
    const user = userEvent.setup();
    const onSupplierClick = vi.fn();
    render(
      <InventoryItemDetails
        item={mockItem}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
        onSupplierClick={onSupplierClick}
        getSupplierName={() => "Supplier Name"}
      />
    );

    const supplierButton = screen.getByText("Supplier Name");
    await user.click(supplierButton);

    expect(onSupplierClick).toHaveBeenCalledWith("supplier-1");
  });

  it("should not render description when not provided", () => {
    const itemWithoutDescription = { ...mockItem, description: undefined };
    render(
      <InventoryItemDetails
        item={itemWithoutDescription}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    expect(screen.queryByText("Description")).not.toBeInTheDocument();
  });

  it("should display supplier as text when onSupplierClick is not provided", () => {
    render(
      <InventoryItemDetails
        item={mockItem}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
        getSupplierName={() => "Supplier Name"}
      />
    );
    const supplierText = screen.getByText("Supplier Name");
    expect(supplierText.tagName).toBe("P");
  });

  it("should not display supplier when supplierId is not provided", () => {
    const itemWithoutSupplier = { ...mockItem, supplierId: undefined };
    render(
      <InventoryItemDetails
        item={itemWithoutSupplier}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
        getSupplierName={() => "Supplier Name"}
      />
    );
    expect(screen.queryByText("Supplier Name")).not.toBeInTheDocument();
  });

  it("should not display supplier when getSupplierName is not provided", () => {
    render(
      <InventoryItemDetails
        item={mockItem}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    expect(screen.queryByText("Supplier")).not.toBeInTheDocument();
  });

  it("should display custom category when category is CUSTOM with customCategory", () => {
    const customItem = {
      ...mockItem,
      category: InventoryItemCategory.CUSTOM,
      customCategory: "Custom Category Name",
    };
    render(
      <InventoryItemDetails
        item={customItem}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    expect(screen.getByText("Custom Category Name")).toBeInTheDocument();
  });

  it("should display category from translations when category is CUSTOM without customCategory", () => {
    const customItem = {
      ...mockItem,
      category: InventoryItemCategory.CUSTOM,
      customCategory: undefined,
    };
    const translationsWithCustom = {
      ...mockTranslations,
      inventory: {
        ...mockTranslations.inventory,
        categories: {
          ...mockTranslations.inventory.categories,
          custom: "Custom",
        },
      },
    };
    render(
      <InventoryItemDetails
        item={customItem}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={translationsWithCustom}
        language="pt"
      />
    );
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("should display usage method for medicines with per_animal basis", () => {
    const medicineItem = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageAmount: 5,
      usageUnit: "ml",
      usageBasis: "per_animal",
    };
    render(
      <InventoryItemDetails
        item={medicineItem}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    expect(screen.getByText(/Per Animal/i)).toBeInTheDocument();
  });

  it("should display usage method for vaccines with per_kg basis", () => {
    const vaccineItem = {
      ...mockItem,
      category: InventoryItemCategory.VACCINES,
      usageAmount: 2,
      usageUnit: "ml",
      usageBasis: "per_kg",
    };
    render(
      <InventoryItemDetails
        item={vaccineItem}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    expect(screen.getByText(/Per Kg/i)).toBeInTheDocument();
  });

  it("should display usage method with fallback when usageBasisOptions are not provided", () => {
    const medicineItem = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageAmount: 5,
      usageUnit: "ml",
      usageBasis: "per_animal",
    };
    const translationsWithoutOptions = {
      ...mockTranslations,
      inventory: {
        ...mockTranslations.inventory,
        new: {
          usageMethod: "Usage Method",
        },
      },
    };
    render(
      <InventoryItemDetails
        item={medicineItem}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={translationsWithoutOptions}
        language="pt"
      />
    );
    expect(screen.getByText(/por animal/i)).toBeInTheDocument();
  });

  it("should display usage method with custom usageBasis value", () => {
    const medicineItem = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageAmount: 5,
      usageUnit: "ml",
      usageBasis: "custom_basis",
    };
    render(
      <InventoryItemDetails
        item={medicineItem}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    expect(screen.getByText(/custom_basis/i)).toBeInTheDocument();
  });

  it("should display properties when propertyIds exist", () => {
    const itemWithProperties = {
      ...mockItem,
      propertyIds: ["property-1", "property-2"],
    };
    render(
      <InventoryItemDetails
        item={itemWithProperties}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
        getPropertyName={(id) => (id === "property-1" ? "Property 1" : "Property 2")}
      />
    );
    expect(screen.getByText("Property 1")).toBeInTheDocument();
    expect(screen.getByText("Property 2")).toBeInTheDocument();
  });

  it("should display '-' when propertyIds are empty", () => {
    const itemWithoutProperties = {
      ...mockItem,
      propertyIds: [],
    };
    render(
      <InventoryItemDetails
        item={itemWithoutProperties}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("should not display property when getPropertyName returns undefined", () => {
    const itemWithProperties = {
      ...mockItem,
      propertyIds: ["property-1"],
    };
    render(
      <InventoryItemDetails
        item={itemWithProperties}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
        getPropertyName={() => undefined}
      />
    );
    expect(screen.queryByText("property-1")).not.toBeInTheDocument();
  });

  it("should display expiration date when hasExpiration is true", () => {
    const itemWithExpiration = {
      ...mockItem,
      hasExpiration: true,
      expirationDate: "2024-12-31",
    };
    render(
      <InventoryItemDetails
        item={itemWithExpiration}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    expect(screen.getByText("Expiration Date")).toBeInTheDocument();
  });

  it("should not display expiration date when hasExpiration is false", () => {
    const itemWithoutExpiration = {
      ...mockItem,
      hasExpiration: false,
    };
    render(
      <InventoryItemDetails
        item={itemWithoutExpiration}
        currentStock={10}
        isLowStock={false}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    expect(screen.queryByText("Expiration Date")).not.toBeInTheDocument();
  });

  it("should apply red color when isLowStock is true", () => {
    render(
      <InventoryItemDetails
        item={mockItem}
        currentStock={5}
        isLowStock={true}
        isExpiring={false}
        translations={mockTranslations}
        language="pt"
      />
    );
    const currentStockElement = screen.getByText(/5/i).closest("p");
    expect(currentStockElement).toHaveClass("text-red-600");
  });

  it("should apply orange color when isExpiring is true", () => {
    const itemWithExpiration = {
      ...mockItem,
      hasExpiration: true,
      expirationDate: "2024-12-31",
    };
    render(
      <InventoryItemDetails
        item={itemWithExpiration}
        currentStock={10}
        isLowStock={false}
        isExpiring={true}
        translations={mockTranslations}
        language="pt"
      />
    );
    const expirationElement = screen.getByText("2024-12-31").closest("p");
    expect(expirationElement).toHaveClass("text-orange-600");
  });
});
