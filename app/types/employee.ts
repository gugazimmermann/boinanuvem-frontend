export interface Employee extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  cpf?: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  createdAt: string;
  companyId: string;
  propertyIds: string[];
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface EmployeeFormData {
  code: string;
  name: string;
  cpf?: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  companyId: string;
  propertyIds: string[];
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

