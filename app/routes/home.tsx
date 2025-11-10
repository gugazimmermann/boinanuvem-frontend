import type { Route } from "./+types/home";
import {
  Header,
  Hero,
  TrustedBy,
  Services,
  WhyChooseUs,
  Examples,
  Pricing,
  FAQs,
  CTA,
  Blog,
  Footer,
  ScrollToTop,
} from "../components/site";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Boi na Nuvem" },
    {
      name: "description",
      content:
        "Boi na Nuvem - Sistema completo de gestão para fazendas de gado de corte. Gerencie propriedades, pastos, animais, pesos, nascimentos e muito mais.",
    },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <TrustedBy />
      <Services />
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
