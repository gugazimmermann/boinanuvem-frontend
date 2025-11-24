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
} from "~/components/dashboard/registrations/table-columns";
import { formatDate } from "~/utils/formatting";
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
      {
        key: "properties",
        label: t.employees.table.properties,
        sortable: false,
        render: (_, row) => {
          const properties = row.propertyIds
            .map((id) => getPropertyById(id))
            .filter((p) => p !== undefined)
            .map((p) => p!.name);
          return (
            <span className="text-gray-700 dark:text-gray-300">
              {properties.length > 0 ? properties.join(", ") : "-"}
            </span>
          );
        },
      },
      {
        key: "lastMovement",
        label: t.employees.table.lastMovement || "Última Movimentação",
        sortable: false,
        render: (_, row) => {
          const movements = getLocationMovementsByEmployeeId(row.id);
          if (movements.length === 0) {
            return <span className="text-gray-400 dark:text-gray-500">-</span>;
          }
          const lastMovement = movements.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          const movementTypeLabel =
            t.properties.details.movements.types[
              lastMovement.type as keyof typeof t.properties.details.movements.types
            ] || lastMovement.type;
          return (
            <div className="space-y-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">{movementTypeLabel}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(lastMovement.date, language)}
              </p>
            </div>
          );
        },
      },
      {
        key: "lastObservation",
        label: t.employees.table.lastObservation || "Última Observação",
        sortable: false,
        render: (_, row) => {
          const observations = getEmployeeObservationsByEmployeeId(row.id);
          if (observations.length === 0) {
            return <span className="text-gray-400 dark:text-gray-500">-</span>;
          }
          const lastObservation = observations.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          const truncated =
            lastObservation.observation.length > 60
              ? `${lastObservation.observation.substring(0, 60)}...`
              : lastObservation.observation;
          return (
            <div className="space-y-1">
              <p
                className="text-sm text-gray-700 dark:text-gray-300"
                title={lastObservation.observation}
              >
                {truncated}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(lastObservation.createdAt, language)}
              </p>
            </div>
          );
        },
      },
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
      { label: t.employees.filters.all, value: "all" },
      { label: t.employees.filters.active, value: "active" },
      { label: t.employees.filters.inactive, value: "inactive" },
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
