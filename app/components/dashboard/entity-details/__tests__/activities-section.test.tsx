import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivitiesSection } from "../activities-section";

describe("ActivitiesSection", () => {
  const mockActivities = [
    { icon: "🐄", title: "Activity 1", description: "Description 1" },
    { icon: "📊", title: "Activity 2", description: "Description 2" },
    { icon: "💰", title: "Activity 3", description: "Description 3" },
  ];

  it("should render title", () => {
    render(<ActivitiesSection title="Activities" activities={mockActivities} />);
    expect(screen.getByText("Activities")).toBeInTheDocument();
  });

  it("should render all activities", () => {
    render(<ActivitiesSection title="Activities" activities={mockActivities} />);
    expect(screen.getByText("Activity 1")).toBeInTheDocument();
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Activity 2")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
    expect(screen.getByText("Activity 3")).toBeInTheDocument();
    expect(screen.getByText("Description 3")).toBeInTheDocument();
  });

  it("should render activity icons", () => {
    render(<ActivitiesSection title="Activities" activities={mockActivities} />);
    expect(screen.getByText("🐄")).toBeInTheDocument();
    expect(screen.getByText("📊")).toBeInTheDocument();
    expect(screen.getByText("💰")).toBeInTheDocument();
  });

  it("should not show border on last activity", () => {
    const { container } = render(
      <ActivitiesSection title="Activities" activities={mockActivities} />
    );
    const activities = container.querySelectorAll('[class*="border-b"]');
    // Last activity should not have border
    expect(activities.length).toBe(mockActivities.length - 1);
  });

  it("should render empty activities array", () => {
    render(<ActivitiesSection title="Activities" activities={[]} />);
    expect(screen.getByText("Activities")).toBeInTheDocument();
  });

  it("should render single activity without border", () => {
    const singleActivity = [mockActivities[0]];
    const { container } = render(
      <ActivitiesSection title="Activities" activities={singleActivity} />
    );
    const activities = container.querySelectorAll('[class*="border-b"]');
    expect(activities.length).toBe(0);
  });
});
