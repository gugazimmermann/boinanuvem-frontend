/**
 * Generic period filtering utilities
 * Used to filter date-based entities by a time period
 */

export interface Period {
  startDate?: string;
  endDate?: string;
}

/**
 * Type for entities that have a date property
 */
type DateEntity =
  | { date: string }
  | { birthDate: string }
  | { createdAt: string }
  | { acquisitionDate?: string };

/**
 * Get the date value from an entity
 */
function getEntityDate(entity: DateEntity): Date {
  if ("date" in entity) {
    return new Date(entity.date);
  }
  if ("birthDate" in entity) {
    return new Date(entity.birthDate);
  }
  if ("createdAt" in entity) {
    return new Date(entity.createdAt);
  }
  if ("acquisitionDate" in entity && entity.acquisitionDate) {
    return new Date(entity.acquisitionDate);
  }
  throw new Error("Entity does not have a valid date property");
}

/**
 * Generic function to filter entities by a time period
 * @param entities Array of entities with date properties
 * @param period Optional period with startDate and/or endDate
 * @returns Filtered array of entities
 */
export function filterByPeriod<T extends DateEntity>(entities: T[], period?: Period): T[] {
  if (!period?.startDate && !period?.endDate) {
    return entities;
  }

  return entities.filter((entity) => {
    const entityDate = getEntityDate(entity).getTime();

    if (period.startDate) {
      const start = new Date(period.startDate).getTime();
      if (entityDate < start) return false;
    }

    if (period.endDate) {
      const end = new Date(period.endDate).getTime();
      if (entityDate > end) return false;
    }

    return true;
  });
}

/**
 * Check if a date falls within a period
 * @param date Date string or Date object
 * @param period Period with startDate and/or endDate
 * @returns True if date is within period
 */
export function isDateInPeriod(date: string | Date, period?: Period): boolean {
  if (!period?.startDate && !period?.endDate) {
    return true;
  }

  const dateTime = new Date(date).getTime();

  if (period.startDate) {
    const start = new Date(period.startDate).getTime();
    if (dateTime < start) return false;
  }

  if (period.endDate) {
    const end = new Date(period.endDate).getTime();
    if (dateTime > end) return false;
  }

  return true;
}
