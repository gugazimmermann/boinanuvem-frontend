/**
 * Service for managing nitrogen content values for inventory items.
 * Only items with explicitly set nitrogen content will be considered for calculations.
 * Nitrogen content is stored as kg of nitrogen per unit of the inventory item.
 */

// Mapping of inventory item ID to nitrogen content in kg per unit
const nitrogenContentMap = new Map<string, number>();

/**
 * Initialize mock nitrogen content data for fertilizer items
 */
function initializeMockData() {
  // Fertilizante NPK 20-05-20 - assuming 50 kg per bag, 20% nitrogen = 10 kg N per bag
  // Adjust based on actual bag size
  nitrogenContentMap.set("ii0e8400-e29b-41d4-a716-446655440016", 10);

  // Add more fertilizer items here as needed
  // Example: nitrogenContentMap.set("itemId", 10); // 10 kg of nitrogen per unit
}

// Initialize on module load
initializeMockData();

/**
 * Get the nitrogen content in kg per unit for an inventory item
 * @param itemId - The inventory item ID
 * @returns The nitrogen content in kg per unit, or 0 if not set
 */
export function getNitrogenContent(itemId: string): number {
  return nitrogenContentMap.get(itemId) ?? 0;
}

/**
 * Set the nitrogen content in kg per unit for an inventory item
 * @param itemId - The inventory item ID
 * @param kgPerUnit - The nitrogen content in kg per unit (must be >= 0)
 */
export function setNitrogenContent(itemId: string, kgPerUnit: number): void {
  if (kgPerUnit < 0) {
    throw new Error("Nitrogen content must be greater than or equal to 0");
  }
  nitrogenContentMap.set(itemId, kgPerUnit);
}

/**
 * Check if an inventory item has nitrogen content data
 * @param itemId - The inventory item ID
 * @returns true if the item has nitrogen content set, false otherwise
 */
export function hasNitrogenContent(itemId: string): boolean {
  return nitrogenContentMap.has(itemId);
}
