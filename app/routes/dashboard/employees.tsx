import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { TableActionButtons, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { getEmployees, deleteEmployee } from "~/services/employees.service";
import { useAlert } from "~/hooks/use-alert";
import type { Employee, Property } from "~/types";
import { getProperties } from "~/services/properties.service";
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
  const { showAlert } = useAlert();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [properties, setProperties] = useState<Map<string, Property>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [employeesData, propertiesData] = await Promise.all([
          getEmployees(),
          getProperties(),
        ]);
        setEmployees(employeesData);
        setProperties(new Map(propertiesData.map((p) => [p.id, p])));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t.employees.errors.loadFailed;
        showAlert(errorMessage, "error");
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showAlert, t]);

  const getPropertyById = useCallback(
    (id: string) => {
      const property = properties.get(id);
      return property ? { name: property.name } : undefined;
    },
    [properties]
  );

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
    [t, language, navigate, canEdit, canRemove, getPropertyById]
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
      deleteService={async (employee) => {
        try {
          await deleteEmployee(employee.id);
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : t.employees.errors.deleteFailed;
          showAlert(errorMessage, "error");
          return false;
        }
      }}
      isLoading={isLoading}
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
