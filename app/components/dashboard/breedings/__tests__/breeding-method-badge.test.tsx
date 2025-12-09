import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BreedingMethodBadge } from "../breeding-method-badge";
import { useTranslation } from "~/i18n";
import { getBreedingMethodLabel } from "~/utils/breeding";
import type { BreedingMethod } from "~/types";

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(),
}));

vi.mock("~/utils/breeding", () => ({
  getBreedingMethodLabel: vi.fn(),
}));

describe("BreedingMethodBadge", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockGetBreedingMethodLabel = vi.mocked(getBreedingMethodLabel);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({} as unknown as ReturnType<typeof useTranslation>);
    mockGetBreedingMethodLabel.mockReturnValue("Natural Breeding");
  });

  it("should render breeding method label", () => {
    render(<BreedingMethodBadge method={"natural" as BreedingMethod} />);
    expect(screen.getByText("Natural Breeding")).toBeInTheDocument();
  });

  it("should call getBreedingMethodLabel with correct parameters", () => {
    const mockTranslation = {} as ReturnType<typeof useTranslation>;
    mockUseTranslation.mockReturnValue(mockTranslation);
    render(<BreedingMethodBadge method={"natural" as BreedingMethod} />);

    expect(mockGetBreedingMethodLabel).toHaveBeenCalledWith("natural", mockTranslation);
  });

  it("should apply custom className", () => {
    const { container } = render(
      <BreedingMethodBadge method={"natural" as BreedingMethod} className="custom-class" />
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("custom-class");
  });

  it("should have default text color classes", () => {
    const { container } = render(<BreedingMethodBadge method={"natural" as BreedingMethod} />);
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-gray-700", "dark:text-gray-300");
  });
});
