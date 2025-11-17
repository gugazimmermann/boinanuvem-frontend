import { useParams, useNavigate } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Button, StatusBadge } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getAccountsPayableEditRoute } from "~/routes.config";
import { getAccountsPayableById } from "~/services/accounts-payable.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getBankAccountById } from "~/services/bank-account.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getPropertyById } from "~/services/properties.service";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "dd/MM/yyyy", { locale: ptBR });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function meta() {
  return [
    { title: "Detalhes da Conta a Pagar - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da conta a pagar",
    },
  ];
}

export default function AccountsPayableDetails() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const transaction = getAccountsPayableById(transactionId);

  if (!transaction) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.accountsPayable.emptyState.title}
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.ACCOUNTS_PAYABLE)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const supplier = transaction.supplierId ? getSupplierById(transaction.supplierId) : null;
  const employee = transaction.employeeId ? getEmployeeById(transaction.employeeId) : null;
  const serviceProvider = transaction.serviceProviderId
    ? getServiceProviderById(transaction.serviceProviderId)
    : null;
  const property = transaction.propertyId ? getPropertyById(transaction.propertyId) : null;
  const bankAccount = transaction.bankAccountId
    ? getBankAccountById(transaction.bankAccountId)
    : null;
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "overdue":
        return "danger";
      case "partial":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.accountsPayable.details.transactionInfo}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{transaction.description}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTES.ACCOUNTS_PAYABLE)}>
            {t.common.back}
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(getAccountsPayableEditRoute(transaction.id))}
          >
            {t.common.save}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supplier && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsPayable.details.supplier}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{supplier.name}</p>
            </div>
          )}
          {employee && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsPayable.details.employee}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{employee.name}</p>
            </div>
          )}
          {serviceProvider && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsPayable.details.serviceProvider}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{serviceProvider.name}</p>
            </div>
          )}
          {property && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsPayable.details.property}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{property.name}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.accountsPayable.details.amount}
            </label>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.accountsPayable.details.dueDate}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{formatDate(transaction.dueDate)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.accountsPayable.details.status}
            </label>
            <StatusBadge
              label={t.accountsPayable.status[transaction.status] || transaction.status}
              variant={getStatusVariant(transaction.status)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.accountsPayable.details.description}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{transaction.description}</p>
          </div>
          {transaction.paymentMethod && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsPayable.details.paymentMethod}
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {t.accountsPayable.paymentMethods[transaction.paymentMethod] ||
                  transaction.paymentMethod}
              </p>
            </div>
          )}
          {bankAccount && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsPayable.details.bankAccount}
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {bankAccount.bankName} - {bankAccount.accountNumber} (
                {bankAccount.accountType === "checking"
                  ? t.bankAccounts.accountTypes.checking
                  : t.bankAccounts.accountTypes.savings}
                )
              </p>
            </div>
          )}
          {transaction.paidDate && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsPayable.details.paidDate}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{formatDate(transaction.paidDate)}</p>
            </div>
          )}
          {transaction.paidAmount && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsPayable.details.paidAmount}
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {formatCurrency(transaction.paidAmount)}
              </p>
            </div>
          )}
          {transaction.referenceNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsPayable.details.referenceNumber}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{transaction.referenceNumber}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.accountsPayable.details.createdAt}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{formatDate(transaction.createdAt)}</p>
          </div>
          {transaction.observation && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsPayable.details.observation}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{transaction.observation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
