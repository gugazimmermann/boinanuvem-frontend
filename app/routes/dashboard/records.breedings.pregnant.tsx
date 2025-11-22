import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import { Table, Tooltip, type TableColumn, type SortDirection } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { translations } from "~/i18n/translations";
import { mockCompanies } from "~/mocks/companies";
import { getPregnantAnimals, getBreedingsByAnimalId } from "~/services/breedings.service";
import { getAnimalById } from "~/services/animals.service";
import { getBirthByAnimalId } from "~/services/births.service";
import { getPropertyById, getPropertiesByCompanyId } from "~/services/properties.service";
import type { Animal } from "~/types";
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

  const dateLocale = useMemo(() => {
    switch (language) {
      case "en":
        return enUS;
      case "es":
        return es;
      default:
        return ptBR;
    }
  }, [language]);

  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "code", direction: "asc" });

  const [searchValue, setSearchValue] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const pregnantAnimalIds = useMemo(() => getPregnantAnimals(companyId), [companyId]);
  const properties = useMemo(
    () => (company ? getPropertiesByCompanyId(company.id) : []),
    [company]
  );

  const pregnantAnimals = useMemo(() => {
    return pregnantAnimalIds
      .map((id) => getAnimalById(id))
      .filter((animal): animal is Animal => animal !== undefined);
  }, [pregnantAnimalIds]);

  const animalsWithBreedingInfo = useMemo(() => {
    return pregnantAnimals.map((animal) => {
      const breedings = getBreedingsByAnimalId(animal.id);
      const confirmedBreedings = breedings.filter((b) => b.confirmed === true);
      const mostRecentBreeding = confirmedBreedings.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      let expectedBirthDate: Date | null = null;
      if (mostRecentBreeding?.date) {
        const breedingDate = new Date(mostRecentBreeding.date);
        expectedBirthDate = new Date(breedingDate);
        expectedBirthDate.setDate(expectedBirthDate.getDate() + 270);
      }

      const birth = getBirthByAnimalId(animal.id);
      const property = getPropertyById(animal.propertyId);
      const breedName = birth?.breed ? t.animals.breeds[birth.breed] || birth.breed : "";
      const methodLabel = mostRecentBreeding?.method
        ? mostRecentBreeding.method === "natural"
          ? t.breedings.new.methodNatural
          : t.breedings.new.methodAI
        : "";
      const breedingDateFormatted = mostRecentBreeding?.date
        ? format(new Date(mostRecentBreeding.date), "dd/MM/yyyy", { locale: dateLocale })
        : "";

      return {
        ...animal,
        breedingDate: mostRecentBreeding?.date,
        breedingMethod: mostRecentBreeding?.method,
        daysPregnant: mostRecentBreeding
          ? Math.floor(
              (new Date().getTime() - new Date(mostRecentBreeding.date).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0,
        expectedBirthDate,
        breedName,
        propertyName: property?.name || "",
        methodLabel,
        breedingDateFormatted,
      };
    });
  }, [pregnantAnimals, t, dateLocale]);

  const filteredData = useMemo(() => {
    let filtered = animalsWithBreedingInfo;

    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter((animal) => {
        return (
          animal.code.toLowerCase().includes(searchLower) ||
          animal.registrationNumber.toLowerCase().includes(searchLower) ||
          animal.breedName.toLowerCase().includes(searchLower) ||
          animal.propertyName.toLowerCase().includes(searchLower) ||
          animal.breedingDateFormatted.toLowerCase().includes(searchLower) ||
          animal.methodLabel.toLowerCase().includes(searchLower)
        );
      });
    }

    if (propertyFilter !== "all") {
      filtered = filtered.filter((animal) => animal.propertyId === propertyFilter);
    }

    if (sortState.column) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number = "";
        let bValue: string | number = "";

        switch (sortState.column) {
          case "code":
            aValue = a.code;
            bValue = b.code;
            break;
          case "registrationNumber":
            aValue = a.registrationNumber;
            bValue = b.registrationNumber;
            break;
          case "breedingDate":
            aValue = a.breedingDate ? new Date(a.breedingDate).getTime() : 0;
            bValue = b.breedingDate ? new Date(b.breedingDate).getTime() : 0;
            break;
          case "daysPregnant":
            aValue = a.daysPregnant;
            bValue = b.daysPregnant;
            break;
          case "expectedBirth":
            aValue = a.expectedBirthDate ? new Date(a.expectedBirthDate).getTime() : 0;
            bValue = b.expectedBirthDate ? new Date(b.expectedBirthDate).getTime() : 0;
            break;
          default:
            return 0;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortState.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortState.direction === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
    }

    return filtered;
  }, [animalsWithBreedingInfo, searchValue, sortState, propertyFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: TableColumn<(typeof animalsWithBreedingInfo)[0]>[] = [
    {
      key: "code",
      label: t.animals.table.registration,
      sortable: true,
      render: (_, row) => (
        <div>
          <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.code}</h2>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
            {row.registrationNumber}
          </p>
        </div>
      ),
    },
    {
      key: "breed",
      label: t.animals.table.breed,
      sortable: false,
      render: (_, row) => {
        const birth = getBirthByAnimalId(row.id);
        if (!birth || !birth.breed) {
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
        const property = getPropertyById(row.propertyId);
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
        const date = new Date(row.breedingDate);
        const formattedDate = format(date, "dd/MM/yyyy", { locale: dateLocale });
        return <span className="text-gray-700 dark:text-gray-300">{formattedDate}</span>;
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
        const methodLabel =
          row.breedingMethod === "natural"
            ? t.breedings.new.methodNatural
            : t.breedings.new.methodAI;
        return <span className="text-gray-700 dark:text-gray-300">{methodLabel}</span>;
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
              {months > 0
                ? `${months} ${t.breedings.pregnant.table.months}${days > 0 ? ` ${t.breedings.pregnant.table.and} ${days} ${t.breedings.pregnant.table.days}` : ""}`
                : `${row.daysPregnant} ${t.breedings.pregnant.table.days}`}
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

  const handleSort = (column: string, direction: SortDirection) => {
    setSortState({ column, direction });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <Table<(typeof animalsWithBreedingInfo)[0]>
        columns={columns}
        data={paginatedData}
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
          value: searchValue,
          onChange: setSearchValue,
        }}
        rightContent={
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {t.reproductiveIndexes.propertyLabel}:
            </label>
            <select
              value={propertyFilter}
              onChange={(e) => {
                setPropertyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">{t.reproductiveIndexes.allProperties}</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        }
        pagination={{
          currentPage,
          totalPages: totalPages || 1,
          onPageChange: setCurrentPage,
          showInfo: false,
        }}
        sortState={sortState}
        onSort={handleSort}
        onRowClick={(row) => navigate(getAnimalViewRoute(row.id))}
        emptyState={{
          title: t.breedings.pregnant.emptyState.title,
          description: searchValue
            ? t.breedings.pregnant.emptyState.descriptionWithSearch(searchValue)
            : t.breedings.pregnant.emptyState.description,
          onClearSearch: () => {
            setSearchValue("");
            setPropertyFilter("all");
          },
          clearSearchLabel: t.common.clearSearch,
        }}
      />
    </div>
  );
}
