import type { Supplier, SupplierFormData } from "~/types";

export type { Supplier, SupplierFormData };

export const mockSuppliers: Supplier[] = [
  {
    id: "990e8400-e29b-41d4-a716-446655440010",
    code: "001",
    name: "AgroFornecedora Ltda",
    cnpj: "11.222.333/0001-44",
    email: "contato@agrofornecedora.com.br",
    phone: "(47) 66666-6666",
    status: "active",
    createdAt: "2025-01-05",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyIds: ["550e8400-e29b-41d4-a716-446655440010", "550e8400-e29b-41d4-a716-446655440011"],
    street: "Avenida Industrial",
    number: "500",
    complement: "Galpão 2",
    neighborhood: "Zona Industrial",
    city: "Joinville",
    state: "SC",
    zipCode: "89220-000",
  },
  {
    id: "990e8400-e29b-41d4-a716-446655440011",
    code: "002",
    name: "Carlos Fornecedor",
    cpf: "222.333.444-55",
    email: "carlos.fornecedor@example.com",
    phone: "(47) 77777-7777",
    status: "active",
    createdAt: "2025-02-10",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyIds: ["550e8400-e29b-41d4-a716-446655440010"],
    street: "Rua Comercial",
    number: "789",
    neighborhood: "Centro",
    city: "Blumenau",
    state: "SC",
    zipCode: "89010-000",
  },
  {
    id: "990e8400-e29b-41d4-a716-446655440012",
    code: "003",
    name: "AgroSuprimentos S.A.",
    cnpj: "33.444.555/0001-66",
    email: "vendas@agrosuprimentos.com.br",
    phone: "(47) 88888-8888",
    status: "active",
    createdAt: "2025-03-15",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyIds: ["550e8400-e29b-41d4-a716-446655440011", "550e8400-e29b-41d4-a716-446655440012"],
    street: "Rodovia Principal",
    number: "KM 10",
    neighborhood: "Distrito Industrial",
    city: "Florianópolis",
    state: "SC",
    zipCode: "88010-000",
  },
];

export function getSupplierById(supplierId: string | undefined): Supplier | undefined {
  if (!supplierId) return undefined;
  return mockSuppliers.find((supplier) => supplier.id === supplierId);
}

export function getSuppliersByCompanyId(companyId: string): Supplier[] {
  return mockSuppliers.filter((supplier) => supplier.companyId === companyId);
}

export function getSuppliersByPropertyId(propertyId: string): Supplier[] {
  return mockSuppliers.filter((supplier) => supplier.propertyIds.includes(propertyId));
}

export function addSupplier(data: SupplierFormData): Supplier {
  const lastId =
    mockSuppliers.length > 0
      ? mockSuppliers[mockSuppliers.length - 1].id
      : "990e8400-e29b-41d4-a716-446655440009";
  const lastPart = lastId.split("-").pop() || "446655440009";
  const lastNumber = parseInt(lastPart, 10);
  const nextNumber = (lastNumber + 1).toString().padStart(12, "0");

  const newSupplier: Supplier = {
    ...data,
    id: `990e8400-e29b-41d4-a716-${nextNumber}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockSuppliers.push(newSupplier);
  return newSupplier;
}

export function deleteSupplier(supplierId: string): boolean {
  const index = mockSuppliers.findIndex((supplier) => supplier.id === supplierId);
  if (index !== -1) {
    mockSuppliers.splice(index, 1);
    return true;
  }
  return false;
}

export function updateSupplier(supplierId: string, data: Partial<SupplierFormData>): boolean {
  const index = mockSuppliers.findIndex((supplier) => supplier.id === supplierId);
  if (index !== -1) {
    mockSuppliers[index] = {
      ...mockSuppliers[index],
      ...data,
    };
    return true;
  }
  return false;
}
