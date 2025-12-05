export const ROUTES = {
  HOME: "/",
  LOGIN: "/entrar",
  REGISTER: "/cadastrar",
  FORGOT_PASSWORD: "/esqueceu-senha",
  NEW_PASSWORD: "/nova-senha",
  VERIFY_EMAIL: "/verificar-email",
  SETUP_PASSWORD: "/configurar-senha",
  TERMS: "/termos",
  PRIVACY: "/privacidade",
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
  LOCATIONS_INVENTORY_MOVEMENT_NEW: "/dashboard/localizacoes/:locationId/movimentacao-estoque/novo",
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
  INVENTORY: "/dashboard/estoque",
  INVENTORY_NEW: "/dashboard/estoque/novo",
  INVENTORY_EDIT: "/dashboard/estoque/:itemId/editar",
  INVENTORY_VIEW: "/dashboard/estoque/:itemId",
  INVENTORY_MOVEMENT_NEW: "/dashboard/estoque/:itemId/movimentacao/novo",
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
  SALES: "/dashboard/registros/vendas",
  SALES_NEW: "/dashboard/registros/vendas/novo",
  SALES_EDIT: "/dashboard/registros/vendas/:saleId/editar",
  SALES_VIEW: "/dashboard/registros/vendas/:saleId",
  DEATHS_NEW: "/dashboard/registros/obitos/novo",
  WEIGHINGS_NEW: "/dashboard/registros/pesagens/novo",
  MEDICINE_ADMINISTRATIONS_NEW: "/dashboard/registros/controle-sanitario/novo",
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
  PAYMENTS: "/dashboard/pagamentos",
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

// Factory function for creating edit/view route helpers
function createEntityRouteHelpers(basePath: string) {
  return {
    edit: (id: string) => `/dashboard/${basePath}/${id}/editar`,
    view: (id: string) => `/dashboard/${basePath}/${id}`,
  };
}

// Generic route helper factory
function _createRouteHelpers<T extends Record<string, string>>(
  routes: T
): {
  edit: (entityType: keyof T, id: string) => string;
  view: (entityType: keyof T, id: string) => string;
} {
  return {
    edit: (entityType, id) => `/dashboard/${routes[entityType]}/${id}/editar`,
    view: (entityType, id) => `/dashboard/${routes[entityType]}/${id}`,
  };
}

const locationRoutes = createEntityRouteHelpers("localizacoes");
const employeeRoutes = createEntityRouteHelpers("funcionarios");
const serviceProviderRoutes = createEntityRouteHelpers("prestadores-servico");
const supplierRoutes = createEntityRouteHelpers("fornecedores");
const buyerRoutes = createEntityRouteHelpers("compradores");
const inventoryRoutes = createEntityRouteHelpers("estoque");
const animalRoutes = createEntityRouteHelpers("animais");

export function getLocationEditRoute(locationId: string): string {
  return locationRoutes.edit(locationId);
}

export function getLocationViewRoute(locationId: string): string {
  return locationRoutes.view(locationId);
}

export function getLocationInventoryMovementNewRoute(locationId: string): string {
  return `/dashboard/localizacoes/${locationId}/movimentacao-estoque/novo`;
}

// Consolidated route helpers using factory pattern
export const getEmployeeEditRoute = (id: string) => employeeRoutes.edit(id);
export const getEmployeeViewRoute = (id: string) => employeeRoutes.view(id);
export const getServiceProviderEditRoute = (id: string) => serviceProviderRoutes.edit(id);
export const getServiceProviderViewRoute = (id: string) => serviceProviderRoutes.view(id);
export const getSupplierEditRoute = (id: string) => supplierRoutes.edit(id);
export const getSupplierViewRoute = (id: string) => supplierRoutes.view(id);
export const getBuyerEditRoute = (id: string) => buyerRoutes.edit(id);
export const getBuyerViewRoute = (id: string) => buyerRoutes.view(id);
export const getInventoryEditRoute = (id: string) => inventoryRoutes.edit(id);
export const getInventoryViewRoute = (id: string) => inventoryRoutes.view(id);

export function getInventoryMovementNewRoute(itemId: string): string {
  return `/dashboard/estoque/${itemId}/movimentacao/novo`;
}

export const getAnimalEditRoute = (id: string) => animalRoutes.edit(id);
export const getAnimalViewRoute = (id: string) => animalRoutes.view(id);

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

export function getSanitaryControlNewRoute(animalId?: string | string[]): string | { pathname: string; state: { animalId?: string; animalIds?: string[] } } {
  if (animalId) {
    if (Array.isArray(animalId)) {
      return {
        pathname: ROUTES.MEDICINE_ADMINISTRATIONS_NEW,
        state: { animalIds: animalId },
      };
    }
    return {
      pathname: ROUTES.MEDICINE_ADMINISTRATIONS_NEW,
      state: { animalId },
    };
  }
  return ROUTES.MEDICINE_ADMINISTRATIONS_NEW;
}

export function getObservationViewRoute(observationId: string): string {
  return `/dashboard/observacoes/${observationId}`;
}

const cashFlowRoutes = createEntityRouteHelpers("fluxo-caixa");
const accountsPayableRoutes = createEntityRouteHelpers("contas-pagar");
const accountsReceivableRoutes = createEntityRouteHelpers("contas-receber");
const bankAccountRoutes = createEntityRouteHelpers("contas-bancarias");
const saleRoutes = createEntityRouteHelpers("registros/vendas");
const acquisitionRoutes = createEntityRouteHelpers("registros/aquisicoes");

// Consolidated finance route helpers
export const getCashFlowEditRoute = (id: string) => cashFlowRoutes.edit(id);
export const getCashFlowViewRoute = (id: string) => cashFlowRoutes.view(id);
export const getAccountsPayableEditRoute = (id: string) => accountsPayableRoutes.edit(id);
export const getAccountsPayableViewRoute = (id: string) => accountsPayableRoutes.view(id);
export const getAccountsReceivableEditRoute = (id: string) => accountsReceivableRoutes.edit(id);
export const getAccountsReceivableViewRoute = (id: string) => accountsReceivableRoutes.view(id);
export const getBankAccountEditRoute = (id: string) => bankAccountRoutes.edit(id);
export const getBankAccountViewRoute = (id: string) => bankAccountRoutes.view(id);
export const getSaleEditRoute = (id: string) => saleRoutes.edit(id);
export const getSaleViewRoute = (id: string) => saleRoutes.view(id);
export const getAcquisitionEditRoute = (id: string) => acquisitionRoutes.edit(id);
export const getAcquisitionViewRoute = (id: string) => acquisitionRoutes.view(id);

/**
 * Converts a route path to a route name by removing the leading "/dashboard/" or "/" prefix.
 * Special case: "/" becomes "".
 */
function routePathToName(route: string): string {
  if (route === "/") {
    return "";
  }
  if (route.startsWith("/dashboard/")) {
    return route.slice("/dashboard/".length);
  }
  if (route.startsWith("/")) {
    return route.slice(1);
  }
  return route;
}

/**
 * Generates ROUTE_NAMES from ROUTES by converting each route path to its name equivalent.
 * Includes special cases that don't have corresponding ROUTES entries.
 */
export const ROUTE_NAMES = {
  ...Object.fromEntries(
    Object.entries(ROUTES).map(([key, value]) => [key, routePathToName(value)])
  ),
  // Special case: USER_PROFILE doesn't have a corresponding ROUTES entry
  USER_PROFILE: "perfil/usuario/:userId",
} as {
  readonly [K in keyof typeof ROUTES]: string;
} & {
  readonly USER_PROFILE: "perfil/usuario/:userId";
};

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];

export function getRoute(route: keyof typeof ROUTES): RoutePath {
  return ROUTES[route];
}

export function getRouteName(route: keyof typeof ROUTE_NAMES): RouteName {
  return ROUTE_NAMES[route];
}

