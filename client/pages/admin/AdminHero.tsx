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
import { useContent } from "../../hooks/useContent";
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
  Check,
  FileText,
  Database
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

  // Salvar configurações no JSON
  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const updatedContent = {
        ...content,
        hero: settings
      };

      const result = await saveContent(updatedContent);
      
      if (result.success) {
        toast({
          title: "✅ Hero atualizado!",
          description: "As configurações foram salvas no arquivo JSON com sucesso.",
        });
        setHasChanges(false);
      } else {
        throw new Error('Falha ao salvar');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações do hero:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar as configurações do hero.",
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
      title: "🔄 Resetado",
      description: "Configurações resetadas para os valores originais.",
    });
  };

  // Atualizar campo específico
  const updateField = (field: keyof HeroSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (contentLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ecko-red mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 flex items-center">
                <Star className="w-8 h-8 text-ecko-red mr-3" />
                Configurações do Hero
              </h1>
              <p className="text-gray-400">
                Configure a seção principal da landing page
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-400 border-green-400">
                <FileText className="w-4 h-4 mr-2" />
                Modo JSON
              </Badge>
              
              {hasChanges && (
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  Alterações não salvas
                </Badge>
              )}
              
              <Button
                onClick={() => setPreviewMode(!previewMode)}
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              >
                {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {previewMode ? 'Ocultar Preview' : 'Mostrar Preview'}
              </Button>
              
              <Button
                onClick={resetSettings}
                variant="outline"
                disabled={!hasChanges}
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
              
              <Button
                onClick={saveSettings}
                disabled={saving || !hasChanges}
                className="bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {previewMode && (
          <div className="mb-8">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Preview do Hero
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative h-96 rounded-lg overflow-hidden flex items-center justify-center"
                  style={{ 
                    backgroundColor: settings.background_color,
                    backgroundImage: settings.background_image ? `url(${settings.background_image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50"></div>
                  
                  {/* Content */}
                  <div className="relative text-center px-6 max-w-4xl">
                    {/* Logo Preview */}
                    {settings.logo_url && (
                      <div className="mb-6">
                        <img 
                          src={settings.logo_url} 
                          alt="Logo" 
                          className="h-16 mx-auto object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Subtitle */}
                    {settings.subtitle && (
                      <p 
                        className="text-lg mb-4 opacity-90"
                        style={{ color: settings.text_color }}
                      >
                        {renderTextWithColorTokens(settings.subtitle)}
                      </p>
                    )}
                    
                    {/* Title */}
                    <h1 
                      className="text-4xl font-black mb-4 leading-tight"
                      style={{ color: settings.text_color }}
                    >
                      {renderTextWithColorTokens(settings.title)}
                    </h1>
                    
                    {/* Description */}
                    {settings.description && (
                      <p 
                        className="text-lg mb-6 opacity-90"
                        style={{ color: settings.text_color }}
                      >
                        {renderTextWithColorTokens(settings.description)}
                      </p>
                    )}
                    
                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {settings.cta_text && (
                        <button 
                          className="px-8 py-3 font-bold rounded-lg transition-all duration-300 hover:scale-105"
                          style={{ 
                            backgroundColor: settings.cta_color,
                            color: settings.cta_text_color 
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
                            backgroundColor: 'transparent'
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
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Textos */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Type className="w-5 h-5 mr-2" />
                Textos do Hero
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Título Principal
                </label>
                <Textarea
                  value={settings.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Digite o título principal..."
                  className="h-20 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-ecko-red focus:ring-ecko-red/20"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use [texto] para destacar em vermelho
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Subtítulo
                </label>
                <Input
                  value={settings.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="Digite o subtítulo..."
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-ecko-red focus:ring-ecko-red/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Descrição
                </label>
                <Textarea
                  value={settings.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Digite a descrição..."
                  className="h-24 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-ecko-red focus:ring-ecko-red/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    CTA Principal
                  </label>
                  <Input
                    value={settings.cta_text}
                    onChange={(e) => updateField('cta_text', e.target.value)}
                    placeholder="Ex: Quero ser Revendedor"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-ecko-red focus:ring-ecko-red/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    CTA Secundário
                  </label>
                  <Input
                    value={settings.cta_secondary_text}
                    onChange={(e) => updateField('cta_secondary_text', e.target.value)}
                    placeholder="Ex: Saiba Mais"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-ecko-red focus:ring-ecko-red/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual e Cores */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Visual e Cores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateField('enabled', !settings.enabled)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      settings.enabled 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {settings.enabled ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Logo URL
                </label>
                <Input
                  value={settings.logo_url}
                  onChange={(e) => updateField('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-ecko-red focus:ring-ecko-red/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Imagem de Background
                </label>
                <Input
                  value={settings.background_image}
                  onChange={(e) => updateField('background_image', e.target.value)}
                  placeholder="https://example.com/background.jpg"
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-ecko-red focus:ring-ecko-red/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TokenColorEditor
                  label="Cor de Fundo"
                  value={settings.background_color}
                  onChange={(color) => updateField('background_color', color)}
                />

                <TokenColorEditor
                  label="Cor do Texto"
                  value={settings.text_color}
                  onChange={(color) => updateField('text_color', color)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TokenColorEditor
                  label="Cor do CTA"
                  value={settings.cta_color}
                  onChange={(color) => updateField('cta_color', color)}
                />

                <TokenColorEditor
                  label="Texto do CTA"
                  value={settings.cta_text_color}
                  onChange={(color) => updateField('cta_text_color', color)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-between items-center">
          <div>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              onClick={() => window.open('/', '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Landing Page
            </Button>
          </div>
          
          <div className="flex space-x-4">
            <Button
              onClick={resetSettings}
              variant="outline"
              disabled={!hasChanges}
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resetar Mudanças
            </Button>
            
            <Button
              onClick={saveSettings}
              disabled={saving || !hasChanges}
              className="bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700 min-w-[140px]"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
