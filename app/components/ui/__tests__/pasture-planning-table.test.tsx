import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasturePlanningTable } from "../pasture-planning-table";
import { LanguageProvider } from "~/contexts/language-context";

vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    properties: {
      details: {
        pasturePlanning: {
          month: "Month",
          minTemp: "Min Temp",
          maxTemp: "Max Temp",
          precipitation: "Precipitation",
          forage: "Forage",
          classification: {
            Poor: "Poor",
            Medium: "Medium",
            Good: "Good",
            Excellent: "Excellent",
          },
          breedingSeason: {
            months: {
              January: "January",
              February: "February",
              March: "March",
              April: "April",
              May: "May",
              June: "June",
              July: "July",
              August: "August",
              September: "September",
              October: "October",
              November: "November",
              December: "December",
            },
          },
        },
      },
    },
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe("PasturePlanningTable", () => {
  const mockData = [
    {
      month: "January",
      min: 10,
      max: 25,
      precipitation: 100,
      classification: "Good" as const,
    },
    {
      month: "February",
      min: 12,
      max: 27,
      precipitation: 120,
      classification: "Excellent" as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render table with data", () => {
    render(<PasturePlanningTable data={mockData} onChange={vi.fn()} />, {
      wrapper: TestWrapper,
    });
    expect(screen.getByText(/month/i)).toBeInTheDocument();
    expect(screen.getByText(/min/i)).toBeInTheDocument();
    expect(screen.getByText(/max/i)).toBeInTheDocument();
  });

  it("should render month names", () => {
    render(<PasturePlanningTable data={mockData} onChange={vi.fn()} />, {
      wrapper: TestWrapper,
    });
    expect(screen.getByText("January")).toBeInTheDocument();
    expect(screen.getByText("February")).toBeInTheDocument();
  });

  it("should call onChange when input value changes", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<PasturePlanningTable data={mockData} onChange={handleChange} />, {
      wrapper: TestWrapper,
    });
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "15");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should call onChange when select value changes", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<PasturePlanningTable data={mockData} onChange={handleChange} />, {
      wrapper: TestWrapper,
    });
    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "Excellent");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should display error messages", () => {
    const errors = {
      "pasturePlanning.0.min": "Min temperature error",
    };
    render(<PasturePlanningTable data={mockData} onChange={vi.fn()} errors={errors} />, {
      wrapper: TestWrapper,
    });
    expect(screen.getByText("Min temperature error")).toBeInTheDocument();
  });

  it("should disable inputs when disabled is true", () => {
    render(<PasturePlanningTable data={mockData} onChange={vi.fn()} disabled={true} />, {
      wrapper: TestWrapper,
    });
    const inputs = screen.getAllByRole("spinbutton");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
    const selects = screen.getAllByRole("combobox");
    selects.forEach((select) => {
      expect(select).toBeDisabled();
    });
  });

  it("should handle empty string input values", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<PasturePlanningTable data={mockData} onChange={handleChange} />, {
      wrapper: TestWrapper,
    });
    const inputs = screen.getAllByRole("spinbutton");
    await user.clear(inputs[0]);
    expect(handleChange).toHaveBeenCalled();
  });

  it("should render all classification options", () => {
    render(<PasturePlanningTable data={mockData} onChange={vi.fn()} />, {
      wrapper: TestWrapper,
    });
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThan(0);
    const firstSelect = selects[0] as HTMLSelectElement;
    const options = Array.from(firstSelect.options).map((opt) => opt.text);
    expect(options).toContain("Poor");
    expect(options).toContain("Medium");
    expect(options).toContain("Good");
    expect(options).toContain("Excellent");
  });

  describe("max input onChange handler", () => {
    it("should handle empty string input and set to 0", async () => {
      const handleChange = vi.fn();
      render(<PasturePlanningTable data={mockData} onChange={handleChange} />, {
        wrapper: TestWrapper,
      });
      const inputs = screen.getAllByRole("spinbutton");
      // Find the max input (second input, index 1)
      const maxInput = inputs[1];
      // Use fireEvent to simulate empty string
      fireEvent.change(maxInput, { target: { value: "" } });
      expect(handleChange).toHaveBeenCalled();
      const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
      const newData = lastCall[0];
      expect(newData[0].max).toBe(0);
    });

    it("should handle valid number input", async () => {
      const handleChange = vi.fn();
      render(<PasturePlanningTable data={mockData} onChange={handleChange} />, {
        wrapper: TestWrapper,
      });
      const inputs = screen.getAllByRole("spinbutton");
      const maxInput = inputs[1];
      // Use fireEvent to set the complete value at once
      fireEvent.change(maxInput, { target: { value: "30.5" } });
      expect(handleChange).toHaveBeenCalled();
      const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
      const newData = lastCall[0];
      expect(newData[0].max).toBe(30.5);
    });

    it("should handle NaN input and set to 0", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<PasturePlanningTable data={mockData} onChange={handleChange} />, {
        wrapper: TestWrapper,
      });
      const inputs = screen.getAllByRole("spinbutton");
      const maxInput = inputs[1];
      // Simulate invalid input that would result in NaN
      await user.clear(maxInput);
      // Type something that parseFloat can't parse properly
      // Actually, parseFloat of "abc" is NaN, but typing "abc" in a number input
      // might not work. Let's test by directly triggering onChange with invalid value
      fireEvent.change(maxInput, { target: { value: "abc" } });
      expect(handleChange).toHaveBeenCalled();
      const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
      const newData = lastCall[0];
      expect(newData[0].max).toBe(0);
    });

    it("should handle decimal values", async () => {
      const handleChange = vi.fn();
      render(<PasturePlanningTable data={mockData} onChange={handleChange} />, {
        wrapper: TestWrapper,
      });
      const inputs = screen.getAllByRole("spinbutton");
      const maxInput = inputs[1];
      // Use fireEvent to set the complete value at once
      fireEvent.change(maxInput, { target: { value: "27.75" } });
      expect(handleChange).toHaveBeenCalled();
      const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
      const newData = lastCall[0];
      expect(newData[0].max).toBe(27.75);
    });
  });

  describe("precipitation input onChange handler", () => {
    it("should handle empty string input and set to 0", async () => {
      const handleChange = vi.fn();
      render(<PasturePlanningTable data={mockData} onChange={handleChange} />, {
        wrapper: TestWrapper,
      });
      const inputs = screen.getAllByRole("spinbutton");
      // Find the precipitation input (third input, index 2)
      const precipInput = inputs[2];
      // Use fireEvent to simulate empty string
      fireEvent.change(precipInput, { target: { value: "" } });
      expect(handleChange).toHaveBeenCalled();
      const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
      const newData = lastCall[0];
      expect(newData[0].precipitation).toBe(0);
    });

    it("should handle valid number input", async () => {
      const handleChange = vi.fn();
      render(<PasturePlanningTable data={mockData} onChange={handleChange} />, {
        wrapper: TestWrapper,
      });
      const inputs = screen.getAllByRole("spinbutton");
      const precipInput = inputs[2];
      // Use fireEvent to set the complete value at once
      fireEvent.change(precipInput, { target: { value: "150.25" } });
      expect(handleChange).toHaveBeenCalled();
      const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
      const newData = lastCall[0];
      expect(newData[0].precipitation).toBe(150.25);
    });

    it("should handle NaN input and set to 0", async () => {
      const handleChange = vi.fn();
      render(<PasturePlanningTable data={mockData} onChange={handleChange} />, {
        wrapper: TestWrapper,
      });
      const inputs = screen.getAllByRole("spinbutton");
      const precipInput = inputs[2];
      // Simulate invalid input
      fireEvent.change(precipInput, { target: { value: "invalid" } });
      expect(handleChange).toHaveBeenCalled();
      const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
      const newData = lastCall[0];
      expect(newData[0].precipitation).toBe(0);
    });

    it("should handle decimal values", async () => {
      const handleChange = vi.fn();
      render(<PasturePlanningTable data={mockData} onChange={handleChange} />, {
        wrapper: TestWrapper,
      });
      const inputs = screen.getAllByRole("spinbutton");
      const precipInput = inputs[2];
      // Use fireEvent to set the complete value at once
      fireEvent.change(precipInput, { target: { value: "120.5" } });
      expect(handleChange).toHaveBeenCalled();
      const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
      const newData = lastCall[0];
      expect(newData[0].precipitation).toBe(120.5);
    });
  });
});
