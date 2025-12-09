import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useTranslation } from "../use-translation";
import { LanguageProvider, useLanguage } from "~/contexts/language-context";
import userEvent from "@testing-library/user-event";

// Test component that uses the translation hook
function TestComponent() {
  const t = useTranslation();
  return (
    <div>
      <div data-testid="common-loading">{t.common.loading}</div>
      <div data-testid="common-save">{t.common.save}</div>
      <div data-testid="common-cancel">{t.common.cancel}</div>
      <div data-testid="common-days-ago-0">{t.common.daysAgo(0)}</div>
      <div data-testid="common-days-ago-1">{t.common.daysAgo(1)}</div>
      <div data-testid="common-days-ago-5">{t.common.daysAgo(5)}</div>
    </div>
  );
}

// Test component that uses both translation and language hooks
function TestComponentWithLanguage() {
  const t = useTranslation();
  const { setLanguage } = useLanguage();
  return (
    <div>
      <div data-testid="common-loading">{t.common.loading}</div>
      <button onClick={() => setLanguage("en")}>Switch to English</button>
      <button onClick={() => setLanguage("es")}>Switch to Spanish</button>
      <button onClick={() => setLanguage("pt")}>Switch to Portuguese</button>
    </div>
  );
}

describe("useTranslation", () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    length: number;
    key: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Setup localStorage mock
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock as Storage,
      writable: true,
    });

    vi.clearAllMocks();
  });

  describe("translation retrieval", () => {
    it("should return Portuguese translations when language is pt", async () => {
      localStorageMock.getItem.mockReturnValue("pt");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("common-loading")).toHaveTextContent("Carregando...");
        expect(screen.getByTestId("common-save")).toHaveTextContent("Salvar");
        expect(screen.getByTestId("common-cancel")).toHaveTextContent("Cancelar");
      });
    });

    it("should return English translations when language is en", async () => {
      localStorageMock.getItem.mockReturnValue("en");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("common-loading")).toHaveTextContent("Loading...");
        expect(screen.getByTestId("common-save")).toHaveTextContent("Save");
        expect(screen.getByTestId("common-cancel")).toHaveTextContent("Cancel");
      });
    });

    it("should return Spanish translations when language is es", async () => {
      localStorageMock.getItem.mockReturnValue("es");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("common-loading")).toHaveTextContent("Cargando...");
        expect(screen.getByTestId("common-save")).toHaveTextContent("Guardar");
        expect(screen.getByTestId("common-cancel")).toHaveTextContent("Cancelar");
      });
    });
  });

  describe("function translations", () => {
    it("should handle function translations correctly for Portuguese", async () => {
      localStorageMock.getItem.mockReturnValue("pt");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("common-days-ago-0")).toHaveTextContent("Hoje");
        expect(screen.getByTestId("common-days-ago-1")).toHaveTextContent("Há 1 dia");
        expect(screen.getByTestId("common-days-ago-5")).toHaveTextContent("Há 5 dias");
      });
    });

    it("should handle function translations correctly for English", async () => {
      localStorageMock.getItem.mockReturnValue("en");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("common-days-ago-0")).toHaveTextContent("Today");
        expect(screen.getByTestId("common-days-ago-1")).toHaveTextContent("1 day ago");
        expect(screen.getByTestId("common-days-ago-5")).toHaveTextContent("5 days ago");
      });
    });

    it("should handle function translations correctly for Spanish", async () => {
      localStorageMock.getItem.mockReturnValue("es");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("common-days-ago-0")).toHaveTextContent("Hoy");
        expect(screen.getByTestId("common-days-ago-1")).toHaveTextContent("Hace 1 día");
        expect(screen.getByTestId("common-days-ago-5")).toHaveTextContent("Hace 5 días");
      });
    });
  });

  describe("language context updates", () => {
    it("should update translations when language changes", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("pt");

      render(
        <LanguageProvider>
          <TestComponentWithLanguage />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("common-loading")).toHaveTextContent("Carregando...");
      });

      const switchButton = screen.getByText("Switch to English");
      await user.click(switchButton);

      await waitFor(() => {
        expect(screen.getByTestId("common-loading")).toHaveTextContent("Loading...");
      });
    });

    it("should update translations when language changes from en to es", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("en");

      function TestComponentWithSave() {
        const t = useTranslation();
        const { setLanguage } = useLanguage();
        return (
          <div>
            <div data-testid="common-save">{t.common.save}</div>
            <button onClick={() => setLanguage("es")}>Switch to Spanish</button>
          </div>
        );
      }

      render(
        <LanguageProvider>
          <TestComponentWithSave />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("common-save")).toHaveTextContent("Save");
      });

      const switchButton = screen.getByText("Switch to Spanish");
      await user.click(switchButton);

      await waitFor(() => {
        expect(screen.getByTestId("common-save")).toHaveTextContent("Guardar");
      });
    });
  });

  describe("translation object structure", () => {
    it("should return translation object with common properties", async () => {
      localStorageMock.getItem.mockReturnValue("pt");

      function TestComponentStructure() {
        const t = useTranslation();
        return (
          <div>
            <div data-testid="has-common">{t.common ? "yes" : "no"}</div>
          </div>
        );
      }

      render(
        <LanguageProvider>
          <TestComponentStructure />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("has-common")).toHaveTextContent("yes");
      });
    });

    it("should return translation object that updates when language changes", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("pt");

      render(
        <LanguageProvider>
          <TestComponentWithLanguage />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("common-loading")).toHaveTextContent("Carregando...");
      });

      const switchButton = screen.getByText("Switch to English");
      await user.click(switchButton);

      await waitFor(() => {
        expect(screen.getByTestId("common-loading")).toHaveTextContent("Loading...");
      });
    });
  });
});
