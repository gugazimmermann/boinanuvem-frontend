export enum AnimalBreed {
  NELORE = "nelore",
  ANGUS = "angus",
  BRAHMAN = "brahman",
  HEREFORD = "hereford",
  CANCHIM = "canchim",
  TABAPUA = "tabapua",
  GUZERA = "guzera",
  GIROLANDO = "girolando",
  SIMENTAL = "simental",
  LIMOUSIN = "limousin",
  CHAROLAIS = "charolais",
  SENEPOL = "senepol",
  CARACU = "caracu",
  INDUBRASIL = "indubrasil",
  BRANGUS = "brangus",
  SANTA_GERTRUDIS = "santa_gertrudis",
  DEVON = "devon",
  RED_ANGUS = "red_angus",
  MARCHIGIANA = "marchigiana",
  CHIANINA = "chianina",
}

export interface Animal extends Record<string, unknown> {
  id: string;
  code: string;
  registrationNumber: string;
  acquisitionDate?: string;
  status: "active" | "inactive";
  createdAt: string;
  companyId: string;
  propertyId: string;
}

export interface AnimalFormData {
  code: string;
  registrationNumber: string;
  acquisitionDate?: string;
  status: "active" | "inactive";
  companyId: string;
  propertyId: string;
}
