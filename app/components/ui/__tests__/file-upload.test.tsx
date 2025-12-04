import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload } from "../file-upload";

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: () => ({
    common: {
      uploadFile: "Upload file",
      uploadFiles: "Upload files",
      dragAndDrop: "or drag and drop",
      accepted: "Accepted:",
      remove: "Remove",
    },
  }),
}));

describe("FileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with label", () => {
    render(<FileUpload label="Upload Files" />);
    expect(screen.getByText("Upload Files")).toBeInTheDocument();
  });

  it("should render with helper text", () => {
    render(<FileUpload helperText="Helper text" />);
    expect(screen.getByText("Helper text")).toBeInTheDocument();
  });

  it("should render with error message", () => {
    render(<FileUpload error="Error message" />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("should prioritize error over helper text", () => {
    render(<FileUpload helperText="Helper" error="Error" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });

  it("should render in multiple file mode by default", () => {
    render(<FileUpload />);
    expect(screen.getByText("Upload files")).toBeInTheDocument();
  });

  it("should render in single file mode", () => {
    render(<FileUpload multiple={false} />);
    expect(screen.getByText("Upload file")).toBeInTheDocument();
  });

  it("should handle file selection", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    render(<FileUpload onChange={handleChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    expect(handleChange).toHaveBeenCalledWith([file]);
  });

  it("should handle multiple file selection", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const file1 = new File(["content1"], "test1.txt", { type: "text/plain" });
    const file2 = new File(["content2"], "test2.txt", { type: "text/plain" });
    render(<FileUpload onChange={handleChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, [file1, file2]);
    expect(handleChange).toHaveBeenCalledWith([file1, file2]);
  });

  it("should append files to existing files in multiple mode", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const existingFile = new File(["existing"], "existing.txt", { type: "text/plain" });
    const newFile = new File(["new"], "new.txt", { type: "text/plain" });
    render(<FileUpload files={[existingFile]} onChange={handleChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, newFile);
    expect(handleChange).toHaveBeenCalledWith([existingFile, newFile]);
  });

  it("should replace files in single file mode", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const existingFile = new File(["existing"], "existing.txt", { type: "text/plain" });
    const newFile = new File(["new"], "new.txt", { type: "text/plain" });
    render(<FileUpload multiple={false} files={[existingFile]} onChange={handleChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, newFile);
    expect(handleChange).toHaveBeenCalledWith([newFile]);
  });

  it("should display file list", () => {
    const files = [
      new File(["content1"], "file1.txt", { type: "text/plain" }),
      new File(["content2"], "file2.txt", { type: "text/plain" }),
    ];
    render(<FileUpload files={files} />);
    expect(screen.getByText("file1.txt")).toBeInTheDocument();
    expect(screen.getByText("file2.txt")).toBeInTheDocument();
  });

  it("should format file size correctly", () => {
    const file = new File(["x".repeat(1024)], "test.txt", { type: "text/plain" });
    render(<FileUpload files={[file]} />);
    expect(screen.getByText(/1 KB/i)).toBeInTheDocument();
  });

  it("should format large file sizes", () => {
    const largeFile = new File(["x".repeat(1024 * 1024)], "large.txt", { type: "text/plain" });
    render(<FileUpload files={[largeFile]} />);
    expect(screen.getByText(/1 MB/i)).toBeInTheDocument();
  });

  it("should handle file removal via onRemove", async () => {
    const handleRemove = vi.fn();
    const user = userEvent.setup();
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    render(<FileUpload files={[file]} onRemove={handleRemove} />);
    const removeButton = screen.getByRole("button", { name: /remove/i });
    await user.click(removeButton);
    expect(handleRemove).toHaveBeenCalledWith(0);
  });

  it("should handle file removal via onChange when onRemove not provided", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const file1 = new File(["content1"], "file1.txt", { type: "text/plain" });
    const file2 = new File(["content2"], "file2.txt", { type: "text/plain" });
    render(<FileUpload files={[file1, file2]} onChange={handleChange} />);
    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    await user.click(removeButtons[0]);
    expect(handleChange).toHaveBeenCalledWith([file2]);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<FileUpload disabled />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it("should not open file dialog when disabled and button clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload disabled />);
    const button = container.querySelector("button");
    if (button) {
      await user.click(button);
      expect(button).toHaveClass("cursor-not-allowed");
    }
  });

  it("should render accept prop information", () => {
    render(<FileUpload accept=".pdf,.doc" />);
    expect(screen.getByText(/Accepted: .pdf,.doc/i)).toBeInTheDocument();
  });

  it("should not show accept info when not provided", () => {
    render(<FileUpload />);
    expect(screen.queryByText(/Accepted:/i)).not.toBeInTheDocument();
  });

  it("should generate unique id", () => {
    render(<FileUpload label="Test" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute("id");
    expect(input.id).toContain("file-upload-");
  });

  it("should set aria-invalid when error exists", () => {
    render(<FileUpload error="Error" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("should set aria-describedby when helper text or error exists", () => {
    const { rerender } = render(<FileUpload helperText="Helper" />);
    let input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute("aria-describedby");

    rerender(<FileUpload error="Error" />);
    input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute("aria-describedby");
  });

  it("should not show remove button when disabled", () => {
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    render(<FileUpload files={[file]} disabled />);
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });

  it("should clear input value after file selection", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    render(<FileUpload onChange={handleChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    expect(input.value).toBe("");
  });
});
