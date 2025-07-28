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
import { renderTextWithColorTokens } from "../../utils/colorTokens";
import { OptimizedImageUpload } from "../../components/OptimizedImageUpload";
import { useToast } from "../../hooks/use-toast";
import { useHeroSection } from "../../hooks/useHeroSection";
import {
  Save,
  Eye,
  Palette,
  Type,
  Image,
  AlertCircle,
  Loader2,
  Lightbulb,
  MousePointer,
  Settings,
  Sliders,
} from "lucide-react";



export default function AdminHero() {
  const {
    heroSettings: settings,
    loading: contentLoading,
    saveHeroSettings,
    updateField: updateHeroField
  } = useHeroSection();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"textos" | "visual" | "overlay" | "cta" | "preview">("textos");
  const [hasChanges, setHasChanges] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings || null);
  const { toast } = useToast();

  // Sincronizar com as configurações do hero quando carregadas
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  // Detectar mudanças
  useEffect(() => {
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(hasChanges);
  }, [localSettings, settings]);

  // Salvar configurações
  const saveSettings = async () => {
    try {
      setSaving(true);

      const result = await saveHeroSettings(localSettings);

      if (result.success) {
        toast({
          title: "Hero atualizado!",
          description: "As configurações foram salvas com sucesso.",
        });
        setHasChanges(false);
      } else {
        throw new Error(result.error || "Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar hero:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configura��ões.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Atualizar campo específico
  const updateField = (field: keyof typeof settings, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (contentLoading || !localSettings) {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Section</h1>
          <p className="text-gray-600">Configure a seção principal da página</p>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              Alterações pendentes
            </Badge>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-ecko-red hover:bg-ecko-red-dark"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('textos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'textos'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Type className="w-4 h-4 mr-2 inline" />
            Textos
          </button>
          <button
            onClick={() => setActiveTab('visual')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'visual'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Image className="w-4 h-4 mr-2 inline" />
            Visual
          </button>
          <button
            onClick={() => setActiveTab('overlay')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overlay'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Sliders className="w-4 h-4 mr-2 inline" />
            Overlay
          </button>
          <button
            onClick={() => setActiveTab('cta')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cta'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MousePointer className="w-4 h-4 mr-2 inline" />
            CTA
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Eye className="w-4 h-4 mr-2 inline" />
            Preview
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'textos' ? (
        <div className="space-y-6">
          {/* Color Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
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
            </CardContent>
          </Card>

          {/* Textos do Hero */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Type className="w-5 h-5 mr-2 text-ecko-red" />
                Textos do Hero
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subtítulo
                </label>
                <TokenColorEditor
                  value={localSettings.subtitle || ""}
                  onChange={(value) => updateField("subtitle", value)}
                  placeholder="O maior programa de parceria do streetwear"
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título Principal
                </label>
                <TokenColorEditor
                  value={localSettings.title || ""}
                  onChange={(value) => updateField("title", value)}
                  placeholder="SEJA UM {ecko}REVENDEDOR{/ecko} OFICIAL"
                  rows={3}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <TokenColorEditor
                  value={localSettings.description || ""}
                  onChange={(value) => updateField("description", value)}
                  placeholder="Transforme sua paixão em negócio..."
                  rows={4}
                  label=""
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === 'visual' ? (
        <div className="space-y-6">
          {/* Imagens */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Image className="w-5 h-5 mr-2 text-ecko-red" />
                Imagens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Logo
                </label>
                <OptimizedImageUpload
                  value={localSettings.logo_url || ""}
                  onChange={(url) => updateField("logo_url", url)}
                  onClear={() => updateField("logo_url", "")}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Imagem de Fundo
                </label>
                <OptimizedImageUpload
                  value={localSettings.background_image || ""}
                  onChange={(url) => updateField("background_image", url)}
                  onClear={() => updateField("background_image", "")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cores Básicas */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Palette className="w-5 h-5 mr-2 text-ecko-red" />
                Cores Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cor de Fundo
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={settings.background_color || "#000000"}
                      onChange={(e) => updateField("background_color", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.background_color || "#000000"}
                      onChange={(e) => updateField("background_color", e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cor do Texto
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={settings.text_color || "#ffffff"}
                      onChange={(e) => updateField("text_color", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.text_color || "#ffffff"}
                      onChange={(e) => updateField("text_color", e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === 'overlay' ? (
        <div className="space-y-6">
          {/* Overlay Básico */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Sliders className="w-5 h-5 mr-2 text-ecko-red" />
                Overlay Básico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cor do Overlay
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={localSettings.overlay_color || "#000000"}
                      onChange={(e) => updateField("overlay_color", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={localSettings.overlay_color || "#000000"}
                      onChange={(e) => updateField("overlay_color", e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Opacidade: {localSettings.overlay_opacity || 70}%
                  </label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={localSettings.overlay_opacity || 70}
                    onChange={(e) => updateField("overlay_opacity", parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Modo de Mistura
                </label>
                <select
                  value={localSettings.overlay_blend_mode || "normal"}
                  onChange={(e) => updateField("overlay_blend_mode", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                  <option value="soft-light">Soft Light</option>
                  <option value="hard-light">Hard Light</option>
                  <option value="color-dodge">Color Dodge</option>
                  <option value="color-burn">Color Burn</option>
                  <option value="darken">Darken</option>
                  <option value="lighten">Lighten</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Overlay com Gradiente */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-ecko-red" />
                Gradiente Avançado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localSettings.overlay_gradient_enabled || false}
                    onChange={(e) => updateField("overlay_gradient_enabled", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Usar gradiente no overlay
                  </span>
                </label>
              </div>

              {localSettings.overlay_gradient_enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Cor Inicial
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={localSettings.overlay_gradient_start || "#000000"}
                          onChange={(e) => updateField("overlay_gradient_start", e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={localSettings.overlay_gradient_start || "#000000"}
                          onChange={(e) => updateField("overlay_gradient_start", e.target.value)}
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Cor Final
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={localSettings.overlay_gradient_end || "#333333"}
                          onChange={(e) => updateField("overlay_gradient_end", e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={localSettings.overlay_gradient_end || "#333333"}
                          onChange={(e) => updateField("overlay_gradient_end", e.target.value)}
                          placeholder="#333333"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Direção do Gradiente
                    </label>
                    <select
                      value={localSettings.overlay_gradient_direction || "to bottom"}
                      onChange={(e) => updateField("overlay_gradient_direction", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="to bottom">Vertical (Topo → Base)</option>
                      <option value="to top">Vertical (Base → Topo)</option>
                      <option value="to right">Horizontal (Esquerda → Direita)</option>
                      <option value="to left">Horizontal (Direita → Esquerda)</option>
                      <option value="to bottom right">Diagonal (Topo-Esq → Base-Dir)</option>
                      <option value="to bottom left">Diagonal (Topo-Dir → Base-Esq)</option>
                      <option value="radial-gradient(circle, transparent 30%, black 70%)">Radial Centro Transparente</option>
                      <option value="radial-gradient(ellipse at center, black 20%, transparent 50%, black 80%)">Preto → Transparente → Preto</option>
                      <option value="radial-gradient(circle at center, transparent 0%, black 60%)">Transparente Centro → Preto</option>
                    </select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ) : activeTab === 'cta' ? (
        <div className="space-y-6">
          {/* CTA Configuration */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <MousePointer className="w-5 h-5 mr-2 text-ecko-red" />
                Call to Action
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Texto do Botão Principal
                </label>
                <TokenColorEditor
                  value={localSettings.cta_primary_text || ""}
                  onChange={(value) => updateField("cta_primary_text", value)}
                  placeholder="QUERO SER REVENDEDOR"
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Texto do Botão Secundário
                </label>
                <TokenColorEditor
                  value={localSettings.cta_secondary_text || ""}
                  onChange={(value) => updateField("cta_secondary_text", value)}
                  placeholder="DESCUBRA COMO"
                  rows={2}
                  label=""
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cor do Botão
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={localSettings.cta_color || "#dc2626"}
                      onChange={(e) => updateField("cta_color", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={localSettings.cta_color || "#dc2626"}
                      onChange={(e) => updateField("cta_color", e.target.value)}
                      placeholder="#dc2626"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cor do Texto do Botão
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={localSettings.cta_text_color || "#ffffff"}
                      onChange={(e) => updateField("cta_text_color", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={localSettings.cta_text_color || "#ffffff"}
                      onChange={(e) => updateField("cta_text_color", e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Preview
        <div className="space-y-6">
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-ecko-red" />
                Preview do Hero
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="relative h-96 rounded-lg overflow-hidden"
                style={{
                  backgroundColor: localSettings.background_color || "#000000",
                  backgroundImage: localSettings.background_image ? `url(${localSettings.background_image})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: localSettings.text_color || "#ffffff",
                }}
              >
                {/* Overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: localSettings.overlay_gradient_enabled ?
                      `linear-gradient(${localSettings.overlay_gradient_direction || 'to bottom'}, ${localSettings.overlay_gradient_start || '#000000'}, ${localSettings.overlay_gradient_end || '#333333'})` :
                      localSettings.overlay_color || "#000000",
                    opacity: (localSettings.overlay_opacity || 70) / 100,
                    mixBlendMode: localSettings.overlay_blend_mode || "normal",
                  }}
                />

                {/* Content */}
                <div className="relative z-10 p-8 h-full flex flex-col justify-center text-center">
                  {localSettings.logo_url && (
                    <img
                      src={localSettings.logo_url}
                      alt="Logo"
                      className="w-24 h-12 object-contain mx-auto mb-6"
                    />
                  )}

                  {localSettings.subtitle && (
                    <p className="text-lg mb-4 opacity-90">
                      {renderTextWithColorTokens(localSettings.subtitle)}
                    </p>
                  )}

                  {localSettings.title && (
                    <h1 className="text-3xl md:text-4xl font-bold mb-6">
                      {renderTextWithColorTokens(localSettings.title)}
                    </h1>
                  )}

                  {localSettings.description && (
                    <p className="text-lg mb-8 opacity-80 max-w-2xl mx-auto">
                      {renderTextWithColorTokens(localSettings.description)}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {localSettings.cta_primary_text && (
                      <button
                        className="px-8 py-3 rounded-lg text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                        style={{
                          backgroundColor: localSettings.cta_color || "#dc2626",
                          color: localSettings.cta_text_color || "#ffffff",
                        }}
                      >
                        {renderTextWithColorTokens(localSettings.cta_primary_text)}
                      </button>
                    )}

                    {localSettings.cta_secondary_text && (
                      <button
                        className="px-8 py-3 rounded-lg text-lg font-bold border-2 hover:bg-white hover:text-black transition-all"
                        style={{
                          borderColor: localSettings.text_color || "#ffffff",
                          color: localSettings.text_color || "#ffffff",
                        }}
                      >
                        {renderTextWithColorTokens(localSettings.cta_secondary_text)}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
