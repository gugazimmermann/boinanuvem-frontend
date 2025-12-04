import type { ActivityLogEntry } from "~/types/activity";

export interface ActivityLogGeneratorOptions {
  /**
   * Number of log entries to generate
   */
  count?: number;
  /**
   * Maximum number of days ago for log entries (default: 60)
   */
  maxDaysAgo?: number;
  /**
   * List of user names to randomly assign to logs (optional)
   */
  users?: string[];
  /**
   * List of actions to randomly select from
   */
  actions?: string[];
  /**
   * List of resource types to randomly select from
   */
  resourceTypes?: string[];
  /**
   * Resource data for generating resource strings
   */
  resourceData?: {
    properties?: string[];
    animals?: string[];
    pastures?: string[];
    reports?: string[];
    users?: string[];
  };
}

const DEFAULT_ACTIONS = ["CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT", "IMPORT"];
const DEFAULT_RESOURCE_TYPES = [
  "Property",
  "Animal",
  "Pasture",
  "Report",
  "Vaccination",
  "Treatment",
  "Birth",
  "Weight",
];

const DEFAULT_RESOURCE_DATA = {
  properties: ["Fazenda São João", "Fazenda Santa Maria", "Fazenda Boa Vista"],
  animals: Array.from({ length: 30 }, (_, i) => `#${String(1000 + i).padStart(4, "0")}`),
  pastures: ["Campo 1", "Campo 2", "Campo 3", "Campo Norte", "Campo Sul"],
  reports: ["Monthly Summary", "Annual Report", "Health Report", "Production Report"],
};

/**
 * Generates mock activity log entries for testing/development purposes.
 * NOSONAR: Math.random() is used here for generating mock activity log data only, not for security purposes
 */
export function generateActivityLogs(
  options: ActivityLogGeneratorOptions = {}
): ActivityLogEntry[] {
  const {
    count = 52,
    maxDaysAgo = 60,
    users = [],
    actions = DEFAULT_ACTIONS,
    resourceTypes = DEFAULT_RESOURCE_TYPES,
    resourceData = DEFAULT_RESOURCE_DATA,
  } = options;

  const logs: ActivityLogEntry[] = [];
  const now = Date.now();

  const allProperties = resourceData.properties || DEFAULT_RESOURCE_DATA.properties;
  const allAnimals = resourceData.animals || DEFAULT_RESOURCE_DATA.animals;
  const allPastures = resourceData.pastures || DEFAULT_RESOURCE_DATA.pastures;
  const allReports = resourceData.reports || DEFAULT_RESOURCE_DATA.reports;
  const allUsers = ("users" in resourceData && resourceData.users) || users;

  for (let i = 0; i < count; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];

    let resource = "";
    switch (resourceType) {
      case "Property":
        resource = `Property: ${allProperties[Math.floor(Math.random() * allProperties.length)]}`;
        break;
      case "Animal":
        resource = `Animal: ${allAnimals[Math.floor(Math.random() * allAnimals.length)]}`;
        break;
      case "Pasture":
        resource = `Pasture: ${allPastures[Math.floor(Math.random() * allPastures.length)]}`;
        break;
      case "Report":
        resource = `Report: ${allReports[Math.floor(Math.random() * allReports.length)]}`;
        break;
      case "Vaccination":
        resource = `Vaccination: Animal ${allAnimals[Math.floor(Math.random() * allAnimals.length)]}`;
        break;
      case "Treatment":
        resource = `Treatment: Animal ${allAnimals[Math.floor(Math.random() * allAnimals.length)]}`;
        break;
      case "Birth":
        resource = `Birth: Animal ${allAnimals[Math.floor(Math.random() * allAnimals.length)]}`;
        break;
      case "Weight":
        resource = `Weight Record: Animal ${allAnimals[Math.floor(Math.random() * allAnimals.length)]}`;
        break;
      case "User":
        resource = `User: ${allUsers[Math.floor(Math.random() * allUsers.length)]}`;
        break;
      case "Settings":
        resource = "Settings: Company Configuration";
        break;
      default:
        resource = `${resourceType}: Unknown`;
    }

    const daysAgo = Math.floor(Math.random() * maxDaysAgo);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const timestamp = new Date(
      now - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000 - minutesAgo * 60 * 1000
    ).toISOString();

    const logEntry: ActivityLogEntry = {
      id: String(i + 1),
      action,
      resource,
      timestamp,
    };

    // Add user if provided
    if (users.length > 0) {
      logEntry.user = users[Math.floor(Math.random() * users.length)];
    }

    logs.push(logEntry);
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
