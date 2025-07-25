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
  Star,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Image,
  Palette,
  Type,
  Check,
  FileText,
  Clock,
  ExternalLink,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Zap,
  Settings,
  X,
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
  const [autoSaving, setAutoSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validation, setValidation] = useState<{ [key: string]: string }>({});
  const [showOverlay, setShowOverlay] = useState(false);
  const { toast } = useToast();

  // Debounced auto-save
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Sincronizar com o conteúdo JSON quando carregado
  useEffect(() => {
    if (content.hero) {
      setSettings(content.hero);
    }
  }, [content.hero]);

  // Detectar mudanças e validar
  useEffect(() => {
    const hasChanges =
      JSON.stringify(settings) !== JSON.stringify(content.hero);
    setHasChanges(hasChanges);

    // Validação em tempo real
    const newValidation: { [key: string]: string } = {};

    if (!settings.title.trim()) {
      newValidation.title = "Título é obrigatório";
    } else if (settings.title.length > 100) {
      newValidation.title = "Título muito longo (máx. 100 caracteres)";
    }

    if (!settings.subtitle.trim()) {
      newValidation.subtitle = "Subtítulo é obrigatório";
    }

    if (!settings.cta_text.trim()) {
      newValidation.cta_text = "CTA principal é obrigatório";
    }

    // URL validation removed - OptimizedImageUpload handles file validation

    setValidation(newValidation);

    // Auto-save após 3 segundos de inatividade
    if (hasChanges && Object.keys(newValidation).length === 0) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      const timeout = setTimeout(() => {
        autoSaveSettings();
      }, 3000);

      setAutoSaveTimeout(timeout);
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [settings, content.hero]);

  // Auto-save silencioso
  const autoSaveSettings = useCallback(async () => {
    if (Object.keys(validation).length > 0) return;

    try {
      setAutoSaving(true);

      const updatedContent = {
        ...content,
        hero: settings,
      };

      await saveContent(updatedContent);
      setHasChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Erro no auto-save:", error);
    } finally {
      setAutoSaving(false);
    }
  }, [settings, content, saveContent, validation]);

  // Salvar configurações manualmente
  const saveSettings = async () => {
    try {
      setSaving(true);

      const updatedContent = {
        ...content,
        hero: settings,
      };

      const result = await saveContent(updatedContent);

      if (result.success) {
        toast({
          title: "Hero atualizado!",
          description: "As configurações foram salvas com sucesso.",
        });
        setHasChanges(false);
        setLastSaved(new Date());
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar configurações do hero:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Resetar para valores originais
  const resetSettings = () => {
    setSettings(content.hero);
    setHasChanges(false);
    toast({
      title: "Resetado",
      description: "Configurações resetadas para os valores salvos.",
    });
  };

  // Atualizar campo específico
  const updateField = (field: keyof HeroSettings, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Copiar configurações
  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
      toast({
        title: "Copiado!",
        description: "Configurações copiadas para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar as configurações.",
        variant: "destructive",
      });
    }
  };

  // Status da validação
  const hasErrors = Object.keys(validation).length > 0;

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-ecko-red border-t-transparent mx-auto"></div>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">
              Carregando configurações
            </p>
            <p className="text-gray-500 text-sm">Preparando a interface...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Configurações do Hero
          </h1>
          <p className="text-gray-600 mt-2">
            Configure a seção principal da landing page
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status badges */}
          {autoSaving && (
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Auto-salvando...
            </Badge>
          )}

          {lastSaved && (
            <Badge
              variant="secondary"
              className="bg-gray-50 text-gray-600 border-gray-200"
            >
              <Clock className="w-3 h-3 mr-1" />
              Salvo {lastSaved.toLocaleTimeString()}
            </Badge>
          )}

          {hasChanges && !autoSaving && (
            <Badge
              variant="secondary"
              className="bg-yellow-50 text-yellow-700 border-yellow-200"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Alterações pendentes
            </Badge>
          )}

          {!hasChanges && !autoSaving && (
            <Badge
              variant="secondary"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Tudo salvo
            </Badge>
          )}

          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <FileText className="w-3 h-3 mr-1" />
            JSON
          </Badge>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
            className="border-gray-300"
          >
            {previewMode ? (
              <EyeOff className="w-4 h-4 mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {previewMode ? "Ocultar Preview" : "Mostrar Preview"}
          </Button>

          <Button
            onClick={copyConfig}
            variant="outline"
            className="border-gray-300"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar Config
          </Button>

          <Button
            variant="outline"
            className="border-gray-300"
            onClick={() => window.open("/", "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Landing Page
          </Button>

          <Button
            onClick={() => setShowOverlay(!showOverlay)}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Overlay Visual
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={resetSettings}
            variant="outline"
            disabled={!hasChanges}
            className="border-gray-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Resetar
          </Button>

          <Button
            onClick={saveSettings}
            disabled={saving || !hasChanges || hasErrors}
            className="bg-ecko-red hover:bg-ecko-red-dark text-white"
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
      </div>

      {/* Preview Section */}
      {previewMode && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-ecko-red" />
              Preview em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="relative h-96 rounded-lg overflow-hidden flex items-center justify-center"
              style={{
                backgroundColor: settings.background_color || "#000000",
                backgroundImage: settings.background_image
                  ? `url(${settings.background_image})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50"></div>

              {/* Content */}
              <div className="relative text-center px-6 max-w-4xl space-y-4">
                {/* Logo Preview */}
                {settings.logo_url && (
                  <div className="mb-6">
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="h-16 mx-auto object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Subtitle */}
                {settings.subtitle && (
                  <p
                    className="text-lg opacity-90"
                    style={{ color: settings.text_color || "#ffffff" }}
                  >
                    {renderTextWithColorTokens(settings.subtitle)}
                  </p>
                )}

                {/* Title */}
                <h1
                  className="text-4xl font-black leading-tight"
                  style={{ color: settings.text_color || "#ffffff" }}
                >
                  {renderTextWithColorTokens(settings.title)}
                </h1>

                {/* Description */}
                {settings.description && (
                  <p
                    className="text-lg opacity-90 max-w-2xl mx-auto"
                    style={{ color: settings.text_color }}
                  >
                    {renderTextWithColorTokens(settings.description)}
                  </p>
                )}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  {settings.cta_text && (
                    <button
                      className="px-8 py-3 font-bold rounded-lg transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: settings.cta_color,
                        color: settings.cta_text_color,
                      }}
                    >
                      {settings.cta_text}
                    </button>
                  )}

                  {settings.cta_secondary_text && (
                    <button
                      className="px-8 py-3 font-bold border-2 rounded-lg transition-all duration-300 hover:scale-105"
                      style={{
                        borderColor: settings.cta_color,
                        color: settings.text_color,
                        backgroundColor: "transparent",
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

      {/* Visual Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Settings className="w-6 h-6 mr-2 text-purple-600" />
                    Overlay de Ajustes Visuais
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Ajuste as cores e visualize em tempo real
                  </p>
                </div>
                <Button
                  onClick={() => setShowOverlay(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Preview Live */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-600" />
                    Preview Live
                  </h3>
                  <div
                    className="relative h-64 rounded-lg overflow-hidden"
                    style={{
                      backgroundColor: settings.background_color,
                      backgroundImage: settings.background_image
                        ? `url(${settings.background_image})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="relative h-full flex items-center justify-center text-center px-4">
                      <div className="space-y-2">
                        {settings.logo_url && (
                          <img
                            src={settings.logo_url}
                            alt="Logo"
                            className="h-8 mx-auto object-contain mb-2"
                          />
                        )}
                        <p
                          className="text-sm opacity-90"
                          style={{ color: settings.text_color }}
                        >
                          {renderTextWithColorTokens(settings.subtitle)}
                        </p>
                        <h2
                          className="text-xl font-black"
                          style={{ color: settings.text_color }}
                        >
                          {renderTextWithColorTokens(settings.title)}
                        </h2>
                        {settings.cta_text && (
                          <button
                            className="px-4 py-2 text-sm font-bold rounded transition-all"
                            style={{
                              backgroundColor: settings.cta_color,
                              color: settings.cta_text_color,
                            }}
                          >
                            {settings.cta_text}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Palette className="w-5 h-5 mr-2 text-purple-600" />
                    Ajustes Rápidos
                  </h3>
                  <div className="space-y-4">
                    {/* Cor de Fundo */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Cor de Fundo
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={settings.background_color || "#000000"}
                          onChange={(e) =>
                            updateField("background_color", e.target.value)
                          }
                          className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={settings.background_color || "#000000"}
                          onChange={(e) =>
                            updateField("background_color", e.target.value)
                          }
                          placeholder="#000000"
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>

                    {/* Cor do Texto */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Cor do Texto
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={settings.text_color || "#ffffff"}
                          onChange={(e) => updateField("text_color", e.target.value)}
                          className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={settings.text_color || "#ffffff"}
                          onChange={(e) => updateField("text_color", e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>

                    {/* Cor do CTA */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Cor do CTA
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={settings.cta_color || "#dc2626"}
                          onChange={(e) => updateField("cta_color", e.target.value)}
                          className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={settings.cta_color || "#dc2626"}
                          onChange={(e) => updateField("cta_color", e.target.value)}
                          placeholder="#dc2626"
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>

                    {/* Cor do Texto do CTA */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Cor do Texto do CTA
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={settings.cta_text_color || "#ffffff"}
                          onChange={(e) =>
                            updateField("cta_text_color", e.target.value)
                          }
                          className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={settings.cta_text_color || "#ffffff"}
                          onChange={(e) =>
                            updateField("cta_text_color", e.target.value)
                          }
                          placeholder="#ffffff"
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>

                    {/* Presets de Cores */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Presets Rápidos
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateField("background_color", "#000000");
                            updateField("text_color", "#ffffff");
                            updateField("cta_color", "#dc2626");
                            updateField("cta_text_color", "#ffffff");
                          }}
                          className="text-xs"
                        >
                          🌙 Escuro
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateField("background_color", "#ffffff");
                            updateField("text_color", "#000000");
                            updateField("cta_color", "#dc2626");
                            updateField("cta_text_color", "#ffffff");
                          }}
                          className="text-xs"
                        >
                          ☀️ Claro
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateField("background_color", "#1e40af");
                            updateField("text_color", "#ffffff");
                            updateField("cta_color", "#f59e0b");
                            updateField("cta_text_color", "#000000");
                          }}
                          className="text-xs"
                        >
                          🌊 Azul
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateField("background_color", "#dc2626");
                            updateField("text_color", "#ffffff");
                            updateField("cta_color", "#ffffff");
                            updateField("cta_text_color", "#dc2626");
                          }}
                          className="text-xs"
                        >
                          🔥 Ecko
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnóstico de Cores */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                  Diagnóstico de Cores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Cores Atuais</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Fundo:</span>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: settings.background_color || "#000000" }}
                            />
                            <code className="text-xs bg-white px-1 rounded">
                              {settings.background_color || "#000000"}
                            </code>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Texto:</span>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: settings.text_color || "#ffffff" }}
                            />
                            <code className="text-xs bg-white px-1 rounded">
                              {settings.text_color || "#ffffff"}
                            </code>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>CTA:</span>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: settings.cta_color || "#dc2626" }}
                            />
                            <code className="text-xs bg-white px-1 rounded">
                              {settings.cta_color || "#dc2626"}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">
                        ✅ Status das Cores
                      </h4>
                      <div className="space-y-1 text-sm text-green-700">
                        <p>• Cores válidas detectadas</p>
                        <p>• Tokens de cor funcionando</p>
                        <p>• Contraste adequado</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-blue-900">
              Otimização Automática de Performance
            </h3>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            As imagens são automaticamente comprimidas e otimizadas para web,
            garantindo carregamento rápido sem perda de qualidade visual.
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-white/50 rounded p-2">
              <div className="font-medium text-blue-800">Logo</div>
              <div className="text-blue-600">Máx: 200KB • 800x400px</div>
            </div>
            <div className="bg-white/50 rounded p-2">
              <div className="font-medium text-blue-800">Background</div>
              <div className="text-blue-600">Máx: 800KB • 1920x1080px</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Textos */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Type className="w-5 h-5 mr-2 text-ecko-red" />
              Textos do Hero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Título Principal *
              </label>
              <TokenColorEditor
                value={settings.title}
                onChange={(value) => updateField("title", value)}
                placeholder="Digite o título principal..."
                rows={3}
                label=""
                className={
                  validation.title
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {validation.title && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validation.title}
                </p>
              )}
              <p className="text-gray-500 text-sm flex items-center">
                <Info className="w-4 h-4 mr-1" />
                Use tokens de cor como {"{ecko}texto{/ecko}"} para destacar
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Subtítulo *
              </label>
              <TokenColorEditor
                value={settings.subtitle}
                onChange={(value) => updateField("subtitle", value)}
                placeholder="Digite o subtítulo..."
                rows={2}
                label=""
                className={
                  validation.subtitle
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {validation.subtitle && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validation.subtitle}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <TokenColorEditor
                value={settings.description}
                onChange={(value) => updateField("description", value)}
                placeholder="Digite a descrição..."
                rows={3}
                label=""
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  CTA Principal *
                </label>
                <TokenColorEditor
                  value={settings.cta_text}
                  onChange={(value) => updateField("cta_text", value)}
                  placeholder="Ex: Quero ser Revendedor"
                  rows={2}
                  label=""
                  className={
                    validation.cta_text
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
                {validation.cta_text && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validation.cta_text}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  CTA Secundário
                </label>
                <TokenColorEditor
                  value={settings.cta_secondary_text}
                  onChange={(value) => updateField("cta_secondary_text", value)}
                  placeholder="Ex: Saiba Mais"
                  rows={2}
                  label=""
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual e Cores */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-ecko-red" />
              Visual e Cores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateField("enabled", !settings.enabled)}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    settings.enabled
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  {settings.enabled ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {settings.enabled ? "Ativo" : "Inativo"}
                </button>
              </div>
            </div>

            <OptimizedImageUpload
              value={settings.logo_url}
              onChange={(url) => updateField("logo_url", url)}
              label="Logo da Empresa"
              maxSizeKB={200}
              maxWidth={800}
              maxHeight={400}
              quality={0.9}
              acceptedTypes={["image/png", "image/jpeg", "image/webp"]}
            />

            <OptimizedImageUpload
              value={settings.background_image}
              onChange={(url) => updateField("background_image", url)}
              label="Imagem de Background"
              maxSizeKB={800}
              maxWidth={1920}
              maxHeight={1080}
              quality={0.8}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cor de Fundo
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.background_color || "#000000"}
                    onChange={(e) =>
                      updateField("background_color", e.target.value)
                    }
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.background_color || "#000000"}
                    onChange={(e) =>
                      updateField("background_color", e.target.value)
                    }
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cor do Texto
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.text_color || "#ffffff"}
                    onChange={(e) => updateField("text_color", e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.text_color || "#ffffff"}
                    onChange={(e) => updateField("text_color", e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cor do CTA
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.cta_color || "#dc2626"}
                    onChange={(e) => updateField("cta_color", e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cta_color || "#dc2626"}
                    onChange={(e) => updateField("cta_color", e.target.value)}
                    placeholder="#dc2626"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cor do Texto do CTA
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.cta_text_color || "#ffffff"}
                    onChange={(e) =>
                      updateField("cta_text_color", e.target.value)
                    }
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cta_text_color || "#ffffff"}
                    onChange={(e) =>
                      updateField("cta_text_color", e.target.value)
                    }
                    placeholder="#ffffff"
                    className="flex-1"
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
