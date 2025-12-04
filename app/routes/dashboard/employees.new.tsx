import { useNavigate } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addEmployee } from "~/services/employees.service";
import type { EmployeeFormData } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { mockProperties } from "~/mocks/properties";
import { EntityForm, type EntityFormData } from "~/components/dashboard/forms/entity-form";

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
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const handleSubmit = async (data: EntityFormData) => {
    const employeeData: EmployeeFormData = {
      code: data.code,
      name: data.name,
      cpf: data.cpf || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      status: data.status,
      companyId,
      propertyIds: data.propertyIds,
      street: data.street || undefined,
      number: data.number || undefined,
      complement: data.complement || undefined,
      neighborhood: data.neighborhood || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zipCode: data.zipCode || undefined,
    };
    addEmployee(employeeData);
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate(ROUTES.EMPLOYEES);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.employees.addEmployee}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.employees.new.description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.EMPLOYEES)}>
          {t.common.back}
        </Button>
      </div>

      <EntityForm
        entityType="employee"
        properties={mockProperties}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onCancel={() => navigate(ROUTES.EMPLOYEES)}
        successMessage={t.employees.new.success}
        errorMessage={t.employees.new.error}
      />
    </div>
  );
}
