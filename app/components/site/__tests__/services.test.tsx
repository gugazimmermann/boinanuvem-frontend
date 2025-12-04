import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Services } from "../services";
import { SERVICES, FEATURES } from "../constants";
import * as useAutoRotateHook from "../hooks/use-auto-rotate";

vi.mock("../hooks/use-auto-rotate", () => ({
  useAutoRotate: vi.fn(),
}));

describe("Services", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should render heading", () => {
    vi.mocked(useAutoRotateHook.useAutoRotate).mockReturnValue([0, vi.fn()]);

    render(<Services />);
    const headings = screen.getAllByText(/Funcionalidades/);
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getByText(/Completas/)).toBeInTheDocument();
  });

  it("should render all services", () => {
    vi.mocked(useAutoRotateHook.useAutoRotate).mockReturnValue([0, vi.fn()]);

    render(<Services />);

    SERVICES.forEach((service) => {
      expect(screen.getByText(service.title)).toBeInTheDocument();
      expect(screen.getByText(service.content)).toBeInTheDocument();
    });
  });

  it("should highlight active service", () => {
    vi.mocked(useAutoRotateHook.useAutoRotate).mockReturnValue([1, vi.fn()]);

    const { container } = render(<Services />);
    const activeService = container.querySelector(".border-l-4.border-primary");
    expect(activeService).toBeInTheDocument();
  });

  it("should switch active service when clicked", async () => {
    const mockSetActiveTab = vi.fn();
    vi.mocked(useAutoRotateHook.useAutoRotate).mockReturnValue([0, mockSetActiveTab]);

    render(<Services />);

    const secondServiceButtons = screen.getAllByText(SERVICES[1].title);
    const secondService = secondServiceButtons[0].closest("button");
    if (secondService) {
      secondService.click();
      expect(mockSetActiveTab).toHaveBeenCalledWith(1);
    }
  }, 10000);

  it("should render features section", () => {
    vi.mocked(useAutoRotateHook.useAutoRotate).mockReturnValue([0, vi.fn()]);

    render(<Services />);
    expect(screen.getByText(/Por que/)).toBeInTheDocument();
    expect(screen.getByText(/Escolher/)).toBeInTheDocument();
  });

  it("should render all features", () => {
    vi.mocked(useAutoRotateHook.useAutoRotate).mockReturnValue([0, vi.fn()]);

    render(<Services />);

    FEATURES.forEach((feature) => {
      const titles = screen.getAllByText(feature.title);
      const badges = screen.getAllByText(feature.badge);
      expect(titles.length).toBeGreaterThan(0);
      expect(screen.getByText(feature.content)).toBeInTheDocument();
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("should render image for first service", () => {
    vi.mocked(useAutoRotateHook.useAutoRotate).mockReturnValue([0, vi.fn()]);

    const { container } = render(<Services />);
    const image = container.querySelector('img[alt="Gestão de Propriedades e Pastos"]');
    expect(image).toBeInTheDocument();
  });

  it("should render placeholder for other services", () => {
    vi.mocked(useAutoRotateHook.useAutoRotate).mockReturnValue([1, vi.fn()]);

    const { container } = render(<Services />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
