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
  const [activeTab, setActiveTab] = useState<"textos" | "historia" | "estatisticas" | "cta">("textos");
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
          <p className="text-gray-600">Gerencie o conteúdo da seção sobre a história da marca</p>
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
            onClick={() => setActiveTab('historia')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'historia'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <History className="w-4 h-4 mr-2 inline" />
            História
          </button>
          <button
            onClick={() => setActiveTab('estatisticas')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'estatisticas'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2 inline" />
            Estatísticas
          </button>
          <button
            onClick={() => setActiveTab('cta')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cta'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Target className="w-4 h-4 mr-2 inline" />
            CTA
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'textos' ? (
        <div className="space-y-6">
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
                  onChange={(value) => updateField("section_description", value)}
                  placeholder="Conheça a trajetória de uma das marcas..."
                  rows={3}
                  label=""
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === 'historia' ? (
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
      ) : activeTab === 'estatisticas' ? (
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
                      onChange={(value) => updateStat(stat.id, "description", value)}
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
                <p className="text-sm">Clique em "Adicionar Estatística" para começar</p>
              </div>
            )}
          </div>
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
