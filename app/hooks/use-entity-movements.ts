import { useEffect, useState } from "react";
import type { LocationMovement, AnimalMovement } from "~/types";
import type { UnifiedMovement } from "~/utils/movement-search-helpers";
import {
  getLocationMovementsByPropertyId,
  getLocationMovementsByLocationId,
} from "~/services/location-movements.service";
import {
  getAnimalMovementsByPropertyId,
  getAnimalMovementsByLocationId,
} from "~/services/animal-movements.service";
import { consolidateAnimalMovements } from "~/utils/movement-consolidation";

interface UseEntityMovementsOptions {
  entityType: "property" | "location";
  entityId: string | null | undefined;
}

export function useEntityMovements({ entityType, entityId }: UseEntityMovementsOptions) {
  const [movements, setMovements] = useState<UnifiedMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMovements = async () => {
      if (!entityId) {
        setMovements([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let locationMovements: LocationMovement[];
        let animalMovements: AnimalMovement[];

        if (entityType === "property") {
          [locationMovements, animalMovements] = await Promise.all([
            getLocationMovementsByPropertyId(entityId),
            getAnimalMovementsByPropertyId(entityId),
          ]);
        } else {
          // location
          [locationMovements, animalMovements] = await Promise.all([
            getLocationMovementsByLocationId(entityId),
            getAnimalMovementsByLocationId(entityId),
          ]);
        }

        const consolidatedAnimalMovements = consolidateAnimalMovements(animalMovements);

        const unifiedMovements: UnifiedMovement[] = [
          ...locationMovements.map((m) => ({ ...m, movementType: "location" as const })),
          ...consolidatedAnimalMovements.map((m) => ({ ...m, movementType: "animal" as const })),
        ];

        setMovements(unifiedMovements);
      } catch (error) {
        console.error(`Failed to load ${entityType} movements:`, error);
        setMovements([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadMovements();
  }, [entityType, entityId]);

  return { movements, isLoading };
}
