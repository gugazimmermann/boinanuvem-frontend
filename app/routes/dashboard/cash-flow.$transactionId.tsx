import { useParams, useNavigate } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Button, StatusBadge } from "~/components/ui";
import { useTranslation } from "~/i18n";
import {
  ROUTES,
  getCashFlowEditRoute,
  getSupplierViewRoute,
  getBuyerViewRoute,
} from "~/routes.config";
import { getCashFlowById } from "~/services/cash-flow.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getBuyerById } from "~/services/buyers.service";
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
    { title: "Detalhes da Transação - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da transação",
    },
  ];
}

export default function CashFlowDetails() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const transaction = getCashFlowById(transactionId);
  const supplier =
    transaction?.type === "expense" && transaction?.supplierId
      ? getSupplierById(transaction.supplierId)
      : null;
  const buyer =
    transaction?.type === "income" && transaction?.buyerId
      ? getBuyerById(transaction.buyerId)
      : null;
  const employee = transaction?.employeeId ? getEmployeeById(transaction.employeeId) : null;
  const serviceProvider = transaction?.serviceProviderId
    ? getServiceProviderById(transaction.serviceProviderId)
    : null;
  const property = transaction?.propertyId ? getPropertyById(transaction.propertyId) : null;

  if (!transaction) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.cashFlow.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.CASH_FLOW)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.cashFlow.details.transactionInfo}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{transaction.description}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTES.CASH_FLOW)}>
            {t.common.back}
          </Button>
          <Button variant="primary" onClick={() => navigate(getCashFlowEditRoute(transaction.id))}>
            {t.cashFlow.edit.title}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.type}
            </label>
            <StatusBadge
              label={
                transaction.type === "income" ? t.cashFlow.table.income : t.cashFlow.table.expense
              }
              variant={transaction.type === "income" ? "success" : "default"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.amount}
            </label>
            <p
              className={`text-lg font-semibold ${
                transaction.type === "income"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.date}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{formatDate(transaction.date)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.paymentDate}
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {transaction.paymentDate ? formatDate(transaction.paymentDate) : "-"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.description}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{transaction.description}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.category}
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {t.cashFlow.categories[transaction.category] || transaction.category}
            </p>
          </div>
          {transaction.type === "expense" && supplier && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.cashFlow.details.supplier}
              </label>
              <button
                onClick={() => navigate(getSupplierViewRoute(supplier.id))}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {supplier.name}
              </button>
            </div>
          )}
          {transaction.type === "income" && buyer && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.cashFlow.details.buyer}
              </label>
              <button
                onClick={() => navigate(getBuyerViewRoute(buyer.id))}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {buyer.name}
              </button>
            </div>
          )}
          {employee && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.cashFlow.details.employee}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{employee.name}</p>
            </div>
          )}
          {serviceProvider && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.cashFlow.details.serviceProvider}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{serviceProvider.name}</p>
            </div>
          )}
          {property && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.cashFlow.details.property}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{property.name}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.paymentMethod}
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {t.cashFlow.paymentMethods[transaction.paymentMethod] || transaction.paymentMethod}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.status}
            </label>
            <StatusBadge label={t.cashFlow.table.completed} variant="success" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.referenceNumber}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{transaction.referenceNumber || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.createdAt}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{formatDate(transaction.createdAt)}</p>
          </div>
          {transaction.observation && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.cashFlow.details.observation}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{transaction.observation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
