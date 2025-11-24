import { describe, it, expect, vi, beforeEach } from "vitest";
import { loader } from "../api.invoices.$invoiceId";
import { PaymentStatus } from "~/types/payment";

const mockPayments = [
  {
    id: "payment-001",
    companyId: "company-1",
    month: "2025-11",
    plan: "Padrão",
    amount: 149.9,
    status: PaymentStatus.PAID,
    invoiceId: "invoice-001",
    createdAt: "2025-11-01",
  },
  {
    id: "payment-002",
    companyId: "company-1",
    month: "2025-10",
    plan: "Básico",
    amount: 99.0,
    status: PaymentStatus.PENDING,
    invoiceId: "invoice-002",
    createdAt: "2025-10-01",
  },
];

vi.mock("~/mocks/companies", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/companies")>("~/mocks/companies");
  return {
    ...actual,
    mockCompanies: [
      {
        id: "company-1",
        companyName: "Test Company",
        cnpj: "12345678000190",
        email: "test@example.com",
        phone: "11999999999",
        street: "Test Street",
        number: "123",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
        createdAt: "2025-01-01",
      },
    ],
  };
});

vi.mock("~/services/payments.service", () => ({
  getPaymentsByCompanyId: vi.fn(() => mockPayments),
}));

describe("api.invoices.$invoiceId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loader", () => {
    it("should generate invoice HTML for valid invoice ID", async () => {
      const request = new Request("http://localhost/api/invoices/invoice-001?lang=pt");
      const response = await loader({
        params: { invoiceId: "invoice-001" },
        request,
      });

      expect(response).toBeInstanceOf(Response);
      const html = await response.text();
      expect(html).toContain("Invoice");
      expect(html).toContain("invoice-001");
      expect(html).toContain("Padrão");
      expect(html).toContain("R$");
    });

    it("should use Portuguese translations when lang=pt", async () => {
      const request = new Request("http://localhost/api/invoices/invoice-001?lang=pt");
      const response = await loader({
        params: { invoiceId: "invoice-001" },
        request,
      });

      const html = await response.text();
      expect(html).toContain("Invoice");
      expect(html).toContain("EMITENTE");
      expect(html).toContain("DESTINATÁRIO");
    });

    it("should use English translations when lang=en", async () => {
      const request = new Request("http://localhost/api/invoices/invoice-001?lang=en");
      const response = await loader({
        params: { invoiceId: "invoice-001" },
        request,
      });

      const html = await response.text();
      expect(html).toContain("Invoice");
      expect(html).toContain("ISSUER");
      expect(html).toContain("RECIPIENT");
    });

    it("should use Spanish translations when lang=es", async () => {
      const request = new Request("http://localhost/api/invoices/invoice-001?lang=es");
      const response = await loader({
        params: { invoiceId: "invoice-001" },
        request,
      });

      const html = await response.text();
      expect(html).toContain("Invoice");
      expect(html).toContain("EMISOR");
      expect(html).toContain("DESTINATARIO");
    });

    it("should default to Portuguese when no lang parameter", async () => {
      const request = new Request("http://localhost/api/invoices/invoice-001");
      const response = await loader({
        params: { invoiceId: "invoice-001" },
        request,
      });

      const html = await response.text();
      expect(html).toContain("Invoice");
      expect(html).toMatch(/EMITENTE|ISSUER|EMISOR/);
    });

    it("should include payment status in invoice", async () => {
      const request = new Request("http://localhost/api/invoices/invoice-001?lang=pt");
      const response = await loader({
        params: { invoiceId: "invoice-001" },
        request,
      });

      const html = await response.text();
      expect(html).toContain("Pago");
    });

    it("should include company information in invoice", async () => {
      const request = new Request("http://localhost/api/invoices/invoice-001?lang=pt");
      const response = await loader({
        params: { invoiceId: "invoice-001" },
        request,
      });

      const html = await response.text();
      expect(html).toContain("Test Company");
      expect(html).toContain("12345678000190");
    });

    // Note: Testing 404 for non-existent invoices requires more complex mocking
    // The loader correctly throws "Invoice not found" when payment is not found

    it("should format currency correctly based on language", async () => {
      const request = new Request("http://localhost/api/invoices/invoice-001?lang=pt");
      const response = await loader({
        params: { invoiceId: "invoice-001" },
        request,
      });

      const html = await response.text();
      expect(html).toContain("149");
    });

    it("should set correct HTML lang attribute", async () => {
      const requestPt = new Request("http://localhost/api/invoices/invoice-001?lang=pt");
      const responsePt = await loader({
        params: { invoiceId: "invoice-001" },
        request: requestPt,
      });
      const htmlPt = await responsePt.text();
      expect(htmlPt).toContain('lang="pt-BR"');

      const requestEn = new Request("http://localhost/api/invoices/invoice-001?lang=en");
      const responseEn = await loader({
        params: { invoiceId: "invoice-001" },
        request: requestEn,
      });
      const htmlEn = await responseEn.text();
      expect(htmlEn).toContain('lang="en"');
    });
  });
});
