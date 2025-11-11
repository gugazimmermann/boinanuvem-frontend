import type { Route } from "./+types/help";
import { useState } from "react";

const FAQ_CATEGORIES = [
  { id: "general", label: "General" },
  { id: "trust", label: "Trust & Safety" },
  { id: "services", label: "Services" },
  { id: "billing", label: "Billing" },
  { id: "cleaning", label: "Office Cleaning" },
] as const;

const FAQ_ITEMS = [
  {
    id: "payment",
    category: "billing",
    question: "How can I pay for my appointment?",
    answer:
      "You can pay for your appointment in several ways: credit card, debit card, bank transfer, or PIX. Payment can be made directly on the platform when booking or at the time of consultation, depending on the service chosen.",
  },
  {
    id: "first-consultation",
    category: "general",
    question: "What can I expect at my first consultation?",
    answer:
      "At your first consultation, you will be welcomed by our team who will collect your basic information and understand your needs. Then, you will have a meeting with a specialist who will analyze your case and propose the best solutions for you.",
  },
  {
    id: "opening-hours",
    category: "general",
    question: "What are your opening hours?",
    answer:
      "Our business hours are Monday through Friday, from 8am to 6pm, and Saturdays from 9am to 1pm. We are closed on Sundays and holidays. For emergencies, we have a 24/7 support channel available.",
  },
  {
    id: "referral",
    category: "services",
    question: "Do I need a referral?",
    answer:
      "A referral is not required for most of our services. You can book directly through the platform. However, some specific services may require additional documentation, which will be informed at the time of booking.",
  },
  {
    id: "insurance",
    category: "billing",
    question: "Is the cost of the appointment covered by private health insurance?",
    answer:
      "It depends on your health plan and the type of service. Some plans cover our services partially or fully. We recommend that you contact your insurer before booking to verify coverage. We can also help you verify this through our support.",
  },
] as const;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Help - Boi na Nuvem" },
    {
      name: "description",
      content: "Help center and frequently asked questions for Boi na Nuvem",
    },
  ];
}

export default function Help() {
  const [openFaq, setOpenFaq] = useState<string | null>("payment");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const toggleFaq = (faqId: string) => {
    setOpenFaq((prev) => (prev === faqId ? null : faqId));
  };

  const filteredFaqs =
    selectedCategory === null
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((faq) => faq.category === selectedCategory);

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="container px-6 py-12 mx-auto">
        <h1 className="text-2xl font-semibold text-center text-gray-800 lg:text-3xl dark:text-white">
          Have any Questions?
        </h1>

        <div className="mt-8 xl:mt-16 lg:flex lg:-mx-12">
          <div className="lg:mx-12">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              Table of Content
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
                All
              </button>
              {FAQ_CATEGORIES.map((category) => (
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

                  <h1 className="mx-4 text-xl text-gray-700 dark:text-white">
                    {faq.question}
                  </h1>
                </button>

                {openFaq === faq.id && (
                  <div className="flex mt-8 md:mx-10">
                    <span className="border border-blue-500 dark:border-blue-400"></span>

                    <p className="max-w-3xl px-4 text-gray-500 dark:text-gray-300">
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
      </div>
    </section>
  );
}

