export interface EntityWithId {
  id: string;
  createdAt?: string;
}

export interface BaseServiceConfig<T extends EntityWithId> {
  data: T[];
  idPrefix: string;
  defaultId: string;
}

export function generateNextId<T extends EntityWithId>(
  data: T[],
  idPrefix: string,
  defaultId: string
): string {
  if (data.length === 0) {
    return defaultId;
  }

  const lastId = data[data.length - 1].id;
  const lastPart = lastId.split("-").pop() || "446655440009";
  const lastNumber = parseInt(lastPart, 10);
  const nextNumber = (lastNumber + 1).toString().padStart(12, "0");

  return `${idPrefix}-${nextNumber}`;
}

export function findById<T extends EntityWithId>(data: T[], id: string | undefined): T | undefined {
  if (!id) return undefined;
  return data.find((item) => item.id === id);
}

export function findByField<T extends EntityWithId>(
  data: T[],
  field: keyof T,
  value: unknown
): T[] {
  return data.filter((item) => item[field] === value);
}

export function findByFieldIncludes<T extends EntityWithId>(
  data: T[],
  field: keyof T,
  value: unknown
): T[] {
  return data.filter((item) => {
    const fieldValue = item[field];
    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(value);
    }
    return false;
  });
}

export function createEntity<T extends EntityWithId, TFormData>(
  data: T[],
  formData: TFormData,
  idPrefix: string,
  defaultId: string
): T {
  const newEntity = {
    ...formData,
    id: generateNextId(data, idPrefix, defaultId),
    createdAt: new Date().toISOString().split("T")[0],
  } as unknown as T;

  data.push(newEntity);
  return newEntity;
}

export function updateEntity<T extends EntityWithId, TFormData>(
  data: T[],
  id: string,
  formData: Partial<TFormData>
): boolean {
  const index = data.findIndex((item) => item.id === id);
  if (index !== -1) {
    data[index] = {
      ...data[index],
      ...formData,
    } as T;
    return true;
  }
  return false;
}

export function deleteEntity<T extends EntityWithId>(data: T[], id: string): boolean {
  const index = data.findIndex((item) => item.id === id);
  if (index !== -1) {
    data.splice(index, 1);
    return true;
  }
  return false;
}
