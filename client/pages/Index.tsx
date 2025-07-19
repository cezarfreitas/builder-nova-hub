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
      <div className="min-h-screen bg-gradient-to-br from-ecko-blue via-ecko-blue-dark to-ecko-gray flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-ecko-gray mb-2">
              Obrigado!
            </h2>
            <p className="text-muted-foreground mb-4">
              Seu cadastro foi enviado com sucesso. Nossa equipe entrará em
              contato em breve.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="bg-ecko-orange hover:bg-ecko-orange-dark text-white"
            >
              Enviar Outro Lead
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-ecko-gray-light to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-ecko-orange to-ecko-blue rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold text-ecko-gray">ECKO</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-ecko-gray hover:text-ecko-blue cursor-pointer transition-colors">
              Soluções
            </span>
            <span className="text-ecko-gray hover:text-ecko-blue cursor-pointer transition-colors">
              Sobre
            </span>
            <span className="text-ecko-gray hover:text-ecko-blue cursor-pointer transition-colors">
              Contato
            </span>
            <Button className="bg-ecko-orange hover:bg-ecko-orange-dark text-white">
              Fale Conosco
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-ecko-orange/10 text-ecko-orange border-ecko-orange/20">
                  ✨ Soluções Inovadoras
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-ecko-gray leading-tight">
                  Transforme seu
                  <span className="bg-gradient-to-r from-ecko-orange to-ecko-blue bg-clip-text text-transparent">
                    {" "}
                    negócio{" "}
                  </span>
                  com ECKO
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Impulsione seu crescimento com nossas soluções tecnológicas
                  avançadas. Conecte-se com milhares de empresas que já confiam
                  na ECKO para revolucionar seus processos.
                </p>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-ecko-gray">Implementação rápida</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-ecko-gray">Suporte 24/7</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-ecko-gray">ROI garantido</span>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-ecko-blue">500+</div>
                  <div className="text-sm text-muted-foreground">Empresas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-ecko-orange">98%</div>
                  <div className="text-sm text-muted-foreground">
                    Satisfação
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-ecko-blue">24/7</div>
                  <div className="text-sm text-muted-foreground">Suporte</div>
                </div>
              </div>
            </div>

            {/* Lead Form */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-ecko-gray">
                  Solicite uma Demonstração
                </CardTitle>
                <p className="text-muted-foreground">
                  Preencha o formulário e nossa equipe entrará em contato
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-ecko-gray mb-2 block">
                        Nome Completo *
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Seu nome"
                        required
                        className="border-ecko-gray/20 focus:border-ecko-blue"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-ecko-gray mb-2 block">
                        Email Corporativo *
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        required
                        className="border-ecko-gray/20 focus:border-ecko-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-ecko-gray mb-2 block">
                        Telefone *
                      </label>
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(11) 99999-9999"
                        required
                        className="border-ecko-gray/20 focus:border-ecko-blue"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-ecko-gray mb-2 block">
                        Empresa
                      </label>
                      <Input
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Nome da empresa"
                        className="border-ecko-gray/20 focus:border-ecko-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-ecko-gray mb-2 block">
                      Mensagem
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Conte-nos sobre suas necessidades..."
                      rows={4}
                      className="border-ecko-gray/20 focus:border-ecko-blue"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-ecko-orange to-ecko-blue hover:from-ecko-orange-dark hover:to-ecko-blue-dark text-white py-3 text-lg font-semibold"
                  >
                    {isSubmitting ? "Enviando..." : "Solicitar Demonstração"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Ao enviar, você concorda com nossos termos de uso e política
                    de privacidade.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ecko-gray mb-4">
              Por que escolher a ECKO?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Oferecemos soluções completas e personalizadas para impulsionar o
              crescimento do seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-ecko-orange to-ecko-blue rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-ecko-gray mb-4">
                  Performance Superior
                </h3>
                <p className="text-muted-foreground">
                  Soluções otimizadas que entregam resultados excepcionais e
                  aumentam sua produtividade
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-ecko-blue to-ecko-orange rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-ecko-gray mb-4">
                  Segurança Avançada
                </h3>
                <p className="text-muted-foreground">
                  Proteção de dados de última geração com os mais altos padrões
                  de segurança do mercado
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-ecko-orange to-ecko-blue rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-ecko-gray mb-4">
                  Suporte Especializado
                </h3>
                <p className="text-muted-foreground">
                  Equipe dedicada disponível 24/7 para garantir o sucesso da sua
                  implementação
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-ecko-gray-light">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ecko-gray mb-4">
              Empresas que confiam na ECKO
            </h2>
            <div className="flex items-center justify-center space-x-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 fill-ecko-orange text-ecko-orange"
                />
              ))}
              <span className="text-lg font-semibold text-ecko-gray ml-2">
                4.9/5
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                company: "TechCorp",
                testimonial:
                  "A ECKO transformou completamente nossos processos. Aumento de 300% na eficiência!",
                author: "Maria Silva, CEO",
              },
              {
                company: "InnovateX",
                testimonial:
                  "Implementação perfeita e suporte excepcional. Recomendo para todas as empresas.",
                author: "João Santos, CTO",
              },
              {
                company: "GrowthCo",
                testimonial:
                  "ROI surpreendente em apenas 3 meses. A melhor decisão que tomamos este ano.",
                author: "Ana Costa, Diretora",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-ecko-orange text-ecko-orange"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.testimonial}"
                  </p>
                  <div>
                    <div className="font-semibold text-ecko-gray">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-ecko-blue">
                      {testimonial.company}
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
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-ecko-orange to-ecko-blue rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
                <span className="text-xl font-bold">ECKO</span>
              </div>
              <p className="text-gray-300">
                Transformando negócios através da tecnologia e inovação.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-ecko-blue rounded-full flex items-center justify-center cursor-pointer hover:bg-ecko-blue-dark transition-colors">
                  <span className="text-xs font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-ecko-blue rounded-full flex items-center justify-center cursor-pointer hover:bg-ecko-blue-dark transition-colors">
                  <span className="text-xs font-bold">in</span>
                </div>
                <div className="w-8 h-8 bg-ecko-blue rounded-full flex items-center justify-center cursor-pointer hover:bg-ecko-blue-dark transition-colors">
                  <span className="text-xs font-bold">tw</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Soluções</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="hover:text-white cursor-pointer transition-colors">
                  Automação
                </li>
                <li className="hover:text-white cursor-pointer transition-colors">
                  Analytics
                </li>
                <li className="hover:text-white cursor-pointer transition-colors">
                  Integração
                </li>
                <li className="hover:text-white cursor-pointer transition-colors">
                  Consultoria
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="hover:text-white cursor-pointer transition-colors">
                  Sobre Nós
                </li>
                <li className="hover:text-white cursor-pointer transition-colors">
                  Carreiras
                </li>
                <li className="hover:text-white cursor-pointer transition-colors">
                  Blog
                </li>
                <li className="hover:text-white cursor-pointer transition-colors">
                  Parceiros
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>(11) 3000-0000</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>contato@ecko.com.br</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>São Paulo, SP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-600 mt-12 pt-8 text-center text-gray-300">
            <p>&copy; 2024 ECKO. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
