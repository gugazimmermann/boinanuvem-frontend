import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { TableActionButtons, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { mockSuppliers } from "~/mocks/suppliers";
import { deleteSupplier } from "~/services/suppliers.service";
import type { Supplier } from "~/types";
import { getPropertyById } from "~/services/properties.service";
import { ROUTES, getSupplierEditRoute, getSupplierViewRoute } from "~/routes.config";
import { getSupplierObservationsBySupplierId } from "~/services/supplier-observations.service";
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
  const [suppliers, setSuppliers] = useState<Supplier[]>([...mockSuppliers]);

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
      {
        key: "properties",
        label: t.suppliers.table.properties,
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
        key: "lastObservation",
        label: t.suppliers.table.lastObservation || "Última Observação",
        sortable: false,
        render: (_, row) => {
          const observations = getSupplierObservationsBySupplierId(row.id);
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
    [t, language, navigate, canEdit, canRemove]
  );

  const filterOptions = useMemo(
    () => [
      { label: t.suppliers.filters.all, value: "all" },
      { label: t.suppliers.filters.active, value: "active" },
      { label: t.suppliers.filters.inactive, value: "inactive" },
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
      deleteService={(supplier) => {
        const success = deleteSupplier(supplier.id);
        if (success) {
          setSuppliers(suppliers.filter((s) => s.id !== supplier.id));
        }
        return success;
      }}
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
