import { Section } from "./ui";
import { TRUSTED_BRANDS, COLORS } from "./constants";

const BrandLogo = ({ name }: { name: string }) => (
  <svg viewBox="0 0 120 46" className="h-[46px] w-auto opacity-60">
    <rect width="120" height="46" fill="#e0e0e0" rx="4" />
    <text x="60" y="28" textAnchor="middle" fill="#666" fontSize="12" fontFamily="Arial" fontWeight="bold">
      {name}
    </text>
  </svg>
);

export function TrustedBy() {
  return (
    <Section
      padding="sm"
      className="border-t border-b border-gray-300"
      style={{
        background: `linear-gradient(90deg, ${COLORS.bgLight} 0%, ${COLORS.bgLightSecondary} 50%, ${COLORS.bgLight} 100%)`,
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="font-medium text-gray-700 hidden lg:block">Confiança de mais de 500 fazendas —</p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
          {TRUSTED_BRANDS.map((brand) => (
            <BrandLogo key={brand} name={brand} />
          ))}
        </div>
      </div>
    </Section>
  );
}
