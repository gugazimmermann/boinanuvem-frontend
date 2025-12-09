import { useTranslation } from "~/i18n";
import type { AccountsReceivable } from "~/types";
import {
  ROUTES,
  getAccountsReceivableEditRoute,
  getAccountsReceivableViewRoute,
} from "~/routes.config";
import { mockAccountsReceivable } from "~/mocks/accounts-receivable";
import { getAccountsReceivableByCompanyId } from "~/services/accounts-receivable.service";
import { FinanceTransactionListRoute } from "./finance-transaction-list-route";

export function meta() {
  return [
    { title: "Contas a Receber - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de contas a receber do Boi na Nuvem",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function AccountsReceivable() {
  const t = useTranslation();

  return (
    <FinanceTransactionListRoute<AccountsReceivable>
      config={{
        transactionType: "accounts-receivable",
        entityColumnKey: "buyer",
        amountColorClass: "green",
        getTransactionsByCompanyId: getAccountsReceivableByCompanyId,
        mockTransactions: mockAccountsReceivable,
        routes: {
          list: ROUTES.ACCOUNTS_RECEIVABLE,
          new: ROUTES.ACCOUNTS_RECEIVABLE_NEW,
          edit: getAccountsReceivableEditRoute,
          view: getAccountsReceivableViewRoute,
        },
        permissionResource: "accountsReceivable",
        translations: t.accountsReceivable,
      }}
    />
  );
}
