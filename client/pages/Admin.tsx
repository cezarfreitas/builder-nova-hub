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
  Layout,
  Star,
  Award,
  MessageSquare,
  Image,
  TrendingUp,
  HelpCircle,
  FileText,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Layout className="w-5 h-5" />,
    category: "main",
  },
  {
    id: "leads",
    label: "Leads",
    icon: <Users className="w-5 h-5" />,
    category: "main",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="w-5 h-5" />,
    category: "main",
  },
  // Seções da Landing Page
  {
    id: "hero",
    label: "Seção Hero",
    icon: <Star className="w-5 h-5" />,
    category: "lp",
  },
  {
    id: "benefits",
    label: "Vantagens",
    icon: <Award className="w-5 h-5" />,
    category: "lp",
  },
  {
    id: "testimonials",
    label: "Depoimentos",
    icon: <MessageSquare className="w-5 h-5" />,
    category: "lp",
  },
  {
    id: "gallery",
    label: "Galeria",
    icon: <Image className="w-5 h-5" />,
    category: "lp",
  },
  {
    id: "stats",
    label: "Estatísticas",
    icon: <TrendingUp className="w-5 h-5" />,
    category: "lp",
  },
  {
    id: "faq",
    label: "FAQ",
    icon: <HelpCircle className="w-5 h-5" />,
    category: "lp",
  },
  // Configurações
  {
    id: "design",
    label: "Design Geral",
    icon: <Palette className="w-5 h-5" />,
    category: "config",
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: <Settings className="w-5 h-5" />,
    category: "config",
  },
];

export default function Admin() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 flex items-center">
                  <Layout className="w-6 h-6 mr-2 text-ecko-red" />
                  Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Visão geral da sua plataforma Ecko.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Total de Leads</h3>
                    <p className="text-3xl font-bold text-ecko-red">127</p>
                    <p className="text-sm text-gray-500">+12% este mês</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Taxa de Conversão</h3>
                    <p className="text-3xl font-bold text-ecko-red">8.4%</p>
                    <p className="text-sm text-gray-500">+2.1% este mês</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Leads Hoje</h3>
                    <p className="text-3xl font-bold text-ecko-red">8</p>
                    <p className="text-sm text-gray-500">Meta: 10/dia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "hero":
        return (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 flex items-center">
                <Star className="w-6 h-6 mr-2 text-ecko-red" />
                Seção Hero
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gerencie o cabeçalho principal da landing page.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    defaultValue="TRANSFORME SUA PAIXÃO EM LUCRO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg h-20"
                    defaultValue="Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja!"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "benefits":
        return (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 flex items-center">
                <Award className="w-6 h-6 mr-2 text-ecko-red" />
                Vantagens Exclusivas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Configure as vantagens apresentadas aos potenciais revendedores.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Marca Internacional</h3>
                  <p className="text-sm text-gray-600">Reconhecimento mundial</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Pronta Entrega</h3>
                  <p className="text-sm text-gray-600">100k+ produtos disponíveis</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Suporte ao Lojista</h3>
                  <p className="text-sm text-gray-600">Equipe especializada</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Totalmente Online</h3>
                  <p className="text-sm text-gray-600">Plataforma de compras</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "testimonials":
        return (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-ecko-red" />
                Depoimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gerencie os depoimentos de revendedores satisfeitos.
              </p>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 bg-ecko-red rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">R</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Ricardo Silva</h4>
                      <p className="text-sm text-gray-500">Silva Streetwear</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    "Trabalhar com a Ecko mudou completamente meu negócio. As vendas triplicaram..."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "gallery":
        return (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 flex items-center">
                <Image className="w-6 h-6 mr-2 text-ecko-red" />
                Galeria de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gerencie as imagens dos produtos exibidas na galeria.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case "stats":
        return (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-ecko-red" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Configure os números de credibilidade da marca.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-3xl font-bold text-ecko-red mb-1">25+</div>
                  <div className="text-sm text-gray-600">Anos de História</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-3xl font-bold text-ecko-red mb-1">500+</div>
                  <div className="text-sm text-gray-600">Lojistas Ativos</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-3xl font-bold text-ecko-red mb-1">100K+</div>
                  <div className="text-sm text-gray-600">Produtos</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-3xl font-bold text-ecko-red mb-1">1M+</div>
                  <div className="text-sm text-gray-600">Clientes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "faq":
        return (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 flex items-center">
                <HelpCircle className="w-6 h-6 mr-2 text-ecko-red" />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gerencie as perguntas e respostas mais comuns.
              </p>
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Como me tornar um revendedor oficial da Ecko?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Para se tornar um revendedor oficial, você precisa ter CNPJ ativo...
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Qual o investimento mínimo para começar?
                  </h4>
                  <p className="text-sm text-gray-600">
                    O investimento inicial varia conforme o tipo de loja e região...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "configuracoes":
        return (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 flex items-center">
                <Settings className="w-6 h-6 mr-2 text-ecko-red" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Aqui você poderá gerenciar as configurações do sistema.
              </p>
            </CardContent>
          </Card>
        );
      case "leads":
        return (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-2 text-ecko-red" />
                Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Aqui você poderá visualizar e gerenciar os leads capturados.
              </p>
            </CardContent>
          </Card>
        );
      case "analytics":
        return (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-ecko-red" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Aqui você poderá visualizar métricas e relatórios.
              </p>
            </CardContent>
          </Card>
        );
      case "design":
        return (
          <div className="space-y-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 flex items-center">
                  <Palette className="w-6 h-6 mr-2 text-ecko-red" />
                  Design Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Customize as cores e tipografia da landing page.
                </p>

                {/* Cores da LP */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Esquema de Cores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Cor Principal */}
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-ecko-red transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Cor Principal</h4>
                        <div className="w-8 h-8 bg-ecko-red rounded-lg border-2 border-white shadow-sm"></div>
                      </div>
                      <input
                        type="color"
                        defaultValue="#dc2626"
                        className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>

                    {/* Cor Secundária */}
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-ecko-red transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Cor Secundária</h4>
                        <div className="w-8 h-8 bg-gray-900 rounded-lg border-2 border-white shadow-sm"></div>
                      </div>
                      <input
                        type="color"
                        defaultValue="#111827"
                        className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>

                    {/* Cor de Fundo */}
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-ecko-red transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Cor de Fundo</h4>
                        <div className="w-8 h-8 bg-black rounded-lg border-2 border-white shadow-sm"></div>
                      </div>
                      <input
                        type="color"
                        defaultValue="#000000"
                        className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>

                    {/* Cor do Texto */}
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-ecko-red transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Cor do Texto</h4>
                        <div className="w-8 h-8 bg-white rounded-lg border-2 border-gray-300 shadow-sm"></div>
                      </div>
                      <input
                        type="color"
                        defaultValue="#ffffff"
                        className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Tipografia */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipografia</h3>
                  <div className="space-y-4">

                    {/* Fonte Principal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fonte dos Títulos
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                        defaultValue="inter"
                      >
                        <option value="inter">Inter (Padrão)</option>
                        <option value="roboto">Roboto</option>
                        <option value="open-sans">Open Sans</option>
                        <option value="montserrat">Montserrat</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">Fonte utilizada nos títulos e headings</p>
                    </div>

                    {/* Fonte do Corpo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fonte do Texto
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red">
                        <option value="inter" selected>Inter (Padrão)</option>
                        <option value="roboto">Roboto</option>
                        <option value="open-sans">Open Sans</option>
                        <option value="source-sans">Source Sans Pro</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">Fonte utilizada no texto do corpo</p>
                    </div>
                  </div>
                </div>

                {/* Esquemas Predefinidos */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Esquemas Predefinidos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Esquema Ecko Original */}
                    <div className="p-4 border-2 border-ecko-red rounded-lg bg-ecko-red/5 cursor-pointer hover:border-ecko-red-dark transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Ecko Original</h4>
                        <div className="flex space-x-1">
                          <div className="w-4 h-4 bg-ecko-red rounded"></div>
                          <div className="w-4 h-4 bg-black rounded"></div>
                          <div className="w-4 h-4 bg-white border rounded"></div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Vermelho vibrante com preto</p>
                    </div>

                    {/* Esquema Elegante */}
                    <div className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Elegante</h4>
                        <div className="flex space-x-1">
                          <div className="w-4 h-4 bg-gray-800 rounded"></div>
                          <div className="w-4 h-4 bg-gray-600 rounded"></div>
                          <div className="w-4 h-4 bg-gray-100 border rounded"></div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Tons de cinza elegantes</p>
                    </div>

                    {/* Esquema Moderno */}
                    <div className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Moderno</h4>
                        <div className="flex space-x-1">
                          <div className="w-4 h-4 bg-blue-600 rounded"></div>
                          <div className="w-4 h-4 bg-slate-800 rounded"></div>
                          <div className="w-4 h-4 bg-white border rounded"></div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Azul moderno com slate</p>
                    </div>

                    {/* Esquema Vibrante */}
                    <div className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Vibrante</h4>
                        <div className="flex space-x-1">
                          <div className="w-4 h-4 bg-orange-500 rounded"></div>
                          <div className="w-4 h-4 bg-purple-700 rounded"></div>
                          <div className="w-4 h-4 bg-white border rounded"></div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Laranja e roxo energético</p>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <Button className="bg-ecko-red hover:bg-ecko-red-dark text-white px-6 py-3 flex-1 sm:flex-none">
                    Salvar Alterações
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 flex-1 sm:flex-none"
                  >
                    Pré-visualizar
                  </Button>
                  <Button
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50 px-6 py-3 flex-1 sm:flex-none ml-auto"
                  >
                    Restaurar Padrão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-ecko-red hover:bg-ecko-red-dark text-white p-2 shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative z-40 w-64 h-screen lg:h-auto lg:min-h-screen bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-ecko-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-lg">Ecko Admin</h1>
              <p className="text-gray-500 text-xs">Painel de Controle</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 flex flex-col">
          {/* Voltar para Home */}
          <Button
            onClick={() => window.location.href = '/'}
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors mb-4"
          >
            <Home className="w-5 h-5 mr-3" />
            Voltar para Home
          </Button>

          <div className="border-t border-gray-200 pt-4 space-y-1 flex-1 overflow-y-auto">
            {/* Seções Principais */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                Principal
              </h3>
              {sidebarItems.filter(item => item.category === "main").map((item) => (
                <Button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className={`w-full justify-start transition-all duration-200 ${
                    activeSection === item.id
                      ? "bg-ecko-red/10 text-ecko-red border-r-2 border-ecko-red font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Button>
              ))}
            </div>

            {/* Seções da Landing Page */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                Landing Page
              </h3>
              {sidebarItems.filter(item => item.category === "lp").map((item) => (
                <Button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className={`w-full justify-start transition-all duration-200 ${
                    activeSection === item.id
                      ? "bg-ecko-red/10 text-ecko-red border-r-2 border-ecko-red font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Button>
              ))}
            </div>

            {/* Configurações */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                Configurações
              </h3>
              {sidebarItems.filter(item => item.category === "config").map((item) => (
                <Button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className={`w-full justify-start transition-all duration-200 ${
                    activeSection === item.id
                      ? "bg-ecko-red/10 text-ecko-red border-r-2 border-ecko-red font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Footer da sidebar */}
          <div className="border-t border-gray-200 pt-4 mt-auto">
            <div className="text-center text-xs text-gray-400">
              <p>© 2024 Ecko Admin</p>
              <p>v1.0.0</p>
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                {sidebarItems.find(item => item.id === activeSection)?.label}
              </h2>
              <p className="text-gray-500 text-sm">
                Gerencie sua plataforma Ecko
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-gray-900 font-medium">Admin</p>
                <p className="text-gray-500 text-sm">Ecko Unlimited</p>
              </div>
              <div className="w-10 h-10 bg-ecko-red rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-[calc(100vh-80px)]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
