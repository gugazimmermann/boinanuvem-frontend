import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { meta, links, default as Terms } from "../terms";
import { ROUTES } from "~/routes.config";
import { useLanguage } from "~/contexts/language-context";
import { useTranslation } from "~/i18n";

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({
    language: "pt",
  })),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    terms: {
      title: "Termos de Uso",
      lastUpdate: "Última atualização",
    },
  })),
}));

vi.mock("~/components/site/auth-layout", () => ({
  AuthLayout: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  )),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("terms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta({} as never);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should include correct title", () => {
      const result = meta({} as never);
      const titleTag = result.find((tag) => "title" in tag);
      expect(titleTag).toBeDefined();
      if (titleTag && "title" in titleTag) {
        expect(titleTag.title).toContain("Termos de Uso");
      }
    });
  });

  describe("links", () => {
    it("should return canonical link", () => {
      const result = links();
      expect(result).toHaveLength(1);
      expect(result[0].rel).toBe("canonical");
      expect(result[0].href).toBe("https://boinanuvem.com.br/termos");
    });
  });

  describe("Terms component", () => {
    it("should render AuthLayout", () => {
      render(
        <TestWrapper>
          <Terms />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
    });

    it("should render terms title", () => {
      render(
        <TestWrapper>
          <Terms />
        </TestWrapper>
      );

      expect(screen.getByText("Termos de Uso")).toBeInTheDocument();
    });

    it("should render last update date", () => {
      render(
        <TestWrapper>
          <Terms />
        </TestWrapper>
      );

      expect(screen.getByText(/Última atualização/)).toBeInTheDocument();
    });

    it("should render all terms sections", () => {
      render(
        <TestWrapper>
          <Terms />
        </TestWrapper>
      );

      expect(screen.getByText("1. Aceitação dos Termos")).toBeInTheDocument();
      expect(screen.getByText("2. Descrição do Serviço")).toBeInTheDocument();
      expect(screen.getByText("3. Cadastro e Conta do Usuário")).toBeInTheDocument();
      expect(screen.getByText("4. Uso Aceitável")).toBeInTheDocument();
      expect(screen.getByText("5. Propriedade Intelectual")).toBeInTheDocument();
      expect(screen.getByText("6. Dados do Usuário")).toBeInTheDocument();
      expect(screen.getByText("7. Pagamento e Assinatura")).toBeInTheDocument();
      expect(screen.getByText("8. Cancelamento e Rescisão")).toBeInTheDocument();
      expect(screen.getByText("9. Limitação de Responsabilidade")).toBeInTheDocument();
      expect(screen.getByText("10. Modificações dos Termos")).toBeInTheDocument();
      expect(screen.getByText("11. Lei Aplicável")).toBeInTheDocument();
      expect(screen.getByText("12. Contato")).toBeInTheDocument();
    });

    it("should render back to home link", () => {
      render(
        <TestWrapper>
          <Terms />
        </TestWrapper>
      );

      const link = screen.getByText("← Voltar ao início");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute("href", ROUTES.HOME);
    });

    it("should use language from context", () => {
      const mockUseLanguage = vi.mocked(useLanguage);
      mockUseLanguage.mockReturnValueOnce({
        language: "en",
      });

      render(
        <TestWrapper>
          <Terms />
        </TestWrapper>
      );

      expect(mockUseLanguage).toHaveBeenCalled();
    });

    it("should use translation from i18n", () => {
      const mockUseTranslation = vi.mocked(useTranslation);
      mockUseTranslation.mockReturnValueOnce({
        terms: {
          title: "Terms of Use",
          lastUpdate: "Last update",
        },
      } as never);

      render(
        <TestWrapper>
          <Terms />
        </TestWrapper>
      );

      expect(mockUseTranslation).toHaveBeenCalled();
    });
  });
});
