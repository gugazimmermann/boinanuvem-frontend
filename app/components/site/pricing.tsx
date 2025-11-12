import { useState, memo } from "react";
import { Section, Heading, Button } from "./ui";
import { PRICING_PLANS, COLORS } from "./constants";
import { ROUTES } from "../../routes.config";

export const Pricing = memo(function Pricing() {
  const [isMonthly, setIsMonthly] = useState(true);

  return (
    <Section
      id="section-pricing"
      style={{
        background: `linear-gradient(180deg, white 0%, ${COLORS.bgLightSecondary} 30%, ${COLORS.bgLightTertiary} 60%, white 100%)`,
      }}
    >
      <div className="text-center mb-12">
        <Heading level={2} color="secondary" className="mb-4">
          Planos que <span style={{ color: COLORS.primary }}>cabem no seu bolso</span> sem
          comprometer qualidade
        </Heading>
        <p className="text-xl text-gray-600 leading-relaxed">
          Opções flexíveis de preços para diferentes tamanhos de propriedade
          <br />
          Garanta eficiência e economia sem abrir mão de funcionalidades essenciais.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-full border-2 border-gray-300 p-1 bg-white">
          {(["Mensal", "Anual"] as const).map((label, index) => {
            const isActive = (index === 0 && isMonthly) || (index === 1 && !isMonthly);
            return (
              <button
                key={label}
                onClick={() => setIsMonthly(index === 0)}
                className="px-6 py-2 rounded-full transition font-medium cursor-pointer"
                style={
                  isActive
                    ? { backgroundColor: COLORS.primary, color: "white" }
                    : { color: COLORS.textMedium }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {PRICING_PLANS.map((plan, index) => {
          const price = isMonthly ? plan.monthlyPrice : plan.annualPrice;
          const period = isMonthly ? "mês" : "ano";
          const borderColor = plan.popular ? COLORS.primary : COLORS.bgLightSecondary;
          const buttonVariant = plan.popular ? "primary" : "secondary";

          return (
            <div
              key={index}
              className={`relative p-8 rounded-2xl ${plan.popular ? "shadow-lg" : ""}`}
              style={
                plan.popular
                  ? {
                      backgroundColor: "white",
                      border: "2px solid",
                      borderColor: COLORS.primary,
                    }
                  : {
                      backgroundColor: COLORS.bgLightTertiary,
                      border: "1px solid",
                      borderColor: COLORS.bgLightSecondary,
                    }
              }
            >
              {plan.popular && (
                <span
                  className="absolute -top-4 left-8 px-3 py-1 rounded-full text-sm border-2 font-medium text-white"
                  style={{
                    backgroundColor: COLORS.primary,
                    borderColor: COLORS.primary,
                  }}
                >
                  Mais Popular
                </span>
              )}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <Heading level={3} color="secondary" className="mb-2">
                    {plan.name}
                  </Heading>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold" style={{ color: COLORS.primary }}>
                    {price}
                  </div>
                  <div className="text-sm text-gray-500">por {period}</div>
                </div>
              </div>
              <div className="mb-6 border-t-2 pt-5" style={{ borderColor }}>
                <p className="font-bold mb-3 text-lg" style={{ color: COLORS.textDark }}>
                  Inclui:
                </p>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => {
                    const [firstWord, ...rest] = feature.split(" ");
                    return (
                      <li key={idx} className="flex items-center text-gray-700">
                        <span className="mr-2" style={{ color: COLORS.primary }}>
                          ✓
                        </span>
                        <strong style={{ color: COLORS.textDark }}>{firstWord}</strong>{" "}
                        {rest.join(" ")}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <Button href={ROUTES.LOGIN} variant={buttonVariant} fullWidth size="md">
                Começar Agora →
              </Button>
            </div>
          );
        })}
      </div>
    </Section>
  );
});
