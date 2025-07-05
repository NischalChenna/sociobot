import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, User, Settings, Home, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              >
                SocioBot
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>

              <Link
                to="/generate"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/generate")
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.businessProfile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.subscription.plan} plan
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
