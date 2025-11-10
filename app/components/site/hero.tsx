import { Heading, Button, Section, SVGPlaceholder } from "./ui";
import { COLORS } from "./constants";
import { ROUTES } from "../../routes.config";

export function Hero() {
  return (
    <Section
      padding="md"
      style={{
        background: `linear-gradient(135deg, ${COLORS.bgLight} 0%, ${COLORS.bgLightSecondary} 50%, ${COLORS.bgLightTertiary} 100%)`,
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
        <div className="text-center lg:text-left">
          <Heading level={1} color="secondary" className="mb-6">
            Build Powerful Websites in a flash.
          </Heading>
          <p className="text-xl mb-8 text-gray-600 leading-relaxed">
            Transforming Your Ideas into Stunning Websites with Intuitive Tools and Limitless Possibilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button href={ROUTES.LOGIN} size="lg" variant="primary">
              ⭐ Get Started
            </Button>
            <Button href="#" size="lg" variant="outline">
              🎧 Contact Us
            </Button>
          </div>
        </div>
        <div className="hidden lg:block">
          <SVGPlaceholder variant="hero" width={600} height={500} label="Hero Image" />
        </div>
      </div>
    </Section>
  );
}
