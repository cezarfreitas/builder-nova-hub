import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Settings,
  Users,
  BarChart3,
  Palette,
  Menu,
  X,
  Home,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "configuracoes",
    label: "Configurações",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    id: "leads",
    label: "Leads",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: "design",
    label: "Design",
    icon: <Palette className="w-5 h-5" />,
  },
];

export default function Admin() {
  const [activeSection, setActiveSection] = useState("configuracoes");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case "configuracoes":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Settings className="w-6 h-6 mr-2 text-ecko-red" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Aqui você poderá gerenciar as configurações do sistema.
              </p>
            </CardContent>
          </Card>
        );
      case "leads":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Users className="w-6 h-6 mr-2 text-ecko-red" />
                Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Aqui você poderá visualizar e gerenciar os leads capturados.
              </p>
            </CardContent>
          </Card>
        );
      case "analytics":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-ecko-red" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Aqui você poderá visualizar métricas e relatórios.
              </p>
            </CardContent>
          </Card>
        );
      case "design":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Palette className="w-6 h-6 mr-2 text-ecko-red" />
                Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Aqui você poderá customizar o design da landing page.
              </p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-ecko-red hover:bg-ecko-red-dark text-white p-2"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative z-40 w-64 h-full bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-ecko-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Ecko Admin</h1>
              <p className="text-gray-400 text-xs">Painel de Controle</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {/* Voltar para Home */}
          <Button
            onClick={() => window.location.href = '/'}
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Home className="w-5 h-5 mr-3" />
            Voltar para Home
          </Button>

          <div className="border-t border-gray-800 pt-4 mt-4">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMobileMenuOpen(false);
                }}
                variant="ghost"
                className={`w-full justify-start transition-all duration-200 ${
                  activeSection === item.id
                    ? "bg-ecko-red/20 text-ecko-red border-r-2 border-ecko-red"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Button>
            ))}
          </div>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 ml-0">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12">
              <h2 className="text-xl lg:text-2xl font-bold text-white">
                {sidebarItems.find(item => item.id === activeSection)?.label}
              </h2>
              <p className="text-gray-400 text-sm">
                Gerencie sua plataforma Ecko
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-white font-medium">Admin</p>
                <p className="text-gray-400 text-sm">Ecko Unlimited</p>
              </div>
              <div className="w-10 h-10 bg-ecko-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-6 space-y-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
