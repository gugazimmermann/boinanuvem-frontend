import { Section, Heading } from "./ui";
import { COLORS } from "./constants";

const FEATURES_LIST = [
  "Powered by SemiColonWeb",
  "Ultimate Design",
  "Multi-Purpose Template",
] as const;

export function Examples() {
  return (
    <Section
      id="section-examples"
      className="text-white relative"
      style={{
        background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.secondaryDark} 50%, ${COLORS.primary} 100%)`,
      }}
    >
      <div className="max-w-3xl">
        <span
          className="text-xs uppercase tracking-widest mb-4 block"
          style={{ color: COLORS.textLight }}
        >
          Know More About Us
        </span>
        <Heading level={2} className="mb-6" customColor="white">
          Boi na Nuvem is a Powerful & Raw Multipurpose Platform.
        </Heading>
        <ul className="space-y-2" style={{ color: COLORS.textLight }}>
          {FEATURES_LIST.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="mr-2" style={{ color: COLORS.primary }}>
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
