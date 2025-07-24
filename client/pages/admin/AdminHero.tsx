import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { TokenColorEditor } from "../../components/TokenColorEditor";
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
  Copy
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
  const [validation, setValidation] = useState<{[key: string]: string}>({});
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
    const newValidation: {[key: string]: string} = {};
    
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
    
    if (settings.logo_url && !isValidUrl(settings.logo_url)) {
      newValidation.logo_url = "URL do logo inválida";
    }
    
    if (settings.background_image && !isValidUrl(settings.background_image)) {
      newValidation.background_image = "URL da imagem inválida";
    }
    
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

  // Validar URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Auto-save silencioso
  const autoSaveSettings = useCallback(async () => {
    if (Object.keys(validation).length > 0) return;
    
    try {
      setAutoSaving(true);
      
      const updatedContent = {
        ...content,
        hero: settings
      };

      await saveContent(updatedContent);
      setHasChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Erro no auto-save:', error);
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
        hero: settings
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
        throw new Error('Falha ao salvar');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações do hero:', error);
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
    setSettings(prev => ({
      ...prev,
      [field]: value
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
            <p className="text-gray-900 font-medium">Carregando configurações</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Hero</h1>
          <p className="text-gray-600 mt-2">
            Configure a seção principal da landing page
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Status badges */}
          {autoSaving && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Auto-salvando...
            </Badge>
          )}

          {lastSaved && (
            <Badge variant="secondary" className="bg-gray-50 text-gray-600 border-gray-200">
              <Clock className="w-3 h-3 mr-1" />
              Salvo {lastSaved.toLocaleTimeString()}
            </Badge>
          )}

          {hasChanges && !autoSaving && (
            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Alterações pendentes
            </Badge>
          )}

          {!hasChanges && !autoSaving && (
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Tudo salvo
            </Badge>
          )}

          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
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
            {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {previewMode ? 'Ocultar Preview' : 'Mostrar Preview'}
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
            onClick={() => window.open('/', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Landing Page
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
                backgroundColor: settings.background_color,
                backgroundImage: settings.background_image ? `url(${settings.background_image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
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
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Subtitle */}
                {settings.subtitle && (
                  <p 
                    className="text-lg opacity-90"
                    style={{ color: settings.text_color }}
                  >
                    {renderTextWithColorTokens(settings.subtitle)}
                  </p>
                )}
                
                {/* Title */}
                <h1 
                  className="text-4xl font-black leading-tight"
                  style={{ color: settings.text_color }}
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
      )}

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
                onChange={(value) => updateField('title', value)}
                placeholder="Digite o título principal..."
                rows={3}
                label=""
                className={validation.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {validation.title && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validation.title}
                </p>
              )}
              <p className="text-gray-500 text-sm flex items-center">
                <Info className="w-4 h-4 mr-1" />
                Use tokens de cor como {'{ecko}texto{/ecko}'} para destacar
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Subtítulo *
              </label>
              <TokenColorEditor
                value={settings.subtitle}
                onChange={(value) => updateField('subtitle', value)}
                placeholder="Digite o subtítulo..."
                rows={2}
                label=""
                className={validation.subtitle ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
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
                onChange={(value) => updateField('description', value)}
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
                <Input
                  value={settings.cta_text}
                  onChange={(e) => updateField('cta_text', e.target.value)}
                  placeholder="Ex: Quero ser Revendedor"
                  className={validation.cta_text ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
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
                <Input
                  value={settings.cta_secondary_text}
                  onChange={(e) => updateField('cta_secondary_text', e.target.value)}
                  placeholder="Ex: Saiba Mais"
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
                  onClick={() => updateField('enabled', !settings.enabled)}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    settings.enabled
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  {settings.enabled ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {settings.enabled ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Logo URL
              </label>
              <Input
                value={settings.logo_url}
                onChange={(e) => updateField('logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
                className={validation.logo_url ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {validation.logo_url && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validation.logo_url}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Imagem de Background
              </label>
              <Input
                value={settings.background_image}
                onChange={(e) => updateField('background_image', e.target.value)}
                placeholder="https://example.com/background.jpg"
                className={validation.background_image ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {validation.background_image && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validation.background_image}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cor de Fundo
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.background_color}
                    onChange={(e) => updateField('background_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.background_color}
                    onChange={(e) => updateField('background_color', e.target.value)}
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
                    value={settings.text_color}
                    onChange={(e) => updateField('text_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.text_color}
                    onChange={(e) => updateField('text_color', e.target.value)}
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
                    value={settings.cta_color}
                    onChange={(e) => updateField('cta_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cta_color}
                    onChange={(e) => updateField('cta_color', e.target.value)}
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
                    value={settings.cta_text_color}
                    onChange={(e) => updateField('cta_text_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.cta_text_color}
                    onChange={(e) => updateField('cta_text_color', e.target.value)}
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
