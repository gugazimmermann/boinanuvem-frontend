import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addEmployee } from "~/services/employees.service";
import type { EmployeeFormData } from "~/types";
import { EntityNewRoute } from "~/components/dashboard/forms/entity-new-route";

export function meta() {
  return [
    { title: "Adicionar Funcionário - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar novo funcionário",
    },
  ];
}

export default function NewEmployee() {
  const t = useTranslation();

  return (
    <EntityNewRoute<EmployeeFormData>
      entityType="employee"
      createEntity={addEmployee}
      translations={t.employees}
      routes={{
        list: ROUTES.EMPLOYEES,
      }}
    />
  );
}
