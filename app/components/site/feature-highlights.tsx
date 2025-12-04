import { Section, Heading } from "./ui";
import { FEATURE_HIGHLIGHTS } from "./constants";

export function FeatureHighlights() {
  return (
    <Section
      id="section-features"
      className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
    >
      <div className="text-center mb-12">
        <Heading level={2} color="secondary" className="mb-4">
          Funcionalidades <span className="text-primary">Principais</span>
        </Heading>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Descubra as principais áreas de gestão que o Boi na Nuvem oferece para transformar sua
          operação
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {FEATURE_HIGHLIGHTS.map((feature, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={feature.title}
              className={`p-6 lg:p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                isEven
                  ? "bg-white dark:bg-gray-800 border-2 border-primary/20 hover:border-primary/40"
                  : "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="text-5xl mb-4 transition-transform duration-300 hover:scale-110 inline-block">
                {feature.icon}
              </div>
              <Heading level={3} color="dark" className="mb-3">
                {feature.title}
              </Heading>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
