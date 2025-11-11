export const es = {
  common: {
    language: "Idioma",
    loading: "Cargando...",
    clearSearch: "Limpiar Búsqueda",
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
      uas: "Unidad Animal",
      stockingRate: "Tasa de Carga",
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
    deleteModal: {
      title: "Confirmar Eliminación",
      message: (name: string) => `¿Estás seguro de que deseas eliminar la propiedad "${name}"? Esta acción no se puede deshacer.`,
      cancel: "Cancelar",
      confirm: "Eliminar",
    },
    success: {
      deleted: "¡Propiedad eliminada con éxito!",
      updated: "¡Propiedad actualizada con éxito!",
    },
    errors: {
      deleteFailed: "Error al eliminar propiedad. Intenta de nuevo.",
      updateFailed: "Error al actualizar propiedad. Intenta de nuevo.",
    },
    edit: {
      title: "Editar Propiedad",
      description: "Actualiza los datos de la propiedad",
      save: "Guardar Cambios",
    },
    details: {
      propertyInfo: "Información de la Propiedad",
      address: "Dirección",
      location: "Ubicación",
      createdAt: "Fecha de Creación",
      coordinates: "Coordenadas",
      cityState: "Ciudad / Estado",
      activityCreated: "Propiedad creada",
      activityActivated: "Propiedad activada",
      activityDeactivated: "Propiedad desactivada",
      statusLabel: "Estado",
      tabs: {
        information: "Información",
        info: "Detalles",
        activities: "Actividades",
      },
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
      description: "Completa los datos para agregar un nuevo usuario",
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
    permissions: {
      title: "Permisos del Usuario",
      description: "Define los permisos del usuario",
      descriptionFor: (name: string) => `Define los permisos para ${name}`,
      registration: "Registro",
      selectAll: "Seleccionar todos",
      savePermissions: "Guardar Permisos",
      userNotFound: "Usuario no encontrado",
      success: "¡Permisos actualizados con éxito!",
      error: "Error al actualizar permisos. Intenta de nuevo.",
      resources: {
        property: "Propiedad",
        location: "Ubicación",
        employee: "Empleado",
        serviceProvider: "Proveedor de Servicios",
        supplier: "Proveedor",
        buyer: "Comprador",
      },
      actions: {
        view: "Ver",
        add: "Agregar",
        edit: "Editar",
        remove: "Eliminar",
      },
    },
    new: {
      description: "Completa los datos para agregar un nuevo miembro al equipo",
      back: "Volver",
      searchingAddress: "Buscando dirección...",
      passwordMismatch: "Las contraseñas no coinciden",
      passwordMinLength: "La contraseña debe tener al menos 6 caracteres",
      fields: {
        cpf: "CPF",
        cep: "Código Postal",
        street: "Calle",
        number: "Número",
        complement: "Complemento",
        neighborhood: "Barrio",
        city: "Ciudad",
        state: "Estado",
      },
    },
  },
  help: {
    title: "Ayuda",
    metaTitle: "Ayuda - Boi na Nuvem",
    metaDescription: "Centro de ayuda y preguntas frecuentes de Boi na Nuvem",
    heading: "¿Tienes alguna Pregunta?",
    tableOfContent: "Índice",
    all: "Todos",
    categories: {
      general: "General",
      trust: "Confianza y Seguridad",
      services: "Servicios",
      billing: "Facturación",
      cleaning: "Limpieza de Oficina",
    },
    faqs: {
      payment: {
        question: "¿Cómo puedo pagar por mi cita?",
        answer:
          "Puedes pagar por tu cita de varias formas: tarjeta de crédito, tarjeta de débito, transferencia bancaria o PIX. El pago se puede realizar directamente en la plataforma al reservar o en el momento de la consulta, dependiendo del servicio elegido.",
      },
      firstConsultation: {
        question: "¿Qué puedo esperar en mi primera consulta?",
        answer:
          "En tu primera consulta, serás recibido por nuestro equipo que recopilará tu información básica y entenderá tus necesidades. Luego, tendrás una reunión con un especialista que analizará tu caso y propondrá las mejores soluciones para ti.",
      },
      openingHours: {
        question: "¿Cuáles son sus horarios de atención?",
        answer:
          "Nuestro horario de atención es de lunes a viernes, de 8am a 6pm, y los sábados de 9am a 1pm. Estamos cerrados los domingos y días festivos. Para emergencias, tenemos un canal de soporte 24/7 disponible.",
      },
      referral: {
        question: "¿Necesito una referencia?",
        answer:
          "Una referencia no es necesaria para la mayoría de nuestros servicios. Puedes reservar directamente a través de la plataforma. Sin embargo, algunos servicios específicos pueden requerir documentación adicional, que se informará al momento de la reserva.",
      },
      insurance: {
        question: "¿El costo de la cita está cubierto por el seguro de salud privado?",
        answer:
          "Depende de tu plan de salud y el tipo de servicio. Algunos planes cubren nuestros servicios parcial o totalmente. Te recomendamos que contactes a tu aseguradora antes de reservar para verificar la cobertura. También podemos ayudarte a verificar esto a través de nuestro soporte.",
      },
    },
  },
} as const;

