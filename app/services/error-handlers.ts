import { ApiError } from "./api-client";

export interface ApiErrorMessages {
  readonly [status: number]: string;
}

/**
 * Handle API errors by mapping status codes to user-friendly error messages
 * @param error - The error to handle
 * @param errorMessages - Map of status codes to error messages
 * @throws Error with the mapped message if status code matches, otherwise re-throws the original error
 */
export function handleApiError(error: unknown, errorMessages: ApiErrorMessages): never {
  if (error instanceof ApiError) {
    const message = errorMessages[error.status];
    if (message) {
      throw new Error(message);
    }
  }
  throw error;
}

/**
 * Common error messages for CRUD operations
 */
export const commonErrorMessages = {
  view: {
    403: "Você não tem permissão para visualizar este recurso",
    404: "Recurso não encontrado",
    401: "Autenticação necessária",
  },
  list: {
    403: "Você não tem permissão para visualizar recursos",
    401: "Autenticação necessária",
  },
  create: {
    403: "Você não tem permissão para adicionar recursos",
    409: "Já existe um recurso com este identificador",
    400: "Dados inválidos. Verifique os campos preenchidos",
  },
  update: {
    403: "Você não tem permissão para editar recursos",
    404: "Recurso não encontrado",
    409: "Já existe um recurso com este identificador",
    400: "Dados inválidos. Verifique os campos preenchidos",
  },
  delete: {
    403: "Você não tem permissão para excluir recursos",
    404: "Recurso não encontrado",
    401: "Autenticação necessária",
  },
} as const;

/**
 * Create custom error messages for a specific resource
 */
export function createResourceErrorMessages(resourceName: string): {
  readonly view: ApiErrorMessages;
  readonly list: ApiErrorMessages;
  readonly create: ApiErrorMessages;
  readonly update: ApiErrorMessages;
  readonly delete: ApiErrorMessages;
} {
  return {
    view: {
      403: `Você não tem permissão para visualizar ${resourceName}`,
      404: `${resourceName} não encontrado`,
      401: "Autenticação necessária",
    },
    list: {
      403: `Você não tem permissão para visualizar ${resourceName}`,
      401: "Autenticação necessária",
    },
    create: {
      403: `Você não tem permissão para adicionar ${resourceName}`,
      409: `Já existe um ${resourceName} com este identificador`,
      400: "Dados inválidos. Verifique os campos preenchidos",
    },
    update: {
      403: `Você não tem permissão para editar ${resourceName}`,
      404: `${resourceName} não encontrado`,
      409: `Já existe um ${resourceName} com este identificador`,
      400: "Dados inválidos. Verifique os campos preenchidos",
    },
    delete: {
      403: `Você não tem permissão para excluir ${resourceName}`,
      404: `${resourceName} não encontrado`,
      401: "Autenticação necessária",
    },
  };
}
