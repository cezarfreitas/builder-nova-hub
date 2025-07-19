import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import {
  CheckCircle,
  Globe,
  Truck,
  HeadphonesIcon,
  Monitor,
  Star,
  ArrowRight,
} from "lucide-react";

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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cadastro Enviado!
            </h2>
            <p className="text-gray-600 mb-6">
              Nossa equipe entrará em contato em até 24h para apresentar nossa
              proposta exclusiva!
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setShowForm(false);
              }}
              className="bg-ecko-red hover:bg-ecko-red-dark text-white"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Cadastro de Lojista
              </h2>
              <p className="text-gray-600">
                Preencha seus dados para se tornar um revendedor oficial
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Digite seu nome completo"
                  required
                  className="h-12 border-gray-300 focus:border-ecko-red focus:ring-ecko-red/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp
                </label>
                <Input
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  required
                  className="h-12 border-gray-300 focus:border-ecko-red focus:ring-ecko-red/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Possui CNPJ?
                </label>
                <select
                  name="hasCnpj"
                  value={formData.hasCnpj}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 border border-gray-300 rounded-md px-4 bg-white text-gray-900 focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="sim">Sim, tenho CNPJ</option>
                  <option value="nao">Não tenho CNPJ</option>
                  <option value="processo">Em processo de abertura</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Negócio
                </label>
                <select
                  name="storeType"
                  value={formData.storeType}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 border border-gray-300 rounded-md px-4 bg-white text-gray-900 focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none"
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
                  className="flex-1 h-12 border-gray-300 hover:bg-gray-50"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-ecko-red hover:bg-ecko-red-dark text-white font-semibold"
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">ECKO</h1>
              <p className="text-sm text-ecko-red font-medium">
                PROGRAMA DE REVENDEDORES
              </p>
            </div>
            <a
              href="/admin"
              className="text-sm text-gray-500 hover:text-ecko-red transition-colors"
            >
              Área Admin
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Revenda Ecko: Seja um{" "}
            <span className="text-ecko-red">Lojista Autorizado</span>
          </h1>

          <div className="w-16 h-1 bg-ecko-red mx-auto mb-6"></div>

          <h2 className="text-2xl lg:text-3xl font-bold text-ecko-red mb-6">
            Multiplique Suas Vendas!
          </h2>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Venda uma das marcas mais desejadas do streetwear e aumente seus
            lucros!
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Marca Internacional */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-ecko-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-ecko-red" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  MARCA INTERNACIONAL
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  A Ecko é uma marca reconhecida internacionalmente, com forte
                  presença no Brasil e grande apelo junto ao público jovem.
                </p>
              </CardContent>
            </Card>

            {/* Pronta Entrega */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-ecko-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="w-8 h-8 text-ecko-red" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  PRONTA ENTREGA
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Mais de 100.000 produtos prontos para entrega, com excelentes
                  margens de lucro e prazo giro de estoque.
                </p>
              </CardContent>
            </Card>

            {/* Suporte ao Lojista */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-ecko-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HeadphonesIcon className="w-8 h-8 text-ecko-red" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  SUPORTE AO LOJISTA
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Equipe de especialistas sempre à disposição para garantir a
                  melhor experiência na compra e venda.
                </p>
              </CardContent>
            </Card>

            {/* Totalmente Online */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-ecko-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Monitor className="w-8 h-8 text-ecko-red" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  TOTALMENTE ONLINE
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Plataforma exclusiva com preços de lojista para todo o Brasil,
                  facilitando compra e reabastecimento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Pronto para fazer parte da família Ecko?
          </h2>

          <Button
            onClick={() => setShowForm(true)}
            className="bg-ecko-red hover:bg-ecko-red-dark text-white text-lg px-8 py-4 h-auto font-bold shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            Quero Ser um Lojista Autorizado
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            🔒 Cadastro 100% seguro e gratuito
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-black text-ecko-red mb-2">
                25+
              </div>
              <div className="text-gray-300 font-medium">Anos de História</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-black text-ecko-red mb-2">
                500+
              </div>
              <div className="text-gray-300 font-medium">Lojistas Ativos</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-black text-ecko-red mb-2">
                100K+
              </div>
              <div className="text-gray-300 font-medium">Produtos</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-black text-ecko-red mb-2">
                1M+
              </div>
              <div className="text-gray-300 font-medium">Clientes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-black text-gray-900 mb-2">ECKO</h3>
            <p className="text-ecko-red font-semibold">UNLIMITED POTENTIAL</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-600">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Contato</h4>
              <p>(11) 4000-2000</p>
              <p>lojistas@ecko.com.br</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Suporte</h4>
              <p>Central de Ajuda</p>
              <p>Política de Trocas</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Empresa</h4>
              <p>São Paulo, SP</p>
              <p>CNPJ: 00.000.000/0001-00</p>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-xs text-gray-500">
            <p>&copy; 2024 Ecko Unlimited. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
