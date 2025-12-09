import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { TableActionButtons, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { getBuyers, deleteBuyer } from "~/services/buyers.service";
import { useAlert } from "~/hooks/use-alert";
import type { Buyer, Property } from "~/types";
import { getProperties } from "~/services/properties.service";
import { ROUTES, getBuyerEditRoute, getBuyerViewRoute } from "~/routes.config";
import { getBuyerObservationsByBuyerId } from "~/services/buyer-observations.service";
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
  const { showAlert } = useAlert();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [properties, setProperties] = useState<Map<string, Property>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [buyersData, propertiesData] = await Promise.all([getBuyers(), getProperties()]);
        setBuyers(buyersData);
        setProperties(new Map(propertiesData.map((p) => [p.id, p])));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t.buyers.errors.loadFailed;
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
      createPropertiesColumn<Buyer>(t.buyers.table.properties, getPropertyById),
      createLastObservationColumn<Buyer>(
        t.buyers.table.lastObservation || "Última Observação",
        getBuyerObservationsByBuyerId,
        language
      ),
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
    [t, language, navigate, canEdit, canRemove, getPropertyById]
  );

  const filterOptions = useMemo(
    () => [
      { label: t.buyers.filters.all, value: "all" as const },
      { label: t.buyers.filters.active, value: "active" as const },
      { label: t.buyers.filters.inactive, value: "inactive" as const },
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
      deleteService={async (buyer) => {
        try {
          await deleteBuyer(buyer.id);
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : t.buyers.errors.deleteFailed;
          showAlert(errorMessage, "error");
          return false;
        }
      }}
      isLoading={isLoading}
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
