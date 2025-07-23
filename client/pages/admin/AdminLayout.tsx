import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Settings,
  Users,
  BarChart3,
  Palette,
  Menu,
  X,
  Home,
  Layout,
  Star,
  Award,
  MessageSquare,
  Image,
  TrendingUp,
  HelpCircle,
  FileText,
  Search,
  Webhook,
  Database,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: JSX.Element;
  category: "main" | "lp" | "config";
  path: string;
}

const sidebarItems: SidebarItem[] = [
  // Seções Principais
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="w-5 h-5" />,
    category: "main",
    path: "/admin/dashboard",
  },
  {
    id: "leads",
    label: "Leads",
    icon: <Users className="w-5 h-5" />,
    category: "main",
    path: "/admin/leads",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="w-5 h-5" />,
    category: "main",
    path: "/admin/analytics",
  },
  // Seções da Landing Page
  {
    id: "hero",
    label: "Seção Hero",
    icon: <Star className="w-5 h-5" />,
    category: "lp",
    path: "/admin/hero",
  },
  {
    id: "benefits",
    label: "Vantagens",
    icon: <Award className="w-5 h-5" />,
    category: "lp",
    path: "/admin/benefits",
  },
  {
    id: "testimonials",
    label: "Depoimentos",
    icon: <MessageSquare className="w-5 h-5" />,
    category: "lp",
    path: "/admin/testimonials",
  },
  {
    id: "gallery",
    label: "Galeria",
    icon: <Image className="w-5 h-5" />,
    category: "lp",
    path: "/admin/gallery",
  },
  {
    id: "stats",
    label: "Estatísticas",
    icon: <TrendingUp className="w-5 h-5" />,
    category: "lp",
    path: "/admin/stats",
  },
  {
    id: "faq",
    label: "FAQ",
    icon: <HelpCircle className="w-5 h-5" />,
    category: "lp",
    path: "/admin/faq",
  },
  // Configurações
  {
    id: "configuracoes",
    label: "Configurações",
    icon: <Settings className="w-5 h-5" />,
    category: "config",
    path: "/admin/configuracoes",
  },
];

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentPath = location.pathname;
  const activeSection = sidebarItems.find(item => item.path === currentPath)?.id || "dashboard";

  const getItemsByCategory = (category: SidebarItem["category"]) =>
    sidebarItems.filter((item) => item.category === category);

  const renderSidebarGroup = (
    title: string,
    items: SidebarItem[],
    className = ""
  ) => (
    <div className={className}>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <nav className="space-y-0.5">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`group flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              activeSection === item.id
                ? "bg-ecko-red text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-ecko-red"
            }`}
          >
            <span
              className={`mr-2 transition-colors duration-200 ${
                activeSection === item.id
                  ? "text-white"
                  : "text-gray-400 group-hover:text-ecko-red"
              }`}
            >
              {React.cloneElement(item.icon, { className: "w-4 h-4" })}
            </span>
            <span className="truncate">{item.label}</span>
            {activeSection === item.id && (
              <div className="ml-auto w-1 h-4 bg-white rounded-full"></div>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-4 pb-3 overflow-y-auto">
            {/* Logo/Header */}
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-ecko-red to-red-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <div className="ml-2">
                  <h1 className="text-lg font-bold text-gray-900">
                    Ecko Admin
                  </h1>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex-grow flex flex-col px-4">
              {renderSidebarGroup(
                "Principal",
                getItemsByCategory("main"),
                "mb-8"
              )}
              {renderSidebarGroup(
                "Landing Page",
                getItemsByCategory("lp"),
                "mb-8"
              )}
              {renderSidebarGroup(
                "Sistema",
                getItemsByCategory("config")
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">
                    CF
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Cezar Freitas
                  </p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="ml-2 text-lg font-semibold text-gray-900">
              Ecko Admin
            </h1>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="w-8 h-8 bg-ecko-red rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  Ecko Admin
                </span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      activeSection === item.id
                        ? "bg-ecko-red text-white"
                        : "text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex-1 relative z-0 flex overflow-hidden">
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none xl:order-last">
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
