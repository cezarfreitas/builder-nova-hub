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
import { useContent } from "../../hooks/useContent";
import { TokenColorEditor } from "../../components/TokenColorEditor";
import { renderTextWithColorTokens } from "../../utils/colorTokens";
import {
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Type,
  BarChart3,
  Target,
  AlertCircle,
  Loader2,
  History,
  Plus,
  Trash2,
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
}

export default function AdminAbout() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<AboutSettings>(content.about);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
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
        setLastSaved(new Date());
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

  // Resetar para valores originais
  const resetSettings = () => {
    setSettings(content.about);
    setHasChanges(false);
    toast({
      title: "Resetado",
      description: "Configurações resetadas para os valores salvos.",
    });
  };

  // Atualizar campo específico
  const updateField = (field: keyof AboutSettings, value: string | any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Adicionar nova estatística
  const addStat = () => {
    const newStat = {
      id: Math.max(...settings.stats.map(s => s.id), 0) + 1,
      number: "0+",
      label: "Nova Estatística",
      description: "Descrição da estatística",
    };
    updateField("stats", [...settings.stats, newStat]);
  };

  // Remover estatística
  const removeStat = (id: number) => {
    updateField("stats", settings.stats.filter(stat => stat.id !== id));
  };

  // Atualizar estatística específica
  const updateStat = (id: number, field: string, value: string) => {
    const updatedStats = settings.stats.map(stat =>
      stat.id === id ? { ...stat, [field]: value } : stat
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
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configurações */}
        <div className="space-y-6">
          {/* Textos do Header */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Type className="w-5 h-5 mr-2 text-ecko-red" />
                Textos do Header
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tag da Seção
                </label>
                <Input
                  value={settings.section_tag}
                  onChange={(e) => updateField("section_tag", e.target.value)}
                  placeholder="Nossa História"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título Principal
                </label>
                <TokenColorEditor
                  value={settings.section_title}
                  onChange={(value) => updateField("section_title", value)}
                  placeholder="SOBRE A {ECKO}"
                  rows={1}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subtítulo
                </label>
                <Input
                  value={settings.section_subtitle}
                  onChange={(e) => updateField("section_subtitle", e.target.value)}
                  placeholder="mais de 20 anos de streetwear"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <Textarea
                  value={settings.section_description}
                  onChange={(e) => updateField("section_description", e.target.value)}
                  placeholder="Conheça a trajetória de uma das marcas..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

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
                  Use quebras de linha duplas (Enter duas vezes) para separar parágrafos
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-ecko-red" />
                  Estatísticas
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addStat}
                  className="text-ecko-red border-ecko-red hover:bg-ecko-red hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.stats.map((stat) => (
                <div key={stat.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
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
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">
                        Número
                      </label>
                      <Input
                        value={stat.number}
                        onChange={(e) => updateStat(stat.id, "number", e.target.value)}
                        placeholder="30+"
                        size="sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600">
                        Label
                      </label>
                      <Input
                        value={stat.label}
                        onChange={(e) => updateStat(stat.id, "label", e.target.value)}
                        placeholder="Anos de História"
                        size="sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Descrição
                    </label>
                    <Textarea
                      value={stat.description}
                      onChange={(e) => updateStat(stat.id, "description", e.target.value)}
                      placeholder="Mais de três décadas construindo..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* CTA */}
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
                  rows={1}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descrição do CTA
                </label>
                <Textarea
                  value={settings.cta_description}
                  onChange={(e) => updateField("cta_description", e.target.value)}
                  placeholder="Torne-se um revendedor oficial..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Texto do Botão
                </label>
                <Input
                  value={settings.cta_button_text}
                  onChange={(e) => updateField("cta_button_text", e.target.value)}
                  placeholder="QUERO SER PARTE DA ECKO"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        {previewMode && (
          <div className="lg:sticky lg:top-6">
            <Card className="bg-gradient-to-b from-gray-50 to-white">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-ecko-red" />
                  Preview da Seção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Header Preview */}
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-ecko-red/10 text-ecko-red text-xs font-semibold rounded-full mb-2">
                    {settings.section_tag}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {renderTextWithColorTokens(settings.section_title)}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {settings.section_subtitle}
                  </p>
                  <p className="text-xs text-gray-600">
                    {settings.section_description}
                  </p>
                </div>

                {/* Content Preview */}
                <div className="space-y-3">
                  {settings.content.split('\n\n').slice(0, 2).map((paragraph, index) => (
                    <p key={index} className="text-xs text-gray-700 leading-relaxed">
                      {renderTextWithColorTokens(paragraph)}
                    </p>
                  ))}
                  {settings.content.split('\n\n').length > 2 && (
                    <p className="text-xs text-gray-500 italic">...</p>
                  )}
                </div>

                {/* Stats Preview */}
                <div className="grid grid-cols-2 gap-2">
                  {settings.stats.slice(0, 4).map((stat) => (
                    <div key={stat.id} className="text-center p-3 bg-white rounded border border-gray-100">
                      <div className="text-lg font-bold text-ecko-red mb-1">
                        {stat.number}
                      </div>
                      <div className="text-xs text-gray-900 font-semibold mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        {stat.description.length > 30 
                          ? stat.description.substring(0, 30) + "..."
                          : stat.description
                        }
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Preview */}
                <div className="text-center bg-black rounded-lg p-4 text-white">
                  <h3 className="text-sm font-bold mb-2">
                    {renderTextWithColorTokens(settings.cta_title)}
                  </h3>
                  <p className="text-xs text-gray-300 mb-3">
                    {settings.cta_description}
                  </p>
                  <div className="bg-ecko-red text-white px-4 py-2 rounded text-xs font-semibold">
                    {settings.cta_button_text}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
