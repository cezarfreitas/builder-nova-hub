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

  // Atualizar campo específico
  const updateField = (field: keyof HeroSettings, value: string | boolean | number) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
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
          <h1 className="text-2xl font-bold text-gray-900">Hero</h1>
          <p className="text-gray-600">Gerencie o conteúdo e estilo da seção principal</p>
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
            onClick={() => setActiveTab('conteudo')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'conteudo'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Type className="w-4 h-4 mr-2 inline" />
            Conteúdo
          </button>
          <button
            onClick={() => setActiveTab('imagens')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'imagens'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Image className="w-4 h-4 mr-2 inline" />
            Imagens
          </button>
          <button
            onClick={() => setActiveTab('cores')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cores'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PaletteIcon className="w-4 h-4 mr-2 inline" />
            Cores
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'conteudo' ? (
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

          {/* Status Toggle */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
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
            </CardContent>
          </Card>

          {/* Content Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Textos da Seção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título Principal
                </label>
                <TokenColorEditor
                  value={settings.title}
                  onChange={(value) => updateField("title", value)}
                  placeholder="Digite o título principal..."
                  rows={3}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subtítulo
                </label>
                <TokenColorEditor
                  value={settings.subtitle}
                  onChange={(value) => updateField("subtitle", value)}
                  placeholder="Digite o subtítulo..."
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <TokenColorEditor
                  value={settings.description}
                  onChange={(value) => updateField("description", value)}
                  placeholder="Digite uma descrição detalhada..."
                  rows={3}
                  label=""
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    CTA Principal
                  </label>
                  <TokenColorEditor
                    value={settings.cta_text}
                    onChange={(value) => updateField("cta_text", value)}
                    placeholder="Ex: Quero ser Revendedor"
                    rows={2}
                    label=""
                  />
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
        </div>
      ) : activeTab === 'imagens' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Image className="w-5 h-5 mr-2 text-ecko-red" />
                  Logo da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Background Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Image className="w-5 h-5 mr-2 text-ecko-red" />
                  Imagem de Background
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // Cores
        <div className="space-y-6">
          {/* Individual Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PaletteIcon className="w-5 h-5 mr-2 text-ecko-red" />
                Cores da Seção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-900">Cor de Fundo</label>
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
                  <label className="text-sm font-medium text-gray-900">Cor do Texto</label>
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
                  <label className="text-sm font-medium text-gray-900">Cor do Botão</label>
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
            </CardContent>
          </Card>

          {/* Overlay Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="w-5 h-5 mr-2 text-ecko-red" />
                Overlay com Gradientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Explicação do Sistema */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-900 text-sm">Sistema de Overlay Profissional</h4>
                </div>
                <p className="text-blue-700 text-xs mb-3">
                  O overlay usa <strong>múltiplas camadas</strong> para criar um efeito visual profissional:
                </p>
                <div className="space-y-1 text-xs text-blue-600">
                  <div>• <strong>Camada Base:</strong> Cor controlável com opacidade ajustável</div>
                  <div>• <strong>Gradiente Vertical:</strong> Preto transparente → Preto opaco (automático)</div>
                  <div>• <strong>Gradiente Lateral:</strong> Vermelho Ecko sutil nas bordas (automático)</div>
                </div>
              </div>

              {/* Preview do Overlay */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900">Preview do Sistema de Overlay</label>
                <div className="relative h-32 bg-gray-200 rounded-lg overflow-hidden border">
                  {/* Simulação da imagem de fundo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"></div>

                  {/* Camada 1: Overlay Base (controlável) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: settings.overlay_color,
                      opacity: settings.overlay_opacity / 100
                    }}
                  ></div>

                  {/* Camada 2: Gradiente vertical automático */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90"></div>

                  {/* Camada 3: Gradiente lateral automático */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/15 via-transparent to-red-600/15"></div>

                  {/* Texto de exemplo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="font-bold text-lg">Título do Hero</h3>
                      <p className="text-sm opacity-90">Subtítulo com overlay aplicado</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controles da Camada Base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-900">
                    Cor Base do Overlay
                    <span className="text-xs text-gray-500 ml-1">(Camada 1)</span>
                  </label>
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
                    <label className="text-sm font-medium text-gray-900">
                      Intensidade Base
                      <span className="text-xs text-gray-500 ml-1">(Camada 1)</span>
                    </label>
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{settings.overlay_opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={settings.overlay_opacity}
                    onChange={(e) => updateField("overlay_opacity", parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Transparente</span>
                    <span>Muito Escuro</span>
                  </div>
                </div>
              </div>

              {/* Presets Rápidos */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900">Presets de Overlay</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      updateField("overlay_color", "#000000");
                      updateField("overlay_opacity", 70);
                    }}
                    className="group p-3 rounded-lg border border-gray-200 hover:border-gray-400 text-center transition-all"
                  >
                    <div className="relative h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded mb-2 overflow-hidden">
                      <div className="absolute inset-0 bg-black/70"></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/15 via-transparent to-red-600/15"></div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Padrão</span>
                    <div className="text-xs text-gray-500">Preto 70%</div>
                  </button>

                  <button
                    onClick={() => {
                      updateField("overlay_color", "#000000");
                      updateField("overlay_opacity", 50);
                    }}
                    className="group p-3 rounded-lg border border-gray-200 hover:border-gray-400 text-center transition-all"
                  >
                    <div className="relative h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded mb-2 overflow-hidden">
                      <div className="absolute inset-0 bg-black/50"></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/15 via-transparent to-red-600/15"></div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Suave</span>
                    <div className="text-xs text-gray-500">Preto 50%</div>
                  </button>

                  <button
                    onClick={() => {
                      updateField("overlay_color", "#000000");
                      updateField("overlay_opacity", 90);
                    }}
                    className="group p-3 rounded-lg border border-gray-200 hover:border-gray-400 text-center transition-all"
                  >
                    <div className="relative h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded mb-2 overflow-hidden">
                      <div className="absolute inset-0 bg-black/90"></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/15 via-transparent to-red-600/15"></div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Intenso</span>
                    <div className="text-xs text-gray-500">Preto 90%</div>
                  </button>

                  <button
                    onClick={() => {
                      updateField("overlay_color", "#000000");
                      updateField("overlay_opacity", 0);
                    }}
                    className="group p-3 rounded-lg border border-gray-200 hover:border-gray-400 text-center transition-all"
                  >
                    <div className="relative h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded mb-2 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/15 via-transparent to-red-600/15"></div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Apenas Gradientes</span>
                    <div className="text-xs text-gray-500">Base 0%</div>
                  </button>
                </div>
              </div>

              {/* Informações Técnicas */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Informações Técnicas</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div><strong>Camada 1:</strong> {settings.overlay_color} com {settings.overlay_opacity}% de opacidade</div>
                  <div><strong>Camada 2:</strong> Gradiente vertical from-black/50 via-transparent to-black/90</div>
                  <div><strong>Camada 3:</strong> Gradiente lateral from-red-600/15 via-transparent to-red-600/15</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
