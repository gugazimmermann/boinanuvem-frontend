const nitrogenContentMap = new Map<string, number>();

function initializeMockData() {
  nitrogenContentMap.set("ii0e8400-e29b-41d4-a716-446655440016", 10);
}

initializeMockData();

export function getNitrogenContent(itemId: string): number {
  return nitrogenContentMap.get(itemId) ?? 0;
}

export function setNitrogenContent(itemId: string, kgPerUnit: number): void {
  if (kgPerUnit < 0) {
    throw new Error("Nitrogen content must be greater than or equal to 0");
  }
  nitrogenContentMap.set(itemId, kgPerUnit);
}

export function hasNitrogenContent(itemId: string): boolean {
  return nitrogenContentMap.has(itemId);
}
