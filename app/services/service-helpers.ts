import { apiClient } from "./api-client";
import { handleApiError, type ApiErrorMessages } from "./error-handlers";

/**
 * Configuration for creating a list handler
 */
export interface ListHandlerConfig<TInput, TOutput = TInput> {
  endpoint: string;
  errorMessages: ApiErrorMessages;
  transform?: (item: TInput) => TOutput;
}

/**
 * Create a generic handler for list operations (getByCompanyId)
 * Returns empty array on error
 */
export function createListHandler<TInput, TOutput = TInput>(
  config: ListHandlerConfig<TInput, TOutput>
) {
  return async function (_companyId?: string): Promise<TOutput[]> {
    try {
      const items = await apiClient.get<TInput[]>(config.endpoint);
      return config.transform ? items.map(config.transform) : (items as unknown as TOutput[]);
    } catch (error) {
      try {
        handleApiError(error, config.errorMessages);
      } catch {
        return [];
      }
    }
  };
}

/**
 * Configuration for creating a getById handler
 */
export interface GetByIdHandlerConfig<TInput, TOutput = TInput> {
  endpoint: string;
  errorMessages: ApiErrorMessages;
  transform?: (item: TInput) => TOutput;
  custom403Message?: string;
}

/**
 * Create a generic handler for getById operations
 * Returns undefined on error or if id is undefined
 */
export function createGetByIdHandler<TInput, TOutput = TInput>(
  config: GetByIdHandlerConfig<TInput, TOutput>
) {
  return async function (id: string | undefined): Promise<TOutput | undefined> {
    if (!id) return undefined;
    try {
      const item = await apiClient.get<TInput>(`${config.endpoint}/${id}`);
      return config.transform ? config.transform(item) : (item as unknown as TOutput);
    } catch (error) {
      try {
        const errorMessages: ApiErrorMessages = config.custom403Message
          ? { ...config.errorMessages, 403: config.custom403Message }
          : config.errorMessages;
        handleApiError(error, errorMessages);
      } catch {
        return undefined;
      }
    }
  };
}

/**
 * Configuration for creating a filter handler
 */
export interface FilterHandlerConfig<TInput, TOutput = TInput> {
  endpoint: string;
  errorMessages: ApiErrorMessages;
  filterFn: (item: TOutput, filterValue: string) => boolean;
  transform?: (item: TInput) => TOutput;
}

/**
 * Create a generic handler for getByXId operations that fetch all and filter
 */
export function createGetByFilterHandler<TInput, TOutput = TInput>(
  config: FilterHandlerConfig<TInput, TOutput>
) {
  return async function (filterValue: string): Promise<TOutput[]> {
    try {
      const items = await apiClient.get<TInput[]>(config.endpoint);
      const transformed = config.transform
        ? items.map(config.transform)
        : (items as unknown as TOutput[]);
      const filtered = transformed.filter((item) => config.filterFn(item, filterValue));
      return filtered;
    } catch (error) {
      try {
        handleApiError(error, config.errorMessages);
      } catch {
        return [];
      }
    }
  };
}

/**
 * Create a generic handler for date range filtering
 */
export function createDateRangeFilter<TInput, TOutput = TInput>(
  config: Omit<FilterHandlerConfig<TInput, TOutput>, "filterFn"> & {
    dateField: keyof TOutput;
  }
) {
  return async function (
    _companyId: string,
    startDate: string,
    endDate: string
  ): Promise<TOutput[]> {
    try {
      const items = await apiClient.get<TInput[]>(config.endpoint);
      const transformed = config.transform
        ? items.map(config.transform)
        : (items as unknown as TOutput[]);
      const filtered = transformed.filter((item) => {
        const dateValue = item[config.dateField];
        if (!dateValue) return false;
        const itemDate = new Date(dateValue as string | Date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return itemDate >= start && itemDate <= end;
      });
      return filtered;
    } catch (error) {
      try {
        handleApiError(error, config.errorMessages);
      } catch {
        return [];
      }
    }
  };
}

/**
 * Configuration for creating CRUD handlers
 */
export interface CrudHandlerConfig<TInput, TOutput = TInput, TFormData = TOutput> {
  endpoint: string;
  errorMessages: {
    create: ApiErrorMessages;
    update: ApiErrorMessages;
    delete: ApiErrorMessages;
  };
  transform?: (item: TInput) => TOutput;
  buildCreateDto?: (data: TFormData) => Record<string, unknown>;
  buildUpdateDto?: (data: Partial<TFormData>) => Record<string, unknown>;
  onAfterCreate?: (entity: TOutput) => void | Promise<void>;
  onAfterUpdate?: (entity: TOutput) => void | Promise<void>;
  onAfterDelete?: () => void | Promise<void>;
}

/**
 * Create generic CRUD handlers (add/update/delete)
 */
export function createCrudHandlers<TInput, TOutput = TInput, TFormData = TOutput>(
  config: CrudHandlerConfig<TInput, TOutput, TFormData>
) {
  const add = async (data: TFormData): Promise<TOutput> => {
    try {
      const createDto = config.buildCreateDto
        ? config.buildCreateDto(data)
        : (data as Record<string, unknown>);
      const response = await apiClient.post<TInput>(config.endpoint, createDto);
      const transformed = config.transform
        ? config.transform(response)
        : (response as unknown as TOutput);
      if (config.onAfterCreate) {
        await config.onAfterCreate(transformed);
      }
      return transformed;
    } catch (error) {
      handleApiError(error, config.errorMessages.create);
    }
  };

  const update = async (id: string, data: Partial<TFormData>): Promise<TOutput> => {
    try {
      const updateDto = config.buildUpdateDto
        ? config.buildUpdateDto(data)
        : (data as Record<string, unknown>);
      const response = await apiClient.put<TInput>(`${config.endpoint}/${id}`, updateDto);
      const transformed = config.transform
        ? config.transform(response)
        : (response as unknown as TOutput);
      if (config.onAfterUpdate) {
        await config.onAfterUpdate(transformed);
      }
      return transformed;
    } catch (error) {
      handleApiError(error, config.errorMessages.update);
    }
  };

  const remove = async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`${config.endpoint}/${id}`);
      if (config.onAfterDelete) {
        await config.onAfterDelete();
      }
    } catch (error) {
      handleApiError(error, config.errorMessages.delete);
    }
  };

  return { add, update, remove };
}
