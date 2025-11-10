import { Link } from "react-router";
import { COLORS } from "../site/constants";
import { ROUTES } from "../../routes.config";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to={ROUTES.DASHBOARD}
              className="text-2xl font-bold"
              style={{ color: COLORS.secondary }}
            >
              Boi na Nuvem
            </Link>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700">Usuário</p>
                <p className="text-xs text-gray-500">usuario@exemplo.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

