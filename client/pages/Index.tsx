import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { DynamicHead } from "../components/DynamicHead";
import { useToast } from "../hooks/use-toast";
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
import { FAQ, GalleryImage, Testimonial } from "@shared/api";

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
  const [cnpjError, setCnpjError] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Dados estáticos - Gallery Images (Lifestyle)
  const staticGalleryImages: GalleryImage[] = [
    {
      id: 1,
      title: "Street Style Urbano",
      description:
        "Coleção lifestyle Ecko - visual urbano autêntico com atitude",
      image_url:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=500&fit=crop&crop=center",
      alt_text:
        "Ecko streetwear - homem jovem com roupa urbana da marca líder em moda street no Brasil",
      display_order: 1,
      is_active: true,
    },
    {
      id: 2,
      title: "Estilo Casual Premium",
      description: "Looks casuais que refletem a essência streetwear da marca",
      image_url:
        "https://images.unsplash.com/photo-1506629905607-21e4ab4ea3d4?w=500&h=500&fit=crop&crop=center",
      alt_text:
        "Moda casual Ecko - looks premium streetwear brasileiro para o dia a dia urbano",
      display_order: 2,
      is_active: true,
    },
    {
      id: 3,
      title: "Atitude Streetwear",
      description: "Visual jovem e descolado que representa a cultura urbana",
      image_url:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=500&fit=crop&crop=center",
      alt_text:
        "Jovem estiloso com roupas Ecko representando a cultura streetwear urbana brasileira",
      display_order: 3,
      is_active: true,
    },
    {
      id: 4,
      title: "Moda Urbana Feminina",
      description: "Coleção feminina com pegada street e muita personalidade",
      image_url:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop&crop=center",
      alt_text:
        "Mulher jovem com estilo streetwear Ecko - moda urbana feminina brasileira",
      display_order: 4,
      is_active: true,
    },
    {
      id: 5,
      title: "Look Esportivo Chic",
      description: "Combinação perfeita entre conforto e estilo urbano",
      image_url:
        "https://images.unsplash.com/photo-1558618047-fcd95c85cd64?w=500&h=500&fit=crop&crop=center",
      alt_text:
        "Combinação perfeita de conforto e estilo urbano com roupas esportivas Ecko",
      display_order: 5,
      is_active: true,
    },
    {
      id: 6,
      title: "Estilo Hip Hop Culture",
      description: "Raízes da cultura hip hop com toque contemporâneo",
      image_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=center",
      alt_text: "Hip hop culture Ecko lifestyle",
      display_order: 6,
      is_active: true,
    },
    {
      id: 7,
      title: "Urban Fashion Trends",
      description: "Tendências da moda urbana que definem gera��ões",
      image_url:
        "https://images.unsplash.com/photo-1533973403183-b2952e4b971e?w=500&h=500&fit=crop&crop=center",
      alt_text: "Urban fashion trends Ecko",
      display_order: 7,
      is_active: true,
    },
    {
      id: 8,
      title: "Lifestyle Aut��ntico",
      description: "Autenticidade e originalidade em cada visual",
      image_url:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=500&fit=crop&crop=center",
      alt_text: "Lifestyle autêntico Ecko",
      display_order: 8,
      is_active: true,
    },
    {
      id: 9,
      title: "Street Culture Vibe",
      description: "A essência da cultura de rua em looks únicos",
      image_url:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop&crop=center",
      alt_text: "Street culture vibe Ecko",
      display_order: 9,
      is_active: true,
    },
    {
      id: 10,
      title: "Movimento Urbano",
      description: "Movimento e energia da vida urbana moderna",
      image_url:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f74?w=500&h=500&fit=crop&crop=center",
      alt_text: "Movimento urbano Ecko lifestyle",
      display_order: 10,
      is_active: true,
    },
    {
      id: 11,
      title: "Modern Streetwear",
      description: "Modernidade e inovação no streetwear contemporâneo",
      image_url:
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&h=500&fit=crop&crop=center",
      alt_text: "Modern streetwear Ecko",
      display_order: 11,
      is_active: true,
    },
    {
      id: 12,
      title: "Ecko Generation",
      description: "Nova geração do streetwear com atitude Ecko",
      image_url:
        "https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=500&h=500&fit=crop&crop=center",
      alt_text: "Ecko generation lifestyle",
      display_order: 12,
      is_active: true,
    },
  ];

  // Dados estáticos - FAQs
  const staticFAQs: FAQ[] = [
    {
      id: 1,
      question: "Como me tornar um revendedor oficial da Ecko?",
      answer:
        "Para se tornar um revendedor oficial, você precisa ter CNPJ ativo e preencher nosso formulário de cadastro. Nossa equipe entrará em contato em até 24h para apresentar as condições comerciais e processo de aprovação.",
      display_order: 1,
      is_active: true,
    },
    {
      id: 2,
      question: "Qual o investimento mínimo para começar?",
      answer:
        "O investimento inicial varia conforme o tipo de loja e região. Oferecemos condições especiais para novos parceiros, incluindo facilidades de pagamento e lotes mínimos acessíveis. Consulte nossa equipe para uma proposta personalizada.",
      display_order: 2,
      is_active: true,
    },
    {
      id: 3,
      question: "Vocês oferecem exclusividade territorial?",
      answer:
        "Sim! Dependendo da região e do perfil do parceiro, oferecemos proteção territorial para garantir que você tenha espaço para crescer sem concorrência direta de outros revendedores oficiais.",
      display_order: 3,
      is_active: true,
    },
    {
      id: 4,
      question: "Como funciona o suporte pós-venda?",
      answer:
        "Nossa equipe oferece suporte completo: treinamento de produto, materiais de marketing, orientação sobre displays e estratégias de venda. Além disso, você terá um consultor dedicado para acompanhar seu desenvolvimento.",
      display_order: 4,
      is_active: true,
    },
    {
      id: 5,
      question: "Qual o prazo de entrega dos produtos?",
      answer:
        "Trabalhamos com estoque disponível para pronta entrega. O prazo m��dio é de 5 a 10 dias úteis, dependendo da localização. Para pedidos maiores, o prazo pode ser negociado conforme a necessidade.",
      display_order: 5,
      is_active: true,
    },
  ];

  // Dados estáticos - Testimonials
  const staticTestimonials: Testimonial[] = [
    {
      id: 1,
      name: "Ricardo Silva",
      company: "Silva Streetwear",
      role: "Proprietário",
      content:
        "Trabalhar com a Ecko mudou completamente meu negócio. As vendas triplicaram em apenas 6 meses e os clientes sempre voltam para comprar mais. A qualidade dos produtos é excepcional!",
      avatar_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      is_active: true,
    },
    {
      id: 2,
      name: "Ana Carolina",
      company: "Street Style Store",
      role: "CEO",
      content:
        "Como mulher empreendedora, encontrei na Ecko o parceiro ideal. O suporte é incrível e os produtos vendem sozinhos. Minha loja cresceu 400% desde que me tornei revendedora oficial.",
      avatar_url:
        "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      is_active: true,
    },
    {
      id: 3,
      name: "Marcus Santos",
      company: "Urban Fashion",
      role: "Diretor Comercial",
      content:
        "A Ecko não é só uma marca, é um estilo de vida. Nossos clientes s��o apaixonados pelos produtos e isso reflete diretamente nas nossas vendas. Melhor decisão que já tomei!",
      avatar_url:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      is_active: true,
    },
    {
      id: 4,
      name: "Fernanda Costa",
      company: "FC Moda Urbana",
      role: "Fundadora",
      content:
        "Em 2 anos como revendedora Ecko, consegui abrir mais 3 lojas. A marca tem uma força incrível no mercado e os jovens amam. O retorno sobre investimento é fantástico!",
      avatar_url:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      is_active: true,
    },
    {
      id: 5,
      name: "Rafael Oliveira",
      company: "Street Kings",
      role: "Sócio-Proprietário",
      content:
        "A Ecko sempre foi referência em streetwear. Desde que me tornei revendedor oficial, minha margem de lucro aumentou significativamente. A qualidade justifica cada centavo.",
      avatar_url:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      is_active: true,
    },
    {
      id: 6,
      name: "Juliana Mendes",
      company: "JM Fashion",
      role: "Proprietária",
      content:
        "Comecei pequena e hoje tenho uma das maiores lojas de streetwear da região. A Ecko me deu credibilidade no mercado e produtos que realmente vendem. Recomendo de olhos fechados!",
      avatar_url:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      is_active: true,
    },
  ];

  useEffect(() => {
    // Definir dados estáticos no carregamento
    setGalleryImages(staticGalleryImages);
    setFaqs(staticFAQs);
    setTestimonials(staticTestimonials);
  }, []);

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
      } else {
        setCnpjError("");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Se não tem CNPJ, não prosseguir
    if (formData.hasCnpj === "nao") {
      return;
    }

    setIsSubmitting(true);

    // Simular envio do formulário
    setTimeout(() => {
      setIsSubmitted(true);
      setFormData({
        name: "",
        whatsapp: "",
        hasCnpj: "",
        storeType: "",
      });
      setIsSubmitting(false);
    }, 1500);
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
              className="group relative overflow-hidden bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700 text-white font-bold px-8 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-ecko-red/40 rounded-lg"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <span className="relative z-10">
                Voltar ao Início
              </span>
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
            <div className="text-center mb-8 text-gray-200">
              Preencha seus dados para se tornar um lojista oficial
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
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
                {cnpjError && (
                  <p className="text-ecko-red text-sm mt-2 font-medium leading-tight">
                    {cnpjError}
                  </p>
                )}
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
                  <option value="">Selecione</option>
                  <option value="fisica">Física</option>
                  <option value="online">Online</option>
                  <option value="ambas">Física + Online</option>
                </select>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="group relative overflow-hidden flex-1 h-12 border-2 border-gray-600 bg-transparent text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg"
                >
                  <span className="absolute inset-0 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  <span className="relative z-10">Voltar</span>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || formData.hasCnpj === "nao"}
                  className={`group relative overflow-hidden flex-1 h-12 font-bold transition-all duration-300 rounded-lg ${
                    formData.hasCnpj === "nao"
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700 hover:scale-105 hover:shadow-lg hover:shadow-ecko-red/40"
                  } text-white`}
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
    <>
      <DynamicHead />
      <main className="bg-black pb-4">
      {/* Hero Full Screen Section */}
      <section className="h-screen relative flex flex-col justify-center items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {/* Hero Background Image */}
          <img
            src="https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png?v=638421392678800000"
            alt="Ecko Unlimited - Marca de streetwear líder no Brasil com produtos urbanos e estilo jovem"
            className="w-full h-full object-cover"
          />

          {/* Multiple Overlay Layers for Better Effect */}
          <div className="absolute inset-0 bg-black/70 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-ecko-red/15 via-transparent to-ecko-red/15 z-10"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center mt-8 sm:mt-12 lg:mt-20 mb-6 sm:mb-8">
            <img
              src="https://www.ntktextil.com.br/wp-content/uploads/2022/08/Logo-Ecko.png"
              alt="Logo Ecko"
              className="object-contain w-32 h-12 sm:w-40 sm:h-16 lg:w-48 lg:h-20 xl:w-56 xl:h-24"
            />
          </div>

          {/* Main Message */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6 leading-tight px-2">
            TRANSFORME SUA
            <br />
            <span className="text-ecko-red">PAIXÃO</span>
            <br />
            EM <span className="text-ecko-red">LUCRO</span>
          </h2>

          <p className="text-lg sm:text-xl lg:text-2xl text-gray-100 mb-8 sm:mb-10 lg:mb-12 font-medium max-w-2xl mx-auto px-2">
            Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja!
          </p>

          {/* Scroll Down Button */}
          <div className="flex flex-col items-center">
            <Button
              onClick={scrollToContent}
              variant="outline"
              className="mb-6 sm:mb-8 group relative overflow-hidden bg-transparent border-2 border-ecko-red text-ecko-red hover:text-white font-bold px-8 sm:px-10 py-4 sm:py-5 h-auto text-base sm:text-lg uppercase tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-ecko-red/40 rounded-lg"
            >
              <span className="absolute inset-0 bg-ecko-red transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <span className="relative z-10 flex items-center">
                Descubra Como Funciona
                <ChevronDown className="ml-2 w-6 h-6 group-hover:animate-bounce" />
              </span>
            </Button>

            {/* Scroll Indicator */}
            <div
              onClick={scrollToContent}
              className="flex flex-col items-center animate-bounce cursor-pointer hover:scale-110 transition-transform duration-300"
            >
              <div className="w-1 h-12 bg-gradient-to-b from-ecko-red to-transparent rounded-full mb-2"></div>
              <ChevronDown className="w-6 h-6 text-ecko-red animate-pulse hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section
        id="content-section"
        className="relative min-h-[70vh] flex flex-col py-16 md:py-20"
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
        <div className="relative z-20 flex-1 flex items-center pt-3">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight px-2 lg:px-0">
                  <span className="text-ecko-red">
                    SEJA PARCEIRO
                  </span>
                  <br />
                  <span className="text-ecko-red">
                    OFICIAL ECKO
                  </span>
                  <br />
                  E TENHA <span className="text-ecko-red">SUCESSO</span>
                </h1>

                <p className="text-lg sm:text-xl lg:text-2xl text-gray-100 mb-6 sm:mb-7 lg:mb-8 font-medium px-2 lg:px-0">
                  Produtos de alta qualidade que seus clientes vão amar e que garantem excelente margem de lucro!
                </p>


              </div>

              {/* Right Form */}
              <div className="relative mt-6 lg:mt-0">
                <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-ecko-red via-red-500 to-ecko-red-dark rounded-3xl opacity-20 blur-xl"></div>
                <Card className="relative shadow-2xl border-2 border-ecko-red/40 bg-gray-900/90 backdrop-blur-lg">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="text-center mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">
                        Cadastro de Revendedor
                      </h2>
                      <p className="text-sm sm:text-base text-gray-300">
                        Preencha os dados para receber nossa proposta
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-4 sm:space-y-5"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1 sm:mb-2">
                          Nome Completo
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Seu nome"
                          required
                          className="h-10 sm:h-12 text-sm sm:text-base bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-ecko-red focus:ring-ecko-red/20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1 sm:mb-2">
                          WhatsApp
                        </label>
                        <Input
                          name="whatsapp"
                          type="tel"
                          value={formData.whatsapp}
                          onChange={handleInputChange}
                          placeholder="WhatsApp"
                          required
                          className="h-10 sm:h-12 text-sm sm:text-base bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-ecko-red focus:ring-ecko-red/20"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-1 sm:mb-2">
                            Tem CNPJ?
                          </label>
                          <select
                            name="hasCnpj"
                            value={formData.hasCnpj}
                            onChange={handleInputChange}
                            required
                            className="w-full h-10 sm:h-12 border border-gray-700 rounded-md px-3 sm:px-4 bg-gray-800 text-white focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none text-sm sm:text-base"
                          >
                            <option value="">Selecione</option>
                            <option value="sim">Sim</option>
                            <option value="nao">Não</option>
                          </select>
                          {cnpjError && (
                            <p className="text-ecko-red text-xs sm:text-sm mt-1 sm:mt-2 font-medium leading-tight">
                              {cnpjError}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-1 sm:mb-2">
                            Tipo de Loja
                          </label>
                          <select
                            name="storeType"
                            value={formData.storeType}
                            onChange={handleInputChange}
                            required
                            className="w-full h-10 sm:h-12 border border-gray-700 rounded-md px-3 sm:px-4 bg-gray-800 text-white focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none text-sm sm:text-base"
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
                        className={`group relative overflow-hidden w-full py-4 sm:py-5 text-sm sm:text-base lg:text-lg font-bold shadow-lg hover:shadow-2xl transition-all duration-300 h-auto min-h-[52px] rounded-lg ${
                          formData.hasCnpj === "nao"
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700 hover:scale-[1.02] hover:shadow-ecko-red/40"
                        } text-white`}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Enviando...
                          </div>
                        ) : (
                          <>
                            <span className="hidden sm:inline">
                              QUERO SER REVENDEDOR AGORA
                            </span>
                            <span className="sm:hidden">
                              QUERO SER REVENDEDOR
                            </span>
                          </>
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
      <section
        className="py-16 md:py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden"
        aria-labelledby="vantagens-heading"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-ecko-red/20 via-transparent to-ecko-red/20"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-ecko-red/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-ecko-red/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-ecko-red/20 backdrop-blur-sm border border-ecko-red/30 rounded-full px-6 py-3 mb-6">
              <span className="text-ecko-red font-bold uppercase tracking-wider text-sm">
                Por que escolher a Ecko?
              </span>
            </div>
            <h2
              id="vantagens-heading"
              className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight leading-tight"
            >
              VANTAGENS <span className="text-ecko-red">EXCLUSIVAS</span>
              <span className="block text-xl md:text-2xl text-gray-300 mt-2 font-medium normal-case tracking-normal">
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
              <CardContent className="p-6 text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red/30 to-ecko-red/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-ecko-red/50 group-hover:to-ecko-red/20 transition-all duration-500 group-hover:rotate-6">
                  <Globe className="w-10 h-10 text-ecko-red group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide group-hover:text-ecko-red transition-colors duration-300">
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
            <Card className="bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 hover:border-ecko-red hover:bg-gray-800/70 transition-all duration-500 group transform hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-6 text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red/30 to-ecko-red/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-ecko-red/50 group-hover:to-ecko-red/20 transition-all duration-500 group-hover:rotate-6">
                  <Truck className="w-10 h-10 text-ecko-red group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide group-hover:text-ecko-red transition-colors duration-300">
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
            <Card className="bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 hover:border-ecko-red hover:bg-gray-800/70 transition-all duration-500 group transform hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-6 text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red/30 to-ecko-red/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-ecko-red/50 group-hover:to-ecko-red/20 transition-all duration-500 group-hover:rotate-6">
                  <HeadphonesIcon className="w-10 h-10 text-ecko-red group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide group-hover:text-ecko-red transition-colors duration-300">
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
            <Card className="bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 hover:border-ecko-red hover:bg-gray-800/70 transition-all duration-500 group transform hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-6 text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red/30 to-ecko-red/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-ecko-red/50 group-hover:to-ecko-red/20 transition-all duration-500 group-hover:rotate-6">
                  <Monitor className="w-10 h-10 text-ecko-red group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide group-hover:text-ecko-red transition-colors duration-300">
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

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-ecko-red/10 to-ecko-red-dark/10 rounded-2xl p-6 border border-ecko-red/20 backdrop-blur-sm max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 text-white font-semibold text-lg mb-4">
                <span>
                  Junte-se a milhares de parceiros que já confiam na Ecko
                </span>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700 text-white px-8 py-4 font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-ecko-red/40 transition-all duration-300 hover:scale-105 uppercase tracking-wider rounded-lg"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                <span className="relative z-10 flex items-center">
                  <span className="hidden sm:inline">QUERO FAZER PARTE AGORA</span>
                  <span className="sm:hidden">QUERO FAZER PARTE</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-16 md:py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-ecko-red/5 via-transparent to-ecko-red/5"></div>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-ecko-red/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-ecko-red/5 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-ecko-red/20 backdrop-blur-sm border border-ecko-red/30 rounded-full px-6 py-3 mb-6">
                <span className="text-ecko-red font-bold uppercase tracking-wider text-sm">
                  Depoimentos
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                O que nossos <span className="text-ecko-red">revendedores</span> dizem
                <span className="block text-xl md:text-2xl text-gray-300 mt-2 font-medium normal-case tracking-normal">
                  casos reais de sucesso
                </span>
              </h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
                Depoimentos reais de parceiros que transformaram suas paixões em
                negócios lucrativos com a Ecko
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.slice(0, 4).map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/50 hover:border-ecko-red/60 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-ecko-red/20 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Rating Stars */}
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className="text-gray-300 mb-6 text-sm leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center space-x-3">
                    {testimonial.avatar_url ? (
                      <img
                        src={testimonial.avatar_url}
                        alt={`${testimonial.name}, ${testimonial.role} da ${testimonial.company} - Revendedor oficial Ecko satisfeito`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-ecko-red/20"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=dc2626&color=ffffff&size=48&bold=true`;
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-ecko-red rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {testimonial.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">
                        {testimonial.name}
                      </div>
                      {testimonial.company && (
                        <div className="text-sm text-gray-400">
                          {testimonial.role ? `${testimonial.role}, ` : ""}
                          {testimonial.company}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section for Testimonials */}
            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-ecko-red/10 to-ecko-red-dark/10 rounded-2xl p-6 border border-ecko-red/20 backdrop-blur-sm max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-white mb-3">
                  Seja o próximo case de sucesso!
                </h3>
                <p className="text-gray-300 mb-4">
                  Junte-se aos revendedores que já transformaram seus negócios
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="group relative overflow-hidden bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700 text-white px-8 py-4 font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-ecko-red/40 transition-all duration-300 hover:scale-105 uppercase tracking-wider rounded-lg"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  <span className="relative z-10 flex items-center">
                    <span className="hidden sm:inline">QUERO SER UM CASE DE SUCESSO</span>
                    <span className="sm:hidden">QUERO SER UM CASE</span>
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>

              {testimonials.length > 6 && (
                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="group relative overflow-hidden border-2 border-ecko-red text-ecko-red hover:text-white transition-all duration-300 px-6 py-3 font-semibold hover:scale-105 hover:shadow-lg hover:shadow-ecko-red/25 rounded-lg"
                  >
                    <span className="absolute inset-0 bg-ecko-red transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    <span className="relative z-10">
                      Ver Mais Depoimentos
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-ecko-red/10 via-transparent to-ecko-red/10"></div>
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-ecko-red/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-ecko-red/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-ecko-red/20 backdrop-blur-sm border border-ecko-red/30 rounded-full px-6 py-3 mb-6">
              <span className="text-ecko-red font-bold uppercase tracking-wider text-sm">
                Lifestyle Gallery
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight leading-tight">
              COLEÇÃO <span className="text-ecko-red">LIFESTYLE</span>
              <span className="block text-xl md:text-2xl text-gray-300 mt-2 font-medium normal-case tracking-normal">
                Viva o estilo Ecko
              </span>
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Descubra o lifestyle autêntico da Ecko através de looks que
              representam a ess��ncia do streetwear e a cultura urbana que
              define nossa marca
            </p>
          </div>

          {/* Gallery Grid - 4x2 mobile, 4x4 desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {galleryImages.slice(0, 12).map((image, index) => (
              <div
                key={image.id || index}
                className="group relative bg-gray-900 rounded-xl md:rounded-2xl overflow-hidden border border-gray-600 hover:border-ecko-red transition-all duration-500 transform hover:-translate-y-1 hover:scale-105"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={image.alt_text || image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>



                {/* Border Glow Effect */}
                <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-r from-ecko-red/20 via-transparent to-ecko-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* CTA Section for Gallery */}
          <div className="text-center mt-12 md:mt-16">
            <div className="bg-gradient-to-r from-ecko-red/10 to-ecko-red-dark/10 rounded-2xl p-6 border border-ecko-red/20 backdrop-blur-sm max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-3">
                Tenha Estes Produtos em Sua Loja!
              </h3>
              <p className="text-gray-300 mb-6">
                Produtos com alta demanda e excelente margem de lucro esperando por você
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700 text-white px-8 py-4 font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-ecko-red/40 transition-all duration-300 hover:scale-105 uppercase tracking-wider rounded-lg"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                <span className="relative z-10 flex items-center">
                  <span className="hidden sm:inline">QUERO ESSES PRODUTOS NA MINHA LOJA</span>
                  <span className="sm:hidden">QUERO ESSES PRODUTOS</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>

            {galleryImages.length === 0 && (
              <div className="mt-6">
                <p className="text-gray-400 text-lg">
                  Em breve nossa galeria estará repleta de produtos incríveis!
                </p>
              </div>
            )}

            {galleryImages.length > 12 && (
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="group relative overflow-hidden border-2 border-ecko-red text-ecko-red hover:text-white px-8 md:px-10 py-3 text-base md:text-lg font-semibold uppercase tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-ecko-red/25 rounded-lg"
                >
                  <span className="absolute inset-0 bg-ecko-red transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  <span className="relative z-10 flex items-center">
                    Ver Mais Produtos
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-ecko-red">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4 sm:mb-6 uppercase tracking-wide leading-tight">
            <span className="block sm:inline">PRONTO PARA FAZER PARTE</span>
            <span className="block sm:inline"> DA FAM��LIA ECKO?</span>
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 px-2 leading-relaxed">
            Junte-se aos milhares de revendedores que já transformaram seus
            negócios com a marca mais desejada do streetwear brasileiro!
          </p>

          <Button
            onClick={() => setShowForm(true)}
            className="group relative overflow-hidden bg-white hover:bg-gray-50 text-ecko-red text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 h-auto font-black shadow-2xl hover:shadow-black/40 transition-all duration-300 hover:scale-105 uppercase tracking-wider w-full sm:w-auto max-w-sm sm:max-w-none mx-auto rounded-lg border-2 border-white hover:border-gray-200"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            <span className="relative z-10 flex items-center">
              <span className="hidden sm:inline">
                QUERO SER UM LOJISTA AUTORIZADO
              </span>
              <span className="sm:hidden">QUERO SER LOJISTA</span>
              <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-ecko-red/10 via-transparent to-ecko-red/10"></div>
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-ecko-red/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-ecko-red/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-ecko-red/20 backdrop-blur-sm border border-ecko-red/30 rounded-full px-6 py-3 mb-6">
              <span className="text-ecko-red font-bold uppercase tracking-wider text-sm">
                Credibilidade
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
              Os <span className="text-ecko-red">NÚMEROS</span> que Comprovam nosso Sucesso
              <span className="block text-xl md:text-2xl text-gray-300 mt-2 font-medium normal-case tracking-normal">
                estatísticas de uma marca sólida
              </span>
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              Estatísticas que demonstram por que somos a escolha certa para seu negócio
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-12">
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

          {/* CTA Section for Stats */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-ecko-red/10 to-ecko-red-dark/10 rounded-2xl p-6 border border-ecko-red/20 backdrop-blur-sm max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-3">
                Faça Parte Desses Números de Sucesso!
              </h3>
              <p className="text-gray-300 mb-4">
                Junte-se a uma marca com credibilidade comprovada no mercado
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700 text-white px-8 py-4 font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-ecko-red/40 transition-all duration-300 hover:scale-105 uppercase tracking-wider rounded-lg"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                <span className="relative z-10 flex items-center">
                  <span className="hidden sm:inline">QUERO FAZER PARTE AGORA</span>
                  <span className="sm:hidden">QUERO FAZER PARTE</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="py-16 md:py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
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
                <HelpCircle className="w-4 h-4 text-ecko-red mr-2" />
                <span className="text-ecko-red font-bold uppercase tracking-wider text-sm">
                  Perguntas Frequentes
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                DÚVIDAS <span className="text-ecko-red">RESPONDIDAS</span>
                <span className="block text-xl md:text-2xl text-gray-300 mt-2 font-medium normal-case tracking-normal">
                  esclarecemos tudo para você
                </span>
              </h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
                Encontre respostas para as principais dúvidas sobre nosso
                programa de revendedores
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="shadow-2xl border-2 border-ecko-red/30 bg-gray-900/95 backdrop-blur-lg">
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="space-y-1">
                    {faqs
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((faq, index) => (
                        <AccordionItem
                          key={faq.id}
                          value={`faq-${faq.id}`}
                          className="group border-b border-gray-700 last:border-b-0 rounded-lg overflow-hidden hover:bg-gray-800/50 transition-all duration-300"
                        >
                          <AccordionTrigger className="text-left text-base font-bold text-white hover:text-ecko-red transition-colors py-4 px-3 group-hover:bg-gray-800/30 [&>svg]:text-ecko-red">
                            <div className="flex items-center">
                              <span className="bg-ecko-red/20 text-ecko-red font-black text-xs rounded-full w-7 h-7 flex items-center justify-center mr-3 group-hover:bg-ecko-red group-hover:text-white transition-all">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              {faq.question}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-300 text-sm leading-relaxed pb-4 px-3 pl-12">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* CTA Section */}
              <div className="text-center mt-16">
                <div className="bg-gradient-to-r from-ecko-red/10 to-ecko-red-dark/10 rounded-2xl p-6 border border-ecko-red/20 backdrop-blur-sm max-w-2xl mx-auto">
                  <h3 className="text-xl font-bold text-white mb-3">
                    Ainda tem dúvidas?
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Nossa equipe está pronta para ajudar você a se tornar um
                    revendedor oficial da marca de streetwear mais desejada do
                    Brasil
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="group relative overflow-hidden bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700 text-white px-8 py-4 font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-ecko-red/40 transition-all duration-300 hover:scale-105 uppercase tracking-wider rounded-lg"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    <span className="relative z-10 flex items-center">
                      <span className="hidden sm:inline">
                        FALE COM NOSSA EQUIPE
                      </span>
                      <span className="sm:hidden">FALAR COM EQUIPE</span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-[9999]">
        <div className="relative">
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
          <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-50"></div>

          {/* Main Button */}
          <Button
            onClick={() => setShowForm(true)}
            className="relative w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-2xl hover:shadow-green-500/50 transition-all duration-300 group border-2 sm:border-4 border-white hover:scale-110 touch-manipulation hover:rotate-12 active:scale-95"
          >
            <svg
              className="w-7 h-7 group-hover:scale-125 transition-transform duration-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516" />
            </svg>
          </Button>

          {/* Tooltip - Hidden on mobile, visible on larger screens */}
          <div className="hidden sm:block absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
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

      {/* Footer */}
      <footer className="bg-black py-6 md:py-8 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Ecko Unlimited. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
    </>
  );
}
