import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import {
  CheckCircle,
  Star,
  Quote,
  TrendingUp,
  Users,
  Crown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Testimonial, TestimonialsResponse } from "@shared/api";
import useEmblaCarousel from "embla-carousel-react";

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
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
    },
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(
        "/api/testimonials?active_only=true&limit=6",
      );
      const data: TestimonialsResponse = await response.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
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
              onClick={() => setIsSubmitted(false)}
              className="bg-ecko-red hover:bg-ecko-red-dark text-white"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 via-ecko-secondary to-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-ecko-red/10 via-transparent to-ecko-red/5"></div>
        <div
          className={
            'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ff0000" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-30'
          }
        ></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Hero Content */}
            <div className="space-y-8 text-center lg:text-left">
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

              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed">
                Transforme sua paixão por{" "}
                <span className="text-ecko-red font-bold">streetwear</span> em
                um negócio lucrativo com uma das marcas mais icônicas do Brasil
              </p>

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

            {/* Right Side - Form */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-ecko-red via-red-500 to-ecko-red-dark rounded-3xl opacity-20 blur-xl"></div>
              <Card className="relative shadow-2xl border-0 bg-white/95 backdrop-blur-lg">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Cadastro de Revendedor
                    </h2>
                    <p className="text-gray-600">
                      Preencha os dados para receber nossa proposta
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nome Completo
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Digite seu nome"
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
                        Tem CNPJ?
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
                        <option value="processo">
                          Em processo de abertura
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo de Loja
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
                        <option value="ainda-nao-tenho">
                          Ainda não tenho loja
                        </option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-ecko-red text-white py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
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

                    <p className="text-xs text-gray-500 text-center">
                      🔒 Seus dados estão seguros • Cadastro 100% gratuito
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Ecko Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Por que escolher a <span className="text-ecko-red">Ecko?</span>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
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
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
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
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
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

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-ecko-red/10 rounded-full px-6 py-3 mb-6">
                <Quote className="w-5 h-5 text-ecko-red mr-2" />
                <span className="text-ecko-red font-semibold">
                  O que nossos revendedores dizem
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Histórias de <span className="text-ecko-red">Sucesso</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Veja como nossos revendedores oficiais estão transformando suas
                vidas com a marca Ecko
              </p>
            </div>

            {/* Carousel Container */}
            <div className="relative">
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex space-x-4">
                  <button
                    onClick={scrollPrev}
                    disabled={!canScrollPrev}
                    className="group p-3 bg-white shadow-lg hover:shadow-xl rounded-full border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:bg-ecko-red disabled:hover:bg-white"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-white group-disabled:group-hover:text-gray-700" />
                  </button>
                  <button
                    onClick={scrollNext}
                    disabled={!canScrollNext}
                    className="group p-3 bg-white shadow-lg hover:shadow-xl rounded-full border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:bg-ecko-red disabled:hover:bg-white"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-white group-disabled:group-hover:text-gray-700" />
                  </button>
                </div>

                {/* Indicators */}
                <div className="hidden md:flex items-center space-x-2">
                  <div className="text-sm text-gray-500">
                    {testimonials.length} depoimentos
                  </div>
                </div>
              </div>

              {/* Carousel */}
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4"
                    >
                      <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden relative h-full mr-4">
                        <CardContent className="p-8 h-full flex flex-col">
                          {/* Quote Icon */}
                          <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Quote className="w-12 h-12 text-ecko-red" />
                          </div>

                          {/* Rating */}
                          <div className="flex items-center space-x-1 mb-6">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < testimonial.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Testimonial Content */}
                          <blockquote className="text-gray-700 text-lg leading-relaxed mb-8 relative z-10 flex-grow">
                            "{testimonial.content}"
                          </blockquote>

                          {/* Author Info */}
                          <div className="flex items-center space-x-4 mt-auto">
                            {testimonial.avatar_url ? (
                              <img
                                src={testimonial.avatar_url}
                                alt={testimonial.name}
                                className="w-14 h-14 rounded-full object-cover ring-4 ring-ecko-red/10"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-full flex items-center justify-center ring-4 ring-ecko-red/10">
                                <span className="text-white font-bold text-lg">
                                  {testimonial.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">
                                {testimonial.name}
                              </h4>
                              {testimonial.company && (
                                <p className="text-ecko-red font-medium">
                                  {testimonial.company}
                                </p>
                              )}
                              {testimonial.role && (
                                <p className="text-gray-600 text-sm">
                                  {testimonial.role}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto-scroll Indicator */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-ecko-red rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">
                    Arraste para navegar ou use as setas
                  </span>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-ecko-red/5 to-ecko-red-dark/5 rounded-2xl p-8 inline-block">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Junte-se aos nossos revendedores de sucesso!
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl">
                  Faça parte de uma rede de empreendedores que já conquistaram
                  seus objetivos com a marca Ecko
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Mais de 500 revendedores ativos</span>
                  <span className="mx-2">•</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Suporte completo</span>
                  <span className="mx-2">•</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Resultados garantidos</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-white mb-2">ECKO</h3>
                <p className="text-ecko-red text-sm font-semibold">
                  SOLUÇÕES PARA REVENDEDORES
                </p>
              </div>
              <p className="text-gray-300 text-lg">
                Há mais de 25 anos criando tendências no streetwear brasileiro.
                Junte-se a nós e faça parte desta história de sucesso!
              </p>
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
                <p>(11) 4000-2000</p>
                <p>revendedores@ecko.com.br</p>
                <p>São Paulo, SP - Brasil</p>
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
