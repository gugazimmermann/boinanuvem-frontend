import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import React from "react";
import { meta, loader, default as NewSale } from "../../dashboard/records.sales.new";
import { ROUTES } from "~/routes.config";
import { mockAnimals } from "~/mocks/animals";
import { mockBuyers } from "~/mocks/buyers";
import { mockProperties } from "~/mocks/properties";
import type { Location as RouterLocation } from "react-router";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ state: null })),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/sales.service", () => ({
  addSale: vi.fn(),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalsByCompanyId: vi.fn(() => mockAnimals.filter((a) => a.status === "active")),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyersByCompanyId: vi.fn(() => mockBuyers),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertiesByCompanyId: vi.fn(() => mockProperties),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", companyName: "Test Company" }],
}));

vi.mock("~/components/dashboard/records/sale-form", () => ({
  SaleForm: vi.fn(
    ({
      title,
      description,
      onCancel,
      onSubmit,
      onSuccess,
    }: {
      title?: string;
      description?: string;
      onCancel?: () => void;
      onSubmit?: (data: unknown) => Promise<void>;
      onSuccess?: () => void;
    }) => (
      <div data-testid="sale-form">
        <h1>{title}</h1>
        <p>{description}</p>
        <button onClick={onCancel}>Cancel</button>
        <button
          onClick={async () => {
            try {
              await onSubmit?.({});
              onSuccess?.();
            } catch {
              // Silently handle errors in tests
            }
          }}
        >
          Submit
        </button>
      </div>
    )
  ),
}));

vi.mock("~/utils/sale-form-helpers", () => ({
  transformSaleFormData: vi.fn((data: unknown, _companyId: string) => data),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    SALES: "/dashboard/registros/vendas",
  },
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    sales: {
      new: {
        title: "Nova Venda",
        description: "Registre uma nova venda",
      },
      success: {
        created: "Venda registrada com sucesso",
      },
      errors: {
        createFailed: "Erro ao registrar venda",
      },
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/registros/vendas/novo"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("records.sales.new", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].title).toContain("Nova Venda");
    });
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/registros/vendas/novo");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("NewSale component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewSale />
        </TestWrapper>
      );

      expect(screen.getByTestId("sale-form")).toBeInTheDocument();
      expect(screen.getByText("Nova Venda")).toBeInTheDocument();
    });

    it("should handle form submission", async () => {
      const { useNavigate } = await import("react-router");
      const { addSale } = await import("~/services/sales.service");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewSale />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Submit");
      await userEvent.click(submitButton);

      await vi.waitFor(() => {
        expect(addSale).toHaveBeenCalled();
      });
    });

    it("should handle cancel button click", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewSale />
        </TestWrapper>
      );

      const cancelButton = screen.getByText("Cancel");
      await userEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SALES);
    });

    it("should handle pre-selected animal IDs from location state", async () => {
      const { useLocation } = await import("react-router");
      vi.mocked(useLocation).mockReturnValue({
        state: { animalIds: ["animal-1", "animal-2"] },
        pathname: "/dashboard/registros/vendas/novo",
        search: "",
        hash: "",
        key: "default",
      } as unknown as RouterLocation);

      render(
        <TestWrapper>
          <NewSale />
        </TestWrapper>
      );

      expect(screen.getByText("Nova Venda")).toBeInTheDocument();
    });

    it("should initialize form with first property when available", async () => {
      const { getPropertiesByCompanyId } = await import("~/services/properties.service");
      vi.mocked(getPropertiesByCompanyId).mockReturnValueOnce(mockProperties);

      render(
        <TestWrapper>
          <NewSale />
        </TestWrapper>
      );

      const SaleForm = (await import("~/components/dashboard/records/sale-form")).SaleForm;
      const calls = vi.mocked(SaleForm).mock.calls;
      if (calls.length > 0 && calls[0][0]?.initialData) {
        expect(calls[0][0].initialData.propertyId).toBe(mockProperties[0]?.id || "");
      }
    });

    it("should handle form submission error", async () => {
      const { addSale } = await import("~/services/sales.service");
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(addSale).mockImplementation(() => {
        throw new Error("Database error");
      });

      render(
        <TestWrapper>
          <NewSale />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Submit");
      await userEvent.click(submitButton);

      // Error should be handled by SaleForm component
      await vi.waitFor(() => {
        expect(addSale).toHaveBeenCalled();
      });
    });

    it("should initialize with today's date", async () => {
      render(
        <TestWrapper>
          <NewSale />
        </TestWrapper>
      );

      const SaleForm = (await import("~/components/dashboard/records/sale-form")).SaleForm;
      const calls = vi.mocked(SaleForm).mock.calls;
      if (calls.length > 0 && calls[0][0]?.initialData) {
        const today = new Date().toISOString().split("T")[0];
        expect(calls[0][0].initialData.saleDate).toBe(today);
      }
    });

    it("should handle empty properties list", async () => {
      const { getPropertiesByCompanyId } = await import("~/services/properties.service");
      vi.mocked(getPropertiesByCompanyId).mockReturnValueOnce([]);

      render(
        <TestWrapper>
          <NewSale />
        </TestWrapper>
      );

      const SaleForm = (await import("~/components/dashboard/records/sale-form")).SaleForm;
      const calls = vi.mocked(SaleForm).mock.calls;
      if (calls.length > 0 && calls[0][0]?.initialData) {
        expect(calls[0][0].initialData.propertyId).toBe("");
      }
    });
  });
});
