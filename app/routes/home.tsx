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
  CTA,
  Blog,
  Footer,
  ScrollToTop,
} from "../components/site";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Boi na Nuvem" },
    {
      name: "description",
      content:
        "Boi na Nuvem - Sistema completo de gestão para fazendas de gado de corte. Gerencie propriedades, pastos, animais, pesos, nascimentos, finanças, estoque, vendas e muito mais. Dashboard interativo, análises avançadas e relatórios detalhados.",
    },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <Hero />
      <Statistics />
      <TrustedBy />
      <Services />
      <FeatureHighlights />
      <Examples />
      <Pricing />
      <FAQs />
      <CTA />
      <Blog />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
