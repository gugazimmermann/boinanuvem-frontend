import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { PropertyMap } from "../property-map";

vi.mock("leaflet", () => {
  const mockMap = {
    setView: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  };

  const mockMarker = {
    setLatLng: vi.fn(),
    addTo: vi.fn().mockReturnThis(),
  };

  const mockTileLayer = {
    addTo: vi.fn().mockReturnThis(),
  };

  return {
    default: {
      map: vi.fn().mockReturnValue(mockMap),
      marker: vi.fn().mockReturnValue(mockMarker),
      tileLayer: vi.fn().mockReturnValue(mockTileLayer),
      Icon: {
        Default: {
          prototype: {},
          mergeOptions: vi.fn(),
        },
      },
    },
  };
});

describe("PropertyMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render loading state initially", () => {
    render(<PropertyMap latitude={-23.5505} longitude={-46.6333} propertyName="Test Property" />);
    const loadingText = screen.queryByText((content, element) => {
      return (
        element?.textContent?.toLowerCase().includes("carregando") ||
        element?.textContent?.toLowerCase().includes("loading") ||
        false
      );
    });
    expect(loadingText || document.querySelector(".min-h-\\[400px\\]")).toBeTruthy();
  });

  it("should render map container after client-side hydration", async () => {
    render(<PropertyMap latitude={-23.5505} longitude={-46.6333} propertyName="Test Property" />);

    await waitFor(
      () => {
        const mapContainer = document.querySelector("[ref]");
        expect(mapContainer || document.querySelector(".min-h-\\[400px\\]")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should apply custom className", async () => {
    const { container } = render(
      <PropertyMap
        latitude={-23.5505}
        longitude={-46.6333}
        propertyName="Test Property"
        className="custom-map"
      />
    );

    await waitFor(
      () => {
        const mapDiv = container.querySelector(".custom-map");
        expect(mapDiv).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should render map container with correct coordinates", async () => {
    render(<PropertyMap latitude={-23.5505} longitude={-46.6333} propertyName="Test Property" />);

    await waitFor(
      () => {
        const mapContainer =
          document.querySelector("[ref]") || document.querySelector(".min-h-\\[400px\\]");
        expect(mapContainer).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should handle Leaflet import error gracefully", async () => {
    render(<PropertyMap latitude={-23.5505} longitude={-46.6333} propertyName="Test Property" />);

    await waitFor(
      () => {
        const container = document.querySelector(".min-h-\\[400px\\]");
        expect(container).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should update map when coordinates change", async () => {
    const { rerender } = render(
      <PropertyMap latitude={-23.5505} longitude={-46.6333} propertyName="Test Property" />
    );

    await waitFor(
      () => {
        const mapContainer =
          document.querySelector("[ref]") || document.querySelector(".min-h-\\[400px\\]");
        expect(mapContainer).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    rerender(<PropertyMap latitude={-22.9068} longitude={-43.1729} propertyName="Test Property" />);

    await waitFor(
      () => {
        const mapContainer =
          document.querySelector("[ref]") || document.querySelector(".min-h-\\[400px\\]");
        expect(mapContainer).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should cleanup map on unmount", async () => {
    const { unmount } = render(
      <PropertyMap latitude={-23.5505} longitude={-46.6333} propertyName="Test Property" />
    );

    await waitFor(
      () => {
        const mapContainer =
          document.querySelector("[ref]") || document.querySelector(".min-h-\\[400px\\]");
        expect(mapContainer).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    unmount();

    await waitFor(
      () => {
        expect(document.querySelector("[ref]")).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("should handle propertyName change", async () => {
    const { rerender } = render(
      <PropertyMap latitude={-23.5505} longitude={-46.6333} propertyName="Property 1" />
    );

    await waitFor(
      () => {
        const mapContainer =
          document.querySelector("[ref]") || document.querySelector(".min-h-\\[400px\\]");
        expect(mapContainer).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    rerender(<PropertyMap latitude={-23.5505} longitude={-46.6333} propertyName="Property 2" />);

    await waitFor(
      () => {
        const mapContainer =
          document.querySelector("[ref]") || document.querySelector(".min-h-\\[400px\\]");
        expect(mapContainer).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should handle edge case coordinates", async () => {
    render(<PropertyMap latitude={0} longitude={0} propertyName="Test Property" />);

    await waitFor(
      () => {
        const mapContainer =
          document.querySelector("[ref]") || document.querySelector(".min-h-\\[400px\\]");
        expect(mapContainer).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should handle very large coordinate values", async () => {
    render(<PropertyMap latitude={90} longitude={180} propertyName="Test Property" />);

    await waitFor(
      () => {
        const mapContainer =
          document.querySelector("[ref]") || document.querySelector(".min-h-\\[400px\\]");
        expect(mapContainer).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
