import { useState, useEffect, useCallback, useRef } from "react";
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
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Settings,
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  Zap,
  TrendingUp,
  ArrowRight,
  Globe,
  BarChart3,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  MousePointer,
  Palette as PaletteIcon,
  Image,
  FileText,
  Wand2,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Hash,
  Layers,
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
  overlay_opacity: number;
  overlay_color: string;
}

export default function AdminHero() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<HeroSettings>(content.hero);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validation, setValidation] = useState<{ [key: string]: string }>({});
  const [expandedSections, setExpandedSections] = useState({
    content: true,
    visual: true,
    colors: false,
    advanced: false
  });
  const { toast } = useToast();

  // Debounced auto-save
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Sincronizar com o conteúdo JSON quando carregado
  useEffect(() => {
    if (content.hero) {
      setSettings(content.hero);
    }
  }, [content.hero]);

  // Detectar mudanças e validar
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(content.hero);
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

    setValidation(newValidation);

    // Auto-save após 2 segundos de inatividade
    if (hasChanges && Object.keys(newValidation).length === 0) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      const timeout = setTimeout(() => {
        autoSaveSettings();
      }, 2000);

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
      triggerPreviewAnimation();

      const updatedContent = {
        ...content,
        hero: settings,
      };

      const result = await saveContent(updatedContent);

      if (result.success) {
        toast({
          title: "✨ Hero atualizado!",
          description: "Todas as alterações foram salvas com sucesso.",
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
    triggerPreviewAnimation();
    toast({
      title: "🔄 Configurações resetadas",
      description: "Todos os campos foram restaurados aos valores salvos.",
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
        title: "📋 Configurações copiadas!",
        description: "JSON das configurações foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar as configurações.",
        variant: "destructive",
      });
    }
  };

  // Toggle section
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Apply preset colors
  const applyColorPreset = (preset: string) => {
    const presets = {
      ecko: {
        background_color: "#000000",
        text_color: "#ffffff", 
        cta_color: "#dc2626",
        cta_text_color: "#ffffff"
      },
      luxury: {
        background_color: "#1a1a1a",
        text_color: "#f5f5f5",
        cta_color: "#d4af37",
        cta_text_color: "#000000"
      },
      vibrant: {
        background_color: "#6366f1",
        text_color: "#ffffff",
        cta_color: "#f59e0b",
        cta_text_color: "#000000"
      },
      minimal: {
        background_color: "#ffffff",
        text_color: "#1f2937",
        cta_color: "#3b82f6",
        cta_text_color: "#ffffff"
      }
    };

    const colors = presets[preset as keyof typeof presets];
    if (colors) {
      Object.entries(colors).forEach(([key, value]) => {
        updateField(key as keyof HeroSettings, value);
      });
      toast({
        title: `🎨 Preset "${preset}" aplicado!`,
        description: "As cores foram atualizadas conforme o tema selecionado.",
      });
    }
  };

  // Status da validação
  const hasErrors = Object.keys(validation).length > 0;
  const saveProgress = hasChanges ? (hasErrors ? 0 : 50) : 100;

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-ecko-red border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-ecko-red/20 rounded-full mx-auto"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Carregando Interface</h3>
            <p className="text-gray-600">Preparando o editor profissional do Hero...</p>
            <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-ecko-red to-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Professional */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-ecko-red to-red-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Hero Editor</h1>
                  <p className="text-sm text-gray-600">Editor profissional da seção principal</p>
                </div>
              </div>
              
              {/* Status Indicators */}
              <div className="hidden lg:flex items-center space-x-2">
                {autoSaving && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 animate-pulse">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Auto-salvando...
                  </Badge>
                )}
                
                {lastSaved && !autoSaving && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Salvo {lastSaved.toLocaleTimeString()}
                  </Badge>
                )}
                
                {hasChanges && !autoSaving && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    <Timer className="w-3 h-3 mr-1" />
                    Alterações pendentes
                  </Badge>
                )}

                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  <FileText className="w-3 h-3 mr-1" />
                  JSON Sync
                </Badge>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center space-x-3">
              {/* Save Progress */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      saveProgress === 100 ? 'bg-green-500' : 
                      saveProgress === 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${saveProgress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 font-medium">{saveProgress}%</span>
              </div>

              <Button
                onClick={copyConfig}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50"
                onClick={() => window.open("/", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver LP
              </Button>

              <Button
                onClick={resetSettings}
                variant="outline"
                size="sm"
                disabled={!hasChanges}
                className="border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>

              <Button
                onClick={saveSettings}
                disabled={saving || !hasChanges || hasErrors}
                className="bg-gradient-to-r from-ecko-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Editor Panel */}
            <div className="xl:col-span-5 space-y-6">
              
              {/* Content Section */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader 
                  className="cursor-pointer" 
                  onClick={() => toggleSection('content')}
                >
                  <CardTitle className="flex items-center justify-between text-gray-900">
                    <div className="flex items-center">
                      <Type className="w-5 h-5 mr-3 text-ecko-red" />
                      Conteúdo
                    </div>
                    {expandedSections.content ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </CardTitle>
                </CardHeader>
                {expandedSections.content && (
                  <CardContent className="space-y-6 pt-0">
                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">Status da Seção</p>
                        <p className="text-sm text-gray-600">Controla se o Hero será exibido</p>
                      </div>
                      <button
                        onClick={() => updateField("enabled", !settings.enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.enabled ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settings.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Título */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-900">
                          Título Principal *
                        </label>
                        <span className="text-xs text-gray-500">{settings.title.length}/100</span>
                      </div>
                      <TokenColorEditor
                        value={settings.title}
                        onChange={(value) => updateField("title", value)}
                        placeholder="Digite o título principal..."
                        rows={3}
                        label=""
                        className={`transition-all duration-200 ${
                          validation.title
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50"
                            : "border-gray-300 focus:border-ecko-red focus:ring-ecko-red"
                        }`}
                      />
                      {validation.title && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">{validation.title}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 flex items-center">
                        <Lightbulb className="w-3 h-3 mr-1" />
                        Use {"{ecko}texto{/ecko}"} para destacar em vermelho
                      </p>
                    </div>

                    {/* Subtítulo */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-900">
                        Subtítulo *
                      </label>
                      <TokenColorEditor
                        value={settings.subtitle}
                        onChange={(value) => updateField("subtitle", value)}
                        placeholder="Digite o subtítulo..."
                        rows={2}
                        label=""
                        className={`transition-all duration-200 ${
                          validation.subtitle
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50"
                            : "border-gray-300 focus:border-ecko-red focus:ring-ecko-red"
                        }`}
                      />
                      {validation.subtitle && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">{validation.subtitle}</span>
                        </div>
                      )}
                    </div>

                    {/* Descrição */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-900">
                        Descrição
                      </label>
                      <TokenColorEditor
                        value={settings.description}
                        onChange={(value) => updateField("description", value)}
                        placeholder="Digite uma descrição detalhada..."
                        rows={3}
                        label=""
                        className="border-gray-300 focus:border-ecko-red focus:ring-ecko-red transition-all duration-200"
                      />
                    </div>

                    {/* CTAs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-900">
                          CTA Principal *
                        </label>
                        <TokenColorEditor
                          value={settings.cta_text}
                          onChange={(value) => updateField("cta_text", value)}
                          placeholder="Ex: Quero ser Revendedor"
                          rows={2}
                          label=""
                          className={`transition-all duration-200 ${
                            validation.cta_text
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50"
                              : "border-gray-300 focus:border-ecko-red focus:ring-ecko-red"
                          }`}
                        />
                        {validation.cta_text && (
                          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2 rounded-lg">
                            <AlertCircle className="w-3 h-3" />
                            <span className="text-xs font-medium">{validation.cta_text}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-900">
                          CTA Secundário
                        </label>
                        <TokenColorEditor
                          value={settings.cta_secondary_text}
                          onChange={(value) => updateField("cta_secondary_text", value)}
                          placeholder="Ex: Saiba Mais"
                          rows={2}
                          label=""
                          className="border-gray-300 focus:border-ecko-red focus:ring-ecko-red transition-all duration-200"
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Visual Section */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader 
                  className="cursor-pointer" 
                  onClick={() => toggleSection('visual')}
                >
                  <CardTitle className="flex items-center justify-between text-gray-900">
                    <div className="flex items-center">
                      <Image className="w-5 h-5 mr-3 text-ecko-red" />
                      Imagens
                    </div>
                    {expandedSections.visual ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </CardTitle>
                </CardHeader>
                {expandedSections.visual && (
                  <CardContent className="space-y-6 pt-0">
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
                  </CardContent>
                )}
              </Card>

              {/* Colors Section */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader 
                  className="cursor-pointer" 
                  onClick={() => toggleSection('colors')}
                >
                  <CardTitle className="flex items-center justify-between text-gray-900">
                    <div className="flex items-center">
                      <PaletteIcon className="w-5 h-5 mr-3 text-ecko-red" />
                      Cores e Estilo
                    </div>
                    {expandedSections.colors ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </CardTitle>
                </CardHeader>
                {expandedSections.colors && (
                  <CardContent className="space-y-6 pt-0">
                    {/* Color Presets */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-900">Presets Rápidos</label>
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          onClick={() => applyColorPreset('ecko')}
                          className="p-2 rounded-lg border border-gray-200 hover:border-red-300 transition-all group text-center"
                        >
                          <div className="flex space-x-1 mb-1 justify-center">
                            <div className="w-3 h-3 bg-black rounded"></div>
                            <div className="w-3 h-3 bg-white border rounded"></div>
                            <div className="w-3 h-3 bg-red-600 rounded"></div>
                          </div>
                          <span className="text-xs text-gray-700">Ecko</span>
                        </button>

                        <button
                          onClick={() => applyColorPreset('luxury')}
                          className="p-2 rounded-lg border border-gray-200 hover:border-yellow-300 transition-all group text-center"
                        >
                          <div className="flex space-x-1 mb-1 justify-center">
                            <div className="w-3 h-3 bg-gray-800 rounded"></div>
                            <div className="w-3 h-3 bg-gray-100 rounded"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          </div>
                          <span className="text-xs text-gray-700">Luxury</span>
                        </button>

                        <button
                          onClick={() => applyColorPreset('vibrant')}
                          className="p-2 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all group text-center"
                        >
                          <div className="flex space-x-1 mb-1 justify-center">
                            <div className="w-3 h-3 bg-indigo-600 rounded"></div>
                            <div className="w-3 h-3 bg-white border rounded"></div>
                            <div className="w-3 h-3 bg-amber-500 rounded"></div>
                          </div>
                          <span className="text-xs text-gray-700">Vibrant</span>
                        </button>

                        <button
                          onClick={() => applyColorPreset('minimal')}
                          className="p-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-all group text-center"
                        >
                          <div className="flex space-x-1 mb-1 justify-center">
                            <div className="w-3 h-3 bg-white border rounded"></div>
                            <div className="w-3 h-3 bg-gray-900 rounded"></div>
                            <div className="w-3 h-3 bg-blue-600 rounded"></div>
                          </div>
                          <span className="text-xs text-gray-700">Minimal</span>
                        </button>
                      </div>
                    </div>

                    {/* Individual Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Fundo</label>
                        <div className="flex space-x-2">
                          <input
                            type="color"
                            value={settings.background_color}
                            onChange={(e) => updateField("background_color", e.target.value)}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.background_color}
                            onChange={(e) => updateField("background_color", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Texto</label>
                        <div className="flex space-x-2">
                          <input
                            type="color"
                            value={settings.text_color}
                            onChange={(e) => updateField("text_color", e.target.value)}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.text_color}
                            onChange={(e) => updateField("text_color", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Botão</label>
                        <div className="flex space-x-2">
                          <input
                            type="color"
                            value={settings.cta_color}
                            onChange={(e) => updateField("cta_color", e.target.value)}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.cta_color}
                            onChange={(e) => updateField("cta_color", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Texto Botão</label>
                        <div className="flex space-x-2">
                          <input
                            type="color"
                            value={settings.cta_text_color}
                            onChange={(e) => updateField("cta_text_color", e.target.value)}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.cta_text_color}
                            onChange={(e) => updateField("cta_text_color", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Overlay Section */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => toggleSection('advanced')}
                >
                  <CardTitle className="flex items-center justify-between text-gray-900">
                    <div className="flex items-center">
                      <Layers className="w-5 h-5 mr-3 text-ecko-red" />
                      Overlay da Imagem
                    </div>
                    {expandedSections.advanced ?
                      <ChevronUp className="w-5 h-5 text-gray-400" /> :
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </CardTitle>
                </CardHeader>
                {expandedSections.advanced && (
                  <CardContent className="space-y-4 pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Cor</label>
                        <div className="flex space-x-2">
                          <input
                            type="color"
                            value={settings.overlay_color}
                            onChange={(e) => updateField("overlay_color", e.target.value)}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.overlay_color}
                            onChange={(e) => updateField("overlay_color", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium text-gray-900">Opacidade</label>
                          <span className="text-sm text-gray-600">{settings.overlay_opacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          step="5"
                          value={settings.overlay_opacity}
                          onChange={(e) => updateField("overlay_opacity", parseInt(e.target.value))}
                          className="w-full slider"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => {
                          updateField("overlay_color", "#000000");
                          updateField("overlay_opacity", 50);
                        }}
                        className="p-2 rounded border border-gray-200 hover:border-gray-400 text-center"
                      >
                        <div className="w-full h-4 bg-black/50 rounded mb-1"></div>
                        <span className="text-xs text-gray-600">Padrão</span>
                      </button>

                      <button
                        onClick={() => {
                          updateField("overlay_color", "#000000");
                          updateField("overlay_opacity", 30);
                        }}
                        className="p-2 rounded border border-gray-200 hover:border-gray-400 text-center"
                      >
                        <div className="w-full h-4 bg-black/30 rounded mb-1"></div>
                        <span className="text-xs text-gray-600">Sutil</span>
                      </button>

                      <button
                        onClick={() => {
                          updateField("overlay_color", "#000000");
                          updateField("overlay_opacity", 70);
                        }}
                        className="p-2 rounded border border-gray-200 hover:border-gray-400 text-center"
                      >
                        <div className="w-full h-4 bg-black/70 rounded mb-1"></div>
                        <span className="text-xs text-gray-600">Intenso</span>
                      </button>

                      <button
                        onClick={() => {
                          updateField("overlay_color", "#000000");
                          updateField("overlay_opacity", 0);
                        }}
                        className="p-2 rounded border border-gray-200 hover:border-gray-400 text-center"
                      >
                        <div className="w-full h-4 bg-transparent border border-gray-300 rounded mb-1"></div>
                        <span className="text-xs text-gray-600">Sem</span>
                      </button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Preview Panel - Simplificado */}
            <div className="xl:col-span-7">
              <div className="sticky top-24">
                <Card className="border-0 shadow-lg bg-white overflow-hidden">
                  <CardHeader className="bg-gray-50 border-b">
                    <div className="flex items-center space-x-3">
                      <Monitor className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open("/", "_blank")}
                        className="ml-auto"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver Landing Page
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-gray-600 mb-2">
                        <Eye className="w-5 h-5 inline mr-2" />
                        Visualize as alterações em tempo real
                      </p>
                      <p className="text-sm text-gray-500">
                        Clique em "Ver Landing Page" para visualizar o Hero completo
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
