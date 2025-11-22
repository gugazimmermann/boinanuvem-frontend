import { useState, useCallback, memo } from "react";
import { Section, Heading } from "./ui";
import { FAQS } from "./constants";

export const FAQs = memo(function FAQs() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = useCallback((index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  }, []);

  return (
    <Section
      id="section-faqs"
      className="bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <Heading level={2} color="secondary" className="mb-4">
            Perguntas <span className="text-primary">Frequentes</span>
          </Heading>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Tire suas dúvidas sobre o Boi na Nuvem. Encontre respostas para as principais perguntas
            sobre nosso sistema de gestão para fazendas de gado de corte.
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
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
          {FAQS.map((faq, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center py-4 text-left hover:opacity-80 transition cursor-pointer"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {faq.question}
                </span>
                <span className="text-xl text-gray-500 dark:text-gray-400 ml-4">
                  {openFaq === index ? "−" : "+"}
                </span>
              </button>
              {openFaq === index && (
                <div className="pb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </div>
              )}
              {index < FAQS.length - 1 && (
                <div className="border-t border-gray-200 dark:border-gray-700" />
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
});
