import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { TableActionButtons, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { mockBuyers } from "~/mocks/buyers";
import { deleteBuyer } from "~/services/buyers.service";
import type { Buyer } from "~/types";
import { getPropertyById } from "~/services/properties.service";
import { ROUTES, getBuyerEditRoute, getBuyerViewRoute } from "~/routes.config";
import { getBuyerObservationsByBuyerId } from "~/services/buyer-observations.service";
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
  return createRegistrationMeta("Compradores", "Gerenciamento de compradores do Boi na Nuvem");
}

export async function loader({ request }: { request: Request }) {
  return createRegistrationLoader(undefined, "view")({ request });
}

export default function Buyers() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canEdit, canRemove } = usePermissions();
  const [buyers, setBuyers] = useState<Buyer[]>([...mockBuyers]);

  const columns: TableColumn<Buyer>[] = useMemo(
    () => [
      createNameCodeColumn<Buyer>(t.buyers.table.name, true),
      createTextColumn<Buyer>(
        "document",
        t.buyers.table.document || "Documento",
        (row) => row.cpf || row.cnpj || null,
        false
      ),
      createTextColumn<Buyer>("email", t.buyers.table.email, (row) => row.email || null, true),
      createTextColumn<Buyer>("phone", t.buyers.table.phone, (row) => row.phone || null, true),
      {
        key: "properties",
        label: t.buyers.table.properties,
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
        label: t.buyers.table.lastObservation || "Última Observação",
        sortable: false,
        render: (_, row) => {
          const observations = getBuyerObservationsByBuyerId(row.id);
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
      createStatusColumn<Buyer>(
        t.buyers.table.status,
        t.buyers.table.active,
        t.buyers.table.inactive,
        true
      ),
      {
        key: "actions",
        label: "",
        headerClassName: "relative",
        render: (_, row) => (
          <TableActionButtons
            onEdit={() => navigate(getBuyerEditRoute(row.id))}
            onDelete={() => {}}
            canEdit={canEdit("registration", "buyer")}
            canDelete={canRemove("registration", "buyer")}
          />
        ),
      },
    ],
    [t, language, navigate, canEdit, canRemove]
  );

  const filterOptions = useMemo(
    () => [
      { label: t.buyers.filters.all, value: "all" },
      { label: t.buyers.filters.active, value: "active" },
      { label: t.buyers.filters.inactive, value: "inactive" },
    ],
    [t]
  );

  return (
    <RegistrationListPage<Buyer>
      data={buyers}
      columns={columns}
      title={t.buyers.title}
      description={t.buyers.description}
      badgeLabel={(count) => t.buyers.badge.buyers(count)}
      searchPlaceholder={t.buyers.searchPlaceholder}
      emptyStateTitle={t.buyers.emptyState.title}
      emptyStateDescription={(searchValue) =>
        t.buyers.emptyState.descriptionWithSearch(searchValue)
      }
      emptyStateDescriptionWithoutSearch={t.buyers.emptyState.descriptionWithoutSearch}
      addButtonLabel={t.buyers.addBuyer}
      newRoute={ROUTES.BUYERS_NEW}
      viewRoute={getBuyerViewRoute}
      deleteService={(buyer) => {
        const success = deleteBuyer(buyer.id);
        if (success) {
          setBuyers(buyers.filter((b) => b.id !== buyer.id));
        }
        return success;
      }}
      deleteSuccessMessage={t.buyers.success.deleted}
      deleteErrorMessage={t.buyers.errors.deleteFailed}
      deleteModalTitle={t.buyers.deleteModal.title}
      deleteModalMessage={(name) => t.buyers.deleteModal.message(name)}
      deleteModalConfirm={t.buyers.deleteModal.confirm}
      deleteModalCancel={t.buyers.deleteModal.cancel}
      onDeleteSuccess={(buyer) => {
        setBuyers(buyers.filter((b) => b.id !== buyer.id));
      }}
      permissionSection="registration"
      permissionResource="buyer"
      language={language}
      initialSortColumn="name"
      searchFields={["name", "code", "email", "phone", "cpf", "cnpj"]}
      filterOptions={filterOptions}
    />
  );
}
