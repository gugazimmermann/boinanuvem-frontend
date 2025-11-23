import { Section, Heading, Button, Badge } from "./ui";
import { COLORS } from "./constants";
import { ROUTES } from "../../routes.config";

export function CTA() {
  return (
    <Section className="text-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto">
        <Badge color={COLORS.secondary} className="mb-4">
          Boi na Nuvem
        </Badge>
        <Heading level={2} color="dark" className="mb-6">
          Transforme a gestão da sua fazenda com tecnologia de ponta.
        </Heading>
        <p className="text-xl mb-8 leading-relaxed text-gray-600 dark:text-gray-300">
          Experimente a melhor solução de gestão para fazendas de gado de corte. Sistema completo,
          intuitivo e poderoso, desenvolvido especialmente para otimizar a administração da sua
          propriedade e aumentar a produtividade do seu rebanho.
        </p>
        <Button href={ROUTES.REGISTER} size="lg" variant="primary">
          Começar Agora
        </Button>
      </div>
    </Section>
  );
}
