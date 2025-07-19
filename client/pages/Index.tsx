import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { CheckCircle } from "lucide-react";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cadastro Enviado!
            </h2>
            <p className="text-gray-600 mb-6">
              Nossa equipe entrará em contato em até 24h!
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="bg-ecko-red hover:bg-ecko-red-dark text-white"
            >
              Enviar Novo Cadastro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {/* Header do Form */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-ecko-red rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cadastro de Revendedor
              </h2>
              <p className="text-gray-600">
                Preencha os dados para receber nossa proposta
              </p>
            </div>

            {/* Formulário */}
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
                  className="h-12 text-base border-gray-200 focus:border-ecko-red focus:ring-ecko-red/20"
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
                  className="h-12 text-base border-gray-200 focus:border-ecko-red focus:ring-ecko-red/20"
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
                  className="w-full h-12 text-base border border-gray-200 rounded-md px-4 py-3 focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none bg-white"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="sim">Sim, tenho CNPJ</option>
                  <option value="nao">Não tenho CNPJ</option>
                  <option value="processo">Em processo de abertura</option>
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
                  className="w-full h-12 text-base border border-gray-200 rounded-md px-4 py-3 focus:border-ecko-red focus:ring-2 focus:ring-ecko-red/20 focus:outline-none bg-white"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="fisica">Loja Física</option>
                  <option value="online">Loja Online</option>
                  <option value="ambas">Física + Online</option>
                  <option value="vendedor">Vendedor/Representante</option>
                  <option value="marketplace">
                    Marketplace (Mercado Livre, etc)
                  </option>
                  <option value="ainda-nao-tenho">Ainda não tenho loja</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-ecko-red hover:bg-ecko-red-dark text-white py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 h-12"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </div>
                ) : (
                  "Quero Ser Revendedor"
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                🔒 Seus dados estão protegidos • Cadastro gratuito
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Link Admin */}
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
  );
}
