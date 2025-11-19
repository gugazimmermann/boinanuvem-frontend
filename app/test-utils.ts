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

import type { TeamUser } from "~/types";
import type { UserPermissions } from "~/types/permissions";
import { defaultPermissions } from "~/types/permissions";
import { vi } from "vitest";

export function createMockUser(
  overrides: Partial<TeamUser> & {
    mainUser?: boolean;
    permissions?: UserPermissions;
  } = {}
): TeamUser {
  const { mainUser = false, permissions = defaultPermissions, ...userOverrides } = overrides;

  return {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    phone: "1234567890",
    status: "active",
    companyId: "company-id",
    createdAt: "2025-01-01",
    mainUser,
    permissions,
    ...userOverrides,
  } as TeamUser;
}

export function createMockMainUser(overrides: Partial<TeamUser> = {}): TeamUser {
  return createMockUser({
    id: "main-user-id",
    name: "Main User",
    email: "main@example.com",
    mainUser: true,
    ...overrides,
  });
}

export function createMockTeamUser(
  permissions: Partial<UserPermissions> = {},
  overrides: Partial<TeamUser> = {}
): TeamUser {
  const mergedPermissions: UserPermissions = {
    ...defaultPermissions,
    ...permissions,
    registration: {
      ...defaultPermissions.registration,
      ...permissions.registration,
    },
    records: {
      ...defaultPermissions.records,
      ...permissions.records,
    },
    breedings: {
      ...defaultPermissions.breedings,
      ...permissions.breedings,
    },
    finances: {
      ...defaultPermissions.finances,
      ...permissions.finances,
    },
  };

  return createMockUser({
    id: "team-user-id",
    name: "Team User",
    email: "team@example.com",
    mainUser: false,
    permissions: mergedPermissions,
    ...overrides,
  });
}

export function createMockViewOnlyUser(
  section: keyof UserPermissions,
  resource: string,
  overrides: Partial<TeamUser> = {}
): TeamUser {
  const permissions: UserPermissions = {
    ...defaultPermissions,
    [section]: {
      ...defaultPermissions[section],
      [resource]: {
        view: true,
        add: false,
        edit: false,
        remove: false,
      },
    },
  } as UserPermissions;

  return createMockTeamUser(permissions, overrides);
}

export function createMockUsePermissions(
  overrides: {
    canView?: (section: string, resource: string) => boolean;
    canAdd?: (section: string, resource: string) => boolean;
    canEdit?: (section: string, resource: string) => boolean;
    canRemove?: (section: string, resource: string) => boolean;
    isMainUser?: () => boolean;
  } = {}
) {
  const defaultCanView = (_section: string, _resource: string) => true;
  const defaultCanAdd = (_section: string, _resource: string) => true;
  const defaultCanEdit = (_section: string, _resource: string) => true;
  const defaultCanRemove = (_section: string, _resource: string) => true;
  const defaultIsMainUser = () => true;

  return {
    canView: overrides.canView || defaultCanView,
    canAdd: overrides.canAdd || defaultCanAdd,
    canEdit: overrides.canEdit || defaultCanEdit,
    canRemove: overrides.canRemove || defaultCanRemove,
    isMainUser: overrides.isMainUser || defaultIsMainUser,
  };
}

export function mockUsePermissions(
  overrides: {
    canView?: (section: string, resource: string) => boolean;
    canAdd?: (section: string, resource: string) => boolean;
    canEdit?: (section: string, resource: string) => boolean;
    canRemove?: (section: string, resource: string) => boolean;
    isMainUser?: () => boolean;
  } = {}
) {
  const mockPermissions = createMockUsePermissions(overrides);
  return vi.fn(() => mockPermissions);
}

export function setCurrentUserId(userId: string | null) {
  if (typeof window !== "undefined") {
    if (userId) {
      localStorage.setItem("currentUserId", userId);
    } else {
      localStorage.removeItem("currentUserId");
    }
  }
}

export function clearLocalStorage() {
  if (typeof window !== "undefined") {
    localStorage.clear();
  }
}

export function createResourcePermissions(view = false, add = false, edit = false, remove = false) {
  return { view, add, edit, remove };
}

export function createSectionResourcePermissions(
  section: keyof UserPermissions,
  resource: string,
  view = false,
  add = false,
  edit = false,
  remove = false
): Partial<UserPermissions> {
  return {
    [section]: {
      ...defaultPermissions[section],
      [resource]: createResourcePermissions(view, add, edit, remove),
    },
  } as Partial<UserPermissions>;
}
