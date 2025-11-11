import type { TeamUser } from "~/routes/dashboard/team";
import type { UserFormData } from "~/components/dashboard/team/user-form-modal";

export const mockUsers: TeamUser[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@fazendasaojoao.com.br",
    phone: "(11) 98765-4321",
    role: "admin",
    status: "active",
    lastAccess: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@fazendasaojoao.com.br",
    phone: "(11) 98765-4322",
    role: "manager",
    status: "active",
    lastAccess: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro.costa@fazendasaojoao.com.br",
    phone: "(11) 98765-4323",
    role: "user",
    status: "active",
    lastAccess: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "Ana Oliveira",
    email: "ana.oliveira@fazendasaojoao.com.br",
    phone: "(11) 98765-4324",
    role: "user",
    status: "inactive",
    lastAccess: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    name: "Carlos Mendes",
    email: "carlos.mendes@fazendasaojoao.com.br",
    phone: "(11) 98765-4325",
    role: "user",
    status: "pending",
  },
];

export function getUserById(userId: string | undefined): TeamUser | undefined {
  if (!userId) return undefined;
  return mockUsers.find((user) => user.id === userId);
}

export function updateUser(userId: string, data: UserFormData): void {
  const userIndex = mockUsers.findIndex((user) => user.id === userId);
  if (userIndex !== -1) {
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...data,
      password: undefined,
      confirmPassword: undefined,
    };
  }
}

