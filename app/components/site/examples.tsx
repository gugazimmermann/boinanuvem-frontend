import { Section, Heading } from "./ui";
import { COLORS } from "./constants";

const FEATURES_LIST = [
  "Gestão Completa de Propriedades e Pastos com Mapas Interativos",
  "Controle Total de Animais com Rastreamento de Peso e Movimentações",
  "Registro de Nascimentos e Gestão Reprodutiva Completa",
  "Sistema Financeiro Integrado: Fluxo de Caixa, Contas a Pagar/Receber",
  "Controle de Estoque e Inventário com Análise de Consumo",
  "Vendas e Análise de Rentabilidade com Cálculo de ROI",
  "Dashboard Interativo com Métricas e Gráficos em Tempo Real",
  "Gestão de Equipe com Sistema de Permissões Granulares",
  "Índices Reprodutivos e Previsão de Nascimentos",
  "Multi-idioma: Português, Inglês e Espanhol",
] as const;

export function Examples() {
  return (
    <Section
      id="section-examples"
      className="text-white relative bg-gradient-to-br from-secondary via-secondary-dark to-primary overflow-hidden"
    >
      <div className="relative z-10 max-w-4xl">
        <span className="text-xs uppercase tracking-widest mb-4 block text-white/80">
          Saiba Mais Sobre Nós
        </span>
        <Heading level={2} className="mb-6" customColor="white">
          Boi na Nuvem é uma Plataforma Completa e Poderosa para Gestão de Fazendas de Gado de Corte
        </Heading>
        <p className="text-lg mb-8 text-white/90 leading-relaxed">
          Um sistema integrado que une todas as áreas da sua operação em uma única plataforma,
          proporcionando visão completa, análises avançadas e controle total da sua fazenda.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES_LIST.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <span className="text-xl mt-1" style={{ color: COLORS.primaryLight }}>
                ✓
              </span>
              <span className="text-white/90 leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
