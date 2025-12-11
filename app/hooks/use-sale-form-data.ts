import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { getBuyers } from "~/services/buyers.service";
import { getProperties } from "~/services/properties.service";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import type { Buyer, Property, Animal } from "~/types";

export interface UseSaleFormDataOptions {
  /** Company ID - if not provided, uses mockCompanies[0] */
  companyId?: string;
  /** Whether to include sold animals (for edit mode) */
  includeSoldAnimals?: boolean;
  /** Pre-selected animal IDs from location state */
  preSelectedAnimalIds?: string[];
}

export interface UseSaleFormDataReturn {
  /** All animals available for sale */
  animals: Animal[];
  /** Buyers filtered by company */
  buyers: Buyer[];
  /** Properties filtered by company */
  properties: Property[];
  /** Company ID being used */
  companyId: string;
  /** Pre-selected animal IDs */
  preSelectedAnimalIds: string[];
  /** Whether data is loading */
  isLoading: boolean;
}

/**
 * Hook to manage sale form data fetching and state
 */
export function useSaleFormData({
  companyId: providedCompanyId,
  includeSoldAnimals = false,
  preSelectedAnimalIds: providedPreSelectedAnimalIds,
}: UseSaleFormDataOptions = {}): UseSaleFormDataReturn {
  const location = useLocation();
  // Use providedCompanyId if given, otherwise use empty string
  // Routes should explicitly provide companyId (e.g., from mockCompanies[0]?.id)
  // This allows tests to verify behavior when no companyId is provided
  const companyId = providedCompanyId ?? "";

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [allAnimals, setAllAnimals] = useState<Animal[]>([]);

  useEffect(() => {
    const loadAnimals = async () => {
      if (!companyId) {
        setAllAnimals([]);
        return;
      }
      try {
        const animalsData = await getAnimalsByCompanyId(companyId);
        const filtered = includeSoldAnimals
          ? animalsData.filter((a) => a.status === "active" || a.status === "sold")
          : animalsData.filter((a) => a.status === "active");
        setAllAnimals(filtered || []);
      } catch (error) {
        console.error("Failed to load animals:", error);
        setAllAnimals([]);
      }
    };
    loadAnimals();
  }, [companyId, includeSoldAnimals]);

  const preSelectedAnimalIds = useMemo(() => {
    if (providedPreSelectedAnimalIds) {
      return providedPreSelectedAnimalIds;
    }
    const state = location.state as { animalIds?: string[] } | null;
    return state?.animalIds || [];
  }, [location.state, providedPreSelectedAnimalIds]);

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) {
        setBuyers([]);
        setProperties([]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [buyersData, propertiesData] = await Promise.all([getBuyers(), getProperties()]);
        // Filter by companyId
        setBuyers(buyersData.filter((buy) => buy.companyId === companyId));
        setProperties(propertiesData.filter((prop) => prop.companyId === companyId));
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  return {
    animals: allAnimals,
    buyers,
    properties,
    companyId,
    preSelectedAnimalIds,
    isLoading,
  };
}
