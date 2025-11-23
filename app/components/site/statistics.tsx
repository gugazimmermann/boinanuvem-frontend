import { Section, Heading } from "./ui";
import { STATISTICS } from "./constants";

export function Statistics() {
  return (
    <Section className="bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 via-gray-900 to-gray-950">
      <div className="text-center mb-12">
        <Heading level={2} color="secondary" className="mb-4">
          Por que <span className="text-primary">Milhares</span> de Fazendas Confiam no Boi na Nuvem
        </Heading>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Um sistema completo, poderoso e intuitivo que transforma a gestão da sua fazenda
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {STATISTICS.map((stat, index) => (
          <div
            key={index}
            className="text-center p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 transition-transform duration-300 hover:scale-110">
              {stat.number}
            </div>
            <div className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {stat.label}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              {stat.description}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
