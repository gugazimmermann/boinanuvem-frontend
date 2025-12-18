import type { AnimalMovement } from "~/types";

/**
 * Normalizes an array of string IDs by removing duplicates and sorting
 * @param ids - Array of string IDs (can be undefined or null)
 * @returns A comma-separated string of unique sorted IDs, or empty string if none
 */
export function normalizeStringIds(ids: string[] | undefined | null): string {
  if (!ids || ids.length === 0) return "";
  return Array.from(new Set(ids))
    .sort((a, b) => a.localeCompare(b))
    .join(",");
}

type ConsolidatedMovement = AnimalMovement & {
  groupedMovementIds?: string[];
  isConsolidated?: boolean;
} & Record<string, unknown>;

/**
 * Builds a unique key for grouping movements
 */
function buildMovementKey(movement: AnimalMovement): string {
  return [
    movement.companyId,
    movement.propertyId,
    movement.date,
    movement.locationId ?? "",
    normalizeStringIds(movement.employeeIds),
    normalizeStringIds(movement.serviceProviderIds),
    normalizeStringIds(movement.fileIds ?? []),
    (movement.observation ?? "").trim(),
  ].join("|");
}

/**
 * Merges a new movement into an existing consolidated movement
 */
function mergeMovementGroups(existing: ConsolidatedMovement, newMovement: AnimalMovement): void {
  existing.animalIds = Array.from(new Set([...existing.animalIds, ...newMovement.animalIds]));
  existing.employeeIds = Array.from(new Set([...existing.employeeIds, ...newMovement.employeeIds]));
  existing.serviceProviderIds = Array.from(
    new Set([...existing.serviceProviderIds, ...newMovement.serviceProviderIds])
  );
  existing.fileIds = Array.from(
    new Set([...(existing.fileIds ?? []), ...(newMovement.fileIds ?? [])])
  );
  existing.groupedMovementIds = Array.from(
    new Set([...(existing.groupedMovementIds ?? []), newMovement.id])
  );
}

/**
 * Preserves earliest createdAt and latest updatedAt timestamps
 */
function preserveTimestamps(existing: ConsolidatedMovement, newMovement: AnimalMovement): void {
  if (existing.createdAt && newMovement.createdAt) {
    const existingTime = new Date(existing.createdAt).getTime();
    const newTime = new Date(newMovement.createdAt).getTime();
    if (newTime < existingTime) {
      existing.createdAt = newMovement.createdAt;
    }
  } else {
    existing.createdAt = existing.createdAt ?? newMovement.createdAt;
  }

  if (existing.updatedAt && newMovement.updatedAt) {
    const existingTime = new Date(existing.updatedAt).getTime();
    const newTime = new Date(newMovement.updatedAt).getTime();
    if (newTime > existingTime) {
      existing.updatedAt = newMovement.updatedAt;
    }
  } else {
    existing.updatedAt = existing.updatedAt ?? newMovement.updatedAt;
  }
}

/**
 * Consolidates animal movements that have the same key properties into a single movement
 * Groups movements by: companyId, propertyId, date, locationId, employeeIds, serviceProviderIds, fileIds, and observation
 * @param movements - Array of animal movements to consolidate
 * @returns Array of consolidated movements with groupedMovementIds and isConsolidated flags
 */
export function consolidateAnimalMovements(movements: AnimalMovement[]): ConsolidatedMovement[] {
  const groups = new Map<string, ConsolidatedMovement>();

  for (const m of movements) {
    const key = buildMovementKey(m);
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        ...m,
        animalIds: Array.from(new Set(m.animalIds)),
        groupedMovementIds: [m.id],
      });
      continue;
    }

    mergeMovementGroups(existing, m);
    preserveTimestamps(existing, m);
  }

  const result = Array.from(groups.values());
  for (const r of result) {
    if ((r.groupedMovementIds?.length ?? 0) > 1) {
      r.isConsolidated = true;
    }
  }
  return result;
}
