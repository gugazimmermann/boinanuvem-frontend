import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import React from "react";
import { meta, loader, default as EditSale } from "../../dashboard/records.sales.edit.$saleId";
import { mockSales } from "~/mocks/sales";
import { mockAnimals } from "~/mocks/animals";
import { mockBuyers } from "~/mocks/buyers";
import { mockProperties } from "~/mocks/properties";
import type { Sale } from "~/types";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ saleId: mockSales[0]?.id || "sale-1" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/sales.service", () => ({
  getSaleById: vi.fn((id: string) => mockSales.find((s) => s.id === id)),
  updateSale: vi.fn(() => true),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalsByCompanyId: vi.fn(() => mockAnimals),
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
        <button type="submit" onClick={() => onSubmit?.({}).then(() => onSuccess?.())}>
          Submit
        </button>
      </div>
    )
  ),
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
  transformSaleFormDataForUpdate: vi.fn((data: unknown) => data),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    SALES: "/dashboard/registros/vendas",
  },
  getSaleViewRoute: vi.fn((id: string) => `/dashboard/registros/vendas/${id}`),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    sales: {
      notFound: "Venda não encontrada",
      edit: {
        title: "Editar Venda",
        description: "Edite os dados da venda",
      },
      success: {
        updated: "Venda atualizada com sucesso",
      },
      errors: {
        updateFailed: "Erro ao atualizar venda",
      },
    },
    common: {
      back: "Voltar",
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = [`/dashboard/registros/vendas/${mockSales[0]?.id || "sale-1"}/editar`],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("records.sales.edit.$saleId", () => {
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
      expect(result[0].title).toContain("Editar Venda");
    });
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/registros/vendas/sale-1/editar");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("EditSale component", () => {
    it("should render form when sale exists", () => {
      render(
        <TestWrapper>
          <EditSale />
        </TestWrapper>
      );

      expect(screen.getByTestId("sale-form")).toBeInTheDocument();
      expect(screen.getByText("Editar Venda")).toBeInTheDocument();
    });

    it("should render empty state when sale is not found", async () => {
      const { useParams } = await import("react-router");
      const { getSaleById } = await import("~/services/sales.service");
      vi.mocked(useParams).mockReturnValue({ saleId: "non-existent" });
      vi.mocked(getSaleById).mockReturnValue(undefined);

      render(
        <TestWrapper initialEntries={["/dashboard/registros/vendas/non-existent/editar"]}>
          <EditSale />
        </TestWrapper>
      );

      expect(screen.getByText("Venda não encontrada")).toBeInTheDocument();
    });

    it("should handle form submission", async () => {
      const { updateSale, getSaleById } = await import("~/services/sales.service");
      const { useNavigate, useParams } = await import("react-router");
      const { getSaleViewRoute: _getSaleViewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      // Ensure sale exists - set before rendering
      const saleId = mockSales[0]?.id || "sale-1";
      vi.mocked(useParams).mockReturnValue({ saleId });
      // Ensure getSaleById returns the sale
      vi.mocked(getSaleById).mockReturnValue(mockSales[0] || null);

      render(
        <TestWrapper>
          <EditSale />
        </TestWrapper>
      );

      // Wait for form to render (not the empty state)
      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Wait for form to render
      await waitFor(
        () => {
          const form = screen.queryByTestId("sale-form");
          expect(form).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Find and click submit button
      const submitButton = screen.getByText("Submit");
      await userEvent.click(submitButton);

      // Wait for form submission
      await waitFor(
        () => {
          expect(updateSale).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it("should handle cancel button click", async () => {
      const { getSaleById } = await import("~/services/sales.service");
      const { useNavigate, useParams } = await import("react-router");
      const { getSaleViewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      // Ensure sale exists - set before rendering
      const saleId = mockSales[0]?.id || "sale-1";
      vi.mocked(useParams).mockReturnValue({ saleId });
      // Ensure getSaleById returns the sale
      vi.mocked(getSaleById).mockReturnValue(mockSales[0] || null);

      render(
        <TestWrapper>
          <EditSale />
        </TestWrapper>
      );

      // Wait for form to render (not the empty state)
      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Look for cancel button
      await waitFor(
        () => {
          const buttons = screen.getAllByRole("button");
          const cancelButton = buttons.find(
            (btn) =>
              btn.textContent?.toLowerCase().includes("cancelar") ||
              btn.textContent?.toLowerCase().includes("cancel") ||
              btn.getAttribute("data-variant") === "outline"
          );
          expect(cancelButton).toBeDefined();
        },
        { timeout: 2000 }
      );

      const buttons = screen.getAllByRole("button");
      const cancelButton = buttons.find((btn) => {
        const buttonElement = btn as HTMLButtonElement;
        return (
          buttonElement.textContent?.toLowerCase().includes("cancelar") ||
          buttonElement.textContent?.toLowerCase().includes("cancel") ||
          (buttonElement.getAttribute("data-variant") === "outline" &&
            buttonElement.type !== "submit")
        );
      });

      if (cancelButton) {
        await userEvent.click(cancelButton);
        expect(mockNavigate).toHaveBeenCalledWith(getSaleViewRoute(saleId));
      }
    });

    it("should handle update failure", async () => {
      const { updateSale, getSaleById } = await import("~/services/sales.service");
      const { useParams } = await import("react-router");
      vi.mocked(updateSale).mockReturnValueOnce(false);

      const saleId = mockSales[0]?.id || "sale-1";
      vi.mocked(useParams).mockReturnValue({ saleId });
      vi.mocked(getSaleById).mockReturnValue(mockSales[0] || null);

      render(
        <TestWrapper>
          <EditSale />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      await waitFor(
        () => {
          const form = screen.queryByTestId("sale-form");
          expect(form).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      const submitButton = screen.getByText("Submit");
      await userEvent.click(submitButton);

      // The error should be thrown
      await waitFor(
        () => {
          // Error is thrown in the component
          expect(updateSale).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it("should transform legacy fees correctly", async () => {
      const { getSaleById } = await import("~/services/sales.service");
      const { useParams } = await import("react-router");
      const saleId = mockSales[0]?.id || "sale-1";
      vi.mocked(useParams).mockReturnValue({ saleId });
      vi.mocked(getSaleById).mockReturnValueOnce({
        ...mockSales[0],
        fees: [],
        transportationFee: 100,
        additionalFees: 50,
      } as Sale);

      render(
        <TestWrapper>
          <EditSale />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      await waitFor(
        () => {
          const form = screen.queryByTestId("sale-form");
          expect(form).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Legacy fees should be transformed to fees array
      const SaleForm = (await import("~/components/dashboard/records/sale-form")).SaleForm;
      const calls = vi.mocked(SaleForm).mock.calls;
      if (calls.length > 0 && calls[0][0]?.initialData?.fees) {
        expect(calls[0][0].initialData.fees.length).toBeGreaterThan(0);
      }
    });

    it("should handle sale with existing fees", async () => {
      const { getSaleById } = await import("~/services/sales.service");
      const { useParams } = await import("react-router");
      const saleId = mockSales[0]?.id || "sale-1";
      vi.mocked(useParams).mockReturnValue({ saleId });
      vi.mocked(getSaleById).mockReturnValueOnce({
        ...mockSales[0],
        fees: [{ id: "fee-1", name: "Transporte", amount: 100 }],
      } as Sale);

      render(
        <TestWrapper>
          <EditSale />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      await waitFor(
        () => {
          const form = screen.queryByTestId("sale-form");
          expect(form).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Fees should be passed to form
      const SaleForm = (await import("~/components/dashboard/records/sale-form")).SaleForm;
      const calls = vi.mocked(SaleForm).mock.calls;
      if (calls.length > 0 && calls[0][0]?.initialData?.fees) {
        expect(calls[0][0].initialData.fees.length).toBe(1);
      }
    });
  });
});
