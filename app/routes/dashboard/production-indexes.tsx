import { useState, useMemo } from "react";
import { useTranslation } from "~/i18n";
import { translations } from "~/i18n/translations";
import { mockCompanies } from "~/mocks/companies";
import { getPropertiesByCompanyId } from "~/services/properties.service";
import { ProductionIndexes } from "~/components/dashboard/production-indexes/production-indexes";

const ALL_PROPERTIES_ID = "all";

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export function meta() {
  const t = translations.pt;
  return [
    { title: t.productionIndexes.meta.title },
    {
      name: "description",
      content: t.productionIndexes.meta.description,
    },
  ];
}

export default function ProductionIndexesPage() {
  const t = useTranslation();
  const company = mockCompanies[0];
  const properties = useMemo(
    () => (company ? getPropertiesByCompanyId(company.id) : []),
    [company]
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties.length > 0 ? ALL_PROPERTIES_ID : ""
  );

  if (properties.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t.productionIndexes.meta.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t.reproductiveIndexes.emptyState.description}
        </p>
      </div>
    );
  }

  if (selectedPropertyId && selectedPropertyId !== ALL_PROPERTIES_ID) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.reproductiveIndexes.propertyLabel}
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={ALL_PROPERTIES_ID}>{t.reproductiveIndexes.allProperties}</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <ProductionIndexes propertyId={selectedPropertyId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.reproductiveIndexes.propertyLabel}
            </label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={ALL_PROPERTIES_ID}>{t.reproductiveIndexes.allProperties}</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">{t.productionIndexes.meta.description}</p>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Selecione uma propriedade para visualizar os índices de produção.
        </p>
      </div>
    </div>
  );
}
