import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YearMonthFilters } from "../year-month-filters";
import { useDateFilters } from "~/hooks/use-date-filters";

vi.mock("~/hooks/use-date-filters");
vi.mock("~/components/ui", () => ({
  Select: ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    options: Array<{ value: string; label: string }>;
  }) => (
    <select value={value} onChange={onChange}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

describe("YearMonthFilters", () => {
  const mockUseDateFilters = vi.mocked(useDateFilters);
  const defaultProps = {
    selectedYear: "2024",
    selectedMonth: "01",
    onYearChange: vi.fn(),
    onMonthChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDateFilters.mockReturnValue({
      yearOptions: [
        { value: "2024", label: "2024" },
        { value: "2023", label: "2023" },
      ],
      monthOptions: [
        { value: "01", label: "January" },
        { value: "02", label: "February" },
      ],
    });
  });

  it("should render year and month selects", () => {
    render(<YearMonthFilters {...defaultProps} />);
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBe(2);
  });

  it("should call onYearChange when year changes", async () => {
    const user = userEvent.setup();
    const onYearChange = vi.fn();
    render(<YearMonthFilters {...defaultProps} onYearChange={onYearChange} />);

    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "2023");

    expect(onYearChange).toHaveBeenCalledWith("2023");
  });

  it("should call onMonthChange when month changes", async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    render(<YearMonthFilters {...defaultProps} onMonthChange={onMonthChange} />);

    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[1], "02");

    expect(onMonthChange).toHaveBeenCalledWith("02");
  });

  it("should call onPageChange when year changes", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<YearMonthFilters {...defaultProps} onPageChange={onPageChange} />);

    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "2023");

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should call onPageChange when month changes", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<YearMonthFilters {...defaultProps} onPageChange={onPageChange} />);

    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[1], "02");

    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
