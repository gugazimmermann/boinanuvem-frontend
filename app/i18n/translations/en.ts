export const en = {
  common: {
    language: "Language",
    loading: "Loading...",
  },

  sidebar: {
    dashboard: "Dashboard",
    properties: "Properties",
    animals: "Animals",
    pastures: "Pastures",
    reports: "Reports",
    settings: "Settings",
    team: "Team",
  },

  navbar: {
    brand: "Boi na Nuvem",
  },

  userDropdown: {
    companyProfile: "Company Profile",
    userProfile: "User Profile",
    team: "Team",
    help: "Help",
    logout: "Logout",
  },

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

  profile: {
    title: "Profile",
    tabs: {
      company: "Company Profile",
      user: "User Profile",
    },
    company: {
      title: "Company Data",
      save: "Save Changes",
      cancel: "Cancel",
      edit: "Edit",
      subTabs: {
        data: "Data",
        logs: "Logs",
      },
      fields: {
        cnpj: "CNPJ",
        companyName: "Company Name",
        email: "Email",
        phone: "Phone",
        street: "Street",
        number: "Number",
        complement: "Complement",
        neighborhood: "Neighborhood",
        city: "City",
        state: "State",
        zipCode: "ZIP Code",
      },
      logs: {
        title: "Usage Logs",
        description: "Activity history of all company users",
        empty: "No logs found",
        searchPlaceholder: "Search by user, action, resource or date...",
        columns: {
          user: "User",
          action: "Action",
          resource: "Resource",
          timestamp: "Date/Time",
        },
      },
    },
    user: {
      title: "User Data",
      save: "Save Changes",
      cancel: "Cancel",
      edit: "Edit",
      subTabs: {
        data: "Data",
        logs: "Logs",
      },
      fields: {
        name: "Name",
        email: "Email",
        phone: "Phone",
        street: "Street",
        number: "Number",
        complement: "Complement",
        neighborhood: "Neighborhood",
        city: "City",
        state: "State",
        zipCode: "ZIP Code",
      },
      logs: {
        title: "My Logs",
        description: "History of your activities in the system",
        empty: "No logs found",
        searchPlaceholder: "Search by action, resource or date...",
        columns: {
          action: "Action",
          resource: "Resource",
          timestamp: "Date/Time",
        },
      },
    },
    success: {
      saved: "Data saved successfully!",
    },
    errors: {
      required: (field: string) => `${field} is required`,
      invalid: (field: string) => `Invalid ${field}`,
      saveFailed: "Error saving data. Please try again.",
    },
  },

  team: {
    title: "Team",
    description: "Manage your company users",
    addUser: "Add User",
    editUser: "Edit User",
    deleteUser: "Delete User",
    viewUser: "View Details",
    searchPlaceholder: "Search by name, email or role...",
    table: {
      name: "Name",
      email: "Email",
      role: "Role",
      status: "Status",
      lastAccess: "Last Access",
      actions: "Actions",
    },
    status: {
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
    },
    roles: {
      admin: "Administrator",
      manager: "Manager",
      user: "User",
    },
    addModal: {
      title: "Add New User",
      fields: {
        name: "Full Name",
        email: "Email",
        phone: "Phone",
        role: "Role",
        password: "Password",
        confirmPassword: "Confirm Password",
      },
      cancel: "Cancel",
      add: "Add",
    },
    editModal: {
      title: "Edit User",
      cancel: "Cancel",
      save: "Save Changes",
      changePassword: "Change password",
      description: "Update the user information below",
    },
    deleteModal: {
      title: "Confirm Deletion",
      message: (name: string) => `Are you sure you want to delete user "${name}"? This action cannot be undone.`,
      cancel: "Cancel",
      confirm: "Delete",
    },
    userDetails: {
      title: "User Details",
      personalInfo: "Personal Information",
      contactInfo: "Contact Information",
      accountInfo: "Account Information",
      close: "Close",
    },
    emptyState: {
      title: "No users found",
      description: "Add users to start managing your team.",
    },
    success: {
      added: "User added successfully!",
      updated: "User updated successfully!",
      deleted: "User deleted successfully!",
    },
    errors: {
      addFailed: "Error adding user. Please try again.",
      updateFailed: "Error updating user. Please try again.",
      deleteFailed: "Error deleting user. Please try again.",
    },
  },
} as const;

