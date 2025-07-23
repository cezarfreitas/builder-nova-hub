import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { SeoImageUpload } from "../components/SeoImageUpload";
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
                  <div className="space-y-8">
                    <h3 className="text-lg font-semibold text-gray-900">Configurações de SEO</h3>

                    {/* SEO Básico */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-ecko-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        SEO Básico
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título da Página (Title Tag)
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                            defaultValue="Seja uma Revenda Autorizada da Ecko | Tenha os Melhores Produtos"
                            maxLength={60}
                          />
                          <div className="flex justify-between mt-1">
                            <p className="text-xs text-gray-500">Máximo 60 caracteres</p>
                            <p className="text-xs text-gray-400">56/60</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Keywords
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                            defaultValue="revenda autorizada ecko, melhores produtos streetwear, lojista autorizado"
                            placeholder="palavra1, palavra2, palavra3"
                          />
                          <p className="text-xs text-gray-500 mt-1">Separadas por vírgula</p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Description
                          </label>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red h-20 resize-none"
                            defaultValue="Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja. Transforme sua paixão em lucro com exclusividade territorial e suporte completo."
                            maxLength={160}
                          />
                          <div className="flex justify-between mt-1">
                            <p className="text-xs text-gray-500">Máximo 160 caracteres</p>
                            <p className="text-xs text-gray-400">156/160</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL Canônica
                          </label>
                          <input
                            type="url"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                            defaultValue="https://revendedores.ecko.com.br/"
                            placeholder="https://exemplo.com/"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Robots Meta Tag
                          </label>
                          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red">
                            <option value="index,follow">Index, Follow (Padrão)</option>
                            <option value="noindex,follow">No Index, Follow</option>
                            <option value="index,nofollow">Index, No Follow</option>
                            <option value="noindex,nofollow">No Index, No Follow</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Open Graph / Facebook */}
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook / Open Graph
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título Open Graph
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                            defaultValue="Seja uma Revenda Autorizada da Ecko"
                            placeholder="Título para redes sociais"
                          />
                          <p className="text-xs text-gray-500 mt-1">Pode ser diferente do title da página</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Conteúdo
                          </label>
                          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red">
                            <option value="website">Website</option>
                            <option value="article">Artigo</option>
                            <option value="product">Produto</option>
                            <option value="business.business">Negócio</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição Open Graph
                          </label>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red h-20 resize-none"
                            defaultValue="Transforme sua paixão em lucro! Seja um revendedor autorizado Ecko e tenha acesso aos melhores produtos de streetwear do mercado."
                            placeholder="Descrição para redes sociais"
                          />
                          <p className="text-xs text-gray-500 mt-1">Pode ser diferente da meta description</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Site Name
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                            defaultValue="Ecko Revendedores"
                            placeholder="Nome do seu site"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Facebook App ID
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                            placeholder="1234567890123456"
                          />
                          <p className="text-xs text-gray-500 mt-1">ID do aplicativo Facebook</p>
                        </div>

                        {/* Upload de Imagem Open Graph */}
                        <div className="md:col-span-2">
                          <SeoImageUpload
                            currentImage="https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png"
                            onImageChange={(imageUrl) => {
                              console.log('Nova imagem OG:', imageUrl);
                              // Aqui você salvaria a configuração
                            }}
                            label="Imagem Open Graph"
                            description="1200x630px • Recomendado para redes sociais"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Twitter Cards */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        Twitter Cards
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Card
                          </label>
                          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red">
                            <option value="summary_large_image">Summary Large Image</option>
                            <option value="summary">Summary</option>
                            <option value="app">App</option>
                            <option value="player">Player</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Twitter Handle (@)
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                            placeholder="@eckooficial"
                            defaultValue="@eckooficial"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título Twitter
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                            defaultValue="Seja uma Revenda Autorizada da Ecko"
                            placeholder="Título para Twitter"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Criador (@)
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                            placeholder="@criadordoconteudo"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Schema.org / Dados Estruturados */}
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Dados Estruturados (Schema.org)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Organização
                          </label>
                          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red">
                            <option value="Organization">Organização</option>
                            <option value="Corporation">Corporação</option>
                            <option value="LocalBusiness">Negócio Local</option>
                            <option value="Store">Loja</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome da Empresa
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                            defaultValue="Ecko Unlimited"
                            placeholder="Nome oficial da empresa"
                          />
                        </div>

                        <div>
                          <SeoImageUpload
                            currentImage=""
                            onImageChange={(imageUrl) => {
                              console.log('Nova logo da empresa:', imageUrl);
                              // Aqui você salvaria a configuração
                            }}
                            label="Logo da Empresa"
                            description="Formato quadrado recomendado (ex: 500x500px)"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefone Principal
                          </label>
                          <input
                            type="tel"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
                            placeholder="+55 11 1234-5678"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                      <Button
                        className="bg-ecko-red hover:bg-ecko-red-dark text-white px-8 py-3 text-base font-medium"
                        onClick={() => {
                          // Aqui você coletaria todos os dados do formulário e salvaria
                          console.log('Salvando configurações de SEO...');
                          // Implementar chamada para API /api/settings
                        }}
                      >
                        Salvar Configurações SEO
                      </Button>
                      <Button
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 px-6 py-3"
                        onClick={() => {
                          // Preview das meta tags
                          console.log('Visualizando preview...');
                        }}
                      >
                        Visualizar Preview
                      </Button>
                      <Button
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50 px-6 py-3"
                        onClick={() => {
                          // Teste das meta tags
                          window.open('https://developers.facebook.com/tools/debug/', '_blank');
                        }}
                      >
                        Testar no Facebook
                      </Button>
                      <Button
                        variant="outline"
                        className="border-orange-300 text-orange-700 hover:bg-orange-50 px-6 py-3 sm:ml-auto"
                        onClick={() => {
                          // Restaurar configurações padrão
                          if (confirm('Tem certeza que deseja restaurar as configurações padrão de SEO?')) {
                            console.log('Restaurando configurações padrão...');
                          }
                        }}
                      >
                        Restaurar Padrão
                      </Button>
                    </div>

                    {/* Aviso sobre indexação */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <svg className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h3 className="text-sm font-medium text-yellow-800">
                            Dica de SEO
                          </h3>
                          <p className="mt-1 text-sm text-yellow-700">
                            Após salvar as configurações, pode levar algumas horas para que os motores de busca indexem as novas meta tags.
                            Use as ferramentas de teste para verificar se tudo está configurado corretamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeConfigTab === "webhook" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Configuraç��es de Webhook</h3>

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
          <div className="space-y-6">
            {/* Header com estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                      <p className="text-2xl font-bold text-gray-900">298</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Leads Únicos</p>
                      <p className="text-2xl font-bold text-gray-900">245</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Duplicados</p>
                      <p className="text-2xl font-bold text-gray-900">53</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-ecko-red/10 rounded-lg">
                      <svg className="w-6 h-6 text-ecko-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Erros Webhook</p>
                      <p className="text-2xl font-bold text-gray-900">8</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros e Ações */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex gap-3">
                    <select className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ecko-red focus:border-ecko-red">
                      <option>Todos os leads</option>
                      <option>Leads únicos</option>
                      <option>Leads duplicados</option>
                      <option>Com erro no webhook</option>
                    </select>

                    <select className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ecko-red focus:border-ecko-red">
                      <option>Últimos 30 dias</option>
                      <option>Últimos 7 dias</option>
                      <option>Hoje</option>
                      <option>Este mês</option>
                    </select>
                  </div>

                  <div className="flex gap-3 sm:ml-auto">
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                      Exportar CSV
                    </Button>
                    <Button className="bg-ecko-red hover:bg-ecko-red-dark text-white">
                      Reenviar Todos Webhooks
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Leads */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-ecko-red" />
                  Lista de Leads
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lead
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Webhook
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        {
                          id: 1,
                          nome: 'Carlos Silva',
                          email: 'carlos.silva@email.com',
                          telefone: '(11) 99999-9999',
                          cidade: 'São Paulo - SP',
                          tipo: 'unique',
                          webhook: 'success',
                          webhookResponse: '200 - OK',
                          data: '2024-01-15 14:30'
                        },
                        {
                          id: 2,
                          nome: 'Maria Santos',
                          email: 'maria.santos@email.com',
                          telefone: '(21) 98888-8888',
                          cidade: 'Rio de Janeiro - RJ',
                          tipo: 'duplicate',
                          webhook: 'success',
                          webhookResponse: '200 - OK',
                          data: '2024-01-15 13:20'
                        },
                        {
                          id: 3,
                          nome: 'João Oliveira',
                          email: 'joao.oliveira@email.com',
                          telefone: '(31) 97777-7777',
                          cidade: 'Belo Horizonte - MG',
                          tipo: 'unique',
                          webhook: 'error',
                          webhookResponse: '500 - Server Error',
                          data: '2024-01-15 12:45'
                        },
                        {
                          id: 4,
                          nome: 'Ana Costa',
                          email: 'ana.costa@email.com',
                          telefone: '(51) 96666-6666',
                          cidade: 'Porto Alegre - RS',
                          tipo: 'unique',
                          webhook: 'pending',
                          webhookResponse: 'Aguardando...',
                          data: '2024-01-15 11:15'
                        },
                        {
                          id: 5,
                          nome: 'Pedro Martins',
                          email: 'pedro.martins@email.com',
                          telefone: '(85) 95555-5555',
                          cidade: 'Fortaleza - CE',
                          tipo: 'duplicate',
                          webhook: 'success',
                          webhookResponse: '200 - OK',
                          data: '2024-01-15 10:30'
                        },
                        {
                          id: 6,
                          nome: 'Lucia Ferreira',
                          email: 'lucia.ferreira@email.com',
                          telefone: '(62) 94444-4444',
                          cidade: 'Goiânia - GO',
                          tipo: 'unique',
                          webhook: 'error',
                          webhookResponse: '404 - Not Found',
                          data: '2024-01-15 09:20'
                        }
                      ].map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-ecko-red flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {lead.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{lead.nome}</div>
                                <div className="text-sm text-gray-500">{lead.cidade}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{lead.email}</div>
                            <div className="text-sm text-gray-500">{lead.telefone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.tipo === 'unique' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Único
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Duplicado
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {lead.webhook === 'success' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Sucesso
                                </span>
                              )}
                              {lead.webhook === 'error' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Erro
                                </span>
                              )}
                              {lead.webhook === 'pending' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Pendente
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{lead.webhookResponse}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lead.data}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="Reenviar Webhook"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                              <button
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                title="Ver Detalhes"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Excluir Lead"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <Button variant="outline" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Anterior
                      </Button>
                      <Button variant="outline" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Próximo
                      </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Mostrando <span className="font-medium">1</span> a <span className="font-medium">6</span> de{' '}
                          <span className="font-medium">298</span> resultados
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <Button variant="outline" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </Button>
                          <Button className="bg-ecko-red border-ecko-red text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                            1
                          </Button>
                          <Button variant="outline" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                            2
                          </Button>
                          <Button variant="outline" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                            3
                          </Button>
                          <Button variant="outline" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </Button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-6">
            {/* Status do Pixel */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-ecko-red" />
                  Analytics - Pixel de Rastreamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Facebook Pixel</p>
                      <p className="text-xs text-green-700">Ativo • ID: 1234567890</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Google Analytics</p>
                      <p className="text-xs text-blue-700">Ativo • GA4: G-XXXXXXXXXX</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-purple-900">Google Tag Manager</p>
                      <p className="text-xs text-purple-700">Ativo • GTM-XXXXXXX</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas Principais do Pixel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white shadow-lg border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Page Views</p>
                      <p className="text-3xl font-bold text-gray-900">8,247</p>
                      <div className="flex items-center mt-2">
                        <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span className="text-sm text-green-600 font-medium">+18.2% últimos 7 dias</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-l-4 border-l-yellow-500 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Eventos ViewContent</p>
                      <p className="text-3xl font-bold text-gray-900">3,921</p>
                      <div className="flex items-center mt-2">
                        <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span className="text-sm text-green-600 font-medium">+12.8% últimos 7 dias</span>
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-l-4 border-l-green-500 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Eventos Lead</p>
                      <p className="text-3xl font-bold text-gray-900">298</p>
                      <div className="flex items-center mt-2">
                        <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span className="text-sm text-green-600 font-medium">+24.3% últimos 7 dias</span>
                      </div>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-l-4 border-l-ecko-red hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Taxa de Conversão</p>
                      <p className="text-3xl font-bold text-gray-900">7.6%</p>
                      <div className="flex items-center mt-2">
                        <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span className="text-sm text-green-600 font-medium">+1.4% últimos 7 dias</span>
                      </div>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-ecko-red" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Funil de Conversão baseado no Pixel */}
            <Card className="bg-white shadow-lg border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-ecko-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Funil de Conversão (Eventos do Pixel)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white font-bold text-sm">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900">PageView</h4>
                          <p className="text-sm text-blue-700">Visitaram a landing page</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-900">3,921</p>
                        <p className="text-sm text-blue-700">100%</p>
                      </div>
                    </div>
                    <div className="absolute left-6 top-full w-0.5 h-4 bg-gray-300"></div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white font-bold text-sm">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-yellow-900">ViewContent</h4>
                          <p className="text-sm text-yellow-700">Leram o conteúdo (scroll 50%)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-yellow-900">2,856</p>
                        <p className="text-sm text-yellow-700">72.8%</p>
                      </div>
                    </div>
                    <div className="absolute left-6 top-full w-0.5 h-4 bg-gray-300"></div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white font-bold text-sm">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-orange-900">InitiateCheckout</h4>
                          <p className="text-sm text-orange-700">Começaram a preencher formulário</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-900">891</p>
                        <p className="text-sm text-orange-700">22.7%</p>
                      </div>
                    </div>
                    <div className="absolute left-6 top-full w-0.5 h-4 bg-gray-300"></div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white font-bold text-sm">4</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900">Lead</h4>
                          <p className="text-sm text-green-700">Enviaram o formulário completo</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-900">298</p>
                        <p className="text-sm text-green-700">7.6%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Análise Temporal e Geolocalização */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Horários de Pico */}
              <Card className="bg-white shadow-lg border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-ecko-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Horários de Maior Conversão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { time: '09:00 - 11:00', events: 89, conversions: 12, rate: 13.5 },
                      { time: '14:00 - 16:00', events: 124, conversions: 18, rate: 14.5 },
                      { time: '19:00 - 21:00', events: 156, conversions: 28, rate: 17.9 },
                      { time: '21:00 - 23:00', events: 98, conversions: 15, rate: 15.3 },
                      { time: '23:00 - 01:00', events: 67, conversions: 8, rate: 11.9 }
                    ].map((item, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{item.time}</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">{item.conversions} leads</span>
                            <span className="text-sm font-bold text-ecko-red">{item.rate}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-ecko-red h-2 rounded-full"
                            style={{ width: `${(item.rate / 20) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Localização dos Usuários */}
              <Card className="bg-white shadow-lg border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-ecko-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Top Regiões (Leads)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { city: 'São Paulo - SP', leads: 89, percentage: 29.9 },
                      { city: 'Rio de Janeiro - RJ', leads: 67, percentage: 22.5 },
                      { city: 'Belo Horizonte - MG', leads: 43, percentage: 14.4 },
                      { city: 'Porto Alegre - RS', leads: 28, percentage: 9.4 },
                      { city: 'Brasília - DF', leads: 24, percentage: 8.1 },
                      { city: 'Outras Cidades', leads: 47, percentage: 15.7 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-ecko-red rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-900">{item.city}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">{item.leads}</span>
                          <span className="text-sm font-medium text-gray-900 min-w-[3rem]">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Eventos Customizados do Pixel */}
            <Card className="bg-white shadow-lg border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-ecko-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Eventos Customizados (Últimos 7 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Scroll 25%</h4>
                    <p className="text-2xl font-bold text-blue-900">3,421</p>
                    <p className="text-sm text-blue-700">87.2% dos visitantes</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-2">Clique WhatsApp</h4>
                    <p className="text-2xl font-bold text-yellow-900">567</p>
                    <p className="text-sm text-yellow-700">14.5% dos visitantes</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">Tempo 2min+</h4>
                    <p className="text-2xl font-bold text-green-900">1,892</p>
                    <p className="text-sm text-green-700">48.3% dos visitantes</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-2">FAQ Expandido</h4>
                    <p className="text-2xl font-bold text-purple-900">1,234</p>
                    <p className="text-sm text-purple-700">31.5% dos visitantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurações do Pixel */}
            <Card className="bg-white shadow-lg border border-gray-100">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <Button className="bg-ecko-red hover:bg-ecko-red-dark text-white px-8 py-3">
                    Exportar Eventos do Pixel
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 px-6 py-3">
                    Testar Eventos
                  </Button>
                  <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 px-6 py-3">
                    Configurar Conversões
                  </Button>
                  <div className="sm:ml-auto text-sm text-gray-500">
                    Última sincronização: há 2 minutos
                  </div>
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
