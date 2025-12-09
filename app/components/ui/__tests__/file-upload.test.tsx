import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload } from "../file-upload";

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      uploadFiles: "Upload files",
      uploadFile: "Upload file",
      dragAndDrop: "or drag and drop",
      accepted: "Accepted:",
      remove: "Remove",
    },
  })),
}));

describe("FileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render upload button", () => {
    render(<FileUpload />);
    expect(screen.getByText("Upload files")).toBeInTheDocument();
  });

  it("should render with label", () => {
    render(<FileUpload label="Upload Documents" />);
    expect(screen.getByText("Upload Documents")).toBeInTheDocument();
  });

  it("should render helper text", () => {
    render(<FileUpload helperText="Select files to upload" />);
    expect(screen.getByText("Select files to upload")).toBeInTheDocument();
    expect(screen.getByText("Select files to upload")).toHaveClass("text-gray-500");
  });

  it("should render error message", () => {
    render(<FileUpload error="File is required" />);
    expect(screen.getByText("File is required")).toBeInTheDocument();
    expect(screen.getByText("File is required")).toHaveClass("text-red-500");
  });

  it("should prioritize error over helper text", () => {
    render(<FileUpload error="Error" helperText="Helper" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });

  it("should show upload files text for multiple upload", () => {
    render(<FileUpload multiple />);
    expect(screen.getByText("Upload files")).toBeInTheDocument();
  });

  it("should show upload file text for single upload", () => {
    render(<FileUpload multiple={false} />);
    expect(screen.getByText("Upload file")).toBeInTheDocument();
  });

  it("should accept files when clicked", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const { container } = render(<FileUpload onChange={handleChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    await user.upload(input, file);
    expect(handleChange).toHaveBeenCalled();
  });

  it("should handle multiple file selection", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const file1 = new File(["content1"], "test1.txt", { type: "text/plain" });
    const file2 = new File(["content2"], "test2.txt", { type: "text/plain" });
    const { container } = render(<FileUpload onChange={handleChange} multiple />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    await user.upload(input, [file1, file2]);
    expect(handleChange).toHaveBeenCalled();
    const files = handleChange.mock.calls[0][0];
    expect(files).toHaveLength(2);
  });

  it("should append new files to existing files when multiple is true", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const existingFile = new File(["existing"], "existing.txt", { type: "text/plain" });
    const newFile = new File(["new"], "new.txt", { type: "text/plain" });
    const { container } = render(
      <FileUpload onChange={handleChange} files={[existingFile]} multiple />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    await user.upload(input, newFile);
    expect(handleChange).toHaveBeenCalled();
    const files = handleChange.mock.calls[0][0];
    expect(files).toHaveLength(2);
  });

  it("should replace files when multiple is false", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const existingFile = new File(["existing"], "existing.txt", { type: "text/plain" });
    const newFile = new File(["new"], "new.txt", { type: "text/plain" });
    const { container } = render(
      <FileUpload onChange={handleChange} files={[existingFile]} multiple={false} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    await user.upload(input, newFile);
    expect(handleChange).toHaveBeenCalled();
    const files = handleChange.mock.calls[0][0];
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe("new.txt");
  });

  it("should display uploaded files", () => {
    const files = [
      new File(["content1"], "file1.txt", { type: "text/plain" }),
      new File(["content2"], "file2.pdf", { type: "application/pdf" }),
    ];
    render(<FileUpload files={files} />);
    expect(screen.getByText("file1.txt")).toBeInTheDocument();
    expect(screen.getByText("file2.pdf")).toBeInTheDocument();
  });

  it("should format file size correctly", () => {
    const file = new File(["x".repeat(1024)], "test.txt", { type: "text/plain" });
    render(<FileUpload files={[file]} />);
    expect(screen.getByText(/1 KB/i)).toBeInTheDocument();
  });

  it("should call onRemove when remove button is clicked", async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    render(<FileUpload files={[file]} onRemove={onRemove} />);
    const removeButton = screen.getByRole("button", { name: /remove test.txt/i });
    await user.click(removeButton);
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it("should call onChange with filtered files when remove is clicked without onRemove", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    const files = [
      new File(["content1"], "file1.txt", { type: "text/plain" }),
      new File(["content2"], "file2.txt", { type: "text/plain" }),
    ];
    render(<FileUpload files={files} onChange={handleChange} />);
    const removeButton = screen.getByRole("button", { name: /remove file1.txt/i });
    await user.click(removeButton);
    expect(handleChange).toHaveBeenCalled();
    const remainingFiles = handleChange.mock.calls[0][0];
    expect(remainingFiles).toHaveLength(1);
    expect(remainingFiles[0].name).toBe("file2.txt");
  });

  it("should respect accept prop", () => {
    const { container } = render(<FileUpload accept="image/*" />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input).toHaveAttribute("accept", "image/*");
  });

  it("should display accepted file types", () => {
    render(<FileUpload accept=".pdf,.doc" />);
    expect(screen.getByText(/Accepted: .pdf,.doc/i)).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<FileUpload disabled />);
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it("should not show remove buttons when disabled", () => {
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    render(<FileUpload files={[file]} disabled />);
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });

  it("should not trigger file selection when disabled", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<FileUpload onChange={handleChange} disabled />);
    const uploadButton = screen.getByText("Upload files").closest("button");
    if (uploadButton) {
      await user.click(uploadButton);
      expect(handleChange).not.toHaveBeenCalled();
    }
  });

  it("should have correct aria attributes", () => {
    const { container } = render(<FileUpload error="Error" />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");
  });

  it("should format large file sizes", () => {
    const largeFile = new File(["x".repeat(5 * 1024 * 1024)], "large.txt", { type: "text/plain" });
    render(<FileUpload files={[largeFile]} />);
    expect(screen.getByText(/5 MB/i)).toBeInTheDocument();
  });

  it("should format zero bytes", () => {
    const emptyFile = new File([], "empty.txt", { type: "text/plain" });
    render(<FileUpload files={[emptyFile]} />);
    expect(screen.getByText(/0 Bytes/i)).toBeInTheDocument();
  });
});
