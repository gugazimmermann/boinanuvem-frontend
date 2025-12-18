import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";

/**
 * Custom render function that includes all necessary providers
 * Use this instead of the default render from @testing-library/react
 * when testing components that use useLanguage or useTheme hooks
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & {
    wrapper?: (props: { children: ReactNode }) => ReactElement;
  }
) {
  const ProvidersWrapper = ({ children }: { children: ReactNode }) => {
    return (
      <ThemeProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </ThemeProvider>
    );
  };

  // If a custom wrapper is provided, combine it with providers
  if (options?.wrapper) {
    const CustomWrapper = options.wrapper;
    const CombinedWrapper = ({ children }: { children: ReactNode }) => {
      return (
        <CustomWrapper>
          <ProvidersWrapper>{children}</ProvidersWrapper>
        </CustomWrapper>
      );
    };
    const { wrapper: _wrapper, ...restOptions } = options;
    return render(ui, { ...restOptions, wrapper: CombinedWrapper });
  }

  return render(ui, { wrapper: ProvidersWrapper, ...options });
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react";
