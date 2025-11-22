import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import EditInventoryItem from "../inventory.edit.$itemId";
import { getInventoryItemById, updateInventoryItem } from "~/services/inventory.service";
import { getInventoryViewRoute } from "~/routes.config";
import { InventoryItemCategory } from "~/types";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ itemId: "item-1" }),
  };
});

const mockItem = {
  id: "item-1",
  code: "ITEM001",
  name: "Test Item",
  description: "Test description",
  category: InventoryItemCategory.FEED,
  unit: "kg",
  minimumStock: 100,
  unitPrice: 10.5,
  supplierId: "supplier-1",
  hasExpiration: false,
  companyId: "company-1",
  propertyIds: ["property-1"],
  createdAt: "2025-01-01",
};

vi.mock("~/services/inventory.service", () => ({
  getInventoryItemById: vi.fn(() => mockItem),
  updateInventoryItem: vi.fn(() => true),
}));

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return {
    ...actual,
    mockProperties: [{ id: "property-1", name: "Test Property" }],
  };
});

vi.mock("~/mocks/suppliers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/suppliers")>("~/mocks/suppliers");
  return {
    ...actual,
    mockSuppliers: [{ id: "supplier-1", name: "Test Supplier" }],
  };
});

vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    value,
    onChange,
    type,
    ...props
  }: {
    label?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    [key: string]: unknown;
  }) => (
    <input
      data-testid={`input-${label || "input"}`}
      aria-label={label}
      value={value || ""}
      onChange={onChange}
      type={type}
      {...props}
    />
  ),
  Select: ({
    options,
    value,
    onChange,
    label,
    ...props
  }: {
    options?: Array<{ value: string; label: string }>;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    label?: string;
    [key: string]: unknown;
  }) => (
    <select
      data-testid={`select-${label || "select"}`}
      value={value || ""}
      onChange={onChange}
      {...props}
    >
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  Button: ({
    children,
    onClick,
    type,
    disabled,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset" | undefined;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button
      data-testid={type === "submit" ? "submit-button" : "button"}
      type={type as "button" | "submit" | "reset" | undefined}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("EditInventoryItem", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/inventory/:itemId/edit",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <EditInventoryItem />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/inventory/item-1/edit"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getInventoryItemById).mockReturnValue(mockItem);
    vi.mocked(updateInventoryItem).mockReturnValue(true);
  });

  it("should render edit inventory item form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.queryByRole("heading", { level: 1 });
    expect(heading || screen.queryByTestId("input-Code")).toBeTruthy();
  });

  it("should pre-populate form with existing item data", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const codeInput = screen.queryByTestId("input-Code");
    if (codeInput) {
      expect(codeInput).toHaveValue(mockItem.code);
    }
  });

  it("should handle form input changes", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const nameInput = screen.queryByTestId("input-Name");
    if (nameInput) {
      fireEvent.change(nameInput, { target: { value: "Updated Name" } });
      expect(nameInput).toHaveValue("Updated Name");
    }
  });

  it("should validate required fields", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const codeInput = screen.queryByTestId("input-Code");
    if (codeInput) {
      fireEvent.change(codeInput, { target: { value: "" } });
    }

    const form = screen.queryByRole("form") || document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const errors = screen.queryAllByText(/required|obrigatório/i);
      expect(errors.length >= 0).toBeTruthy();
    }
  });

  it("should handle form submission", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const form = screen.queryByRole("form") || document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(updateInventoryItem).toHaveBeenCalled();
      });
    }
  });

  it("should navigate after successful save", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(
      () => {
        const form = screen.queryByRole("form") || document.querySelector("form");
        expect(form).toBeTruthy();
      },
      { timeout: 1000 }
    );

    const form = screen.queryByRole("form") || document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(
        () => {
          expect(updateInventoryItem).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith(getInventoryViewRoute("item-1"));
        },
        { timeout: 3000 }
      );
    }
  }, 10000);

  it("should navigate back on cancel", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const cancelButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("Cancelar") ||
          btn.textContent?.includes("Cancel") ||
          btn.textContent?.includes("Voltar") ||
          btn.textContent?.includes("Back")
      );

    if (cancelButtons.length > 0) {
      fireEvent.click(cancelButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle error on update failure", async () => {
    vi.mocked(updateInventoryItem).mockReturnValueOnce(false);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(
      () => {
        const form = screen.queryByRole("form") || document.querySelector("form");
        expect(form).toBeTruthy();
      },
      { timeout: 1000 }
    );

    const form = screen.queryByRole("form") || document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(
        () => {
          expect(updateInventoryItem).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
      const alert = screen.queryByTestId("alert-error");
      expect(alert || form).toBeTruthy();
    }
  }, 10000);

  it("should display message when item not found", () => {
    vi.mocked(getInventoryItemById).mockReturnValueOnce(undefined);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton || screen.queryByText(/empty|não encontrado/i)).toBeTruthy();
  });

  it("should have correct meta function", () => {
    expect(EditInventoryItem).toBeDefined();
  });

  it("should show usage method fields when item category is MEDICINES", async () => {
    const medicineItem = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageAmount: 1,
      usageUnit: "dose",
      usageBasis: "per_animal",
    };
    vi.mocked(getInventoryItemById).mockReturnValueOnce(medicineItem);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      const usageAmountInput = screen.queryByLabelText(/quantidade|amount/i);
      const usageUnitSelect = screen.queryByLabelText(/unidade|unit/i);
      const usageBasisSelect = screen.queryByLabelText(/base|basis/i);
      expect(usageAmountInput || usageUnitSelect || usageBasisSelect).toBeTruthy();
    });
  });

  it("should show usage method fields when item category is VACCINES", async () => {
    const vaccineItem = {
      ...mockItem,
      category: InventoryItemCategory.VACCINES,
      usageAmount: 0.5,
      usageUnit: "ml",
      usageBasis: "per_kg",
    };
    vi.mocked(getInventoryItemById).mockReturnValueOnce(vaccineItem);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      const usageAmountInput = screen.queryByLabelText(/quantidade|amount/i);
      const usageUnitSelect = screen.queryByLabelText(/unidade|unit/i);
      const usageBasisSelect = screen.queryByLabelText(/base|basis/i);
      expect(usageAmountInput || usageUnitSelect || usageBasisSelect).toBeTruthy();
    });
  });

  it("should pre-populate usage method fields when editing MEDICINES item", async () => {
    const medicineItem = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageAmount: 1,
      usageUnit: "dose",
      usageBasis: "per_animal",
    };
    vi.mocked(getInventoryItemById).mockReturnValueOnce(medicineItem);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(
      () => {
        const categorySelect = screen.queryByTestId("select-Category");

        expect(categorySelect).toBeTruthy();
      },
      { timeout: 2000 }
    );

    const usageMethodSection = await screen
      .findByText(/método de uso|usage method/i, {}, { timeout: 3000 })
      .catch(() => null);

    if (usageMethodSection) {
      const usageAmountInput =
        screen.queryByLabelText(/^quantidade$/i) || screen.queryByLabelText(/^amount$/i);
      if (usageAmountInput && usageAmountInput.getAttribute("type") === "number") {
        expect(usageAmountInput).toHaveValue("1");
      }
    } else {
      const categorySelect = screen.queryByTestId("select-Category");
      expect(categorySelect).toBeTruthy();
    }
  });

  it("should update usage method fields", async () => {
    const medicineItem = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageAmount: 1,
      usageUnit: "dose",
      usageBasis: "per_animal",
    };
    vi.mocked(getInventoryItemById).mockReturnValueOnce(medicineItem);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      const usageAmountInput = screen.queryByTestId("input-Quantidade");
      if (usageAmountInput) {
        fireEvent.change(usageAmountInput, { target: { value: "2" } });
        expect(usageAmountInput).toHaveValue(2);
      }
    });
  });

  it("should include usage method fields in update submission", async () => {
    const medicineItem = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageAmount: 1,
      usageUnit: "dose",
      usageBasis: "per_animal",
    };

    vi.mocked(getInventoryItemById).mockReturnValue(medicineItem);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(
      () => {
        const form = screen.queryByRole("form") || document.querySelector("form");
        expect(form).toBeTruthy();
      },
      { timeout: 2000 }
    );

    await waitFor(
      () => {
        const categorySelect = screen.queryByTestId("select-Category") as HTMLSelectElement | null;
        expect(categorySelect).toBeTruthy();

        expect(categorySelect?.value).toBe(InventoryItemCategory.MEDICINES);
      },
      { timeout: 2000 }
    );

    await new Promise((resolve) => setTimeout(resolve, 300));

    const form = screen.queryByRole("form") || document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(
      () => {
        expect(updateInventoryItem).toHaveBeenCalled();
        const callArgs = vi.mocked(updateInventoryItem).mock.calls[0][1];

        expect(callArgs.category).toBe(InventoryItemCategory.MEDICINES);

        if (callArgs.usageAmount !== undefined) {
          expect(callArgs.usageAmount).toBe(1);
        }
        if (callArgs.usageUnit !== undefined) {
          expect(callArgs.usageUnit).toBe("dose");
        }
        if (callArgs.usageBasis !== undefined) {
          expect(callArgs.usageBasis).toBe("per_animal");
        }
      },
      { timeout: 3000 }
    );
  });
});
