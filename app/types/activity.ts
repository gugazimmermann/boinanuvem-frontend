export interface ActivityLogEntry extends Record<string, unknown> {
  id: string;
  user?: string;
  action: string;
  resource: string;
  timestamp: string;
}
