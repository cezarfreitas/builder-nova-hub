import React, { useState, useEffect } from "react";
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
import { Slider } from "../components/ui/slider";
import {
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Settings,
  Image as ImageIcon,
  Palette,
  Monitor,
  Smartphone,
} from "lucide-react";
import { HeroSettings, HeroResponse, HeroUpdateResponse } from "@shared/api";
import SimpleImageUpload from "../components/SimpleImageUpload";

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
    logo_width: 200,
    logo_height: 80,
    main_title: "",
    subtitle: "",
    description: "",
    background_image_url: "",
    background_overlay_opacity: 50,
    background_overlay_color: "#000000",
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
          logo_width: data.hero.logo_width || 200,
          logo_height: data.hero.logo_height || 80,
          main_title: data.hero.main_title || "",
          subtitle: data.hero.subtitle || "",
          description: data.hero.description || "",
          background_image_url: data.hero.background_image_url || "",
          background_overlay_opacity:
            data.hero.background_overlay_opacity || 50,
          background_overlay_color:
            data.hero.background_overlay_color || "#000000",
          cta_text: data.hero.cta_text || "Descubra Como Funciona",
        });
      } else {
        setMessage({
          type: "error",
          text: "Erro ao carregar configurações do hero",
        });
      }
    } catch (error) {
      console.error("Error fetching hero settings:", error);
      setMessage({
        type: "error",
        text: "Erro ao carregar configurações do hero",
      });
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

  const handleNumberChange = (name: string, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      const response = await fetch("/api/hero", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: HeroUpdateResponse = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Configurações salvas com sucesso!",
        });
        setHeroSettings(data.hero);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Erro ao salvar configurações",
        });
      }
    } catch (error) {
      console.error("Error saving hero settings:", error);
      setMessage({
        type: "error",
        text: "Erro ao salvar configurações",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const previewBackgroundStyle = {
    backgroundImage: formData.background_image_url
      ? `linear-gradient(rgba(${parseInt(formData.background_overlay_color.slice(1, 3), 16)}, ${parseInt(formData.background_overlay_color.slice(3, 5), 16)}, ${parseInt(formData.background_overlay_color.slice(5, 7), 16)}, ${formData.background_overlay_opacity / 100})), url(${formData.background_image_url})`
      : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2">Carregando configurações...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Configurações do Hero
            </h1>
            <p className="text-gray-600 mt-1">
              Personalize a seção principal da sua landing page
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              {previewMode ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {previewMode ? "Ocultar Preview" : "Mostrar Preview"}
            </Button>
            <Button
              onClick={fetchHeroSettings}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Preview */}
        {previewMode && (
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Preview Desktop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="relative min-h-[500px] flex items-center justify-center rounded-lg overflow-hidden"
                style={previewBackgroundStyle}
              >
                <div className="text-center text-white space-y-6 max-w-4xl mx-auto px-8">
                  {formData.logo_url && (
                    <div className="mb-8">
                      <img
                        src={formData.logo_url}
                        alt="Logo"
                        style={{
                          width: `${formData.logo_width}px`,
                          height: `${formData.logo_height}px`,
                        }}
                        className="mx-auto object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  )}
                  {formData.subtitle && (
                    <p className="text-lg font-medium text-red-400">
                      {formData.subtitle}
                    </p>
                  )}
                  {formData.main_title && (
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                      {formData.main_title}
                    </h1>
                  )}
                  {formData.description && (
                    <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                      {formData.description}
                    </p>
                  )}
                  {formData.cta_text && (
                    <Button size="lg" className="bg-red-600 hover:bg-red-700">
                      {formData.cta_text}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Images */}
          <div className="space-y-6">
            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Logo da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SimpleImageUpload
                  value={formData.logo_url}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, logo_url: url }))
                  }
                  label=""
                  placeholder="URL do logo ou faça upload"
                  description="Logo da empresa. Recomendado: PNG transparente"
                  usedFor="hero_logo"
                  previewHeight="h-32"
                />

                {/* Logo Size Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Largura do Logo (px)</Label>
                    <div className="mt-2 space-y-2">
                      <Slider
                        value={[formData.logo_width]}
                        onValueChange={(value) =>
                          handleNumberChange("logo_width", value[0])
                        }
                        max={400}
                        min={50}
                        step={10}
                        className="w-full"
                      />
                      <Input
                        type="number"
                        value={formData.logo_width}
                        onChange={(e) =>
                          handleNumberChange(
                            "logo_width",
                            parseInt(e.target.value) || 200,
                          )
                        }
                        min="50"
                        max="400"
                        className="text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Altura do Logo (px)</Label>
                    <div className="mt-2 space-y-2">
                      <Slider
                        value={[formData.logo_height]}
                        onValueChange={(value) =>
                          handleNumberChange("logo_height", value[0])
                        }
                        max={200}
                        min={30}
                        step={5}
                        className="w-full"
                      />
                      <Input
                        type="number"
                        value={formData.logo_height}
                        onChange={(e) =>
                          handleNumberChange(
                            "logo_height",
                            parseInt(e.target.value) || 80,
                          )
                        }
                        min="30"
                        max="200"
                        className="text-center"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Background Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Imagem de Fundo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SimpleImageUpload
                  value={formData.background_image_url}
                  onChange={(url) =>
                    setFormData((prev) => ({
                      ...prev,
                      background_image_url: url,
                    }))
                  }
                  label=""
                  placeholder="URL da imagem de fundo ou faça upload"
                  description="Imagem de fundo do hero. Recomendado: 1920x1080px, formato paisagem"
                  usedFor="hero_background"
                  previewHeight="h-48"
                />

                {/* Overlay Controls */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Overlay da Imagem
                  </h4>

                  <div>
                    <Label>Cor do Overlay</Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        type="color"
                        value={formData.background_overlay_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            background_overlay_color: e.target.value,
                          }))
                        }
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.background_overlay_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            background_overlay_color: e.target.value,
                          }))
                        }
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>
                      Opacidade do Overlay (
                      {formData.background_overlay_opacity}%)
                    </Label>
                    <div className="mt-2 space-y-2">
                      <Slider
                        value={[formData.background_overlay_opacity]}
                        onValueChange={(value) =>
                          handleNumberChange(
                            "background_overlay_opacity",
                            value[0],
                          )
                        }
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Overlay Preview */}
                  <div className="relative h-16 rounded-lg overflow-hidden border border-gray-200">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: formData.background_overlay_color,
                        opacity: formData.background_overlay_opacity / 100,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        Preview do Overlay
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-6">
            {/* Text Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Conteúdo do Hero
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Ex: Programa de Revendedores"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Texto que aparece acima do título principal
                  </p>
                </div>

                <div>
                  <Label htmlFor="main_title">Título Principal *</Label>
                  <Textarea
                    id="main_title"
                    name="main_title"
                    value={formData.main_title}
                    onChange={handleInputChange}
                    placeholder="Ex: TRANSFORME SUA PAIXÃO EM LUCRO"
                    className="mt-1 min-h-[100px]"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Título principal em destaque. Use quebras de linha para
                    formatação
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Ex: Seja um revendedor oficial da marca de streetwear mais desejada do Brasil e multiplique suas vendas!"
                    className="mt-1 min-h-[100px]"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Descrição que aparece abaixo do título
                  </p>
                </div>

                <div>
                  <Label htmlFor="cta_text">Texto do Botão</Label>
                  <Input
                    id="cta_text"
                    name="cta_text"
                    value={formData.cta_text}
                    onChange={handleInputChange}
                    placeholder="Ex: Descubra Como Funciona"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Texto do botão de call-to-action
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => window.open("/", "_blank")}
                  className="w-full justify-start"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Landing Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="w-full justify-start"
                >
                  {previewMode ? (
                    <EyeOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {previewMode ? "Ocultar Preview" : "Mostrar Preview"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
