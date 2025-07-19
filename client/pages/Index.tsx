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
  Zap,
  Shield,
  Phone,
  Mail,
  MapPin,
  Award,
  Rocket,
  Target,
} from "lucide-react";

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export default function Index() {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
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
          email: "",
          phone: "",
          company: "",
          message: "",
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
              Obrigado!
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Seu cadastro foi enviado com sucesso. Nossa equipe entrará em
              contato em breve para apresentar as melhores soluções para seu
              negócio.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="bg-ecko-red hover:bg-ecko-red-dark text-white px-8 py-3 text-lg"
            >
              Enviar Outro Lead
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
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-white font-black text-3xl">E</span>
                </div>
                <div>
                  <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tight">
                    ECKO
                  </h1>
                  <p className="text-ecko-red text-lg font-semibold tracking-wide">
                    SOLUÇÕES DIGITAIS
                  </p>
                </div>
              </div>

              {/* Main Headline */}
              <div className="space-y-6">
                <div className="inline-flex items-center bg-ecko-red/20 backdrop-blur-sm border border-ecko-red/30 rounded-full px-6 py-3">
                  <Rocket className="w-5 h-5 text-ecko-red mr-2" />
                  <span className="text-ecko-red font-semibold">
                    #1 em Transformação Digital
                  </span>
                </div>

                <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                  Revolucione seu
                  <span className="block bg-gradient-to-r from-ecko-red via-red-400 to-ecko-red bg-clip-text text-transparent">
                    NEGÓCIO
                  </span>
                  com tecnologia
                </h2>

                <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                  Potencialize seus resultados com nossas soluções inovadoras.
                  Mais de{" "}
                  <span className="text-ecko-red font-bold">
                    1000+ empresas
                  </span>{" "}
                  já transformaram seus negócios conosco.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 py-8">
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-black text-ecko-red">
                    1000+
                  </div>
                  <div className="text-gray-400 font-medium">
                    Empresas Atendidas
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-black text-ecko-red">
                    99%
                  </div>
                  <div className="text-gray-400 font-medium">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-black text-ecko-red">
                    24/7
                  </div>
                  <div className="text-gray-400 font-medium">Suporte</div>
                </div>
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-white font-medium">
                    Implementação Rápida
                  </span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-white font-medium">ROI Garantido</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-white font-medium">
                    Suporte Premium
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Lead Form */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-ecko-red via-red-500 to-ecko-red-dark rounded-3xl opacity-20 blur-xl"></div>
              <Card className="relative shadow-2xl border-0 bg-white/95 backdrop-blur-lg">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-ecko-gray">
                    Solicite uma Proposta
                  </CardTitle>
                  <p className="text-gray-600 text-lg">
                    Preencha o formulário e receba uma proposta personalizada em
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
                          Email Corporativo *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="seu@empresa.com.br"
                          required
                          className="h-12 border-gray-300 focus:border-ecko-red focus:ring-ecko-red"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-ecko-gray mb-2 block">
                            Telefone *
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
                            Empresa
                          </label>
                          <Input
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Nome da empresa"
                            className="h-12 border-gray-300 focus:border-ecko-red focus:ring-ecko-red"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-ecko-gray mb-2 block">
                          Como podemos ajudar?
                        </label>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Descreva suas necessidades e objetivos..."
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
                        "Solicitar Proposta Gratuita"
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      🔒 Seus dados estão seguros conosco. Ao enviar, você
                      concorda com nossa política de privacidade.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="bg-ecko-red/10 text-ecko-red border-ecko-red/20 mb-4 text-lg px-6 py-2">
              Por que ECKO?
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-ecko-gray mb-6">
              Soluções que <span className="text-ecko-red">Transformam</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos tecnologia de ponta com suporte humano especializado
              para garantir o sucesso do seu projeto
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-ecko-gray mb-4">
                  Performance Extrema
                </h3>
                <p className="text-gray-600 text-lg">
                  Soluções otimizadas que entregam resultados excepcionais e
                  aumentam sua produtividade em até 300%
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-ecko-gray mb-4">
                  Segurança Total
                </h3>
                <p className="text-gray-600 text-lg">
                  Proteção de dados de última geração com os mais altos padrões
                  de segurança e conformidade do mercado
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-ecko-gray mb-4">
                  Suporte Premium
                </h3>
                <p className="text-gray-600 text-lg">
                  Equipe especializada disponível 24/7 para garantir o sucesso
                  contínuo da sua operação
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-ecko-gray mb-8">
              Empresas que <span className="text-ecko-red">Confiam</span> na
              ECKO
            </h2>
            <div className="flex items-center justify-center space-x-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 fill-ecko-red text-ecko-red" />
              ))}
              <span className="text-2xl font-bold text-ecko-gray ml-4">
                4.9/5
              </span>
              <span className="text-gray-600">(+500 avaliações)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                company: "TechCorp Ltda",
                testimonial:
                  "A ECKO revolucionou nossos processos. Tivemos um aumento de 400% na eficiência operacional!",
                author: "Maria Silva",
                role: "CEO",
                image: "MS",
              },
              {
                company: "InnovateX",
                testimonial:
                  "Implementação perfeita e suporte excepcional. O ROI foi alcançado em apenas 2 meses.",
                author: "João Santos",
                role: "CTO",
                image: "JS",
              },
              {
                company: "GrowthCo",
                testimonial:
                  "Resultados surpreendentes! A melhor decisão estratégica que tomamos este ano.",
                author: "Ana Costa",
                role: "Diretora Comercial",
                image: "AC",
              },
            ].map((testimonial, index) => (
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
                    "{testimonial.testimonial}"
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {testimonial.image}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-ecko-gray text-lg">
                        {testimonial.author}
                      </div>
                      <div className="text-ecko-red font-medium">
                        {testimonial.role}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {testimonial.company}
                      </div>
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
                <div className="w-12 h-12 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <div>
                  <span className="text-2xl font-black">ECKO</span>
                  <p className="text-ecko-red text-sm font-semibold">
                    SOLUÇÕES DIGITAIS
                  </p>
                </div>
              </div>
              <p className="text-gray-300 text-lg">
                Transformando negócios através da tecnologia e inovação há mais
                de 10 anos.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-ecko-red rounded-full flex items-center justify-center cursor-pointer hover:bg-ecko-red-dark transition-colors">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-ecko-red rounded-full flex items-center justify-center cursor-pointer hover:bg-ecko-red-dark transition-colors">
                  <span className="text-sm font-bold">in</span>
                </div>
                <div className="w-10 h-10 bg-ecko-red rounded-full flex items-center justify-center cursor-pointer hover:bg-ecko-red-dark transition-colors">
                  <span className="text-sm font-bold">ig</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-xl">Soluções</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Transformação Digital
                </li>
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Analytics Avançado
                </li>
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Automação de Processos
                </li>
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Consultoria Estratégica
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-xl">Empresa</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Sobre a ECKO
                </li>
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Nossa Equipe
                </li>
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Cases de Sucesso
                </li>
                <li className="hover:text-ecko-red cursor-pointer transition-colors">
                  Trabalhe Conosco
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-xl">Contato</h4>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-ecko-red" />
                  <span>(11) 3000-0000</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-ecko-red" />
                  <span>contato@ecko.com.br</span>
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
            <p>
              &copy; 2024 ECKO Soluções Digitais. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
