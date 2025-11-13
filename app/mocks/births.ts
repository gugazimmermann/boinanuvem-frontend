import type { Birth, BirthFormData } from "~/types";
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

const births: Birth[] = [];

const fazendaAnimals = mockAnimals.filter((a) => a.code.startsWith("FJ"));
const chacaraAnimals = mockAnimals.filter((a) => a.code.startsWith("CJ"));
const sitioAnimals = mockAnimals.filter((a) => a.code.startsWith("SL"));

for (let i = 0; i < 15; i++) {
  const animal = fazendaAnimals[i];
  if (!animal) continue;
  
  births.push({
    id: generateBirthId(i),
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

for (let i = 15; i < 55; i++) {
  const animal = fazendaAnimals[i];
  if (!animal) continue;
  
  const mother = fazendaAnimals[i % 15];
  const father = fazendaAnimals[(i + 7) % 15];
  const motherBirth = births.find((b) => b.animalId === mother.id);
  const fatherBirth = births.find((b) => b.animalId === father.id);
  
  const purity = 
    motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.PO && 
    motherBirth?.breed === fatherBirth?.breed
      ? BirthPurity.PO
      : motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.PO
      ? BirthPurity.F1
      : BirthPurity.F2;
  
  births.push({
    id: generateBirthId(i),
    animalId: animal.id,
    birthDate: animal.createdAt,
    breed: fatherBirth?.breed || breeds[i % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: mother.id,
    fatherId: father.id,
    purity,
    observation: "Nascimento com genealogia registrada",
    createdAt: animal.createdAt,
    companyId: COMPANY_ID,
  });
}

for (let i = 55; i < 105; i++) {
  const animal = fazendaAnimals[i];
  if (!animal) continue;
  
  const parentIndex = 15 + (i % 40);
  const mother = fazendaAnimals[parentIndex];
  const father = fazendaAnimals[parentIndex + 1];
  
  if (!mother || !father) continue;
  
  const motherBirth = births.find((b) => b.animalId === mother.id);
  const fatherBirth = births.find((b) => b.animalId === father.id);
  
  let purity = BirthPurity.F2;
  if (motherBirth && fatherBirth) {
    if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F1) {
      purity = BirthPurity.F2;
    } else if (motherBirth.purity === BirthPurity.F1 && fatherBirth.purity === BirthPurity.F1) {
      purity = BirthPurity.F2;
    } else if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F2) {
      purity = BirthPurity.F3;
    } else if (motherBirth.purity === BirthPurity.F2 && fatherBirth.purity === BirthPurity.F2) {
      purity = BirthPurity.F3;
    } else if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F3) {
      purity = BirthPurity.F4;
    }
  }
  
  births.push({
    id: generateBirthId(i),
    animalId: animal.id,
    birthDate: animal.createdAt,
    breed: fatherBirth?.breed || motherBirth?.breed || breeds[i % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: mother.id,
    fatherId: father.id,
    purity,
    observation: "Nascimento com genealogia completa até avós",
    createdAt: animal.createdAt,
    companyId: COMPANY_ID,
  });
}

for (let i = 105; i < 135; i++) {
  const animal = fazendaAnimals[i];
  if (!animal) continue;
  
  const parentIndex = 55 + (i % 50);
  const mother = fazendaAnimals[parentIndex];
  const father = fazendaAnimals[parentIndex + 1];
  
  if (!mother || !father) continue;
  
  const motherBirth = births.find((b) => b.animalId === mother.id);
  const fatherBirth = births.find((b) => b.animalId === father.id);
  
  let purity = BirthPurity.F3;
  if (motherBirth && fatherBirth) {
    if (motherBirth.purity === BirthPurity.F2 && fatherBirth.purity === BirthPurity.F2) {
      purity = BirthPurity.F3;
    } else if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F3) {
      purity = BirthPurity.F4;
    } else if (motherBirth.purity === BirthPurity.F3 && fatherBirth.purity === BirthPurity.F3) {
      purity = BirthPurity.F4;
    } else if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F4) {
      purity = BirthPurity.F5;
    } else if (motherBirth.purity === BirthPurity.F4 && fatherBirth.purity === BirthPurity.F4) {
      purity = BirthPurity.F5;
    }
  }
  
  births.push({
    id: generateBirthId(i),
    animalId: animal.id,
    birthDate: animal.createdAt,
    breed: fatherBirth?.breed || motherBirth?.breed || breeds[i % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: mother.id,
    fatherId: father.id,
    purity,
    observation: "Nascimento com genealogia profunda registrada",
    createdAt: animal.createdAt,
    companyId: COMPANY_ID,
  });
}

for (let i = 135; i < 150; i++) {
  const animal = fazendaAnimals[i];
  if (!animal) continue;
  
  const parentIndex = 105 + (i % 30);
  const mother = fazendaAnimals[parentIndex];
  const father = fazendaAnimals[parentIndex + 1];
  
  if (!mother || !father) continue;
  
  const motherBirth = births.find((b) => b.animalId === mother.id);
  const fatherBirth = births.find((b) => b.animalId === father.id);
  
  let purity = BirthPurity.F4;
  if (motherBirth && fatherBirth) {
    if (motherBirth.purity === BirthPurity.F3 && fatherBirth.purity === BirthPurity.F3) {
      purity = BirthPurity.F4;
    } else if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F4) {
      purity = BirthPurity.F5;
    } else if (motherBirth.purity === BirthPurity.F4 && fatherBirth.purity === BirthPurity.F4) {
      purity = BirthPurity.F5;
    } else if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F5) {
      purity = BirthPurity.PC;
    } else if (motherBirth.purity === BirthPurity.F5 && fatherBirth.purity === BirthPurity.F5) {
      purity = BirthPurity.PC;
    }
  }
  
  births.push({
    id: generateBirthId(i),
    animalId: animal.id,
    birthDate: animal.createdAt,
    breed: fatherBirth?.breed || motherBirth?.breed || breeds[i % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: mother.id,
    fatherId: father.id,
    purity,
    observation: "Nascimento com genealogia muito profunda registrada",
    createdAt: animal.createdAt,
    companyId: COMPANY_ID,
  });
}

for (let i = 0; i < 8; i++) {
  const animal = chacaraAnimals[i];
  if (!animal) continue;
  
  births.push({
    id: generateBirthId(150 + i),
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

for (let i = 8; i < 23; i++) {
  const animal = chacaraAnimals[i];
  if (!animal) continue;
  
  const mother = chacaraAnimals[i % 8];
  const father = chacaraAnimals[(i + 3) % 8];
  const motherBirth = births.find((b) => b.animalId === mother.id);
  const fatherBirth = births.find((b) => b.animalId === father.id);
  
  const purity = 
    motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.PO && 
    motherBirth?.breed === fatherBirth?.breed
      ? BirthPurity.PO
      : motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.PO
      ? BirthPurity.F1
      : BirthPurity.F2;
  
  births.push({
    id: generateBirthId(150 + i),
    animalId: animal.id,
    birthDate: animal.createdAt,
    breed: fatherBirth?.breed || breeds[i % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: mother.id,
    fatherId: father.id,
    purity,
    observation: "Nascimento com genealogia registrada",
    createdAt: animal.createdAt,
    companyId: COMPANY_ID,
  });
}

for (let i = 23; i < 35; i++) {
  const animal = chacaraAnimals[i];
  if (!animal) continue;
  
  const parentIndex = 8 + (i % 15);
  const mother = chacaraAnimals[parentIndex];
  const father = chacaraAnimals[parentIndex + 1];
  
  if (!mother || !father) continue;
  
  const motherBirth = births.find((b) => b.animalId === mother.id);
  const fatherBirth = births.find((b) => b.animalId === father.id);
  
  let purity = BirthPurity.F2;
  if (motherBirth && fatherBirth) {
    if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F1) {
      purity = BirthPurity.F2;
    } else if (motherBirth.purity === BirthPurity.F1 && fatherBirth.purity === BirthPurity.F1) {
      purity = BirthPurity.F2;
    } else if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F2) {
      purity = BirthPurity.F3;
    } else if (motherBirth.purity === BirthPurity.F2 && fatherBirth.purity === BirthPurity.F2) {
      purity = BirthPurity.F3;
    } else if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F3) {
      purity = BirthPurity.F4;
    }
  }
  
  births.push({
    id: generateBirthId(150 + i),
    animalId: animal.id,
    birthDate: animal.createdAt,
    breed: fatherBirth?.breed || motherBirth?.breed || breeds[i % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: mother.id,
    fatherId: father.id,
    purity,
    observation: "Nascimento com genealogia completa até avós",
    createdAt: animal.createdAt,
    companyId: COMPANY_ID,
  });
}

for (let i = 35; i < 40; i++) {
  const animal = chacaraAnimals[i];
  if (!animal) continue;
  
  const parentIndex = 23 + (i % 12);
  const mother = chacaraAnimals[parentIndex];
  const father = chacaraAnimals[parentIndex + 1];
  
  if (!mother || !father) continue;
  
  const motherBirth = births.find((b) => b.animalId === mother.id);
  const fatherBirth = births.find((b) => b.animalId === father.id);
  
  let purity = BirthPurity.F3;
  if (motherBirth && fatherBirth) {
    if (motherBirth.purity === BirthPurity.F2 && fatherBirth.purity === BirthPurity.F2) {
      purity = BirthPurity.F3;
    } else if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F3) {
      purity = BirthPurity.F4;
    } else if (motherBirth.purity === BirthPurity.F3 && fatherBirth.purity === BirthPurity.F3) {
      purity = BirthPurity.F4;
    } else if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F4) {
      purity = BirthPurity.F5;
    }
  }
  
  births.push({
    id: generateBirthId(150 + i),
    animalId: animal.id,
    birthDate: animal.createdAt,
    breed: fatherBirth?.breed || motherBirth?.breed || breeds[i % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: mother.id,
    fatherId: father.id,
    purity,
    observation: "Nascimento com genealogia profunda registrada",
    createdAt: animal.createdAt,
    companyId: COMPANY_ID,
  });
}

for (let i = 0; i < 5; i++) {
  const animal = sitioAnimals[i];
  if (!animal) continue;
  
  births.push({
    id: generateBirthId(190 + i),
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

for (let i = 5; i < 15; i++) {
  const animal = sitioAnimals[i];
  if (!animal) continue;
  
  const mother = sitioAnimals[i % 5];
  const father = sitioAnimals[(i + 2) % 5];
  const motherBirth = births.find((b) => b.animalId === mother.id);
  const fatherBirth = births.find((b) => b.animalId === father.id);
  
  const purity = 
    motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.PO && 
    motherBirth?.breed === fatherBirth?.breed
      ? BirthPurity.PO
      : motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.PO
      ? BirthPurity.F1
      : BirthPurity.F2;
  
  births.push({
    id: generateBirthId(190 + i),
    animalId: animal.id,
    birthDate: animal.createdAt,
    breed: fatherBirth?.breed || breeds[i % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: mother.id,
    fatherId: father.id,
    purity,
    observation: "Nascimento com genealogia registrada",
    createdAt: animal.createdAt,
    companyId: COMPANY_ID,
  });
}

for (let i = 15; i < 20; i++) {
  const animal = sitioAnimals[i];
  if (!animal) continue;
  
  const parentIndex = 5 + (i % 10);
  const mother = sitioAnimals[parentIndex];
  const father = sitioAnimals[parentIndex + 1];
  
  if (!mother || !father) continue;
  
  const motherBirth = births.find((b) => b.animalId === mother.id);
  const fatherBirth = births.find((b) => b.animalId === father.id);
  
  let purity = BirthPurity.F2;
  if (motherBirth && fatherBirth) {
    if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F1) {
      purity = BirthPurity.F2;
    } else if (motherBirth.purity === BirthPurity.F1 && fatherBirth.purity === BirthPurity.F1) {
      purity = BirthPurity.F2;
    } else if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F2) {
      purity = BirthPurity.F3;
    } else if (motherBirth.purity === BirthPurity.F2 && fatherBirth.purity === BirthPurity.F2) {
      purity = BirthPurity.F3;
    } else if (motherBirth.purity === BirthPurity.PO && fatherBirth.purity === BirthPurity.F3) {
      purity = BirthPurity.F4;
    }
  }
  
  births.push({
    id: generateBirthId(190 + i),
    animalId: animal.id,
    birthDate: animal.createdAt,
    breed: fatherBirth?.breed || motherBirth?.breed || breeds[i % breeds.length],
    gender: i % 2 === 0 ? "male" : "female",
    motherId: mother.id,
    fatherId: father.id,
    purity,
    observation: "Nascimento com genealogia completa até avós",
    createdAt: animal.createdAt,
    companyId: COMPANY_ID,
  });
}

export const mockBirths: Birth[] = births;

export function getBirthById(birthId: string | undefined): Birth | undefined {
  if (!birthId) return undefined;
  return mockBirths.find((birth) => birth.id === birthId);
}

export function getBirthByAnimalId(animalId: string): Birth | undefined {
  return mockBirths.find((birth) => birth.animalId === animalId);
}

export function getBirthsByCompanyId(companyId: string): Birth[] {
  return mockBirths.filter((birth) => birth.companyId === companyId);
}

export function addBirth(data: BirthFormData): Birth {
  const lastId =
    mockBirths.length > 0
      ? mockBirths[mockBirths.length - 1].id
      : "bi0e8400-e29b-41d4-a716-446655440009";
  const lastPart = lastId.split("-").pop() || "446655440009";
  const lastNumber = parseInt(lastPart, 10);
  const nextNumber = (lastNumber + 1).toString().padStart(12, "0");

  const newBirth: Birth = {
    ...data,
    id: `bi0e8400-e29b-41d4-a716-${nextNumber}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockBirths.push(newBirth);
  return newBirth;
}

export function deleteBirth(birthId: string): boolean {
  const index = mockBirths.findIndex((birth) => birth.id === birthId);
  if (index !== -1) {
    mockBirths.splice(index, 1);
    return true;
  }
  return false;
}

export function updateBirth(birthId: string, data: Partial<BirthFormData>): boolean {
  const index = mockBirths.findIndex((birth) => birth.id === birthId);
  if (index !== -1) {
    mockBirths[index] = {
      ...mockBirths[index],
      ...data,
    };
    return true;
  }
  return false;
}

/**
 * Calculates the birth purity based on parents
 *
 * Logic:
 * - PO (Pure Origin): Both parents are of the same PO breed
 * - PC (Pure by Cross): ~96.875% or more (F5 or higher)
 * - F1: First generation cross (different PO breeds or one PO × one non-PO)
 * - F2, F3, F4, F5: Subsequent generations of crossing
 *
 * @param motherBirth - Mother's birth (optional)
 * @param fatherBirth - Father's birth (optional)
 * @param motherBreed - Mother's breed
 * @param fatherBreed - Father's breed
 * @returns Calculated BirthPurity
 */
export function calculatePurity(
  motherBirth: Birth | undefined,
  fatherBirth: Birth | undefined,
  motherBreed?: string,
  fatherBreed?: string
): BirthPurity {
  // If there is no parent information, assume PO (pure origin)
  if (!motherBirth && !fatherBirth) {
    return BirthPurity.PO;
  }

  // If both parents are PO of the same breed → PO
  if (
    motherBirth?.purity === BirthPurity.PO &&
    fatherBirth?.purity === BirthPurity.PO &&
    motherBreed === fatherBreed
  ) {
    return BirthPurity.PO;
  }

  // If one parent is PO and the other is F1 → F2
  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F1) ||
    (motherBirth?.purity === BirthPurity.F1 && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F2;
  }

  // If both are F1 → F2
  if (motherBirth?.purity === BirthPurity.F1 && fatherBirth?.purity === BirthPurity.F1) {
    return BirthPurity.F2;
  }

  // If one is PO and the other is F2 → F3
  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F2) ||
    (motherBirth?.purity === BirthPurity.F2 && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F3;
  }

  // If one is PO and the other is F3 → F4
  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F3) ||
    (motherBirth?.purity === BirthPurity.F3 && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F4;
  }

  // If one is PO and the other is F4 → F5
  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F4) ||
    (motherBirth?.purity === BirthPurity.F4 && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F5;
  }

  // If one is PO and the other is F5 or higher → PC (Pure by Cross)
  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F5) ||
    (motherBirth?.purity === BirthPurity.F5 && fatherBirth?.purity === BirthPurity.PO) ||
    motherBirth?.purity === BirthPurity.PC ||
    fatherBirth?.purity === BirthPurity.PC
  ) {
    return BirthPurity.PC;
  }

  // If both are PO but different breeds → F1
  if (
    motherBirth?.purity === BirthPurity.PO &&
    fatherBirth?.purity === BirthPurity.PO &&
    motherBreed !== fatherBreed
  ) {
    return BirthPurity.F1;
  }

  // If one parent is PO and the other has no information → F1
  if (
    (motherBirth?.purity === BirthPurity.PO && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F1;
  }

  // If one is F1 and the other has no information → F2
  if (
    (motherBirth?.purity === BirthPurity.F1 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F1)
  ) {
    return BirthPurity.F2;
  }

  // If one is F2 and the other has no information → F3
  if (
    (motherBirth?.purity === BirthPurity.F2 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F2)
  ) {
    return BirthPurity.F3;
  }

  // If one is F3 and the other has no information → F4
  if (
    (motherBirth?.purity === BirthPurity.F3 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F3)
  ) {
    return BirthPurity.F4;
  }

  // If one is F4 and the other has no information → F5
  if (
    (motherBirth?.purity === BirthPurity.F4 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F4)
  ) {
    return BirthPurity.F5;
  }

  // If one is F5 and the other has no information → PC
  if (
    (motherBirth?.purity === BirthPurity.F5 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F5)
  ) {
    return BirthPurity.PC;
  }

  // Default case: F1 (first generation cross)
  return BirthPurity.F1;
}
