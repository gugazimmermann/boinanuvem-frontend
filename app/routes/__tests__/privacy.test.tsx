import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { meta, links, default as Privacy } from "../privacy";
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
    privacy: {
      title: "Política de Privacidade",
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

describe("privacy", () => {
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
        expect(titleTag.title).toContain("Política de Privacidade");
      }
    });
  });

  describe("links", () => {
    it("should return canonical link", () => {
      const result = links();
      expect(result).toHaveLength(1);
      expect(result[0].rel).toBe("canonical");
      expect(result[0].href).toBe("https://boinanuvem.com.br/privacidade");
    });
  });

  describe("Privacy component", () => {
    it("should render AuthLayout", () => {
      render(
        <TestWrapper>
          <Privacy />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
    });

    it("should render privacy title", () => {
      render(
        <TestWrapper>
          <Privacy />
        </TestWrapper>
      );

      expect(screen.getByText("Política de Privacidade")).toBeInTheDocument();
    });

    it("should render last update date", () => {
      render(
        <TestWrapper>
          <Privacy />
        </TestWrapper>
      );

      expect(screen.getAllByText(/Última atualização/).length).toBeGreaterThan(0);
    });

    it("should render all privacy sections", () => {
      render(
        <TestWrapper>
          <Privacy />
        </TestWrapper>
      );

      expect(screen.getByText("1. Introdução")).toBeInTheDocument();
      expect(screen.getByText("2. Informações que Coletamos")).toBeInTheDocument();
      expect(screen.getByText("3. Como Usamos Suas Informações")).toBeInTheDocument();
      expect(screen.getByText("4. Compartilhamento de Informações")).toBeInTheDocument();
      expect(screen.getByText("5. Segurança dos Dados")).toBeInTheDocument();
      expect(screen.getByText("6. Retenção de Dados")).toBeInTheDocument();
      expect(screen.getByText("7. Seus Direitos (LGPD)")).toBeInTheDocument();
      expect(screen.getByText("8. Cookies e Tecnologias Similares")).toBeInTheDocument();
      expect(screen.getByText("9. Privacidade de Menores")).toBeInTheDocument();
      expect(screen.getByText("10. Alterações nesta Política")).toBeInTheDocument();
      expect(screen.getByText("11. Transferência Internacional de Dados")).toBeInTheDocument();
      expect(screen.getByText("12. Contato")).toBeInTheDocument();
    });

    it("should render back to home link", () => {
      render(
        <TestWrapper>
          <Privacy />
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
          <Privacy />
        </TestWrapper>
      );

      expect(mockUseLanguage).toHaveBeenCalled();
    });

    it("should use translation from i18n", () => {
      const mockUseTranslation = vi.mocked(useTranslation);
      mockUseTranslation.mockReturnValueOnce({
        privacy: {
          title: "Privacy Policy",
          lastUpdate: "Last update",
        },
      } as never);

      render(
        <TestWrapper>
          <Privacy />
        </TestWrapper>
      );

      expect(mockUseTranslation).toHaveBeenCalled();
    });
  });
});
