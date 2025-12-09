import { useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { formatDate } from "~/utils/formatting";
import { getProperties } from "~/services/properties.service";
import { getPropertyViewRoute } from "~/routes.config";
import { useState, useEffect } from "react";
import type { Property } from "~/types";

export type EntityType = "employee" | "serviceProvider" | "supplier" | "buyer";

export interface EntityData {
  code: string;
  name: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  propertyIds?: string[];
  createdAt: string;
}

export interface EntityField {
  label: string;
  value: string | React.ReactNode;
}

export interface UseEntityDetailsConfigOptions {
  entityType: EntityType;
  entity: EntityData;
}

export function useEntityDetailsConfig({ entityType, entity }: UseEntityDetailsConfigOptions) {
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const [properties, setProperties] = useState<Map<string, Property>>(new Map());

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const propertiesData = await getProperties();
        setProperties(new Map(propertiesData.map((p) => [p.id, p])));
      } catch (error) {
        console.error("Failed to load properties:", error);
      }
    };
    loadProperties();
  }, []);

  const getTranslationKeys = () => {
    switch (entityType) {
      case "employee":
        return {
          code: t.employees.table.code,
          name: t.employees.table.name,
          cpf: t.employees.table.cpf,
          email: t.employees.table.email,
          phone: t.employees.table.phone,
          properties: t.employees.details.properties,
          createdAt: t.employees.details.createdAt,
          address: t.employees.details.address,
          cityState: t.employees.details.cityState,
        };
      case "serviceProvider":
        return {
          code: t.serviceProviders.table.code,
          name: t.serviceProviders.table.name,
          cpf: t.serviceProviders.table.cpf,
          cnpj: t.serviceProviders.table.cnpj,
          email: t.serviceProviders.table.email,
          phone: t.serviceProviders.table.phone,
          properties: t.serviceProviders.details.properties,
          createdAt: t.serviceProviders.details.createdAt,
          address: t.serviceProviders.details.address,
          cityState: t.serviceProviders.details.cityState,
        };
      case "supplier":
        return {
          code: t.suppliers.table.code,
          name: t.suppliers.table.name,
          cpf: t.suppliers.table.cpf,
          cnpj: t.suppliers.table.cnpj,
          email: t.suppliers.table.email,
          phone: t.suppliers.table.phone,
          properties: t.suppliers.details.properties,
          createdAt: t.suppliers.details.createdAt,
          address: t.suppliers.details.address,
          cityState: t.suppliers.details.cityState,
        };
      case "buyer":
        return {
          code: t.buyers.table.code,
          name: t.buyers.table.name,
          cpf: t.buyers.table.cpf,
          cnpj: t.buyers.table.cnpj,
          email: t.buyers.table.email,
          phone: t.buyers.table.phone,
          properties: t.buyers.details.properties,
          createdAt: t.buyers.details.createdAt,
          address: t.buyers.details.address,
          cityState: t.buyers.details.cityState,
        };
    }
  };

  const translations = getTranslationKeys();

  const generateInfoFields = (): EntityField[] => {
    const baseFields: EntityField[] = [
      {
        label: translations.code,
        value: entity.code,
      },
      {
        label: translations.name,
        value: entity.name,
      },
    ];

    const additionalFields: EntityField[] = [
      ...(entity.cpf
        ? [
            {
              label: translations.cpf || "CPF",
              value: entity.cpf,
            },
          ]
        : []),
      ...(entity.cnpj &&
      (entityType === "serviceProvider" || entityType === "supplier" || entityType === "buyer")
        ? [
            {
              label: translations.cnpj || "CNPJ",
              value: entity.cnpj,
            },
          ]
        : []),
      ...(entity.email
        ? [
            {
              label: translations.email || "Email",
              value: entity.email,
            },
          ]
        : []),
      ...(entity.phone
        ? [
            {
              label: translations.phone || "Phone",
              value: entity.phone,
            },
          ]
        : []),
      {
        label: translations.properties || "Properties",
        value:
          entity.propertyIds && entity.propertyIds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {entity.propertyIds.map((propertyId: string) => {
                const property = properties.get(propertyId);
                return property ? (
                  <button
                    type="button"
                    key={propertyId}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
                    onClick={() => navigate(getPropertyViewRoute(propertyId))}
                  >
                    {property.name}
                  </button>
                ) : null;
              })}
            </div>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
          ),
      },
      {
        label: translations.createdAt || "Created At",
        value: formatDate(entity.createdAt, language),
      },
    ];

    return [...baseFields, ...additionalFields];
  };

  const getAddressTranslationKeys = () => {
    return {
      street: translations.address,
      complement: t.profile.company.fields.complement,
      neighborhood: t.profile.company.fields.neighborhood,
      cityState: translations.cityState,
      zipCode: t.profile.company.fields.zipCode,
    };
  };

  const getInfoSectionTitle = () => {
    switch (entityType) {
      case "employee":
        return t.employees.details.employeeInfo;
      case "serviceProvider":
        return t.serviceProviders.details.serviceProviderInfo;
      case "supplier":
        return t.suppliers.details.supplierInfo;
      case "buyer":
        return t.buyers.details.buyerInfo;
    }
  };

  return {
    infoFields: generateInfoFields(),
    addressTranslationKeys: getAddressTranslationKeys(),
    infoSectionTitle: getInfoSectionTitle(),
  };
}
