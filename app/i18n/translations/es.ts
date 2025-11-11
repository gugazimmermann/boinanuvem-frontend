export const es = {
  // Common
  common: {
    language: "Idioma",
    loading: "Cargando...",
  },

  // Sidebar
  sidebar: {
    dashboard: "Panel de Control",
    properties: "Propiedades",
    animals: "Animales",
    pastures: "Pastos",
    reports: "Informes",
    settings: "Configuración",
  },

  // Navbar
  navbar: {
    brand: "Boi na Nuvem",
  },

  // User Dropdown
  userDropdown: {
    companyProfile: "Perfil de la Empresa",
    userProfile: "Perfil del Usuario",
    team: "Equipo",
    help: "Ayuda",
    logout: "Salir",
  },

  // Dashboard Page
  dashboard: {
    title: "Panel de Control",
    stats: {
      totalAnimals: "Total de Animales",
      properties: "Propiedades",
      pastures: "Pastos",
      births: "Nacimientos",
    },
    recentActivities: {
      title: "Actividades Recientes",
      newAnimalRegistered: "Nuevo animal registrado",
      pastureUpdated: "Pastura actualizada",
      newBirthRegistered: "Nuevo nacimiento registrado",
      hoursAgo: (hours: number) => `Hace ${hours} hora${hours !== 1 ? "s" : ""}`,
      daysAgo: (days: number) => `Hace ${days} día${days !== 1 ? "s" : ""}`,
    },
  },

  // Properties Page
  properties: {
    title: "Propiedades",
    description: "Gestiona todas tus propiedades rurales.",
    addProperty: "Agregar Propiedad",
    searchPlaceholder: "Buscar propiedades...",
    filters: {
      all: "Todas",
      active: "Activas",
      inactive: "Inactivas",
    },
    table: {
      name: "Nombre",
      area: "Área",
      locations: "Ubicaciones",
      animals: "Animales",
      status: "Estado",
      active: "Activa",
      inactive: "Inactiva",
    },
    badge: {
      properties: (count: number) => `${count} propiedad${count !== 1 ? "es" : ""}`,
    },
    emptyState: {
      title: "No se encontraron propiedades",
      descriptionWithSearch: (search: string) =>
        `Tu búsqueda "${search}" no encontró propiedades. Intenta de nuevo o agrega una nueva propiedad.`,
      descriptionWithoutSearch:
        "Aún no tienes propiedades registradas. Agrega tu primera propiedad para comenzar.",
    },
  },
} as const;

