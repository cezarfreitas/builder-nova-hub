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
  Search,
  Webhook,
  Database,
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
  const [activeConfigTab, setActiveConfigTab] = useState("seo");

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
          <div className="space-y-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 flex items-center">
                  <Settings className="w-6 h-6 mr-2 text-ecko-red" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Gerencie as configurações avançadas da plataforma.
                </p>

                {/* Abas de Configuração */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveConfigTab("seo")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeConfigTab === "seo"
                          ? "border-ecko-red text-ecko-red"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Search className="w-4 h-4 mr-2 inline" />
                      SEO
                    </button>
                    <button
                      onClick={() => setActiveConfigTab("webhook")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeConfigTab === "webhook"
                          ? "border-ecko-red text-ecko-red"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Webhook className="w-4 h-4 mr-2 inline" />
                      Webhook
                    </button>
                    <button
                      onClick={() => setActiveConfigTab("database")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeConfigTab === "database"
                          ? "border-ecko-red text-ecko-red"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Database className="w-4 h-4 mr-2 inline" />
                      Banco de Dados
                    </button>
                  </nav>
                </div>

                {/* Conteúdo das Abas */}
                {activeConfigTab === "seo" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Configurações de SEO</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título da Página (Title Tag)
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                          defaultValue="Seja uma Revenda Autorizada da Ecko | Tenha os Melhores Produtos"
                        />
                        <p className="text-xs text-gray-500 mt-1">Máximo 60 caracteres</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Keywords
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                          defaultValue="revenda autorizada ecko, melhores produtos streetwear, lojista autorizado"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separadas por vírgula</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Description
                        </label>
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red h-20"
                          defaultValue="Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja. Transforme sua paixão em lucro com exclusividade territorial e suporte completo."
                        />
                        <p className="text-xs text-gray-500 mt-1">Máximo 160 caracteres</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL Canônica
                        </label>
                        <input
                          type="url"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                          defaultValue="https://revendedores.ecko.com.br/"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Imagem Open Graph
                        </label>
                        <input
                          type="url"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                          defaultValue="https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeConfigTab === "webhook" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Configurações de Webhook</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL do Webhook para Leads
                        </label>
                        <input
                          type="url"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                          placeholder="https://seu-webhook.com/leads"
                        />
                        <p className="text-xs text-gray-500 mt-1">Será chamado quando um novo lead for capturado</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secret Token
                        </label>
                        <input
                          type="password"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                          placeholder="Token de segurança"
                        />
                        <p className="text-xs text-gray-500 mt-1">Token para validar as requisições</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Timeout (segundos)
                          </label>
                          <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                            defaultValue="30"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tentativas
                          </label>
                          <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                            defaultValue="3"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Teste de Webhook</h4>
                        <p className="text-sm text-gray-600 mb-3">Envie um payload de teste para verificar a configuração</p>
                        <Button variant="outline" className="border-ecko-red text-ecko-red hover:bg-ecko-red hover:text-white">
                          Testar Webhook
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeConfigTab === "database" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Configurações do Banco de Dados</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Host do Banco
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                          defaultValue="localhost"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Porta
                        </label>
                        <input
                          type="number"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                          defaultValue="5432"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome do Banco
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                          defaultValue="ecko_leads"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Usuário
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                          defaultValue="postgres"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          String de Conexão
                        </label>
                        <input
                          type="password"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                          placeholder="postgresql://user:password@host:port/database"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-900 mb-1">Status da Conexão</h4>
                        <p className="text-sm text-green-700">✅ Conectado</p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-1">Leads Armazenados</h4>
                        <p className="text-sm text-blue-700">127 registros</p>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-900 mb-1">Último Backup</h4>
                        <p className="text-sm text-yellow-700">Hoje, 08:30</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                        Testar Conexão
                      </Button>
                      <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                        Fazer Backup
                      </Button>
                    </div>
                  </div>
                )}

                {/* Ações Globais */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Button className="bg-ecko-red hover:bg-ecko-red-dark text-white px-6 py-3">
                    Salvar Configurações
                  </Button>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
          <div className="space-y-6">
            {/* Header com período */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-gray-900 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2 text-ecko-red" />
                    Analytics da Landing Page
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <select className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ecko-red focus:border-ecko-red">
                      <option value="7">Últimos 7 dias</option>
                      <option value="30" selected>Últimos 30 dias</option>
                      <option value="90">Últimos 90 dias</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Acompanhe o desempenho da sua landing page de revendedores Ecko.
                </p>
              </CardContent>
            </Card>

            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Visitantes Únicos</p>
                      <div className="flex items-center">
                        <p className="text-2xl font-bold text-gray-900">3,547</p>
                        <p className="ml-2 text-sm text-green-600">+12.5%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Leads Convertidos</p>
                      <div className="flex items-center">
                        <p className="text-2xl font-bold text-gray-900">127</p>
                        <p className="ml-2 text-sm text-green-600">+8.3%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                      <div className="flex items-center">
                        <p className="text-2xl font-bold text-gray-900">3.58%</p>
                        <p className="ml-2 text-sm text-green-600">+0.4%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                      <div className="flex items-center">
                        <p className="text-2xl font-bold text-gray-900">4:32</p>
                        <p className="ml-2 text-sm text-green-600">+15s</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversões por Dia */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Conversões dos Últimos 7 Dias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { day: 'Seg', leads: 18, visits: 520 },
                      { day: 'Ter', leads: 22, visits: 645 },
                      { day: 'Qua', leads: 15, visits: 498 },
                      { day: 'Qui', leads: 28, visits: 712 },
                      { day: 'Sex', leads: 25, visits: 689 },
                      { day: 'Sáb', leads: 12, visits: 345 },
                      { day: 'Dom', leads: 8, visits: 287 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 w-8">{item.day}</span>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                                <div
                                  className="bg-ecko-red h-2 rounded-full"
                                  style={{ width: `${(item.leads / 30) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 min-w-[3rem]">{item.leads} leads</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-1 mr-4">
                                <div
                                  className="bg-gray-400 h-1 rounded-full"
                                  style={{ width: `${(item.visits / 800) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 min-w-[3rem]">{item.visits} visitas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Fontes de Tráfego */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Fontes de Tráfego</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { source: 'Google Orgânico', visits: 1423, percentage: 40.1, color: 'bg-blue-500' },
                      { source: 'Google Ads', visits: 891, percentage: 25.1, color: 'bg-green-500' },
                      { source: 'Facebook', visits: 567, percentage: 16.0, color: 'bg-blue-600' },
                      { source: 'Instagram', visits: 445, percentage: 12.5, color: 'bg-pink-500' },
                      { source: 'Direto', visits: 221, percentage: 6.3, color: 'bg-gray-500' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                          <span className="text-sm font-medium text-gray-900 flex-1">{item.source}</span>
                          <span className="text-sm text-gray-600 mr-4">{item.visits}</span>
                          <span className="text-sm font-medium text-gray-900 min-w-[3rem]">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dispositivos e Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Dispositivos */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Dispositivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-900">Mobile</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">68.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-900">Desktop</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">26.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        <span className="text-sm text-gray-900">Tablet</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">4.7%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Formulário */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Performance do Formulário</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Formulários iniciados</span>
                      <span className="text-sm font-medium text-gray-900">412</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Formulários abandonados</span>
                      <span className="text-sm font-medium text-red-600">285</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Formulários concluídos</span>
                      <span className="text-sm font-medium text-green-600">127</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Taxa de conclusão</span>
                        <span className="text-sm font-bold text-ecko-red">30.8%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Páginas */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Seções Mais Visitadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">Hero/Formulário</span>
                      <span className="text-sm font-medium text-gray-900">100%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">Vantagens</span>
                      <span className="text-sm font-medium text-gray-900">78.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">Depoimentos</span>
                      <span className="text-sm font-medium text-gray-900">65.4%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">FAQ</span>
                      <span className="text-sm font-medium text-gray-900">42.1%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">Galeria</span>
                      <span className="text-sm font-medium text-gray-900">38.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-ecko-red hover:bg-ecko-red-dark text-white px-6 py-3">
                    Exportar Relatório
                  </Button>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3">
                    Configurar Google Analytics
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 px-6 py-3">
                    Atualizar Dados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                        defaultValue="inter"
                      >
                        <option value="inter">Inter (Padrão)</option>
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
