export const en = {
  // Common
  common: {
    language: "Language",
    loading: "Loading...",
  },

  // Sidebar
  sidebar: {
    dashboard: "Dashboard",
    properties: "Properties",
    animals: "Animals",
    pastures: "Pastures",
    reports: "Reports",
    settings: "Settings",
  },

  // Navbar
  navbar: {
    brand: "Boi na Nuvem",
  },

  // User Dropdown
  userDropdown: {
    companyProfile: "Company Profile",
    userProfile: "User Profile",
    team: "Team",
    help: "Help",
    logout: "Logout",
  },

  // Dashboard Page
  dashboard: {
    title: "Dashboard",
    stats: {
      totalAnimals: "Total Animals",
      properties: "Properties",
      pastures: "Pastures",
      births: "Births",
    },
    recentActivities: {
      title: "Recent Activities",
      newAnimalRegistered: "New animal registered",
      pastureUpdated: "Pasture updated",
      newBirthRegistered: "New birth registered",
      hoursAgo: (hours: number) => `${hours} hour${hours !== 1 ? "s" : ""} ago`,
      daysAgo: (days: number) => `${days} day${days !== 1 ? "s" : ""} ago`,
    },
  },

  // Properties Page
  properties: {
    title: "Properties",
    description: "Manage all your rural properties.",
    addProperty: "Add Property",
    searchPlaceholder: "Search properties...",
    filters: {
      all: "All",
      active: "Active",
      inactive: "Inactive",
    },
    table: {
      name: "Name",
      area: "Area",
      locations: "Locations",
      animals: "Animals",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
    },
    badge: {
      properties: (count: number) => `${count} propert${count !== 1 ? "ies" : "y"}`,
    },
    emptyState: {
      title: "No properties found",
      descriptionWithSearch: (search: string) =>
        `Your search "${search}" did not find any properties. Try again or add a new property.`,
      descriptionWithoutSearch:
        "You don't have any properties registered yet. Add your first property to get started.",
    },
  },
} as const;

