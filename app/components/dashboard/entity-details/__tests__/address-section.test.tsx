import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AddressSection } from "../address-section";

describe("AddressSection", () => {
  const defaultTranslationKeys = {
    street: "Street",
    complement: "Complement",
    neighborhood: "Neighborhood",
    cityState: "City/State",
    zipCode: "Zip Code",
  };

  it("should return null when no street and no city", () => {
    const { container } = render(<AddressSection translationKeys={defaultTranslationKeys} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render when street is provided", () => {
    render(<AddressSection street="Main Street" translationKeys={defaultTranslationKeys} />);
    expect(screen.getByText("Main Street")).toBeInTheDocument();
  });

  it("should render when city is provided", () => {
    render(<AddressSection city="São Paulo" translationKeys={defaultTranslationKeys} />);
    expect(screen.getByText("São Paulo")).toBeInTheDocument();
  });

  it("should render street with number", () => {
    render(
      <AddressSection street="Main Street" number="123" translationKeys={defaultTranslationKeys} />
    );
    expect(screen.getByText(/Main Street, 123/)).toBeInTheDocument();
  });

  it("should render complement when provided", () => {
    render(
      <AddressSection
        street="Main Street"
        complement="Apt 4B"
        translationKeys={defaultTranslationKeys}
      />
    );
    expect(screen.getByText("Apt 4B")).toBeInTheDocument();
  });

  it("should render neighborhood when provided", () => {
    render(
      <AddressSection
        street="Main Street"
        neighborhood="Downtown"
        translationKeys={defaultTranslationKeys}
      />
    );
    expect(screen.getByText("Downtown")).toBeInTheDocument();
  });

  it("should render city and state together", () => {
    render(<AddressSection city="São Paulo" state="SP" translationKeys={defaultTranslationKeys} />);
    expect(screen.getByText(/São Paulo/)).toBeInTheDocument();
    expect(screen.getByText(/SP/)).toBeInTheDocument();
  });

  it("should render zip code when provided", () => {
    render(
      <AddressSection
        street="Main Street"
        zipCode="12345-678"
        translationKeys={defaultTranslationKeys}
      />
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
        translationKeys={defaultTranslationKeys}
      />
    );

    expect(screen.getByText(/Main Street, 123/)).toBeInTheDocument();
    expect(screen.getByText("Apt 4B")).toBeInTheDocument();
    expect(screen.getByText("Downtown")).toBeInTheDocument();
    expect(screen.getByText(/São Paulo/)).toBeInTheDocument();
    expect(screen.getByText("12345-678")).toBeInTheDocument();
  });
});
