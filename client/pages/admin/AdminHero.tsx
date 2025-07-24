import { useState, useEffect, useCallback } from "react";
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
  Database,
  Clock,
  Zap,
  Sparkles,
  Copy,
  ExternalLink,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2
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
          title: "✨ Hero atualizado!",
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
        title: "❌ Erro ao salvar",
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
      title: "🔄 Resetado",
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
        title: "📋 Copiado!",
        description: "Configurações copiadas para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível copiar as configurações.",
        variant: "destructive",
      });
    }
  };

  // Status da validação
  const hasErrors = Object.keys(validation).length > 0;
  const statusColor = hasErrors ? "red" : hasChanges ? "yellow" : "green";
  const statusText = hasErrors ? "Erros encontrados" : hasChanges ? "Alterações pendentes" : "Tudo salvo";

  if (contentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-ecko-red/20 border-t-ecko-red mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-ecko-red/50 animate-ping"></div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold">Carregando configurações</p>
            <p className="text-gray-400 text-sm">Preparando a interface...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-ecko-red/10 via-black to-ecko-red/10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-ecko-red/20 rounded-xl">
                  <Star className="w-6 h-6 text-ecko-red" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">
                    Configurações do Hero
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Configure a seção principal da landing page
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  statusColor === 'red' ? 'bg-red-500' :
                  statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                } animate-pulse`}></div>
                <span className={`text-sm font-medium ${
                  statusColor === 'red' ? 'text-red-400' :
                  statusColor === 'yellow' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {statusText}
                </span>
              </div>

              {/* Auto-save indicator */}
              {autoSaving && (
                <Badge variant="outline" className="text-blue-400 border-blue-400 animate-pulse">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Auto-salvando...
                </Badge>
              )}

              {/* Last saved */}
              {lastSaved && (
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  <Clock className="w-3 h-3 mr-1" />
                  Salvo {lastSaved.toLocaleTimeString()}
                </Badge>
              )}

              <Badge variant="outline" className="text-green-400 border-green-400">
                <FileText className="w-3 h-3 mr-1" />
                JSON
              </Badge>
              
              <Button
                onClick={() => setPreviewMode(!previewMode)}
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200"
              >
                {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {previewMode ? 'Ocultar' : 'Preview'}
              </Button>
              
              <Button
                onClick={copyConfig}
                variant="outline"
                className="border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white transition-all duration-200"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Config
              </Button>
              
              <Button
                onClick={resetSettings}
                variant="outline"
                disabled={!hasChanges}
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
              
              <Button
                onClick={saveSettings}
                disabled={saving || !hasChanges || hasErrors}
                className="bg-gradient-to-r from-ecko-red to-ecko-red-dark hover:from-ecko-red-dark hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[120px]"
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

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Preview Section */}
        <div className={`transition-all duration-500 overflow-hidden ${
          previewMode ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-ecko-red" />
                Preview em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="relative h-96 rounded-xl overflow-hidden flex items-center justify-center shadow-inner"
                style={{ 
                  backgroundColor: settings.background_color,
                  backgroundImage: settings.background_image ? `url(${settings.background_image})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Overlays */}
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
                
                {/* Content */}
                <div className="relative text-center px-6 max-w-4xl space-y-4">
                  {/* Logo Preview */}
                  {settings.logo_url && (
                    <div className="mb-6 transition-all duration-300 hover:scale-105">
                      <img 
                        src={settings.logo_url} 
                        alt="Logo" 
                        className="h-16 mx-auto object-contain filter drop-shadow-lg"
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
                      className="text-lg opacity-90 transition-all duration-300"
                      style={{ color: settings.text_color }}
                    >
                      {renderTextWithColorTokens(settings.subtitle)}
                    </p>
                  )}
                  
                  {/* Title */}
                  <h1 
                    className="text-4xl font-black leading-tight transition-all duration-300"
                    style={{ color: settings.text_color }}
                  >
                    {renderTextWithColorTokens(settings.title)}
                  </h1>
                  
                  {/* Description */}
                  {settings.description && (
                    <p 
                      className="text-lg opacity-90 max-w-2xl mx-auto transition-all duration-300"
                      style={{ color: settings.text_color }}
                    >
                      {renderTextWithColorTokens(settings.description)}
                    </p>
                  )}
                  
                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    {settings.cta_text && (
                      <button 
                        className="px-8 py-3 font-bold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Textos */}
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Type className="w-5 h-5 mr-2 text-ecko-red" />
                Textos do Hero
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Título Principal *
                </label>
                <Textarea
                  value={settings.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Digite o título principal..."
                  className={`h-20 bg-gray-800/80 border text-white placeholder-gray-500 focus:border-ecko-red focus:ring-ecko-red/20 transition-all duration-200 ${
                    validation.title ? 'border-red-500 focus:border-red-500' : 'border-gray-600'
                  }`}
                />
                {validation.title && (
                  <p className="text-red-400 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validation.title}
                  </p>
                )}
                <p className="text-xs text-gray-500 flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Use [texto] para destacar em vermelho
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Subtítulo *
                </label>
                <Input
                  value={settings.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="Digite o subtítulo..."
                  className={`bg-gray-800/80 border text-white placeholder-gray-500 focus:border-ecko-red focus:ring-ecko-red/20 transition-all duration-200 ${
                    validation.subtitle ? 'border-red-500 focus:border-red-500' : 'border-gray-600'
                  }`}
                />
                {validation.subtitle && (
                  <p className="text-red-400 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validation.subtitle}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Descrição
                </label>
                <Textarea
                  value={settings.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Digite a descrição..."
                  className="h-24 bg-gray-800/80 border-gray-600 text-white placeholder-gray-500 focus:border-ecko-red focus:ring-ecko-red/20 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    CTA Principal *
                  </label>
                  <Input
                    value={settings.cta_text}
                    onChange={(e) => updateField('cta_text', e.target.value)}
                    placeholder="Ex: Quero ser Revendedor"
                    className={`bg-gray-800/80 border text-white placeholder-gray-500 focus:border-ecko-red focus:ring-ecko-red/20 transition-all duration-200 ${
                      validation.cta_text ? 'border-red-500 focus:border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {validation.cta_text && (
                    <p className="text-red-400 text-xs flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {validation.cta_text}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    CTA Secundário
                  </label>
                  <Input
                    value={settings.cta_secondary_text}
                    onChange={(e) => updateField('cta_secondary_text', e.target.value)}
                    placeholder="Ex: Saiba Mais"
                    className="bg-gray-800/80 border-gray-600 text-white placeholder-gray-500 focus:border-ecko-red focus:ring-ecko-red/20 transition-all duration-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual e Cores */}
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Palette className="w-5 h-5 mr-2 text-ecko-red" />
                Visual e Cores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateField('enabled', !settings.enabled)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                      settings.enabled 
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/25' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Logo URL
                </label>
                <Input
                  value={settings.logo_url}
                  onChange={(e) => updateField('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className={`bg-gray-800/80 border text-white placeholder-gray-500 focus:border-ecko-red focus:ring-ecko-red/20 transition-all duration-200 ${
                    validation.logo_url ? 'border-red-500 focus:border-red-500' : 'border-gray-600'
                  }`}
                />
                {validation.logo_url && (
                  <p className="text-red-400 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validation.logo_url}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Imagem de Background
                </label>
                <Input
                  value={settings.background_image}
                  onChange={(e) => updateField('background_image', e.target.value)}
                  placeholder="https://example.com/background.jpg"
                  className={`bg-gray-800/80 border text-white placeholder-gray-500 focus:border-ecko-red focus:ring-ecko-red/20 transition-all duration-200 ${
                    validation.background_image ? 'border-red-500 focus:border-red-500' : 'border-gray-600'
                  }`}
                />
                {validation.background_image && (
                  <p className="text-red-400 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validation.background_image}
                  </p>
                )}
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
        <div className="flex justify-between items-center pt-4">
          <div>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200"
              onClick={() => window.open('/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Landing Page
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <div className="flex items-center text-yellow-400 text-sm">
                <Zap className="w-4 h-4 mr-1 animate-pulse" />
                Auto-save em 3s
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
