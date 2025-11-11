export const pt = {
  common: {
    language: "Idioma",
    loading: "Carregando...",
  },

  sidebar: {
    dashboard: "Dashboard",
    properties: "Propriedades",
    animals: "Animais",
    pastures: "Pastos",
    reports: "Relatórios",
    settings: "Configurações",
    team: "Equipe",
  },

  navbar: {
    brand: "Boi na Nuvem",
  },

  userDropdown: {
    companyProfile: "Perfil da Empresa",
    userProfile: "Perfil do Usuario",
    team: "Equipe",
    help: "Ajuda",
    logout: "Sair",
  },

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

  profile: {
    title: "Perfil",
    tabs: {
      company: "Perfil da Empresa",
      user: "Perfil do Usuário",
    },
    company: {
      title: "Dados da Empresa",
      save: "Salvar Alterações",
      cancel: "Cancelar",
      edit: "Editar",
      subTabs: {
        data: "Dados",
        logs: "Logs",
      },
      fields: {
        cnpj: "CNPJ",
        companyName: "Razão Social",
        email: "Email",
        phone: "Telefone",
        street: "Rua",
        number: "Número",
        complement: "Complemento",
        neighborhood: "Bairro",
        city: "Cidade",
        state: "Estado",
        zipCode: "CEP",
      },
      logs: {
        title: "Logs de Uso",
        description: "Histórico de atividades de todos os usuários da empresa",
        empty: "Nenhum log encontrado",
        searchPlaceholder: "Buscar por usuário, ação, recurso ou data...",
        columns: {
          user: "Usuário",
          action: "Ação",
          resource: "Recurso",
          timestamp: "Data/Hora",
        },
      },
    },
    user: {
      title: "Dados do Usuário",
      save: "Salvar Alterações",
      cancel: "Cancelar",
      edit: "Editar",
      subTabs: {
        data: "Dados",
        logs: "Logs",
      },
      fields: {
        name: "Nome",
        email: "Email",
        phone: "Telefone",
        street: "Rua",
        number: "Número",
        complement: "Complemento",
        neighborhood: "Bairro",
        city: "Cidade",
        state: "Estado",
        zipCode: "CEP",
      },
      logs: {
        title: "Meus Logs",
        description: "Histórico das suas atividades no sistema",
        empty: "Nenhum log encontrado",
        searchPlaceholder: "Buscar por ação, recurso ou data...",
        columns: {
          action: "Ação",
          resource: "Recurso",
          timestamp: "Data/Hora",
        },
      },
    },
    success: {
      saved: "Dados salvos com sucesso!",
    },
    errors: {
      required: (field: string) => `${field} é obrigatório`,
      invalid: (field: string) => `${field} inválido`,
      saveFailed: "Erro ao salvar dados. Tente novamente.",
    },
  },

  team: {
    title: "Equipe",
    description: "Gerencie os usuários da sua empresa",
    addUser: "Adicionar Usuário",
    editUser: "Editar Usuário",
    deleteUser: "Excluir Usuário",
    viewUser: "Ver Detalhes",
    searchPlaceholder: "Buscar por nome, email ou função...",
    table: {
      name: "Nome",
      email: "Email",
      role: "Função",
      status: "Status",
      lastAccess: "Último Acesso",
      actions: "Ações",
    },
    status: {
      active: "Ativo",
      inactive: "Inativo",
      pending: "Pendente",
    },
    roles: {
      admin: "Administrador",
      manager: "Gerente",
      user: "Usuário",
    },
    addModal: {
      title: "Adicionar Novo Usuário",
      description: "Preencha os dados para adicionar um novo usuário",
      fields: {
        name: "Nome Completo",
        email: "Email",
        phone: "Telefone",
        role: "Função",
        password: "Senha",
        confirmPassword: "Confirmar Senha",
      },
      cancel: "Cancelar",
      add: "Adicionar",
    },
    editModal: {
      title: "Editar Usuário",
      cancel: "Cancelar",
      save: "Salvar Alterações",
      changePassword: "Alterar senha",
      description: "Atualize as informações do usuário abaixo",
    },
    deleteModal: {
      title: "Confirmar Exclusão",
      message: (name: string) => `Tem certeza que deseja excluir o usuário "${name}"? Esta ação não pode ser desfeita.`,
      cancel: "Cancelar",
      confirm: "Excluir",
    },
    userDetails: {
      title: "Detalhes do Usuário",
      personalInfo: "Informações Pessoais",
      contactInfo: "Informações de Contato",
      accountInfo: "Informações da Conta",
      close: "Fechar",
    },
    emptyState: {
      title: "Nenhum usuário encontrado",
      description: "Adicione usuários para começar a gerenciar sua equipe.",
    },
    success: {
      added: "Usuário adicionado com sucesso!",
      updated: "Usuário atualizado com sucesso!",
      deleted: "Usuário excluído com sucesso!",
    },
    errors: {
      addFailed: "Erro ao adicionar usuário. Tente novamente.",
      updateFailed: "Erro ao atualizar usuário. Tente novamente.",
      deleteFailed: "Erro ao excluir usuário. Tente novamente.",
    },
    permissions: {
      title: "Permissões do Usuário",
      description: "Defina as permissões do usuário",
      descriptionFor: (name: string) => `Defina as permissões para ${name}`,
      registration: "Cadastro",
      selectAll: "Selecionar todos",
      savePermissions: "Salvar Permissões",
      userNotFound: "Usuário não encontrado",
      success: "Permissões atualizadas com sucesso!",
      error: "Erro ao atualizar permissões. Tente novamente.",
      resources: {
        property: "Propriedade",
        location: "Localização",
        employee: "Funcionário",
        serviceProvider: "Prestador de Serviço",
        supplier: "Fornecedor",
        buyer: "Comprador",
      },
      actions: {
        view: "Visualizar",
        add: "Adicionar",
        edit: "Editar",
        remove: "Remover",
      },
    },
    new: {
      description: "Preencha os dados para adicionar um novo membro à equipe",
      back: "Voltar",
      searchingAddress: "Buscando endereço...",
      passwordMismatch: "As senhas não coincidem",
      passwordMinLength: "A senha deve ter pelo menos 6 caracteres",
      fields: {
        cpf: "CPF",
        cep: "CEP",
        street: "Rua",
        number: "Número",
        complement: "Complemento",
        neighborhood: "Bairro",
        city: "Cidade",
        state: "Estado",
      },
    },
  },
  help: {
    title: "Ajuda",
    metaTitle: "Ajuda - Boi na Nuvem",
    metaDescription: "Central de ajuda e perguntas frequentes do Boi na Nuvem",
    heading: "Tem alguma Dúvida?",
    tableOfContent: "Índice",
    all: "Todos",
    categories: {
      general: "Geral",
      trust: "Confiança e Segurança",
      services: "Serviços",
      billing: "Cobrança",
      cleaning: "Limpeza de Escritório",
    },
    faqs: {
      payment: {
        question: "Como posso pagar pela minha consulta?",
        answer:
          "Você pode pagar pela sua consulta de várias formas: cartão de crédito, cartão de débito, transferência bancária ou PIX. O pagamento pode ser feito diretamente na plataforma ao agendar ou no momento da consulta, dependendo do serviço escolhido.",
      },
      firstConsultation: {
        question: "O que posso esperar na minha primeira consulta?",
        answer:
          "Na sua primeira consulta, você será recebido pela nossa equipe que coletará suas informações básicas e entenderá suas necessidades. Em seguida, você terá uma reunião com um especialista que analisará seu caso e proporá as melhores soluções para você.",
      },
      openingHours: {
        question: "Quais são os seus horários de funcionamento?",
        answer:
          "Nosso horário de funcionamento é de segunda a sexta, das 8h às 18h, e aos sábados das 9h às 13h. Estamos fechados aos domingos e feriados. Para emergências, temos um canal de suporte 24/7 disponível.",
      },
      referral: {
        question: "Preciso de um encaminhamento?",
        answer:
          "Um encaminhamento não é necessário para a maioria dos nossos serviços. Você pode agendar diretamente pela plataforma. No entanto, alguns serviços específicos podem exigir documentação adicional, que será informada no momento do agendamento.",
      },
      insurance: {
        question: "O custo da consulta é coberto pelo plano de saúde privado?",
        answer:
          "Depende do seu plano de saúde e do tipo de serviço. Alguns planos cobrem nossos serviços parcial ou totalmente. Recomendamos que você entre em contato com sua seguradora antes de agendar para verificar a cobertura. Também podemos ajudá-lo a verificar isso através do nosso suporte.",
      },
    },
  },
} as const;

