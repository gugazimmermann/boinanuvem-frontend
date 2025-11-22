import type { Acquisition, AcquisitionFormData } from "~/types";
import { AnimalBreed, BirthPurity, PricingMode, AcquisitionPaymentMethod } from "~/types";
import { mockAnimals } from "./animals";
import { mockBirths } from "./births";
import { generateAcquisitionId } from "~/services/acquisitions.service";

const ARROBA_KG = 30; // 1 arroba = 30 kg

function calculateCostPerArroba(weightInKg: number, costPerAnimal: number): number {
  if (weightInKg <= 0) return 0;
  const arrobas = weightInKg / ARROBA_KG;
  return arrobas > 0 ? costPerAnimal / arrobas : 0;
}

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

  // Group animals into batch acquisitions (some single, some multiple)
  let acquisitionIndex = 0;
  for (
    let i = 0;
    i < animalsToAcquire.length;
    i += Math.random() < 0.7 ? 1 : Math.floor(Math.random() * 3) + 2
  ) {
    const animalsInAcquisition = animalsToAcquire.slice(
      i,
      Math.min(
        i + (Math.random() < 0.7 ? 1 : Math.floor(Math.random() * 3) + 2),
        animalsToAcquire.length
      )
    );

    if (animalsInAcquisition.length === 0) continue;

    const firstAnimal = animalsInAcquisition[0];
    const propertyId = firstAnimal.propertyId;
    const supplierId = suppliers[acquisitionIndex % suppliers.length];
    const acquisitionDate = firstAnimal.acquisitionDate || firstAnimal.createdAt;

    // Determine pricing mode (more likely to be total for batch acquisitions)
    const pricingMode =
      animalsInAcquisition.length > 1 && Math.random() < 0.6
        ? PricingMode.TOTAL
        : PricingMode.INDIVIDUAL;

    // Determine payment method
    const paymentMethod =
      Math.random() < 0.7
        ? AcquisitionPaymentMethod.CASH_FLOW
        : AcquisitionPaymentMethod.ACCOUNTS_PAYABLE;

    // Calculate prices and weights
    const acquisitionItems = animalsInAcquisition.map((animal, itemIndex) => {
      const breed = breeds[(acquisitionIndex + itemIndex) % breeds.length];
      const gender = Math.random() < 0.55 ? "male" : "female";
      // More realistic price range: R$ 2,000 to R$ 12,000
      const price = 2000 + Math.floor(Math.random() * 10000);
      // Weight range: 200-500 kg
      const weight = 200 + Math.floor(Math.random() * 300);

      let motherId: string | undefined;
      let fatherId: string | undefined;
      let motherRegistrationNumber: string | undefined;
      let fatherRegistrationNumber: string | undefined;
      let birthDate: string | undefined;
      let purity: BirthPurity | undefined;

      if ((acquisitionIndex + itemIndex) % 3 === 0) {
        const samePropertyAnimals = mockAnimals.filter((a) => a.propertyId === animal.propertyId);
        if (samePropertyAnimals.length > 0) {
          const parentIndex = (acquisitionIndex + itemIndex) % samePropertyAnimals.length;
          if (parentIndex < samePropertyAnimals.length - 1) {
            motherId = samePropertyAnimals[parentIndex]?.id;
            fatherId = samePropertyAnimals[parentIndex + 1]?.id;
            motherRegistrationNumber = samePropertyAnimals[parentIndex]?.registrationNumber;
            fatherRegistrationNumber = samePropertyAnimals[parentIndex + 1]?.registrationNumber;

            const acqDate = new Date(acquisitionDate);
            const birthYear = acqDate.getFullYear() - 2 - ((acquisitionIndex + itemIndex) % 2);
            const birthMonth = String(((acquisitionIndex + itemIndex) % 12) + 1).padStart(2, "0");
            const birthDay = String(((acquisitionIndex + itemIndex) % 28) + 1).padStart(2, "0");
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

      const costPerArroba = calculateCostPerArroba(weight, price);

      return {
        animalId: animal.id,
        price,
        weight,
        costPerArroba,
        breed,
        gender: gender as "male" | "female",
        birthDate,
        motherId,
        fatherId,
        motherRegistrationNumber,
        fatherRegistrationNumber,
        purity,
        birthObservation: birthDate ? "Data de nascimento informada pelo vendedor" : undefined,
      };
    });

    // Calculate total price
    const totalPrice = acquisitionItems.reduce((sum, item) => sum + item.price, 0);
    const transportationFee = Math.random() < 0.5 ? Math.floor(Math.random() * 1000) : undefined;
    const handlingFee = Math.random() < 0.3 ? Math.floor(Math.random() * 500) : undefined;

    acquisitions.push({
      id: generateAcquisitionId(acquisitionIndex),
      companyId: COMPANY_ID,
      propertyId,
      supplierId,
      acquisitionDate,
      pricingMode,
      paymentMethod,
      totalPrice,
      transportationFee,
      handlingFee,
      acquisitionItems,
      observation:
        animalsInAcquisition.length > 1
          ? `Aquisição de lote com ${animalsInAcquisition.length} animais`
          : "Aquisição de animal para o rebanho",
      createdAt: acquisitionDate,
    });

    acquisitionIndex++;
  }
}

initializeAcquisitions();

export const mockAcquisitions: Acquisition[] = acquisitions;
export { initializeAcquisitions };
