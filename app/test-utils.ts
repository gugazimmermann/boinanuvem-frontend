// Test utility types to avoid using 'any' in tests

export type MockFunction<T extends (...args: unknown[]) => unknown> = T;

export interface MockComponentProps {
  [key: string]: unknown;
  children?: React.ReactNode;
  label?: string;
  placeholder?: string;
  value?: string | number | string[];
  onChange?: (value: unknown) => void;
  onClick?: () => void;
  type?: string;
  disabled?: boolean;
  variant?: string;
  name?: string;
  options?: Array<{ value: string; label: string }>;
  title?: string;
  columns?: Array<{
    key: string;
    label: string;
    render?: (value: unknown, row: unknown, index: number) => React.ReactNode;
  }>;
  data?: unknown[];
  search?: { placeholder?: string; value: string; onChange: (value: string) => void };
  pagination?: { currentPage: number; totalPages: number };
  emptyState?: { title?: string };
  slim?: boolean;
}
