import { useCallback, memo } from "react";
import { Section, SVGPlaceholder, Heading, Button, Badge } from "./ui";
import { SERVICES, FEATURES, COLORS } from "./constants";
import { useAutoRotate } from "./hooks";

export const Services = memo(function Services() {
  const [activeTab, setActiveTab] = useAutoRotate({ itemsCount: SERVICES.length });

  const handleTabClick = useCallback((index: number) => {
    setActiveTab(index);
  }, [setActiveTab]);

  return (
    <Section
      id="section-services"
      style={{
        background: `linear-gradient(180deg, white 0%, ${COLORS.bgLight} 20%, white 100%)`,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div className="space-y-6">
          {SERVICES.map((item, index) => (
            <div
              key={index}
              className={`cursor-pointer p-6 rounded-lg transition ${
                activeTab === index ? "border-l-4" : "hover:opacity-80"
              }`}
              style={
                activeTab === index
                  ? {
                      backgroundColor: COLORS.bgLightSecondary,
                      borderColor: COLORS.primary,
                    }
                  : { backgroundColor: COLORS.bgLight }
              }
              onClick={() => handleTabClick(index)}
            >
              <Heading level={4} color="secondary" className="mb-2">
                {item.title}
              </Heading>
              <p className="text-gray-600 leading-relaxed">{item.content}</p>
              {activeTab === index && (
                <div
                  className="mt-4 h-1 rounded-full w-full"
                  style={{ backgroundColor: COLORS.primary }}
                />
              )}
            </div>
          ))}
        </div>
        <div>
          <SVGPlaceholder variant="service" index={activeTab} />
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mt-24">
        <div className="text-center mb-12">
          <Heading level={2} color="secondary" className="mb-4">
            Why you <span style={{ color: COLORS.primary }}>Choose</span> Us
          </Heading>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Visionary Design, Seamless Integration, Powerful Tools & Unmatched Support. Turning your Ideas into Digital Reality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => {
            const isEven = index % 2 === 0;
            const backgroundColor = isEven ? COLORS.bgLightSecondary : COLORS.bgLightTertiary;
            const badgeColor = isEven ? COLORS.primary : COLORS.secondary;
            const buttonVariant = isEven ? "primary" : "secondary";

            return (
              <div
                key={index}
                className="p-8 rounded-2xl relative overflow-hidden"
                style={{ backgroundColor }}
              >
                <Badge color={badgeColor} className="mb-4">
                  {feature.badge}
                </Badge>
                <Heading level={3} color="dark" className="mb-4">
                  {feature.title}
                </Heading>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.content}</p>
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
