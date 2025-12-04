import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { TableActionButtons, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { mockEmployees } from "~/mocks/employees";
import { deleteEmployee } from "~/services/employees.service";
import type { Employee } from "~/types";
import { getPropertyById } from "~/services/properties.service";
import { ROUTES, getEmployeeEditRoute, getEmployeeViewRoute } from "~/routes.config";
import { getLocationMovementsByEmployeeId } from "~/services/location-movements.service";
import { getEmployeeObservationsByEmployeeId } from "~/services/employee-observations.service";
import { usePermissions } from "~/utils/permissions";
import { RegistrationListPage } from "~/components/dashboard/registrations/registration-list-page";
import {
  createNameCodeColumn,
  createStatusColumn,
  createTextColumn,
  createLastObservationColumn,
  createPropertiesColumn,
  createLastMovementColumn,
} from "~/components/dashboard/registrations/table-columns";
import { createRegistrationMeta, createRegistrationLoader } from "~/utils/route-helpers";

export function meta() {
  return createRegistrationMeta("Funcionários", "Gerenciamento de funcionários do Boi na Nuvem");
}

export async function loader({ request }: { request: Request }) {
  return createRegistrationLoader(undefined, "view")({ request });
}

export default function Employees() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canEdit, canRemove } = usePermissions();
  const [employees, setEmployees] = useState<Employee[]>([...mockEmployees]);

  const columns: TableColumn<Employee>[] = useMemo(
    () => [
      createNameCodeColumn<Employee>(t.employees.table.name, true),
      createTextColumn<Employee>("cpf", t.employees.table.cpf, (row) => row.cpf || null, true),
      createTextColumn<Employee>(
        "email",
        t.employees.table.email,
        (row) => row.email || null,
        true
      ),
      createTextColumn<Employee>(
        "phone",
        t.employees.table.phone,
        (row) => row.phone || null,
        true
      ),
      createPropertiesColumn<Employee>(t.employees.table.properties, getPropertyById),
      createLastMovementColumn<Employee>(
        t.employees.table.lastMovement || "Última Movimentação",
        getLocationMovementsByEmployeeId,
        t,
        language
      ),
      createLastObservationColumn<Employee>(
        t.employees.table.lastObservation || "Última Observação",
        getEmployeeObservationsByEmployeeId,
        language
      ),
      createStatusColumn<Employee>(
        t.employees.table.status,
        t.employees.table.active,
        t.employees.table.inactive,
        true
      ),
      {
        key: "actions",
        label: "",
        headerClassName: "relative",
        render: (_, row) => (
          <TableActionButtons
            onEdit={() => navigate(getEmployeeEditRoute(row.id))}
            onDelete={() => {}}
            canEdit={canEdit("registration", "employee")}
            canDelete={canRemove("registration", "employee")}
          />
        ),
      },
    ],
    [t, language, navigate, canEdit, canRemove]
  );

  const filterOptions = useMemo(
    () => [
      { label: t.employees.filters.all, value: "all" as const },
      { label: t.employees.filters.active, value: "active" as const },
      { label: t.employees.filters.inactive, value: "inactive" as const },
    ],
    [t]
  );

  return (
    <RegistrationListPage<Employee>
      data={employees}
      columns={columns}
      title={t.employees.title}
      description={t.employees.description}
      badgeLabel={(count) => t.employees.badge.employees(count)}
      searchPlaceholder={t.employees.searchPlaceholder}
      emptyStateTitle={t.employees.emptyState.title}
      emptyStateDescription={(searchValue) =>
        t.employees.emptyState.descriptionWithSearch(searchValue)
      }
      emptyStateDescriptionWithoutSearch={t.employees.emptyState.descriptionWithoutSearch}
      addButtonLabel={t.employees.addEmployee}
      newRoute={ROUTES.EMPLOYEES_NEW}
      viewRoute={getEmployeeViewRoute}
      deleteService={(employee) => {
        const success = deleteEmployee(employee.id);
        if (success) {
          setEmployees(employees.filter((e) => e.id !== employee.id));
        }
        return success;
      }}
      deleteSuccessMessage={t.employees.success.deleted}
      deleteErrorMessage={t.employees.errors.deleteFailed}
      deleteModalTitle={t.employees.deleteModal.title}
      deleteModalMessage={(name) => t.employees.deleteModal.message(name)}
      deleteModalConfirm={t.employees.deleteModal.confirm}
      deleteModalCancel={t.employees.deleteModal.cancel}
      onDeleteSuccess={(employee) => {
        setEmployees(employees.filter((e) => e.id !== employee.id));
      }}
      permissionSection="registration"
      permissionResource="employee"
      language={language}
      initialSortColumn="name"
      searchFields={["name", "code", "email", "phone"]}
      filterOptions={filterOptions}
    />
  );
}
