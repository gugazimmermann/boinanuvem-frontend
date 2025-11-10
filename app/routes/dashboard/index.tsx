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
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total de Animais</p>
              <p className="text-xl font-bold text-gray-900 mt-1">1,234</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🐄</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Propriedades</p>
              <p className="text-xl font-bold text-gray-900 mt-1">5</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🏡</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Pastos</p>
              <p className="text-xl font-bold text-gray-900 mt-1">12</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🌾</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Nascimentos</p>
              <p className="text-xl font-bold text-gray-900 mt-1">45</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">👶</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Atividades Recentes</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm">🐄</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900">Novo animal cadastrado</p>
              <p className="text-xs text-gray-500">Há 2 horas</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-sm">🌾</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900">Pastagem atualizada</p>
              <p className="text-xs text-gray-500">Há 5 horas</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-sm">👶</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900">Novo nascimento registrado</p>
              <p className="text-xs text-gray-500">Há 1 dia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

