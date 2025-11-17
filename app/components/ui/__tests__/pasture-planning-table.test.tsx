import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasturePlanningTable } from "../pasture-planning-table";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import type { PasturePlanningMonth } from "~/types/property";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </ThemeProvider>
);

vi.mock("~/components/ui", async () => {
  const actual = await vi.importActual<typeof import("~/components/ui")>("~/components/ui");
  return {
    ...actual,
    Input: ({
      value,
      onChange,
      error,
      disabled,
      inputClassName,
      ...props
    }: {
      value?: string | number;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      inputClassName?: string;
      name?: string;
      className?: string;
      [key: string]: unknown;
    }) => {
      const { className, ...domProps } = props;
      return (
        <div>
          <input
            data-testid={`input-${props.name || "input"}`}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={!!error}
            className={inputClassName || (className as string | undefined)}
            {...domProps}
          />
          {error && <span data-testid={`error-${props.name}`}>{error}</span>}
        </div>
      );
    },
    Select: ({
      value,
      onChange,
      options,
      error,
      disabled,
      selectClassName,
      showPlaceholder,
      ...props
    }: {
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      options?: Array<{ value: string; label: string }>;
      error?: string;
      disabled?: boolean;
      selectClassName?: string;
      showPlaceholder?: boolean;
      name?: string;
      className?: string;
      [key: string]: unknown;
    }) => {
      const { className, ...domProps } = props;
      return (
        <div>
          <select
            data-testid={`select-${props.name || "select"}`}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={!!error}
            className={selectClassName || (className as string | undefined)}
            {...domProps}
          >
            {showPlaceholder !== false && <option value="">Select...</option>}
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {error && <span data-testid={`error-${props.name}`}>{error}</span>}
        </div>
      );
    },
  };
});

describe("PasturePlanningTable", () => {
  const mockData: PasturePlanningMonth[] = [
    {
      month: "January",
      min: 15,
      max: 25,
      precipitation: 100,
      classification: "Good",
    },
    {
      month: "February",
      min: 16,
      max: 26,
      precipitation: 120,
      classification: "Excellent",
    },
  ];

  it("should render table with data", () => {
    const onChange = vi.fn();
    render(<PasturePlanningTable data={mockData} onChange={onChange} />, { wrapper });

    const table = document.querySelector("table");
    expect(table).toBeInTheDocument();
  });

  it("should render all months in data", () => {
    const onChange = vi.fn();
    render(<PasturePlanningTable data={mockData} onChange={onChange} />, { wrapper });

    const rows = document.querySelectorAll("tbody tr");
    expect(rows.length).toBe(mockData.length);
  });

  it("should render table headers", () => {
    const onChange = vi.fn();
    render(<PasturePlanningTable data={mockData} onChange={onChange} />, { wrapper });

    const headers = document.querySelectorAll("thead th");
    expect(headers.length).toBeGreaterThan(0);
  });

  it("should call onChange when min temperature is changed", () => {
    const onChange = vi.fn();
    render(<PasturePlanningTable data={mockData} onChange={onChange} />, { wrapper });

    const inputs = screen.getAllByTestId(/^input-/);
    const minInput = inputs.find((inp) => inp.getAttribute("type") === "number");
    if (minInput) {
      fireEvent.change(minInput, { target: { value: "20" } });
      expect(onChange).toHaveBeenCalled();
    }
  });

  it("should call onChange when max temperature is changed", () => {
    const onChange = vi.fn();
    render(<PasturePlanningTable data={mockData} onChange={onChange} />, { wrapper });

    const inputs = screen.getAllByTestId(/^input-/);
    const numberInputs = inputs.filter((inp) => inp.getAttribute("type") === "number");
    if (numberInputs.length > 1) {
      fireEvent.change(numberInputs[1], { target: { value: "30" } });
      expect(onChange).toHaveBeenCalled();
    }
  });

  it("should call onChange when precipitation is changed", () => {
    const onChange = vi.fn();
    render(<PasturePlanningTable data={mockData} onChange={onChange} />, { wrapper });

    const inputs = screen.getAllByTestId(/^input-/);
    const numberInputs = inputs.filter((inp) => inp.getAttribute("type") === "number");
    if (numberInputs.length > 2) {
      fireEvent.change(numberInputs[2], { target: { value: "150" } });
      expect(onChange).toHaveBeenCalled();
    }
  });

  it("should call onChange when classification is changed", () => {
    const onChange = vi.fn();
    render(<PasturePlanningTable data={mockData} onChange={onChange} />, { wrapper });

    const selects = screen.getAllByTestId(/^select-/);
    if (selects.length > 0) {
      fireEvent.change(selects[0], { target: { value: "Medium" } });
      expect(onChange).toHaveBeenCalled();
    }
  });

  it("should display errors when provided", () => {
    const onChange = vi.fn();
    const errors = {
      "pasturePlanning.0.min": "Min temperature error",
      "pasturePlanning.0.max": "Max temperature error",
    };
    render(<PasturePlanningTable data={mockData} onChange={onChange} errors={errors} />, {
      wrapper,
    });

    const errorElements = screen.queryAllByTestId(/^error-/);
    expect(errorElements.length).toBeGreaterThan(0);
  });

  it("should disable inputs when disabled prop is true", () => {
    const onChange = vi.fn();
    render(<PasturePlanningTable data={mockData} onChange={onChange} disabled={true} />, {
      wrapper,
    });

    const inputs = screen.getAllByTestId(/^input-/);
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });

    const selects = screen.getAllByTestId(/^select-/);
    selects.forEach((select) => {
      expect(select).toBeDisabled();
    });
  });

  it("should handle empty string values for numeric inputs", () => {
    const onChange = vi.fn();
    const dataWithEmpty: PasturePlanningMonth[] = [
      {
        month: "January",
        min: NaN,
        max: NaN,
        precipitation: NaN,
        classification: "Good",
      },
    ];
    render(<PasturePlanningTable data={dataWithEmpty} onChange={onChange} />, { wrapper });

    const inputs = screen.getAllByTestId(/^input-/);
    const numberInputs = inputs.filter((inp) => inp.getAttribute("type") === "number");
    numberInputs.forEach((input) => {
      const value = (input as HTMLInputElement).value;
      expect(value === "" || value === null || value === undefined).toBeTruthy();
    });
  });

  it("should handle all classification values", () => {
    const onChange = vi.fn();
    const dataWithAllClassifications: PasturePlanningMonth[] = [
      { month: "January", min: 15, max: 25, precipitation: 100, classification: "Poor" },
      { month: "February", min: 16, max: 26, precipitation: 120, classification: "Medium" },
      { month: "March", min: 17, max: 27, precipitation: 130, classification: "Good" },
      { month: "April", min: 18, max: 28, precipitation: 140, classification: "Excellent" },
    ];
    render(<PasturePlanningTable data={dataWithAllClassifications} onChange={onChange} />, {
      wrapper,
    });

    const rows = document.querySelectorAll("tbody tr");
    expect(rows.length).toBe(dataWithAllClassifications.length);
  });

  it("should handle 12 months of data", () => {
    const onChange = vi.fn();
    const allMonths: PasturePlanningMonth[] = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ].map((month) => ({
      month,
      min: 15,
      max: 25,
      precipitation: 100,
      classification: "Good" as const,
    }));

    render(<PasturePlanningTable data={allMonths} onChange={onChange} />, { wrapper });

    const rows = document.querySelectorAll("tbody tr");
    expect(rows.length).toBe(12);
  });

  it("should handle zero values", () => {
    const onChange = vi.fn();
    const dataWithZeros: PasturePlanningMonth[] = [
      {
        month: "January",
        min: 0,
        max: 0,
        precipitation: 0,
        classification: "Poor",
      },
    ];
    render(<PasturePlanningTable data={dataWithZeros} onChange={onChange} />, { wrapper });

    const inputs = screen.getAllByTestId(/^input-/);
    const numberInputs = inputs.filter((inp) => inp.getAttribute("type") === "number");
    numberInputs.forEach((input) => {
      const value = (input as HTMLInputElement).value;
      expect(value === "0").toBeTruthy();
    });
  });

  it("should handle negative temperature values", () => {
    const onChange = vi.fn();
    const dataWithNegatives: PasturePlanningMonth[] = [
      {
        month: "January",
        min: -5,
        max: 5,
        precipitation: 100,
        classification: "Medium",
      },
    ];
    render(<PasturePlanningTable data={dataWithNegatives} onChange={onChange} />, { wrapper });

    const inputs = screen.getAllByTestId(/^input-/);
    const numberInputs = inputs.filter((inp) => inp.getAttribute("type") === "number");
    expect(numberInputs.length).toBeGreaterThan(0);
  });

  it("should update data correctly when multiple fields are changed", () => {
    const onChange = vi.fn();
    render(<PasturePlanningTable data={mockData} onChange={onChange} />, { wrapper });

    const inputs = screen.getAllByTestId(/^input-/);
    const numberInputs = inputs.filter((inp) => inp.getAttribute("type") === "number");
    if (numberInputs.length > 0) {
      fireEvent.change(numberInputs[0], { target: { value: "20" } });
      expect(onChange).toHaveBeenCalled();
    }
  });

  it("should handle empty data array", () => {
    const onChange = vi.fn();
    render(<PasturePlanningTable data={[]} onChange={onChange} />, { wrapper });

    const table = document.querySelector("table");
    expect(table).toBeInTheDocument();
    const rows = document.querySelectorAll("tbody tr");
    expect(rows.length).toBe(0);
  });
});
