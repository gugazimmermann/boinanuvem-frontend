import { useState, useCallback, memo } from "react";
import { Section, Heading } from "./ui";
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
            Perguntas <span style={{ color: COLORS.primary }}>Frequentes</span>
          </Heading>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Tire suas dúvidas sobre o Boi na Nuvem. Encontre respostas para as principais perguntas sobre nosso sistema de gestão para fazendas de gado de corte.
          </p>
          <div className="hidden lg:block flex items-center justify-center">
            <img
              src="/images/cow_%.png"
              alt="Perguntas Frequentes"
              className="rounded-2xl"
              style={{ maxWidth: "500px", width: "100%", height: "auto", objectFit: "contain" }}
            />
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-200">
          {FAQS.map((faq, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center py-4 text-left hover:opacity-80 transition cursor-pointer"
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
