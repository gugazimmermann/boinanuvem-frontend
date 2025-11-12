import type { Employee, EmployeeFormData } from "~/types";

export type { Employee, EmployeeFormData };

export const mockEmployees: Employee[] = [
  {
    id: "770e8400-e29b-41d4-a716-446655440010",
    code: "001",
    name: "João Silva",
    cpf: "123.456.789-00",
    email: "joao.silva@example.com",
    phone: "(47) 99999-9999",
    status: "active",
    createdAt: "2024-01-15",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyIds: ["550e8400-e29b-41d4-a716-446655440010"],
    street: "Rua Simão Piaz",
    number: "SN",
    complement: "Fazenda do Juca",
    neighborhood: "LIMOEIRO",
    city: "São João do Itaperiú",
    state: "SC",
    zipCode: "88395000",
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440011",
    code: "002",
    name: "Maria Santos",
    cpf: "987.654.321-00",
    email: "maria.santos@example.com",
    phone: "(47) 88888-8888",
    status: "active",
    createdAt: "2024-02-20",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyIds: ["550e8400-e29b-41d4-a716-446655440011", "550e8400-e29b-41d4-a716-446655440012"],
    street: "Rua Simão Piaz",
    number: "SN",
    complement: "Sítio Limoeiro",
    neighborhood: "LIMOEIRO",
    city: "São João do Itaperiú",
    state: "SC",
    zipCode: "88395000",
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440012",
    code: "003",
    name: "Pedro Oliveira",
    cpf: "111.222.333-44",
    email: "pedro.oliveira@example.com",
    phone: "(47) 77777-7777",
    status: "active",
    createdAt: "2024-03-10",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyIds: ["550e8400-e29b-41d4-a716-446655440010", "550e8400-e29b-41d4-a716-446655440011", "550e8400-e29b-41d4-a716-446655440012"],
    street: "Rua Simão Piaz",
    number: "SN",
    complement: "Chácara do Juca",
    neighborhood: "LIMOEIRO",
    city: "São João do Itaperiú",
    state: "SC",
    zipCode: "88395000",
  },
];

export function getEmployeeById(employeeId: string | undefined): Employee | undefined {
  if (!employeeId) return undefined;
  return mockEmployees.find((employee) => employee.id === employeeId);
}

export function getEmployeesByCompanyId(companyId: string): Employee[] {
  return mockEmployees.filter((employee) => employee.companyId === companyId);
}

export function getEmployeesByPropertyId(propertyId: string): Employee[] {
  return mockEmployees.filter((employee) => employee.propertyIds.includes(propertyId));
}

export function addEmployee(data: EmployeeFormData): Employee {
  const lastId =
    mockEmployees.length > 0
      ? mockEmployees[mockEmployees.length - 1].id
      : "770e8400-e29b-41d4-a716-446655440009";
  const lastPart = lastId.split("-").pop() || "446655440009";
  const lastNumber = parseInt(lastPart, 10);
  const nextNumber = (lastNumber + 1).toString().padStart(12, "0");

  const newEmployee: Employee = {
    ...data,
    id: `770e8400-e29b-41d4-a716-${nextNumber}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockEmployees.push(newEmployee);
  return newEmployee;
}

export function deleteEmployee(employeeId: string): boolean {
  const index = mockEmployees.findIndex((employee) => employee.id === employeeId);
  if (index !== -1) {
    mockEmployees.splice(index, 1);
    return true;
  }
  return false;
}

export function updateEmployee(employeeId: string, data: Partial<EmployeeFormData>): boolean {
  const index = mockEmployees.findIndex((employee) => employee.id === employeeId);
  if (index !== -1) {
    mockEmployees[index] = {
      ...mockEmployees[index],
      ...data,
    };
    return true;
  }
  return false;
}

