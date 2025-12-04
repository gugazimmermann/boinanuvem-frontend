import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AddressSection } from "../address-section";

describe("AddressSection", () => {
  const translationKeys = {
    street: "Street",
    complement: "Complement",
    neighborhood: "Neighborhood",
    cityState: "City/State",
    zipCode: "Zip Code",
  };

  it("should return null when no street and no city", () => {
    const { container } = render(<AddressSection translationKeys={translationKeys} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render when street is provided", () => {
    render(<AddressSection street="Main Street" translationKeys={translationKeys} />);
    expect(screen.getByText("Main Street")).toBeInTheDocument();
  });

  it("should render when city is provided", () => {
    render(<AddressSection city="São Paulo" translationKeys={translationKeys} />);
    expect(screen.getByText("São Paulo")).toBeInTheDocument();
  });

  it("should render street with number", () => {
    render(<AddressSection street="Main Street" number="123" translationKeys={translationKeys} />);
    expect(screen.getByText(/Main Street.*123/)).toBeInTheDocument();
  });

  it("should render street without number", () => {
    render(<AddressSection street="Main Street" translationKeys={translationKeys} />);
    expect(screen.getByText("Main Street")).toBeInTheDocument();
  });

  it("should render complement", () => {
    render(
      <AddressSection street="Main Street" complement="Apt 4B" translationKeys={translationKeys} />
    );
    expect(screen.getByText("Apt 4B")).toBeInTheDocument();
  });

  it("should render neighborhood", () => {
    render(
      <AddressSection
        street="Main Street"
        neighborhood="Downtown"
        translationKeys={translationKeys}
      />
    );
    expect(screen.getByText("Downtown")).toBeInTheDocument();
  });

  it("should render city and state", () => {
    render(
      <AddressSection
        street="Main Street"
        city="São Paulo"
        state="SP"
        translationKeys={translationKeys}
      />
    );
    expect(screen.getByText(/São Paulo.*SP/)).toBeInTheDocument();
  });

  it("should render city without state", () => {
    render(
      <AddressSection street="Main Street" city="São Paulo" translationKeys={translationKeys} />
    );
    expect(screen.getByText("São Paulo")).toBeInTheDocument();
  });

  it("should render state without city", () => {
    render(<AddressSection street="Main Street" state="SP" translationKeys={translationKeys} />);
    expect(screen.getByText("SP")).toBeInTheDocument();
  });

  it("should render zip code", () => {
    render(
      <AddressSection street="Main Street" zipCode="12345-678" translationKeys={translationKeys} />
    );
    expect(screen.getByText("12345-678")).toBeInTheDocument();
  });

  it("should render all address fields", () => {
    render(
      <AddressSection
        street="Main Street"
        number="123"
        complement="Apt 4B"
        neighborhood="Downtown"
        city="São Paulo"
        state="SP"
        zipCode="12345-678"
        translationKeys={translationKeys}
      />
    );
    expect(screen.getByText(/Main Street.*123/)).toBeInTheDocument();
    expect(screen.getByText("Apt 4B")).toBeInTheDocument();
    expect(screen.getByText("Downtown")).toBeInTheDocument();
    expect(screen.getByText(/São Paulo.*SP/)).toBeInTheDocument();
    expect(screen.getByText("12345-678")).toBeInTheDocument();
  });

  it("should render with correct styling classes", () => {
    const { container } = render(
      <AddressSection street="Main Street" translationKeys={translationKeys} />
    );
    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass("bg-white");
    expect(section).toHaveClass("dark:bg-gray-800");
    expect(section).toHaveClass("rounded-lg");
  });
});
