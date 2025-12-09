import { useMemo } from "react";
import { useNavigate } from "react-router";
import { TableActionButtons, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { getSuppliers, deleteSupplier } from "~/services/suppliers.service";
import { useAlert } from "~/hooks/use-alert";
import type { Supplier } from "~/types";
import { ROUTES, getSupplierEditRoute, getSupplierViewRoute } from "~/routes.config";
import { getSupplierObservationsBySupplierId } from "~/services/supplier-observations.service";
import { usePermissions } from "~/utils/permissions";
import { RegistrationListPage } from "~/components/dashboard/registrations/registration-list-page";
import {
  createNameCodeColumn,
  createStatusColumn,
  createTextColumn,
  createLastObservationColumn,
  createPropertiesColumn,
} from "~/components/dashboard/registrations/table-columns";
import { createRegistrationMeta, createRegistrationLoader } from "~/utils/route-helpers";
import { useRegistrationList } from "~/hooks/use-registration-list";

export function meta() {
  return createRegistrationMeta("Fornecedores", "Gerenciamento de fornecedores do Boi na Nuvem");
}

export async function loader({ request }: { request: Request }) {
  return createRegistrationLoader(undefined, "view")({ request });
}

export default function Suppliers() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canEdit, canRemove } = usePermissions();
  const { showAlert } = useAlert();

  const {
    entities: suppliers,
    isLoading,
    setEntities: setSuppliers,
    getPropertyById,
  } = useRegistrationList<Supplier>({
    fetchEntities: getSuppliers,
    loadErrorMessage: t.suppliers.errors.loadFailed,
  });

  const columns: TableColumn<Supplier>[] = useMemo(
    () => [
      createNameCodeColumn<Supplier>(t.suppliers.table.name, true),
      createTextColumn<Supplier>(
        "document",
        t.suppliers.table.document || "Documento",
        (row) => row.cpf || row.cnpj || null,
        false
      ),
      createTextColumn<Supplier>(
        "email",
        t.suppliers.table.email,
        (row) => row.email || null,
        true
      ),
      createTextColumn<Supplier>(
        "phone",
        t.suppliers.table.phone,
        (row) => row.phone || null,
        true
      ),
      createPropertiesColumn<Supplier>(t.suppliers.table.properties, getPropertyById),
      createLastObservationColumn<Supplier>(
        t.suppliers.table.lastObservation || "Última Observação",
        getSupplierObservationsBySupplierId,
        language
      ),
      createStatusColumn<Supplier>(
        t.suppliers.table.status,
        t.suppliers.table.active,
        t.suppliers.table.inactive,
        true
      ),
      {
        key: "actions",
        label: "",
        headerClassName: "relative",
        render: (_, row) => (
          <TableActionButtons
            onEdit={() => navigate(getSupplierEditRoute(row.id))}
            onDelete={() => {}}
            canEdit={canEdit("registration", "supplier")}
            canDelete={canRemove("registration", "supplier")}
          />
        ),
      },
    ],
    [t, language, navigate, canEdit, canRemove, getPropertyById]
  );

  const filterOptions = useMemo(
    () => [
      { label: t.suppliers.filters.all, value: "all" as const },
      { label: t.suppliers.filters.active, value: "active" as const },
      { label: t.suppliers.filters.inactive, value: "inactive" as const },
    ],
    [t]
  );

  return (
    <RegistrationListPage<Supplier>
      data={suppliers}
      columns={columns}
      title={t.suppliers.title}
      description={t.suppliers.description}
      badgeLabel={(count) => t.suppliers.badge.suppliers(count)}
      searchPlaceholder={t.suppliers.searchPlaceholder}
      emptyStateTitle={t.suppliers.emptyState.title}
      emptyStateDescription={(searchValue) =>
        t.suppliers.emptyState.descriptionWithSearch(searchValue)
      }
      emptyStateDescriptionWithoutSearch={t.suppliers.emptyState.descriptionWithoutSearch}
      addButtonLabel={t.suppliers.addSupplier}
      newRoute={ROUTES.SUPPLIERS_NEW}
      viewRoute={getSupplierViewRoute}
      deleteService={async (supplier) => {
        try {
          await deleteSupplier(supplier.id);
          setSuppliers(suppliers.filter((s) => s.id !== supplier.id));
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : t.suppliers.errors.deleteFailed;
          showAlert(errorMessage, "error");
          return false;
        }
      }}
      isLoading={isLoading}
      deleteSuccessMessage={t.suppliers.success.deleted}
      deleteErrorMessage={t.suppliers.errors.deleteFailed}
      deleteModalTitle={t.suppliers.deleteModal.title}
      deleteModalMessage={(name) => t.suppliers.deleteModal.message(name)}
      deleteModalConfirm={t.suppliers.deleteModal.confirm}
      deleteModalCancel={t.suppliers.deleteModal.cancel}
      onDeleteSuccess={(supplier) => {
        setSuppliers(suppliers.filter((s) => s.id !== supplier.id));
      }}
      permissionSection="registration"
      permissionResource="supplier"
      language={language}
      initialSortColumn="name"
      searchFields={["name", "code", "email", "phone", "cpf", "cnpj"]}
      filterOptions={filterOptions}
    />
  );
}
