import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";

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

  const handleOptionSelect = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hasCnpj || !formData.storeType) {
      alert("Por favor, selecione todas as opções");
      return;
    }
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
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Cadastro Enviado!
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              Nossa equipe entrará em contato em até 24h!
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="bg-ecko-red hover:bg-ecko-red-dark text-white text-sm"
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
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-10 h-10 bg-ecko-red rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Cadastro de Revendedor
              </h2>
              <p className="text-gray-600 text-sm">
                Preencha os dados para receber nossa proposta
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Digite seu nome"
                  required
                  className="h-10 text-sm border-gray-200 focus:border-ecko-red focus:ring-ecko-red/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <Input
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  required
                  className="h-10 text-sm border-gray-200 focus:border-ecko-red focus:ring-ecko-red/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tem CNPJ?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOptionSelect("hasCnpj", "sim")}
                    className={cn(
                      "px-3 py-2 text-sm border rounded-md transition-colors text-left",
                      formData.hasCnpj === "sim"
                        ? "bg-ecko-red text-white border-ecko-red"
                        : "bg-white text-gray-700 border-gray-200 hover:border-ecko-red",
                    )}
                  >
                    Sim, tenho CNPJ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOptionSelect("hasCnpj", "nao")}
                    className={cn(
                      "px-3 py-2 text-sm border rounded-md transition-colors text-left",
                      formData.hasCnpj === "nao"
                        ? "bg-ecko-red text-white border-ecko-red"
                        : "bg-white text-gray-700 border-gray-200 hover:border-ecko-red",
                    )}
                  >
                    Não tenho CNPJ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOptionSelect("hasCnpj", "processo")}
                    className={cn(
                      "px-3 py-2 text-sm border rounded-md transition-colors text-left",
                      formData.hasCnpj === "processo"
                        ? "bg-ecko-red text-white border-ecko-red"
                        : "bg-white text-gray-700 border-gray-200 hover:border-ecko-red",
                    )}
                  >
                    Em processo de abertura
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Loja
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOptionSelect("storeType", "fisica")}
                    className={cn(
                      "px-3 py-2 text-sm border rounded-md transition-colors text-left",
                      formData.storeType === "fisica"
                        ? "bg-ecko-red text-white border-ecko-red"
                        : "bg-white text-gray-700 border-gray-200 hover:border-ecko-red",
                    )}
                  >
                    Loja Física
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOptionSelect("storeType", "online")}
                    className={cn(
                      "px-3 py-2 text-sm border rounded-md transition-colors text-left",
                      formData.storeType === "online"
                        ? "bg-ecko-red text-white border-ecko-red"
                        : "bg-white text-gray-700 border-gray-200 hover:border-ecko-red",
                    )}
                  >
                    Loja Online
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOptionSelect("storeType", "ambas")}
                    className={cn(
                      "px-3 py-2 text-sm border rounded-md transition-colors text-left",
                      formData.storeType === "ambas"
                        ? "bg-ecko-red text-white border-ecko-red"
                        : "bg-white text-gray-700 border-gray-200 hover:border-ecko-red",
                    )}
                  >
                    Física + Online
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOptionSelect("storeType", "vendedor")}
                    className={cn(
                      "px-3 py-2 text-sm border rounded-md transition-colors text-left",
                      formData.storeType === "vendedor"
                        ? "bg-ecko-red text-white border-ecko-red"
                        : "bg-white text-gray-700 border-gray-200 hover:border-ecko-red",
                    )}
                  >
                    Vendedor/Representante
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleOptionSelect("storeType", "marketplace")
                    }
                    className={cn(
                      "px-3 py-2 text-sm border rounded-md transition-colors text-left",
                      formData.storeType === "marketplace"
                        ? "bg-ecko-red text-white border-ecko-red"
                        : "bg-white text-gray-700 border-gray-200 hover:border-ecko-red",
                    )}
                  >
                    Marketplace
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleOptionSelect("storeType", "ainda-nao-tenho")
                    }
                    className={cn(
                      "px-3 py-2 text-sm border rounded-md transition-colors text-left",
                      formData.storeType === "ainda-nao-tenho"
                        ? "bg-ecko-red text-white border-ecko-red"
                        : "bg-white text-gray-700 border-gray-200 hover:border-ecko-red",
                    )}
                  >
                    Ainda não tenho loja
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-ecko-red hover:bg-ecko-red-dark text-white py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
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
