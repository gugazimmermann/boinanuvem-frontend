import type { Acquisition, AcquisitionFormData } from "~/types";
import { AnimalBreed, BirthPurity } from "~/types";
import { mockAnimals } from "./animals";
import { getBirthByAnimalId } from "~/services/births.service";
import { generateAcquisitionId } from "~/services/acquisitions.service";

export type { Acquisition, AcquisitionFormData };

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";

const suppliers = [
  "990e8400-e29b-41d4-a716-446655440010",
  "990e8400-e29b-41d4-a716-446655440011",
  "990e8400-e29b-41d4-a716-446655440012",
];

const breeds = [
  AnimalBreed.NELORE,
  AnimalBreed.ANGUS,
  AnimalBreed.BRAHMAN,
  AnimalBreed.HEREFORD,
  AnimalBreed.CANCHIM,
  AnimalBreed.GUZERA,
  AnimalBreed.GIROLANDO,
  AnimalBreed.SIMENTAL,
];

const acquisitions: Acquisition[] = [];

function initializeAcquisitions(): void {
  const animalsWithAcquisition = mockAnimals.filter((a) => a.acquisitionDate);

  animalsWithAcquisition.forEach((animal, index) => {
    const birth = getBirthByAnimalId(animal.id);

    if (birth) return;

    const breed = breeds[index % breeds.length];
    const gender = index % 2 === 0 ? "male" : "female";
    const sellerId = suppliers[index % suppliers.length];
    const price = 2000 + (index % 20) * 500;

    let motherId: string | undefined;
    let fatherId: string | undefined;
    let motherRegistrationNumber: string | undefined;
    let fatherRegistrationNumber: string | undefined;
    let birthDate: string | undefined;
    let purity: BirthPurity | undefined;

    if (index % 3 === 0) {
      const samePropertyAnimals = mockAnimals.filter((a) => a.propertyId === animal.propertyId);
      if (samePropertyAnimals.length > 0) {
        const parentIndex = index % samePropertyAnimals.length;
        if (parentIndex < samePropertyAnimals.length - 1) {
          motherId = samePropertyAnimals[parentIndex]?.id;
          fatherId = samePropertyAnimals[parentIndex + 1]?.id;
          motherRegistrationNumber = samePropertyAnimals[parentIndex]?.registrationNumber;
          fatherRegistrationNumber = samePropertyAnimals[parentIndex + 1]?.registrationNumber;

          const acquisitionDate = new Date(animal.acquisitionDate!);
          const birthYear = acquisitionDate.getFullYear() - 2 - (index % 2);
          const birthMonth = String((index % 12) + 1).padStart(2, "0");
          const birthDay = String((index % 28) + 1).padStart(2, "0");
          birthDate = `${birthYear}-${birthMonth}-${birthDay}`;

          const motherBirth = motherId ? getBirthByAnimalId(motherId) : undefined;
          const fatherBirth = fatherId ? getBirthByAnimalId(fatherId) : undefined;

          if (motherBirth && fatherBirth) {
            if (
              motherBirth.purity === BirthPurity.PO &&
              fatherBirth.purity === BirthPurity.PO &&
              motherBirth.breed === fatherBirth.breed
            ) {
              purity = BirthPurity.PO;
            } else if (
              motherBirth.purity === BirthPurity.PO &&
              fatherBirth.purity === BirthPurity.PO
            ) {
              purity = BirthPurity.F1;
            } else {
              purity = BirthPurity.F2;
            }
          } else if (motherBirth || fatherBirth) {
            purity = BirthPurity.F1;
          } else {
            purity = BirthPurity.PO;
          }
        }
      }
    }

    acquisitions.push({
      id: generateAcquisitionId(index),
      animalId: animal.id,
      acquisitionDate: animal.acquisitionDate!,
      breed,
      gender,
      sellerId,
      price,
      observation: purity
        ? "Aquisição com genealogia parcial registrada"
        : "Aquisição de animal para o rebanho",
      birthDate,
      motherId,
      fatherId,
      motherRegistrationNumber,
      fatherRegistrationNumber,
      purity,
      birthObservation: birthDate ? "Data de nascimento informada pelo vendedor" : undefined,
      createdAt: animal.acquisitionDate!,
      companyId: COMPANY_ID,
    });
  });
}

// Initialize acquisitions on module load
initializeAcquisitions();

export const mockAcquisitions: Acquisition[] = acquisitions;
export { initializeAcquisitions };
