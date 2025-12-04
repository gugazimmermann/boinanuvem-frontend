import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivitiesSection, type Activity } from "../activities-section";

describe("ActivitiesSection", () => {
  const mockActivities: Activity[] = [
    { icon: "🐄", title: "Animal Registered", description: "New animal added" },
    { icon: "👶", title: "Birth Recorded", description: "New birth registered" },
    { icon: "⚖️", title: "Weighing Done", description: "Animal weighed" },
  ];

  it("should render title", () => {
    render(<ActivitiesSection title="Recent Activities" activities={[]} />);
    expect(screen.getByText("Recent Activities")).toBeInTheDocument();
  });

  it("should render activities", () => {
    render(<ActivitiesSection title="Activities" activities={mockActivities} />);
    expect(screen.getByText("Animal Registered")).toBeInTheDocument();
    expect(screen.getByText("Birth Recorded")).toBeInTheDocument();
    expect(screen.getByText("Weighing Done")).toBeInTheDocument();
  });

  it("should render activity descriptions", () => {
    render(<ActivitiesSection title="Activities" activities={mockActivities} />);
    expect(screen.getByText("New animal added")).toBeInTheDocument();
    expect(screen.getByText("New birth registered")).toBeInTheDocument();
    expect(screen.getByText("Animal weighed")).toBeInTheDocument();
  });

  it("should render activity icons", () => {
    render(<ActivitiesSection title="Activities" activities={mockActivities} />);
    expect(screen.getByText("🐄")).toBeInTheDocument();
    expect(screen.getByText("👶")).toBeInTheDocument();
    expect(screen.getByText("⚖️")).toBeInTheDocument();
  });

  it("should not render border on last activity", () => {
    const { container } = render(
      <ActivitiesSection title="Activities" activities={mockActivities} />
    );
    const activityDivs = container.querySelectorAll(".space-y-3 > div");
    const lastActivity = activityDivs[activityDivs.length - 1];
    expect(lastActivity).not.toHaveClass("border-b");
  });

  it("should render border on non-last activities", () => {
    const { container } = render(
      <ActivitiesSection title="Activities" activities={mockActivities} />
    );
    const activityDivs = container.querySelectorAll(".space-y-3 > div");
    expect(activityDivs[0]).toHaveClass("border-b");
    expect(activityDivs[1]).toHaveClass("border-b");
  });

  it("should render empty state when no activities", () => {
    render(<ActivitiesSection title="Activities" activities={[]} />);
    expect(screen.getByText("Activities")).toBeInTheDocument();
    expect(screen.queryByText("Animal Registered")).not.toBeInTheDocument();
  });

  it("should render with correct styling classes", () => {
    const { container } = render(
      <ActivitiesSection title="Activities" activities={mockActivities} />
    );
    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass("bg-white");
    expect(section).toHaveClass("dark:bg-gray-800");
    expect(section).toHaveClass("rounded-lg");
  });
});
