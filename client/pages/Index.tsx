import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  CheckCircle,
  Globe,
  Truck,
  HeadphonesIcon,
  Monitor,
  ArrowRight,
  MessageCircle,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import {
  HeroSettings,
  HeroResponse,
  FAQ,
  FAQsResponse,
  GalleryImage,
  GalleryResponse,
  ThemeSettings,
  ThemeResponse,
} from "@shared/api";
import { getAnalytics } from "../lib/analytics";

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
  const [cnpjError, setCnpjError] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(
    null,
  );

  useEffect(() => {
    fetchHeroSettings();
    fetchFAQs();
    fetchGalleryImages();
    fetchThemeSettings();
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

  const fetchFAQs = async () => {
    try {
      const response = await fetch("/api/faqs?active_only=true");
      if (response.ok) {
        const data: FAQsResponse = await response.json();
        setFaqs(data.faqs || []);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const response = await fetch("/api/gallery?active_only=true");
      if (response.ok) {
        const data: GalleryResponse = await response.json();
        setGalleryImages(data.images || []);
      }
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    }
  };

  const fetchThemeSettings = async () => {
    try {
      const response = await fetch("/api/theme");
      if (response.ok) {
        const data: ThemeResponse = await response.json();
        setThemeSettings(data.theme);
        applyThemeToCSS(data.theme);
      }
    } catch (error) {
      console.error("Error fetching theme settings:", error);
    }
  };

  const applyThemeToCSS = (theme: ThemeSettings) => {
    const root = document.documentElement;
    root.style.setProperty("--ecko-red", theme.primary_color);
    root.style.setProperty("--ecko-red-light", theme.primary_light);
    root.style.setProperty("--ecko-red-dark", theme.primary_dark);
    root.style.setProperty("--ecko-secondary", theme.secondary_color);
    root.style.setProperty("--ecko-background", theme.background_color);
    root.style.setProperty("--ecko-text", theme.text_color);
    root.style.setProperty("--ecko-accent", theme.accent_color);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validar CNPJ imediatamente
    if (name === "hasCnpj") {
      if (value === "nao") {
        setCnpjError(
          "Para ser um revendedor oficial da Ecko é necessário ter CNPJ.",
        );

        // Track analytics when user indicates they don't have CNPJ/store
        const analytics = getAnalytics();
        if (analytics) {
          analytics.trackConversion({
            conversionType: "no_store_indication",
            conversionValue: "user_indicated_no_cnpj",
            formData: JSON.stringify({
              hasCnpj: value,
              currentFormData: formData,
            }),
          });
        }
      } else {
        setCnpjError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Se não tem CNPJ, não prosseguir
    if (formData.hasCnpj === "nao") {
      return;
    }

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
          {/* Dynamic overlay based on hero settings */}
          <div
            className="absolute inset-0 z-10"
            style={{
              backgroundColor:
                heroSettings?.background_overlay_color || "#000000",
              opacity: (heroSettings?.background_overlay_opacity || 50) / 100,
            }}
          ></div>
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
                className="object-contain"
                style={{
                  width: `${heroSettings.logo_width || 200}px`,
                  height: `${heroSettings.logo_height || 80}px`,
                  maxWidth: "100%",
                }}
              />
            ) : (
              <img
                src="https://www.ntktextil.com.br/wp-content/uploads/2022/08/Logo-Ecko.png"
                alt="Logo"
                className="object-contain"
                style={{
                  width: `${heroSettings?.logo_width || 200}px`,
                  height: `${heroSettings?.logo_height || 80}px`,
                  maxWidth: "100%",
                }}
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

        {/* Hero Content */}
        <div className="relative z-20 flex-1 flex items-center py-5">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
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
                  Venda uma das marcas mais desejadas do streetwear e aumente
                  seus lucros!
                </p>

                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-ecko-red hover:bg-ecko-red-dark text-white text-lg px-8 py-4 h-auto font-bold shadow-2xl hover:shadow-ecko-red/25 transition-all duration-300 group text-uppercase tracking-wider lg:hidden"
                >
                  QUERO SER UM REVENDEDOR OFICIAL
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Right Form */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-ecko-red via-red-500 to-ecko-red-dark rounded-3xl opacity-20 blur-xl"></div>
                <Card className="relative shadow-2xl border-2 border-ecko-red/30 bg-gray-900/95 backdrop-blur-lg">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Cadastro de Revendedor
                      </h2>
                      <p className="text-gray-300">
                        Preencha os dados para receber nossa proposta
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Nome Completo
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Digite seu nome"
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Tem CNPJ?
                          </label>
                          <select
                            name="hasCnpj"
                            value={formData.hasCnpj}
                            onChange={handleInputChange}
                            required
                            className="w-full h-12 border border-gray-700 rounded-md px-4 bg-gray-800 text-white focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none"
                          >
                            <option value="">Selecione</option>
                            <option value="sim">Sim</option>
                            <option value="nao">Não</option>
                          </select>
                          {cnpjError && (
                            <p className="text-ecko-red text-sm mt-2 font-medium">
                              {cnpjError}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Tipo de Loja
                          </label>
                          <select
                            name="storeType"
                            value={formData.storeType}
                            onChange={handleInputChange}
                            required
                            className="w-full h-12 border border-gray-700 rounded-md px-4 bg-gray-800 text-white focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none"
                          >
                            <option value="">Selecione</option>
                            <option value="fisica">Física</option>
                            <option value="online">Online</option>
                            <option value="ambas">Física + Online</option>
                          </select>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting || formData.hasCnpj === "nao"}
                        className={`w-full py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 ${
                          formData.hasCnpj === "nao"
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-ecko-red"
                        } text-white`}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Enviando...
                          </div>
                        ) : (
                          "QUERO SER REVENDEDOR AGORA"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-ecko-red/20 via-transparent to-ecko-red/20"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-ecko-red/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-ecko-red/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="bg-ecko-red text-white px-6 py-2 text-sm font-semibold uppercase tracking-widest mb-6">
              Por que escolher a Ecko?
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-tight">
              VANTAGENS EXCLUSIVAS
              <span className="block text-2xl md:text-3xl text-ecko-red mt-2">
                para nossos parceiros
              </span>
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Descubra os benefícios únicos que fazem da Ecko a escolha certa
              para impulsionar seu negócio no mundo da moda streetwear
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Marca Internacional */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 hover:border-ecko-red hover:bg-gray-800/70 transition-all duration-500 group transform hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-8 text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red/30 to-ecko-red/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:from-ecko-red/50 group-hover:to-ecko-red/20 transition-all duration-500 group-hover:rotate-6">
                  <Globe className="w-10 h-10 text-ecko-red group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wide group-hover:text-ecko-red transition-colors duration-300">
                  MARCA INTERNACIONAL
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  A Ecko é uma marca reconhecida mundialmente, com forte
                  presença no Brasil e grande apelo junto ao público jovem. Uma
                  marca que só o nome vende sozinho.
                </p>
                <div className="absolute inset-0 bg-gradient-to-t from-ecko-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
              </CardContent>
            </Card>

            {/* Pronta Entrega */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 hover:border-ecko-red hover:bg-gray-800/70 transition-all duration-500 group transform hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-8 text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red/30 to-ecko-red/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:from-ecko-red/50 group-hover:to-ecko-red/20 transition-all duration-500 group-hover:rotate-6">
                  <Truck className="w-10 h-10 text-ecko-red group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wide group-hover:text-ecko-red transition-colors duration-300">
                  PRONTA ENTREGA
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Disponibilizamos mais de 100.000 produtos prontos para
                  entrega, para impulsionar suas vendas com excelentes margens
                  de lucro e um ótimo rápido giro de estoque.
                </p>
                <div className="absolute inset-0 bg-gradient-to-t from-ecko-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
              </CardContent>
            </Card>

            {/* Suporte ao Lojista */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 hover:border-ecko-red hover:bg-gray-800/70 transition-all duration-500 group transform hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-8 text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red/30 to-ecko-red/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:from-ecko-red/50 group-hover:to-ecko-red/20 transition-all duration-500 group-hover:rotate-6">
                  <HeadphonesIcon className="w-10 h-10 text-ecko-red group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wide group-hover:text-ecko-red transition-colors duration-300">
                  SUPORTE AO LOJISTA
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Nossa equipe de especialistas está sempre à disposição para
                  garantir que você tenha a melhor experiência, tanto na compra
                  quanto na venda do produto em sua loja.
                </p>
                <div className="absolute inset-0 bg-gradient-to-t from-ecko-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
              </CardContent>
            </Card>

            {/* Totalmente Online */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 hover:border-ecko-red hover:bg-gray-800/70 transition-all duration-500 group transform hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-8 text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red/30 to-ecko-red/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:from-ecko-red/50 group-hover:to-ecko-red/20 transition-all duration-500 group-hover:rotate-6">
                  <Monitor className="w-10 h-10 text-ecko-red group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wide group-hover:text-ecko-red transition-colors duration-300">
                  TOTALMENTE ONLINE
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Oferecemos uma plataforma exclusiva de compras online, com
                  preços de atacado destinados aos lojistas de todo o Brasil
                  para facilitar a sua compra e reabastecimento.
                </p>
                <div className="absolute inset-0 bg-gradient-to-t from-ecko-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-2 text-ecko-red font-semibold text-lg">
              <span>
                Junte-se a milhares de parceiros que já confiam na Ecko
              </span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-ecko-red/10 via-transparent to-ecko-red/10"></div>
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-ecko-red/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-ecko-red/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="bg-ecko-red text-white px-6 py-2 text-sm font-semibold uppercase tracking-widest mb-6">
              Nossa Galeria
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-tight">
              PRODUTOS EM DESTAQUE
              <span className="block text-2xl md:text-3xl text-ecko-red mt-2">
                Veja a qualidade Ecko
              </span>
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Conheça alguns dos produtos mais vendidos da nossa coleção e
              descubra por que a Ecko é a marca preferida dos consumidores de
              streetwear
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryImages.map((image, index) => (
              <div
                key={image.id || index}
                className="group relative bg-black rounded-2xl overflow-hidden border-2 border-gray-700 hover:border-ecko-red transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={image.alt_text || image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
                      {image.title}
                    </h3>
                    {image.description && (
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {image.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Border Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-ecko-red/20 via-transparent to-ecko-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {galleryImages.length === 0 && (
            <div className="text-center mt-12">
              <p className="text-gray-400 text-lg">
                Em breve nossa galeria estará repleta de produtos incríveis!
              </p>
            </div>
          )}

          {galleryImages.length > 0 && (
            <div className="text-center mt-16">
              <Button
                variant="outline"
                className="border-ecko-red text-ecko-red hover:bg-ecko-red hover:text-white px-8 py-3 text-lg font-semibold uppercase tracking-wider transition-all duration-300"
              >
                Ver Mais Produtos
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}
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

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="py-20 bg-black relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div
              className={
                'w-full h-full bg-[url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"%3E%3Cdefs%3E%3Cpattern id="faq-pattern" patternUnits="userSpaceOnUse" width="40" height="40"%3E%3Ccircle cx="20" cy="20" r="1" fill="%23dc2626" opacity="0.1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%" height="100%" fill="%23000000"/%3E%3Crect width="100%" height="100%" fill="url(%23faq-pattern)"/%3E%3C/svg%3E\')] bg-cover bg-center'
              }
            ></div>
          </div>

          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-ecko-red/20 backdrop-blur-sm border border-ecko-red/30 rounded-full px-6 py-3 mb-6">
                <HelpCircle className="w-5 h-5 text-ecko-red mr-2" />
                <span className="text-ecko-red font-bold uppercase tracking-wider">
                  Perguntas Frequentes
                </span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
                DÚVIDAS <span className="text-ecko-red">RESPONDIDAS</span>
              </h2>
              <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto font-medium">
                Encontre respostas para as principais dúvidas sobre nosso
                programa de revendedores
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="shadow-2xl border-2 border-ecko-red/30 bg-gray-900/95 backdrop-blur-lg">
                <CardContent className="p-8">
                  <Accordion type="single" collapsible className="space-y-2">
                    {faqs
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((faq, index) => (
                        <AccordionItem
                          key={faq.id}
                          value={`faq-${faq.id}`}
                          className="group border-b border-gray-700 last:border-b-0 rounded-lg overflow-hidden hover:bg-gray-800/50 transition-all duration-300"
                        >
                          <AccordionTrigger className="text-left text-lg font-bold text-white hover:text-ecko-red transition-colors py-6 px-4 group-hover:bg-gray-800/30 [&>svg]:text-ecko-red">
                            <div className="flex items-center">
                              <span className="bg-ecko-red/20 text-ecko-red font-black text-sm rounded-full w-8 h-8 flex items-center justify-center mr-4 group-hover:bg-ecko-red group-hover:text-white transition-all">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              {faq.question}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-300 text-base leading-relaxed pb-6 px-4 pl-16">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* CTA Section */}
              <div className="text-center mt-12">
                <div className="bg-gradient-to-r from-ecko-red/10 to-ecko-red-dark/10 rounded-2xl p-8 border border-ecko-red/20 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Ainda tem dúvidas?
                  </h3>
                  <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                    Nossa equipe está pronta para ajudar você a se tornar um
                    revendedor oficial da marca de streetwear mais desejada do
                    Brasil
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-ecko-red hover:bg-ecko-red-dark text-white px-8 py-4 font-bold text-lg shadow-2xl hover:shadow-ecko-red/25 transition-all duration-300 group uppercase tracking-wider"
                  >
                    FALE COM NOSSA EQUIPE
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
          <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-50"></div>

          {/* Main Button */}
          <Button
            onClick={() => setShowForm(true)}
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-2xl hover:shadow-green-500/40 transition-all duration-300 group border-4 border-white hover:scale-110"
          >
            <svg
              className="w-7 h-7 group-hover:scale-125 transition-transform duration-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516" />
            </svg>
          </Button>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white text-sm py-2 px-3 rounded-lg whitespace-nowrap shadow-xl">
              Fazer Cadastro
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          {/* Pulse Notification */}
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-ecko-red rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
            !
          </div>
        </div>

        {/* Background overlay on hover */}
        <div className="fixed inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
}
