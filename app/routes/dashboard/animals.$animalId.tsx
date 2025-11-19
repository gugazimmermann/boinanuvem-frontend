import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { differenceInMonths, differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import {
  Button,
  StatusBadge,
  Table,
  type TableColumn,
  type SortDirection,
  type TableAction,
  FileUpload,
  Alert,
  ConfirmationModal,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import {
  ROUTES,
  getAnimalEditRoute,
  getPropertyViewRoute,
  getAnimalViewRoute,
  getObservationViewRoute,
  getBreedingNewRoute,
} from "~/routes.config";
import { getAnimalById } from "~/services/animals.service";
import { getPropertyById } from "~/services/properties.service";
import { getBirthByAnimalId, getBirthsByFatherId } from "~/services/births.service";
import { getAcquisitionByAnimalId } from "~/services/acquisitions.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import {
  getAnimalObservationsByAnimalId,
  addAnimalObservation,
} from "~/services/animal-observations.service";
import {
  getBreedingsByAnimalId,
  confirmBreeding,
  deleteBreeding,
} from "~/services/breedings.service";
import type { Breeding, Birth } from "~/types";
import type { AnimalObservation } from "~/types/animal-observation";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import type { BirthPurity } from "~/types";
import { usePermissions } from "~/utils/permissions";

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

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function AnimalDetails() {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const { canEdit, isMainUser } = usePermissions();
  const animal = getAnimalById(animalId);

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

  const localeForDateTime = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "info" | "weighings" | "genealogy" | "activities" | "observations" | "breeding"
  >("dashboard");

  // Redirect non-main users away from activities tab
  useEffect(() => {
    if (activeTab === "activities" && !isMainUser()) {
      setActiveTab("dashboard");
    }
  }, [activeTab, isMainUser]);
  const [weighingsCurrentPage, setWeighingsCurrentPage] = useState(1);
  const [weighingsSortState, setWeighingsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const [showObservationForm, setShowObservationForm] = useState(false);
  const [observationText, setObservationText] = useState("");
  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [observationAlert, setObservationAlert] = useState<{
    title: string;
    variant: "success" | "error";
  } | null>(null);
  const [observations, setObservations] = useState<AnimalObservation[]>([]);
  const [observationsCurrentPage, setObservationsCurrentPage] = useState(1);
  const [observationsSearchValue, setObservationsSearchValue] = useState("");
  const [observationsSortState, setObservationsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const [breedings, setBreedings] = useState<Breeding[]>([]);
  const [breedingsCurrentPage, setBreedingsCurrentPage] = useState(1);
  const [breedingsSortState, setBreedingsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const [sonsSortState, setSonsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "birthDate", direction: "desc" });
  const [isConfirmBreedingModalOpen, setIsConfirmBreedingModalOpen] = useState(false);
  const [isDiscardBreedingModalOpen, setIsDiscardBreedingModalOpen] = useState(false);
  const [selectedBreeding, setSelectedBreeding] = useState<Breeding | null>(null);
  const [breedingAlert, setBreedingAlert] = useState<{
    title: string;
    variant: "success" | "error";
  } | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (animal) {
      setObservations(getAnimalObservationsByAnimalId(animal.id));
      setBreedings(getBreedingsByAnimalId(animal.id));
    }
  }, [animal]);

  const birth = animal ? getBirthByAnimalId(animal.id) : null;
  const acquisition = animal ? getAcquisitionByAnimalId(animal.id) : null;
  const isMale = birth?.gender === "male" || acquisition?.gender === "male";

  useEffect(() => {
    if (isMale && activeTab === "breeding") {
      setActiveTab("dashboard");
    }
  }, [isMale, activeTab]);
  const weighings = useMemo(() => (animal ? getWeighingsByAnimalId(animal.id) : []), [animal]);

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

  const sortedWeighings = useMemo(
    () => [...weighings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [weighings]
  );
  const lastWeighing = sortedWeighings[0];

  const calculateGMD = useMemo(() => {
    if (sortedWeighings.length < 2) return null;
    const firstWeighing = sortedWeighings[sortedWeighings.length - 1];
    const lastWeighing = sortedWeighings[0];
    const weightDiff = lastWeighing.weight - firstWeighing.weight;

    const firstDateStr = firstWeighing.date.includes("T")
      ? firstWeighing.date.split("T")[0]
      : firstWeighing.date;
    const lastDateStr = lastWeighing.date.includes("T")
      ? lastWeighing.date.split("T")[0]
      : lastWeighing.date;
    const firstDate = new Date(firstDateStr + "T00:00:00Z");
    const lastDate = new Date(lastDateStr + "T00:00:00Z");
    const daysDiff = differenceInDays(lastDate, firstDate);
    if (daysDiff === 0) return null;
    return (weightDiff / daysDiff).toFixed(2);
  }, [sortedWeighings]);

  const calculateAge = () => {
    const referenceDate = birth?.birthDate || acquisition?.birthDate;
    if (!referenceDate) return null;
    const today = new Date();
    const ref = new Date(referenceDate);
    const months = differenceInMonths(today, ref);
    return months;
  };

  const age = calculateAge();
  const gmd = calculateGMD;
  const currentWeight = lastWeighing?.weight || 0;
  const weightInArrobas = currentWeight > 0 ? (currentWeight / 30).toFixed(2) : "0.00";

  const sonsBirths = useMemo(() => {
    if (!animal) return [];
    return getBirthsByFatherId(animal.id);
  }, [animal]);

  type SonWithAnimal = {
    birth: Birth;
    animal: NonNullable<ReturnType<typeof getAnimalById>>;
  };

  const sonsWithAnimals: SonWithAnimal[] = useMemo(() => {
    const mapped = sonsBirths
      .map((birth) => {
        const sonAnimal = getAnimalById(birth.animalId);
        if (!sonAnimal) return null;
        return { birth, animal: sonAnimal };
      })
      .filter((item): item is SonWithAnimal => item !== null);

    const { column, direction } = sonsSortState;
    if (!column) {
      return mapped.sort((a, b) => {
        const dateA = new Date(a.birth.birthDate).getTime();
        const dateB = new Date(b.birth.birthDate).getTime();
        return dateB - dateA;
      });
    }

    return mapped.sort((a, b) => {
      let comparison = 0;
      switch (column) {
        case "code":
          comparison = a.animal.code.localeCompare(b.animal.code, localeForDateTime);
          break;
        case "registrationNumber":
          comparison = a.animal.registrationNumber.localeCompare(
            b.animal.registrationNumber,
            localeForDateTime
          );
          break;
        case "birthDate":
          comparison =
            new Date(a.birth.birthDate).getTime() - new Date(b.birth.birthDate).getTime();
          break;
        case "gender": {
          const genderA = a.birth.gender || "";
          const genderB = b.birth.gender || "";
          comparison = genderA.localeCompare(genderB, localeForDateTime);
          break;
        }
        case "purity": {
          const purityA = a.birth.purity || "";
          const purityB = b.birth.purity || "";
          comparison = purityA.localeCompare(purityB, localeForDateTime);
          break;
        }
        case "breed": {
          const breedA = a.birth.breed || "";
          const breedB = b.birth.breed || "";
          comparison = breedA.localeCompare(breedB, localeForDateTime);
          break;
        }
        default:
          return 0;
      }
      return direction === "asc" ? comparison : -comparison;
    });
  }, [sonsBirths, sonsSortState, localeForDateTime]);

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

  const localeForNumber = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const dateFormat =
      language === "en" ? "MM/dd/yyyy" : language === "es" ? "dd/MM/yyyy" : "dd/MM/yyyy";
    return format(date, dateFormat, { locale: dateLocale });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(localeForDateTime, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationText.trim()) {
      setObservationAlert({
        title: t.animals.details.observationRequired || "Por favor, insira uma observação",
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
      return;
    }

    setIsSubmittingObservation(true);
    try {
      const fileIds = observationFiles.map((_, index) => `file-animal-obs-${Date.now()}-${index}`);

      addAnimalObservation({
        animalId: animal.id,
        observation: observationText.trim(),
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      });

      setObservations(getAnimalObservationsByAnimalId(animal.id));

      setObservationAlert({
        title: t.animals.details.observationAdded || "Observação adicionada com sucesso!",
        variant: "success",
      });
      setTimeout(() => setObservationAlert(null), 3000);

      setObservationText("");
      setObservationFiles([]);
      setShowObservationForm(false);
    } catch (error) {
      console.error("Error adding observation:", error);
      setObservationAlert({
        title: t.animals.details.observationError || "Erro ao adicionar observação",
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
    } finally {
      setIsSubmittingObservation(false);
    }
  };

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
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{animal.code}</p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit("registration", "animals") && (
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
          )}
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
          {!isMale && (
            <button
              onClick={() => setActiveTab("breeding")}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
                ${
                  activeTab === "breeding"
                    ? "dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }
              `}
              style={
                activeTab === "breeding"
                  ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                  : undefined
              }
            >
              {t.animals.details.tabs.breeding || "Cobertura"}
            </button>
          )}
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
            onClick={() => setActiveTab("observations")}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "observations"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "observations"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.animals.details.tabs.observations || "Observações"}
          </button>
          {isMainUser() && (
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
          )}
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
                      R${" "}
                      {acquisition.price.toLocaleString(localeForNumber, {
                        minimumFractionDigits: 2,
                      })}
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

          {sonsWithAnimals.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t.animals.details.sons || "Crias"}
              </h2>
              <Table<SonWithAnimal>
                columns={[
                  {
                    key: "code",
                    label: t.animals.table.code,
                    sortable: true,
                    render: (_value, row) => (
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {row.animal.code}
                      </span>
                    ),
                  },
                  {
                    key: "registrationNumber",
                    label: t.animals.table.registration,
                    sortable: true,
                    render: (_value, row) => (
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {row.animal.registrationNumber}
                      </span>
                    ),
                  },
                  {
                    key: "birthDate",
                    label: t.animals.table.birthDate,
                    sortable: true,
                    render: (_value, row) => (
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(row.birth.birthDate)}
                      </span>
                    ),
                  },
                  {
                    key: "gender",
                    label: t.animals.table.gender,
                    sortable: true,
                    render: (_value, row) => (
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {row.birth.gender ? t.animals.gender[row.birth.gender] : "-"}
                      </span>
                    ),
                  },
                  {
                    key: "purity",
                    label: t.animals.table.purity,
                    sortable: true,
                    render: (_value, row) => (
                      <div>
                        {row.birth.purity ? (
                          <StatusBadge
                            label={t.animals.purity[row.birth.purity]}
                            variant="default"
                          />
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "breed",
                    label: t.animals.table.breed,
                    sortable: true,
                    render: (_value, row) => (
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {row.birth.breed
                          ? t.animals.breeds[row.birth.breed as keyof typeof t.animals.breeds] ||
                            row.birth.breed
                          : "-"}
                      </span>
                    ),
                  },
                ]}
                data={sonsWithAnimals}
                header={{
                  title: t.animals.details.sons || "Crias",
                  badge: {
                    label: `${sonsWithAnimals.length} ${sonsWithAnimals.length !== 1 ? t.animals.details.sonsPlural || "crias" : t.animals.details.son || "cria"}`,
                    variant: "primary",
                  },
                }}
                sortState={sonsSortState}
                onSort={(column, direction) => {
                  setSonsSortState({ column, direction });
                }}
                onRowClick={(row) => navigate(getAnimalViewRoute(row.animal.id))}
                emptyState={{
                  title: t.animals.details.noSons,
                  description: t.animals.details.noSonsDescription,
                }}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === "activities" && isMainUser() && (
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

      {activeTab === "observations" &&
        animal &&
        (() => {
          const filteredObservations = observations.filter((observation) => {
            if (!observationsSearchValue) return true;

            const searchLower = observationsSearchValue.toLowerCase();

            if (observation.observation.toLowerCase().includes(searchLower)) return true;

            const dateText = formatDateTime(observation.createdAt);
            if (dateText.toLowerCase().includes(searchLower)) return true;

            return false;
          });

          const sortedObservations = [...filteredObservations].sort((a, b) => {
            if (!observationsSortState.column || !observationsSortState.direction) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }

            let aValue: string | number | undefined;
            let bValue: string | number | undefined;

            if (observationsSortState.column === "date") {
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
            } else if (observationsSortState.column === "observation") {
              aValue = a.observation;
              bValue = b.observation;
            } else {
              aValue = a[observationsSortState.column as keyof AnimalObservation] as
                | string
                | number
                | undefined;
              bValue = b[observationsSortState.column as keyof AnimalObservation] as
                | string
                | number
                | undefined;
            }

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            let comparison = 0;
            if (typeof aValue === "string" && typeof bValue === "string") {
              comparison = aValue.localeCompare(bValue, localeForDateTime, {
                sensitivity: "base",
              });
            } else if (typeof aValue === "number" && typeof bValue === "number") {
              comparison = aValue - bValue;
            } else {
              comparison = String(aValue).localeCompare(String(bValue), localeForDateTime);
            }

            return observationsSortState.direction === "asc" ? comparison : -comparison;
          });

          const totalPages = Math.ceil(sortedObservations.length / itemsPerPage);
          const paginatedObservations = sortedObservations.slice(
            (observationsCurrentPage - 1) * itemsPerPage,
            observationsCurrentPage * itemsPerPage
          );

          const columns: TableColumn<AnimalObservation>[] = [
            {
              key: "date",
              label: t.animals.details.observationDate || "Data",
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDateTime(row.createdAt)}
                </span>
              ),
            },
            {
              key: "observation",
              label: t.animals.details.observation || "Observação",
              sortable: true,
              render: (_, row) => {
                const truncated =
                  row.observation.length > 100
                    ? `${row.observation.substring(0, 100)}...`
                    : row.observation;
                return (
                  <span className="text-gray-700 dark:text-gray-300" title={row.observation}>
                    {truncated}
                  </span>
                );
              },
            },
            {
              key: "files",
              label: t.animals.details.files || "Anexos",
              sortable: false,
              render: (_, row) => {
                if (!row.fileIds || row.fileIds.length === 0) {
                  return <span className="text-gray-400 dark:text-gray-500">-</span>;
                }
                return (
                  <div className="flex items-center space-x-1">
                    <svg
                      className="h-4 w-4 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {row.fileIds.length}
                    </span>
                  </div>
                );
              },
            },
          ];

          const headerActions: TableAction[] = [
            {
              label: t.animals.details.addObservation || "Adicionar Observação",
              variant: "primary",
              leftIcon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              onClick: () => setShowObservationForm(true),
            },
          ];

          return (
            <div className="space-y-6">
              {observationAlert && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
                  <Alert title={observationAlert.title} variant={observationAlert.variant} />
                </div>
              )}

              {showObservationForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                      {t.animals.details.newObservation || "Nova Observação"}
                    </h3>
                    <button
                      onClick={() => {
                        setShowObservationForm(false);
                        setObservationText("");
                        setObservationFiles([]);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleSubmitObservation} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.animals.details.observation || "Observação"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={observationText}
                        onChange={(e) => setObservationText(e.target.value)}
                        disabled={isSubmittingObservation}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none"
                        placeholder={
                          t.animals.details.observationPlaceholder ||
                          "Digite sua observação sobre este animal..."
                        }
                        required
                      />
                    </div>

                    <FileUpload
                      label={t.animals.details.files || "Anexos"}
                      files={observationFiles}
                      onChange={setObservationFiles}
                      disabled={isSubmittingObservation}
                      multiple={true}
                      helperText={
                        t.animals.details.filesHelper ||
                        "Você pode fazer upload de múltiplos arquivos"
                      }
                    />

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowObservationForm(false);
                          setObservationText("");
                          setObservationFiles([]);
                        }}
                        disabled={isSubmittingObservation}
                      >
                        {t.common.cancel}
                      </Button>
                      <Button type="submit" disabled={isSubmittingObservation}>
                        {t.common.save}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {!showObservationForm && (
                <Table<AnimalObservation & Record<string, unknown>>
                  columns={columns}
                  data={paginatedObservations as (AnimalObservation & Record<string, unknown>)[]}
                  header={{
                    title: t.animals.details.tabs.observations || "Observações",
                    badge: {
                      label: `${filteredObservations.length} ${filteredObservations.length !== 1 ? t.animals.details.tabs.observations || "Observações" : t.animals.details.observation || "Observação"}`,
                      variant: "primary",
                    },
                    description:
                      t.animals.details.observationsDescription ||
                      "Gerencie as observações deste animal",
                    actions: headerActions,
                  }}
                  search={{
                    placeholder: t.animals.details.searchObservations || "Buscar observações...",
                    value: observationsSearchValue,
                    onChange: (value) => {
                      setObservationsSearchValue(value);
                      setObservationsCurrentPage(1);
                    },
                  }}
                  pagination={{
                    currentPage: observationsCurrentPage,
                    totalPages: totalPages || 1,
                    onPageChange: (page) => {
                      setObservationsCurrentPage(page);
                    },
                    showInfo: false,
                  }}
                  sortState={observationsSortState}
                  onSort={(column, direction) => {
                    setObservationsSortState({ column, direction });
                    setObservationsCurrentPage(1);
                  }}
                  onRowClick={(row) =>
                    navigate(`${getObservationViewRoute(row.id)}?fromAnimal=${animal.id}`)
                  }
                  emptyState={{
                    title: t.animals.details.noObservations || "Nenhuma observação registrada",
                    description: observationsSearchValue
                      ? typeof t.animals.details.noObservationsWithSearch === "function"
                        ? t.animals.details.noObservationsWithSearch(observationsSearchValue)
                        : t.animals.details.noObservationsWithSearch ||
                          `Nenhuma observação encontrada para "${observationsSearchValue}"`
                      : t.animals.details.noObservationsDescription ||
                        "Adicione sua primeira observação sobre este animal.",
                    onClearSearch: observationsSearchValue
                      ? () => {
                          setObservationsSearchValue("");
                          setObservationsCurrentPage(1);
                        }
                      : undefined,
                    clearSearchLabel: observationsSearchValue ? t.common.clearSearch : undefined,
                    onAddNew: () => setShowObservationForm(true),
                    addNewLabel: t.animals.details.addObservation || "Adicionar Observação",
                  }}
                />
              )}
            </div>
          );
        })()}

      {activeTab === "breeding" &&
        animal &&
        !isMale &&
        (() => {
          const handleConfirmBreeding = (breeding: Breeding) => {
            setSelectedBreeding(breeding);
            setIsConfirmBreedingModalOpen(true);
          };

          const handleConfirmBreedingSubmit = () => {
            if (!selectedBreeding) return;
            const success = confirmBreeding(selectedBreeding.id);
            if (success) {
              setBreedings(getBreedingsByAnimalId(animal.id));
              setBreedingAlert({
                title:
                  t.animals.details.breeding.confirmSuccess || "Cobertura confirmada com sucesso!",
                variant: "success",
              });
              setTimeout(() => setBreedingAlert(null), 3000);
            } else {
              setBreedingAlert({
                title:
                  t.animals.details.breeding.confirmError ||
                  "Erro ao confirmar cobertura. Tente novamente.",
                variant: "error",
              });
              setTimeout(() => setBreedingAlert(null), 3000);
            }
            setIsConfirmBreedingModalOpen(false);
            setSelectedBreeding(null);
          };

          const handleDiscardBreeding = (breeding: Breeding) => {
            setSelectedBreeding(breeding);
            setIsDiscardBreedingModalOpen(true);
          };

          const handleDiscardBreedingSubmit = () => {
            if (!selectedBreeding) return;
            const success = deleteBreeding(selectedBreeding.id);
            if (success) {
              setBreedings(getBreedingsByAnimalId(animal.id));
              setBreedingAlert({
                title:
                  t.animals.details.breeding.discardSuccess || "Cobertura descartada com sucesso!",
                variant: "success",
              });
              setTimeout(() => setBreedingAlert(null), 3000);
            } else {
              setBreedingAlert({
                title:
                  t.animals.details.breeding.discardError ||
                  "Erro ao descartar cobertura. Tente novamente.",
                variant: "error",
              });
              setTimeout(() => setBreedingAlert(null), 3000);
            }
            setIsDiscardBreedingModalOpen(false);
            setSelectedBreeding(null);
          };

          const hasAnyBreeding = breedings.length > 0;

          const sortedBreedings = [...breedings].sort((a, b) => {
            if (!breedingsSortState.column || !breedingsSortState.direction) {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            }

            let aValue: string | number | boolean | undefined;
            let bValue: string | number | boolean | undefined;

            if (breedingsSortState.column === "date") {
              aValue = new Date(a.date).getTime();
              bValue = new Date(b.date).getTime();
            } else if (breedingsSortState.column === "method") {
              aValue = a.method;
              bValue = b.method;
            } else if (breedingsSortState.column === "confirmed") {
              aValue = a.confirmed ? 1 : 0;
              bValue = b.confirmed ? 1 : 0;
            } else {
              aValue = a[breedingsSortState.column as keyof Breeding] as
                | string
                | number
                | boolean
                | undefined;
              bValue = b[breedingsSortState.column as keyof Breeding] as
                | string
                | number
                | boolean
                | undefined;
            }

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            let comparison = 0;
            if (typeof aValue === "string" && typeof bValue === "string") {
              comparison = aValue.localeCompare(bValue, "pt-BR", { sensitivity: "base" });
            } else if (typeof aValue === "number" && typeof bValue === "number") {
              comparison = aValue - bValue;
            } else {
              comparison = String(aValue).localeCompare(String(bValue), "pt-BR");
            }

            return breedingsSortState.direction === "asc" ? comparison : -comparison;
          });

          const totalPages = Math.ceil(sortedBreedings.length / itemsPerPage);
          const paginatedBreedings = sortedBreedings.slice(
            (breedingsCurrentPage - 1) * itemsPerPage,
            breedingsCurrentPage * itemsPerPage
          );

          const columns: TableColumn<Breeding>[] = [
            {
              key: "date",
              label: t.animals.details.breeding.table.date || "Data da Cobertura",
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">{formatDate(row.date)}</span>
              ),
            },
            {
              key: "method",
              label: t.animals.details.breeding.table.method || "Método",
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {row.method === "natural"
                    ? t.breedings.new.methodNatural
                    : t.breedings.new.methodAI}
                </span>
              ),
            },
            {
              key: "confirmed",
              label: t.animals.details.breeding.table.status || "Status",
              sortable: true,
              render: (_, row) => (
                <StatusBadge
                  label={
                    row.confirmed
                      ? t.animals.details.breeding.table.confirmed || "Confirmada"
                      : t.animals.details.breeding.table.unconfirmed || "Não Confirmada"
                  }
                  variant={row.confirmed ? "success" : "warning"}
                />
              ),
            },
            {
              key: "daysSince",
              label: t.animals.details.breeding.table.daysSince || "Dias desde a Cobertura",
              sortable: false,
              render: (_, row) => {
                const breedingDate = new Date(row.date);
                const today = new Date();
                const days = differenceInDays(today, breedingDate);
                const expectedBirthDate = new Date(breedingDate);
                expectedBirthDate.setDate(expectedBirthDate.getDate() + 270);
                const daysUntilBirth = differenceInDays(expectedBirthDate, today);

                return (
                  <div className="space-y-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {days}{" "}
                      {days === 1
                        ? t.animals.details.breeding.table.day
                        : t.animals.details.breeding.table.days}
                    </span>
                    {row.confirmed && daysUntilBirth > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.animals.details.breeding.table.expectedBirth}:{" "}
                        {formatDate(expectedBirthDate.toISOString())}
                      </p>
                    )}
                  </div>
                );
              },
            },
            {
              key: "actions",
              label: "",
              sortable: false,
              render: (_, row) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      const state: { motherId: string; fatherId?: string } = {
                        motherId: animal.id,
                      };
                      if (row.method === "natural" && row.bullId) {
                        state.fatherId = row.bullId;
                      }
                      navigate(ROUTES.BIRTHS_NEW, { state });
                    }}
                  >
                    {t.animals.details.breeding.registerBirthButton || "Registrar Nascimento"}
                  </Button>
                  {!row.confirmed && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmBreeding(row);
                        }}
                      >
                        {t.animals.details.breeding.confirmButton || "Confirmar"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDiscardBreeding(row);
                        }}
                      >
                        {t.animals.details.breeding.discardButton || "Descartar"}
                      </Button>
                    </>
                  )}
                </div>
              ),
            },
          ];

          const headerActions: TableAction[] = hasAnyBreeding
            ? []
            : [
                {
                  label: t.animals.details.breeding.registerButton || "Registrar Cobertura",
                  variant: "primary",
                  leftIcon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  onClick: () => {
                    const route = getBreedingNewRoute([animal.id]);
                    navigate(route.pathname, { state: route.state });
                  },
                },
              ];

          return (
            <div className="space-y-6">
              {breedingAlert && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
                  <Alert title={breedingAlert.title} variant={breedingAlert.variant} />
                </div>
              )}

              <Table<Breeding>
                columns={columns}
                data={paginatedBreedings}
                header={{
                  title: t.animals.details.breeding.title || "Coberturas",
                  badge: {
                    label: `${breedings.length} ${breedings.length !== 1 ? t.animals.details.breeding.badge || "coberturas" : t.animals.details.breeding.badgeSingular || "cobertura"}`,
                    variant: "primary",
                  },
                  description:
                    t.animals.details.breeding.description ||
                    "Histórico de coberturas deste animal",
                  actions: headerActions,
                }}
                pagination={{
                  currentPage: breedingsCurrentPage,
                  totalPages: totalPages || 1,
                  onPageChange: setBreedingsCurrentPage,
                  showInfo: false,
                }}
                sortState={breedingsSortState}
                onSort={(column, direction) => {
                  setBreedingsSortState({ column, direction });
                  setBreedingsCurrentPage(1);
                }}
                emptyState={{
                  title: t.animals.details.breeding.emptyState.title,
                  description: t.animals.details.breeding.emptyState.description,
                  onAddNew: hasAnyBreeding
                    ? undefined
                    : () => {
                        const route = getBreedingNewRoute([animal.id]);
                        navigate(route.pathname, { state: route.state });
                      },
                  addNewLabel: t.animals.details.breeding.registerButton || "Registrar Cobertura",
                }}
              />

              <ConfirmationModal
                isOpen={isConfirmBreedingModalOpen}
                onClose={() => {
                  setIsConfirmBreedingModalOpen(false);
                  setSelectedBreeding(null);
                }}
                onConfirm={handleConfirmBreedingSubmit}
                title={t.animals.details.breeding.confirmModal.title || "Confirmar Cobertura"}
                message={
                  selectedBreeding
                    ? t.animals.details.breeding.confirmModal.message(animal.code) ||
                      `Tem certeza que deseja confirmar a cobertura do animal "${animal.code}"?`
                    : ""
                }
                confirmLabel={t.animals.details.breeding.confirmModal.confirm || "Confirmar"}
                cancelLabel={t.animals.details.breeding.confirmModal.cancel || "Cancelar"}
                variant="info"
              />

              <ConfirmationModal
                isOpen={isDiscardBreedingModalOpen}
                onClose={() => {
                  setIsDiscardBreedingModalOpen(false);
                  setSelectedBreeding(null);
                }}
                onConfirm={handleDiscardBreedingSubmit}
                title={t.animals.details.breeding.discardModal.title || "Descartar Cobertura"}
                message={
                  selectedBreeding
                    ? t.animals.details.breeding.discardModal.message(animal.code) ||
                      `Tem certeza que deseja descartar a cobertura do animal "${animal.code}"? Esta ação não pode ser desfeita.`
                    : ""
                }
                confirmLabel={t.animals.details.breeding.discardModal.confirm || "Descartar"}
                cancelLabel={t.animals.details.breeding.discardModal.cancel || "Cancelar"}
                variant="danger"
              />
            </div>
          );
        })()}
    </div>
  );
}
