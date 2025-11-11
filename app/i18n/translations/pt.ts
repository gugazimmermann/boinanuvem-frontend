export const pt = {
  // Common
  common: {
    language: "Idioma",
    loading: "Carregando...",
  },

  // Sidebar
  sidebar: {
    dashboard: "Dashboard",
    properties: "Propriedades",
    animals: "Animais",
    pastures: "Pastos",
    reports: "Relatórios",
    settings: "Configurações",
  },

  // Navbar
  navbar: {
    brand: "Boi na Nuvem",
  },

  // User Dropdown
  userDropdown: {
    companyProfile: "Perfil da Empresa",
    userProfile: "Perfil do Usuario",
    team: "Equipe",
    help: "Ajuda",
    logout: "Sair",
  },

  // Dashboard Page
  dashboard: {
    title: "Dashboard",
    stats: {
      totalAnimals: "Total de Animais",
      properties: "Propriedades",
      pastures: "Pastos",
      births: "Nascimentos",
    },
    recentActivities: {
      title: "Atividades Recentes",
      newAnimalRegistered: "Novo animal cadastrado",
      pastureUpdated: "Pastagem atualizada",
      newBirthRegistered: "Novo nascimento registrado",
      hoursAgo: (hours: number) => `Há ${hours} horas`,
      daysAgo: (days: number) => `Há ${days} dia${days > 1 ? "s" : ""}`,
    },
  },

  // Properties Page
  properties: {
    title: "Propriedades",
    description: "Gerencie todas as suas propriedades rurais.",
    addProperty: "Adicionar Propriedade",
    searchPlaceholder: "Buscar propriedades...",
    filters: {
      all: "Todas",
      active: "Ativas",
      inactive: "Inativas",
    },
    table: {
      name: "Nome",
      area: "Área",
      locations: "Localizações",
      animals: "Animais",
      status: "Status",
      active: "Ativa",
      inactive: "Inativa",
    },
    badge: {
      properties: (count: number) => `${count} propriedade${count !== 1 ? "s" : ""}`,
    },
    emptyState: {
      title: "Nenhuma propriedade encontrada",
      descriptionWithSearch: (search: string) =>
        `Sua busca "${search}" não encontrou propriedades. Tente novamente ou adicione uma nova propriedade.`,
      descriptionWithoutSearch:
        "Você ainda não possui propriedades cadastradas. Adicione sua primeira propriedade para começar.",
    },
  },
} as const;

