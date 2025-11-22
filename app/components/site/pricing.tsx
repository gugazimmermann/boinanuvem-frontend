import { useState, memo } from "react";
import { Section, Heading, Button } from "./ui";
import { PRICING_PLANS } from "./constants";
import { ROUTES } from "../../routes.config";

export const Pricing = memo(function Pricing() {
  const [isMonthly, setIsMonthly] = useState(true);

  return (
    <Section
      id="section-pricing"
      className="bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      <div className="text-center mb-12">
        <Heading level={2} color="secondary" className="mb-4">
          Planos que <span className="text-primary">cabem no seu bolso</span> sem comprometer
          qualidade
        </Heading>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          Opções flexíveis de preços para diferentes tamanhos de propriedade
          <br />
          Garanta eficiência e economia sem abrir mão de funcionalidades essenciais.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-full border-2 border-gray-300 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
          {(["Mensal", "Anual"] as const).map((label, index) => {
            const isActive = (index === 0 && isMonthly) || (index === 1 && !isMonthly);
            return (
              <button
                key={label}
                onClick={() => setIsMonthly(index === 0)}
                className={`px-6 py-2 rounded-full transition font-medium cursor-pointer ${
                  isActive ? "bg-primary text-white" : "text-gray-600 dark:text-gray-400"
                }`}
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
          const buttonVariant = plan.popular ? "primary" : "secondary";

          return (
            <div
              key={index}
              className={`relative p-8 rounded-2xl ${plan.popular ? "shadow-lg" : ""} ${
                plan.popular
                  ? "bg-white dark:bg-gray-800 border-2 border-primary"
                  : "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-8 px-3 py-1 rounded-full text-sm border-2 font-medium text-white bg-primary border-primary">
                  Mais Popular
                </span>
              )}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <Heading level={3} color="secondary" className="mb-2">
                    {plan.name}
                  </Heading>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary">{price}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">por {period}</div>
                </div>
              </div>
              <div
                className={`mb-6 border-t-2 pt-5 ${
                  plan.popular ? "border-primary" : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <p className="font-bold mb-3 text-lg text-gray-900 dark:text-gray-100">Inclui:</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => {
                    const [firstWord, ...rest] = feature.split(" ");
                    return (
                      <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="mr-2 text-primary">✓</span>
                        <strong className="text-gray-900 dark:text-gray-100">
                          {firstWord}
                        </strong>{" "}
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
