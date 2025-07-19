import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import AdminLayout from "../components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Save,
  Upload,
  Eye,
  EyeOff,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { HeroSettings, HeroResponse, HeroUpdateResponse } from "@shared/api";

export default function HeroManagement() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    logo_url: "",
    main_title: "",
    subtitle: "",
    description: "",
    background_image_url: "",
    cta_text: "Descubra Como Funciona",
  });

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/hero");

      if (response.ok) {
        const data: HeroResponse = await response.json();
        setHeroSettings(data.hero);
        setFormData({
          logo_url: data.hero.logo_url || "",
          main_title: data.hero.main_title || "",
          subtitle: data.hero.subtitle || "",
          description: data.hero.description || "",
          background_image_url: data.hero.background_image_url || "",
          cta_text: data.hero.cta_text || "Descubra Como Funciona",
        });
      } else {
        setMessage({
          type: "error",
          text: "Erro ao carregar configurações do hero",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!heroSettings?.id) {
      setMessage({
        type: "error",
        text: "ID das configurações não encontrado",
      });
      return;
    }

    if (!formData.main_title.trim()) {
      setMessage({ type: "error", text: "Título principal é obrigatório" });
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);

      const response = await fetch(`/api/hero/${heroSettings.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: HeroUpdateResponse = await response.json();

      if (response.ok) {
        setHeroSettings(data.hero);
        setMessage({
          type: "success",
          text: "Configurações salvas com sucesso!",
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Erro ao salvar configurações",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" });
    } finally {
      setIsSaving(false);
    }
  };

  const formatTitle = (title: string) => {
    return title.split("\\n").join("\n");
  };

  const previewTitle = (title: string) => {
    return title.split("\n").map((line, index) => (
      <div key={index} className={index > 0 ? "text-ecko-red" : ""}>
        {line}
      </div>
    ));
  };

    if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-ecko-red" />
            <span className="text-gray-600">Carregando configurações...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

    return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gerenciar Seção Hero
              </h1>
              <p className="text-gray-600 mt-2">
                Configure o visual e textos da primeira seção da landing page
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setPreviewMode(!previewMode)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {previewMode ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                <span>{previewMode ? "Ocultar" : "Preview"}</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-ecko-red hover:bg-ecko-red-dark text-white flex items-center space-x-2"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? "Salvando..." : "Salvar"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5" />
                  <span>Logo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="logo_url">URL do Logo</Label>
                  <Input
                    id="logo_url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleInputChange}
                    placeholder="https://exemplo.com/logo.png"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Deixe vazio para usar o logo padrão da Ecko
                  </p>
                </div>
                {formData.logo_url && (
                  <div className="mt-3">
                    <img
                      src={formData.logo_url}
                      alt="Preview do Logo"
                      className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMiAyMkw0MiA0Mk0yMiA0Mkw0MiAyMiIgc3Ryb2tlPSIjOTNBM0I4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K";
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Background */}
            <Card>
              <CardHeader>
                <CardTitle>Imagem de Fundo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="background_image_url">
                    URL da Imagem de Fundo
                  </Label>
                  <Input
                    id="background_image_url"
                    name="background_image_url"
                    value={formData.background_image_url}
                    onChange={handleInputChange}
                    placeholder="https://exemplo.com/background.jpg"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Deixe vazio para usar o background padrão
                  </p>
                </div>
                {formData.background_image_url && (
                  <div className="mt-3">
                    <img
                      src={formData.background_image_url}
                      alt="Preview do Background"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDMyMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNDAgNTRMMTgwIDk0TTE0MCA5NEwxODAgNTQiIHN0cm9rZT0iIzkzQTNCOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cg==";
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Textos */}
            <Card>
              <CardHeader>
                <CardTitle>Textos do Hero</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Programa de Revendedores"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="main_title">Título Principal *</Label>
                  <Textarea
                    id="main_title"
                    name="main_title"
                    value={formatTitle(formData.main_title)}
                    onChange={handleInputChange}
                    placeholder="TRANSFORME SUA&#10;PAIXÃO&#10;EM LUCRO"
                    rows={4}
                    className="mt-1"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use quebras de linha para separar as partes do título. As
                    linhas 2 e 3 ficarão vermelhas.
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Seja um revendedor oficial da marca de streetwear mais desejada do Brasil e multiplique suas vendas!"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="cta_text">Texto do Botão</Label>
                  <Input
                    id="cta_text"
                    name="cta_text"
                    value={formData.cta_text}
                    onChange={handleInputChange}
                    placeholder="Descubra Como Funciona"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          {previewMode && (
            <div className="lg:sticky lg:top-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview do Hero</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black rounded-lg p-8 text-center min-h-[400px] flex flex-col justify-center relative overflow-hidden">
                    {/* Background Preview */}
                    {formData.background_image_url && (
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-30"
                        style={{
                          backgroundImage: `url(${formData.background_image_url})`,
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />

                    <div className="relative z-10">
                      {/* Logo Preview */}
                      <div className="flex items-center justify-center mb-6">
                        <img
                          src={
                            formData.logo_url ||
                            "https://www.ntktextil.com.br/wp-content/uploads/2022/08/Logo-Ecko.png"
                          }
                          alt="Logo"
                          className="object-contain"
                          style={{ width: "240px", height: "72px" }}
                        />
                      </div>

                      {/* Title Preview */}
                      <h2 className="text-2xl lg:text-4xl font-black text-white mb-4 leading-tight">
                        {formData.main_title
                          ? previewTitle(formatTitle(formData.main_title))
                          : "TÍTULO PRINCIPAL"}
                      </h2>

                      {/* Description Preview */}
                      <p className="text-sm lg:text-base text-gray-300 mb-6 font-medium">
                        {formData.description ||
                          "Descrição do hero aparecerá aqui"}
                      </p>

                      {/* CTA Preview */}
                      <Button
                        variant="outline"
                        className="border-2 border-ecko-red text-ecko-red hover:bg-ecko-red hover:text-white font-bold px-4 py-2"
                        disabled
                      >
                        {formData.cta_text || "Descubra Como Funciona"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}