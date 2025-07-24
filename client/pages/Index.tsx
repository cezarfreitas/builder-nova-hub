import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { DynamicHead } from "../components/DynamicHead";
import { useToast } from "../hooks/use-toast";
import { useSessionId } from "../hooks/useSessionId";
import { useContent } from "../hooks/useContent";
import { renderTextWithColorTokens } from "../utils/colorTokens";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  CheckCircle,
  Globe,
  Truck,
  HeadphonesIcon,
  Monitor,
  ArrowRight,
  ChevronDown,
  HelpCircle,
  Star,
  Image,
  X,
} from "lucide-react";

interface LeadFormData {
  name: string;
  whatsapp: string;
  hasCnpj: string;
  storeType: string;
  cep: string;
  endereco: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  formOrigin?: string;
}

export default function Index() {
  const { toast } = useToast();
  const sessionId = useSessionId();
  const { content, loading: contentLoading } = useContent();

  // Dynamic hero settings from JSON
  const currentHero = content.hero;

  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    whatsapp: "",
    hasCnpj: "",
    storeType: "",
    cep: "",
    endereco: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [cnpjError, setCnpjError] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [cepError, setCepError] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [formOrigin, setFormOrigin] = useState<string>("");
  const [startTime] = useState(Date.now());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(true);
  const [whatsappClickCount, setWhatsappClickCount] = useState(0);
  const [userId] = useState(() => {
    // Gerar user_id único baseado em dados do navegador
    const fingerprint = `${navigator.userAgent}-${screen.width}x${screen.height}-${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
    return btoa(fingerprint).slice(0, 20);
  });

  // Static testimonials texts

  const staticFAQs = [
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
      question: "Voc��s oferecem exclusividade territorial?",
      answer:
        "Sim! Dependendo da região e do perfil do parceiro, oferecemos prote��ão territorial para garantir que você tenha espaço para crescer sem concorrência direta de outros revendedores oficiais.",
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
        "Trabalhamos com estoque disponível para pronta entrega. O prazo médio é de 5 a 10 dias úteis, dependendo da localização. Para pedidos maiores, o prazo pode ser negociado conforme a necessidade.",
      display_order: 5,
      is_active: true,
    },
  ];

  // Função para rastrear clique no WhatsApp
  // Tracking WhatsApp clicks directly via API

  // Capturar informações de origem do tráfego
  useEffect(() => {
    const captureTrafficSource = async () => {
      try {
        const referrer = document.referrer;
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);

        // Identificar fonte do tráfego
        let sourceName = "Direto";
        if (referrer) {
          if (referrer.includes("google.com")) sourceName = "Google";
          else if (referrer.includes("facebook.com")) sourceName = "Facebook";
          else if (referrer.includes("instagram.com")) sourceName = "Instagram";
          else if (referrer.includes("whatsapp.com")) sourceName = "WhatsApp";
          else if (referrer.includes("youtube.com")) sourceName = "YouTube";
          else if (referrer.includes("tiktok.com")) sourceName = "TikTok";
          else if (referrer.includes("linkedin.com")) sourceName = "LinkedIn";
          else sourceName = new URL(referrer).hostname;
        }

        const trafficSource = {
          referrer: referrer || "Direto",
          source_name: sourceName,
          utm_source: urlParams.get("utm_source") || "",
          utm_medium: urlParams.get("utm_medium") || "",
          utm_campaign: urlParams.get("utm_campaign") || "",
          utm_term: urlParams.get("utm_term") || "",
          utm_content: urlParams.get("utm_content") || "",
          current_url: currentUrl,
          timestamp: new Date().toISOString(),
          session_id: sessionId,
          user_id: userId,
          page_title: document.title,
        };

        // Salvar no banco de dados MySQL
        try {
          const response = await fetch("/api/traffic/track", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(trafficSource),
          });

          if (response.ok) {
            console.log("✅ Origem salva no banco:", sourceName);
          } else {
            throw new Error("Falha na API");
          }
        } catch (apiError) {
          console.warn("⚠️ Falha na API de tráfego:", apiError);
        }

        console.log("📊 Origem capturada:", sourceName, trafficSource);
      } catch (error) {
        console.warn("Erro ao capturar origem do tráfego:", error);
      }
    };

    // Capturar origem na primeira visita
    captureTrafficSource();
  }, []); // Executar apenas uma vez

  // Track page view
  useEffect(() => {
    const trackPageView = async () => {
      try {
        const response = await fetch("/api/analytics/track-visit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "page_view",
            session_id: sessionId,
            user_id: userId,
            page_url: window.location.href,
            referrer: document.referrer,
            duration_seconds: 0,
          }),
        });

        if (response.ok) {
          console.log("✅ Page view registrada no banco");
        } else {
          console.warn("⚠️ Erro ao registrar page view");
        }
      } catch (e) {
        console.warn("Erro ao rastrear page view:", e);
      }
    };

    trackPageView();
  }, [sessionId, userId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "whatsapp") {
      // Formatação do WhatsApp
      const formattedValue = formatWhatsApp(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));

      // Validação do WhatsApp
      if (formattedValue && !validateWhatsApp(formattedValue)) {
        setWhatsappError(content.form.fields.whatsapp_error);
      } else {
        setWhatsappError("");
      }
    } else if (name === "cep") {
      // Formatação do CEP
      const formattedValue = formatCEP(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));

      // Validação e busca automática
      if (validateCEP(formattedValue)) {
        fetchAddressByCEP(formattedValue);
      } else if (formattedValue) {
        setCepError("Digite um CEP válido. Ex: 12345-678");
      } else {
        setCepError("");
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Validar CNPJ imediatamente
    if (name === "hasCnpj") {
      if (value === "nao") {
        setCnpjError(content.form.fields.cnpj_error);
      } else {
        setCnpjError("");
      }
    }
  };

  // Função para abrir formulário com origem específica
  const openFormWithOrigin = (origin: string) => {
    setFormOrigin(origin);
    setIsModalOpen(true);
  };

  // Função para formatar WhatsApp
  const formatWhatsApp = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Limita a 11 dígitos (DDD + 9 dígitos)
    const limited = numbers.slice(0, 11);

    // Aplica formataç��o
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 7) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else if (limited.length <= 11) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }

    return limited;
  };

  // Funç��o para validar WhatsApp
  const validateWhatsApp = (whatsapp: string): boolean => {
    // Remove formatação
    const numbers = whatsapp.replace(/\D/g, "");

    // Verifica se tem 10 ou 11 dígitos (com DDD)
    if (numbers.length < 10 || numbers.length > 11) {
      return false;
    }

    // Verifica se o DDD é válido (11-99)
    const ddd = parseInt(numbers.slice(0, 2));
    if (ddd < 11 || ddd > 99) {
      return false;
    }

    // Se tem 11 dígitos, o 3º dígito deve ser 9 (celular)
    if (numbers.length === 11 && numbers[2] !== "9") {
      return false;
    }

    // Se tem 10 dígitos, não deve começar com 9 (fixo)
    if (numbers.length === 10 && numbers[2] === "9") {
      return false;
    }

    return true;
  };

  // Função para formatar CEP
  const formatCEP = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Limita a 8 dígitos
    const limited = numbers.slice(0, 8);

    // Aplica formata��ão
    if (limited.length <= 5) {
      return limited;
    } else {
      return `${limited.slice(0, 5)}-${limited.slice(5)}`;
    }
  };

  // Função para validar CEP
  const validateCEP = (cep: string): boolean => {
    const numbers = cep.replace(/\D/g, "");
    return numbers.length === 8;
  };

  // Fun����ão para buscar endereço pelo CEP
  const fetchAddressByCEP = async (cep: string) => {
    const numbers = cep.replace(/\D/g, "");

    if (numbers.length !== 8) {
      return;
    }

    setCepLoading(true);
    setCepError("");

    try {
      const response = await fetch(`https://viacep.com.br/ws/${numbers}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError("CEP não encontrado. Verifique se está correto.");
        return;
      }

      // Atualizar dados do endereço
      setFormData((prev) => ({
        ...prev,
        endereco: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      }));

      setCepError("");
    } catch (error) {
      setCepError("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar WhatsApp
    if (!formData.whatsapp || !validateWhatsApp(formData.whatsapp)) {
      toast({
        title: "⚠���� WhatsApp Inválido",
        description: content.form.validation_messages.whatsapp_invalid,
        variant: "destructive",
      });
      return;
    }

    // Validar CEP
    if (!formData.cep || !validateCEP(formData.cep)) {
      toast({
        title: "��️ CEP Obrigatório",
        description: "Digite um CEP válido para identificar sua localização.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o endereço foi carregado
    if (!formData.cidade || !formData.estado) {
      toast({
        title: "⚠️ Endere��o Incompleto",
        description: content.form.validation_messages.address_incomplete,
        variant: "destructive",
      });
      return;
    }

    // Se não tem CNPJ, não prosseguir
    if (formData.hasCnpj === "nao") {
      toast({
        title: "⚠️ CNPJ Obrigatório",
        description: content.form.validation_messages.cnpj_required,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          formOrigin: formOrigin || "form-inline",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Cadastro enviado!",
          description:
            "Nossa equipe entrar�� em contato em até 24h. Obrigado pelo interesse!",
          duration: 8000,
        });
        setIsSubmitted(true);
        setFormData({
          name: "",
          whatsapp: "",
          hasCnpj: "",
          storeType: "",
          cep: "",
          endereco: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
        });
        setWhatsappError("");
        setCnpjError("");
        setCepError("");
      } else {
        toast({
          title: "❌ Erro no envio",
          description:
            result.message || "Erro ao enviar cadastro. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erro de conexão",
        description:
          "Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToContent = () => {
    // Use requestAnimationFrame to avoid forced reflow
    requestAnimationFrame(() => {
      const element = document.getElementById("content-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
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
              Nossa equipe entrará em contato em at�� 24h para apresentar nossa
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
              <span className="relative z-10">Voltar ao Início</span>
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
                  className="h-12 text-base bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-ecko-red focus:ring-ecko-red/20"
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
                  className={`h-12 text-base bg-white text-gray-900 placeholder-gray-500 focus:ring-ecko-red/20 ${
                    whatsappError
                      ? "border-red-500 focus:border-red-500"
                      : formData.whatsapp && validateWhatsApp(formData.whatsapp)
                        ? "border-green-500 focus:border-green-500"
                        : "border-gray-300 focus:border-ecko-red"
                  }`}
                />
                {whatsappError && (
                  <p className="text-red-400 text-sm mt-2 font-medium leading-tight">
                    {whatsappError}
                  </p>
                )}
                {formData.whatsapp &&
                  !whatsappError &&
                  validateWhatsApp(formData.whatsapp) && (
                    <p className="text-green-400 text-sm mt-2 font-medium leading-tight">
                      ✅ WhatsApp válido
                    </p>
                  )}
              </div>

              {/* Campo CEP */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  CEP
                </label>
                <Input
                  name="cep"
                  type="text"
                  value={formData.cep}
                  onChange={handleInputChange}
                  placeholder="12345-678"
                  required
                  className={`h-12 text-base bg-white text-gray-900 placeholder-gray-500 focus:ring-ecko-red/20 ${
                    cepError
                      ? "border-red-500 focus:border-red-500"
                      : formData.cep &&
                          validateCEP(formData.cep) &&
                          formData.cidade
                        ? "border-green-500 focus:border-green-500"
                        : "border-gray-300 focus:border-ecko-red"
                  }`}
                />
                {cepLoading && (
                  <p className="text-blue-400 text-sm mt-2 font-medium leading-tight">
                    🔍 Validando CEP...
                  </p>
                )}
                {cepError && (
                  <p className="text-red-400 text-sm mt-2 font-medium leading-tight">
                    {cepError}
                  </p>
                )}
                {formData.cep &&
                  !cepError &&
                  !cepLoading &&
                  formData.cidade && (
                    <p className="text-green-400 text-sm mt-2 font-medium leading-tight">
                      ✅ CEP válido
                    </p>
                  )}
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
                  className="w-full h-12 bg-white border border-gray-300 rounded-md px-4 text-gray-900 focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none text-base"
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
                  className="w-full h-12 bg-white border border-gray-300 rounded-md px-4 text-gray-900 focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none text-base"
                >
                  <option value="">Selecione</option>
                  <option value="fisica">Física</option>
                  <option value="online">Online</option>
                  <option value="ambas">F��sica + Online</option>
                </select>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormOrigin("");
                    setWhatsappError("");
                    setCnpjError("");
                    setCepError("");
                  }}
                  className="group relative overflow-hidden flex-1 h-12 border-2 border-gray-800 bg-transparent text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg"
                >
                  <span className="absolute inset-0 bg-black/90 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  <span className="relative z-10">Voltar</span>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || formData.hasCnpj === "nao"}
                  className={`group relative overflow-hidden flex-1 h-12 font-bold transition-all duration-300 rounded-lg ${
                    formData.hasCnpj === "nao"
                      ? "bg-black/70 cursor-not-allowed"
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
        <section
          className="h-screen relative flex flex-col justify-center items-center overflow-hidden"
          style={{
            backgroundColor: currentHero.background_color,
            color: currentHero.text_color,
          }}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            {currentHero.background_image ? (
              <img
                src={currentHero.background_image}
                alt="Background do Hero"
                className="w-full h-full object-cover transition-opacity duration-500"
                loading="eager"
                fetchpriority="high"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ backgroundColor: currentHero.background_color }}
              />
            )}

            {/* Multiple Overlay Layers for Better Effect */}
            <div className="absolute inset-0 bg-black/70 z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-ecko-red/15 via-transparent to-ecko-red/15 z-10"></div>
          </div>

          {/* Content */}
          <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto">
            {/* Logo */}
            {currentHero.logo_url && (
              <div className="flex items-center justify-center pt-4 sm:pt-8 lg:pt-12 mb-8 sm:mb-10 lg:mb-12">
                <img
                  src={currentHero.logo_url}
                  alt="Logo Ecko - Marca líder em streetwear brasileiro"
                  className="w-40 h-16 sm:w-48 sm:h-20 lg:w-56 lg:h-24 xl:w-64 xl:h-28 object-contain"
                  onError={(e) => {
                    // Fallback para logo de texto se a imagem falhar
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".text-logo")) {
                      const textLogo = document.createElement("div");
                      textLogo.className =
                        "text-logo text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white text-center py-4";
                      textLogo.innerHTML =
                        '<span class="text-ecko-red">ECKO</span><span class="text-white"> UNLTD</span>';
                      parent.appendChild(textLogo);
                    }
                  }}
                />
              </div>
            )}

            {/* Subtitle */}
            {currentHero.subtitle && (
              <div
                className="text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-4 font-medium opacity-90 px-2 transition-all duration-500"
                style={{ color: currentHero.text_color }}
              >
                {renderTextWithColorTokens(currentHero.subtitle)}
              </div>
            )}

            {/* Main Message */}
            {currentHero.title && (
              <div
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 leading-tight px-2 transition-all duration-500"
                style={{ color: currentHero.text_color }}
              >
                {renderTextWithColorTokens(currentHero.title)}
              </div>
            )}

            {/* Description */}
            {currentHero.description && (
              <div
                className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-10 lg:mb-12 font-medium max-w-2xl mx-auto px-2 opacity-90 transition-all duration-500"
                style={{ color: currentHero.text_color }}
              >
                {renderTextWithColorTokens(currentHero.description)}
              </div>
            )}

            {/* CTA Buttons */}
            {currentHero.cta_secondary_text && (
              <div className="flex flex-col items-center">
                <>
                  <style>
                    {`
                    .hero-cta-button:hover .hero-cta-text {
                      color: ${currentHero.cta_text_color || "#dc2626"} !important;
                    }
                  `}
                  </style>
                  <div
                    className="hero-cta-button mb-6 sm:mb-8 group relative overflow-hidden bg-transparent border-2 font-bold px-6 sm:px-10 py-4 sm:py-5 h-auto text-sm sm:text-lg uppercase tracking-wider transition-all duration-500 hover:scale-105 hover:shadow-2xl rounded-lg cursor-pointer min-h-[56px] w-full sm:w-auto flex items-center justify-center"
                    onClick={scrollToContent}
                    style={{
                      borderColor: currentHero.cta_color,
                      color: currentHero.text_color || "#ffffff",
                    }}
                  >
                    <span
                      className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                      style={{ backgroundColor: currentHero.cta_color }}
                    ></span>
                    <span
                      className="hero-cta-text relative z-10 flex items-center transition-colors duration-300"
                      style={{ color: currentHero.text_color || "#ffffff" }}
                    >
                      {currentHero.cta_secondary_text}
                      <ChevronDown className="ml-2 w-6 h-6 group-hover:animate-bounce" />
                    </span>
                  </div>
                </>

                {/* Scroll Indicator */}
                <div
                  onClick={scrollToContent}
                  className="flex flex-col items-center animate-bounce cursor-pointer hover:scale-110 transition-transform duration-300"
                >
                  <div
                    className="w-1 h-12 bg-gradient-to-b to-transparent rounded-full mb-2"
                    style={{
                      background: `linear-gradient(to bottom, ${currentHero.cta_color}, transparent)`,
                    }}
                  ></div>
                  <ChevronDown
                    className="w-6 h-6 animate-pulse hover:text-white transition-colors"
                    style={{ color: currentHero.cta_color }}
                  />
                </div>
              </div>
            )}
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
                    {renderTextWithColorTokens(content.form.main_title)}
                  </h1>

                  <div className="text-lg sm:text-xl lg:text-2xl text-gray-100 mb-6 sm:mb-7 lg:mb-8 font-medium px-2 lg:px-0 transition-all duration-500">
                    {renderTextWithColorTokens(content.form.main_description)}
                  </div>
                </div>

                {/* Right Form */}
                <div className="relative mt-6 lg:mt-0">
                  <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-ecko-red via-red-500 to-ecko-red-dark rounded-3xl opacity-20 blur-xl"></div>
                  <Card className="relative shadow-2xl border-2 border-ecko-red/40 bg-black/90 backdrop-blur-lg">
                    <CardContent className="p-4 sm:p-6 lg:p-8">
                      <div className="text-center mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">
                          {renderTextWithColorTokens(content.form.title)}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-300">
                          {renderTextWithColorTokens(content.form.subtitle)}
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            {content.form.fields.name_label}
                          </label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder={content.form.fields.name_placeholder}
                            required
                            className="h-12 text-base bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-ecko-red focus:ring-ecko-red/20"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            {content.form.fields.whatsapp_label}
                          </label>
                          <Input
                            name="whatsapp"
                            type="tel"
                            value={formData.whatsapp}
                            onChange={handleInputChange}
                            placeholder={
                              content.form.fields.whatsapp_placeholder
                            }
                            required
                            className={`h-12 text-base bg-white text-gray-900 placeholder-gray-500 focus:ring-ecko-red/20 ${
                              whatsappError
                                ? "border-red-500 focus:border-red-500"
                                : formData.whatsapp &&
                                    validateWhatsApp(formData.whatsapp)
                                  ? "border-green-500 focus:border-green-500"
                                  : "border-gray-300 focus:border-ecko-red"
                            }`}
                          />
                          {whatsappError && (
                            <p className="text-red-400 text-xs mt-2 font-medium leading-tight">
                              {whatsappError}
                            </p>
                          )}
                          {formData.whatsapp &&
                            !whatsappError &&
                            validateWhatsApp(formData.whatsapp) && (
                              <p className="text-green-400 text-xs mt-2 font-medium leading-tight">
                                {content.form.fields.whatsapp_success}
                              </p>
                            )}
                        </div>

                        {/* Campo CEP */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            {content.form.fields.cep_label}
                          </label>
                          <Input
                            name="cep"
                            type="text"
                            value={formData.cep}
                            onChange={handleInputChange}
                            placeholder={content.form.fields.cep_placeholder}
                            required
                            className={`h-12 text-base bg-white text-gray-900 placeholder-gray-500 focus:ring-ecko-red/20 ${
                              cepError
                                ? "border-red-500 focus:border-red-500"
                                : formData.cep &&
                                    validateCEP(formData.cep) &&
                                    formData.cidade
                                  ? "border-green-500 focus:border-green-500"
                                  : "border-gray-300 focus:border-ecko-red"
                            }`}
                          />
                          {cepLoading && (
                            <p className="text-blue-400 text-xs mt-2 font-medium leading-tight">
                              🔍 Validando CEP...
                            </p>
                          )}
                          {cepError && (
                            <p className="text-red-400 text-xs mt-2 font-medium leading-tight">
                              {cepError}
                            </p>
                          )}
                          {formData.cep &&
                            !cepError &&
                            !cepLoading &&
                            formData.cidade && (
                              <p className="text-green-400 text-xs mt-2 font-medium leading-tight">
                                ✅ CEP válido
                              </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                              {content.form.fields.cnpj_label}
                            </label>
                            <select
                              name="hasCnpj"
                              value={formData.hasCnpj}
                              onChange={handleInputChange}
                              required
                              className="w-full h-12 border border-gray-300 rounded-md px-4 bg-white text-gray-900 focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none text-base"
                            >
                              <option value="">Selecione</option>
                              <option value="sim">
                                {content.form.fields.cnpj_yes}
                              </option>
                              <option value="nao">
                                {content.form.fields.cnpj_no}
                              </option>
                            </select>
                            {cnpjError && (
                              <p className="text-ecko-red text-xs mt-2 font-medium leading-tight">
                                {cnpjError}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                              {content.form.fields.store_type_label}
                            </label>
                            <select
                              name="storeType"
                              value={formData.storeType}
                              onChange={handleInputChange}
                              required
                              className="w-full h-12 border border-gray-300 rounded-md px-4 bg-white text-gray-900 focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none text-base"
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
                          className={`group relative overflow-hidden w-full py-4 sm:py-5 text-base sm:text-lg lg:text-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 h-auto min-h-[56px] rounded-lg touch-manipulation ${
                            formData.hasCnpj === "nao"
                              ? "bg-black/70 cursor-not-allowed"
                              : "bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700 hover:scale-[1.02] hover:shadow-ecko-red/40"
                          } text-white`}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              {content.form.submit_button_loading}
                            </div>
                          ) : (
                            <>
                              <span className="hidden sm:inline">
                                {renderTextWithColorTokens(
                                  content.form.submit_button,
                                )}
                              </span>
                              <span className="sm:hidden">
                                {renderTextWithColorTokens(
                                  content.form.submit_button,
                                )}
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
      </main>

      {/* Dynamic Sections Based on Order Configuration */}
      {content.section_order?.enabled_sections
        ?.filter((section) => section.enabled)
        ?.sort((a, b) => a.order - b.order)
        ?.map((section) => {
          switch (section.id) {
            case "form":
              return (
                <main key="form">
                  {/* This form section is already rendered above in hero, skip */}
                </main>
              );

            case "benefits":
              return (
                <main key="benefits">
                  {/* Section Divider */}
                  <div
                    className="h-px mx-auto max-w-6xl opacity-20 hover:opacity-35 transition-opacity duration-700"
                    style={{
                      background:
                        "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                    }}
                  />

                  {/* Benefits Section */}
                  <section
                    className="py-16 md:py-20 bg-black relative overflow-hidden"
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
                        <div className="inline-flex items-center bg-ecko-red/30 backdrop-blur-sm border border-ecko-red/50 rounded-full px-6 py-3 mb-6">
                          <span className="text-white font-bold uppercase tracking-wider text-sm">
                            {renderTextWithColorTokens(
                              content.benefits.section_tag,
                            )}
                          </span>
                        </div>
                        <h2
                          id="vantagens-heading"
                          className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6"
                        >
                          {renderTextWithColorTokens(
                            content.benefits.section_title,
                          )}
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light max-w-3xl mx-auto">
                          {renderTextWithColorTokens(
                            content.benefits.section_subtitle,
                          )}
                        </p>
                        <p className="text-lg text-gray-400 max-w-4xl mx-auto leading-relaxed">
                          {renderTextWithColorTokens(
                            content.benefits.section_description,
                          )}
                        </p>
                      </div>

                      {/* Benefits Cards */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {content.benefits.cards.map((benefit, index) => (
                          <div
                            key={benefit.id}
                            className="group relative"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="h-full bg-black/80 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 transition-all duration-500 hover:border-ecko-red/50 hover:shadow-2xl hover:shadow-ecko-red/10 hover:-translate-y-2">
                              <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  {benefit.icon === "Globe" && (
                                    <svg
                                      className="w-8 h-8 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
                                  {benefit.icon === "Truck" && (
                                    <svg
                                      className="w-8 h-8 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                      />
                                    </svg>
                                  )}
                                  {benefit.icon === "HeadphonesIcon" && (
                                    <svg
                                      className="w-8 h-8 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                      />
                                    </svg>
                                  )}
                                  {benefit.icon === "Monitor" && (
                                    <svg
                                      className="w-8 h-8 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-ecko-red transition-colors duration-300">
                                  {renderTextWithColorTokens(benefit.title)}
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                  {renderTextWithColorTokens(
                                    benefit.description,
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Call to Action */}
                      <div className="text-center">
                        <div className="bg-black/80 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto">
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                            {renderTextWithColorTokens(
                              content.benefits.cta_title,
                            )}
                          </h3>
                          <Button
                            size="lg"
                            className="bg-ecko-red hover:bg-ecko-red-dark text-white px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold group relative overflow-hidden transition-all duration-300 hover:scale-105 min-h-[56px] w-full sm:w-auto touch-manipulation"
                            onClick={() => openFormWithOrigin("cta")}
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                            <span className="relative z-10 flex items-center justify-center">
                              {content.benefits.cta_button_text}
                              <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </section>
                </main>
              );

            case "testimonials":
              return (
                <main key="testimonials">
                  {/* Section Divider */}
                  <div
                    className="h-px mx-auto max-w-6xl opacity-20 hover:opacity-35 transition-opacity duration-700"
                    style={{
                      background:
                        "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                    }}
                  />

                  {/* Testimonials Section */}
                  <section className="py-16 md:py-20 bg-black relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-1/4 left-0 w-96 h-96 bg-ecko-red/20 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-ecko-red/20 rounded-full blur-3xl"></div>
                    </div>

                    <div className="container mx-auto px-6 max-w-6xl relative z-10">
                      {/* Section Header */}
                      <div className="text-center mb-16">
                        <div className="inline-flex items-center bg-ecko-red/30 backdrop-blur-sm border border-ecko-red/50 rounded-full px-6 py-3 mb-6">
                          <span className="text-white font-bold uppercase tracking-wider text-sm">
                            {renderTextWithColorTokens(
                              content.testimonials.section_tag,
                            )}
                          </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                          {renderTextWithColorTokens(
                            content.testimonials.section_title,
                          )}
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light max-w-3xl mx-auto">
                          {renderTextWithColorTokens(
                            content.testimonials.section_subtitle,
                          )}
                        </p>
                        <p className="text-lg text-gray-400 max-w-4xl mx-auto leading-relaxed">
                          {renderTextWithColorTokens(
                            content.testimonials.section_description,
                          )}
                        </p>
                      </div>

                      {/* Testimonials Grid */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {content.testimonials.items
                          ?.filter((testimonial) => testimonial.is_active)
                          ?.sort((a, b) => a.display_order - b.display_order)
                          ?.map((testimonial, index) => (
                            <div
                              key={testimonial.id}
                              className="group relative"
                              style={{ animationDelay: `${index * 150}ms` }}
                            >
                              <div className="h-full bg-black/80 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 transition-all duration-500 hover:border-ecko-red/50 hover:shadow-2xl hover:shadow-ecko-red/10 hover:-translate-y-2">
                                {/* Rating Stars */}
                                <div className="flex items-center mb-6">
                                  {[...Array(testimonial.rating)].map(
                                    (_, i) => (
                                      <Star
                                        key={i}
                                        className="w-5 h-5 text-yellow-400 fill-current"
                                      />
                                    ),
                                  )}
                                </div>

                                {/* Testimonial Content */}
                                <blockquote className="text-gray-300 leading-relaxed mb-6 italic">
                                  "
                                  {renderTextWithColorTokens(
                                    testimonial.content,
                                  )}
                                  "
                                </blockquote>

                                {/* Author Info */}
                                <div className="flex items-center">
                                  <img
                                    src={testimonial.avatar_url}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full border-2 border-ecko-red/30 mr-4 object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = "/placeholder.svg";
                                    }}
                                  />
                                  <div>
                                    <div className="font-semibold text-white group-hover:text-ecko-red transition-colors duration-300">
                                      {renderTextWithColorTokens(
                                        testimonial.name,
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      {testimonial.role} • {testimonial.company}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Call to Action */}
                      <div className="text-center">
                        <div className="bg-black/80 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto">
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            {renderTextWithColorTokens(
                              content.testimonials.cta_title,
                            )}
                          </h3>
                          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                            {renderTextWithColorTokens(
                              content.testimonials.cta_description,
                            )}
                          </p>
                          <Button
                            size="lg"
                            className="bg-ecko-red hover:bg-ecko-red-dark text-white px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold group relative overflow-hidden transition-all duration-300 hover:scale-105 min-h-[56px] w-full sm:w-auto touch-manipulation"
                            onClick={() => openFormWithOrigin("cta")}
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                            <span className="relative z-10 flex items-center justify-center">
                              {content.testimonials.cta_button_text}
                              <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </section>
                </main>
              );

            case "gallery":
              return (
                <main key="gallery">
                  {/* Section Divider */}
                  <div
                    className="h-px mx-auto max-w-6xl opacity-20 hover:opacity-35 transition-opacity duration-700"
                    style={{
                      background:
                        "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                    }}
                  />

                  {/* Gallery Section */}
                  <section className="py-16 md:py-20 bg-black relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-1/4 w-96 h-96 bg-ecko-red/20 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-ecko-red/20 rounded-full blur-3xl"></div>
                    </div>

                    <div className="container mx-auto px-6 max-w-6xl relative z-10">
                      {/* Section Header */}
                      <div className="text-center mb-16">
                        <div className="inline-flex items-center bg-ecko-red/20 backdrop-blur-sm border border-ecko-red/30 rounded-full px-6 py-3 mb-6">
                          <span className="text-ecko-red font-bold uppercase tracking-wider text-sm">
                            {renderTextWithColorTokens(
                              content.gallery.section_tag,
                            )}
                          </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                          {renderTextWithColorTokens(
                            content.gallery.section_title,
                          )}
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light max-w-3xl mx-auto">
                          {renderTextWithColorTokens(
                            content.gallery.section_subtitle,
                          )}
                        </p>
                        <p className="text-lg text-gray-400 max-w-4xl mx-auto leading-relaxed">
                          {renderTextWithColorTokens(
                            content.gallery.section_description,
                          )}
                        </p>
                      </div>

                      {/* Gallery Grid */}
                      {content.gallery.items?.filter((item) => item.is_active)
                        ?.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
                          {content.gallery.items
                            ?.filter((item) => item.is_active)
                            ?.sort((a, b) => a.display_order - b.display_order)
                            ?.map((item, index) => (
                              <div
                                key={item.id}
                                className="group relative overflow-hidden rounded-2xl bg-black/80 backdrop-blur-sm border border-gray-800/50 transition-all duration-500 hover:border-ecko-red/50 hover:shadow-2xl hover:shadow-ecko-red/10 hover:-translate-y-2"
                                style={{ animationDelay: `${index * 100}ms` }}
                              >
                                <div className="aspect-square relative overflow-hidden">
                                  <img
                                    src={item.image_url}
                                    alt={item.alt_text}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = "/placeholder.svg";
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 mx-auto mb-6 bg-black/90 rounded-full flex items-center justify-center">
                            <Image className="w-12 h-12 text-gray-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-4">
                            {content.gallery.empty_state_title}
                          </h3>
                          <p className="text-gray-400 max-w-md mx-auto">
                            {content.gallery.empty_state_description}
                          </p>
                        </div>
                      )}

                      {/* Call to Action */}
                      <div className="text-center">
                        <div className="bg-black/80 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto">
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            {renderTextWithColorTokens(
                              content.gallery.cta_title,
                            )}
                          </h3>
                          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                            {renderTextWithColorTokens(
                              content.gallery.cta_description,
                            )}
                          </p>
                          <Button
                            size="lg"
                            className="bg-ecko-red hover:bg-ecko-red-dark text-white px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold group relative overflow-hidden transition-all duration-300 hover:scale-105 min-h-[56px] w-full sm:w-auto touch-manipulation"
                            onClick={() => openFormWithOrigin("cta")}
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                            <span className="relative z-10 flex items-center justify-center text-center">
                              <span className="flex-shrink-0">
                                {content.gallery.cta_button_text}
                              </span>
                              <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </section>
                </main>
              );

            case "faq":
              return (
                <main key="faq">
                  {/* Section Divider */}
                  <div
                    className="h-px mx-auto max-w-6xl opacity-20 hover:opacity-35 transition-opacity duration-700"
                    style={{
                      background:
                        "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                    }}
                  />

                  {/* FAQ Section */}
                  <section className="py-16 md:py-20 bg-black relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-ecko-red/20 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-ecko-red/20 rounded-full blur-3xl"></div>
                    </div>

                    <div className="container mx-auto px-6 max-w-4xl relative z-10">
                      {/* Section Header */}
                      <div className="text-center mb-16">
                        <div className="inline-flex items-center bg-ecko-red/20 backdrop-blur-sm border border-ecko-red/30 rounded-full px-6 py-3 mb-6">
                          <span className="text-ecko-red font-bold uppercase tracking-wider text-sm">
                            {renderTextWithColorTokens(content.faq.section_tag)}
                          </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                          {renderTextWithColorTokens(content.faq.section_title)}
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light max-w-3xl mx-auto">
                          {renderTextWithColorTokens(
                            content.faq.section_subtitle,
                          )}
                        </p>
                        <p className="text-lg text-gray-400 max-w-4xl mx-auto leading-relaxed">
                          {renderTextWithColorTokens(
                            content.faq.section_description,
                          )}
                        </p>
                      </div>

                      {/* FAQ Accordion */}
                      <Accordion
                        type="single"
                        collapsible
                        className="space-y-4 mb-16"
                      >
                        {content.faq.items
                          ?.filter((item) => item.is_active)
                          ?.sort((a, b) => a.display_order - b.display_order)
                          ?.map((item) => (
                            <AccordionItem
                              key={item.id}
                              value={`item-${item.id}`}
                              className="bg-black/80 backdrop-blur-sm border border-gray-800/50 rounded-2xl px-6 transition-all duration-300 hover:border-ecko-red/50"
                            >
                              <AccordionTrigger className="text-left text-white hover:text-ecko-red transition-colors duration-300 py-6 text-lg font-semibold hover:no-underline">
                                {renderTextWithColorTokens(item.question)}
                              </AccordionTrigger>
                              <AccordionContent className="text-gray-300 pb-6 leading-relaxed">
                                {renderTextWithColorTokens(item.answer)}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                      </Accordion>

                      {/* Call to Action */}
                      <div className="text-center">
                        <div className="bg-black/80 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8 md:p-12">
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            {renderTextWithColorTokens(content.faq.cta_title)}
                          </h3>
                          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                            {renderTextWithColorTokens(
                              content.faq.cta_description,
                            )}
                          </p>
                          <Button
                            size="lg"
                            className="bg-ecko-red hover:bg-ecko-red-dark text-white px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold group relative overflow-hidden transition-all duration-300 hover:scale-105 min-h-[56px] w-full sm:w-auto touch-manipulation"
                            onClick={() => openFormWithOrigin("cta")}
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                            <span className="relative z-10 flex items-center justify-center">
                              {content.faq.cta_button_text}
                              <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </section>
                </main>
              );

            case "about":
              return (
                <main key="about">
                  {/* Section Divider */}
                  <div
                    className="h-px mx-auto max-w-6xl opacity-20 hover:opacity-35 transition-opacity duration-700"
                    style={{
                      background:
                        "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                    }}
                  />

                  {/* About Section */}
                  <section id="about" className="py-20 bg-black">
                    <div className="container mx-auto px-6">
                      {/* Header */}
                      <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-ecko-red/10 text-ecko-red text-sm font-semibold rounded-full mb-4">
                          {content.about?.section_tag || "Nossa História"}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                          {renderTextWithColorTokens(
                            content.about?.section_title || "SOBRE A {ECKO}",
                          )}
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
                          {content.about?.section_subtitle ||
                            "mais de 20 anos de streetwear"}
                        </p>
                        <p className="text-gray-300 max-w-3xl mx-auto">
                          {content.about?.section_description ||
                            "Conheça a trajetória de uma das marcas mais influentes do streetwear mundial"}
                        </p>
                      </div>

                      {/* Content */}
                      <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                        {/* Story Text */}
                        <div className="space-y-6">
                          {content.about?.content
                            ?.split("\n\n")
                            .map((paragraph, index) => (
                              <p
                                key={index}
                                className="text-gray-300 leading-relaxed text-lg"
                              >
                                {renderTextWithColorTokens(paragraph)}
                              </p>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-6">
                          {(content.about?.stats || []).map((stat) => (
                            <div
                              key={stat.id}
                              className="text-center p-6 bg-black/60 rounded-lg shadow-sm border border-gray-800"
                            >
                              <div className="text-3xl md:text-4xl font-bold text-ecko-red mb-2">
                                {stat.number}
                              </div>
                              <div className="text-white font-semibold mb-1">
                                {stat.label}
                              </div>
                              <div className="text-sm text-gray-300">
                                {stat.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="text-center bg-black rounded-2xl p-8 md:p-12 text-white">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">
                          {renderTextWithColorTokens(
                            content.about?.cta_title ||
                              "Faça Parte Desta História",
                          )}
                        </h3>
                        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                          {content.about?.cta_description ||
                            "Torne-se um revendedor oficial e ajude a escrever o próximo capítulo da Ecko"}
                        </p>
                        <Button
                          size="lg"
                          className="bg-ecko-red hover:bg-ecko-red-dark text-white px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-semibold group relative overflow-hidden min-h-[56px] w-full sm:w-auto touch-manipulation"
                          onClick={() => openFormWithOrigin("cta")}
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                          <span className="relative z-10 flex items-center justify-center">
                            {content.about?.cta_button_text ||
                              "QUERO SER PARTE DA ECKO"}
                            <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </Button>
                      </div>
                    </div>
                  </section>
                </main>
              );

            case "final_cta":
              return (
                <main key="final_cta">
                  {/* Section Divider */}
                  <div
                    className="h-px mx-auto max-w-6xl opacity-20 hover:opacity-35 transition-opacity duration-700"
                    style={{
                      background:
                        "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                    }}
                  />

                  {/* Final CTA Section */}
                  <section className="py-16 md:py-20 bg-ecko-red">
                    <div className="container mx-auto px-6 text-center">
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                        {renderTextWithColorTokens(content.final_cta.title)}
                      </h2>
                      <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-4xl mx-auto font-light leading-relaxed">
                        {renderTextWithColorTokens(
                          content.final_cta.description,
                        )}
                      </p>
                      <Button
                        size="lg"
                        onClick={() => openFormWithOrigin("cta")}
                        className="bg-white hover:bg-gray-100 text-ecko-red px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold group relative overflow-hidden transition-all duration-300 hover:scale-105 shadow-2xl min-h-[56px] w-full sm:w-auto touch-manipulation"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                        <span className="relative z-10 flex items-center justify-center">
                          <span className="hidden sm:inline">
                            {content.final_cta.button_text}
                          </span>
                          <span className="sm:hidden">
                            SER LOJISTA AUTORIZADO
                          </span>
                          <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </div>
                  </section>
                </main>
              );

            default:
              return null;
          }
        })}

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/logo-ecko.png"
                alt="Ecko Logo"
                className="h-8 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>

            {/* Social Links */}
            <div className="flex space-x-6">
              <a
                href={content.footer?.social_links?.facebook || "#"}
                target={
                  content.footer?.social_links?.facebook ? "_blank" : "_self"
                }
                rel={
                  content.footer?.social_links?.facebook
                    ? "noopener noreferrer"
                    : ""
                }
                className="text-gray-400 hover:text-ecko-red transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href={content.footer?.social_links?.instagram || "#"}
                target={
                  content.footer?.social_links?.instagram ? "_blank" : "_self"
                }
                rel={
                  content.footer?.social_links?.instagram
                    ? "noopener noreferrer"
                    : ""
                }
                className="text-gray-400 hover:text-ecko-red transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.017 0H7.983C3.577 0 0 3.577 0 7.983v4.034C0 16.423 3.577 20 7.983 20h4.034C16.423 20 20 16.423 20 12.017V7.983C20 3.577 16.423 0 12.017 0zM18.444 12.017c0 3.551-2.876 6.427-6.427 6.427H7.983c-3.551 0-6.427-2.876-6.427-6.427V7.983c0-3.551 2.876-6.427 6.427-6.427h4.034c3.551 0 6.427 2.876 6.427 6.427v4.034z"
                    clipRule="evenodd"
                  />
                  <path d="M10 5c-2.761 0-5 2.239-5 5s2.239 5 5 5 5-2.239 5-5-2.239-5-5-5zm0 8.333c-1.841 0-3.333-1.492-3.333-3.333S8.159 6.667 10 6.667s3.333 1.492 3.333 3.333S11.841 13.333 10 13.333zm5.208-8.541c0 .69-.559 1.25-1.25 1.25s-1.25-.56-1.25-1.25.559-1.25 1.25-1.25 1.25.56 1.25 1.25z" />
                </svg>
              </a>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-800 pt-6 w-full flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <p className="text-gray-500 text-sm">
                {renderTextWithColorTokens(
                  content.footer?.copyright ||
                    "© 2024 Ecko. Todos os direitos reservados. Seja um revendedor oficial e transforme seu negócio.",
                )}
              </p>
              <a
                href="/admin"
                className="text-gray-600 hover:text-ecko-red text-xs transition-colors"
              >
                Admin
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Form Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setFormOrigin("");
            setIsSubmitted(false);
          }
        }}
      >
        <DialogContent className="max-w-md mx-auto bg-black/95 border-2 border-ecko-red/40 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-white mb-4">
              {renderTextWithColorTokens(content.form.title)}
            </DialogTitle>
          </DialogHeader>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {content.form.fields.name_label}
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={content.form.fields.name_placeholder}
                  required
                  className="h-12 text-base bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-ecko-red focus:ring-ecko-red/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {content.form.fields.whatsapp_label}
                </label>
                <Input
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder={content.form.fields.whatsapp_placeholder}
                  required
                  className={`h-12 text-base bg-white text-gray-900 placeholder-gray-500 focus:ring-ecko-red/20 ${
                    whatsappError
                      ? "border-red-500 focus:border-red-500"
                      : validateWhatsApp(formData.whatsapp) && formData.whatsapp
                        ? "border-green-500 focus:border-green-500"
                        : "border-gray-300 focus:border-ecko-red"
                  }`}
                />
                {whatsappError && (
                  <p className="text-red-400 text-sm mt-2">{whatsappError}</p>
                )}
                {formData.whatsapp &&
                  !whatsappError &&
                  validateWhatsApp(formData.whatsapp) && (
                    <p className="text-green-400 text-sm mt-2 font-medium">
                      ✅ WhatsApp válido
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {content.form.fields.cep_label}
                </label>
                <Input
                  name="cep"
                  type="text"
                  value={formData.cep}
                  onChange={handleInputChange}
                  placeholder={content.form.fields.cep_placeholder}
                  required
                  className={`h-12 text-base bg-white text-gray-900 placeholder-gray-500 focus:ring-ecko-red/20 ${
                    cepError
                      ? "border-red-500 focus:border-red-500"
                      : cepLoading
                        ? "border-yellow-500 focus:border-yellow-500"
                        : formData.cidade && formData.estado
                          ? "border-green-500 focus:border-green-500"
                          : "border-gray-300 focus:border-ecko-red"
                  }`}
                  disabled={cepLoading}
                />
                {cepError && (
                  <p className="text-red-400 text-sm mt-2">{cepError}</p>
                )}
                {cepLoading && (
                  <p className="text-yellow-400 text-sm mt-2">
                    Buscando CEP...
                  </p>
                )}
              </div>

              {formData.cidade && formData.estado && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      {content.form.fields.cidade_label}
                    </label>
                    <Input
                      value={formData.cidade}
                      readOnly
                      className="h-12 text-base bg-black/90 border-gray-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      {content.form.fields.estado_label}
                    </label>
                    <Input
                      value={formData.estado}
                      readOnly
                      className="h-12 text-base bg-black/90 border-gray-800 text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {content.form.fields.cnpj_label}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="hasCnpj"
                      value="sim"
                      checked={formData.hasCnpj === "sim"}
                      onChange={handleInputChange}
                      className="mr-2 text-ecko-red"
                    />
                    <span className="text-white">
                      {content.form.fields.cnpj_yes}
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="hasCnpj"
                      value="nao"
                      checked={formData.hasCnpj === "nao"}
                      onChange={handleInputChange}
                      className="mr-2 text-ecko-red"
                    />
                    <span className="text-white">
                      {content.form.fields.cnpj_no}
                    </span>
                  </label>
                </div>
                {cnpjError && (
                  <p className="text-red-400 text-sm mt-2">{cnpjError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {content.form.fields.store_type_label}
                </label>
                <select
                  name="storeType"
                  value={formData.storeType}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 border border-gray-300 rounded-md px-4 bg-white text-gray-900 focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none text-base"
                >
                  <option value="">Selecione</option>
                  <option value="fisica">Física</option>
                  <option value="online">Online</option>
                  <option value="ambas">Física + Online</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || formData.hasCnpj === "nao"}
                className={`w-full h-12 font-bold text-base transition-all duration-300 ${
                  formData.hasCnpj === "nao"
                    ? "bg-black/70 cursor-not-allowed"
                    : "bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700 hover:scale-[1.02] hover:shadow-ecko-red/40"
                } text-white shadow-lg`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {content.form.submit_button_loading}
                  </div>
                ) : (
                  content.form.submit_button
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Cadastro Realizado!
              </h3>
              <p className="text-gray-300 mb-6">
                Obrigado pelo interesse! Nossa equipe entrará em contato em
                breve.
              </p>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsSubmitted(false);
                  setFormOrigin("");
                  setFormData({
                    name: "",
                    whatsapp: "",
                    hasCnpj: "",
                    storeType: "",
                    cep: "",
                    endereco: "",
                    complemento: "",
                    bairro: "",
                    cidade: "",
                    estado: "",
                  });
                }}
                className="bg-ecko-red hover:bg-ecko-red-dark text-white"
              >
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* WhatsApp Floating Button */}
      {showWhatsApp && (
        <div
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[9999] animate-in slide-in-from-right-4 slide-in-from-bottom-4 duration-700"
          style={{
            position: "fixed",
            zIndex: 9999,
            pointerEvents: "auto",
          }}
        >
          {/* Main WhatsApp Button */}
          <div className="relative group">
            {/* Pulse Animation Ring */}
            <div className="absolute -inset-1 bg-green-400 rounded-full animate-ping opacity-75"></div>
            <div className="absolute -inset-2 bg-green-300 rounded-full animate-pulse opacity-50"></div>

            {/* Notification Badge */}
            <div className="absolute -top-2 -right-2 bg-ecko-red text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white animate-bounce">
              {whatsappClickCount > 0 ? whatsappClickCount : 1}
            </div>

            {/* Main Button */}
            <Button
              onClick={async () => {
                // Track WhatsApp click via API only
                try {
                  const response = await fetch("/api/analytics/track-visit", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      event_type: "whatsapp_click",
                      session_id: sessionId,
                      user_id: userId,
                      page_url: window.location.href,
                      event_data: {
                        button_type: "floating",
                        timestamp: new Date().toISOString(),
                      },
                    }),
                  });

                  if (response.ok) {
                    console.log("✅ WhatsApp click registrado no banco");
                    setWhatsappClickCount((prev) => prev + 1);
                  } else {
                    console.warn("⚠️ Erro ao registrar click no banco");
                  }
                } catch (e) {
                  console.warn("Erro ao rastrear click:", e);
                }

                openFormWithOrigin("whatsapp-float");
              }}
              className="relative bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 shadow-2xl transition-all duration-300 hover:scale-110 group border-4 border-white"
              title="💬 Nova mensagem - Clique para se tornar revendedor Ecko!"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516z" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
