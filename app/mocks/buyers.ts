import type { Buyer, BuyerFormData } from "~/types";

export type { Buyer, BuyerFormData };

export const mockBuyers: Buyer[] = [
  {
    id: "aa0e8400-e29b-41d4-a716-446655440010",
    code: "001",
    name: "Frigorífico Central S.A.",
    cnpj: "44.555.666/0001-77",
    email: "compras@frigorificocentral.com.br",
    phone: "(47) 99999-9999",
    status: "active",
    createdAt: "2024-01-08",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyIds: ["550e8400-e29b-41d4-a716-446655440010", "550e8400-e29b-41d4-a716-446655440011"],
    street: "Avenida Comercial",
    number: "1000",
    complement: "Matadouro",
    neighborhood: "Zona Industrial",
    city: "Joinville",
    state: "SC",
    zipCode: "89220-100",
  },
  {
    id: "aa0e8400-e29b-41d4-a716-446655440011",
    code: "002",
    name: "Roberto Comprador",
    cpf: "333.444.555-66",
    email: "roberto.comprador@example.com",
    phone: "(47) 10101-0101",
    status: "active",
    createdAt: "2024-02-12",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyIds: ["550e8400-e29b-41d4-a716-446655440010"],
    street: "Rua dos Comerciantes",
    number: "200",
    neighborhood: "Centro",
    city: "Blumenau",
    state: "SC",
    zipCode: "89010-100",
  },
  {
    id: "aa0e8400-e29b-41d4-a716-446655440012",
    code: "003",
    name: "AgroCompras Ltda",
    cnpj: "55.666.777/0001-88",
    email: "contato@agrocompras.com.br",
    phone: "(47) 20202-0202",
    status: "active",
    createdAt: "2024-03-18",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyIds: ["550e8400-e29b-41d4-a716-446655440011", "550e8400-e29b-41d4-a716-446655440012"],
    street: "Rodovia Estadual",
    number: "KM 15",
    neighborhood: "Distrito Comercial",
    city: "Florianópolis",
    state: "SC",
    zipCode: "88010-100",
  },
];

export function getBuyerById(buyerId: string | undefined): Buyer | undefined {
  if (!buyerId) return undefined;
  return mockBuyers.find((buyer) => buyer.id === buyerId);
}

export function getBuyersByCompanyId(companyId: string): Buyer[] {
  return mockBuyers.filter((buyer) => buyer.companyId === companyId);
}

export function getBuyersByPropertyId(propertyId: string): Buyer[] {
  return mockBuyers.filter((buyer) => buyer.propertyIds.includes(propertyId));
}

export function addBuyer(data: BuyerFormData): Buyer {
  const lastId =
    mockBuyers.length > 0
      ? mockBuyers[mockBuyers.length - 1].id
      : "aa0e8400-e29b-41d4-a716-446655440009";
  const lastPart = lastId.split("-").pop() || "446655440009";
  const lastNumber = parseInt(lastPart, 10);
  const nextNumber = (lastNumber + 1).toString().padStart(12, "0");

  const newBuyer: Buyer = {
    ...data,
    id: `aa0e8400-e29b-41d4-a716-${nextNumber}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockBuyers.push(newBuyer);
  return newBuyer;
}

export function deleteBuyer(buyerId: string): boolean {
  const index = mockBuyers.findIndex((buyer) => buyer.id === buyerId);
  if (index !== -1) {
    mockBuyers.splice(index, 1);
    return true;
  }
  return false;
}

export function updateBuyer(buyerId: string, data: Partial<BuyerFormData>): boolean {
  const index = mockBuyers.findIndex((buyer) => buyer.id === buyerId);
  if (index !== -1) {
    mockBuyers[index] = {
      ...mockBuyers[index],
      ...data,
    };
    return true;
  }
  return false;
}
