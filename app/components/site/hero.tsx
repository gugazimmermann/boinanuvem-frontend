import { Heading, Button, Section } from "./ui";
import { ROUTES } from "../../routes.config";

export function Hero() {
  return (
    <Section
      padding="md"
      className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="text-center lg:text-left">
          <Heading level={1} color="secondary" className="mb-6">
            Gerencie sua fazenda de gado de corte com tecnologia de ponta.
          </Heading>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">
            Sistema completo de gestão para propriedades, pastos, animais, pesos, nascimentos e
            muito mais. Transforme a administração da sua fazenda com ferramentas intuitivas e
            poderosas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button href={ROUTES.LOGIN} size="lg" variant="primary">
              ⭐ Começar Agora
            </Button>
            <Button href="#" size="lg" variant="outline">
              🎧 Fale Conosco
            </Button>
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-center">
          <img
            src="/images/livestock_number.png"
            alt="Boi na Nuvem - Gestão de Fazendas"
            className="rounded-2xl mx-auto"
            style={{ maxWidth: "400px", width: "100%", height: "auto", objectFit: "contain" }}
          />
        </div>
      </div>
    </Section>
  );
}
