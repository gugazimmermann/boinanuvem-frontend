import { useTranslation } from "~/i18n";
import type { AccountsPayable } from "~/types";
import { ROUTES, getAccountsPayableEditRoute, getAccountsPayableViewRoute } from "~/routes.config";
import { getAccountsPayableByCompanyId } from "~/services/accounts-payable.service";
import { FinanceTransactionListRoute } from "./finance-transaction-list-route";

export function meta() {
  return [
    { title: "Contas a Pagar - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de contas a pagar do Boi na Nuvem",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function AccountsPayable() {
  const t = useTranslation();

  return (
    <FinanceTransactionListRoute<AccountsPayable>
      config={{
        transactionType: "accounts-payable",
        entityColumnKey: "supplier",
        amountColorClass: "red",
        getTransactionsByCompanyId: getAccountsPayableByCompanyId,
        routes: {
          list: ROUTES.ACCOUNTS_PAYABLE,
          new: ROUTES.ACCOUNTS_PAYABLE_NEW,
          edit: getAccountsPayableEditRoute,
          view: getAccountsPayableViewRoute,
        },
        permissionResource: "accountsPayable",
        translations: t.accountsPayable,
      }}
    />
  );
}
