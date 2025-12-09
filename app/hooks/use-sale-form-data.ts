import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { getBuyers } from "~/services/buyers.service";
import { getProperties } from "~/services/properties.service";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import type { Buyer, Property, Animal } from "~/types";
import { mockCompanies } from "~/mocks/companies";

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
  const company = mockCompanies[0];
  const companyId = providedCompanyId || company?.id || "";

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const allAnimals = useMemo(() => {
    const animals = getAnimalsByCompanyId(companyId);
    if (includeSoldAnimals) {
      return animals.filter((a) => a.status === "active" || a.status === "sold");
    }
    return animals.filter((a) => a.status === "active");
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
