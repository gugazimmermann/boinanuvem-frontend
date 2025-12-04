import type { Route } from "./+types/home";
import {
  Header,
  Hero,
  Statistics,
  TrustedBy,
  Services,
  FeatureHighlights,
  Examples,
  Pricing,
  FAQs,
  Cta,
  Blog,
  Footer,
  ScrollToTop,
} from "../components/site";
import { createSEOMeta } from "../utils/seo-meta";
import { fetchPlans } from "../services/plans.service";
import type { Plan } from "~/types/plan";

export function meta(_args: Route.MetaArgs) {
  return createSEOMeta({
    title: "Boi na Nuvem",
    description:
      "Sistema completo de gestão para fazendas de gado de corte. Gerencie propriedades, pastos, animais, pesos, nascimentos, finanças, estoque, vendas e muito mais. Dashboard interativo, análises avançadas e relatórios detalhados.",
    url: "/",
    type: "website",
  });
}

export function links() {
  return [{ rel: "canonical", href: "https://boinanuvem.com.br/" }];
}

export async function loader(): Promise<{ plans: Plan[] }> {
  try {
    const plans = await fetchPlans({ status: "active" });
    return { plans };
  } catch (error) {
    console.error("Failed to load plans:", error);
    // Re-throw the error so React Router can handle it with an error boundary
    throw new Error("Failed to load pricing plans. Please try again later.");
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { plans } = loaderData;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://boinanuvem.com.br/#organization",
        name: "Boi na Nuvem",
        url: "https://boinanuvem.com.br",
        logo: "https://boinanuvem.com.br/images/farm.png",
        description:
          "Sistema completo de gestão para fazendas de gado de corte. Gerencie propriedades, pastos, animais, pesos, nascimentos, finanças, estoque, vendas e muito mais.",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+55-11-9999-9999",
          contactType: "customer service",
          email: "contato@boinanuvem.com.br",
          availableLanguage: ["Portuguese", "English", "Spanish"],
        },
        sameAs: [],
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://boinanuvem.com.br/#software",
        name: "Boi na Nuvem",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "49.90",
          priceCurrency: "BRL",
          availability: "https://schema.org/InStock",
        },
        description:
          "Sistema completo de gestão para fazendas de gado de corte com gestão de propriedades, pastos, animais, pesos, nascimentos, finanças, estoque, vendas, análises avançadas e relatórios detalhados.",
        featureList: [
          "Gestão de Propriedades e Pastos",
          "Controle de Animais e Peso",
          "Gestão de Nascimentos e Reprodução",
          "Gestão Financeira Completa",
          "Controle de Estoque e Inventário",
          "Vendas e Análise de Rentabilidade",
          "Equipe e Colaboradores",
          "Dashboard e Relatórios",
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "500",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <Hero />
        <Statistics />
        <TrustedBy />
        <Services />
        <FeatureHighlights />
        <Examples />
        <Pricing plans={plans} />
        <FAQs />
        <Cta />
        <Blog />
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}
