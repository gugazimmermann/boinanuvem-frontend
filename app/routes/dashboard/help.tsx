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
      { id: "financial", label: t.help.categories.financial },
      { id: "analytics", label: t.help.categories.analytics },
      { id: "team", label: t.help.categories.team },
      { id: "technical", label: t.help.categories.technical },
    ],
    [t]
  );

  const faqItems = useMemo(
    () => [
      {
        id: "quick-start-guide",
        category: "getting-started",
        question: t.help.faqs.quickStartGuide.question,
        answer: t.help.faqs.quickStartGuide.answer,
      },
      {
        id: "getting-started",
        category: "getting-started",
        question: t.help.faqs.gettingStarted.question,
        answer: t.help.faqs.gettingStarted.answer,
      },
      {
        id: "add-property",
        category: "getting-started",
        question: t.help.faqs.addProperty.question,
        answer: t.help.faqs.addProperty.answer,
      },
      {
        id: "add-animal",
        category: "animals",
        question: t.help.faqs.addAnimal.question,
        answer: t.help.faqs.addAnimal.answer,
      },
      {
        id: "animal-code",
        category: "animals",
        question: t.help.faqs.animalCode.question,
        answer: t.help.faqs.animalCode.answer,
      },
      {
        id: "add-location",
        category: "locations",
        question: t.help.faqs.addLocation.question,
        answer: t.help.faqs.addLocation.answer,
      },
      {
        id: "manage-employees",
        category: "people",
        question: t.help.faqs.manageEmployees.question,
        answer: t.help.faqs.manageEmployees.answer,
      },
      {
        id: "service-providers",
        category: "people",
        question: t.help.faqs.serviceProviders.question,
        answer: t.help.faqs.serviceProviders.answer,
      },
      {
        id: "suppliers",
        category: "people",
        question: t.help.faqs.suppliers.question,
        answer: t.help.faqs.suppliers.answer,
      },
      {
        id: "buyers",
        category: "people",
        question: t.help.faqs.buyers.question,
        answer: t.help.faqs.buyers.answer,
      },
      {
        id: "observations",
        category: "people",
        question: t.help.faqs.observations.question,
        answer: t.help.faqs.observations.answer,
      },
      {
        id: "record-birth",
        category: "records",
        question: t.help.faqs.recordBirth.question,
        answer: t.help.faqs.recordBirth.answer,
      },
      {
        id: "record-breeding",
        category: "records",
        question: t.help.faqs.recordBreeding.question,
        answer: t.help.faqs.recordBreeding.answer,
      },
      {
        id: "record-weighing",
        category: "records",
        question: t.help.faqs.recordWeighing.question,
        answer: t.help.faqs.recordWeighing.answer,
      },
      {
        id: "session-weighings",
        category: "records",
        question: t.help.faqs.sessionWeighings.question,
        answer: t.help.faqs.sessionWeighings.answer,
      },
      {
        id: "record-acquisition",
        category: "records",
        question: t.help.faqs.recordAcquisition.question,
        answer: t.help.faqs.recordAcquisition.answer,
      },
      {
        id: "record-death",
        category: "records",
        question: t.help.faqs.recordDeath.question,
        answer: t.help.faqs.recordDeath.answer,
      },
      {
        id: "animal-movements",
        category: "records",
        question: t.help.faqs.animalMovements.question,
        answer: t.help.faqs.animalMovements.answer,
      },
      {
        id: "location-movements",
        category: "records",
        question: t.help.faqs.locationMovements.question,
        answer: t.help.faqs.locationMovements.answer,
      },
      {
        id: "add-inventory-item",
        category: "records",
        question: t.help.faqs.addInventoryItem.question,
        answer: t.help.faqs.addInventoryItem.answer,
      },
      {
        id: "manage-inventory",
        category: "records",
        question: t.help.faqs.manageInventory.question,
        answer: t.help.faqs.manageInventory.answer,
      },
      {
        id: "inventory-movements",
        category: "records",
        question: t.help.faqs.inventoryMovements.question,
        answer: t.help.faqs.inventoryMovements.answer,
      },
      {
        id: "track-stock-levels",
        category: "records",
        question: t.help.faqs.trackStockLevels.question,
        answer: t.help.faqs.trackStockLevels.answer,
      },
      {
        id: "inventory-observations",
        category: "records",
        question: t.help.faqs.inventoryObservations.question,
        answer: t.help.faqs.inventoryObservations.answer,
      },
      {
        id: "location-inventory-costs",
        category: "records",
        question: t.help.faqs.locationInventoryCosts.question,
        answer: t.help.faqs.locationInventoryCosts.answer,
      },
      {
        id: "cash-flow",
        category: "financial",
        question: t.help.faqs.cashFlow.question,
        answer: t.help.faqs.cashFlow.answer,
      },
      {
        id: "accounts-payable",
        category: "financial",
        question: t.help.faqs.accountsPayable.question,
        answer: t.help.faqs.accountsPayable.answer,
      },
      {
        id: "accounts-receivable",
        category: "financial",
        question: t.help.faqs.accountsReceivable.question,
        answer: t.help.faqs.accountsReceivable.answer,
      },
      {
        id: "bank-accounts",
        category: "financial",
        question: t.help.faqs.bankAccounts.question,
        answer: t.help.faqs.bankAccounts.answer,
      },
      {
        id: "financial-dashboard",
        category: "financial",
        question: t.help.faqs.financialDashboard.question,
        answer: t.help.faqs.financialDashboard.answer,
      },
      {
        id: "inventory-financial-integration",
        category: "financial",
        question: t.help.faqs.inventoryFinancialIntegration.question,
        answer: t.help.faqs.inventoryFinancialIntegration.answer,
      },
      {
        id: "animal-inventory-costs",
        category: "financial",
        question: t.help.faqs.animalInventoryCosts.question,
        answer: t.help.faqs.animalInventoryCosts.answer,
      },
      {
        id: "inventory-usage-method",
        category: "records",
        question: t.help.faqs.inventoryUsageMethod.question,
        answer: t.help.faqs.inventoryUsageMethod.answer,
      },
      {
        id: "sanitary-control",
        category: "records",
        question: t.help.faqs.sanitaryControl.question,
        answer: t.help.faqs.sanitaryControl.answer,
      },
      {
        id: "sanitary-control-history",
        category: "animals",
        question: t.help.faqs.sanitaryControlHistory.question,
        answer: t.help.faqs.sanitaryControlHistory.answer,
      },
      {
        id: "medicine-during-weighing",
        category: "records",
        question: t.help.faqs.medicineDuringWeighing.question,
        answer: t.help.faqs.medicineDuringWeighing.answer,
      },
      {
        id: "record-sale",
        category: "records",
        question: t.help.faqs.recordSale.question,
        answer: t.help.faqs.recordSale.answer,
      },
      {
        id: "sale-pricing-modes",
        category: "records",
        question: t.help.faqs.salePricingModes.question,
        answer: t.help.faqs.salePricingModes.answer,
      },
      {
        id: "sale-payment-methods",
        category: "financial",
        question: t.help.faqs.salePaymentMethods.question,
        answer: t.help.faqs.salePaymentMethods.answer,
      },
      {
        id: "sale-profitability",
        category: "analytics",
        question: t.help.faqs.saleProfitability.question,
        answer: t.help.faqs.saleProfitability.answer,
      },
      {
        id: "acquisition-pricing-modes",
        category: "records",
        question: t.help.faqs.acquisitionPricingModes.question,
        answer: t.help.faqs.acquisitionPricingModes.answer,
      },
      {
        id: "acquisition-payment-methods",
        category: "financial",
        question: t.help.faqs.acquisitionPaymentMethods.question,
        answer: t.help.faqs.acquisitionPaymentMethods.answer,
      },
      {
        id: "flexible-fees",
        category: "records",
        question: t.help.faqs.flexibleFees.question,
        answer: t.help.faqs.flexibleFees.answer,
      },
      {
        id: "cost-per-arroba",
        category: "analytics",
        question: t.help.faqs.costPerArroba.question,
        answer: t.help.faqs.costPerArroba.answer,
      },
      {
        id: "reproductive-indexes",
        category: "analytics",
        question: t.help.faqs.reproductiveIndexes.question,
        answer: t.help.faqs.reproductiveIndexes.answer,
      },
      {
        id: "birth-forecast",
        category: "analytics",
        question: t.help.faqs.birthForecast.question,
        answer: t.help.faqs.birthForecast.answer,
      },
      {
        id: "dashboard-metrics",
        category: "analytics",
        question: t.help.faqs.dashboardMetrics.question,
        answer: t.help.faqs.dashboardMetrics.answer,
      },
      {
        id: "property-dashboard",
        category: "analytics",
        question: t.help.faqs.propertyDashboard.question,
        answer: t.help.faqs.propertyDashboard.answer,
      },
      {
        id: "animal-dashboard",
        category: "analytics",
        question: t.help.faqs.animalDashboard.question,
        answer: t.help.faqs.animalDashboard.answer,
      },
      {
        id: "pasture-planning",
        category: "analytics",
        question: t.help.faqs.pasturePlanning.question,
        answer: t.help.faqs.pasturePlanning.answer,
      },
      {
        id: "breeding-season",
        category: "analytics",
        question: t.help.faqs.breedingSeason.question,
        answer: t.help.faqs.breedingSeason.answer,
      },
      {
        id: "add-team-member",
        category: "team",
        question: t.help.faqs.addTeamMember.question,
        answer: t.help.faqs.addTeamMember.answer,
      },
      {
        id: "permissions",
        category: "team",
        question: t.help.faqs.permissions.question,
        answer: t.help.faqs.permissions.answer,
      },
      {
        id: "search-filtering",
        category: "technical",
        question: t.help.faqs.searchFiltering.question,
        answer: t.help.faqs.searchFiltering.answer,
      },
      {
        id: "data-organization",
        category: "technical",
        question: t.help.faqs.dataOrganization.question,
        answer: t.help.faqs.dataOrganization.answer,
      },
      {
        id: "best-practices",
        category: "technical",
        question: t.help.faqs.bestPractices.question,
        answer: t.help.faqs.bestPractices.answer,
      },
      {
        id: "data-backup",
        category: "technical",
        question: t.help.faqs.dataBackup.question,
        answer: t.help.faqs.dataBackup.answer,
      },
      {
        id: "export-data",
        category: "technical",
        question: t.help.faqs.exportData.question,
        answer: t.help.faqs.exportData.answer,
      },
    ],
    [t]
  );

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

                    <p className="max-w-3xl px-4 text-gray-500 dark:text-gray-300">{faq.answer}</p>
                  </div>
                )}

                {index < filteredFaqs.length - 1 && (
                  <hr className="my-8 border-gray-200 dark:border-gray-700" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Section */}
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
