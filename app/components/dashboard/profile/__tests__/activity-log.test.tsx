import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivityLog } from "../activity-log";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import type { ActivityLogEntry } from "../activity-log";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </ThemeProvider>
);

describe("ActivityLog", () => {
  const mockLogs: ActivityLogEntry[] = [
    {
      id: "1",
      action: "CREATE",
      resource: "Property: Test Property",
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      action: "UPDATE",
      resource: "Animal: #1001",
      timestamp: new Date().toISOString(),
      user: "John Doe",
    },
  ];

  it("should render activity log table", () => {
    render(<ActivityLog logs={mockLogs} />, { wrapper });
    expect(screen.getByText("CREATE")).toBeInTheDocument();
    expect(screen.getByText("UPDATE")).toBeInTheDocument();
  });

  it("should show user column when showUser is true", () => {
    render(<ActivityLog logs={mockLogs} showUser={true} />, { wrapper });
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should not show user column when showUser is false", () => {
    render(<ActivityLog logs={mockLogs} showUser={false} />, { wrapper });
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.queryByText(/user|usuário/i)).not.toBeInTheDocument();
  });

  it("should handle search", async () => {
    const user = userEvent.setup();
    render(<ActivityLog logs={mockLogs} />, { wrapper });

    const searchInput = screen.getByPlaceholderText(/search|buscar/i);
    await user.type(searchInput, "CREATE");

    expect(screen.getByText("CREATE")).toBeInTheDocument();
  });

  it("should paginate results", () => {
    const manyLogs: ActivityLogEntry[] = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      action: "CREATE",
      resource: `Resource ${i + 1}`,
      timestamp: new Date().toISOString(),
    }));

    render(<ActivityLog logs={manyLogs} />, { wrapper });
    const pagination = screen.getByText(/anterior|previous/i);
    expect(pagination).toBeInTheDocument();
  });
});
