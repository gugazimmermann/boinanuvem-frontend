export interface CashFlowObservation extends Record<string, unknown> {
  id: string;
  cashFlowId: string;
  observation: string;
  fileIds?: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface CashFlowObservationFormData {
  cashFlowId: string;
  observation: string;
  fileIds?: string[];
}
