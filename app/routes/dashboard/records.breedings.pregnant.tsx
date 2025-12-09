import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { Table, Tooltip, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { translations } from "~/i18n/translations";
import { mockCompanies } from "~/mocks/companies";
import { getPregnantAnimals, getMostRecentConfirmedBreeding } from "~/services/breedings.service";
import { getAnimalById } from "~/services/animals.service";
import { getBirthByAnimalId } from "~/services/births.service";
import { getProperties } from "~/services/properties.service";
import type { Property, Animal } from "~/types";
import { useListPage } from "~/hooks/use-list-page";
import { PropertyFilterDropdown } from "~/components/dashboard/breedings/property-filter-dropdown";
import { AnimalCodeDisplay } from "~/components/dashboard/breedings/animal-code-display";
import { BreedingMethodBadge } from "~/components/dashboard/breedings/breeding-method-badge";
import {
  formatBreedingDate,
  calculateExpectedBirthDate,
  calculateDaysPregnant,
} from "~/utils/breeding";
import { getDateLocale } from "~/utils/date";
import { getAnimalViewRoute } from "~/routes.config";

export function meta() {
  const t = translations.pt;
  return [
    { title: t.breedings.meta.pregnant.title },
    {
      name: "description",
      content: t.breedings.meta.pregnant.description,
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function PregnantCows() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const dateLocale = useMemo(() => getDateLocale(language), [language]);
  const [properties, setProperties] = useState<Property[]>([]);

  const pregnantAnimalIds = useMemo(() => getPregnantAnimals(companyId), [companyId]);

  useEffect(() => {
    const fetchProperties = async () => {
      if (company) {
        try {
          const propertiesData = await getProperties();
          setProperties(propertiesData.filter((prop) => prop.companyId === company.id));
        } catch (error) {
          console.error("Failed to load properties:", error);
        }
      }
    };
    fetchProperties();
  }, [company]);

  const pregnantAnimals = useMemo(() => {
    return pregnantAnimalIds
      .map((id) => getAnimalById(id))
      .filter((animal): animal is Animal => animal !== undefined);
  }, [pregnantAnimalIds]);

  const propertiesMap = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);

  const animalsWithBreedingInfo = useMemo(() => {
    return pregnantAnimals.map((animal) => {
      const mostRecentBreeding = getMostRecentConfirmedBreeding(animal.id);
      const expectedBirthDate = mostRecentBreeding
        ? calculateExpectedBirthDate(mostRecentBreeding.date)
        : null;
      const daysPregnant = mostRecentBreeding ? calculateDaysPregnant(mostRecentBreeding.date) : 0;

      const birth = getBirthByAnimalId(animal.id);
      const property = propertiesMap.get(animal.propertyId);
      const breedName = (() => {
        if (!birth?.breed) return "";
        return t.animals.breeds[birth.breed] || birth.breed;
      })();

      return {
        ...animal,
        breedingDate: mostRecentBreeding?.date,
        breedingMethod: mostRecentBreeding?.method,
        daysPregnant,
        expectedBirthDate,
        breedName,
        propertyName: property?.name || "",
      };
    });
  }, [pregnantAnimals, t, propertiesMap]);

  const searchFields: Array<
    | keyof (typeof animalsWithBreedingInfo)[0]
    | ((item: (typeof animalsWithBreedingInfo)[0]) => string)
  > = [
    "code",
    "registrationNumber",
    (animal) => animal.breedName || "",
    (animal) => animal.propertyName || "",
    (animal) => (animal.breedingDate ? formatBreedingDate(animal.breedingDate, language) : ""),
  ];

  const listPage = useListPage({
    data: animalsWithBreedingInfo,
    itemsPerPage: 10,
    initialSortColumn: "code",
    initialSortDirection: "asc",
    language,
    searchFields,
    customFilter: (animal, searchValue, activeFilter) => {
      const matchesSearch = searchFields.some((field) => {
        if (typeof field === "function") {
          return field(animal).toLowerCase().includes(searchValue.toLowerCase());
        }
        const value = animal[field];
        return value ? String(value).toLowerCase().includes(searchValue.toLowerCase()) : false;
      });

      const matchesFilter = activeFilter === "all" || animal.propertyId === activeFilter;

      return matchesSearch && matchesFilter;
    },
    dateFields: ["breedingDate"],
  });

  const filteredData = listPage.filteredData;

  const columns: TableColumn<(typeof animalsWithBreedingInfo)[0]>[] = [
    {
      key: "code",
      label: t.animals.table.registration,
      sortable: true,
      render: (_, row) => <AnimalCodeDisplay animal={row} />,
    },
    {
      key: "breed",
      label: t.animals.table.breed,
      sortable: false,
      render: (_, row) => {
        const birth = getBirthByAnimalId(row.id);
        if (!birth?.breed) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {t.animals.breeds[birth.breed] || birth.breed}
          </span>
        );
      },
    },
    {
      key: "property",
      label: t.animals.table.properties,
      sortable: false,
      render: (_, row) => {
        const property = propertiesMap.get(row.propertyId);
        return <span className="text-gray-700 dark:text-gray-300">{property?.name || "-"}</span>;
      },
    },
    {
      key: "breedingDate",
      label: t.breedings.pregnant.table.breedingDate,
      sortable: true,
      render: (_, row) => {
        if (!row.breedingDate) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {formatBreedingDate(row.breedingDate, language)}
          </span>
        );
      },
    },
    {
      key: "breedingMethod",
      label: t.breedings.pregnant.table.method,
      sortable: false,
      render: (_, row) => {
        if (!row.breedingMethod) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        return <BreedingMethodBadge method={row.breedingMethod} />;
      },
    },
    {
      key: "daysPregnant",
      label: t.breedings.pregnant.table.daysPregnant,
      sortable: true,
      render: (_, row) => {
        const months = Math.floor(row.daysPregnant / 30);
        const days = row.daysPregnant % 30;
        return (
          <Tooltip content={`${row.daysPregnant} ${t.breedings.pregnant.table.days}`}>
            <span className="text-gray-700 dark:text-gray-300">
              {(() => {
                if (months > 0) {
                  const daysText =
                    days > 0
                      ? ` ${t.breedings.pregnant.table.and} ${days} ${t.breedings.pregnant.table.days}`
                      : "";
                  return `${months} ${t.breedings.pregnant.table.months}${daysText}`;
                }
                return `${row.daysPregnant} ${t.breedings.pregnant.table.days}`;
              })()}
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: "expectedBirth",
      label: t.breedings.pregnant.table.expectedBirth,
      sortable: true,
      render: (_, row) => {
        if (!row.expectedBirthDate) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        const monthName = format(row.expectedBirthDate, "MMMM yyyy", { locale: dateLocale });
        const fullDate = format(row.expectedBirthDate, "dd/MM/yyyy", { locale: dateLocale });
        return (
          <Tooltip content={fullDate}>
            <span className="text-gray-700 dark:text-gray-300 capitalize">{monthName}</span>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      <Table<(typeof animalsWithBreedingInfo)[0]>
        columns={columns}
        data={listPage.paginatedData}
        header={{
          title: t.breedings.pregnant.title,
          badge: {
            label: t.breedings.pregnant.badge.cows(filteredData.length),
            variant: "primary",
          },
          description: t.breedings.pregnant.description,
        }}
        search={{
          placeholder: t.breedings.pregnant.searchPlaceholder,
          value: listPage.searchValue,
          onChange: listPage.setSearchValue,
        }}
        rightContent={
          <PropertyFilterDropdown
            value={listPage.activeFilter}
            onChange={(value) => {
              listPage.setActiveFilter(value);
            }}
            properties={properties}
          />
        }
        pagination={{
          currentPage: listPage.currentPage,
          totalPages: listPage.totalPages || 1,
          onPageChange: listPage.setCurrentPage,
          showInfo: false,
        }}
        sortState={listPage.sortState}
        onSort={listPage.handleSort}
        onRowClick={(row) => navigate(getAnimalViewRoute(row.id))}
        emptyState={{
          title: t.breedings.pregnant.emptyState.title,
          description: listPage.searchValue
            ? t.breedings.pregnant.emptyState.descriptionWithSearch(listPage.searchValue)
            : t.breedings.pregnant.emptyState.description,
          onClearSearch: listPage.clearSearch,
          clearSearchLabel: t.common.clearSearch,
        }}
      />
    </div>
  );
}
