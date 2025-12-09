import { useParams } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES, getEmployeeViewRoute } from "~/routes.config";
import { getEmployeeById, updateEmployee } from "~/services/employees.service";
import type { Employee, EmployeeFormData } from "~/types";
import { EntityEditRoute } from "~/components/dashboard/forms/entity-edit-route";
import { mapEntityToFormData } from "~/utils/entity-route-helpers";

export function meta() {
  return [
    { title: "Editar Funcionário - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar funcionário",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditEmployee() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const t = useTranslation();

  return (
    <EntityEditRoute<Employee, EmployeeFormData>
      entityId={employeeId}
      fetchEntity={getEmployeeById}
      updateEntity={updateEmployee}
      entityType="employee"
      translations={t.employees}
      routes={{
        list: ROUTES.EMPLOYEES,
        view: getEmployeeViewRoute,
      }}
      mapEntityToFormData={mapEntityToFormData}
    />
  );
}
