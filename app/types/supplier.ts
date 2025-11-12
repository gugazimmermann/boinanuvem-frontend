export interface Supplier extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  cpf?: string;
  cnpj?: string;
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

export interface SupplierFormData {
  code: string;
  name: string;
  cpf?: string;
  cnpj?: string;
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

