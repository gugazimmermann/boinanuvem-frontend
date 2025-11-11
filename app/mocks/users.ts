import type { TeamUser } from "~/routes/dashboard/team";
import type { UserFormData } from "~/components/dashboard/team/user-form-modal";

// All users have the same password for now: Senha123! (BCrypt hashed)
// Original password: Senha123!
const DEFAULT_PASSWORD_HASH = "$2b$10$9c7eBs.MydmDkdO6SworA.ENm1i1yiT62zIzVrxJTecnU6Tl1ZhVu";

export const mockUsers: TeamUser[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Guga Zimmermann",
    cpf: "00674902980",
    email: "guga.zimmermann@gmail.com",
    password: DEFAULT_PASSWORD_HASH,
    phone: "47988704247",
    role: "admin",
    status: "active",
    street: "Rua Alexandre Fleming",
    number: "289",
    complement: "Casa",
    neighborhood: "Centro",
    city: "Itajaí",
    state: "SC",
    zipCode: "88303030",
    mainUser: true,
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    lastAccess: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Maria Santos",
    cpf: "234.567.890-11",
    email: "maria.santos@fazendasaojoao.com.br",
    password: DEFAULT_PASSWORD_HASH,
    phone: "(11) 98765-4322",
    role: "manager",
    status: "active",
    street: "Avenida Paulista",
    number: "1000",
    complement: "",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
    mainUser: false,
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    lastAccess: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Pedro Costa",
    cpf: "345.678.901-22",
    email: "pedro.costa@fazendasaojoao.com.br",
    password: DEFAULT_PASSWORD_HASH,
    phone: "(11) 98765-4323",
    role: "user",
    status: "active",
    street: "Rua Augusta",
    number: "500",
    complement: "Sala 10",
    neighborhood: "Consolação",
    city: "São Paulo",
    state: "SP",
    zipCode: "01305-000",
    mainUser: false,
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    lastAccess: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Ana Oliveira",
    cpf: "456.789.012-33",
    email: "ana.oliveira@fazendasaojoao.com.br",
    password: DEFAULT_PASSWORD_HASH,
    phone: "(11) 98765-4324",
    role: "user",
    status: "inactive",
    street: "Rua dos Três Irmãos",
    number: "200",
    complement: "",
    neighborhood: "Vila Progredior",
    city: "São Paulo",
    state: "SP",
    zipCode: "05615-190",
    mainUser: false,
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    lastAccess: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Carlos Mendes",
    cpf: "567.890.123-44",
    email: "carlos.mendes@fazendasaojoao.com.br",
    password: DEFAULT_PASSWORD_HASH,
    phone: "(11) 98765-4325",
    role: "user",
    status: "pending",
    street: "Rua Harmonia",
    number: "350",
    complement: "Casa 2",
    neighborhood: "Vila Madalena",
    city: "São Paulo",
    state: "SP",
    zipCode: "05435-000",
    mainUser: false,
    companyId: "550e8400-e29b-41d4-a716-446655440000",
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

