import { Section, Heading, Button, Badge } from "./ui";
import { COLORS } from "./constants";

export function CTA() {
  return (
    <Section
      className="text-center"
      style={{
        background: `linear-gradient(135deg, ${COLORS.bgLightTertiary} 0%, ${COLORS.bgLightSecondary} 50%, ${COLORS.bgLight} 100%)`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <Badge color={COLORS.secondary} className="mb-4">
          Boi na Nuvem
        </Badge>
        <Heading level={2} color="dark" className="mb-6">
          Crafted to Captivate Attention & Leave a Lasting Impact.
        </Heading>
        <p className="text-xl mb-8 leading-relaxed" style={{ color: COLORS.textMedium }}>
          Experience the pinnacle of creativity and craftsmanship with our high-quality designs, meticulously curated to enhance your brand's identity and resonate powerfully with your audience.
        </p>
        <Button href="#" size="lg" variant="primary">
          Browse Layouts
        </Button>
      </div>
    </Section>
  );
}
