import type { TableColumn } from "~/components/ui";
import { StatusBadge, TableActionButtons } from "~/components/ui";
import { formatAreaType, getLocaleForNumber, formatDate } from "~/utils/formatting";
import type { AreaType, Language } from "~/types";

interface Observation {
  observation: string;
  createdAt: string;
}

interface Movement {
  date: string;
  type: string;
}

export function createNameCodeColumn<T extends { name: string; code: string }>(
  label: string,
  sortable: boolean = true
): TableColumn<T> {
  return {
    key: "name",
    label,
    sortable,
    render: (_, row) => (
      <div>
        <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
        <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{row.code}</p>
      </div>
    ),
  };
}

export function createStatusColumn<T extends { status: "active" | "inactive" }>(
  label: string,
  activeLabel: string,
  inactiveLabel: string,
  sortable: boolean = true
): TableColumn<T> {
  return {
    key: "status",
    label,
    sortable,
    render: (_, row) => (
      <StatusBadge
        label={row.status === "active" ? activeLabel : inactiveLabel}
        variant={row.status === "active" ? "success" : "default"}
      />
    ),
  };
}

export function createAreaColumn<T extends { area: { value: number; type: AreaType } }>(
  label: string,
  language: Language = "pt",
  sortable: boolean = true
): TableColumn<T> {
  const localeForNumber = getLocaleForNumber(language);
  return {
    key: "area",
    label,
    sortable,
    render: (_, row) => (
      <span className="text-gray-700 dark:text-gray-300">
        {row.area.value.toLocaleString(localeForNumber, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{" "}
        {formatAreaType(row.area.type)}
      </span>
    ),
  };
}

export function createActionsColumn<T extends { id: string }>(
  onEdit: (item: T) => void,
  onDelete: (item: T) => void,
  canEdit: boolean,
  canDelete: boolean
): TableColumn<T> {
  return {
    key: "actions",
    label: "",
    headerClassName: "relative",
    render: (_, row) => (
      <TableActionButtons
        onEdit={() => onEdit(row)}
        onDelete={() => onDelete(row)}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    ),
  };
}

export function createTextColumn<T>(
  key: string,
  label: string,
  getValue: (row: T) => string | number | null | undefined,
  sortable: boolean = true
): TableColumn<T> {
  return {
    key,
    label,
    sortable,
    render: (_, row) => {
      const value = getValue(row);
      return (
        <span className="text-gray-700 dark:text-gray-300">
          {value == null ? "-" : String(value)}
        </span>
      );
    },
  };
}

export function createLastObservationColumn<T extends { id: string }>(
  label: string,
  getObservations: (id: string) => Observation[],
  language: Language = "pt"
): TableColumn<T> {
  return {
    key: "lastObservation",
    label,
    sortable: false,
    render: (_, row) => {
      const observations = getObservations(row.id);
      if (observations.length === 0) {
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
      }
      const sortedObservations = observations.toSorted(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const lastObservation = sortedObservations[0];
      const truncated =
        lastObservation.observation.length > 60
          ? `${lastObservation.observation.substring(0, 60)}...`
          : lastObservation.observation;
      return (
        <div className="space-y-1">
          <p
            className="text-sm text-gray-700 dark:text-gray-300"
            title={lastObservation.observation}
          >
            {truncated}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(lastObservation.createdAt, language)}
          </p>
        </div>
      );
    },
  };
}

export function createPropertiesColumn<T extends { propertyIds: string[] }>(
  label: string,
  getPropertyById: (id: string) => { name: string } | undefined
): TableColumn<T> {
  return {
    key: "properties",
    label,
    sortable: false,
    render: (_, row) => {
      const properties = row.propertyIds
        .map((id) => getPropertyById(id))
        .filter((p): p is NonNullable<typeof p> => p !== undefined)
        .map((p) => p.name);
      return (
        <span className="text-gray-700 dark:text-gray-300">
          {properties.length > 0 ? properties.join(", ") : "-"}
        </span>
      );
    },
  };
}

export function createLastMovementColumn<T extends { id: string }>(
  label: string,
  getMovements: (id: string) => Movement[],
  translation: {
    properties?: {
      details?: {
        movements?: {
          types?: Record<string, string>;
        };
      };
    };
  },
  language: Language = "pt"
): TableColumn<T> {
  return {
    key: "lastMovement",
    label,
    sortable: false,
    render: (_, row) => {
      const movements = getMovements(row.id);
      if (movements.length === 0) {
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
      }
      const sortedMovements = movements.toSorted(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastMovement = sortedMovements[0];
      const movementTypeLabel =
        translation.properties?.details?.movements?.types?.[lastMovement.type] || lastMovement.type;
      return (
        <div className="space-y-1">
          <p className="text-sm text-gray-700 dark:text-gray-300">{movementTypeLabel}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(lastMovement.date, language)}
          </p>
        </div>
      );
    },
  };
}
