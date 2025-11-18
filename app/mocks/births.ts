import type { Birth, BirthFormData } from "~/types";
import { BirthPurity, AnimalBreed } from "~/types";
import { mockAnimals } from "./animals";
import { mockBreedings } from "./breedings";

export type { Birth, BirthFormData };
export { BirthPurity };

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";

function generateBirthId(index: number): string {
  const base = 446655440100 + index;
  return `bi0e8400-e29b-41d4-a716-${base.toString().padStart(12, "0")}`;
}

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

const births: Birth[] = [];

const FAZENDA_DO_JUCA_ID = "550e8400-e29b-41d4-a716-446655440010";
const SITIO_LIMOEIRO_ID = "550e8400-e29b-41d4-a716-446655440011";
const CHACARA_DO_JUCA_ID = "550e8400-e29b-41d4-a716-446655440012";

const fazendaAnimals = mockAnimals.filter((a) => a.code.startsWith("FJ"));
const chacaraAnimals = mockAnimals.filter((a) => a.code.startsWith("CJ"));
const sitioAnimals = mockAnimals.filter((a) => a.code.startsWith("SL"));

const founderCounts = {
  fazenda: 10,
  chacara: 5,
  sitio: 5,
};

let birthIndex = 0;

for (let i = 0; i < founderCounts.fazenda; i++) {
  const animal = fazendaAnimals[i];
  if (!animal) continue;

  births.push({
    id: generateBirthId(birthIndex++),
    animalId: animal.id,
    birthDate: animal.createdAt,
    breed: breeds[i % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: undefined,
    fatherId: undefined,
    purity: BirthPurity.PO,
    observation: "Animal fundador do rebanho",
    createdAt: animal.createdAt,
    companyId: COMPANY_ID,
  });
}

for (let i = 0; i < founderCounts.chacara; i++) {
  const animal = chacaraAnimals[i];
  if (!animal) continue;

  births.push({
    id: generateBirthId(birthIndex++),
    animalId: animal.id,
    birthDate: animal.createdAt,
    breed: breeds[(i + 2) % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: undefined,
    fatherId: undefined,
    purity: BirthPurity.PO,
    observation: "Animal fundador do rebanho",
    createdAt: animal.createdAt,
    companyId: COMPANY_ID,
  });
}

for (let i = 0; i < founderCounts.sitio; i++) {
  const animal = sitioAnimals[i];
  if (!animal) continue;

  births.push({
    id: generateBirthId(birthIndex++),
    animalId: animal.id,
    birthDate: animal.createdAt,
    breed: breeds[(i + 4) % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: undefined,
    fatherId: undefined,
    purity: BirthPurity.PO,
    observation: "Animal fundador do rebanho",
    createdAt: animal.createdAt,
    companyId: COMPANY_ID,
  });
}

export const mockBirths: Birth[] = births;

function addBirthsFromBreedingsForProperty(
  propertyId: string,
  propertyAnimals: typeof mockAnimals,
  startBirthIndex: number
): number {
  let currentBirthIndex = startBirthIndex;
  const today = new Date();
  const twoYearsAgo = new Date(today);
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const propertyConfirmedBreedings = mockBreedings.filter((breeding) => {
    const animal = mockAnimals.find((a) => a.id === breeding.animalId);
    return animal?.propertyId === propertyId && breeding.confirmed === true;
  });

  const breedingsByAnimal = new Map<string, typeof propertyConfirmedBreedings>();
  propertyConfirmedBreedings.forEach((breeding) => {
    if (!breedingsByAnimal.has(breeding.animalId)) {
      breedingsByAnimal.set(breeding.animalId, []);
    }
    breedingsByAnimal.get(breeding.animalId)!.push(breeding);
  });

  let globalIndex = 0;
  breedingsByAnimal.forEach((animalBreedings) => {
    const sortedBreedings = [...animalBreedings].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedBreedings.forEach((breeding, breedingIndex) => {
      const breedingDate = new Date(breeding.date);

      if (breedingDate < twoYearsAgo) {
        return;
      }

      const shouldCreateBirth =
        breedingIndex === 0 ||
        globalIndex % 10 < 8 ||
        (globalIndex % 10 === 8 && globalIndex % 2 === 0);

      if (shouldCreateBirth) {
        const birthDate = new Date(breedingDate);
        birthDate.setDate(birthDate.getDate() + 270 + Math.floor(Math.random() * 30) - 15);

        if (birthDate > today) {
          return;
        }

        const mother = propertyAnimals.find((a) => a.id === breeding.animalId);
        if (!mother) return;

        let father = null;
        if (breeding.bullId) {
          father = propertyAnimals.find((a) => a.id === breeding.bullId);
        }
        if (!father && propertyAnimals.length > 0) {
          const bulls = propertyAnimals.filter((a) => {
            const birth = mockBirths.find((b) => b.animalId === a.id);
            return birth?.gender === "male";
          });
          if (bulls.length > 0) {
            father = bulls[globalIndex % bulls.length];
          }
        }

        const motherBirth = mockBirths.find((b) => b.animalId === mother.id);
        const fatherBirth = father ? mockBirths.find((b) => b.animalId === father.id) : undefined;

        const breed =
          fatherBirth?.breed || motherBirth?.breed || breeds[globalIndex % breeds.length];
        let purity = BirthPurity.PO;
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
        }

        const newAnimalId = `bb0e8400-e29b-41d4-a716-${(446655440200 + currentBirthIndex)
          .toString()
          .padStart(12, "0")}`;

        mockBirths.push({
          id: generateBirthId(currentBirthIndex),
          animalId: newAnimalId,
          birthDate: birthDate.toISOString().split("T")[0],
          breed,
          gender: globalIndex % 2 === 0 ? "male" : "female",
          motherId: mother.id,
          fatherId: father?.id,
          purity,
          observation: `Nascimento resultante de cobertura ${breeding.method === "natural" ? "natural" : "por IA"} em ${breeding.date}`,
          createdAt: birthDate.toISOString().split("T")[0],
          companyId: COMPANY_ID,
        });

        currentBirthIndex++;
        globalIndex++;
      }
    });
  });

  return currentBirthIndex;
}

export function addBirthsFromBreedings() {
  const fazendaAnimals = mockAnimals.filter((a) => a.code.startsWith("FJ"));
  const sitioAnimals = mockAnimals.filter((a) => a.code.startsWith("SL"));
  const chacaraAnimals = mockAnimals.filter((a) => a.code.startsWith("CJ"));

  let birthIndex = founderCounts.fazenda + founderCounts.chacara + founderCounts.sitio;

  birthIndex = addBirthsFromBreedingsForProperty(FAZENDA_DO_JUCA_ID, fazendaAnimals, birthIndex);

  birthIndex = addBirthsFromBreedingsForProperty(SITIO_LIMOEIRO_ID, sitioAnimals, birthIndex);

  addBirthsFromBreedingsForProperty(CHACARA_DO_JUCA_ID, chacaraAnimals, birthIndex);
}

addBirthsFromBreedings();
