// Brand Colors
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

// Navigation Links
export const NAV_LINKS = [
  { href: "#section-services", label: "Services" },
  { href: "#section-examples", label: "Examples" },
  { href: "#section-pricing", label: "Pricing" },
  { href: "#section-faqs", label: "FAQs" },
  { href: "#section-blog", label: "Blog" },
] as const;

// Services Data
export const SERVICES = [
  {
    title: "Connect Your Apps",
    content:
      "Bridging the gap between apps, simplifying tasks and maximizing productivity by fostering seamless communication and efficient synergy.",
  },
  {
    title: "Get More Features",
    content:
      "Unleash your creativity with an expansive website builder toolkit, providing advanced features for unparalleled design and functionality.",
  },
  {
    title: "Automations to the Max",
    content:
      "Empower your website with advanced automation tools, enhancing user experience through intelligent, streamlined processes and personalized interactions.",
  },
] as const;

// Features Data
export const FEATURES = [
  {
    badge: "Speed Optimization",
    title: "92% Faster",
    content:
      "Experience ~92% faster results with our optimized processes. Accelerate Projects and Achieve Goals effortlessly.",
    button: "Discover the Speed",
  },
  {
    badge: "Flexible",
    title: "More Flexible",
    content:
      "Unlock unparalleled flexibility with our adaptive solutions, tailor-made to match your unique needs.",
    button: "More Flexible",
  },
  {
    badge: "Customizable",
    title: "100% Customizable",
    content:
      "Achieve your vision with 100% customizable solutions, where every detail reflects your brand identity and goals.",
    button: "Customize Now",
  },
] as const;

// Pricing Plans
export const PRICING_PLANS = [
  {
    name: "Basic",
    description: "Best Plan for Startup Plan.",
    monthlyPrice: "$5",
    annualPrice: "$60",
    features: [
      "SEO Features",
      "1 Users Access",
      "100 User Accounts",
      "1 Year License",
      "24/7 Support",
    ],
    popular: true,
  },
  {
    name: "Business",
    description: "A Perfect Business Plan For Your Full Team.",
    monthlyPrice: "$49",
    annualPrice: "$588",
    features: [
      "Unlimited Niche Demos",
      "SEO Features",
      "Ultimate Access",
      "All User Accounts",
      "Ultimate License",
      "24/7 Support",
    ],
    popular: false,
  },
] as const;

// FAQs Data
export const FAQS = [
  {
    question: "How do I become an author?",
    answer:
      "Assertively envisioneer out-of-the-box methodologies support strategic niches. Globally restore magnetic value before business resources. Interactively scale front-end niche markets before cross-platform partnerships. Dramatically myocardinate front-end synergy whereas best-of-breed users. Efficiently generate world-class action items with revolutionary growth strategies.",
  },
  {
    question: "An introduction to the marketplaces for authors?",
    answer:
      "Assertively envisioneer out-of-the-box methodologies support strategic niches. Globally restore magnetic value before business resources. Interactively scale front-end niche markets before cross-platform partnerships.",
  },
  {
    question: "Helpful resources for authors?",
    answer:
      "Assertively envisioneer out-of-the-box methodologies support strategic niches. Globally restore magnetic value before business resources. Interactively scale front-end niche markets before cross-platform partnerships. Dramatically myocardinate front-end synergy whereas best-of-breed users.",
  },
  {
    question: "How can I get support for an item which isn't working correctly?",
    answer:
      "Assertively envisioneer out-of-the-box methodologies support strategic niches. Globally restore magnetic value before business resources. Interactively scale front-end niche markets before cross-platform partnerships.",
  },
  {
    question: "Can I use trademarked names in my items?",
    answer:
      "Assertively envisioneer out-of-the-box methodologies support strategic niches. Globally restore magnetic value before business resources. Interactively scale front-end niche markets before cross-platform partnerships.",
  },
  {
    question: "How much licences can I sale?",
    answer:
      "Assertively envisioneer out-of-the-box methodologies support strategic niches. Globally restore magnetic value before business resources. Interactively scale front-end niche markets before cross-platform partnerships.",
  },
  {
    question: "How do i return my products?",
    answer:
      "Assertively envisioneer out-of-the-box methodologies support strategic niches. Globally restore magnetic value before business resources. Interactively scale front-end niche markets before cross-platform partnerships.",
  },
] as const;

// Blog Posts
export const BLOG_POSTS = [
  {
    category: "Minimalism",
    categoryColor: COLORS.secondary,
    title: "Mastering Minimalism: Crafting Powerful Designs with Less",
    date: "2 days ago",
    readTime: "5 min read",
  },
  {
    category: "Communication",
    categoryColor: COLORS.primary,
    title:
      "Color Psychology in Design: Unveiling the Emotive Palette of Visual Communication",
    date: "3 days ago",
    readTime: "6 min read",
  },
  {
    category: "Trends",
    categoryColor: "oklch(55% 0.15 200)",
    title:
      "Navigating UX/UI Trends: Designing Intuitive Digital Experiences for Modern Audiences",
    date: "3 days ago",
    readTime: "6 min read",
  },
] as const;

// Footer Sections
export const FOOTER_SECTIONS = [
  {
    title: "How we Work",
    links: [
      "Documentation",
      "Feedback",
      "Plugins",
      "Support Forums",
      "Themes",
      "Boi na Nuvem Blog",
    ],
  },
  {
    title: "About Us",
    links: [
      "Feedback",
      "Documentation",
      "Plugins",
      "Support Forums",
      "Themes",
      "Contact Us",
    ],
  },
  {
    title: "How we do",
    links: [
      "Plugins",
      "Support Forums",
      "Themes",
      "Boi na Nuvem Blog",
      "Contact Us",
    ],
  },
  {
    title: "Need Help?",
    links: [
      "📞 +0 (11) 222 333",
      "✉️ no-reply@canvas.com",
      "📅 Mon - Sat | 09:00 - 16:00",
      "📅 Sunday Closed",
    ],
  },
] as const;

// Trusted Brands
export const TRUSTED_BRANDS = ["CNN", "GitHub", "Google", "PayPal", "Vimeo"] as const;

