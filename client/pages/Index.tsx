import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import {
  CheckCircle,
  Globe,
  Truck,
  HeadphonesIcon,
  Monitor,
  ArrowRight,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { HeroSettings, HeroResponse } from "@shared/api";

interface LeadFormData {
  name: string;
  whatsapp: string;
  hasCnpj: string;
  storeType: string;
}

export default function Index() {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    whatsapp: "",
    hasCnpj: "",
    storeType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [isLoadingHero, setIsLoadingHero] = useState(true);

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      const response = await fetch("/api/hero");
      if (response.ok) {
        const data: HeroResponse = await response.json();
        setHeroSettings(data.hero);
      }
    } catch (error) {
      console.error("Error fetching hero settings:", error);
    } finally {
      setIsLoadingHero(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: "",
          whatsapp: "",
          hasCnpj: "",
          storeType: "",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToContent = () => {
    const element = document.getElementById("content-section");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center bg-gray-900 border-ecko-red border-2">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-ecko-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-ecko-red" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Cadastro Enviado!
            </h2>
            <p className="text-gray-300 mb-6">
              Nossa equipe entrará em contato em até 24h para apresentar nossa
              proposta exclusiva para se tornar um revendedor oficial!
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setShowForm(false);
              }}
              className="bg-ecko-red hover:bg-ecko-red-dark text-white font-bold"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-gray-900 border-ecko-red border-2">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-ecko-red rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-xl">🦏</span>
                </div>
                <h1 className="text-2xl font-black text-white ml-3">
                  eckō unltd.
                </h1>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Cadastro de Revendedor
              </h2>
              <p className="text-gray-300">
                Preencha seus dados para se tornar um lojista oficial
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nome Completo
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Digite seu nome completo"
                  required
                  className="h-12 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-ecko-red focus:ring-ecko-red/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  WhatsApp
                </label>
                <Input
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  required
                  className="h-12 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-ecko-red focus:ring-ecko-red/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Possui CNPJ?
                </label>
                <select
                  name="hasCnpj"
                  value={formData.hasCnpj}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 bg-gray-800 border border-gray-700 rounded-md px-4 text-white focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="sim">Sim, tenho CNPJ</option>
                  <option value="nao">Não tenho CNPJ</option>
                  <option value="processo">Em processo de abertura</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tipo de Negócio
                </label>
                <select
                  name="storeType"
                  value={formData.storeType}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 bg-gray-800 border border-gray-700 rounded-md px-4 text-white focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="fisica">Loja Física</option>
                  <option value="online">Loja Online</option>
                  <option value="ambas">Física + Online</option>
                  <option value="vendedor">Vendedor/Representante</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="ainda-nao-tenho">Ainda não tenho loja</option>
                </select>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-12 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-ecko-red hover:bg-ecko-red-dark text-white font-bold"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    "Enviar Cadastro"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-black">
      {/* Hero Full Screen Section */}
      <section className="h-screen relative flex flex-col justify-center items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80 z-10"></div>
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: heroSettings?.background_image_url
                ? `url(${heroSettings.background_image_url})`
                : `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"%3E%3Cdefs%3E%3ClinearGradient id="hero-bg" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%23000000;stop-opacity:1" /%3E%3Cstop offset="50%" style="stop-color:%23dc2626;stop-opacity:0.1" /%3E%3Cstop offset="100%" style="stop-color:%23000000;stop-opacity:1" /%3E%3C/linearGradient%3E%3Cpattern id="streetwear-pattern" patternUnits="userSpaceOnUse" width="100" height="100"%3E%3Ccircle cx="50" cy="50" r="2" fill="%23dc2626" opacity="0.1"/%3E%3Ccircle cx="25" cy="25" r="1" fill="%23dc2626" opacity="0.05"/%3E%3Ccircle cx="75" cy="75" r="1" fill="%23dc2626" opacity="0.05"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%" height="100%" fill="url(%23hero-bg)"/%3E%3Crect width="100%" height="100%" fill="url(%23streetwear-pattern)"/%3E%3C/svg%3E')`,
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center mt-20 mb-8">
            {heroSettings?.logo_url ? (
              <img
                src={heroSettings.logo_url}
                alt="Logo"
                className="h-20 object-contain mt-11 mr-6"
                style={{ width: "370px" }}
              />
            ) : (
              <img
                src="https://www.ntktextil.com.br/wp-content/uploads/2022/08/Logo-Ecko.png"
                alt="Logo"
                className="h-20 object-contain mt-11 mr-6"
                style={{ width: "370px" }}
              />
            )}
          </div>

          {/* Main Message */}
          <h2 className="text-4xl lg:text-7xl font-black text-white mb-6 leading-tight">
            {heroSettings?.main_title ? (
              heroSettings.main_title.split("\n").map((line, index) => (
                <div key={index}>
                  {index === 0 ? (
                    line
                  ) : (
                    <span className="text-ecko-red">{line}</span>
                  )}
                  {index < heroSettings.main_title.split("\n").length - 1 && (
                    <br />
                  )}
                </div>
              ))
            ) : (
              <>
                TRANSFORME SUA
                <br />
                <span className="text-ecko-red">PAIXÃO</span>
                <br />
                EM <span className="text-ecko-red">LUCRO</span>
              </>
            )}
          </h2>

          <p className="text-xl lg:text-2xl text-gray-300 mb-12 font-medium max-w-2xl mx-auto">
            {heroSettings?.description ||
              "Seja um revendedor oficial da marca de streetwear mais desejada do Brasil e multiplique suas vendas!"}
          </p>

          {/* Scroll Down Button */}
          <div className="flex flex-col items-center">
            <Button
              onClick={scrollToContent}
              variant="outline"
              className="mb-8 bg-transparent border-2 border-ecko-red text-ecko-red hover:bg-ecko-red hover:text-white font-bold px-8 py-4 h-auto text-lg uppercase tracking-wider transition-all duration-300"
            >
              {heroSettings?.cta_text || "Descubra Como Funciona"}
              <ChevronDown className="ml-2 w-6 h-6" />
            </Button>

            {/* Scroll Indicator */}
            <div className="flex flex-col items-center animate-bounce">
              <div className="w-1 h-12 bg-gradient-to-b from-ecko-red to-transparent rounded-full mb-2"></div>
              <ChevronDown className="w-6 h-6 text-ecko-red animate-pulse" />
            </div>
          </div>
        </div>

        {/* Admin Link */}
        <div className="absolute top-6 right-6 z-30">
          <a
            href="/admin"
            className="text-gray-400 hover:text-ecko-red transition-colors text-sm"
          >
            Área Admin
          </a>
        </div>
      </section>

      {/* Content Section */}
      <section
        id="content-section"
        className="relative min-h-screen flex flex-col"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-black via-black/80 to-transparent z-10 absolute"></div>
          <div
            className={
              'w-full h-full bg-[url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"%3E%3Cdefs%3E%3Cpattern id="streetwear" patternUnits="userSpaceOnUse" width="40" height="40"%3E%3Ccircle cx="20" cy="20" r="1" fill="%23dc2626" opacity="0.1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%" height="100%" fill="%23111827"/%3E%3Crect width="100%" height="100%" fill="url(%23streetwear)"/%3E%3C/svg%3E\')] bg-cover bg-center'
            }
          ></div>
        </div>

        {/* Header */}
        <header className="relative z-20 p-6">
          <div className="container mx-auto max-w-6xl flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-ecko-red rounded-lg flex items-center justify-center mr-4">
                <span className="text-white font-black text-2xl">🦏</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">eckō unltd.</h1>
                <p className="text-ecko-red text-sm font-bold uppercase tracking-wider">
                  Como Funciona
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-20 flex-1 flex items-center py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="max-w-3xl">
              <h1 className="text-4xl lg:text-6xl font-black text-white mb-8 leading-tight">
                REVENDA ECKO:
                <br />
                <span className="text-ecko-red">
                  SEJA UM LOJISTA AUTORIZADO
                </span>
                <br />
                <span className="text-ecko-red">
                  E MULTIPLIQUE SUAS VENDAS!
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-300 mb-12 font-medium">
                Venda uma das marcas mais desejadas do streetwear e aumente seus
                lucros!
              </p>

              <Button
                onClick={() => setShowForm(true)}
                className="bg-ecko-red hover:bg-ecko-red-dark text-white text-lg px-8 py-4 h-auto font-bold shadow-2xl hover:shadow-ecko-red/25 transition-all duration-300 group text-uppercase tracking-wider"
              >
                QUERO SER UM REVENDEDOR OFICIAL
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Marca Internacional */}
            <Card className="bg-black border-2 border-ecko-red hover:bg-gray-900 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-ecko-red/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-ecko-red/30 transition-colors">
                  <Globe className="w-8 h-8 text-ecko-red" />
                </div>
                <h3 className="text-xl font-bold text-ecko-red mb-4 uppercase tracking-wide">
                  MARCA INTERNACIONAL
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  A Ecko é uma marca reconhecida mundialmente, com forte
                  presença no Brasil e grande apelo junto ao público jovem. Uma
                  marca que só o nome vende sozinho.
                </p>
              </CardContent>
            </Card>

            {/* Pronta Entrega */}
            <Card className="bg-black border-2 border-ecko-red hover:bg-gray-900 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-ecko-red/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-ecko-red/30 transition-colors">
                  <Truck className="w-8 h-8 text-ecko-red" />
                </div>
                <h3 className="text-xl font-bold text-ecko-red mb-4 uppercase tracking-wide">
                  PRONTA ENTREGA
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Disponibilizamos mais de 100.000 produtos prontos para
                  entrega, para impulsionar suas vendas com excelentes margens
                  de lucro e um ótimo rápido giro de estoque.
                </p>
              </CardContent>
            </Card>

            {/* Suporte ao Lojista */}
            <Card className="bg-black border-2 border-ecko-red hover:bg-gray-900 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-ecko-red/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-ecko-red/30 transition-colors">
                  <HeadphonesIcon className="w-8 h-8 text-ecko-red" />
                </div>
                <h3 className="text-xl font-bold text-ecko-red mb-4 uppercase tracking-wide">
                  SUPORTE AO LOJISTA
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Nossa equipe de especialistas está sempre à disposição para
                  garantir que você tenha a melhor experiência, tanto na compra
                  quanto na venda do produto em sua loja.
                </p>
              </CardContent>
            </Card>

            {/* Totalmente Online */}
            <Card className="bg-black border-2 border-ecko-red hover:bg-gray-900 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-ecko-red/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-ecko-red/30 transition-colors">
                  <Monitor className="w-8 h-8 text-ecko-red" />
                </div>
                <h3 className="text-xl font-bold text-ecko-red mb-4 uppercase tracking-wide">
                  TOTALMENTE ONLINE
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Oferecemos uma plataforma exclusiva de compras online, com
                  preços de atacado destinados aos lojistas de todo o Brasil
                  para facilitar a sua compra e reabastecimento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-ecko-red">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-6 uppercase tracking-wide">
            PRONTO PARA FAZER PARTE DA FAMÍLIA ECKO?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Junte-se aos milhares de revendedores que já transformaram seus
            negócios com a marca mais desejada do streetwear brasileiro!
          </p>

          <Button
            onClick={() => setShowForm(true)}
            className="bg-white hover:bg-gray-100 text-ecko-red text-lg px-8 py-4 h-auto font-black shadow-2xl hover:shadow-black/25 transition-all duration-300 group uppercase tracking-wider"
          >
            QUERO SER UM LOJISTA AUTORIZADO
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl lg:text-5xl font-black text-ecko-red mb-2 group-hover:text-white">
                25+
              </div>
              <div className="text-gray-400 font-bold uppercase tracking-wide text-sm">
                Anos de História
              </div>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl lg:text-5xl font-black text-ecko-red mb-2 group-hover:text-white">
                500+
              </div>
              <div className="text-gray-400 font-bold uppercase tracking-wide text-sm">
                Lojistas Ativos
              </div>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl lg:text-5xl font-black text-ecko-red mb-2 group-hover:text-white">
                100K+
              </div>
              <div className="text-gray-400 font-bold uppercase tracking-wide text-sm">
                Produtos
              </div>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl lg:text-5xl font-black text-ecko-red mb-2 group-hover:text-white">
                1M+
              </div>
              <div className="text-gray-400 font-bold uppercase tracking-wide text-sm">
                Clientes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-black border-t border-gray-800">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-ecko-red rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-black text-xl">🦏</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">
                    eckō unltd.
                  </h3>
                  <p className="text-ecko-red text-sm font-bold uppercase tracking-wider">
                    Unlimited Potential
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Há mais de 25 anos criando tendências no streetwear mundial.
                Junte-se a nós e faça parte desta história de sucesso que
                continua crescendo!
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-wide text-sm">
                Contato
              </h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <p>(11) 4000-2000</p>
                <p>lojistas@ecko.com.br</p>
                <p>São Paulo, SP - Brasil</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-wide text-sm">
                Suporte
              </h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <p className="hover:text-ecko-red cursor-pointer transition-colors">
                  Central de Ajuda
                </p>
                <p className="hover:text-ecko-red cursor-pointer transition-colors">
                  Política de Trocas
                </p>
                <p className="hover:text-ecko-red cursor-pointer transition-colors">
                  Entrega e Logística
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-xs">
            <p>&copy; 2024 Ecko Unlimited. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowForm(true)}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl hover:shadow-green-500/25 transition-all duration-300 group animate-pulse hover:animate-none"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
