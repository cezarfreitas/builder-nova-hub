import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { useAboutSection } from "../../hooks/useAboutSection";
import { TokenColorEditor } from "../../components/TokenColorEditor";
import { OptimizedImageUpload } from "../../components/OptimizedImageUpload";
import { renderTextWithColorTokens } from "../../utils/colorTokens";
import {
  Save,
  Type,
  BarChart3,
  Target,
  AlertCircle,
  Loader2,
  History,
  Plus,
  Trash2,
  Image,
  Palette,
  Sliders,
  Settings,
  Lightbulb,
} from "lucide-react";

interface AboutSettings {
  section_tag: string;
  section_title: string;
  section_subtitle: string;
  section_description: string;
  content: string;
  stats: {
    id: number;
    number: string;
    label: string;
    description: string;
  }[];
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
  background_type: string;
  background_color: string;
  background_image: string;
  overlay_enabled: boolean;
  overlay_color: string;
  overlay_opacity: number;
  overlay_blend_mode: string;
  overlay_gradient_enabled: boolean;
  overlay_gradient_start: string;
  overlay_gradient_end: string;
  overlay_gradient_direction: string;
}

export default function AdminAbout() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<AboutSettings>(content.about);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "textos" | "historia" | "estatisticas" | "background" | "cta"
  >("textos");
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Sincronizar com o conteúdo JSON quando carregado
  useEffect(() => {
    if (content.about) {
      setSettings(content.about);
    }
  }, [content.about]);

  // Detectar mudanças
  useEffect(() => {
    const hasChanges =
      JSON.stringify(settings) !== JSON.stringify(content.about);
    setHasChanges(hasChanges);
  }, [settings, content.about]);

  // Salvar configurações
  const saveSettings = async () => {
    try {
      setSaving(true);

      const updatedContent = {
        ...content,
        about: settings,
      };

      const result = await saveContent(updatedContent);

      if (result.success) {
        toast({
          title: "Seção Sobre atualizada!",
          description: "As configurações foram salvas com sucesso.",
        });
        setHasChanges(false);
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar seção Sobre:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Atualizar campo específico
  const updateField = (field: keyof AboutSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Adicionar nova estatística
  const addStat = () => {
    const newStat = {
      id: Math.max(...settings.stats.map((s) => s.id), 0) + 1,
      number: "0+",
      label: "Nova Estatística",
      description: "Descrição da estatística",
    };
    updateField("stats", [...settings.stats, newStat]);
  };

  // Remover estatística
  const removeStat = (id: number) => {
    updateField(
      "stats",
      settings.stats.filter((stat) => stat.id !== id),
    );
  };

  // Atualizar estatística específica
  const updateStat = (id: number, field: string, value: string) => {
    const updatedStats = settings.stats.map((stat) =>
      stat.id === id ? { ...stat, [field]: value } : stat,
    );
    updateField("stats", updatedStats);
  };

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-ecko-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sobre a Ecko</h1>
          <p className="text-gray-600">
            Gerencie o conteúdo da seção sobre a história da marca
          </p>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-300"
            >
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
            onClick={() => setActiveTab("textos")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "textos"
                ? "border-ecko-red text-ecko-red"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Type className="w-4 h-4 mr-2 inline" />
            Textos
          </button>
          <button
            onClick={() => setActiveTab("historia")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "historia"
                ? "border-ecko-red text-ecko-red"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <History className="w-4 h-4 mr-2 inline" />
            História
          </button>
          <button
            onClick={() => setActiveTab("estatisticas")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "estatisticas"
                ? "border-ecko-red text-ecko-red"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2 inline" />
            Estatísticas
          </button>
          <button
            onClick={() => setActiveTab("background")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "background"
                ? "border-ecko-red text-ecko-red"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Palette className="w-4 h-4 mr-2 inline" />
            Background
          </button>
          <button
            onClick={() => setActiveTab("cta")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "cta"
                ? "border-ecko-red text-ecko-red"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Target className="w-4 h-4 mr-2 inline" />
            CTA
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "textos" ? (
        <div className="space-y-6">
          {/* Color Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-blue-900 text-sm">Destaque de Texto</h4>
              </div>
              <p className="text-blue-700 text-xs mb-3">
                Use <code className="bg-blue-100 px-1 rounded text-blue-800">{"{ecko}texto{/ecko}"}</code> em qualquer campo de texto para destacar palavras com a cor da marca.
              </p>

              {/* Color Examples */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-blue-600 mr-2">Cores disponíveis:</span>
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

              <div className="mt-3 text-xs text-blue-600">
                <p><strong>Exemplo:</strong> "SOBRE A {"{ecko}"}ECKO{"{/ecko}"}" destacará "ECKO" em vermelho</p>
              </div>
            </CardContent>
          </Card>

          {/* Textos da Seção */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Type className="w-5 h-5 mr-2 text-ecko-red" />
                Textos da Seção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tag da Seção
                </label>
                <TokenColorEditor
                  value={settings.section_tag}
                  onChange={(value) => updateField("section_tag", value)}
                  placeholder="Nossa História"
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título Principal
                </label>
                <TokenColorEditor
                  value={settings.section_title}
                  onChange={(value) => updateField("section_title", value)}
                  placeholder="SOBRE A {ecko}ECKO{/ecko}"
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subtítulo
                </label>
                <TokenColorEditor
                  value={settings.section_subtitle}
                  onChange={(value) => updateField("section_subtitle", value)}
                  placeholder="mais de 20 anos de streetwear"
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descrição da Seção
                </label>
                <TokenColorEditor
                  value={settings.section_description}
                  onChange={(value) =>
                    updateField("section_description", value)
                  }
                  placeholder="Conheça a trajetória de uma das marcas..."
                  rows={3}
                  label=""
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === "historia" ? (
        <div className="space-y-6">
          {/* Conteúdo da História */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <History className="w-5 h-5 mr-2 text-ecko-red" />
                História da Marca
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Conteúdo da História
                </label>
                <TokenColorEditor
                  value={settings.content}
                  onChange={(value) => updateField("content", value)}
                  placeholder="Fundada em 1993 por Marc Milecofsky..."
                  rows={8}
                  label=""
                />
                <p className="text-xs text-gray-500">
                  Use quebras de linha duplas (Enter duas vezes) para separar
                  parágrafos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === "estatisticas" ? (
        <div className="space-y-6">
          {/* Botão Adicionar */}
          <div className="flex justify-end">
            <Button
              onClick={addStat}
              className="bg-ecko-red hover:bg-ecko-red-dark"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Estatística
            </Button>
          </div>

          {/* Estatísticas */}
          <div className="space-y-4">
            {settings.stats.map((stat) => (
              <Card key={stat.id} className="bg-white border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      Estatística #{stat.id}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeStat(stat.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">
                        Número
                      </label>
                      <Input
                        value={stat.number}
                        onChange={(e) =>
                          updateStat(stat.id, "number", e.target.value)
                        }
                        placeholder="30+"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">
                        Label
                      </label>
                      <Input
                        value={stat.label}
                        onChange={(e) =>
                          updateStat(stat.id, "label", e.target.value)
                        }
                        placeholder="Anos de História"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Descrição
                    </label>
                    <TokenColorEditor
                      value={stat.description}
                      onChange={(value) =>
                        updateStat(stat.id, "description", value)
                      }
                      placeholder="Mais de três décadas construindo..."
                      rows={2}
                      label=""
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {settings.stats.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma estatística cadastrada</p>
                <p className="text-sm">
                  Clique em "Adicionar Estatística" para começar
                </p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "background" ? (
        <div className="space-y-6">
          {/* Tipo de Background */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Palette className="w-5 h-5 mr-2 text-ecko-red" />
                Tipo de Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Selecione o tipo de background
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => updateField("background_type", "color")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      (settings.background_type || "color") === "color"
                        ? "border-ecko-red bg-ecko-red/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Palette className="w-6 h-6 mx-auto mb-2 text-ecko-red" />
                    <div className="text-sm font-medium">Cor Sólida</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField("background_type", "image")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.background_type === "image"
                        ? "border-ecko-red bg-ecko-red/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image className="w-6 h-6 mx-auto mb-2 text-ecko-red" />
                    <div className="text-sm font-medium">Imagem</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField("background_type", "gradient")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.background_type === "gradient"
                        ? "border-ecko-red bg-ecko-red/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Sliders className="w-6 h-6 mx-auto mb-2 text-ecko-red" />
                    <div className="text-sm font-medium">Gradiente</div>
                  </button>
                </div>
              </div>

              {/* Configurações específicas por tipo */}
              {(!settings.background_type || settings.background_type === "color") && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cor de Fundo
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={settings.background_color || "#ffffff"}
                      onChange={(e) => updateField("background_color", e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.background_color || "#ffffff"}
                      onChange={(e) => updateField("background_color", e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              )}

              {settings.background_type === "image" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Imagem de Fundo
                  </label>
                  <OptimizedImageUpload
                    value={settings.background_image || ""}
                    onChange={(url) => updateField("background_image", url)}
                    onClear={() => updateField("background_image", "")}
                  />
                </div>
              )}

              {settings.background_type === "gradient" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Cor Inicial
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={settings.overlay_gradient_start || "#000000"}
                          onChange={(e) => updateField("overlay_gradient_start", e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={settings.overlay_gradient_start || "#000000"}
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
                          value={settings.overlay_gradient_end || "#333333"}
                          onChange={(e) => updateField("overlay_gradient_end", e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={settings.overlay_gradient_end || "#333333"}
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
                      value={settings.overlay_gradient_direction || "to bottom"}
                      onChange={(e) => updateField("overlay_gradient_direction", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="to bottom">Vertical (Topo → Base)</option>
                      <option value="to top">Vertical (Base → Topo)</option>
                      <option value="to right">Horizontal (Esquerda → Direita)</option>
                      <option value="to left">Horizontal (Direita → Esquerda)</option>
                      <option value="to bottom right">Diagonal (Topo-Esq → Base-Dir)</option>
                      <option value="to bottom left">Diagonal (Topo-Dir → Base-Esq)</option>
                    </select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overlay */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-ecko-red" />
                Overlay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.overlay_enabled || false}
                    onChange={(e) => updateField("overlay_enabled", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Ativar overlay
                  </span>
                </label>
              </div>

              {settings.overlay_enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Cor do Overlay
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={settings.overlay_color || "#000000"}
                          onChange={(e) => updateField("overlay_color", e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={settings.overlay_color || "#000000"}
                          onChange={(e) => updateField("overlay_color", e.target.value)}
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Opacidade: {settings.overlay_opacity || 50}%
                      </label>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.overlay_opacity || 50}
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
                      value={settings.overlay_blend_mode || "normal"}
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

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.overlay_gradient_enabled || false}
                        onChange={(e) => updateField("overlay_gradient_enabled", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Usar gradiente no overlay
                      </span>
                    </label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Image className="w-5 h-5 mr-2 text-ecko-red" />
                Preview do Background
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="relative h-64 rounded-lg overflow-hidden"
                style={{
                  ...(settings.background_type === "gradient"
                    ? {
                        background: `linear-gradient(${settings.overlay_gradient_direction || 'to bottom'}, ${settings.overlay_gradient_start || '#000000'}, ${settings.overlay_gradient_end || '#333333'})`
                      }
                    : settings.background_type === "image" && settings.background_image
                    ? {
                        backgroundImage: `url(${settings.background_image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"
                      }
                    : {
                        backgroundColor: settings.background_color || "#ffffff"
                      }
                  )
                }}
              >
                {/* Overlay */}
                {settings.overlay_enabled && (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: settings.overlay_gradient_enabled
                        ? `linear-gradient(${settings.overlay_gradient_direction || 'to bottom'}, ${settings.overlay_gradient_start || '#000000'}, ${settings.overlay_gradient_end || '#333333'})`
                        : settings.overlay_color || "#000000",
                      opacity: (settings.overlay_opacity || 50) / 100,
                      mixBlendMode: settings.overlay_blend_mode || "normal",
                    }}
                  />
                )}

                {/* Content Preview */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-center text-center">
                  <div className="text-white">
                    <p className="text-sm mb-2 opacity-90">
                      {settings.section_tag || "Nossa História"}
                    </p>
                    <h2 className="text-xl font-bold mb-2">
                      {renderTextWithColorTokens(settings.section_title || "SOBRE A {ecko}ECKO{/ecko}")}
                    </h2>
                    <p className="text-sm mb-4 opacity-80">
                      {settings.section_subtitle || "mais de 20 anos de streetwear"}
                    </p>
                    <p className="text-xs opacity-70">
                      Preview do background aplicado à seção About
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // CTA
        <div className="space-y-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-ecko-red" />
                Call to Action
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título do CTA
                </label>
                <TokenColorEditor
                  value={settings.cta_title}
                  onChange={(value) => updateField("cta_title", value)}
                  placeholder="Faça Parte Desta História"
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descrição do CTA
                </label>
                <TokenColorEditor
                  value={settings.cta_description}
                  onChange={(value) => updateField("cta_description", value)}
                  placeholder="Torne-se um revendedor oficial..."
                  rows={3}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Texto do Botão
                </label>
                <TokenColorEditor
                  value={settings.cta_button_text}
                  onChange={(value) => updateField("cta_button_text", value)}
                  placeholder="QUERO SER PARTE DA ECKO"
                  rows={2}
                  label=""
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
