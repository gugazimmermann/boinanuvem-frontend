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
        "Boi na Nuvem - Create powerful websites easily with our highly customizable platform.",
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
