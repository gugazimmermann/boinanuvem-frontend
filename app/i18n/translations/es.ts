export const es = {
  common: {
    language: "Idioma",
    loading: "Cargando...",
  },

  sidebar: {
    dashboard: "Panel de Control",
    properties: "Propiedades",
    animals: "Animales",
    pastures: "Pastos",
    reports: "Informes",
    settings: "Configuración",
    team: "Equipo",
  },

  navbar: {
    brand: "Boi na Nuvem",
  },

  userDropdown: {
    companyProfile: "Perfil de la Empresa",
    userProfile: "Perfil del Usuario",
    team: "Equipo",
    help: "Ayuda",
    logout: "Salir",
  },

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

  profile: {
    title: "Perfil",
    tabs: {
      company: "Perfil de la Empresa",
      user: "Perfil del Usuario",
    },
    company: {
      title: "Datos de la Empresa",
      save: "Guardar Cambios",
      cancel: "Cancelar",
      edit: "Editar",
      subTabs: {
        data: "Datos",
        logs: "Registros",
      },
      fields: {
        cnpj: "CNPJ",
        companyName: "Razón Social",
        email: "Correo Electrónico",
        phone: "Teléfono",
        street: "Calle",
        number: "Número",
        complement: "Complemento",
        neighborhood: "Barrio",
        city: "Ciudad",
        state: "Estado",
        zipCode: "Código Postal",
      },
      logs: {
        title: "Registros de Uso",
        description: "Historial de actividades de todos los usuarios de la empresa",
        empty: "No se encontraron registros",
        searchPlaceholder: "Buscar por usuario, acción, recurso o fecha...",
        columns: {
          user: "Usuario",
          action: "Acción",
          resource: "Recurso",
          timestamp: "Fecha/Hora",
        },
      },
    },
    user: {
      title: "Datos del Usuario",
      save: "Guardar Cambios",
      cancel: "Cancelar",
      edit: "Editar",
      subTabs: {
        data: "Datos",
        logs: "Registros",
      },
      fields: {
        name: "Nombre",
        email: "Correo Electrónico",
        phone: "Teléfono",
        street: "Calle",
        number: "Número",
        complement: "Complemento",
        neighborhood: "Barrio",
        city: "Ciudad",
        state: "Estado",
        zipCode: "Código Postal",
      },
      logs: {
        title: "Mis Registros",
        description: "Historial de tus actividades en el sistema",
        empty: "No se encontraron registros",
        searchPlaceholder: "Buscar por acción, recurso o fecha...",
        columns: {
          action: "Acción",
          resource: "Recurso",
          timestamp: "Fecha/Hora",
        },
      },
    },
    success: {
      saved: "¡Datos guardados con éxito!",
    },
    errors: {
      required: (field: string) => `${field} es obligatorio`,
      invalid: (field: string) => `${field} inválido`,
      saveFailed: "Error al guardar datos. Intenta de nuevo.",
    },
  },

  team: {
    title: "Equipo",
    description: "Gestiona los usuarios de tu empresa",
    addUser: "Agregar Usuario",
    editUser: "Editar Usuario",
    deleteUser: "Eliminar Usuario",
    viewUser: "Ver Detalles",
    searchPlaceholder: "Buscar por nombre, email o función...",
    table: {
      name: "Nombre",
      email: "Email",
      role: "Función",
      status: "Estado",
      lastAccess: "Último Acceso",
      actions: "Acciones",
    },
    status: {
      active: "Activo",
      inactive: "Inactivo",
      pending: "Pendiente",
    },
    roles: {
      admin: "Administrador",
      manager: "Gerente",
      user: "Usuario",
    },
    addModal: {
      title: "Agregar Nuevo Usuario",
      fields: {
        name: "Nombre Completo",
        email: "Email",
        phone: "Teléfono",
        role: "Función",
        password: "Contraseña",
        confirmPassword: "Confirmar Contraseña",
      },
      cancel: "Cancelar",
      add: "Agregar",
    },
    editModal: {
      title: "Editar Usuario",
      cancel: "Cancelar",
      save: "Guardar Cambios",
      changePassword: "Cambiar contraseña",
      description: "Actualiza la información del usuario a continuación",
    },
    deleteModal: {
      title: "Confirmar Eliminación",
      message: (name: string) => `¿Estás seguro de que deseas eliminar al usuario "${name}"? Esta acción no se puede deshacer.`,
      cancel: "Cancelar",
      confirm: "Eliminar",
    },
    userDetails: {
      title: "Detalles del Usuario",
      personalInfo: "Información Personal",
      contactInfo: "Información de Contacto",
      accountInfo: "Información de la Cuenta",
      close: "Cerrar",
    },
    emptyState: {
      title: "No se encontraron usuarios",
      description: "Agrega usuarios para comenzar a gestionar tu equipo.",
    },
    success: {
      added: "¡Usuario agregado con éxito!",
      updated: "¡Usuario actualizado con éxito!",
      deleted: "¡Usuario eliminado con éxito!",
    },
    errors: {
      addFailed: "Error al agregar usuario. Intenta de nuevo.",
      updateFailed: "Error al actualizar usuario. Intenta de nuevo.",
      deleteFailed: "Error al eliminar usuario. Intenta de nuevo.",
    },
  },
} as const;

