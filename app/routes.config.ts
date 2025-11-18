export const ROUTES = {
  HOME: "/",
  LOGIN: "/entrar",
  REGISTER: "/cadastrar",
  FORGOT_PASSWORD: "/esqueceu-senha",
  NEW_PASSWORD: "/nova-senha",
  HELP: "/dashboard/ajuda",
  DASHBOARD: "/dashboard",
  PROPERTIES: "/dashboard/propriedades",
  PROPERTIES_NEW: "/dashboard/propriedades/novo",
  PROPERTIES_EDIT: "/dashboard/propriedades/:propertyId/editar",
  PROPERTIES_VIEW: "/dashboard/propriedades/:propertyId",
  PROPERTIES_PASTURE_PLANNING_EDIT: "/dashboard/propriedades/:propertyId/planejamento-pastagem/editar",
  PROPERTIES_BREEDING_SEASON_EDIT: "/dashboard/propriedades/:propertyId/estacao-monta/editar",
  LOCATIONS: "/dashboard/localizacoes",
  LOCATIONS_NEW: "/dashboard/localizacoes/novo",
  LOCATIONS_EDIT: "/dashboard/localizacoes/:locationId/editar",
  LOCATIONS_VIEW: "/dashboard/localizacoes/:locationId",
  EMPLOYEES: "/dashboard/funcionarios",
  EMPLOYEES_NEW: "/dashboard/funcionarios/novo",
  EMPLOYEES_EDIT: "/dashboard/funcionarios/:employeeId/editar",
  EMPLOYEES_VIEW: "/dashboard/funcionarios/:employeeId",
  SERVICE_PROVIDERS: "/dashboard/prestadores-servico",
  SERVICE_PROVIDERS_NEW: "/dashboard/prestadores-servico/novo",
  SERVICE_PROVIDERS_EDIT: "/dashboard/prestadores-servico/:serviceProviderId/editar",
  SERVICE_PROVIDERS_VIEW: "/dashboard/prestadores-servico/:serviceProviderId",
  SUPPLIERS: "/dashboard/fornecedores",
  SUPPLIERS_NEW: "/dashboard/fornecedores/novo",
  SUPPLIERS_EDIT: "/dashboard/fornecedores/:supplierId/editar",
  SUPPLIERS_VIEW: "/dashboard/fornecedores/:supplierId",
  BUYERS: "/dashboard/compradores",
  BUYERS_NEW: "/dashboard/compradores/novo",
  BUYERS_EDIT: "/dashboard/compradores/:buyerId/editar",
  BUYERS_VIEW: "/dashboard/compradores/:buyerId",
  ANIMALS: "/dashboard/animais",
  ANIMALS_NEW: "/dashboard/animais/novo",
  ANIMALS_EDIT: "/dashboard/animais/:animalId/editar",
  ANIMALS_VIEW: "/dashboard/animais/:animalId",
  BIRTHS: "/dashboard/registros/nascimentos",
  BIRTHS_NEW: "/dashboard/registros/nascimentos/novo",
  BIRTHS_EDIT: "/dashboard/registros/nascimentos/:birthId/editar",
  BIRTHS_VIEW: "/dashboard/registros/nascimentos/:birthId",
  ACQUISITIONS: "/dashboard/registros/aquisicoes",
  ACQUISITIONS_NEW: "/dashboard/registros/aquisicoes/novo",
  ACQUISITIONS_EDIT: "/dashboard/registros/aquisicoes/:acquisitionId/editar",
  ACQUISITIONS_VIEW: "/dashboard/registros/aquisicoes/:acquisitionId",
  WEIGHINGS_NEW: "/dashboard/registros/pesagens/novo",
  BREEDINGS_NEW: "/dashboard/registros/montas/novo",
  BREEDINGS_PREGNANT: "/dashboard/registros/montas/prenhas",
  BREEDINGS_UNCONFIRMED: "/dashboard/registros/montas/nao-confirmadas",
  REPRODUCTIVE_INDEXES: "/dashboard/indices-reprodutivos",
  BIRTH_FORECAST: "/dashboard/previsao-nascimentos",
  MOVEMENTS_NEW: "/dashboard/propriedades/:propertyId/movimentacoes/novo",
  MOVEMENTS_VIEW: "/dashboard/movimentacoes/:movementId",
  ANIMALS_MOVEMENT_NEW: "/dashboard/animais/movimentacao/novo",
  OBSERVATIONS_VIEW: "/dashboard/observacoes/:observationId",
  PROFILE: "/dashboard/perfil",
  TEAM: "/dashboard/equipe",
  TEAM_NEW: "/dashboard/equipe/novo",
  TEAM_EDIT: "/dashboard/equipe/:userId/editar",
  TEAM_PERMISSIONS: "/dashboard/equipe/:userId/permissoes",
  CASH_FLOW: "/dashboard/fluxo-caixa",
  CASH_FLOW_NEW: "/dashboard/fluxo-caixa/novo",
  CASH_FLOW_EDIT: "/dashboard/fluxo-caixa/:transactionId/editar",
  CASH_FLOW_VIEW: "/dashboard/fluxo-caixa/:transactionId",
  ACCOUNTS_PAYABLE: "/dashboard/contas-pagar",
  ACCOUNTS_PAYABLE_NEW: "/dashboard/contas-pagar/novo",
  ACCOUNTS_PAYABLE_EDIT: "/dashboard/contas-pagar/:transactionId/editar",
  ACCOUNTS_PAYABLE_VIEW: "/dashboard/contas-pagar/:transactionId",
  ACCOUNTS_RECEIVABLE: "/dashboard/contas-receber",
  ACCOUNTS_RECEIVABLE_NEW: "/dashboard/contas-receber/novo",
  ACCOUNTS_RECEIVABLE_EDIT: "/dashboard/contas-receber/:transactionId/editar",
  ACCOUNTS_RECEIVABLE_VIEW: "/dashboard/contas-receber/:transactionId",
  BANK_ACCOUNTS: "/dashboard/contas-bancarias",
  BANK_ACCOUNTS_NEW: "/dashboard/contas-bancarias/novo",
  BANK_ACCOUNTS_EDIT: "/dashboard/contas-bancarias/:bankAccountId/editar",
  BANK_ACCOUNTS_VIEW: "/dashboard/contas-bancarias/:bankAccountId",
  FINANCES_DASHBOARD: "/dashboard/financas",
} as const;

export function getUserProfileRoute(userId: string): string {
  return `/dashboard/perfil/usuario/${userId}`;
}

export function getTeamEditRoute(userId: string): string {
  return `/dashboard/equipe/${userId}/editar`;
}

export function getTeamPermissionsRoute(userId: string): string {
  return `/dashboard/equipe/${userId}/permissoes`;
}

export function getPropertyEditRoute(propertyId: string): string {
  return `/dashboard/propriedades/${propertyId}/editar`;
}

export function getPropertyViewRoute(propertyId: string): string {
  return `/dashboard/propriedades/${propertyId}`;
}

export function getPropertyPasturePlanningEditRoute(propertyId: string): string {
  return `/dashboard/propriedades/${propertyId}/planejamento-pastagem/editar`;
}

export function getPropertyBreedingSeasonEditRoute(propertyId: string): string {
  return `/dashboard/propriedades/${propertyId}/estacao-monta/editar`;
}

export function getLocationEditRoute(locationId: string): string {
  return `/dashboard/localizacoes/${locationId}/editar`;
}

export function getLocationViewRoute(locationId: string): string {
  return `/dashboard/localizacoes/${locationId}`;
}

export function getEmployeeEditRoute(employeeId: string): string {
  return `/dashboard/funcionarios/${employeeId}/editar`;
}

export function getEmployeeViewRoute(employeeId: string): string {
  return `/dashboard/funcionarios/${employeeId}`;
}

export function getServiceProviderEditRoute(serviceProviderId: string): string {
  return `/dashboard/prestadores-servico/${serviceProviderId}/editar`;
}

export function getServiceProviderViewRoute(serviceProviderId: string): string {
  return `/dashboard/prestadores-servico/${serviceProviderId}`;
}

export function getSupplierEditRoute(supplierId: string): string {
  return `/dashboard/fornecedores/${supplierId}/editar`;
}

export function getSupplierViewRoute(supplierId: string): string {
  return `/dashboard/fornecedores/${supplierId}`;
}

export function getBuyerEditRoute(buyerId: string): string {
  return `/dashboard/compradores/${buyerId}/editar`;
}

export function getBuyerViewRoute(buyerId: string): string {
  return `/dashboard/compradores/${buyerId}`;
}

export function getAnimalEditRoute(animalId: string): string {
  return `/dashboard/animais/${animalId}/editar`;
}

export function getAnimalViewRoute(animalId: string): string {
  return `/dashboard/animais/${animalId}`;
}

export function getMovementViewRoute(movementId: string): string {
  return `/dashboard/movimentacoes/${movementId}`;
}

export function getMovementNewRoute(propertyId: string): string {
  return `/dashboard/propriedades/${propertyId}/movimentacoes/novo`;
}

export function getAnimalMovementNewRoute(animalIds: string[]): { pathname: string; state: { animalIds: string[] } } {
  return {
    pathname: ROUTES.ANIMALS_MOVEMENT_NEW,
    state: { animalIds },
  };
}

export function getBreedingNewRoute(animalIds: string[]): { pathname: string; state: { animalIds: string[] } } {
  return {
    pathname: ROUTES.BREEDINGS_NEW,
    state: { animalIds },
  };
}

export function getObservationViewRoute(observationId: string): string {
  return `/dashboard/observacoes/${observationId}`;
}

export function getCashFlowEditRoute(transactionId: string): string {
  return `/dashboard/fluxo-caixa/${transactionId}/editar`;
}

export function getCashFlowViewRoute(transactionId: string): string {
  return `/dashboard/fluxo-caixa/${transactionId}`;
}

export function getAccountsPayableEditRoute(transactionId: string): string {
  return `/dashboard/contas-pagar/${transactionId}/editar`;
}

export function getAccountsPayableViewRoute(transactionId: string): string {
  return `/dashboard/contas-pagar/${transactionId}`;
}

export function getAccountsReceivableEditRoute(transactionId: string): string {
  return `/dashboard/contas-receber/${transactionId}/editar`;
}

export function getAccountsReceivableViewRoute(transactionId: string): string {
  return `/dashboard/contas-receber/${transactionId}`;
}

export function getBankAccountEditRoute(bankAccountId: string): string {
  return `/dashboard/contas-bancarias/${bankAccountId}/editar`;
}

export function getBankAccountViewRoute(bankAccountId: string): string {
  return `/dashboard/contas-bancarias/${bankAccountId}`;
}

export const ROUTE_NAMES = {
  HOME: "",
  LOGIN: "entrar",
  REGISTER: "cadastrar",
  FORGOT_PASSWORD: "esqueceu-senha",
  NEW_PASSWORD: "nova-senha",
  HELP: "ajuda",
  DASHBOARD: "dashboard",
  PROPERTIES: "propriedades",
  PROPERTIES_NEW: "propriedades/novo",
  PROPERTIES_EDIT: "propriedades/:propertyId/editar",
  PROPERTIES_VIEW: "propriedades/:propertyId",
  PROPERTIES_PASTURE_PLANNING_EDIT: "propriedades/:propertyId/planejamento-pastagem/editar",
  PROPERTIES_BREEDING_SEASON_EDIT: "propriedades/:propertyId/estacao-monta/editar",
  LOCATIONS: "localizacoes",
  LOCATIONS_NEW: "localizacoes/novo",
  LOCATIONS_EDIT: "localizacoes/:locationId/editar",
  LOCATIONS_VIEW: "localizacoes/:locationId",
  EMPLOYEES: "funcionarios",
  EMPLOYEES_NEW: "funcionarios/novo",
  EMPLOYEES_EDIT: "funcionarios/:employeeId/editar",
  EMPLOYEES_VIEW: "funcionarios/:employeeId",
  SERVICE_PROVIDERS: "prestadores-servico",
  SERVICE_PROVIDERS_NEW: "prestadores-servico/novo",
  SERVICE_PROVIDERS_EDIT: "prestadores-servico/:serviceProviderId/editar",
  SERVICE_PROVIDERS_VIEW: "prestadores-servico/:serviceProviderId",
  SUPPLIERS: "fornecedores",
  SUPPLIERS_NEW: "fornecedores/novo",
  SUPPLIERS_EDIT: "fornecedores/:supplierId/editar",
  SUPPLIERS_VIEW: "fornecedores/:supplierId",
  BUYERS: "compradores",
  BUYERS_NEW: "compradores/novo",
  BUYERS_EDIT: "compradores/:buyerId/editar",
  BUYERS_VIEW: "compradores/:buyerId",
  ANIMALS: "animais",
  ANIMALS_NEW: "animais/novo",
  ANIMALS_EDIT: "animais/:animalId/editar",
  ANIMALS_VIEW: "animais/:animalId",
  BIRTHS: "registros/nascimentos",
  BIRTHS_NEW: "registros/nascimentos/novo",
  BIRTHS_EDIT: "registros/nascimentos/:birthId/editar",
  BIRTHS_VIEW: "registros/nascimentos/:birthId",
  ACQUISITIONS: "registros/aquisicoes",
  ACQUISITIONS_NEW: "registros/aquisicoes/novo",
  ACQUISITIONS_EDIT: "registros/aquisicoes/:acquisitionId/editar",
  ACQUISITIONS_VIEW: "registros/aquisicoes/:acquisitionId",
  WEIGHINGS_NEW: "registros/pesagens/novo",
  BREEDINGS_NEW: "registros/montas/novo",
  BREEDINGS_PREGNANT: "registros/montas/prenhas",
  BREEDINGS_UNCONFIRMED: "registros/montas/nao-confirmadas",
  REPRODUCTIVE_INDEXES: "indices-reprodutivos",
  BIRTH_FORECAST: "previsao-nascimentos",
  MOVEMENTS_NEW: "propriedades/:propertyId/movimentacoes/novo",
  MOVEMENTS_VIEW: "movimentacoes/:movementId",
  ANIMALS_MOVEMENT_NEW: "animais/movimentacao/novo",
  OBSERVATIONS_VIEW: "observacoes/:observationId",
  PROFILE: "perfil",
  USER_PROFILE: "perfil/usuario/:userId",
  TEAM: "equipe",
  TEAM_NEW: "equipe/novo",
  TEAM_EDIT: "equipe/:userId/editar",
  TEAM_PERMISSIONS: "equipe/:userId/permissoes",
  CASH_FLOW: "fluxo-caixa",
  CASH_FLOW_NEW: "fluxo-caixa/novo",
  CASH_FLOW_EDIT: "fluxo-caixa/:transactionId/editar",
  CASH_FLOW_VIEW: "fluxo-caixa/:transactionId",
  ACCOUNTS_PAYABLE: "contas-pagar",
  ACCOUNTS_PAYABLE_NEW: "contas-pagar/novo",
  ACCOUNTS_PAYABLE_EDIT: "contas-pagar/:transactionId/editar",
  ACCOUNTS_PAYABLE_VIEW: "contas-pagar/:transactionId",
  ACCOUNTS_RECEIVABLE: "contas-receber",
  ACCOUNTS_RECEIVABLE_NEW: "contas-receber/novo",
  ACCOUNTS_RECEIVABLE_EDIT: "contas-receber/:transactionId/editar",
  ACCOUNTS_RECEIVABLE_VIEW: "contas-receber/:transactionId",
  BANK_ACCOUNTS: "contas-bancarias",
  BANK_ACCOUNTS_NEW: "contas-bancarias/novo",
  BANK_ACCOUNTS_EDIT: "contas-bancarias/:bankAccountId/editar",
  BANK_ACCOUNTS_VIEW: "contas-bancarias/:bankAccountId",
  FINANCES_DASHBOARD: "financas",
} as const;

import type { RoutePath, RouteName } from "~/types";

export type { RoutePath, RouteName };

export function getRoute(route: keyof typeof ROUTES): RoutePath {
  return ROUTES[route];
}

export function getRouteName(route: keyof typeof ROUTE_NAMES): RouteName {
  return ROUTE_NAMES[route];
}

