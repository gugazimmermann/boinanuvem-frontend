export const en = {
  common: {
    language: "Language",
    loading: "Loading...",
    clearSearch: "Clear Search",
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
    deleteModal: {
      title: "Confirm Deletion",
      message: (name: string) => `Are you sure you want to delete property "${name}"? This action cannot be undone.`,
      cancel: "Cancel",
      confirm: "Delete",
    },
    success: {
      deleted: "Property deleted successfully!",
      updated: "Property updated successfully!",
    },
    errors: {
      deleteFailed: "Error deleting property. Please try again.",
      updateFailed: "Error updating property. Please try again.",
    },
    edit: {
      title: "Edit Property",
      description: "Update the property data",
      save: "Save Changes",
    },
    details: {
      propertyInfo: "Property Information",
      address: "Address",
      location: "Location",
      createdAt: "Created At",
      coordinates: "Coordinates",
      cityState: "City / State",
      activityCreated: "Property created",
      activityActivated: "Property activated",
      activityDeactivated: "Property deactivated",
      statusLabel: "Status",
      tabs: {
        info: "Information",
        activities: "Activities",
      },
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
      description: "Fill in the data to add a new user",
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
    permissions: {
      title: "User Permissions",
      description: "Define user permissions",
      descriptionFor: (name: string) => `Define permissions for ${name}`,
      registration: "Registration",
      selectAll: "Select all",
      savePermissions: "Save Permissions",
      userNotFound: "User not found",
      success: "Permissions updated successfully!",
      error: "Error updating permissions. Please try again.",
      resources: {
        property: "Property",
        location: "Location",
        employee: "Employee",
        serviceProvider: "Service Provider",
        supplier: "Supplier",
        buyer: "Buyer",
      },
      actions: {
        view: "View",
        add: "Add",
        edit: "Edit",
        remove: "Remove",
      },
    },
    new: {
      description: "Fill in the data to add a new team member",
      back: "Back",
      searchingAddress: "Searching address...",
      passwordMismatch: "Passwords do not match",
      passwordMinLength: "Password must be at least 6 characters",
      fields: {
        cpf: "CPF",
        cep: "ZIP Code",
        street: "Street",
        number: "Number",
        complement: "Complement",
        neighborhood: "Neighborhood",
        city: "City",
        state: "State",
      },
    },
  },
  help: {
    title: "Help",
    metaTitle: "Help - Boi na Nuvem",
    metaDescription: "Help center and frequently asked questions for Boi na Nuvem",
    heading: "Have any Questions?",
    tableOfContent: "Table of Content",
    all: "All",
    categories: {
      general: "General",
      trust: "Trust & Safety",
      services: "Services",
      billing: "Billing",
      cleaning: "Office Cleaning",
    },
    faqs: {
      payment: {
        question: "How can I pay for my appointment?",
        answer:
          "You can pay for your appointment in several ways: credit card, debit card, bank transfer, or PIX. Payment can be made directly on the platform when booking or at the time of consultation, depending on the service chosen.",
      },
      firstConsultation: {
        question: "What can I expect at my first consultation?",
        answer:
          "At your first consultation, you will be welcomed by our team who will collect your basic information and understand your needs. Then, you will have a meeting with a specialist who will analyze your case and propose the best solutions for you.",
      },
      openingHours: {
        question: "What are your opening hours?",
        answer:
          "Our business hours are Monday through Friday, from 8am to 6pm, and Saturdays from 9am to 1pm. We are closed on Sundays and holidays. For emergencies, we have a 24/7 support channel available.",
      },
      referral: {
        question: "Do I need a referral?",
        answer:
          "A referral is not required for most of our services. You can book directly through the platform. However, some specific services may require additional documentation, which will be informed at the time of booking.",
      },
      insurance: {
        question: "Is the cost of the appointment covered by private health insurance?",
        answer:
          "It depends on your health plan and the type of service. Some plans cover our services partially or fully. We recommend that you contact your insurer before booking to verify coverage. We can also help you verify this through our support.",
      },
    },
  },
} as const;

