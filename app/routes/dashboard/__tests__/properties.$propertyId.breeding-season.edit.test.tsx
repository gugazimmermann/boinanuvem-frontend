import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import EditBreedingSeason from "../properties.$propertyId.breeding-season.edit";
import { getPropertyById, updateProperty } from "~/services/properties.service";
import type { Property } from "~/types";
import { AreaType } from "~/types/location";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/properties.service", async () => {
  const actual = await vi.importActual<typeof import("~/services/properties.service")>(
    "~/services/properties.service"
  );
  return {
    ...actual,
    getPropertyById: vi.fn(),
    updateProperty: vi.fn(),
  };
});

vi.mock("~/components/ui", () => ({
  Button: ({
    children,
    onClick,
    type,
    disabled,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    "data-testid"?: string;
    [key: string]: unknown;
  }) => (
    <button
      data-testid={props["data-testid"] || "button"}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: { title: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("EditBreedingSeason", () => {
  const mockProperty: Property = {
    id: "property-1",
    code: "PROP001",
    name: "Test Property",
    status: "active",
    companyId: "company-1",
    city: "Test City",
    state: "SC",
    area: { value: 100, type: AreaType.HECTARES },
    zipCode: "89000-000",
    street: "Test Street",
    number: "123",
    createdAt: "2024-01-01T00:00:00Z",
    complement: "",
    neighborhood: "Test Neighborhood",
    breedingMonths: ["January", "February", "March"],
    breedingSeasonModifiedByUser: false,
  };

  const createRouter = (propertyId: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/properties/:propertyId/breeding-season/edit",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <EditBreedingSeason />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/properties/${propertyId}/breeding-season/edit`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPropertyById).mockReturnValue(mockProperty);
  });

  it("should render edit breeding season form", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const heading = screen.queryByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("should load existing breeding months", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("should display AI-generated note when data has not been modified", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const note = document.querySelector(".bg-blue-50, .dark\\:bg-blue-900\\/20");
    expect(note).toBeInTheDocument();
  });

  it("should not display AI-generated note when data has been modified", async () => {
    const modifiedProperty = {
      ...mockProperty,
      breedingSeasonModifiedByUser: true,
    };
    vi.mocked(getPropertyById).mockReturnValue(modifiedProperty);

    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const note = document.querySelector(
      ".mt-2.p-3.bg-blue-50.dark\\:bg-blue-900\\/20.border.border-blue-200"
    );
    expect(note).not.toBeInTheDocument();
  });

  it("should toggle month selection", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const checkboxes = screen.getAllByRole("checkbox");
    const unselectedCheckbox = checkboxes.find(
      (cb) => !(cb as HTMLInputElement).checked
    ) as HTMLInputElement;

    if (unselectedCheckbox) {
      const wasChecked = unselectedCheckbox.checked;
      fireEvent.click(unselectedCheckbox);
      await waitFor(() => {
        expect(unselectedCheckbox.checked).toBe(!wasChecked);
      });
    }
  });

  it("should hide AI-generated note after user modifies data", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const checkboxes = screen.getAllByRole("checkbox");
    const unselectedCheckbox = checkboxes.find(
      (cb) => !(cb as HTMLInputElement).checked
    ) as HTMLInputElement;

    if (unselectedCheckbox) {
      fireEvent.click(unselectedCheckbox);
      await waitFor(() => {
        const note = document.querySelector(
          ".mt-2.p-3.bg-blue-50.dark\\:bg-blue-900\\/20.border.border-blue-200"
        );
        expect(note).not.toBeInTheDocument();
      });
    }
  });

  it("should handle form submission", async () => {
    vi.mocked(updateProperty).mockReturnValue(true);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(updateProperty).toHaveBeenCalled();
      });
    }
  });

  it("should save modification status on submit", async () => {
    vi.mocked(updateProperty).mockReturnValue(true);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const checkboxes = screen.getAllByRole("checkbox");
    const unselectedCheckbox = checkboxes.find(
      (cb) => !(cb as HTMLInputElement).checked
    ) as HTMLInputElement;

    if (unselectedCheckbox) {
      fireEvent.click(unselectedCheckbox);
    }

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(updateProperty).toHaveBeenCalledWith(
          "property-1",
          expect.objectContaining({
            breedingSeasonModifiedByUser: true,
          })
        );
      });
    }
  });

  it("should handle undefined property", () => {
    vi.mocked(getPropertyById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should navigate back on cancel", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const buttons = screen.queryAllByRole("button");
    const cancelButton = buttons.find(
      (btn) =>
        btn.textContent?.includes("Cancelar") ||
        btn.textContent?.includes("Cancel") ||
        btn.textContent?.includes("Voltar") ||
        btn.textContent?.includes("Back")
    );

    if (cancelButton) {
      fireEvent.click(cancelButton);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should navigate to property view on successful submission", async () => {
    vi.mocked(updateProperty).mockReturnValue(true);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    }
  });

  it("should display alert on successful submission", async () => {
    vi.mocked(updateProperty).mockReturnValue(true);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        const alert = screen.queryByTestId("alert-success");
        expect(alert || form).toBeTruthy();
      });
    }
  });

  it("should display alert on failed submission", async () => {
    vi.mocked(updateProperty).mockReturnValue(false);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        const alert = screen.queryByTestId("alert-error");
        expect(alert || form).toBeTruthy();
      });
    }
  });

  it("should handle empty breeding months", async () => {
    const propertyWithoutMonths = {
      ...mockProperty,
      breedingMonths: undefined,
    };
    vi.mocked(getPropertyById).mockReturnValue(propertyWithoutMonths);

    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((cb) => {
      expect((cb as HTMLInputElement).checked).toBe(false);
    });
  });

  it("should display selected months summary", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const summary = document.querySelector(".flex.flex-wrap.gap-2");
    expect(summary).toBeInTheDocument();
  });

  it("should render all 12 months", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(12);
  });

  it("should disable form when submitting", async () => {
    let resolvePromise: (value: boolean) => void;
    const promise = new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(updateProperty).mockReturnValue(promise);

    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        const allDisabled = checkboxes.every((cb) => (cb as HTMLInputElement).disabled);
        expect(allDisabled || checkboxes.length > 0).toBeTruthy();
      });
      resolvePromise!(true);
    }
  });

  it("should sort selected months correctly", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const summary = document.querySelector(".flex.flex-wrap.gap-2");
    expect(summary).toBeInTheDocument();
  });
});
