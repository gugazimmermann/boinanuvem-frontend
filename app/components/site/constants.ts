export const COLORS = {
  primary: "oklch(62.7% 0.194 149.214)",
  secondary: "oklch(58.8% 0.158 241.966)",
  primaryDark: "oklch(55% 0.194 149.214)",
  secondaryDark: "oklch(50% 0.158 241.966)",
  primaryLight: "oklch(70% 0.194 149.214)",
  secondaryLight: "oklch(68% 0.158 241.966)",
  bgLight: "oklch(98% 0.01 149)",
  bgLightSecondary: "oklch(95% 0.02 149)",
  bgLightTertiary: "oklch(98% 0.01 241)",
  textDark: "oklch(40% 0.1 241)",
  textMedium: "oklch(50% 0.1 241)",
  textLight: "oklch(90% 0.05 241)",
} as const;

export const NAV_LINKS = [
  { href: "#section-services", label: "Funcionalidades" },
  { href: "#section-examples", label: "Sobre" },
  { href: "#section-pricing", label: "Preços" },
  { href: "#section-faqs", label: "Perguntas" },
  { href: "#section-blog", label: "Blog" },
] as const;

export const SERVICES = [
  {
    title: "Gestão de Propriedades e Pastos",
    content:
      "Controle completo de suas propriedades e pastos. Cadastre áreas, delimite pastagens, monitore capacidade de lotação e gerencie rotação de pastos de forma eficiente. Integração com mapas interativos e planejamento de pastagens baseado em dados climáticos.",
  },
  {
    title: "Controle de Animais e Peso",
    content:
      "Registre todos os seus animais com informações detalhadas. Acompanhe o peso ao longo do tempo, histórico de vacinações, tratamentos, movimentações entre pastos e muito mais. Análise de ganho de peso diário (GMD) e tendências de crescimento.",
  },
  {
    title: "Gestão de Nascimentos e Reprodução",
    content:
      "Registre nascimentos, controle o ciclo reprodutivo das matrizes, acompanhe prenhezes e gerencie a genética do seu rebanho. Índices reprodutivos completos: taxa de fertilidade, taxa de natalidade, intervalo entre partos, taxa de descarte e previsão de nascimentos.",
  },
  {
    title: "Gestão Financeira Completa",
    content:
      "Controle total das finanças da sua fazenda. Gerencie fluxo de caixa, contas a pagar e receber, múltiplas contas bancárias, e acompanhe receitas e despesas com gráficos e relatórios detalhados. Análise de rentabilidade por animal e por lote.",
  },
  {
    title: "Controle de Estoque e Inventário",
    content:
      "Gerencie todo o inventário da fazenda: rações, medicamentos, insumos e materiais. Controle de movimentações, consumo por localização, custos por animal e análise de consumo baseada na presença dos animais nos pastos.",
  },
  {
    title: "Vendas e Análise de Rentabilidade",
    content:
      "Registre vendas de animais com diferentes modalidades (frigorífico, outras fazendas, leilões). Análise completa de rentabilidade: custo por arroba, valor de venda, spread, margem de lucro e ROI. Histórico completo de vendas com métricas avançadas.",
  },
  {
    title: "Equipe e Colaboradores",
    content:
      "Gerencie funcionários, prestadores de serviço, fornecedores e compradores. Sistema de observações com anexos, histórico completo de relacionamentos e controle de permissões granulares para múltiplos usuários da equipe.",
  },
  {
    title: "Dashboard e Relatórios",
    content:
      "Visão completa da operação com métricas em tempo real, gráficos interativos, feed de atividades recentes e indicadores-chave de desempenho. Dashboards personalizados por propriedade e análises comparativas ao longo do tempo.",
  },
] as const;

export const FEATURES = [
  {
    badge: "Eficiência",
    title: "Economia de Tempo",
    content:
      "Reduza em até 70% o tempo gasto com planilhas e controles manuais. Automatize processos, cálculos e relatórios. Foque no que realmente importa: sua produção e crescimento do negócio.",
    button: "Conheça a Eficiência",
  },
  {
    badge: "Flexível",
    title: "Totalmente Adaptável",
    content:
      "Sistema flexível que se adapta à realidade da sua fazenda. Configure múltiplas propriedades, gerencie equipes com permissões personalizadas e dimensione conforme o crescimento do seu negócio.",
    button: "Mais Flexibilidade",
  },
  {
    badge: "Completo",
    title: "Gestão Completa",
    content:
      "Tudo em um só lugar: propriedades, pastos, animais, pesos, nascimentos, reprodução, finanças, estoque, vendas e análises. Gestão completa e integrada do seu rebanho e operação.",
    button: "Ver Funcionalidades",
  },
  {
    badge: "Inteligente",
    title: "Análises Avançadas",
    content:
      "Dashboards interativos, gráficos de tendências, índices reprodutivos, análise de rentabilidade, previsão de nascimentos e métricas de desempenho. Tome decisões baseadas em dados reais.",
    button: "Ver Análises",
  },
  {
    badge: "Colaborativo",
    title: "Trabalho em Equipe",
    content:
      "Gerencie múltiplos usuários com sistema de permissões granulares. Cada membro da equipe acessa apenas o que precisa, garantindo segurança e organização na gestão da fazenda.",
    button: "Trabalho em Equipe",
  },
  {
    badge: "Global",
    title: "Multi-idioma",
    content:
      "Sistema disponível em Português, Inglês e Espanhol. Interface adaptável para diferentes regiões e necessidades, facilitando a gestão de operações internacionais.",
    button: "Idiomas",
  },
] as const;

export const PRICING_PLANS = [
  {
    name: "Básico",
    description: "Plano ideal para pequenas propriedades.",
    monthlyPrice: "R$ 99",
    annualPrice: "R$ 990",
    features: [
      "Até 1 Propriedade",
      "Até 500 Animais",
      "Gestão de Pastos",
      "Controle de Peso",
      "Registro de Nascimentos",
      "Suporte por Email",
    ],
    popular: true,
  },
  {
    name: "Empresarial",
    description: "Plano completo para grandes fazendas e equipes.",
    monthlyPrice: "R$ 299",
    annualPrice: "R$ 2.990",
    features: [
      "Propriedades Ilimitadas",
      "Animais Ilimitados",
      "Múltiplos Usuários",
      "Relatórios Avançados",
      "API de Integração",
      "Suporte Prioritário 24/7",
    ],
    popular: false,
  },
] as const;

export const FAQS = [
  {
    question: "Como funciona o sistema Boi na Nuvem?",
    answer:
      "O Boi na Nuvem é um sistema completo de gestão para fazendas de gado de corte. Você pode cadastrar suas propriedades, pastos, animais, registrar pesos, nascimentos, vacinações, finanças, estoque, vendas e muito mais. Tudo de forma simples e intuitiva, com acesso de qualquer lugar através da nuvem. O sistema oferece dashboards interativos, análises avançadas e relatórios detalhados.",
  },
  {
    question: "Quais funcionalidades de gestão financeira estão disponíveis?",
    answer:
      "O sistema oferece gestão financeira completa: controle de fluxo de caixa (receitas e despesas), contas a pagar e receber com controle de vencimentos, múltiplas contas bancárias, análise de rentabilidade por animal e por lote, gráficos de tendências financeiras e relatórios detalhados. Todas as transações podem ter observações e anexos para documentação completa.",
  },
  {
    question: "Como funciona o sistema de análises e relatórios?",
    answer:
      "O sistema oferece dashboards interativos com métricas em tempo real, gráficos de tendências de peso, análises financeiras, índices reprodutivos (fertilidade, natalidade, intervalo entre partos), previsão de nascimentos, análise de rentabilidade de vendas e muito mais. Todos os dados podem ser visualizados em gráficos interativos e exportados para análise externa.",
  },
  {
    question: "Posso gerenciar uma equipe com múltiplos usuários?",
    answer:
      "Sim! O sistema permite gerenciar múltiplos usuários com sistema de permissões granulares. Você pode definir quais funcionalidades cada membro da equipe pode acessar (visualizar, adicionar, editar ou remover) para cada seção do sistema. Ideal para grandes fazendas com diferentes responsabilidades por área.",
  },
  {
    question: "O sistema suporta múltiplos idiomas?",
    answer:
      "Sim! O Boi na Nuvem está disponível em Português, Inglês e Espanhol. Você pode alternar entre idiomas a qualquer momento, e toda a interface será traduzida automaticamente, facilitando a gestão de operações internacionais ou equipes multinacionais.",
  },
  {
    question: "Preciso de conhecimento técnico para usar?",
    answer:
      "Não! O sistema foi desenvolvido pensando na simplicidade. A interface é intuitiva e fácil de usar, com navegação clara e ferramentas visuais. Além disso, oferecemos treinamento e suporte completo para ajudar você a aproveitar ao máximo todas as funcionalidades.",
  },
  {
    question: "Posso usar em múltiplas propriedades?",
    answer:
      "Sim! Dependendo do seu plano, você pode gerenciar uma ou múltiplas propriedades. O plano Empresarial permite propriedades ilimitadas, ideal para grandes fazendas ou grupos empresariais. Cada propriedade pode ter seus próprios pastos, animais, funcionários e análises específicas.",
  },
  {
    question: "Como funciona o controle de estoque e inventário?",
    answer:
      "O sistema permite cadastrar todos os itens do inventário (rações, medicamentos, insumos), registrar movimentações de entrada e saída, controlar consumo por localização e calcular custos por animal baseado na presença nos pastos. Você pode adicionar observações e anexos a cada item para documentação completa.",
  },
  {
    question: "Como faço para obter suporte?",
    answer:
      "Oferecemos suporte por email para o plano Básico e suporte prioritário 24/7 para o plano Empresarial. Nossa equipe está sempre pronta para ajudar com qualquer dúvida ou problema que você possa ter. Também oferecemos documentação completa, tutoriais e fórum de suporte.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Absolutamente! Utilizamos tecnologia de ponta para garantir a segurança dos seus dados. Todos os dados são armazenados na nuvem com criptografia e backups automáticos, garantindo total segurança e confiabilidade. Você mantém controle total sobre seus dados e pode exportá-los a qualquer momento.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais. Seu acesso permanecerá ativo até o final do período já pago. Todos os seus dados permanecerão seguros e você pode reativar sua conta quando desejar.",
  },
  {
    question: "O sistema funciona offline?",
    answer:
      "O Boi na Nuvem é uma aplicação web que funciona melhor com conexão à internet. No entanto, estamos trabalhando em funcionalidades offline para áreas rurais com conexão limitada. Entre em contato para saber mais sobre nossas funcionalidades futuras.",
  },
] as const;

export const BLOG_POSTS = [
  {
    category: "Gestão",
    categoryColor: COLORS.secondary,
    title: "Como melhorar a gestão do seu rebanho com tecnologia",
    date: "2 dias atrás",
    readTime: "5 min de leitura",
  },
  {
    category: "Produtividade",
    categoryColor: COLORS.primary,
    title: "5 dicas para aumentar a produtividade na sua fazenda de gado de corte",
    date: "3 dias atrás",
    readTime: "6 min de leitura",
  },
  {
    category: "Tendências",
    categoryColor: "oklch(55% 0.15 200)",
    title: "O futuro da pecuária: tecnologia e inovação na gestão de fazendas",
    date: "3 dias atrás",
    readTime: "6 min de leitura",
  },
] as const;

export const FOOTER_SECTIONS = [
  {
    title: "Como Funciona",
    links: [
      "Documentação",
      "Tutoriais",
      "Funcionalidades",
      "Fórum de Suporte",
      "API",
      "Blog Boi na Nuvem",
    ],
  },
  {
    title: "Sobre Nós",
    links: ["Quem Somos", "Nossa História", "Equipe", "Trabalhe Conosco", "Imprensa", "Contato"],
  },
  {
    title: "Recursos",
    links: [
      "Central de Ajuda",
      "Fórum de Suporte",
      "Vídeos Tutoriais",
      "Blog Boi na Nuvem",
      "Contato",
    ],
  },
  {
    title: "Precisa de Ajuda?",
    links: [
      "📞 (11) 9999-9999",
      "✉️ contato@boinanuvem.com.br",
      "📅 Seg - Sex | 08:00 - 18:00",
      "📅 Sábado | 09:00 - 13:00",
    ],
  },
] as const;

export const TRUSTED_BRANDS = ["CNN", "GitHub", "Google", "PayPal", "Vimeo"] as const;

export const STATISTICS = [
  {
    number: "8+",
    label: "Módulos Principais",
    description: "Gestão completa da fazenda",
  },
  {
    number: "50+",
    label: "Funcionalidades",
    description: "Ferramentas poderosas",
  },
  {
    number: "3",
    label: "Idiomas",
    description: "PT, EN, ES",
  },
  {
    number: "100%",
    label: "Na Nuvem",
    description: "Acesso de qualquer lugar",
  },
] as const;

export const FEATURE_HIGHLIGHTS = [
  {
    icon: "📊",
    title: "Dashboard & Analytics",
    description:
      "Visão completa da operação com métricas em tempo real, gráficos interativos e indicadores-chave de desempenho.",
  },
  {
    icon: "🐄",
    title: "Gestão Reprodutiva",
    description:
      "Controle completo do ciclo reprodutivo, índices de performance, previsão de nascimentos e gestão genética.",
  },
  {
    icon: "💰",
    title: "Gestão Financeira",
    description:
      "Fluxo de caixa, contas a pagar/receber, múltiplas contas bancárias e análise de rentabilidade detalhada.",
  },
  {
    icon: "📦",
    title: "Controle de Estoque",
    description:
      "Gestão completa de inventário com controle de movimentações, consumo por localização e custos por animal.",
  },
  {
    icon: "📈",
    title: "Vendas & Rentabilidade",
    description:
      "Registro de vendas, análise de rentabilidade por animal, cálculo de spread e métricas de ROI.",
  },
  {
    icon: "👥",
    title: "Trabalho em Equipe",
    description:
      "Sistema de permissões granulares, múltiplos usuários e gestão completa de colaboradores e fornecedores.",
  },
] as const;
