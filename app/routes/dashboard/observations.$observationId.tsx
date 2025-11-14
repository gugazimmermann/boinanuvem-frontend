import { useParams, useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import {
  ROUTES,
  getLocationViewRoute,
  getEmployeeViewRoute,
  getServiceProviderViewRoute,
  getSupplierViewRoute,
  getBuyerViewRoute,
} from "~/routes.config";
import { getLocationObservationById } from "~/mocks/location-observations";
import { getEmployeeObservationById } from "~/mocks/employee-observations";
import { getServiceProviderObservationById } from "~/mocks/service-provider-observations";
import { getSupplierObservationById } from "~/mocks/supplier-observations";
import { getBuyerObservationById } from "~/mocks/buyer-observations";
import { getLocationById } from "~/mocks/locations";
import { getEmployeeById } from "~/mocks/employees";
import { getServiceProviderById } from "~/mocks/service-providers";
import { getSupplierById } from "~/mocks/suppliers";
import { getBuyerById } from "~/mocks/buyers";

export function meta() {
  return [
    { title: "Detalhes da Observação - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da observação",
    },
  ];
}

export default function ObservationDetails() {
  const { observationId } = useParams<{ observationId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = useTranslation();
  
  const locationObservation = getLocationObservationById(observationId);
  const employeeObservation = getEmployeeObservationById(observationId);
  const serviceProviderObservation = getServiceProviderObservationById(observationId);
  const supplierObservation = getSupplierObservationById(observationId);
  const buyerObservation = getBuyerObservationById(observationId);
  const observation = locationObservation || employeeObservation || serviceProviderObservation || supplierObservation || buyerObservation;
  
  const fromLocationId = searchParams.get("fromLocation");
  const fromEmployeeId = searchParams.get("fromEmployee");
  const fromServiceProviderId = searchParams.get("fromServiceProvider");
  const fromSupplierId = searchParams.get("fromSupplier");
  const fromBuyerId = searchParams.get("fromBuyer");

  if (!observation) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.locations.details.observationNotFound}
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.LOCATIONS)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const location = locationObservation ? getLocationById(locationObservation.locationId) : undefined;
  const employee = employeeObservation ? getEmployeeById(employeeObservation.employeeId) : undefined;
  const serviceProvider = serviceProviderObservation ? getServiceProviderById(serviceProviderObservation.serviceProviderId) : undefined;
  const supplier = supplierObservation ? getSupplierById(supplierObservation.supplierId) : undefined;
  const buyer = buyerObservation ? getBuyerById(buyerObservation.buyerId) : undefined;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.locations.details.tabs.observations || "Observação"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formatDateTime(observation.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (fromLocationId && getLocationById(fromLocationId)) {
                navigate(`${getLocationViewRoute(fromLocationId)}?tab=observations`);
              } else if (fromEmployeeId && getEmployeeById(fromEmployeeId)) {
                navigate(`${getEmployeeViewRoute(fromEmployeeId)}?tab=observations`);
              } else if (fromServiceProviderId && getServiceProviderById(fromServiceProviderId)) {
                navigate(`${getServiceProviderViewRoute(fromServiceProviderId)}?tab=observations`);
              } else if (fromSupplierId && getSupplierById(fromSupplierId)) {
                navigate(`${getSupplierViewRoute(fromSupplierId)}?tab=observations`);
              } else if (fromBuyerId && getBuyerById(fromBuyerId)) {
                navigate(`${getBuyerViewRoute(fromBuyerId)}?tab=observations`);
              } else if (location) {
                navigate(`${getLocationViewRoute(location.id)}?tab=observations`);
              } else if (employee) {
                navigate(`${getEmployeeViewRoute(employee.id)}?tab=observations`);
              } else if (serviceProvider) {
                navigate(`${getServiceProviderViewRoute(serviceProvider.id)}?tab=observations`);
              } else if (supplier) {
                navigate(`${getSupplierViewRoute(supplier.id)}?tab=observations`);
              } else if (buyer) {
                navigate(`${getBuyerViewRoute(buyer.id)}?tab=observations`);
              } else {
                navigate(ROUTES.LOCATIONS);
              }
            }}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            }
          >
            {t.team.new.back}
          </Button>
        </div>
      </div>

      {location && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.locations.table.name}
          </h2>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
            onClick={() => navigate(`${getLocationViewRoute(location.id)}?tab=observations`)}
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {location.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.locations.table.code}: {location.code}
              </p>
            </div>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      )}

      {employee && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.employees.table.name}
          </h2>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
            onClick={() => navigate(`${getEmployeeViewRoute(employee.id)}?tab=observations`)}
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {employee.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.employees.table.code}: {employee.code}
              </p>
            </div>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      )}

      {serviceProvider && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.serviceProviders.table.name}
          </h2>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
            onClick={() => navigate(`${getServiceProviderViewRoute(serviceProvider.id)}?tab=observations`)}
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {serviceProvider.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.serviceProviders.table.code}: {serviceProvider.code}
              </p>
            </div>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      )}

      {supplier && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.suppliers.table.name}
          </h2>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
            onClick={() => navigate(`${getSupplierViewRoute(supplier.id)}?tab=observations`)}
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {supplier.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.suppliers.table.code}: {supplier.code}
              </p>
            </div>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      )}

      {buyer && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.buyers.table.name}
          </h2>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
            onClick={() => navigate(`${getBuyerViewRoute(buyer.id)}?tab=observations`)}
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {buyer.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.buyers.table.code}: {buyer.code}
              </p>
            </div>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t.locations.details.observation || "Observação"}
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {observation.observation}
        </p>
      </div>

      {observation.fileIds && observation.fileIds.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.locations.details.files || "Anexos"} ({observation.fileIds.length})
          </h2>
          <div className="space-y-2">
            {observation.fileIds.map((fileId) => (
              <div
                key={fileId}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <svg
                    className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {fileId}
                  </span>
                </div>
                <a
                  href={`/api/files/${fileId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 flex-shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-1"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span className="text-sm">Baixar</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

