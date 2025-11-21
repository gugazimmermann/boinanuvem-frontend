import type { Acquisition, AcquisitionFormData } from "~/types";
import { AnimalBreed, BirthPurity } from "~/types";
import { mockAnimals } from "./animals";
import { mockBirths } from "./births";
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
  // Only create acquisitions for animals that don't have birth records
  // And that were created after the founder period (not in first 15 of each property)
  const animalsWithoutBirths = mockAnimals.filter((animal) => {
    const birth = mockBirths.find((b) => b.animalId === animal.id);
    if (birth) return false;

    // Skip founder animals (first 15 of each property) - they should have births
    const code = animal.code;
    if (code.startsWith("FJ")) {
      const num = parseInt(code.substring(2));
      if (num <= 15) return false;
    } else if (code.startsWith("CJ")) {
      const num = parseInt(code.substring(2));
      if (num <= 15) return false;
    } else if (code.startsWith("SL")) {
      const num = parseInt(code.substring(2));
      if (num <= 15) return false;
    }

    return true;
  });

  // Select a subset of these animals to have acquisitions (about 20-30% of non-founder animals)
  const animalsToAcquire = animalsWithoutBirths.filter((_, index) => index % 4 === 0);

  animalsToAcquire.forEach((animal, index) => {
    const breed = breeds[index % breeds.length];
    // Use more realistic gender distribution (slightly more males in acquisitions)
    const gender = Math.random() < 0.55 ? "male" : "female";
    const sellerId = suppliers[index % suppliers.length];
    // More realistic price range: R$ 2,000 to R$ 12,000
    const price = 2000 + Math.floor(Math.random() * 10000);

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

          const motherBirth = motherId
            ? mockBirths.find((b) => b.animalId === motherId)
            : undefined;
          const fatherBirth = fatherId
            ? mockBirths.find((b) => b.animalId === fatherId)
            : undefined;

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

    // Acquisition date should be close to animal creation date
    const acquisitionDate = animal.createdAt;

    acquisitions.push({
      id: generateAcquisitionId(index),
      animalId: animal.id,
      acquisitionDate,
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
      createdAt: acquisitionDate,
      companyId: COMPANY_ID,
    });
  });
}

initializeAcquisitions();

export const mockAcquisitions: Acquisition[] = acquisitions;
export { initializeAcquisitions };
