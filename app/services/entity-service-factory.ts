import { apiClient, ApiError } from "./api-client";
import { unmaskCPF, unmaskCNPJ, unmaskPhone, unmaskCEP } from "~/components/site/utils/masks";

/**
 * Configuration for entity service factory
 */
export interface EntityServiceConfig<TFormData> {
  /** API endpoint path (e.g., "/buyers", "/suppliers") */
  endpoint: string;
  /** Entity name in singular form for error messages (e.g., "comprador", "fornecedor") */
  entityName: string;
  /** Entity name in plural form for error messages (e.g., "compradores", "fornecedores") */
  entityNamePlural: string;
  /** Whether the entity supports CNPJ (default: true) */
  supportsCNPJ?: boolean;
  /** Transform form data to DTO before sending to API */
  transformFormData?: (data: TFormData | Partial<TFormData>) => Record<string, unknown>;
}

/**
 * Common form data fields that most entities share
 */
interface CommonFormDataFields {
  code: string;
  name: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  propertyIds: string[];
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

/**
 * Default transformation for form data to DTO
 */
function defaultTransformFormData<T extends CommonFormDataFields>(
  data: T | Partial<T>,
  supportsCNPJ: boolean
): Record<string, unknown> {
  return {
    code: data.code,
    name: data.name,
    cpf: data.cpf ? unmaskCPF(data.cpf) : undefined,
    ...(supportsCNPJ && { cnpj: data.cnpj ? unmaskCNPJ(data.cnpj) : undefined }),
    email: data.email || undefined,
    phone: data.phone ? unmaskPhone(data.phone) : undefined,
    status: data.status,
    propertyIds: data.propertyIds,
    street: data.street || undefined,
    number: data.number || undefined,
    complement: data.complement || undefined,
    neighborhood: data.neighborhood || undefined,
    city: data.city || undefined,
    state: data.state ? data.state.toUpperCase() : undefined,
    zipCode: data.zipCode ? unmaskCEP(data.zipCode) : undefined,
  };
}

/**
 * Create a generic entity service with CRUD operations
 */
export function createEntityService<TEntity, TFormData extends CommonFormDataFields>(
  config: EntityServiceConfig<TFormData>
) {
  const {
    endpoint,
    entityName,
    entityNamePlural,
    supportsCNPJ = true,
    transformFormData = (data) => defaultTransformFormData(data, supportsCNPJ),
  } = config;

  /**
   * Get all entities for the current user's company via API
   */
  async function getAll(): Promise<TEntity[]> {
    try {
      return await apiClient.get<TEntity[]>(endpoint);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          throw new Error(`Você não tem permissão para visualizar ${entityNamePlural}`);
        }
        if (error.status === 401) {
          throw new Error("Autenticação necessária");
        }
      }
      throw error;
    }
  }

  /**
   * Get a single entity by ID via API
   */
  async function getById(id: string): Promise<TEntity> {
    try {
      return await apiClient.get<TEntity>(`${endpoint}/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          throw new Error(`Você não tem permissão para visualizar este ${entityName}`);
        }
        if (error.status === 404) {
          throw new Error(
            `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} não encontrado`
          );
        }
        if (error.status === 401) {
          throw new Error("Autenticação necessária");
        }
      }
      throw error;
    }
  }

  /**
   * Create a new entity via API
   */
  async function add(data: TFormData): Promise<TEntity> {
    try {
      const createDto = transformFormData(data);
      const response = await apiClient.post<TEntity>(endpoint, createDto);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          throw new Error(`Você não tem permissão para adicionar ${entityNamePlural}`);
        }
        if (error.status === 409) {
          throw new Error(`Já existe um ${entityName} com este código`);
        }
        if (error.status === 400) {
          throw new Error("Dados inválidos. Verifique os campos preenchidos");
        }
      }
      throw error;
    }
  }

  /**
   * Update an entity via API
   */
  async function update(id: string, data: Partial<TFormData>): Promise<TEntity> {
    try {
      const updateDto = transformFormData(data);
      const response = await apiClient.put<TEntity>(`${endpoint}/${id}`, updateDto);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          throw new Error(`Você não tem permissão para editar ${entityNamePlural}`);
        }
        if (error.status === 404) {
          throw new Error(
            `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} não encontrado`
          );
        }
        if (error.status === 409) {
          throw new Error(`Já existe um ${entityName} com este código`);
        }
        if (error.status === 400) {
          throw new Error("Dados inválidos. Verifique os campos preenchidos");
        }
      }
      throw error;
    }
  }

  /**
   * Delete an entity via API
   */
  async function remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`${endpoint}/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          throw new Error(`Você não tem permissão para excluir ${entityNamePlural}`);
        }
        if (error.status === 404) {
          throw new Error(
            `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} não encontrado`
          );
        }
        if (error.status === 401) {
          throw new Error("Autenticação necessária");
        }
      }
      throw error;
    }
  }

  return {
    getAll,
    getById,
    add,
    update,
    remove,
  };
}
