import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Shield,
  Phone,
  Mail,
  MapPin,
  Award,
  ShoppingBag,
  Target,
  Crown,
  Zap,
  Globe,
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      <div className="min-h-screen bg-gradient-to-br from-ecko-red via-ecko-red-dark to-ecko-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-2xl">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-ecko-gray mb-4">
              Parabéns!
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Recebemos seu interesse em se tornar um Revendedor Oficial Ecko.
              Nossa equipe entrará em contato em até 24h para apresentar nossa
              proposta exclusiva!
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="bg-ecko-red hover:bg-ecko-red-dark text-white px-8 py-3 text-lg"
            >
              Enviar Nova Solicitação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-ecko-secondary to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-ecko-red/10 via-transparent to-ecko-red/5"></div>
      <div
        className={
          'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ff0000" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-30'
        }
      ></div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Hero Content */}
            <div className="space-y-10 text-center lg:text-left">
              {/* Logo */}
              <div className="flex items-center justify-center lg:justify-start space-x-4 mb-8">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F3a038822502b49b39691cbaf44da5f95%2Feccf0f847f4c4b16a6f95a4577bb4282?format=webp&width=800"
                  alt="Ecko Unlimited Logo"
                  className="h-20 w-auto"
                />
              </div>

              {/* Main Headline */}
              <div className="space-y-6">
                <div className="inline-flex items-center bg-ecko-red/20 backdrop-blur-sm border border-ecko-red/30 rounded-full px-6 py-3">
                  <Crown className="w-5 h-5 text-ecko-red mr-2" />
                  <span className="text-ecko-red font-semibold">
                    Marca #1 em Streetwear
                  </span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                  Seja um
                  <span className="block bg-gradient-to-r from-ecko-red via-red-400 to-ecko-red bg-clip-text text-transparent">
                    REVENDEDOR
                  </span>
                  <span className="block text-ecko-red">OFICIAL ECKO</span>
                </h1>

                <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                  Transforme sua paixão por{" "}
                  <span className="text-ecko-red font-bold">streetwear</span> em
                  um negócio lucrativo com uma das marcas mais icônicas do
                  Brasil
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-white font-medium">
                    Cadastro Gratuito
                  </span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-white font-medium">
                    Suporte Completo
                  </span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-white font-medium">
                    Produtos Exclusivos
                  </span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-white font-medium">
                    Margem Atrativa
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 py-8">
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-black text-ecko-red">
                    500+
                  </div>
                  <div className="text-gray-400 font-medium">Revendedores</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-black text-ecko-red">
                    25+
                  </div>
                  <div className="text-gray-400 font-medium">Anos</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-black text-ecko-red">
                    1M+
                  </div>
                  <div className="text-gray-400 font-medium">Clientes</div>
                </div>
              </div>
            </div>

            {/* Right Side - Lead Form */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-ecko-red via-red-500 to-ecko-red-dark rounded-3xl opacity-20 blur-xl"></div>
              <Card className="relative shadow-2xl border-0 bg-white/95 backdrop-blur-lg">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-ecko-gray">
                    Quero Ser Revendedor Agora
                  </CardTitle>
                  <p className="text-gray-600 text-lg">
                    Preencha o formulário e receba nossa proposta exclusiva em
                    até 24h
                  </p>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-ecko-gray mb-2 block">
                          Nome Completo *
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Seu nome completo"
                          required
                          className="h-12 border-gray-300 focus:border-ecko-red focus:ring-ecko-red"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-ecko-gray mb-2 block">
                          Email *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="seu@email.com"
                          required
                          className="h-12 border-gray-300 focus:border-ecko-red focus:ring-ecko-red"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-ecko-gray mb-2 block">
                            Telefone/WhatsApp *
                          </label>
                          <Input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(11) 99999-9999"
                            required
                            className="h-12 border-gray-300 focus:border-ecko-red focus:ring-ecko-red"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-ecko-gray mb-2 block">
                            Cidade/Estado *
                          </label>
                          <Input
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="São Paulo/SP"
                            required
                            className="h-12 border-gray-300 focus:border-ecko-red focus:ring-ecko-red"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-ecko-gray mb-2 block">
                          Já possui loja/negócio?
                        </label>
                        <Input
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="Nome da loja (se tiver)"
                          className="h-12 border-gray-300 focus:border-ecko-red focus:ring-ecko-red"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-ecko-gray mb-2 block">
                          Experiência com vendas
                        </label>
                        <Input
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          placeholder="Ex: 2 anos vendendo roupas online"
                          className="h-12 border-gray-300 focus:border-ecko-red focus:ring-ecko-red"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-ecko-gray mb-2 block">
                          Por que quer ser revendedor Ecko?
                        </label>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Conte-nos sua motivação e objetivos..."
                          rows={4}
                          className="border-gray-300 focus:border-ecko-red focus:ring-ecko-red"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-ecko-red text-white py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </div>
                      ) : (
                        "QUERO SER REVENDEDOR AGORA"
                      )}
                    </Button>

                    <div className="text-center space-y-2">
                      <p className="text-xs text-gray-500">
                        🔒 Seus dados estão seguros conosco
                      </p>
                      <p className="text-xs text-gray-600">
                        ✓ Cadastro gratuito ✓ Suporte completo ✓ Produtos
                        exclusivos
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Ecko Section */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="bg-ecko-red/10 text-ecko-red border-ecko-red/20 mb-4 text-lg px-6 py-2">
              Por que escolher a Ecko?
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-ecko-gray mb-6">
              A marca que <span className="text-ecko-red">mais cresce</span> no
              streetwear
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Com mais de 25 anos de história, a Ecko é sinônimo de qualidade,
              estilo e inovação no universo do streetwear brasileiro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-ecko-gray mb-4">
                  Margem Atrativa
                </h3>
                <p className="text-gray-600 text-lg">
                  Margens competitivas e condições especiais para revendedores
                  oficiais. Lucre mais vendendo produtos de qualidade premium
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-ecko-gray mb-4">
                  Marca Reconhecida
                </h3>
                <p className="text-gray-600 text-lg">
                  Ecko é uma das marcas mais lembradas e desejadas do Brasil.
                  Venda produtos que os clientes já conhecem e confiam
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-ecko-gray mb-4">
                  Suporte Total
                </h3>
                <p className="text-gray-600 text-lg">
                  Treinamento completo, materiais de marketing, suporte de
                  vendas e acompanhamento dedicado para seu sucesso
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-ecko-gray mb-8">
              Histórias de <span className="text-ecko-red">Sucesso</span>
            </h2>
            <div className="flex items-center justify-center space-x-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 fill-ecko-red text-ecko-red" />
              ))}
              <span className="text-2xl font-bold text-ecko-gray ml-4">
                4.8/5
              </span>
              <span className="text-gray-600">(+200 avaliações)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Lucas Silva",
                location: "São Paulo/SP",
                story:
                  "Em 6 meses como revendedor Ecko, consegui triplicar minha renda! A marca vende sozinha.",
                sales: "R$ 15k/mês",
                image: "LS",
              },
              {
                name: "Ana Costa",
                location: "Rio de Janeiro/RJ",
                story:
                  "Comecei vendendo online e hoje tenho minha própria loja física. A Ecko mudou minha vida!",
                sales: "R$ 25k/mês",
                image: "AC",
              },
              {
                name: "Pedro Santos",
                location: "Belo Horizonte/MG",
                story:
                  "O suporte da equipe Ecko é incrível. Sempre me ajudam a vender mais e melhor!",
                sales: "R$ 18k/mês",
                image: "PS",
              },
            ].map((story, index) => (
              <Card key={index} className="border-0 shadow-xl bg-white p-2">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-2 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-ecko-red text-ecko-red"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 text-lg italic leading-relaxed">
                    "{story.story}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {story.image}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-ecko-gray text-lg">
                          {story.name}
                        </div>
                        <div className="text-gray-500">{story.location}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-ecko-red font-bold text-lg">
                        {story.sales}
                      </div>
                      <div className="text-gray-500 text-sm">faturamento</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ecko-gray text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F3a038822502b49b39691cbaf44da5f95%2Feccf0f847f4c4b16a6f95a4577bb4282?format=webp&width=800"
                  alt="Ecko Logo"
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-gray-300 text-lg">
                Há mais de 25 anos criando tendências no streetwear brasileiro.
                Junte-se a nós e faça parte desta história de sucesso!
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-ecko-red rounded-full flex items-center justify-center cursor-pointer hover:bg-ecko-red-dark transition-colors">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-ecko-red rounded-full flex items-center justify-center cursor-pointer hover:bg-ecko-red-dark transition-colors">
                  <span className="text-sm font-bold">ig</span>
                </div>
                <div className="w-10 h-10 bg-ecko-red rounded-full flex items-center justify-center cursor-pointer hover:bg-ecko-red-dark transition-colors">
                  <span className="text-sm font-bold">tt</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-xl">Para Revendedores</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Como Funciona
                </li>
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Catálogo de Produtos
                </li>
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Tabela de Preços
                </li>
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Materiais de Marketing
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-xl">Suporte</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Central de Ajuda
                </li>
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Política de Trocas
                </li>
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Entrega e Logística
                </li>
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Financeiro
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-xl">Contato</h4>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-ecko-red" />
                  <span>(11) 4000-2000</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-ecko-red" />
                  <span>revendedores@ecko.com.br</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-ecko-red" />
                  <span>São Paulo, SP - Brasil</span>
                </div>
              </div>
              <div className="mt-6">
                <a
                  href="/admin"
                  className="text-xs text-gray-500 hover:text-ecko-red transition-colors"
                >
                  Área Administrativa
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ecko Unlimited. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
