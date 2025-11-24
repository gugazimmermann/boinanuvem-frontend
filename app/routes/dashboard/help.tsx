import type { Route } from "./+types/help";
import { useState, useMemo } from "react";
import { useTranslation } from "~/i18n";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Ajuda - Boi na Nuvem" },
    {
      name: "description",
      content: "Central de ajuda e perguntas frequentes do Boi na Nuvem",
    },
  ];
}

export default function Help() {
  const t = useTranslation();
  const [openFaq, setOpenFaq] = useState<string | null>("quick-start-guide");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const toggleFaq = (faqId: string) => {
    setOpenFaq((prev) => (prev === faqId ? null : faqId));
  };

  const faqCategories = useMemo(
    () => [
      { id: "getting-started", label: t.help.categories.gettingStarted },
      { id: "animals", label: t.help.categories.animals },
      { id: "locations", label: t.help.categories.locations },
      { id: "people", label: t.help.categories.people },
      { id: "records", label: t.help.categories.records },
      { id: "breedings", label: t.help.categories.breedings },
      { id: "inventory", label: t.help.categories.inventory },
      { id: "financial", label: t.help.categories.financial },
      { id: "analytics", label: t.help.categories.analytics },
      { id: "team", label: t.help.categories.team },
      { id: "technical", label: t.help.categories.technical },
    ],
    [t]
  );

  const faqItems = useMemo(() => {
    const faqs = t.help.faqs;
    return Object.entries(faqs).map(([id, faq]) => ({
      id,
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
    }));
  }, [t]);

  const filteredFaqs =
    selectedCategory === null
      ? faqItems
      : faqItems.filter((faq) => faq.category === selectedCategory);

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="container px-6 py-12 mx-auto max-w-7xl">
        <h1 className="text-2xl font-semibold text-center text-gray-800 lg:text-3xl dark:text-white">
          {t.help.heading}
        </h1>

        <div className="mt-8 xl:mt-16 lg:flex lg:-mx-12">
          <div className="lg:mx-12">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t.help.tableOfContent}
            </h1>

            <div className="mt-4 space-y-4 lg:mt-8">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`block text-left w-full cursor-pointer ${
                  selectedCategory === null
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-300"
                } hover:underline`}
              >
                {t.help.all}
              </button>
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`block text-left w-full cursor-pointer ${
                    selectedCategory === category.id
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-300"
                  } hover:underline`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 mt-8 lg:mx-12 lg:mt-0">
            {filteredFaqs.map((faq, index) => (
              <div key={faq.id}>
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="flex items-center focus:outline-none w-full text-left cursor-pointer"
                >
                  {openFaq === faq.id ? (
                    <svg
                      className="flex-shrink-0 w-6 h-6 text-blue-500 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 12H4"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0 w-6 h-6 text-blue-500 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}

                  <h1 className="mx-4 text-xl text-gray-700 dark:text-white">{faq.question}</h1>
                </button>

                {openFaq === faq.id && (
                  <div className="flex mt-8 md:mx-10">
                    <span className="border border-blue-500 dark:border-blue-400"></span>

                    <p className="max-w-3xl px-4 text-gray-500 dark:text-gray-300 whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                )}

                {index < filteredFaqs.length - 1 && (
                  <hr className="my-8 border-gray-200 dark:border-gray-700" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {t.help.contactSupport.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t.help.contactSupport.description}
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              {t.help.contactSupport.contactMethods.map((method, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                  <span>{method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
