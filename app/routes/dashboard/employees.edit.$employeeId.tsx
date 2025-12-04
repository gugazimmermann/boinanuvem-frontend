import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getEmployeeViewRoute } from "~/routes.config";
import { getEmployeeById, updateEmployee } from "~/services/employees.service";
import type { EmployeeFormData } from "~/types";
import { mockProperties } from "~/mocks/properties";
import { EntityForm, type EntityFormData } from "~/components/dashboard/forms/entity-form";

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
  const t = useTranslation();
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const employee = getEmployeeById(employeeId);

  const handleSubmit = async (data: EntityFormData) => {
    if (!employeeId) return;

    const employeeData: Partial<EmployeeFormData> = {
      code: data.code,
      name: data.name,
      cpf: data.cpf || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      status: data.status,
      propertyIds: data.propertyIds,
      street: data.street || undefined,
      number: data.number || undefined,
      complement: data.complement || undefined,
      neighborhood: data.neighborhood || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zipCode: data.zipCode || undefined,
    };
    const success = updateEmployee(employeeId, employeeData);
    if (!success) {
      throw new Error("Failed to update employee");
    }
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate(ROUTES.EMPLOYEES);
    }, 1500);
  };

  if (!employee) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{t.employees.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.EMPLOYEES)} className="mt-4">
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const initialData: Partial<EntityFormData> = {
    code: employee.code,
    name: employee.name,
    cpf: employee.cpf || "",
    email: employee.email || "",
    phone: employee.phone || "",
    status: employee.status,
    zipCode: employee.zipCode || "",
    street: employee.street || "",
    number: employee.number || "",
    complement: employee.complement || "",
    neighborhood: employee.neighborhood || "",
    city: employee.city || "",
    state: employee.state || "",
    propertyIds: employee.propertyIds || [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.employees.edit.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.employees.edit.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => employeeId && navigate(getEmployeeViewRoute(employeeId))}
        >
          {t.team.new.back}
        </Button>
      </div>

      <EntityForm
        entityType="employee"
        initialData={initialData}
        properties={mockProperties}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onCancel={() => employeeId && navigate(getEmployeeViewRoute(employeeId))}
        successMessage={t.employees.success.updated}
        errorMessage={t.employees.errors.updateFailed}
        isEdit={true}
      />
    </div>
  );
}
