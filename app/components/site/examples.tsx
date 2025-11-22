import { Section, Heading } from "./ui";
import { COLORS } from "./constants";

const FEATURES_LIST = [
  "Gestão Completa de Propriedades e Pastos",
  "Controle Total de Animais e Peso",
  "Registro de Nascimentos e Reprodução",
] as const;

export function Examples() {
  return (
    <Section
      id="section-examples"
      className="text-white relative bg-gradient-to-br from-secondary via-secondary-dark to-primary"
    >
      <div className="max-w-3xl">
        <span className="text-xs uppercase tracking-widest mb-4 block text-white/80">
          Saiba Mais Sobre Nós
        </span>
        <Heading level={2} className="mb-6" customColor="white">
          Boi na Nuvem é uma Plataforma Completa e Poderosa para Gestão de Fazendas de Gado de
          Corte.
        </Heading>
        <ul className="space-y-2 text-white/90">
          {FEATURES_LIST.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="mr-2" style={{ color: COLORS.primaryLight }}>
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
