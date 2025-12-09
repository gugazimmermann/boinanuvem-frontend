import { useParams } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES, getEmployeeEditRoute, getMovementNewRoute } from "~/routes.config";
import { getEmployeeById } from "~/services/employees.service";
import type { Employee } from "~/types";
import { getLocationMovementsByEmployeeId } from "~/services/location-movements.service";
import { getAnimalMovementsByEmployeeId } from "~/services/animal-movements.service";
import { getCashFlowByEmployeeId } from "~/services/cash-flow.service";
import { getAccountsPayableByEmployeeId } from "~/services/accounts-payable.service";
import {
  getEmployeeObservationsByEmployeeId,
  addEmployeeObservation,
} from "~/services/employee-observations.service";
import type { EmployeeObservation } from "~/types/employee-observation";
import { EntityDetailPage } from "~/components/dashboard/entity-details/entity-detail-page";

export function meta() {
  return [
    { title: "Detalhes do Funcionário - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do funcionário",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function EmployeeDetails() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const t = useTranslation();

  return (
    <EntityDetailPage<Employee, EmployeeObservation>
      entityId={employeeId}
      fetchEntity={getEmployeeById}
      entityType="employee"
      mapEntityToData={(employee) => ({
        id: employee.id,
        code: employee.code,
        name: employee.name,
        cpf: employee.cpf,
        email: employee.email,
        phone: employee.phone,
        propertyIds: employee.propertyIds,
        createdAt: employee.createdAt,
        status: employee.status,
        street: employee.street,
        number: employee.number,
        complement: employee.complement,
        neighborhood: employee.neighborhood,
        city: employee.city,
        state: employee.state,
        zipCode: employee.zipCode,
      })}
      translations={t.employees}
      routes={{
        list: ROUTES.EMPLOYEES,
        edit: getEmployeeEditRoute,
      }}
      permissionResource="employee"
      observationConfig={{
        fetchObservations: getEmployeeObservationsByEmployeeId,
        addObservation: (data) =>
          addEmployeeObservation(
            data as { employeeId: string; observation: string; fileIds?: string[] }
          ),
        translationKeys: {
          observationRequired: t.employees.details.observationRequired,
          observationAdded: t.employees.details.observationAdded,
          observationError: t.employees.details.observationError,
        },
        fileIdPrefix: "file-emp-obs",
      }}
      financeConfig={{
        getCashFlowTransactions: getCashFlowByEmployeeId,
        getPayableTransactions: getAccountsPayableByEmployeeId,
        showSubTabs: false,
      }}
      movementsConfig={{
        getLocationMovements: getLocationMovementsByEmployeeId,
        getAnimalMovements: getAnimalMovementsByEmployeeId,
        getMovementNewRouteParam: (propertyId, entityId) =>
          `${getMovementNewRoute(propertyId)}?employeeId=${entityId}`,
        entityType: "employee",
      }}
      validTabs={["info", "activities", "movements", "observations", "finance"]}
    />
  );
}
