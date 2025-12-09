import { useParams } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES, getBuyerEditRoute } from "~/routes.config";
import { getBuyerById } from "~/services/buyers.service";
import type { Buyer } from "~/types";
import { getCashFlowByBuyerId } from "~/services/cash-flow.service";
import { getAccountsReceivableByBuyerId } from "~/services/accounts-receivable.service";
import {
  getBuyerObservationsByBuyerId,
  addBuyerObservation,
} from "~/services/buyer-observations.service";
import type { BuyerObservation } from "~/types/buyer-observation";
import { EntityDetailPage } from "~/components/dashboard/entity-details/entity-detail-page";

export function meta() {
  return [
    { title: "Detalhes do Comprador - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do comprador",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function BuyerDetails() {
  const { buyerId } = useParams<{ buyerId: string }>();
  const t = useTranslation();

  return (
    <EntityDetailPage<Buyer, BuyerObservation>
      entityId={buyerId}
      fetchEntity={getBuyerById}
      entityType="buyer"
      mapEntityToData={(buyer) => ({
        id: buyer.id,
        code: buyer.code,
        name: buyer.name,
        cpf: buyer.cpf,
        cnpj: buyer.cnpj,
        email: buyer.email,
        phone: buyer.phone,
        propertyIds: buyer.propertyIds,
        createdAt: buyer.createdAt,
        status: buyer.status,
        street: buyer.street,
        number: buyer.number,
        complement: buyer.complement,
        neighborhood: buyer.neighborhood,
        city: buyer.city,
        state: buyer.state,
        zipCode: buyer.zipCode,
      })}
      translations={t.buyers}
      routes={{
        list: ROUTES.BUYERS,
        edit: getBuyerEditRoute,
      }}
      permissionResource="buyer"
      observationConfig={{
        fetchObservations: getBuyerObservationsByBuyerId,
        addObservation: (data) =>
          addBuyerObservation(data as { buyerId: string; observation: string; fileIds?: string[] }),
        translationKeys: {
          observationRequired: t.buyers.details.observationRequired,
          observationAdded: t.buyers.details.observationAdded,
          observationError: t.buyers.details.observationError,
        },
        fileIdPrefix: "file-buy-obs",
      }}
      financeConfig={{
        getCashFlowTransactions: getCashFlowByBuyerId,
        getReceivableTransactions: getAccountsReceivableByBuyerId,
        gradientId: "colorNetBuyer",
      }}
      validTabs={["info", "activities", "observations", "finance"]}
    />
  );
}
