import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { TokenColorEditor } from "../../components/TokenColorEditor";
import { OptimizedImageUpload } from "../../components/OptimizedImageUpload";
import { renderTextWithColorTokens } from "../../utils/colorTokens";
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
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface HeroSettings {
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  cta_secondary_text: string;
  background_image: string;
  background_color: string;
  text_color: string;
  cta_color: string;
  cta_text_color: string;
  logo_url: string;
  enabled: boolean;
}

export default function AdminHero() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<HeroSettings>(content.hero);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Sincronizar com o conteúdo JSON
  useEffect(() => {
    if (content.hero) {
      setSettings(content.hero);
    }
  }, [content.hero]);

  // Detectar mudanças
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(content.hero);
    setHasChanges(hasChanges);
  }, [settings, content.hero]);

  // Salvar configurações
  const saveSettings = async () => {
    if (!settings.title.trim() || !settings.subtitle.trim() || !settings.cta_text.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título, subtítulo e CTA principal são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const updatedContent = { ...content, hero: settings };
      const result = await saveContent(updatedContent);

      if (result.success) {
        toast({
          title: "Hero atualizado!",
          description: "As configurações foram salvas com sucesso.",
        });
        setHasChanges(false);
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Resetar configurações
  const resetSettings = () => {
    setSettings(content.hero);
    setHasChanges(false);
    toast({
      title: "Resetado",
      description: "Configurações resetadas para os valores salvos.",
    });
  };

  // Atualizar campo
  const updateField = (field: keyof HeroSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-ecko-red mx-auto" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hero Section</h1>
          <p className="text-gray-600 mt-1">Configure a seção principal da landing page</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges ? (
            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Não salvo
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Salvo
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
          >
            {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {previewMode ? "Ocultar Preview" : "Mostrar Preview"}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.open("/", "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Site
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={resetSettings}
            variant="outline"
            disabled={!hasChanges}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Resetar
          </Button>

          <Button
            onClick={saveSettings}
            disabled={saving || !hasChanges}
            className="bg-ecko-red hover:bg-red-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview */}
      {previewMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="relative h-80 rounded-lg overflow-hidden flex items-center justify-center"
              style={{
                backgroundColor: settings.background_color || "#000000",
                backgroundImage: settings.background_image ? `url(${settings.background_image})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="relative text-center px-6 max-w-3xl space-y-4">
                {settings.logo_url && (
                  <img
                    src={settings.logo_url}
                    alt="Logo"
                    className="h-12 mx-auto object-contain mb-4"
                  />
                )}
                
                {settings.subtitle && (
                  <p
                    className="text-lg opacity-90"
                    style={{ color: settings.text_color || "#ffffff" }}
                  >
                    {renderTextWithColorTokens(settings.subtitle)}
                  </p>
                )}

                <h1
                  className="text-3xl font-bold"
                  style={{ color: settings.text_color || "#ffffff" }}
                >
                  {renderTextWithColorTokens(settings.title)}
                </h1>

                {settings.description && (
                  <p
                    className="text-base opacity-90"
                    style={{ color: settings.text_color || "#ffffff" }}
                  >
                    {renderTextWithColorTokens(settings.description)}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  {settings.cta_text && (
                    <button
                      className="px-6 py-3 font-semibold rounded-lg"
                      style={{
                        backgroundColor: settings.cta_color || "#dc2626",
                        color: settings.cta_text_color || "#ffffff",
                      }}
                    >
                      {settings.cta_text}
                    </button>
                  )}

                  {settings.cta_secondary_text && (
                    <button
                      className="px-6 py-3 font-semibold border-2 rounded-lg bg-transparent"
                      style={{
                        borderColor: settings.cta_color || "#dc2626",
                        color: settings.text_color || "#ffffff",
                      }}
                    >
                      {settings.cta_secondary_text}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Textos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Type className="w-5 h-5 mr-2" />
              Textos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título Principal *</label>
              <TokenColorEditor
                value={settings.title}
                onChange={(value) => updateField("title", value)}
                placeholder="Digite o título principal..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtítulo *</label>
              <TokenColorEditor
                value={settings.subtitle}
                onChange={(value) => updateField("subtitle", value)}
                placeholder="Digite o subtítulo..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <TokenColorEditor
                value={settings.description}
                onChange={(value) => updateField("description", value)}
                placeholder="Digite a descrição..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">CTA Principal *</label>
                <Input
                  value={settings.cta_text}
                  onChange={(e) => updateField("cta_text", e.target.value)}
                  placeholder="Ex: Quero ser Revendedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CTA Secundário</label>
                <Input
                  value={settings.cta_secondary_text}
                  onChange={(e) => updateField("cta_secondary_text", e.target.value)}
                  placeholder="Ex: Saiba Mais"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Visual & Cores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enabled"
                checked={settings.enabled}
                onChange={(e) => updateField("enabled", e.target.checked)}
                className="h-4 w-4 text-ecko-red"
              />
              <label htmlFor="enabled" className="text-sm font-medium">
                Seção ativa
              </label>
            </div>

            <OptimizedImageUpload
              value={settings.logo_url}
              onChange={(url) => updateField("logo_url", url)}
              label="Logo"
              maxSizeKB={200}
              maxWidth={800}
              maxHeight={400}
            />

            <OptimizedImageUpload
              value={settings.background_image}
              onChange={(url) => updateField("background_image", url)}
              label="Imagem de Fundo"
              maxSizeKB={800}
              maxWidth={1920}
              maxHeight={1080}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cor de Fundo</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={settings.background_color || "#000000"}
                    onChange={(e) => updateField("background_color", e.target.value)}
                    className="w-10 h-10 border rounded cursor-pointer"
                  />
                  <Input
                    value={settings.background_color || "#000000"}
                    onChange={(e) => updateField("background_color", e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cor do Texto</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={settings.text_color || "#ffffff"}
                    onChange={(e) => updateField("text_color", e.target.value)}
                    className="w-10 h-10 border rounded cursor-pointer"
                  />
                  <Input
                    value={settings.text_color || "#ffffff"}
                    onChange={(e) => updateField("text_color", e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cor do CTA</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={settings.cta_color || "#dc2626"}
                    onChange={(e) => updateField("cta_color", e.target.value)}
                    className="w-10 h-10 border rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cta_color || "#dc2626"}
                    onChange={(e) => updateField("cta_color", e.target.value)}
                    placeholder="#dc2626"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cor do Texto CTA</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={settings.cta_text_color || "#ffffff"}
                    onChange={(e) => updateField("cta_text_color", e.target.value)}
                    className="w-10 h-10 border rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cta_text_color || "#ffffff"}
                    onChange={(e) => updateField("cta_text_color", e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
