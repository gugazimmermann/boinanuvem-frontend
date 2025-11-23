import { Heading, Button, Section } from "./ui";
import { ROUTES } from "../../routes.config";

export function Hero() {
  return (
    <Section
      padding="md"
      className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <div className="mb-4">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-primary/10 text-primary dark:bg-primary/20 mb-4">
              🚀 Sistema Completo de Gestão
            </span>
          </div>
          <Heading level={1} color="secondary" className="mb-6">
            Transforme sua fazenda de gado de corte com tecnologia de ponta
          </Heading>
          <p className="text-xl mb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
            Sistema completo e integrado para gestão de propriedades, pastos, animais, reprodução,
            finanças, estoque e vendas. Tudo em um só lugar, com análises avançadas e relatórios
            detalhados.
          </p>
          <div className="mb-8 space-y-2">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-700 dark:text-gray-300">
              <span className="text-primary">✓</span>
              <span>Gestão completa do rebanho e operação</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-700 dark:text-gray-300">
              <span className="text-primary">✓</span>
              <span>Análises e relatórios em tempo real</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-700 dark:text-gray-300">
              <span className="text-primary">✓</span>
              <span>Acesso de qualquer lugar, a qualquer hora</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button href={ROUTES.REGISTER} size="lg" variant="primary">
              ⭐ Começar Agora - Grátis
            </Button>
            <Button href="#section-services" size="lg" variant="outline">
              📖 Conhecer Funcionalidades
            </Button>
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative">
            <img
              src="/images/livestock_number.png"
              alt="Boi na Nuvem - Gestão de Fazendas"
              className="rounded-2xl mx-auto shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ maxWidth: "450px", width: "100%", height: "auto", objectFit: "contain" }}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
