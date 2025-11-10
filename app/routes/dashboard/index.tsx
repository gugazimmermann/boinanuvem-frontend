import { DashboardLayout } from "../../components/dashboard";

export function meta() {
  return [
    { title: "Dashboard - Boi na Nuvem" },
    {
      name: "description",
      content: "Painel de controle do Boi na Nuvem",
    },
  ];
}

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Animais</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">1,234</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🐄</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Propriedades</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">5</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏡</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pastos</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">12</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌾</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nascimentos</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">45</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👶</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Atividades Recentes</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span>🐄</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Novo animal cadastrado</p>
              <p className="text-xs text-gray-500">Há 2 horas</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span>🌾</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Pastagem atualizada</p>
              <p className="text-xs text-gray-500">Há 5 horas</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span>👶</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Novo nascimento registrado</p>
              <p className="text-xs text-gray-500">Há 1 dia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

