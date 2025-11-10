import { useState, useCallback, memo } from "react";
import { Section, Heading, SVGPlaceholder } from "./ui";
import { FAQS, COLORS } from "./constants";

export const FAQs = memo(function FAQs() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = useCallback((index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  }, []);

  return (
    <Section
      id="section-faqs"
      style={{
        background: `linear-gradient(180deg, white 0%, ${COLORS.bgLightTertiary} 30%, ${COLORS.bgLightSecondary} 60%, white 100%)`,
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <Heading level={2} color="secondary" className="mb-4">
            Frequently asked <span style={{ color: COLORS.primary }}>Questions</span>
          </Heading>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Assertively provide access to cutting edge e-markets support proactive resources rapidiously.
          </p>
          <div className="hidden lg:block">
            <SVGPlaceholder variant="faq" width={500} height={500} label="FAQs Image" />
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-200">
          {FAQS.map((faq, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center py-4 text-left hover:opacity-80 transition"
              >
                <span className="font-semibold text-gray-800">{faq.question}</span>
                <span className="text-xl text-gray-500 ml-4">
                  {openFaq === index ? "−" : "+"}
                </span>
              </button>
              {openFaq === index && (
                <div className="pb-4 text-gray-600 leading-relaxed">{faq.answer}</div>
              )}
              {index < FAQS.length - 1 && <div className="border-t border-gray-200" />}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
});
