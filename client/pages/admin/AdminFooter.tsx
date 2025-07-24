import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../hooks/use-toast";
import { useContent } from "../../hooks/useContent";
import { TokenColorEditor } from "../../components/TokenColorEditor";
import { renderTextWithColorTokens } from "../../utils/colorTokens";
import {
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Copyright,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface FooterSettings {
  copyright: string;
}

export default function AdminFooter() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<FooterSettings>(content.footer);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  // Sincronizar com o conteúdo JSON quando carregado
  useEffect(() => {
    if (content.footer) {
      setSettings(content.footer);
    }
  }, [content.footer]);

  // Detectar mudanças
  useEffect(() => {
    const hasChanges =
      JSON.stringify(settings) !== JSON.stringify(content.footer);
    setHasChanges(hasChanges);
  }, [settings, content.footer]);

  // Salvar configurações
  const saveSettings = async () => {
    try {
      setSaving(true);

      const updatedContent = {
        ...content,
        footer: settings,
      };

      const result = await saveContent(updatedContent);

      if (result.success) {
        toast({
          title: "Rodapé atualizado!",
          description: "As configurações foram salvas com sucesso.",
        });
        setHasChanges(false);
        setLastSaved(new Date());
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar rodapé:", error);
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
    setSettings(content.footer);
    setHasChanges(false);
    toast({
      title: "Resetado",
      description: "Configurações resetadas para os valores salvos.",
    });
  };

  // Atualizar campo específico
  const updateField = (field: keyof FooterSettings, value: string) => {
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
          <h1 className="text-2xl font-bold text-gray-900">Rodapé</h1>
          <p className="text-gray-600">
            Gerencie o texto do copyright do rodapé da página
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
          {/* Copyright */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Copyright className="w-5 h-5 mr-2 text-ecko-red" />
                Copyright
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Texto do Copyright
                </label>
                <TokenColorEditor
                  value={settings.copyright}
                  onChange={(value) => updateField("copyright", value)}
                  placeholder="Ex: © 2024 Ecko. Todos os direitos reservados..."
                  rows={3}
                  label=""
                />
                <p className="text-xs text-gray-500">
                  Use {"{ecko}"} e {"{/ecko}"} para destacar palavras em vermelho
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        {previewMode && (
          <div className="lg:sticky lg:top-6">
            <Card className="bg-black text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-ecko-red" />
                  Preview do Rodapé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  {/* Logo */}
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-ecko-red rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        ECKO
                      </span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex space-x-4">
                    <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs text-white">FB</span>
                    </div>
                    <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs text-white">IG</span>
                    </div>
                  </div>

                  {/* Copyright */}
                  <div className="border-t border-gray-800 pt-4 w-full">
                    <p className="text-gray-500 text-xs">
                      {renderTextWithColorTokens(settings.copyright)}
                    </p>
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
