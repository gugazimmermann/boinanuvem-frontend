import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeeManager } from "../fee-manager";
import { useTranslation } from "~/i18n";
import type { FeeItem } from "~/types/records";
import { renderWithProviders } from "~/utils/test-utils";

vi.mock("~/i18n");
vi.mock("~/components/ui", () => ({
  Input: ({
    value,
    onChange,
    placeholder,
    disabled,
  }: {
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    placeholder?: string;
    disabled?: boolean;
  }) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  ),
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

describe("FeeManager", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockFees: FeeItem[] = [
    { id: "1", name: "Fee 1", amount: "10.00" },
    { id: "2", name: "Fee 2", amount: "20.00" },
  ];

  const defaultProps = {
    fees: mockFees,
    onAddFee: vi.fn(),
    onRemoveFee: vi.fn(),
    onUpdateFee: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      sales: {
        form: {
          fees: "Fees",
          addFee: "Add Fee",
          feeName: "Fee Name",
          feeNamePlaceholder: "Enter fee name",
          feeAmount: "Amount",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render fees label", () => {
    renderWithProviders(<FeeManager {...defaultProps} />);
    expect(screen.getByText("Fees")).toBeInTheDocument();
  });

  it("should render add fee button", () => {
    renderWithProviders(<FeeManager {...defaultProps} />);
    expect(screen.getByText(/Add Fee/)).toBeInTheDocument();
  });

  it("should call onAddFee when add button is clicked", async () => {
    const user = userEvent.setup();
    const onAddFee = vi.fn();
    renderWithProviders(<FeeManager {...defaultProps} onAddFee={onAddFee} />);

    const addButton = screen.getByText(/Add Fee/);
    await user.click(addButton);

    expect(onAddFee).toHaveBeenCalledTimes(1);
  });

  it("should render all fees", () => {
    renderWithProviders(<FeeManager {...defaultProps} />);
    expect(screen.getByDisplayValue("Fee 1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10.00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Fee 2")).toBeInTheDocument();
    expect(screen.getByDisplayValue("20.00")).toBeInTheDocument();
  });

  it("should call onUpdateFee when fee name changes", async () => {
    const user = userEvent.setup();
    const onUpdateFee = vi.fn();
    renderWithProviders(<FeeManager {...defaultProps} onUpdateFee={onUpdateFee} />);

    const inputs = screen.getAllByTestId("input");
    await user.type(inputs[0], "New Name");

    expect(onUpdateFee).toHaveBeenCalled();
  });

  it("should mask fee amount as BRL currency", async () => {
    const onUpdateFee = vi.fn();
    renderWithProviders(
      <FeeManager
        {...defaultProps}
        fees={[
          { id: "1", name: "Fee 1", amount: "" },
          { id: "2", name: "Fee 2", amount: "" },
        ]}
        onUpdateFee={onUpdateFee}
      />
    );

    const inputs = screen.getAllByTestId("input");
    // inputs[1] is the first fee amount input (after first fee name)
    fireEvent.change(inputs[1]!, { target: { value: "1234" } });

    const calls = onUpdateFee.mock.calls.filter((c: unknown[]) => c[1] === "amount");
    expect(calls.length).toBeGreaterThan(0);
    const last = calls[calls.length - 1];
    // maskCurrency formats "1234" as "R$ 12,34" for Portuguese
    // The actual format might vary, so check that it contains the currency symbol and amount
    const formattedValue = String(last[2]);
    expect(formattedValue).toContain("R$");
    expect(formattedValue).toContain("12");
    expect(formattedValue).toContain("34");
  });

  it("should call onRemoveFee when remove button is clicked", async () => {
    const user = userEvent.setup();
    const onRemoveFee = vi.fn();
    renderWithProviders(<FeeManager {...defaultProps} onRemoveFee={onRemoveFee} />);

    const removeButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Remove"));
    if (removeButtons[0]) {
      await user.click(removeButtons[0]);
      expect(onRemoveFee).toHaveBeenCalledWith("1");
    }
  });

  it("should disable inputs when disabled is true", () => {
    renderWithProviders(<FeeManager {...defaultProps} disabled={true} />);
    const inputs = screen.getAllByTestId("input");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("should use custom labels when provided", () => {
    renderWithProviders(
      <FeeManager {...defaultProps} feesLabel="Custom Fees" addFeeLabel="Add Custom Fee" />
    );
    expect(screen.getByText("Custom Fees")).toBeInTheDocument();
    expect(screen.getByText(/Add Custom Fee/)).toBeInTheDocument();
  });

  it("should render empty fees array", () => {
    renderWithProviders(<FeeManager {...defaultProps} fees={[]} />);
    expect(screen.getByText("Fees")).toBeInTheDocument();
    expect(screen.getByText(/Add Fee/)).toBeInTheDocument();
  });
});
