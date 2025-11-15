export interface AddressFormData {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface CEPData {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
  location: {
    type: string;
    coordinates: Record<string, unknown>;
  };
}

export interface CNPJData {
  cnpj: string;
  razao_social: string;
  email: string | null;
  ddd_telefone_1: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
}
