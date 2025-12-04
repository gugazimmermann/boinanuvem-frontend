import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TablePagination } from "../table-pagination";

describe("TablePagination", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render when totalPages > 1", () => {
    render(<TablePagination {...defaultProps} />);
    expect(screen.getByRole("button", { name: /anterior/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /próximo/i })).toBeInTheDocument();
  });

  it("should return null when totalPages <= 1", () => {
    const { container } = render(<TablePagination {...defaultProps} totalPages={1} />);
    expect(container.firstChild).toBeNull();
  });

  it("should call onPageChange when previous button clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<TablePagination {...defaultProps} currentPage={2} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: /anterior/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should call onPageChange when next button clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<TablePagination {...defaultProps} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: /próximo/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("should disable previous button on first page", () => {
    render(<TablePagination {...defaultProps} currentPage={1} />);
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    expect(prevButton).toBeDisabled();
  });

  it("should disable next button on last page", () => {
    render(<TablePagination {...defaultProps} currentPage={5} />);
    const nextButton = screen.getByRole("button", { name: /próximo/i });
    expect(nextButton).toBeDisabled();
  });

  it("should call onPageChange when page number clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<TablePagination {...defaultProps} onPageChange={onPageChange} />);
    const pageButton = screen.getByRole("button", { name: "2" });
    await user.click(pageButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("should highlight active page", () => {
    const { container } = render(<TablePagination {...defaultProps} currentPage={3} />);
    const activeButton = container.querySelector('button[class*="bg-blue-100"]');
    expect(activeButton).toBeInTheDocument();
    expect(activeButton?.textContent).toBe("3");
  });

  it("should render ellipsis for large page counts", () => {
    render(<TablePagination {...defaultProps} currentPage={5} totalPages={15} />);
    const ellipsis = screen.getAllByText("...");
    expect(ellipsis.length).toBeGreaterThan(0);
    expect(ellipsis[0]).toBeInTheDocument();
  });

  it("should render all page numbers when totalPages <= 10", () => {
    render(<TablePagination {...defaultProps} totalPages={5} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole("button", { name: String(i) })).toBeInTheDocument();
    }
  });

  it("should render page numbers for start position", () => {
    render(<TablePagination {...defaultProps} currentPage={2} totalPages={15} />);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
  });

  it("should render page numbers for end position", () => {
    render(<TablePagination {...defaultProps} currentPage={14} totalPages={15} />);
    expect(screen.getByRole("button", { name: "14" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "15" })).toBeInTheDocument();
  });

  it("should render page numbers for middle position", () => {
    render(<TablePagination {...defaultProps} currentPage={8} totalPages={15} />);
    expect(screen.getByRole("button", { name: "8" })).toBeInTheDocument();
  });

  it("should render in slim mode", () => {
    const { container } = render(<TablePagination {...defaultProps} slim={true} />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("text-xs");
  });

  it("should not render page numbers in mobile view for 10+ pages", () => {
    render(<TablePagination {...defaultProps} currentPage={5} totalPages={15} />);
    const pageNumbersContainer = screen.queryByRole("button", { name: "5" });
    expect(pageNumbersContainer).toBeInTheDocument();
  });

  it("should handle page change at boundaries", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TablePagination
        {...defaultProps}
        currentPage={1}
        totalPages={3}
        onPageChange={onPageChange}
      />
    );
    await user.click(screen.getByRole("button", { name: "3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("should not call onPageChange when clicking disabled previous", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<TablePagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />);
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    await user.click(prevButton);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("should not call onPageChange when clicking disabled next", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<TablePagination {...defaultProps} currentPage={5} onPageChange={onPageChange} />);
    const nextButton = screen.getByRole("button", { name: /próximo/i });
    await user.click(nextButton);
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
