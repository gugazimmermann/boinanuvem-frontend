import type { Acquisition, AcquisitionFormData } from "~/types";
import { AnimalBreed } from "~/types";

export type { Acquisition, AcquisitionFormData };

export const mockAcquisitions: Acquisition[] = [];

export function getAcquisitionById(acquisitionId: string | undefined): Acquisition | undefined {
  if (!acquisitionId) return undefined;
  return mockAcquisitions.find((acquisition) => acquisition.id === acquisitionId);
}

export function getAcquisitionByAnimalId(animalId: string): Acquisition | undefined {
  return mockAcquisitions.find((acquisition) => acquisition.animalId === animalId);
}

export function getAcquisitionsByCompanyId(companyId: string): Acquisition[] {
  return mockAcquisitions.filter((acquisition) => acquisition.companyId === companyId);
}

export function addAcquisition(data: AcquisitionFormData): Acquisition {
  const lastId =
    mockAcquisitions.length > 0
      ? mockAcquisitions[mockAcquisitions.length - 1].id
      : "ac0e8400-e29b-41d4-a716-446655440009";
  const lastPart = lastId.split("-").pop() || "446655440009";
  const lastNumber = parseInt(lastPart, 10);
  const nextNumber = (lastNumber + 1).toString().padStart(12, "0");

  const newAcquisition: Acquisition = {
    ...data,
    id: `ac0e8400-e29b-41d4-a716-${nextNumber}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockAcquisitions.push(newAcquisition);
  return newAcquisition;
}

export function deleteAcquisition(acquisitionId: string): boolean {
  const index = mockAcquisitions.findIndex((acquisition) => acquisition.id === acquisitionId);
  if (index !== -1) {
    mockAcquisitions.splice(index, 1);
    return true;
  }
  return false;
}

export function updateAcquisition(
  acquisitionId: string,
  data: Partial<AcquisitionFormData>
): boolean {
  const index = mockAcquisitions.findIndex((acquisition) => acquisition.id === acquisitionId);
  if (index !== -1) {
    mockAcquisitions[index] = {
      ...mockAcquisitions[index],
      ...data,
    };
    return true;
  }
  return false;
}

