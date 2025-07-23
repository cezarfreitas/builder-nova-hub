import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { CompactImageUpload } from "../../components/CompactImageUpload";
import { TokenColorEditor } from "../../components/TokenColorEditor";
import { renderTextWithColorTokens } from "../../utils/colorTokens";
import { useToast } from "../../hooks/use-toast";
import {
  Star,
  Save,
  RefreshCw,
  Upload,
  Eye,
  EyeOff,
  Image,
  Palette,
  Type,
  MousePointer,
  Check
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
  logo_url: string;
  video_url: string;
  enabled: boolean;
}

export default function AdminHero() {
  const [settings, setSettings] = useState<HeroSettings>({
    title: "Torne-se um Revendedor Ecko",
    subtitle: "Oportunidade única de negócio",
    description: "Junte-se à rede de revendedores Ecko e maximize seus lucros com produtos de alta qualidade e suporte completo.",
    cta_text: "Quero ser Revendedor",
    cta_secondary_text: "Saiba Mais",
    background_image: "",
    background_color: "#dc2626",
    text_color: "#ffffff",
    cta_color: "#ffffff",
    logo_url: "",
    video_url: "",
    enabled: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Carregar configurações do hero
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/hero');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSettings(prev => ({ ...prev, ...result.data }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do hero:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do hero",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Salvar configurações
  const saveSettings = async () => {
    try {
      setSaving(true);
      console.log('Salvando configurações do hero:', settings);

      const response = await fetch('/api/settings/hero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Response result:', result);

        if (result.success) {
          toast({
            title: "Sucesso",
            description: "Configurações do hero salvas com sucesso!",
          });
        } else {
          throw new Error(result.message || 'Erro ao salvar');
        }
      } else {
        const errorText = await response.text();
        console.error('Response error:', errorText);

        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || `HTTP ${response.status}: ${response.statusText}`);
        } catch {
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar configurações do hero",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ecko-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Star className="w-8 h-8 mr-3 text-ecko-red" />
            Configuração do Hero
          </h1>
          <p className="text-gray-600 mt-2">
            Personalize a seção principal da sua landing page para maximizar conversões.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Test Upload Button */}
          <Button
            onClick={async () => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  try {
                    const formData = new FormData();
                    formData.append('image', file);
                    console.log('Testing upload with file:', file);

                    const response = await fetch('/api/test-upload', {
                      method: 'POST',
                      body: formData,
                    });

                    const result = await response.json();
                    console.log('Test upload result:', result);

                    toast({
                      title: "Teste de Upload",
                      description: result.success ? "Upload funcionando!" : "Erro no upload",
                      variant: result.success ? "default" : "destructive",
                    });
                  } catch (error) {
                    console.error('Test upload error:', error);
                    toast({
                      title: "Erro no teste",
                      description: "Erro ao testar upload",
                      variant: "destructive",
                    });
                  }
                }
              };
              input.click();
            }}
            variant="outline"
            size="sm"
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Testar Upload
          </Button>

          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            {previewMode ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Ocultar Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Ver Preview
              </>
            )}
          </Button>

          <Button
            onClick={loadSettings}
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recarregar
          </Button>

          <Button
            onClick={saveSettings}
            size="sm"
            className="bg-ecko-red hover:bg-ecko-red-dark"
            disabled={saving}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <Badge 
          className={`${settings.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {settings.enabled ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Ativo
            </>
          ) : (
            'Inativo'
          )}
        </Badge>
        <Button
          onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
          variant="outline"
          size="sm"
        >
          {settings.enabled ? 'Desativar' : 'Ativar'} Hero
        </Button>
      </div>

      {/* Preview */}
      {previewMode && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Eye className="w-5 h-5 mr-2" />
              Preview do Hero
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="relative min-h-96 rounded-lg p-8 flex items-center justify-center"
              style={{
                backgroundColor: settings.background_color,
                backgroundImage: settings.background_image ? `url(${settings.background_image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: settings.text_color
              }}
            >
              <div className="text-center max-w-2xl">
                {settings.logo_url && (
                  <img 
                    src={settings.logo_url} 
                    alt="Logo" 
                    className="h-16 mx-auto mb-6"
                  />
                )}
                
                <h2 className="text-sm font-semibold mb-2 opacity-90">
                  {renderTextWithColorTokens(settings.subtitle)}
                </h2>

                <h1 className="text-4xl font-bold mb-4">
                  {renderTextWithColorTokens(settings.title)}
                </h1>

                <p className="text-lg mb-8 opacity-90">
                  {renderTextWithColorTokens(settings.description)}
                </p>
                
                <div className="flex gap-4 justify-center">
                  <button
                    className="px-6 py-3 rounded-lg font-semibold"
                    style={{ backgroundColor: settings.cta_color, color: settings.background_color }}
                  >
                    {settings.cta_text}
                  </button>
                  
                  {settings.cta_secondary_text && (
                    <button className="px-6 py-3 rounded-lg font-semibold border-2 opacity-80">
                      {settings.cta_secondary_text}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações de Texto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Type className="w-5 h-5 mr-2 text-blue-600" />
              Conteúdo do Hero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <TokenColorEditor
                label="Título Principal"
                value={settings.title}
                onChange={(value) => setSettings(prev => ({ ...prev, title: value }))}
                placeholder="Torne-se um {ecko}Revendedor Ecko{/ecko}"
                rows={3}
              />
            </div>

            <div>
              <TokenColorEditor
                label="Subtítulo"
                value={settings.subtitle}
                onChange={(value) => setSettings(prev => ({ ...prev, subtitle: value }))}
                placeholder="Oportunidade {ecko}única{/ecko} de negócio"
                rows={2}
              />
            </div>

            <div>
              <TokenColorEditor
                label="Descrição"
                value={settings.description}
                onChange={(value) => setSettings(prev => ({ ...prev, description: value }))}
                placeholder="Junte-se à rede de revendedores {ecko}Ecko{/ecko} e maximize seus {green}lucros{/green} com produtos de alta qualidade..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do CTA Principal
                </label>
                <Input
                  value={settings.cta_text}
                  onChange={(e) => setSettings(prev => ({ ...prev, cta_text: e.target.value }))}
                  placeholder="Quero ser Revendedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do CTA Secundário
                </label>
                <Input
                  value={settings.cta_secondary_text}
                  onChange={(e) => setSettings(prev => ({ ...prev, cta_secondary_text: e.target.value }))}
                  placeholder="Saiba Mais"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações Visuais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2 text-purple-600" />
              Personalização Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo da Empresa
              </label>
              <CompactImageUpload
                value={settings.logo_url}
                onChange={(value) => setSettings(prev => ({ ...prev, logo_url: value }))}
                placeholder="URL da logo ou faça upload"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem de Fundo
              </label>
              <CompactImageUpload
                value={settings.background_image}
                onChange={(value) => setSettings(prev => ({ ...prev, background_image: value }))}
                placeholder="URL da imagem de fundo ou faça upload"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Vídeo (opcional)
              </label>
              <Input
                value={settings.video_url}
                onChange={(e) => setSettings(prev => ({ ...prev, video_url: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor de Fundo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.background_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, background_color: e.target.value }))}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={settings.background_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, background_color: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do Texto
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.text_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, text_color: e.target.value }))}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={settings.text_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, text_color: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor do Botão CTA
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.cta_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, cta_color: e.target.value }))}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={settings.cta_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, cta_color: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dicas e Recomendações */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <MousePointer className="w-5 h-5 mr-2" />
            Dicas para Otimização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-semibold mb-2">📝 Texto</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Mantenha o título curto e impactante (max 8 palavras)</li>
                <li>• Use verbos de ação no CTA ("Quero", "Começar", "Descobrir")</li>
                <li>• Destaque benefícios únicos na descrição</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎨 Visual</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Use imagens de alta qualidade (min 1920x1080)</li>
                <li>• Contraste adequado entre texto e fundo</li>
                <li>• Cores que reflitam a identidade da marca</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🏷️ Tokens de Cor</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Use <code className="px-1 bg-blue-100 rounded text-xs">{`{ecko}texto{/ecko}`}</code> para palavras importantes</li>
                <li>• Selecione texto e clique em uma cor para aplicar</li>
                <li>• Use <code className="px-1 bg-blue-100 rounded text-xs">{`{red}{/red}`}</code>, <code className="px-1 bg-blue-100 rounded text-xs">{`{blue}{/blue}`}</code>, etc.</li>
                <li>• Cores destacam palavras-chave automaticamente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
