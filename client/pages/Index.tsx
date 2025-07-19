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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Cadastro Enviado!
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              Nossa equipe entrará em contato em até 24h!
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="bg-ecko-red hover:bg-ecko-red-dark text-white text-sm px-6 py-2"
            >
              Enviar Novo Cadastro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            {/* Header sem ícone */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Cadastro de Revendedor
              </h2>
              <p className="text-gray-600 text-sm">
                Preencha os dados para receber nossa proposta
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nome Completo
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Digite seu nome"
                  required
                  className="h-10 text-sm border-gray-200 focus:border-ecko-red focus:ring-1 focus:ring-ecko-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  WhatsApp
                </label>
                <Input
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  required
                  className="h-10 text-sm border-gray-200 focus:border-ecko-red focus:ring-1 focus:ring-ecko-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tem CNPJ?
                </label>
                <select
                  name="hasCnpj"
                  value={formData.hasCnpj}
                  onChange={handleInputChange}
                  required
                  className="w-full h-10 text-sm border border-gray-200 rounded-md px-3 bg-white text-gray-900 focus:border-ecko-red focus:ring-1 focus:ring-ecko-red focus:outline-none appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                    backgroundSize: "16px",
                  }}
                >
                  <option value="">Selecione uma opção</option>
                  <option value="sim">Sim, tenho CNPJ</option>
                  <option value="nao">Não tenho CNPJ</option>
                  <option value="processo">Em processo de abertura</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipo de Loja
                </label>
                <select
                  name="storeType"
                  value={formData.storeType}
                  onChange={handleInputChange}
                  required
                  className="w-full h-10 text-sm border border-gray-200 rounded-md px-3 bg-white text-gray-900 focus:border-ecko-red focus:ring-1 focus:ring-ecko-red focus:outline-none appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                    backgroundSize: "16px",
                  }}
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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-ecko-red hover:bg-ecko-red-dark text-white py-2.5 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
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

              <p className="text-xs text-gray-500 text-center mt-3">
                🔒 Seus dados estão protegidos
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Link Admin */}
        <div className="text-center mt-4">
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
