export interface EmployeeObservation {
  id: string;
  employeeId: string;
  observation: string;
  fileIds?: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface EmployeeObservationFormData {
  employeeId: string;
  observation: string;
  fileIds?: string[];
}
