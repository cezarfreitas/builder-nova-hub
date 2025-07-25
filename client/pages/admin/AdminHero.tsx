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
  Type,
  AlertCircle,
  Loader2,
  Image,
  Palette as PaletteIcon,
  Lightbulb,
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
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'conteudo' | 'imagens' | 'cores'>('conteudo');
  const { toast } = useToast();

  // Sincronizar com o conteúdo JSON quando carregado
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
      title: "🔄 Configurações resetadas",
      description: "Todos os campos foram restaurados aos valores salvos.",
    });
  };

  // Atualizar campo específico
  const updateField = (field: keyof HeroSettings, value: string | boolean | number) => {
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

  // Tab data
  const tabs = [
    { id: 'content', label: 'Conteúdo', icon: Type },
    { id: 'visual', label: 'Imagens', icon: Image },
    { id: 'style', label: 'Estilo', icon: PaletteIcon },
  ] as const;

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
        <div className="max-w-5xl mx-auto">
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-ecko-red text-white shadow-lg'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-8">
                  {/* Color Instructions */}
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <h4 className="font-semibold text-blue-900 text-sm">Destaque de Texto</h4>
                    </div>
                    <p className="text-blue-700 text-xs mb-3">
                      Use <code className="bg-blue-100 px-1 rounded text-blue-800">{"{ecko}texto{/ecko}"}</code> em qualquer campo de texto para destacar palavras.
                    </p>
                    
                    {/* Color Examples */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-blue-600 mr-2">Cores:</span>
                      {[
                        { name: 'ecko', color: '#dc2626' },
                        { name: 'blue', color: '#2563eb' },
                        { name: 'green', color: '#16a34a' },
                        { name: 'orange', color: '#ea580c' },
                        { name: 'yellow', color: '#ca8a04' },
                        { name: 'white', color: '#ffffff' },
                        { name: 'black', color: '#000000' }
                      ].map(({ name, color }) => (
                        <span
                          key={name}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border"
                          style={{
                            backgroundColor: color === '#ffffff' ? '#f8f9fa' : color,
                            color: ['#ffffff', '#ca8a04'].includes(color) ? '#000000' : '#ffffff',
                            borderColor: color === '#ffffff' ? '#d1d5db' : color
                          }}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

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

                  {/* Content Fields */}
                  <div className="space-y-6">
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
                        className={validation.title ? "border-red-300 bg-red-50" : ""}
                      />
                      {validation.title && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">{validation.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Subtítulo */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-900">Subtítulo *</label>
                      <TokenColorEditor
                        value={settings.subtitle}
                        onChange={(value) => updateField("subtitle", value)}
                        placeholder="Digite o subtítulo..."
                        rows={2}
                        label=""
                        className={validation.subtitle ? "border-red-300 bg-red-50" : ""}
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
                      <label className="text-sm font-semibold text-gray-900">Descrição</label>
                      <TokenColorEditor
                        value={settings.description}
                        onChange={(value) => updateField("description", value)}
                        placeholder="Digite uma descrição detalhada..."
                        rows={3}
                        label=""
                      />
                    </div>

                    {/* CTAs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-900">CTA Principal *</label>
                        <TokenColorEditor
                          value={settings.cta_text}
                          onChange={(value) => updateField("cta_text", value)}
                          placeholder="Ex: Quero ser Revendedor"
                          rows={2}
                          label=""
                          className={validation.cta_text ? "border-red-300 bg-red-50" : ""}
                        />
                        {validation.cta_text && (
                          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2 rounded-lg">
                            <AlertCircle className="w-3 h-3" />
                            <span className="text-xs font-medium">{validation.cta_text}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-900">CTA Secundário</label>
                        <TokenColorEditor
                          value={settings.cta_secondary_text}
                          onChange={(value) => updateField("cta_secondary_text", value)}
                          placeholder="Ex: Saiba Mais"
                          rows={2}
                          label=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Tab */}
              {activeTab === 'visual' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Logo Upload */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Image className="w-5 h-5 mr-2 text-ecko-red" />
                        Logo da Empresa
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <OptimizedImageUpload
                          value={settings.logo_url}
                          onChange={(url) => updateField("logo_url", url)}
                          label=""
                          maxSizeKB={200}
                          maxWidth={800}
                          maxHeight={400}
                          quality={0.9}
                          acceptedTypes={["image/png", "image/jpeg", "image/webp"]}
                        />
                        {/* Logo Preview */}
                        {settings.logo_url && (
                          <div className="mt-4 p-3 bg-white rounded border">
                            <p className="text-xs text-gray-600 mb-2">Preview:</p>
                            <img
                              src={settings.logo_url}
                              alt="Logo preview"
                              className="h-16 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Background Upload */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Image className="w-5 h-5 mr-2 text-ecko-red" />
                        Imagem de Background
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <OptimizedImageUpload
                          value={settings.background_image}
                          onChange={(url) => updateField("background_image", url)}
                          label=""
                          maxSizeKB={800}
                          maxWidth={1920}
                          maxHeight={1080}
                          quality={0.8}
                          acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                        />
                        {/* Background Preview */}
                        {settings.background_image && (
                          <div className="mt-4 p-3 bg-white rounded border">
                            <p className="text-xs text-gray-600 mb-2">Preview:</p>
                            <div className="relative h-32 rounded overflow-hidden">
                              <img
                                src={settings.background_image}
                                alt="Background preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">Preview do Hero</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Style Tab */}
              {activeTab === 'style' && (
                <div className="space-y-8">
                  {/* Color Presets */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <PaletteIcon className="w-5 h-5 mr-2 text-ecko-red" />
                      Presets de Cores
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      <button
                        onClick={() => applyColorPreset('ecko')}
                        className="p-4 rounded-lg border border-gray-200 hover:border-red-300 transition-all group text-center"
                      >
                        <div className="flex space-x-1 mb-2 justify-center">
                          <div className="w-4 h-4 bg-black rounded"></div>
                          <div className="w-4 h-4 bg-white border rounded"></div>
                          <div className="w-4 h-4 bg-red-600 rounded"></div>
                        </div>
                        <span className="text-sm text-gray-700">Ecko</span>
                      </button>
                      
                      <button
                        onClick={() => applyColorPreset('luxury')}
                        className="p-4 rounded-lg border border-gray-200 hover:border-yellow-300 transition-all group text-center"
                      >
                        <div className="flex space-x-1 mb-2 justify-center">
                          <div className="w-4 h-4 bg-gray-800 rounded"></div>
                          <div className="w-4 h-4 bg-gray-100 rounded"></div>
                          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        </div>
                        <span className="text-sm text-gray-700">Luxury</span>
                      </button>
                      
                      <button
                        onClick={() => applyColorPreset('vibrant')}
                        className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all group text-center"
                      >
                        <div className="flex space-x-1 mb-2 justify-center">
                          <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                          <div className="w-4 h-4 bg-white border rounded"></div>
                          <div className="w-4 h-4 bg-amber-500 rounded"></div>
                        </div>
                        <span className="text-sm text-gray-700">Vibrant</span>
                      </button>
                      
                      <button
                        onClick={() => applyColorPreset('minimal')}
                        className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all group text-center"
                      >
                        <div className="flex space-x-1 mb-2 justify-center">
                          <div className="w-4 h-4 bg-white border rounded"></div>
                          <div className="w-4 h-4 bg-gray-900 rounded"></div>
                          <div className="w-4 h-4 bg-blue-600 rounded"></div>
                        </div>
                        <span className="text-sm text-gray-700">Minimal</span>
                      </button>
                    </div>
                  </div>

                  {/* Individual Colors */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Cores Individuais</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-900">Fundo</label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={settings.background_color}
                            onChange={(e) => updateField("background_color", e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <Input
                            value={settings.background_color}
                            onChange={(e) => updateField("background_color", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-900">Texto</label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={settings.text_color}
                            onChange={(e) => updateField("text_color", e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <Input
                            value={settings.text_color}
                            onChange={(e) => updateField("text_color", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-900">Botão</label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={settings.cta_color}
                            onChange={(e) => updateField("cta_color", e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <Input
                            value={settings.cta_color}
                            onChange={(e) => updateField("cta_color", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-900">Texto do Botão</label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={settings.cta_text_color}
                            onChange={(e) => updateField("cta_text_color", e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <Input
                            value={settings.cta_text_color}
                            onChange={(e) => updateField("cta_text_color", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overlay Controls */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Layers className="w-5 h-5 mr-2 text-ecko-red" />
                      Overlay com Gradientes
                    </h3>
                    
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-amber-700 text-sm">
                        <strong>Sistema de Overlay:</strong> Usa múltiplas camadas - uma cor base controlável + gradientes automáticos para melhor efeito visual.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-900">Cor do Overlay</label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={settings.overlay_color}
                            onChange={(e) => updateField("overlay_color", e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <Input
                            value={settings.overlay_color}
                            onChange={(e) => updateField("overlay_color", e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium text-gray-900">Opacidade</label>
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{settings.overlay_opacity}%</span>
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
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0%</span>
                          <span>90%</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <button
                        onClick={() => {
                          updateField("overlay_color", "#000000");
                          updateField("overlay_opacity", 70);
                        }}
                        className="p-3 rounded border border-gray-200 hover:border-gray-400 text-center transition-colors"
                      >
                        <div className="w-full h-8 bg-black/70 rounded mb-2"></div>
                        <span className="text-xs text-gray-600">Padrão</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          updateField("overlay_color", "#000000");
                          updateField("overlay_opacity", 50);
                        }}
                        className="p-3 rounded border border-gray-200 hover:border-gray-400 text-center transition-colors"
                      >
                        <div className="w-full h-8 bg-black/50 rounded mb-2"></div>
                        <span className="text-xs text-gray-600">Sutil</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          updateField("overlay_color", "#000000");
                          updateField("overlay_opacity", 90);
                        }}
                        className="p-3 rounded border border-gray-200 hover:border-gray-400 text-center transition-colors"
                      >
                        <div className="w-full h-8 bg-black/90 rounded mb-2"></div>
                        <span className="text-xs text-gray-600">Intenso</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          updateField("overlay_color", "#000000");
                          updateField("overlay_opacity", 0);
                        }}
                        className="p-3 rounded border border-gray-200 hover:border-gray-400 text-center transition-colors"
                      >
                        <div className="w-full h-8 bg-transparent border border-gray-300 rounded mb-2"></div>
                        <span className="text-xs text-gray-600">Sem</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
