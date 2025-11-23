import { useCallback, memo } from "react";
import { Section, SVGPlaceholder, Heading, Button, Badge } from "./ui";
import { SERVICES, FEATURES, COLORS } from "./constants";
import { useAutoRotate } from "./hooks";

export const Services = memo(function Services() {
  const [activeTab, setActiveTab] = useAutoRotate({ itemsCount: SERVICES.length });

  const handleTabClick = useCallback(
    (index: number) => {
      setActiveTab(index);
    },
    [setActiveTab]
  );

  return (
    <Section
      id="section-services"
      className="bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      <div className="text-center mb-12">
        <Heading level={2} color="secondary" className="mb-4">
          Funcionalidades <span className="text-primary">Completas</span>
        </Heading>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Explore todas as áreas de gestão disponíveis no Boi na Nuvem. Clique em cada
          funcionalidade para saber mais detalhes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div className="flex items-center justify-center order-2 md:order-1">
          {activeTab === 0 ? (
            <div className="flex items-center justify-center w-full">
              <img
                src="/images/livestock.png"
                alt="Gestão de Propriedades e Pastos"
                className="rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ maxWidth: "450px", width: "100%", height: "auto", objectFit: "contain" }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <SVGPlaceholder variant="service" index={activeTab} />
            </div>
          )}
        </div>
        <div className="space-y-4 order-1 md:order-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {SERVICES.map((item, index) => (
            <div
              key={index}
              className={`cursor-pointer p-6 rounded-xl transition-all duration-300 ${
                activeTab === index
                  ? "border-l-4 border-primary shadow-lg scale-[1.02]"
                  : "hover:shadow-md hover:scale-[1.01] hover:border-l-2 hover:border-primary/30"
              } ${
                activeTab === index
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              }`}
              onClick={() => handleTabClick(index)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    activeTab === index
                      ? "bg-primary text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <Heading level={4} color="secondary" className="mb-2">
                    {item.title}
                  </Heading>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    {item.content}
                  </p>
                  {activeTab === index && (
                    <div className="mt-4 h-1 rounded-full w-full bg-primary" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-24">
        <div className="text-center mb-12">
          <Heading level={2} color="secondary" className="mb-4">
            Por que <span className="text-primary">Escolher</span> o Boi na Nuvem
          </Heading>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Tecnologia de ponta, integração completa, ferramentas poderosas e suporte excepcional.
            Transforme a gestão da sua fazenda com soluções digitais modernas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => {
            const isEven = index % 2 === 0;
            const badgeColor = isEven ? COLORS.primary : COLORS.secondary;
            const buttonVariant = isEven ? "primary" : "secondary";

            return (
              <div
                key={index}
                className={`p-8 rounded-2xl relative overflow-hidden ${
                  isEven ? "bg-gray-100 dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"
                }`}
              >
                <Badge color={badgeColor} className="mb-4">
                  {feature.badge}
                </Badge>
                <Heading level={3} color="dark" className="mb-4">
                  {feature.title}
                </Heading>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {feature.content}
                </p>
                <Button href="#" variant={buttonVariant} size="md">
                  {feature.button}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
});
