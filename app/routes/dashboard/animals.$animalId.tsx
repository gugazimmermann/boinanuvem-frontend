import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { differenceInMonths, differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Button, StatusBadge, Table, type TableColumn, type SortDirection } from "~/components/ui";
import { useTranslation } from "~/i18n";
import {
  ROUTES,
  getAnimalEditRoute,
  getPropertyViewRoute,
  getAnimalViewRoute,
} from "~/routes.config";
import { getAnimalById } from "~/mocks/animals";
import { getPropertyById } from "~/mocks/properties";
import { getBirthByAnimalId } from "~/mocks/births";
import { getAcquisitionByAnimalId } from "~/mocks/acquisitions";
import { getWeighingsByAnimalId } from "~/mocks/weighings";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import type { BirthPurity } from "~/types";

type GenealogyNodeType = {
  animal: { id: string; code: string; registrationNumber: string };
  birth?: { purity?: BirthPurity; breed?: string; motherId?: string; fatherId?: string };
  mother?: GenealogyNodeType | null;
  father?: GenealogyNodeType | null;
  level: number;
};

function GenealogyTreeComponent({
  node,
  t,
  navigate,
}: {
  node: GenealogyNodeType;
  t: ReturnType<typeof useTranslation>;
  navigate: (path: string) => void;
}) {
  const getAnimalViewRoute = (id: string) => `/dashboard/animais/${id}`;

  const renderNode = (node: GenealogyNodeType, isMother: boolean | null = null) => {
    if (!node) return null;

    const label =
      node.level === 0
        ? t.animals.details.currentAnimal
        : isMother === true
          ? t.animals.details.mother
          : isMother === false
            ? t.animals.details.father
            : "";

    const bgColor =
      node.level === 0
        ? "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-700/50"
        : isMother === true
          ? "bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-800/10 border-pink-200 dark:border-pink-700/50"
          : "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-green-200 dark:border-green-700/50";

    return (
      <div className="flex flex-col items-center">
        <div
          className={`
            relative px-3 py-2 rounded-lg border min-w-[140px] max-w-[160px] cursor-pointer 
            transition-all duration-200 hover:scale-105 hover:shadow-lg
            ${bgColor}
          `}
          onClick={() => navigate(getAnimalViewRoute(node.animal.id))}
        >
          <div className="text-center space-y-1">
            {label && (
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                {label}
              </p>
            )}
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {node.animal.registrationNumber}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              {node.animal.code}
            </p>
            {node.birth?.purity && (
              <div className="mt-1.5 flex justify-center">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {t.animals.purity[node.birth.purity]}
                </span>
              </div>
            )}
            {node.birth?.breed && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {t.animals.breeds[node.birth.breed as keyof typeof t.animals.breeds]}
              </p>
            )}
          </div>
        </div>

        {(node.mother || node.father) && (
          <div className="mt-3 flex gap-6">
            {node.mother && (
              <div className="flex flex-col items-center">
                <div className="w-px h-3 bg-gradient-to-b from-pink-300 to-transparent dark:from-pink-600 dark:to-transparent"></div>
                {renderNode(node.mother, true)}
              </div>
            )}
            {node.father && (
              <div className="flex flex-col items-center">
                <div className="w-px h-3 bg-gradient-to-b from-green-300 to-transparent dark:from-green-600 dark:to-transparent"></div>
                {renderNode(node.father, false)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-center py-4 w-full">
      <div className="flex flex-col items-center min-w-max">{renderNode(node)}</div>
    </div>
  );
}

export function meta() {
  return [
    { title: "Detalhes do Animal - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do animal",
    },
  ];
}

export default function AnimalDetails() {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const animal = getAnimalById(animalId);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "info" | "weighings" | "genealogy" | "activities"
  >("dashboard");
  const [weighingsCurrentPage, setWeighingsCurrentPage] = useState(1);
  const [weighingsSortState, setWeighingsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const itemsPerPage = 10;

  if (!animal) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.animals.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.ANIMALS)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const birth = getBirthByAnimalId(animal.id);
  const acquisition = getAcquisitionByAnimalId(animal.id);
  const weighings = getWeighingsByAnimalId(animal.id);

  type WeighingWithCalculations = {
    id: string;
    animalId: string;
    employeeIds: string[];
    serviceProviderIds: string[];
    date: string;
    weight: number;
    observation?: string;
    createdAt: string;
    companyId: string;
    weightDiff: number | null;
    periodGMD: string | null;
  };

  const sortedWeighingsByDate = [...weighings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const weighingsWithCalculations: WeighingWithCalculations[] = sortedWeighingsByDate.map(
    (weighing, index) => {
      const previousWeighing = sortedWeighingsByDate[index + 1];
      const weightDiff = previousWeighing ? weighing.weight - previousWeighing.weight : null;
      const daysDiff = previousWeighing
        ? differenceInDays(new Date(weighing.date), new Date(previousWeighing.date))
        : null;
      const periodGMD =
        weightDiff !== null && daysDiff !== null && daysDiff > 0
          ? (weightDiff / daysDiff).toFixed(2)
          : null;

      return {
        ...weighing,
        weightDiff,
        periodGMD,
      };
    }
  );

  const sortedWeighings = [...weighings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastWeighing = sortedWeighings[0];

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const calculateAge = () => {
    const referenceDate = birth?.birthDate || acquisition?.birthDate;
    if (!referenceDate) return null;
    const today = new Date();
    const ref = new Date(referenceDate);
    const months = differenceInMonths(today, ref);
    return months;
  };

  const calculateGMD = () => {
    if (sortedWeighings.length < 2) return null;
    const firstWeighing = sortedWeighings[sortedWeighings.length - 1];
    const lastWeighing = sortedWeighings[0];
    const weightDiff = lastWeighing.weight - firstWeighing.weight;
    const daysDiff = differenceInDays(new Date(lastWeighing.date), new Date(firstWeighing.date));
    if (daysDiff === 0) return null;
    return (weightDiff / daysDiff).toFixed(2);
  };

  const age = calculateAge();
  const gmd = calculateGMD();
  const currentWeight = lastWeighing?.weight || 0;
  const weightInArrobas = currentWeight > 0 ? (currentWeight / 30).toFixed(2) : "0.00";

  const buildGenealogyTree = (
    animalId: string,
    level: number = 0,
    maxLevel: number = 4
  ): GenealogyNodeType | null => {
    if (level > maxLevel) return null;

    const currentAnimal = getAnimalById(animalId);
    if (!currentAnimal) return null;

    const currentBirth = getBirthByAnimalId(animalId);
    const node: GenealogyNodeType = {
      animal: {
        id: currentAnimal.id,
        code: currentAnimal.code,
        registrationNumber: currentAnimal.registrationNumber,
      },
      birth: currentBirth
        ? {
            purity: currentBirth.purity,
            breed: currentBirth.breed,
            motherId: currentBirth.motherId,
            fatherId: currentBirth.fatherId,
          }
        : undefined,
      level,
    };

    if (currentBirth?.motherId) {
      node.mother = buildGenealogyTree(currentBirth.motherId, level + 1, maxLevel);
    }

    if (currentBirth?.fatherId) {
      node.father = buildGenealogyTree(currentBirth.fatherId, level + 1, maxLevel);
    }

    return node;
  };

  const genealogyTree = buildGenealogyTree(animal.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {animal.registrationNumber}
            </h1>
            <StatusBadge
              label={animal.status === "active" ? t.animals.table.active : t.animals.table.inactive}
              variant={animal.status === "active" ? "success" : "default"}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.animals.table.code}: {animal.code}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(getAnimalEditRoute(animal.id))}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            }
          >
            {t.profile.company.edit}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.ANIMALS)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            }
          >
            {t.team.new.back}
          </Button>
        </div>
      </div>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "dashboard"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "dashboard"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.dashboard.title}
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "info"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "info"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.animals.details.tabs.info}
          </button>
          <button
            onClick={() => setActiveTab("weighings")}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "weighings"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "weighings"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.animals.details.tabs.weighings}
          </button>
          <button
            onClick={() => setActiveTab("genealogy")}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "genealogy"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "genealogy"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.animals.details.tabs.genealogy}
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "activities"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "activities"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.animals.details.tabs.activities}
          </button>
        </nav>
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.table.weight}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {currentWeight > 0 ? `${currentWeight} kg` : "-"}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">⚖️</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.table.weightInArrobas}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {weightInArrobas} @
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.table.gmd}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {gmd ? `${gmd} kg/dia` : "-"}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📈</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.table.birthDate}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {age !== null ? `${age} ${age === 1 ? t.common.month : t.common.months}` : "-"}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🎂</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.animals.details.animalInfo}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.table.code}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{animal.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.table.registration}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {animal.registrationNumber}
                  </p>
                </div>
                {birth?.breed && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.table.breed}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {t.animals.breeds[birth.breed] || birth.breed}
                    </p>
                  </div>
                )}
                {birth?.gender && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.table.gender}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {t.animals.gender[birth.gender]}
                    </p>
                  </div>
                )}
                {birth?.purity && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.table.purity}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {t.animals.purity[birth.purity]}
                    </p>
                  </div>
                )}
                {birth?.birthDate && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.table.birthDate}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {formatDate(birth.birthDate)}
                    </p>
                  </div>
                )}
                {animal.acquisitionDate && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.table.acquisitionDate}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {formatDate(animal.acquisitionDate)}
                    </p>
                  </div>
                )}
                {acquisition?.price && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.details.price}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      R$ {acquisition.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.properties}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {animal.propertyId ? (
                      (() => {
                        const property = getPropertyById(animal.propertyId);
                        return property ? (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            onClick={() => navigate(getPropertyViewRoute(animal.propertyId))}
                          >
                            {property.name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                        );
                      })()
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.createdAt}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(animal.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.animals.details.genealogy}
              </h2>
              <div className="space-y-4">
                {birth?.purity && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {t.animals.details.purity}
                    </p>
                    <div className="flex items-center gap-2">
                      <StatusBadge label={t.animals.purity[birth.purity]} variant="default" />
                      {birth.breed && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          ({t.animals.breeds[birth.breed]})
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {(birth?.motherId || acquisition?.motherId) && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t.animals.details.mother}
                    </p>
                    <div className="mt-1 space-y-1">
                      {(() => {
                        const motherId = birth?.motherId || acquisition?.motherId;
                        const mother = motherId ? getAnimalById(motherId) : null;
                        const motherBirth = motherId ? getBirthByAnimalId(motherId) : null;
                        return mother ? (
                          <>
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 cursor-pointer hover:bg-pink-200 dark:hover:bg-pink-900/50"
                              onClick={() => navigate(getAnimalViewRoute(mother.id))}
                            >
                              {mother.code} - {mother.registrationNumber}
                            </span>
                            {motherBirth?.purity && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {t.animals.details.purity}:
                                </span>
                                <StatusBadge
                                  label={t.animals.purity[motherBirth.purity]}
                                  variant="default"
                                />
                                {motherBirth.breed && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ({t.animals.breeds[motherBirth.breed]})
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                        );
                      })()}
                    </div>
                  </div>
                )}
                {(birth?.fatherId || acquisition?.fatherId) && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t.animals.details.father}
                    </p>
                    <div className="mt-1 space-y-1">
                      {(() => {
                        const fatherId = birth?.fatherId || acquisition?.fatherId;
                        const father = fatherId ? getAnimalById(fatherId) : null;
                        const fatherBirth = fatherId ? getBirthByAnimalId(fatherId) : null;
                        return father ? (
                          <>
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
                              onClick={() => navigate(getAnimalViewRoute(father.id))}
                            >
                              {father.code} - {father.registrationNumber}
                            </span>
                            {fatherBirth?.purity && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {t.animals.details.purity}:
                                </span>
                                <StatusBadge
                                  label={t.animals.purity[fatherBirth.purity]}
                                  variant="default"
                                />
                                {fatherBirth.breed && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ({t.animals.breeds[fatherBirth.breed]})
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                        );
                      })()}
                    </div>
                  </div>
                )}
                {!birth?.purity &&
                  !birth?.motherId &&
                  !birth?.fatherId &&
                  !acquisition?.motherId &&
                  !acquisition?.fatherId && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.animals.details.noGenealogy}
                    </p>
                  )}
                {birth?.observation && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.details.observation}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {birth.observation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "weighings" &&
        weighings.length > 0 &&
        (() => {
          const sortedWeighingsForTable = [...weighingsWithCalculations].sort((a, b) => {
            const { column, direction } = weighingsSortState;

            if (!column) {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            }

            let comparison = 0;
            switch (column) {
              case "date":
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                break;
              case "weight":
                comparison = a.weight - b.weight;
                break;
              case "weightDiff":
                comparison = (a.weightDiff ?? 0) - (b.weightDiff ?? 0);
                break;
              case "periodGMD":
                comparison = parseFloat(a.periodGMD ?? "0") - parseFloat(b.periodGMD ?? "0");
                break;
              default:
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            }

            return direction === "asc" ? comparison : -comparison;
          });

          const filteredWeighings = sortedWeighingsForTable.filter(
            (w) => w !== null && w !== undefined && w.id !== undefined
          );
          const totalPages = Math.ceil(filteredWeighings.length / itemsPerPage);
          const startIndex = (weighingsCurrentPage - 1) * itemsPerPage;
          const paginatedWeighings = filteredWeighings.slice(startIndex, startIndex + itemsPerPage);

          const columns: TableColumn<WeighingWithCalculations>[] = [
            {
              key: "date",
              label: t.animals.details.date,
              sortable: true,
              render: (_value, weighing) => {
                if (!weighing) return <span className="text-sm text-gray-400">-</span>;
                return (
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(weighing.date)}
                  </span>
                );
              },
            },
            {
              key: "weight",
              label: t.animals.table.weight,
              sortable: true,
              render: (_value, weighing) => {
                if (!weighing) return <span className="text-sm text-gray-400">-</span>;
                return (
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {weighing.weight} kg
                  </span>
                );
              },
            },
            {
              key: "weightDiff",
              label: t.animals.details.variation,
              sortable: true,
              render: (_value, weighing) => {
                if (!weighing) return <span className="text-sm text-gray-400">-</span>;
                const weightDiff = weighing.weightDiff;
                if (weightDiff === null || weightDiff === undefined || isNaN(weightDiff)) {
                  return <span className="text-sm text-gray-400">-</span>;
                }
                return (
                  <span
                    className={`text-sm font-medium ${
                      weightDiff >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {weightDiff >= 0 ? "+" : ""}
                    {weightDiff.toFixed(1)} kg
                  </span>
                );
              },
            },
            {
              key: "periodGMD",
              label: t.animals.table.gmd,
              sortable: true,
              render: (_value, weighing) => {
                if (!weighing) return <span className="text-sm text-gray-400">-</span>;
                const periodGMD = weighing.periodGMD;
                if (!periodGMD || periodGMD === null || periodGMD === undefined) {
                  return <span className="text-sm text-gray-400">-</span>;
                }
                return (
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {periodGMD} kg/dia
                  </span>
                );
              },
            },
            {
              key: "observation",
              label: t.animals.details.observation,
              sortable: false,
              render: (_value, weighing) => {
                if (!weighing) return <span className="text-sm text-gray-400">-</span>;
                return (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {weighing.observation || "-"}
                  </span>
                );
              },
            },
          ];

          return (
            <div className="space-y-6">
              <Table<WeighingWithCalculations>
                columns={columns}
                data={paginatedWeighings}
                header={{
                  title: t.animals.details.weighingHistory,
                  badge: {
                    label: t.animals.details.weighings(filteredWeighings.length),
                    variant: "primary",
                  },
                }}
                pagination={{
                  currentPage: weighingsCurrentPage,
                  totalPages: totalPages || 1,
                  onPageChange: setWeighingsCurrentPage,
                  showInfo: false,
                }}
                sortState={weighingsSortState}
                onSort={(column, direction) => {
                  setWeighingsSortState({ column, direction });
                  setWeighingsCurrentPage(1);
                }}
                emptyState={{
                  title: t.animals.details.noWeighings,
                  description: "",
                }}
              />
            </div>
          );
        })()}

      {activeTab === "weighings" && weighings.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.animals.details.noWeighings}
          </p>
        </div>
      )}

      {activeTab === "genealogy" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {t.animals.details.genealogy}
              </h2>
              {birth?.purity && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t.animals.details.purity}:
                  </span>
                  <StatusBadge label={t.animals.purity[birth.purity]} variant="default" />
                  {birth.breed && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      • {t.animals.breeds[birth.breed]}
                    </span>
                  )}
                </div>
              )}
            </div>

            {genealogyTree ? (
              <div className="w-full overflow-x-auto overflow-y-visible">
                <div className="min-w-max pb-4">
                  <GenealogyTreeComponent node={genealogyTree} t={t} navigate={navigate} />
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.animals.details.noGenealogy}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "activities" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.dashboard.recentActivities.title}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div
                className="w-8 h-8 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${DASHBOARD_COLORS.primaryLight}40` }}
              >
                <span className="text-sm">📝</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {t.animals.details.activityCreated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(animal.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {animal.status === "active"
                    ? t.animals.details.activityActivated
                    : t.animals.details.activityDeactivated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.animals.details.statusLabel}:{" "}
                  {animal.status === "active" ? t.animals.table.active : t.animals.table.inactive}
                </p>
              </div>
            </div>
            {birth && (
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm">🐄</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {t.animals.details.birthRegistered}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(birth.birthDate)}
                  </p>
                </div>
              </div>
            )}
            {acquisition && (
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm">💰</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {t.animals.details.acquisitionRegistered}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(acquisition.acquisitionDate)}
                  </p>
                </div>
              </div>
            )}
            {sortedWeighings.slice(0, 5).map((weighing) => (
              <div
                key={weighing.id}
                className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700"
              >
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm">⚖️</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {t.animals.details.weighing}: {weighing.weight} kg
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(weighing.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
