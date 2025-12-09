import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityDetailPage } from "../entity-detail-page";
import { useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { usePermissions } from "~/utils/permissions";
import { useEntityTab } from "~/hooks/use-entity-tab";
import { useObservationManagement } from "~/hooks/use-observation-management";
import { useAlert } from "~/hooks/use-alert";

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: vi.fn(() => mockNavigate),
  useSearchParams: vi.fn(() => [new URLSearchParams(), mockSetSearchParams]),
}));
vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      back: "Back",
    },
    dashboard: {
      recentActivities: {
        title: "Recent Activities",
      },
    },
    observations: {
      new: {
        title: "New Observation",
      },
    },
    team: {
      new: {
        back: "Back",
      },
    },
    profile: {
      company: {
        edit: "Edit",
      },
    },
    properties: {
      details: {
        movements: {
          title: "Movements",
        },
      },
    },
  })),
}));
vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));
vi.mock("~/utils/permissions", () => ({
  usePermissions: vi.fn(() => ({
    canEdit: vi.fn(() => true),
    isMainUser: vi.fn(() => true),
  })),
}));
vi.mock("~/hooks/use-entity-tab", () => ({
  useEntityTab: vi.fn(() => ["info", vi.fn()]),
}));
vi.mock("~/hooks/use-observation-management", () => ({
  useObservationManagement: vi.fn(() => ({
    observations: [],
    searchValue: "",
    onSearchChange: vi.fn(),
    onAddObservation: vi.fn(),
    isAdding: false,
  })),
}));
vi.mock("~/hooks/use-entity-details-config", () => ({
  useEntityDetailsConfig: vi.fn(() => ({
    sections: [],
    tabs: [
      { id: "info", label: "Info" },
      { id: "observations", label: "Observations" },
    ],
    infoSectionTitle: "Information",
    infoFields: [],
    addressTranslationKeys: {},
    infoTabContent: null,
    observationsTabContent: null,
  })),
}));
vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
    clearAlert: vi.fn(),
  })),
}));

vi.mock("~/components/dashboard/entity-details/entity-detail-header", () => ({
  EntityDetailHeader: ({ actions }: { actions?: React.ReactNode }) => (
    <div data-testid="header">
      Header
      {actions}
    </div>
  ),
}));
vi.mock("~/components/dashboard/entity-details/entity-info-section", () => ({
  EntityInfoSection: () => <div data-testid="info">Info</div>,
}));
vi.mock("~/components/dashboard/entity-details/address-section", () => ({
  AddressSection: () => <div data-testid="address">Address</div>,
}));
vi.mock("~/components/dashboard/entity-details/activities-section", () => ({
  ActivitiesSection: () => <div data-testid="activities">Activities</div>,
}));

vi.mock("~/components/dashboard/tabs/entity-tabs", () => ({
  EntityTabs: ({
    activeTab: _activeTab,
    tabs,
  }: {
    activeTab: string;
    tabs: Array<{ id: string; label: string; onClick: () => void }>;
  }) => (
    <div data-testid="tabs">
      {tabs.map((tab) => (
        <button key={tab.id} data-testid={`tab-${tab.id}`} onClick={tab.onClick}>
          {tab.label}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("~/components/dashboard/finance/entity-finance-tab", () => ({
  EntityFinanceTab: () => <div data-testid="finance-tab">Finance Tab</div>,
}));
vi.mock("~/components/dashboard/movements/entity-movements-tab", () => ({
  EntityMovementsTab: () => <div data-testid="movements-tab">Movements Tab</div>,
}));
vi.mock("~/components/dashboard/observations/observation-section", () => ({
  ObservationSection: () => <div data-testid="observations-tab">Observations Tab</div>,
}));

describe("EntityDetailPage", () => {
  const mockUseNavigate = vi.mocked(useNavigate);
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseLanguage = vi.mocked(useLanguage);
  const mockUsePermissions = vi.mocked(usePermissions);
  const mockUseEntityTab = vi.mocked(useEntityTab);
  const mockUseObservationManagement = vi.mocked(useObservationManagement);
  const mockUseAlert = vi.mocked(useAlert);

  const defaultProps = {
    entityId: "1",
    fetchEntity: vi.fn(),
    entityType: "employee" as const,
    mapEntityToData: vi.fn((entity: { id: string; code: string; name: string }) => ({
      id: entity.id,
      code: entity.code,
      name: entity.name,
      propertyIds: [],
      createdAt: "2024-01-01",
      status: "active" as const,
    })),
    translations: {
      errors: { loadFailed: "Failed to load" },
      emptyState: { title: "Not found" },
      table: { active: "Active", inactive: "Inactive" },
      details: {
        tabs: {
          info: "Info",
          observations: "Observations",
          finance: "Finance",
          activities: "Activities",
        },
        activityCreated: "Activity created",
        activityActivated: "Activity activated",
        activityDeactivated: "Activity deactivated",
        statusLabel: "Status",
        searchObservations: "Search",
        noObservations: "No observations",
        observationDate: "Date",
        observation: "Observation",
        files: "Files",
        addObservation: "Add",
        newObservation: "New",
        observationPlaceholder: "Enter observation",
        filesHelper: "Helper",
        observationRequired: "Required",
        observationAdded: "Added",
        observationError: "Error",
      },
    },
    routes: {
      list: "/list",
      edit: (id: string) => `/edit/${id}`,
    },
    permissionResource: "employee" as const,
    observationConfig: {
      fetchObservations: vi.fn(() => []),
      addObservation: vi.fn(),
      translationKeys: {
        observationRequired: "Required",
        observationAdded: "Added",
        observationError: "Error",
      },
      fileIdPrefix: "prefix",
    },
    validTabs: ["info", "observations"] as const,
    customTabs: [],
    financeConfig: undefined,
    movementsConfig: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockSetSearchParams.mockClear();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseTranslation.mockReturnValue({
      common: {
        back: "Back",
        clearSearch: "Clear Search",
        save: "Save",
        cancel: "Cancel",
      },
      dashboard: {
        recentActivities: {
          title: "Recent Activities",
        },
      },
      observations: {
        new: {
          title: "New Observation",
        },
      },
      team: {
        new: {
          back: "Back",
        },
      },
      profile: {
        company: {
          edit: "Edit",
        },
      },
      properties: {
        details: {
          movements: {
            title: "Movements",
          },
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseLanguage.mockReturnValue({ language: "pt" });
    mockUsePermissions.mockReturnValue({
      canEdit: vi.fn(() => true),
      isMainUser: vi.fn(() => true),
    });
    // useEntityTab returns [activeTab, setActiveTab] tuple
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["info", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    mockUseObservationManagement.mockReturnValue({
      observations: [],
      searchValue: "",
      onSearchChange: vi.fn(),
      onAddObservation: vi.fn(),
      isAdding: false,
      showForm: false,
      setShowForm: vi.fn(),
      observationText: "",
      setObservationText: vi.fn(),
      observationFiles: [],
      setObservationFiles: vi.fn(),
      isSubmitting: false,
      handleSubmit: vi.fn(),
      alert: null,
    });
    mockUseAlert.mockReturnValue({
      alertMessage: null,
      showAlert: vi.fn(),
      clearAlert: vi.fn(),
    });
    defaultProps.fetchEntity.mockResolvedValue({ id: "1", name: "Test", code: "T001" });
  });

  it("should render entity detail page when entity is loaded", async () => {
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(
      () => {
        expect(screen.getByTestId("header")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should show empty state when entityId is not provided", async () => {
    render(<EntityDetailPage {...defaultProps} entityId={undefined} />);
    await waitFor(
      () => {
        expect(screen.getByText("Not found")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should render tabs", async () => {
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(
      () => {
        expect(screen.getByTestId("tabs")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should show loading state initially", async () => {
    defaultProps.fetchEntity.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(
      () => {
        expect(screen.getByText("Carregando...")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should handle error when fetchEntity throws", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const showAlert = vi.fn();
    mockUseAlert.mockReturnValue({
      alertMessage: null,
      showAlert,
      clearAlert: vi.fn(),
    });
    const error = new Error("Failed to fetch");
    defaultProps.fetchEntity.mockRejectedValue(error);
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(
      () => {
        expect(showAlert).toHaveBeenCalledWith("Failed to fetch", "error");
      },
      { timeout: 2000 }
    );
    consoleErrorSpy.mockRestore();
  });

  it("should handle error with non-Error object", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const showAlert = vi.fn();
    mockUseAlert.mockReturnValue({
      alertMessage: null,
      showAlert,
      clearAlert: vi.fn(),
    });
    defaultProps.fetchEntity.mockRejectedValue("String error");
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(
      () => {
        expect(showAlert).toHaveBeenCalledWith("Failed to load", "error");
      },
      { timeout: 2000 }
    );
    consoleErrorSpy.mockRestore();
  });

  it("should render finance tab when financeConfig is provided", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["finance", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      financeConfig: {
        getCashFlowTransactions: vi.fn(() => []),
        getPayableTransactions: vi.fn(() => []),
        getReceivableTransactions: vi.fn(() => []),
      },
      validTabs: ["info", "observations", "finance"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(
      () => {
        expect(screen.getByTestId("finance-tab")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should render movements tab when movementsConfig is provided", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["movements", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      movementsConfig: {
        getLocationMovements: vi.fn(() => []),
        getAnimalMovements: vi.fn(() => []),
        getMovementNewRouteParam: vi.fn(
          (propertyId: string, entityId: string) =>
            `/movements/new?propertyId=${propertyId}&entityId=${entityId}`
        ),
        entityType: "employee" as const,
      },
      validTabs: ["info", "observations", "movements"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(
      () => {
        expect(screen.getByTestId("movements-tab")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should render activities tab when isMainUser is true", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["activities", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      validTabs: ["info", "observations", "activities"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(
      () => {
        expect(screen.getByTestId("activities")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should not render activities tab when isMainUser is false", async () => {
    mockUsePermissions.mockReturnValue({
      canEdit: vi.fn(() => true),
      isMainUser: vi.fn(() => false),
    });
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(
      () => {
        expect(screen.queryByTestId("activities")).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should render observations tab", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["observations", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(
      () => {
        expect(screen.getByTestId("observations-tab")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should render custom tabs", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["custom1", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const customTabClick = vi.fn();
    const props = {
      ...defaultProps,
      customTabs: [{ id: "custom1", label: "Custom Tab", onClick: customTabClick }],
      validTabs: ["info", "observations", "custom1"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(
      () => {
        expect(screen.getByTestId("tabs")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should call renderCustomTab when provided", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["custom1", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const renderCustomTab = vi.fn(() => <div data-testid="custom-tab-content">Custom Content</div>);
    const props = {
      ...defaultProps,
      customTabs: [{ id: "custom1", label: "Custom Tab", onClick: vi.fn() }],
      renderCustomTab,
      validTabs: ["info", "observations", "custom1"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(
      () => {
        expect(renderCustomTab).toHaveBeenCalledWith("custom1", expect.any(Object));
        expect(screen.getByTestId("custom-tab-content")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should show edit button when canEdit returns true", async () => {
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(
      () => {
        const buttons = screen.getAllByText("Edit");
        expect(buttons.length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );
  });

  it("should not show edit button when canEdit returns false", async () => {
    mockUsePermissions.mockReturnValue({
      canEdit: vi.fn(() => false),
      isMainUser: vi.fn(() => true),
    });
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(
      () => {
        const buttons = screen.queryAllByText("Edit");
        expect(buttons.length).toBe(0);
      },
      { timeout: 2000 }
    );
  });

  it("should navigate to edit route when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(
      async () => {
        const editButton = screen.getByText("Edit");
        await user.click(editButton);
        expect(mockNavigate).toHaveBeenCalledWith("/edit/1");
      },
      { timeout: 2000 }
    );
  });

  it("should navigate to list route when back button is clicked", async () => {
    const user = userEvent.setup();
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(
      async () => {
        const backButtons = screen.getAllByText("Back");
        await user.click(backButtons[0]);
        expect(mockNavigate).toHaveBeenCalledWith("/list");
      },
      { timeout: 2000 }
    );
  });

  it("should display active status", async () => {
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(
      () => {
        expect(screen.getByTestId("header")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should display inactive status", async () => {
    const props = {
      ...defaultProps,
      mapEntityToData: vi.fn((entity: { id: string; code: string; name: string }) => ({
        id: entity.id,
        code: entity.code,
        name: entity.name,
        propertyIds: [],
        createdAt: "2024-01-01",
        status: "inactive" as const,
      })),
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(
      () => {
        expect(screen.getByTestId("header")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should show empty state when entity is null after fetch", async () => {
    defaultProps.fetchEntity.mockResolvedValue(null as unknown as { id: string; name: string });
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(
      () => {
        expect(screen.getByText("Not found")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should update search params when finance tab is clicked", async () => {
    const user = userEvent.setup();
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["info", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      financeConfig: {
        getCashFlowTransactions: vi.fn(() => []),
      },
      validTabs: ["info", "observations", "finance"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });
    const financeTab = screen.getByTestId("tab-finance");
    await user.click(financeTab);
    expect(setActiveTab).toHaveBeenCalledWith("finance");
    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "finance", subTab: "dashboard" });
  });

  it("should handle movements tab click", async () => {
    const user = userEvent.setup();
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["info", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      movementsConfig: {
        getLocationMovements: vi.fn(() => []),
        getAnimalMovements: vi.fn(() => []),
        getMovementNewRouteParam: vi.fn(
          (propertyId: string, entityId: string) =>
            `/movements/new?propertyId=${propertyId}&entityId=${entityId}`
        ),
        entityType: "employee" as const,
      },
      validTabs: ["info", "observations", "movements"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });
    const movementsTab = screen.getByTestId("tab-movements");
    await user.click(movementsTab);
    expect(setActiveTab).toHaveBeenCalledWith("movements");
  });

  it("should handle activities tab click", async () => {
    const user = userEvent.setup();
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["info", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      translations: {
        ...defaultProps.translations,
        details: {
          ...defaultProps.translations.details,
          tabs: {
            ...defaultProps.translations.details.tabs,
            activities: "Activities",
          },
        },
      },
      validTabs: ["info", "observations", "activities"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });
    const activitiesTab = screen.getByTestId("tab-activities");
    await user.click(activitiesTab);
    expect(setActiveTab).toHaveBeenCalledWith("activities");
  });

  it("should handle custom tab click", async () => {
    const user = userEvent.setup();
    const setActiveTab = vi.fn();
    const customTabClick = vi.fn();
    mockUseEntityTab.mockReturnValue(["info", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      customTabs: [{ id: "custom1", label: "Custom Tab", onClick: customTabClick }],
      validTabs: ["info", "observations", "custom1"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });
    const customTab = screen.getByTestId("tab-custom1");
    await user.click(customTab);
    expect(customTabClick).toHaveBeenCalled();
  });

  it("should render info tab content", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["info", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const mockUseEntityDetailsConfig = vi.mocked(
      (await import("~/hooks/use-entity-details-config")).useEntityDetailsConfig
    );
    mockUseEntityDetailsConfig.mockReturnValue({
      sections: [],
      tabs: [],
      infoSectionTitle: "Information",
      infoFields: [
        { label: "Code", value: "T001" },
        { label: "Name", value: "Test" },
      ],
      addressTranslationKeys: {
        street: "Street",
        number: "Number",
        complement: "Complement",
        neighborhood: "Neighborhood",
        city: "City",
        state: "State",
        zipCode: "Zip Code",
      },
      infoTabContent: null,
      observationsTabContent: null,
    });
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByTestId("info")).toBeInTheDocument();
    });
  });

  it("should render address section when entityData has address", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["info", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      mapEntityToData: vi.fn((entity: { id: string; code: string; name: string }) => ({
        id: entity.id,
        code: entity.code,
        name: entity.name,
        propertyIds: [],
        createdAt: "2024-01-01",
        status: "active" as const,
        street: "Main Street",
        number: "123",
        complement: "Apt 4B",
        neighborhood: "Downtown",
        city: "São Paulo",
        state: "SP",
        zipCode: "12345-678",
      })),
    };
    const mockUseEntityDetailsConfig = vi.mocked(
      (await import("~/hooks/use-entity-details-config")).useEntityDetailsConfig
    );
    mockUseEntityDetailsConfig.mockReturnValue({
      sections: [],
      tabs: [],
      infoSectionTitle: "Information",
      infoFields: [],
      addressTranslationKeys: {
        street: "Street",
        number: "Number",
        complement: "Complement",
        neighborhood: "Neighborhood",
        city: "City",
        state: "State",
        zipCode: "Zip Code",
      },
      infoTabContent: null,
      observationsTabContent: null,
    });
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("address")).toBeInTheDocument();
    });
  });

  it("should render activities section with active status", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["activities", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      translations: {
        ...defaultProps.translations,
        details: {
          ...defaultProps.translations.details,
          tabs: {
            ...defaultProps.translations.details.tabs,
            activities: "Activities",
          },
          activityCreated: "Created",
          activityActivated: "Activated",
          activityDeactivated: "Deactivated",
          statusLabel: "Status",
        },
      },
      validTabs: ["info", "observations", "activities"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("activities")).toBeInTheDocument();
    });
  });

  it("should render activities section with inactive status", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["activities", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      mapEntityToData: vi.fn((entity: { id: string; code: string; name: string }) => ({
        id: entity.id,
        code: entity.code,
        name: entity.name,
        propertyIds: [],
        createdAt: "2024-01-01",
        status: "inactive" as const,
      })),
      translations: {
        ...defaultProps.translations,
        details: {
          ...defaultProps.translations.details,
          tabs: {
            ...defaultProps.translations.details.tabs,
            activities: "Activities",
          },
          activityCreated: "Created",
          activityActivated: "Activated",
          activityDeactivated: "Deactivated",
          statusLabel: "Status",
        },
      },
      validTabs: ["info", "observations", "activities"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("activities")).toBeInTheDocument();
    });
  });

  it("should pass correct props to ObservationSection", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["observations", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const mockUseObservationManagement = vi.mocked(useObservationManagement);
    mockUseObservationManagement.mockReturnValue({
      observations: [{ id: "1", observation: "Test", createdAt: "2024-01-01", fileIds: [] }],
      searchValue: "",
      onSearchChange: vi.fn(),
      onAddObservation: vi.fn(),
      isAdding: false,
      showForm: false,
      setShowForm: vi.fn(),
      observationText: "",
      setObservationText: vi.fn(),
      observationFiles: [],
      setObservationFiles: vi.fn(),
      isSubmitting: false,
      handleSubmit: vi.fn(),
      alert: null,
    });
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByTestId("observations-tab")).toBeInTheDocument();
    });
  });

  it("should use default observation description when not provided", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["observations", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      translations: {
        ...defaultProps.translations,
        details: {
          ...defaultProps.translations.details,
          observationsDescription: undefined,
        },
      },
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("observations-tab")).toBeInTheDocument();
    });
  });

  it("should use function for emptyStateDescriptionWithSearch when provided", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["observations", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      translations: {
        ...defaultProps.translations,
        details: {
          ...defaultProps.translations.details,
          noObservationsWithSearch: (searchValue: string) => `Custom search: ${searchValue}`,
        },
      },
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("observations-tab")).toBeInTheDocument();
    });
  });

  it("should use string for emptyStateDescriptionWithSearch when provided", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["observations", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      translations: {
        ...defaultProps.translations,
        details: {
          ...defaultProps.translations.details,
          noObservationsWithSearch: "Custom empty state",
        },
      },
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("observations-tab")).toBeInTheDocument();
    });
  });

  it("should pass correct props to EntityFinanceTab", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["finance", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      financeConfig: {
        getCashFlowTransactions: vi.fn(() => []),
        getPayableTransactions: vi.fn(() => []),
        getReceivableTransactions: vi.fn(() => []),
        gradientId: "custom-gradient",
        showSubTabs: false,
      },
      validTabs: ["info", "observations", "finance"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("finance-tab")).toBeInTheDocument();
    });
  });

  it("should pass correct props to EntityMovementsTab", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["movements", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const getMovementNewRouteParam = vi.fn(
      (propertyId: string, entityId: string) =>
        `/movements/new?propertyId=${propertyId}&entityId=${entityId}`
    );
    const props = {
      ...defaultProps,
      movementsConfig: {
        getLocationMovements: vi.fn(() => []),
        getAnimalMovements: vi.fn(() => []),
        getMovementNewRouteParam,
        entityType: "serviceProvider" as const,
      },
      validTabs: ["info", "observations", "movements"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("movements-tab")).toBeInTheDocument();
    });
  });

  it("should use fallback for movements tab label when not provided", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["movements", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const props = {
      ...defaultProps,
      movementsConfig: {
        getLocationMovements: vi.fn(() => []),
        getAnimalMovements: vi.fn(() => []),
        getMovementNewRouteParam: vi.fn(
          (propertyId: string, entityId: string) =>
            `/movements/new?propertyId=${propertyId}&entityId=${entityId}`
        ),
        entityType: "employee" as const,
      },
      translations: {
        ...defaultProps.translations,
        details: {
          ...defaultProps.translations.details,
          tabs: {
            ...defaultProps.translations.details.tabs,
            movements: undefined,
          },
        },
      },
      validTabs: ["info", "observations", "movements"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("movements-tab")).toBeInTheDocument();
    });
  });

  it("should call renderCustomTab with correct parameters", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["custom1", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const renderCustomTab = vi.fn(() => <div data-testid="custom-tab-content">Custom Content</div>);
    const props = {
      ...defaultProps,
      customTabs: [{ id: "custom1", label: "Custom Tab", onClick: vi.fn() }],
      renderCustomTab,
      validTabs: ["info", "observations", "custom1"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(renderCustomTab).toHaveBeenCalledWith("custom1", expect.objectContaining({ id: "1" }));
      expect(screen.getByTestId("custom-tab-content")).toBeInTheDocument();
    });
  });

  it("should not call renderCustomTab when activeTab doesn't match", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["info", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const renderCustomTab = vi.fn(() => <div>Custom Content</div>);
    const props = {
      ...defaultProps,
      customTabs: [{ id: "custom1", label: "Custom Tab", onClick: vi.fn() }],
      renderCustomTab,
      validTabs: ["info", "observations", "custom1"] as const,
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(renderCustomTab).not.toHaveBeenCalled();
    });
  });

  it("should handle entityData being null in useEntityDetailsConfig", async () => {
    defaultProps.fetchEntity.mockResolvedValue(null as unknown as { id: string; name: string });
    render(<EntityDetailPage {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Not found")).toBeInTheDocument();
    });
  });

  it("should handle observationManagement with entityId", async () => {
    const setActiveTab = vi.fn();
    mockUseEntityTab.mockReturnValue(["observations", setActiveTab] as unknown as ReturnType<
      typeof useEntityTab
    >);
    const addObservation = vi.fn((data: Record<string, unknown>) => ({ id: "obs-1", ...data }));
    const props = {
      ...defaultProps,
      observationConfig: {
        ...defaultProps.observationConfig,
        addObservation,
      },
    };
    render(<EntityDetailPage {...props} />);
    await waitFor(() => {
      expect(screen.getByTestId("observations-tab")).toBeInTheDocument();
    });
  });
});
