import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { CheckCircle, ShoppingBag, Star } from "lucide-react";

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
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-xl border">
          <CardContent className="p-10">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cadastro Enviado!
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Recebemos seu interesse em se tornar um Revendedor Oficial Ecko.
              Nossa equipe entrará em contato em até 24h!
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="bg-ecko-red hover:bg-ecko-red-dark text-white px-6 py-2"
            >
              Enviar Novo Cadastro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Column - Image and Content */}
        <div className="bg-gradient-to-br from-gray-900 via-ecko-secondary to-black flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-ecko-red/10 via-transparent to-ecko-red/5"></div>
          <div
            className={
              'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ff0000" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-30'
            }
          ></div>

          <div className="relative z-10 max-w-lg text-center lg:text-left">
            {/* Logo */}
            <div className="mb-10">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F3a038822502b49b39691cbaf44da5f95%2Feccf0f847f4c4b16a6f95a4577bb4282?format=webp&width=800"
                alt="Ecko Unlimited Logo"
                className="h-16 mx-auto lg:mx-0"
              />
            </div>

            {/* Main Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                  Seja um
                  <span className="block bg-gradient-to-r from-ecko-red via-red-400 to-ecko-red bg-clip-text text-transparent">
                    Revendedor
                  </span>
                  <span className="block text-ecko-red">Oficial Ecko</span>
                </h1>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Transforme sua paixão por{" "}
                  <span className="text-ecko-red font-semibold">
                    streetwear
                  </span>{" "}
                  em um negócio lucrativo
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <div className="flex items-center text-white">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="font-medium">Cadastro 100% Gratuito</span>
                </div>
                <div className="flex items-center text-white">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="font-medium">Suporte Completo</span>
                </div>
                <div className="flex items-center text-white">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="font-medium">Marca Reconhecida</span>
                </div>
                <div className="flex items-center text-white">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="font-medium">Margem Atrativa</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-ecko-red">500+</div>
                  <div className="text-gray-400 text-sm">Revendedores</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-ecko-red">25+</div>
                  <div className="text-gray-400 text-sm">Anos</div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="pt-6">
                <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-ecko-red text-ecko-red"
                    />
                  ))}
                  <span className="text-white font-semibold ml-2">4.8/5</span>
                </div>
                <p className="text-gray-400 text-sm">
                  +200 avaliações de revendedores
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="flex items-center justify-center p-8 lg:p-16 bg-gray-50">
          <div className="w-full max-w-md">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-ecko-red to-ecko-red-dark rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Cadastro de Revendedor
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Preencha os dados para receber nossa proposta
                </p>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      required
                      className="h-12 border-gray-300 focus:border-ecko-red focus:ring-ecko-red/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      WhatsApp *
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
                      Tem CNPJ? *
                    </label>
                    <select
                      name="hasCnpj"
                      value={formData.hasCnpj}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 border border-gray-300 rounded-md px-3 py-2 focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none bg-white"
                    >
                      <option value="">Selecione uma opção</option>
                      <option value="sim">Sim, tenho CNPJ</option>
                      <option value="nao">Não tenho CNPJ</option>
                      <option value="processo">Em processo de abertura</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de Loja *
                    </label>
                    <select
                      name="storeType"
                      value={formData.storeType}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 border border-gray-300 rounded-md px-3 py-2 focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none bg-white"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="fisica">Loja Física</option>
                      <option value="online">Loja Online</option>
                      <option value="ambas">Física + Online</option>
                      <option value="vendedor">Vendedor/Representante</option>
                      <option value="marketplace">
                        Marketplace (Mercado Livre, etc)
                      </option>
                      <option value="ainda-nao-tenho">
                        Ainda não tenho loja
                      </option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-ecko-red text-white py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      "Quero Ser Revendedor"
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    🔒 Seus dados estão seguros • Cadastro 100% gratuito
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Link para admin */}
            <div className="text-center mt-6">
              <a
                href="/admin"
                className="text-xs text-gray-400 hover:text-ecko-red transition-colors"
              >
                Área Administrativa
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
