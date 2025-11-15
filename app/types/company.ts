export interface CompanyFormData {
  cnpj: string;
  companyName: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Company extends CompanyFormData {
  id: string;
  createdAt: string;
  latitude?: number;
  longitude?: number;
}
