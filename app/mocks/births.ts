import type { Birth, BirthFormData, Breeding } from "~/types";
import { BirthPurity, AnimalBreed } from "~/types";
import { mockAnimals } from "./animals";

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

export const mockBirths: Birth[] = [];

const births = mockBirths;

const FAZENDA_DO_JUCA_ID = "550e8400-e29b-41d4-a716-446655440010";
const SITIO_LIMOEIRO_ID = "550e8400-e29b-41d4-a716-446655440011";
const CHACARA_DO_JUCA_ID = "550e8400-e29b-41d4-a716-446655440012";

const fazendaAnimals = mockAnimals.filter((a) => a.code.startsWith("FJ"));
const chacaraAnimals = mockAnimals.filter((a) => a.code.startsWith("CJ"));
const sitioAnimals = mockAnimals.filter((a) => a.code.startsWith("SL"));

const founderCounts = {
  fazenda: 15,
  chacara: 15,
  sitio: 15,
};

let birthIndex = 0;

function getFounderBirthDate(createdAt: string, _index: number): string {
  const created = new Date(createdAt);

  const yearsBefore = Math.floor(Math.random() * 6);
  const birthDate = new Date(created);
  birthDate.setFullYear(birthDate.getFullYear() - yearsBefore);
  birthDate.setMonth(Math.floor(Math.random() * 12));
  birthDate.setDate(Math.floor(Math.random() * 28) + 1);
  return birthDate.toISOString().split("T")[0];
}

for (let i = 0; i < founderCounts.fazenda; i++) {
  const animal = fazendaAnimals[i];
  if (!animal) continue;

  const birthDate = getFounderBirthDate(animal.createdAt, i);
  const animalCreatedAt = new Date(animal.createdAt);
  const minCreatedAt = new Date(
    Math.max(animalCreatedAt.getTime(), new Date("2020-01-01").getTime())
  );
  const birthDateObj = new Date(birthDate);
  const createdAt = minCreatedAt > birthDateObj ? minCreatedAt : birthDateObj;
  births.push({
    id: generateBirthId(birthIndex++),
    animalId: animal.id,
    birthDate,
    breed: breeds[i % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: undefined,
    fatherId: undefined,
    purity: BirthPurity.PO,
    observation: "Animal fundador do rebanho",
    createdAt: createdAt.toISOString().split("T")[0],
    companyId: COMPANY_ID,
  });
}

for (let i = 0; i < founderCounts.chacara; i++) {
  const animal = chacaraAnimals[i];
  if (!animal) continue;

  const birthDate = getFounderBirthDate(animal.createdAt, i);
  const animalCreatedAt = new Date(animal.createdAt);
  const minCreatedAt = new Date(
    Math.max(animalCreatedAt.getTime(), new Date("2020-01-01").getTime())
  );
  const birthDateObj = new Date(birthDate);
  const createdAt = minCreatedAt > birthDateObj ? minCreatedAt : birthDateObj;
  births.push({
    id: generateBirthId(birthIndex++),
    animalId: animal.id,
    birthDate,
    breed: breeds[(i + 2) % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: undefined,
    fatherId: undefined,
    purity: BirthPurity.PO,
    observation: "Animal fundador do rebanho",
    createdAt: createdAt.toISOString().split("T")[0],
    companyId: COMPANY_ID,
  });
}

for (let i = 0; i < founderCounts.sitio; i++) {
  const animal = sitioAnimals[i];
  if (!animal) continue;

  const birthDate = getFounderBirthDate(animal.createdAt, i);
  const animalCreatedAt = new Date(animal.createdAt);
  const minCreatedAt = new Date(
    Math.max(animalCreatedAt.getTime(), new Date("2020-01-01").getTime())
  );
  const birthDateObj = new Date(birthDate);
  const createdAt = minCreatedAt > birthDateObj ? minCreatedAt : birthDateObj;
  births.push({
    id: generateBirthId(birthIndex++),
    animalId: animal.id,
    birthDate,
    breed: breeds[(i + 4) % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: undefined,
    fatherId: undefined,
    purity: BirthPurity.PO,
    observation: "Animal fundador do rebanho",
    createdAt: createdAt.toISOString().split("T")[0],
    companyId: COMPANY_ID,
  });
}

function addBirthsFromBreedingsForProperty(
  propertyId: string,
  propertyAnimals: typeof mockAnimals,
  startBirthIndex: number,
  breedings: Breeding[]
): number {
  let currentBirthIndex = startBirthIndex;
  const today = new Date("2025-11-21");
  const twoYearsAgo = new Date(today);
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const propertyConfirmedBreedings = breedings.filter((breeding) => {
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
        birthDate.setDate(birthDate.getDate() + 280 + Math.floor(Math.random() * 20) - 10);

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

        const genderRandom = Math.random();
        const gender = genderRandom < 0.52 ? "male" : "female";

        const minCreatedAt = new Date("2020-01-01");
        const createdAt = birthDate > minCreatedAt ? birthDate : minCreatedAt;

        births.push({
          id: generateBirthId(currentBirthIndex),
          animalId: newAnimalId,
          birthDate: birthDate.toISOString().split("T")[0],
          breed,
          gender,
          motherId: mother.id,
          fatherId: father?.id,
          purity,
          observation: `Nascimento resultante de cobertura ${breeding.method === "natural" ? "natural" : "por IA"} em ${breeding.date}`,
          createdAt: createdAt.toISOString().split("T")[0],
          companyId: COMPANY_ID,
        });

        currentBirthIndex++;
        globalIndex++;
      }
    });
  });

  return currentBirthIndex;
}

export async function addBirthsFromBreedings() {
  const { mockBreedings } = await import("./breedings");

  if (!mockBreedings || !Array.isArray(mockBreedings) || mockBreedings.length === 0) {
    return;
  }

  const fazendaAnimals = mockAnimals.filter((a) => a.code.startsWith("FJ"));
  const sitioAnimals = mockAnimals.filter((a) => a.code.startsWith("SL"));
  const chacaraAnimals = mockAnimals.filter((a) => a.code.startsWith("CJ"));

  let birthIndex = 15 + 15 + 15;

  birthIndex = addBirthsFromBreedingsForProperty(
    FAZENDA_DO_JUCA_ID,
    fazendaAnimals,
    birthIndex,
    mockBreedings
  );

  birthIndex = addBirthsFromBreedingsForProperty(
    SITIO_LIMOEIRO_ID,
    sitioAnimals,
    birthIndex,
    mockBreedings
  );

  addBirthsFromBreedingsForProperty(CHACARA_DO_JUCA_ID, chacaraAnimals, birthIndex, mockBreedings);
}
