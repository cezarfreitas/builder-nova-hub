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
}

export default function AdminHero() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<HeroSettings>(content.hero);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validation, setValidation] = useState<{ [key: string]: string }>({});
  const [autoPreview, setAutoPreview] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    content: true,
    visual: true,
    colors: false,
    advanced: false
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
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

    // Auto preview update
    if (autoPreview && hasChanges) {
      triggerPreviewAnimation();
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [settings, content.hero, autoPreview]);

  // Trigger preview animation
  const triggerPreviewAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

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
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-blue-900 text-sm">Otimização Automática</h4>
                      </div>
                      <p className="text-blue-700 text-xs">
                        Imagens são automaticamente comprimidas e redimensionadas para máxima performance.
                      </p>
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
                      <label className="text-sm font-semibold text-gray-900">Presets de Cores</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => applyColorPreset('ecko')}
                          className="p-3 rounded-lg border border-gray-200 hover:border-red-300 transition-all duration-200 group"
                        >
                          <div className="flex space-x-1 mb-2">
                            <div className="w-4 h-4 bg-black rounded"></div>
                            <div className="w-4 h-4 bg-white border rounded"></div>
                            <div className="w-4 h-4 bg-red-600 rounded"></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700 group-hover:text-red-600">Ecko Official</span>
                        </button>
                        
                        <button
                          onClick={() => applyColorPreset('luxury')}
                          className="p-3 rounded-lg border border-gray-200 hover:border-yellow-300 transition-all duration-200 group"
                        >
                          <div className="flex space-x-1 mb-2">
                            <div className="w-4 h-4 bg-gray-800 rounded"></div>
                            <div className="w-4 h-4 bg-gray-100 rounded"></div>
                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700 group-hover:text-yellow-600">Luxury</span>
                        </button>
                        
                        <button
                          onClick={() => applyColorPreset('vibrant')}
                          className="p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-200 group"
                        >
                          <div className="flex space-x-1 mb-2">
                            <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                            <div className="w-4 h-4 bg-white border rounded"></div>
                            <div className="w-4 h-4 bg-amber-500 rounded"></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700 group-hover:text-indigo-600">Vibrant</span>
                        </button>
                        
                        <button
                          onClick={() => applyColorPreset('minimal')}
                          className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 group"
                        >
                          <div className="flex space-x-1 mb-2">
                            <div className="w-4 h-4 bg-white border rounded"></div>
                            <div className="w-4 h-4 bg-gray-900 rounded"></div>
                            <div className="w-4 h-4 bg-blue-600 rounded"></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">Minimal</span>
                        </button>
                      </div>
                    </div>

                    {/* Individual Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-900">Cor de Fundo</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={settings.background_color}
                            onChange={(e) => updateField("background_color", e.target.value)}
                            className="w-12 h-12 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors"
                          />
                          <Input
                            value={settings.background_color}
                            onChange={(e) => updateField("background_color", e.target.value)}
                            placeholder="#000000"
                            className="flex-1 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-900">Cor do Texto</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={settings.text_color}
                            onChange={(e) => updateField("text_color", e.target.value)}
                            className="w-12 h-12 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors"
                          />
                          <Input
                            value={settings.text_color}
                            onChange={(e) => updateField("text_color", e.target.value)}
                            placeholder="#ffffff"
                            className="flex-1 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-900">Cor do CTA</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={settings.cta_color}
                            onChange={(e) => updateField("cta_color", e.target.value)}
                            className="w-12 h-12 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors"
                          />
                          <Input
                            value={settings.cta_color}
                            onChange={(e) => updateField("cta_color", e.target.value)}
                            placeholder="#dc2626"
                            className="flex-1 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-900">Texto do CTA</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={settings.cta_text_color}
                            onChange={(e) => updateField("cta_text_color", e.target.value)}
                            className="w-12 h-12 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors"
                          />
                          <Input
                            value={settings.cta_text_color}
                            onChange={(e) => updateField("cta_text_color", e.target.value)}
                            placeholder="#ffffff"
                            className="flex-1 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="xl:col-span-7">
              <div className="sticky top-24">
                <Card className="border-0 shadow-2xl bg-white overflow-hidden">
                  <CardHeader className="bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Monitor className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-semibold text-gray-900">Preview em Tempo Real</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setAutoPreview(!autoPreview)}
                            className={`p-1 rounded-md transition-colors ${autoPreview ? 'text-green-600' : 'text-gray-400'}`}
                          >
                            {autoPreview ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                          </button>
                          <span className="text-xs text-gray-500">Auto</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex bg-gray-200 rounded-lg p-1">
                          <button
                            onClick={() => setPreviewDevice('desktop')}
                            className={`p-1 rounded-md transition-colors ${previewDevice === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                          >
                            <Monitor className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPreviewDevice('tablet')}
                            className={`p-1 rounded-md transition-colors ${previewDevice === 'tablet' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                          >
                            <Tablet className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPreviewDevice('mobile')}
                            className={`p-1 rounded-md transition-colors ${previewDevice === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                          >
                            <Smartphone className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <div className="flex justify-center p-6 bg-gray-100">
                      <div 
                        ref={previewRef}
                        className={`
                          transition-all duration-300 bg-white shadow-lg overflow-hidden rounded-lg
                          ${isAnimating ? 'scale-[0.98] opacity-80' : 'scale-100 opacity-100'}
                          ${previewDevice === 'desktop' ? 'w-full max-w-4xl h-96' : 
                            previewDevice === 'tablet' ? 'w-80 h-96' : 'w-64 h-96'}
                        `}
                      >
                        <div
                          className="h-full relative flex items-center justify-center"
                          style={{
                            backgroundColor: settings.background_color,
                            backgroundImage: settings.background_image ? `url(${settings.background_image})` : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/50"></div>

                          {/* Content */}
                          <div className={`relative text-center px-6 space-y-4 ${previewDevice === 'mobile' ? 'max-w-xs' : 'max-w-3xl'}`}>
                            {/* Logo Preview */}
                            {settings.logo_url && (
                              <div className="mb-4">
                                <img
                                  src={settings.logo_url}
                                  alt="Logo"
                                  className={`mx-auto object-contain ${previewDevice === 'mobile' ? 'h-8' : 'h-12'}`}
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
                                className={`opacity-90 ${previewDevice === 'mobile' ? 'text-sm' : 'text-lg'}`}
                                style={{ color: settings.text_color }}
                              >
                                {renderTextWithColorTokens(settings.subtitle)}
                              </p>
                            )}

                            {/* Title */}
                            <h1
                              className={`font-black leading-tight ${
                                previewDevice === 'mobile' ? 'text-xl' : 
                                previewDevice === 'tablet' ? 'text-2xl' : 'text-4xl'
                              }`}
                              style={{ color: settings.text_color }}
                            >
                              {renderTextWithColorTokens(settings.title)}
                            </h1>

                            {/* Description */}
                            {settings.description && (
                              <p
                                className={`opacity-90 mx-auto ${
                                  previewDevice === 'mobile' ? 'text-xs max-w-xs' : 
                                  previewDevice === 'tablet' ? 'text-sm max-w-sm' : 'text-lg max-w-2xl'
                                }`}
                                style={{ color: settings.text_color }}
                              >
                                {renderTextWithColorTokens(settings.description)}
                              </p>
                            )}

                            {/* CTAs */}
                            <div className={`flex gap-3 justify-center pt-4 ${previewDevice === 'mobile' ? 'flex-col items-center' : 'flex-row'}`}>
                              {settings.cta_text && (
                                <button
                                  className={`font-bold rounded-lg transition-all duration-300 hover:scale-105 ${
                                    previewDevice === 'mobile' ? 'px-6 py-2 text-sm' : 'px-8 py-3'
                                  }`}
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
                                  className={`font-bold border-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                                    previewDevice === 'mobile' ? 'px-6 py-2 text-sm' : 'px-8 py-3'
                                  }`}
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
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Insights */}
                <Card className="mt-6 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900">Performance Insights</h3>
                          <p className="text-sm text-blue-700">Otimizações automáticas aplicadas</p>
                        </div>
                      </div>
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/60 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-900">98%</div>
                        <div className="text-xs text-blue-700">Performance</div>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-900">100%</div>
                        <div className="text-xs text-green-700">Acessibilidade</div>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-purple-900">95%</div>
                        <div className="text-xs text-purple-700">SEO</div>
                      </div>
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
