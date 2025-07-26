import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { TokenColorEditor } from "../../components/TokenColorEditor";
import { OptimizedImageUpload } from "../../components/OptimizedImageUpload";
import { useToast } from "../../hooks/use-toast";
import { useContent } from "../../hooks/useContent";
import {
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Palette,
  Type,
  Image,
  AlertCircle,
  Loader2,
  Lightbulb,
} from "lucide-react";

interface HeroSettings {
  title: string;
  subtitle: string;
  description: string;
  background_image: string;
  background_color: string;
  text_color: string;
  cta_primary_text: string;
  cta_secondary_text: string;
  cta_color: string;
  cta_text_color: string;
  overlay_color: string;
  overlay_opacity: number;
  logo_url: string;
}

export default function AdminHero() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<HeroSettings>(content.hero);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const { toast } = useToast();

  // Sincronizar com o conteúdo JSON quando carregado
  useEffect(() => {
    if (content.hero) {
      setSettings(content.hero);
    }
  }, [content.hero]);

  const handleSave = async () => {
    if (!hasChanges) return;

    setSaving(true);
    try {
      const updatedContent = {
        ...content,
        hero: settings,
      };

      const success = await saveContent(updatedContent);
      
      if (success) {
        toast({
          title: "✅ Hero atualizado!",
          description: "As configurações do hero foram salvas com sucesso.",
        });
        setHasChanges(false);
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      toast({
        title: "❌ Erro ao salvar",
        description: "Erro ao salvar as configurações do hero. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Carregando configurações do hero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Section</h1>
          <p className="text-gray-600">Configure a seção principal da página</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center"
        >
          {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showPreview ? "Ocultar Preview" : "Mostrar Preview"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações */}
        <div className="space-y-6">
          {/* Conteúdo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Type className="w-5 h-5 mr-2" />
                Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtítulo
                </label>
                <TokenColorEditor
                  value={settings.subtitle || ""}
                  onChange={(value) => handleInputChange("subtitle", value)}
                  placeholder="O maior programa de parceria do streetwear"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título Principal
                </label>
                <TokenColorEditor
                  value={settings.title || ""}
                  onChange={(value) => handleInputChange("title", value)}
                  placeholder="SEJA UM [ecko-red]REVENDEDOR[/ecko-red] OFICIAL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <TokenColorEditor
                  value={settings.description || ""}
                  onChange={(value) => handleInputChange("description", value)}
                  placeholder="Transforme sua paixão em negócio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do CTA
                </label>
                <Input
                  value={settings.cta_secondary_text || ""}
                  onChange={(e) => handleInputChange("cta_secondary_text", e.target.value)}
                  placeholder="DESCUBRA COMO"
                />
              </div>
            </CardContent>
          </Card>

          {/* Visual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="w-5 h-5 mr-2" />
                Visual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <OptimizedImageUpload
                  value={settings.logo_url || ""}
                  onChange={(url) => handleInputChange("logo_url", url)}
                  onClear={() => handleInputChange("logo_url", "")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem de Fundo
                </label>
                <OptimizedImageUpload
                  value={settings.background_image || ""}
                  onChange={(url) => handleInputChange("background_image", url)}
                  onClear={() => handleInputChange("background_image", "")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Cores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor de Fundo
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={settings.background_color || "#000000"}
                      onChange={(e) => handleInputChange("background_color", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.background_color || "#000000"}
                      onChange={(e) => handleInputChange("background_color", e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor do Texto
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={settings.text_color || "#ffffff"}
                      onChange={(e) => handleInputChange("text_color", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.text_color || "#ffffff"}
                      onChange={(e) => handleInputChange("text_color", e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor do CTA
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={settings.cta_color || "#dc2626"}
                      onChange={(e) => handleInputChange("cta_color", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.cta_color || "#dc2626"}
                      onChange={(e) => handleInputChange("cta_color", e.target.value)}
                      placeholder="#dc2626"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor Overlay
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={settings.overlay_color || "#000000"}
                      onChange={(e) => handleInputChange("overlay_color", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.overlay_color || "#000000"}
                      onChange={(e) => handleInputChange("overlay_color", e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opacidade do Overlay: {settings.overlay_opacity || 70}%
                </label>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.overlay_opacity || 70}
                  onChange={(e) => handleInputChange("overlay_opacity", parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative h-64 rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: settings.background_color || "#000000",
                    backgroundImage: settings.background_image ? `url(${settings.background_image})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    color: settings.text_color || "#ffffff",
                  }}
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundColor: settings.overlay_color || "#000000",
                      opacity: (settings.overlay_opacity || 70) / 100,
                    }}
                  />
                  <div className="relative z-10 p-6 h-full flex flex-col justify-center text-center">
                    {settings.logo_url && (
                      <img
                        src={settings.logo_url}
                        alt="Logo"
                        className="w-16 h-8 object-contain mx-auto mb-4"
                      />
                    )}
                    {settings.subtitle && (
                      <p className="text-sm mb-2 opacity-90">
                        {settings.subtitle}
                      </p>
                    )}
                    {settings.title && (
                      <h1 className="text-lg font-bold mb-2">
                        {settings.title}
                      </h1>
                    )}
                    {settings.description && (
                      <p className="text-xs mb-4 opacity-75">
                        {settings.description}
                      </p>
                    )}
                    {settings.cta_secondary_text && (
                      <button
                        className="px-4 py-2 rounded text-xs font-bold"
                        style={{
                          backgroundColor: settings.cta_color || "#dc2626",
                          color: settings.cta_text_color || "#ffffff",
                        }}
                      >
                        {settings.cta_secondary_text}
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Botão de salvar */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
