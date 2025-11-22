import { type RouteConfig, index, route } from "@react-router/dev/routes";
import { ROUTE_NAMES } from "./routes.config";

export default [
  index("routes/home.tsx"),
  route(ROUTE_NAMES.LOGIN, "routes/login.tsx"),
  route(ROUTE_NAMES.REGISTER, "routes/register.tsx"),
  route(ROUTE_NAMES.FORGOT_PASSWORD, "routes/forgot-password.tsx"),
  route(ROUTE_NAMES.NEW_PASSWORD, "routes/new-password.tsx"),
  route(ROUTE_NAMES.DASHBOARD, "routes/dashboard.tsx", [
    index("routes/dashboard/index.tsx"),
    route(ROUTE_NAMES.PROPERTIES, "routes/dashboard/properties.tsx"),
    route(ROUTE_NAMES.PROPERTIES_NEW, "routes/dashboard/properties.new.tsx"),
    route(ROUTE_NAMES.PROPERTIES_EDIT, "routes/dashboard/properties.edit.$propertyId.tsx"),
    route(ROUTE_NAMES.PROPERTIES_VIEW, "routes/dashboard/properties.$propertyId.tsx"),
    route(
      ROUTE_NAMES.PROPERTIES_PASTURE_PLANNING_EDIT,
      "routes/dashboard/properties.$propertyId.pasture-planning.edit.tsx"
    ),
    route(
      ROUTE_NAMES.PROPERTIES_BREEDING_SEASON_EDIT,
      "routes/dashboard/properties.$propertyId.breeding-season.edit.tsx"
    ),
    route(ROUTE_NAMES.MOVEMENTS_NEW, "routes/dashboard/properties.$propertyId.movements.new.tsx"),
    route(ROUTE_NAMES.LOCATIONS, "routes/dashboard/locations.tsx"),
    route(ROUTE_NAMES.LOCATIONS_NEW, "routes/dashboard/locations.new.tsx"),
    route(ROUTE_NAMES.LOCATIONS_EDIT, "routes/dashboard/locations.edit.$locationId.tsx"),
    route(ROUTE_NAMES.LOCATIONS_VIEW, "routes/dashboard/locations.$locationId.tsx"),
    route(ROUTE_NAMES.EMPLOYEES, "routes/dashboard/employees.tsx"),
    route(ROUTE_NAMES.EMPLOYEES_NEW, "routes/dashboard/employees.new.tsx"),
    route(ROUTE_NAMES.EMPLOYEES_EDIT, "routes/dashboard/employees.edit.$employeeId.tsx"),
    route(ROUTE_NAMES.EMPLOYEES_VIEW, "routes/dashboard/employees.$employeeId.tsx"),
    route(ROUTE_NAMES.SERVICE_PROVIDERS, "routes/dashboard/service-providers.tsx"),
    route(ROUTE_NAMES.SERVICE_PROVIDERS_NEW, "routes/dashboard/service-providers.new.tsx"),
    route(
      ROUTE_NAMES.SERVICE_PROVIDERS_EDIT,
      "routes/dashboard/service-providers.edit.$serviceProviderId.tsx"
    ),
    route(
      ROUTE_NAMES.SERVICE_PROVIDERS_VIEW,
      "routes/dashboard/service-providers.$serviceProviderId.tsx"
    ),
    route(ROUTE_NAMES.SUPPLIERS, "routes/dashboard/suppliers.tsx"),
    route(ROUTE_NAMES.SUPPLIERS_NEW, "routes/dashboard/suppliers.new.tsx"),
    route(ROUTE_NAMES.SUPPLIERS_EDIT, "routes/dashboard/suppliers.edit.$supplierId.tsx"),
    route(ROUTE_NAMES.SUPPLIERS_VIEW, "routes/dashboard/suppliers.$supplierId.tsx"),
    route(ROUTE_NAMES.INVENTORY, "routes/dashboard/inventory.tsx"),
    route(ROUTE_NAMES.INVENTORY_NEW, "routes/dashboard/inventory.new.tsx"),
    route(ROUTE_NAMES.INVENTORY_EDIT, "routes/dashboard/inventory.edit.$itemId.tsx"),
    route(ROUTE_NAMES.INVENTORY_VIEW, "routes/dashboard/inventory.$itemId.tsx"),
    route(
      ROUTE_NAMES.INVENTORY_MOVEMENT_NEW,
      "routes/dashboard/inventory.$itemId.movement.new.tsx"
    ),
    route(ROUTE_NAMES.BUYERS, "routes/dashboard/buyers.tsx"),
    route(ROUTE_NAMES.BUYERS_NEW, "routes/dashboard/buyers.new.tsx"),
    route(ROUTE_NAMES.BUYERS_EDIT, "routes/dashboard/buyers.edit.$buyerId.tsx"),
    route(ROUTE_NAMES.BUYERS_VIEW, "routes/dashboard/buyers.$buyerId.tsx"),
    route(ROUTE_NAMES.ANIMALS, "routes/dashboard/animals.tsx"),
    route(ROUTE_NAMES.ANIMALS_NEW, "routes/dashboard/animals.new.tsx"),
    route(ROUTE_NAMES.ANIMALS_EDIT, "routes/dashboard/animals.edit.$animalId.tsx"),
    route(ROUTE_NAMES.ANIMALS_VIEW, "routes/dashboard/animals.$animalId.tsx"),
    route(ROUTE_NAMES.ANIMALS_MOVEMENT_NEW, "routes/dashboard/animals.movement.new.tsx"),
    route(ROUTE_NAMES.BIRTHS, "routes/dashboard/records.births.tsx"),
    route(ROUTE_NAMES.BIRTHS_NEW, "routes/dashboard/records.births.new.tsx"),
    route(ROUTE_NAMES.ACQUISITIONS, "routes/dashboard/records.acquisitions.tsx"),
    route(ROUTE_NAMES.ACQUISITIONS_NEW, "routes/dashboard/records.acquisitions.new.tsx"),
    route(ROUTE_NAMES.SALES, "routes/dashboard/records.sales.tsx"),
    route(ROUTE_NAMES.SALES_NEW, "routes/dashboard/records.sales.new.tsx"),
    route(ROUTE_NAMES.SALES_EDIT, "routes/dashboard/records.sales.edit.$saleId.tsx"),
    route(ROUTE_NAMES.SALES_VIEW, "routes/dashboard/records.sales.$saleId.tsx"),
    route(ROUTE_NAMES.DEATHS_NEW, "routes/dashboard/records.deaths.new.tsx"),
    route(ROUTE_NAMES.WEIGHINGS_NEW, "routes/dashboard/records.weighings.new.tsx"),
    route(
      ROUTE_NAMES.MEDICINE_ADMINISTRATIONS_NEW,
      "routes/dashboard/records.sanitary-control.new.tsx"
    ),
    route(ROUTE_NAMES.BREEDINGS_NEW, "routes/dashboard/records.breedings.new.tsx"),
    route(ROUTE_NAMES.BREEDINGS_PREGNANT, "routes/dashboard/records.breedings.pregnant.tsx"),
    route(ROUTE_NAMES.BREEDINGS_UNCONFIRMED, "routes/dashboard/records.breedings.unconfirmed.tsx"),
    route(ROUTE_NAMES.REPRODUCTIVE_INDEXES, "routes/dashboard/reproductive-indexes.tsx"),
    route(ROUTE_NAMES.BIRTH_FORECAST, "routes/dashboard/birth-forecast.tsx"),
    route(ROUTE_NAMES.MOVEMENTS_VIEW, "routes/dashboard/movements.$movementId.tsx"),
    route(ROUTE_NAMES.OBSERVATIONS_VIEW, "routes/dashboard/observations.$observationId.tsx"),
    route(ROUTE_NAMES.PROFILE, "routes/dashboard/profile.tsx"),
    route(ROUTE_NAMES.USER_PROFILE, "routes/dashboard/profile.user.$userId.tsx"),
    route(ROUTE_NAMES.TEAM, "routes/dashboard/team.tsx"),
    route(ROUTE_NAMES.TEAM_NEW, "routes/dashboard/team.new.tsx"),
    route(ROUTE_NAMES.TEAM_EDIT, "routes/dashboard/team.edit.$userId.tsx"),
    route(ROUTE_NAMES.TEAM_PERMISSIONS, "routes/dashboard/team.permissions.$userId.tsx"),
    route(ROUTE_NAMES.HELP, "routes/dashboard/help.tsx"),
    route(ROUTE_NAMES.CASH_FLOW, "routes/dashboard/cash-flow.tsx"),
    route(ROUTE_NAMES.CASH_FLOW_NEW, "routes/dashboard/cash-flow.new.tsx"),
    route(ROUTE_NAMES.CASH_FLOW_EDIT, "routes/dashboard/cash-flow.edit.$transactionId.tsx"),
    route(ROUTE_NAMES.CASH_FLOW_VIEW, "routes/dashboard/cash-flow.$transactionId.tsx"),
    route(ROUTE_NAMES.ACCOUNTS_PAYABLE, "routes/dashboard/accounts-payable.tsx"),
    route(ROUTE_NAMES.ACCOUNTS_PAYABLE_NEW, "routes/dashboard/accounts-payable.new.tsx"),
    route(
      ROUTE_NAMES.ACCOUNTS_PAYABLE_EDIT,
      "routes/dashboard/accounts-payable.edit.$transactionId.tsx"
    ),
    route(
      ROUTE_NAMES.ACCOUNTS_PAYABLE_VIEW,
      "routes/dashboard/accounts-payable.$transactionId.tsx"
    ),
    route(ROUTE_NAMES.ACCOUNTS_RECEIVABLE, "routes/dashboard/accounts-receivable.tsx"),
    route(ROUTE_NAMES.ACCOUNTS_RECEIVABLE_NEW, "routes/dashboard/accounts-receivable.new.tsx"),
    route(
      ROUTE_NAMES.ACCOUNTS_RECEIVABLE_EDIT,
      "routes/dashboard/accounts-receivable.edit.$transactionId.tsx"
    ),
    route(
      ROUTE_NAMES.ACCOUNTS_RECEIVABLE_VIEW,
      "routes/dashboard/accounts-receivable.$transactionId.tsx"
    ),
    route(ROUTE_NAMES.BANK_ACCOUNTS, "routes/dashboard/bank-accounts.tsx"),
    route(ROUTE_NAMES.BANK_ACCOUNTS_NEW, "routes/dashboard/bank-accounts.new.tsx"),
    route(ROUTE_NAMES.BANK_ACCOUNTS_EDIT, "routes/dashboard/bank-accounts.edit.$bankAccountId.tsx"),
    route(ROUTE_NAMES.BANK_ACCOUNTS_VIEW, "routes/dashboard/bank-accounts.$bankAccountId.tsx"),
    route(ROUTE_NAMES.FINANCES_DASHBOARD, "routes/dashboard/finances.tsx"),
  ]),
] satisfies RouteConfig;
