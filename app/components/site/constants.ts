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
      "Controle completo de suas propriedades e pastos. Cadastre áreas, delimite pastagens, monitore capacidade de lotação e gerencie rotação de pastos de forma eficiente.",
  },
  {
    title: "Controle de Animais e Peso",
    content:
      "Registre todos os seus animais com informações detalhadas. Acompanhe o peso ao longo do tempo, histórico de vacinações, tratamentos e muito mais.",
  },
  {
    title: "Gestão de Nascimentos e Reprodução",
    content:
      "Registre nascimentos, controle o ciclo reprodutivo das matrizes, acompanhe prenhezes e gerencie a genética do seu rebanho com relatórios completos e precisos.",
  },
] as const;

export const FEATURES = [
  {
    badge: "Eficiência",
    title: "Economia de Tempo",
    content:
      "Reduza em até 70% o tempo gasto com planilhas e controles manuais. Automatize processos e foque no que realmente importa: sua produção.",
    button: "Conheça a Eficiência",
  },
  {
    badge: "Flexível",
    title: "Totalmente Adaptável",
    content:
      "Sistema flexível que se adapta à realidade da sua fazenda. Configure conforme suas necessidades e dimensões do seu negócio.",
    button: "Mais Flexibilidade",
  },
  {
    badge: "Completo",
    title: "Gestão Completa",
    content:
      "Tudo em um só lugar: propriedades, pastos, animais, pesos, nascimentos, saúde, reprodução e muito mais. Gestão completa do seu rebanho.",
    button: "Ver Funcionalidades",
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
      "O Boi na Nuvem é um sistema completo de gestão para fazendas de gado de corte. Você pode cadastrar suas propriedades, pastos, animais, registrar pesos, nascimentos, vacinações e muito mais. Tudo de forma simples e intuitiva, com acesso de qualquer lugar através da nuvem.",
  },
  {
    question: "Preciso de conhecimento técnico para usar?",
    answer:
      "Não! O sistema foi desenvolvido pensando na simplicidade. A interface é intuitiva e fácil de usar. Além disso, oferecemos treinamento e suporte completo para ajudar você a aproveitar ao máximo todas as funcionalidades.",
  },
  {
    question: "Posso usar em múltiplas propriedades?",
    answer:
      "Sim! Dependendo do seu plano, você pode gerenciar uma ou múltiplas propriedades. O plano Empresarial permite propriedades ilimitadas, ideal para grandes fazendas ou grupos empresariais.",
  },
  {
    question: "Como faço para obter suporte?",
    answer:
      "Oferecemos suporte por email para o plano Básico e suporte prioritário 24/7 para o plano Empresarial. Nossa equipe está sempre pronta para ajudar com qualquer dúvida ou problema que você possa ter.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Absolutamente! Utilizamos tecnologia de ponta para garantir a segurança dos seus dados. Todos os dados são armazenados na nuvem com criptografia e backups automáticos, garantindo total segurança e confiabilidade.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais. Seu acesso permanecerá ativo até o final do período já pago.",
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
