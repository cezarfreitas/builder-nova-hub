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
  Award,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Type,
  MousePointer,
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

interface BenefitsSettings {
  section_tag: string;
  section_title: string;
  section_subtitle: string;
  section_description: string;
  cta_title: string;
  cta_button_text: string;
}

export default function AdminBenefits() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<BenefitsSettings>(content.benefits);
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
    if (content.benefits) {
      setSettings(content.benefits);
    }
  }, [content.benefits]);

  // Detectar mudanças e validar
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(content.benefits);
    setHasChanges(hasChanges);
    
    // Validação em tempo real
    const newValidation: {[key: string]: string} = {};
    
    if (!settings.section_title.trim()) {
      newValidation.section_title = "Título da seção é obrigatório";
    } else if (settings.section_title.length > 100) {
      newValidation.section_title = "Título muito longo (máx. 100 caracteres)";
    }
    
    if (!settings.section_tag.trim()) {
      newValidation.section_tag = "Tag da seção é obrigatória";
    }
    
    if (!settings.cta_button_text.trim()) {
      newValidation.cta_button_text = "Texto do botão CTA é obrigatório";
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
  }, [settings, content.benefits]);

  // Auto-save silencioso
  const autoSaveSettings = useCallback(async () => {
    if (Object.keys(validation).length > 0) return;
    
    try {
      setAutoSaving(true);
      
      const updatedContent = {
        ...content,
        benefits: settings
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
        benefits: settings
      };

      const result = await saveContent(updatedContent);
      
      if (result.success) {
        toast({
          title: "Benefits atualizado!",
          description: "As configurações foram salvas com sucesso.",
        });
        setHasChanges(false);
        setLastSaved(new Date());
      } else {
        throw new Error('Falha ao salvar');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de benefits:', error);
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
    setSettings(content.benefits);
    setHasChanges(false);
    toast({
      title: "Resetado",
      description: "Configurações resetadas para os valores salvos.",
    });
  };

  // Atualizar campo específico
  const updateField = (field: keyof BenefitsSettings, value: string) => {
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
          <h1 className="text-3xl font-bold text-gray-900">Seção de Benefícios</h1>
          <p className="text-gray-600 mt-2">
            Configure os benefícios e vantagens apresentados na landing page
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
              Preview da Seção Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-b from-black to-gray-900 rounded-lg p-8 text-center">
              {/* Section Tag */}
              {settings.section_tag && (
                <div className="inline-flex items-center bg-ecko-red/20 backdrop-blur-sm border border-ecko-red/30 rounded-full px-6 py-3 mb-6">
                  <span className="text-ecko-red font-bold uppercase tracking-wider text-sm">
                    {renderTextWithColorTokens(settings.section_tag)}
                  </span>
                </div>
              )}
              
              {/* Title */}
              {settings.section_title && (
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight leading-tight">
                  {renderTextWithColorTokens(settings.section_title)}
                  {settings.section_subtitle && (
                    <span className="block text-xl md:text-2xl text-gray-300 mt-2 font-medium normal-case tracking-normal">
                      {renderTextWithColorTokens(settings.section_subtitle)}
                    </span>
                  )}
                </h2>
              )}
              
              {/* Description */}
              {settings.section_description && (
                <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed mb-8">
                  {renderTextWithColorTokens(settings.section_description)}
                </p>
              )}
              
              {/* Benefits Cards Placeholder */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-4 h-32 flex items-center justify-center">
                    <Award className="w-8 h-8 text-ecko-red" />
                  </div>
                ))}
              </div>
              
              {/* CTA */}
              <div className="bg-gradient-to-r from-ecko-red/10 to-ecko-red-dark/10 rounded-2xl p-6 border border-ecko-red/20">
                {settings.cta_title && (
                  <h3 className="text-lg font-bold text-white mb-4">
                    {renderTextWithColorTokens(settings.cta_title)}
                  </h3>
                )}
                {settings.cta_button_text && (
                  <button className="bg-gradient-to-r from-ecko-red to-ecko-red-dark text-white px-8 py-3 font-bold rounded-lg">
                    {renderTextWithColorTokens(settings.cta_button_text)}
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Textos da Seção */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Type className="w-5 h-5 mr-2 text-ecko-red" />
              Textos da Seção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tag da Seção *
              </label>
              <TokenColorEditor
                value={settings.section_tag}
                onChange={(value) => updateField('section_tag', value)}
                placeholder="Ex: Por que escolher a Ecko?"
                rows={2}
                label=""
                className={validation.section_tag ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {validation.section_tag && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validation.section_tag}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Título Principal *
              </label>
              <TokenColorEditor
                value={settings.section_title}
                onChange={(value) => updateField('section_title', value)}
                placeholder="Ex: VANTAGENS [EXCLUSIVAS]"
                rows={2}
                label=""
                className={validation.section_title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {validation.section_title && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validation.section_title}
                </p>
              )}
              <p className="text-gray-500 text-sm flex items-center">
                <Info className="w-4 h-4 mr-1" />
                Use tokens de cor como {'{ecko}texto{/ecko}'} para destacar
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Subtítulo
              </label>
              <TokenColorEditor
                value={settings.section_subtitle}
                onChange={(value) => updateField('section_subtitle', value)}
                placeholder="Ex: para nossos parceiros"
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
                onChange={(value) => updateField('section_description', value)}
                placeholder="Descreva os benefícios únicos da marca..."
                rows={4}
                label=""
              />
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <MousePointer className="w-5 h-5 mr-2 text-ecko-red" />
              Call to Action
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Título do CTA
              </label>
              <TokenColorEditor
                value={settings.cta_title}
                onChange={(value) => updateField('cta_title', value)}
                placeholder="Ex: Junte-se a milhares de parceiros..."
                rows={3}
                label=""
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Texto do Botão *
              </label>
              <TokenColorEditor
                value={settings.cta_button_text}
                onChange={(value) => updateField('cta_button_text', value)}
                placeholder="Ex: QUERO FAZER PARTE AGORA"
                rows={2}
                label=""
                className={validation.cta_button_text ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {validation.cta_button_text && (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validation.cta_button_text}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">Informação</h4>
              </div>
              <p className="text-sm text-blue-700">
                Esta seção gerencia apenas os textos. Os benefícios individuais (cards) são fixos no código e incluem: Marca Internacional, Pronta Entrega, Suporte ao Lojista e Totalmente Online.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
