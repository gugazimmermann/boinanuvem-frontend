import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeeManager } from "../fee-manager";

vi.mock("~/components/ui", () => ({
  Input: vi.fn(
    ({
      type,
      value,
      onChange,
      disabled,
      placeholder,
    }: {
      type?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      disabled?: boolean;
      placeholder?: string;
    }) => (
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
    )
  ),
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
      type,
      variant,
      className,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      type?: "button" | "submit" | "reset";
      variant?: string;
      className?: string;
    }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        type={type}
        data-variant={variant}
        className={className}
      >
        {children}
      </button>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    sales: {
      form: {
        fees: "Fees",
        addFee: "Add Fee",
        feeName: "Fee Name",
        feeNamePlaceholder: "e.g., Transport Fee",
        feeAmount: "Amount",
      },
    },
    common: {
      remove: "Remove",
    },
  })),
}));

describe("FeeManager", () => {
  const defaultProps = {
    fees: [],
    onAddFee: vi.fn(),
    onRemoveFee: vi.fn(),
    onUpdateFee: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render fee manager", () => {
    render(<FeeManager {...defaultProps} />);
    expect(screen.getByText("Fees")).toBeInTheDocument();
  });

  it("should call onAddFee when add button is clicked", async () => {
    const onAddFee = vi.fn();
    const user = userEvent.setup();
    render(<FeeManager {...defaultProps} onAddFee={onAddFee} />);
    const addButton = screen.getByText(/Add Fee/);
    await user.click(addButton);
    expect(onAddFee).toHaveBeenCalledTimes(1);
  });

  it("should render fees when provided", () => {
    const fees = [
      { id: "fee-1", name: "Transport", amount: "100.00" },
      { id: "fee-2", name: "Insurance", amount: "50.00" },
    ];
    render(<FeeManager {...defaultProps} fees={fees} />);
    expect(screen.getByDisplayValue("Transport")).toBeInTheDocument();
    expect(screen.getByDisplayValue("100.00")).toBeInTheDocument();
  });

  it("should call onUpdateFee when fee name changes", async () => {
    const onUpdateFee = vi.fn();
    const user = userEvent.setup();
    const fees = [{ id: "fee-1", name: "Transport", amount: "100.00" }];
    render(<FeeManager {...defaultProps} fees={fees} onUpdateFee={onUpdateFee} />);
    const nameInput = screen.getByDisplayValue("Transport");
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");
    expect(onUpdateFee).toHaveBeenCalled();
  });

  it("should call onUpdateFee when fee amount changes", async () => {
    const onUpdateFee = vi.fn();
    const user = userEvent.setup();
    const fees = [{ id: "fee-1", name: "Transport", amount: "100.00" }];
    render(<FeeManager {...defaultProps} fees={fees} onUpdateFee={onUpdateFee} />);
    const amountInput = screen.getByDisplayValue("100.00");
    await user.clear(amountInput);
    await user.type(amountInput, "200.00");
    expect(onUpdateFee).toHaveBeenCalled();
  });

  it("should call onRemoveFee when remove button is clicked", async () => {
    const onRemoveFee = vi.fn();
    const user = userEvent.setup();
    const fees = [{ id: "fee-1", name: "Transport", amount: "100.00" }];
    render(<FeeManager {...defaultProps} fees={fees} onRemoveFee={onRemoveFee} />);
    const removeButton = screen.getByText("Remove");
    await user.click(removeButton);
    expect(onRemoveFee).toHaveBeenCalledWith("fee-1");
  });

  it("should disable inputs when disabled is true", () => {
    const fees = [{ id: "fee-1", name: "Transport", amount: "100.00" }];
    render(<FeeManager {...defaultProps} fees={fees} disabled={true} />);
    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("should use custom labels when provided", () => {
    render(
      <FeeManager
        {...defaultProps}
        feesLabel="Custom Fees"
        addFeeLabel="Add Custom Fee"
        feeNameLabel="Custom Name"
        feeNamePlaceholder="Custom placeholder"
        feeAmountLabel="Custom Amount"
        feeAmountPlaceholder="0.00"
      />
    );
    expect(screen.getByText("Custom Fees")).toBeInTheDocument();
    expect(screen.getByText(/Add Custom Fee/)).toBeInTheDocument();
  });
});
