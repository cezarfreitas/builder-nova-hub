import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { useToast } from "../../hooks/use-toast";
import { useContent } from "../../hooks/useContent";
import {
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Settings,
  AlertCircle,
  Loader2,
  List,
} from "lucide-react";

interface SectionOrderSettings {
  enabled_sections: {
    id: string;
    name: string;
    enabled: boolean;
    order: number;
  }[];
}

export default function AdminOrder() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<SectionOrderSettings>(content.section_order);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  // Sincronizar com o conteúdo JSON quando carregado
  useEffect(() => {
    if (content.section_order) {
      setSettings(content.section_order);
    }
  }, [content.section_order]);

  // Detectar mudanças
  useEffect(() => {
    const hasChanges =
      JSON.stringify(settings) !== JSON.stringify(content.section_order);
    setHasChanges(hasChanges);
  }, [settings, content.section_order]);

  // Salvar configurações
  const saveSettings = async () => {
    try {
      setSaving(true);

      const updatedContent = {
        ...content,
        section_order: settings,
      };

      const result = await saveContent(updatedContent);

      if (result.success) {
        toast({
          title: "Ordem das seções atualizada!",
          description: "As configurações foram salvas com sucesso.",
        });
        setHasChanges(false);
        setLastSaved(new Date());
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar ordem das seções:", error);
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
    setSettings(content.section_order);
    setHasChanges(false);
    toast({
      title: "Resetado",
      description: "Configurações resetadas para os valores salvos.",
    });
  };

  // Mover seção para cima
  const moveUp = (index: number) => {
    if (index === 0) return;
    
    const newSections = [...settings.enabled_sections];
    const currentSection = newSections[index];
    const previousSection = newSections[index - 1];
    
    // Trocar as ordens
    [currentSection.order, previousSection.order] = [previousSection.order, currentSection.order];
    
    // Trocar as posições no array
    [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    
    setSettings({
      enabled_sections: newSections
    });
  };

  // Mover seção para baixo
  const moveDown = (index: number) => {
    if (index === settings.enabled_sections.length - 1) return;
    
    const newSections = [...settings.enabled_sections];
    const currentSection = newSections[index];
    const nextSection = newSections[index + 1];
    
    // Trocar as ordens
    [currentSection.order, nextSection.order] = [nextSection.order, currentSection.order];
    
    // Trocar as posições no array
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    
    setSettings({
      enabled_sections: newSections
    });
  };

  // Alternar visibilidade da seção
  const toggleSection = (index: number) => {
    const newSections = [...settings.enabled_sections];
    newSections[index].enabled = !newSections[index].enabled;
    
    setSettings({
      enabled_sections: newSections
    });
  };

  // Obter ícone da seção
  const getSectionIcon = (sectionId: string) => {
    const icons: { [key: string]: string } = {
      hero: "🏠",
      benefits: "⭐",
      testimonials: "💬",
      gallery: "🖼️",
      faq: "❓",
      about: "📚",
      final_cta: "🎯"
    };
    return icons[sectionId] || "📄";
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
          <h1 className="text-2xl font-bold text-gray-900">Ordem das Seções</h1>
          <p className="text-gray-600">
            Gerencie a ordem e visibilidade das seções na landing page
          </p>
        </div>

        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Salvo às {lastSaved.toLocaleTimeString()}
            </span>
          )}

          {hasChanges && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-300"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Alterações pendentes
            </Badge>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Ocultar Preview
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Mostrar Preview
                </>
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={resetSettings}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Resetar
            </Button>

            <Button
              onClick={saveSettings}
              disabled={saving || !hasChanges}
              className="bg-ecko-red hover:bg-ecko-red-dark"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Ordem
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controle de Ordem */}
        <div className="space-y-4">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <List className="w-5 h-5 mr-2 text-ecko-red" />
                Organizar Seções
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings.enabled_sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                    section.enabled 
                      ? 'border-gray-200 bg-white' 
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="text-lg">{getSectionIcon(section.id)}</span>
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900">
                        {section.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Posição: {section.order}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Toggle Visibilidade */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={section.enabled}
                        onCheckedChange={() => toggleSection(index)}
                      />
                      <span className={`text-xs ${section.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                        {section.enabled ? 'Visível' : 'Oculta'}
                      </span>
                    </div>

                    {/* Botões de Movimento */}
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveDown(index)}
                        disabled={index === settings.enabled_sections.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Instruções */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Como usar:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Use os botões ↑ ↓ para reordenar as seções</li>
                    <li>• Use o switch para mostrar/ocultar seções</li>
                    <li>• As mudanças só são aplicadas após salvar</li>
                    <li>• Seções ocultas não aparecem na landing page</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        {previewMode && (
          <div className="lg:sticky lg:top-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-ecko-red" />
                  Preview da Ordem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 mb-4">
                  Ordem das seções na landing page:
                </div>
                
                {settings.enabled_sections
                  .filter(section => section.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-ecko-red text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="text-lg">{getSectionIcon(section.id)}</span>
                        <span className="font-medium text-gray-900">
                          {section.name}
                        </span>
                      </div>
                      
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Ativa
                      </Badge>
                    </div>
                  ))}

                {settings.enabled_sections.filter(s => !s.enabled).length > 0 && (
                  <>
                    <div className="text-sm text-gray-500 mt-6 mb-2">
                      Seções ocultas:
                    </div>
                    {settings.enabled_sections
                      .filter(section => !section.enabled)
                      .map((section) => (
                        <div
                          key={section.id}
                          className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-300"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs">
                              ×
                            </div>
                            <span className="text-lg opacity-50">{getSectionIcon(section.id)}</span>
                            <span className="text-gray-500">
                              {section.name}
                            </span>
                          </div>
                          
                          <Badge variant="outline" className="text-gray-500 border-gray-400">
                            Oculta
                          </Badge>
                        </div>
                      ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
