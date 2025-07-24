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
  Phone,
  Mail,
  Clock,
  Copyright,
  Check,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";

interface FooterSettings {
  description: string;
  links_title: string;
  contact_title: string;
  phone: string;
  email: string;
  hours: string;
  copyright: string;
}

export default function AdminFooter() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<FooterSettings>(content.footer);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validation, setValidation] = useState<{ [key: string]: string }>({});
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
            Gerencie todos os textos do rodapé da página
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
          {/* Texto Principal */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Type className="w-5 h-5 mr-2 text-ecko-red" />
                Texto Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descrição da Empresa
                </label>
                <TokenColorEditor
                  value={settings.description}
                  onChange={(value) => updateField("description", value)}
                  placeholder="Ex: Seja parte da maior rede de revendedores..."
                  rows={4}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Copyright
                </label>
                <TokenColorEditor
                  value={settings.copyright}
                  onChange={(value) => updateField("copyright", value)}
                  placeholder="Ex: © 2024 Ecko. Todos os direitos reservados..."
                  rows={2}
                  label=""
                />
              </div>
            </CardContent>
          </Card>

          {/* Títulos das Seções */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <LinkIcon className="w-5 h-5 mr-2 text-ecko-red" />
                Títulos das Seções
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título "Links Úteis"
                </label>
                <Input
                  value={settings.links_title}
                  onChange={(e) => updateField("links_title", e.target.value)}
                  placeholder="Links Úteis"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título "Contato"
                </label>
                <Input
                  value={settings.contact_title}
                  onChange={(e) => updateField("contact_title", e.target.value)}
                  placeholder="Contato"
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-ecko-red" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <Input
                  value={settings.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="0800 123 4567"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  value={settings.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="vendas@ecko.com.br"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Horário de Funcionamento
                </label>
                <Input
                  value={settings.hours}
                  onChange={(e) => updateField("hours", e.target.value)}
                  placeholder="Seg - Sex: 8h às 18h"
                />
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Logo e Descrição */}
                  <div className="md:col-span-2">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-ecko-red rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          ECKO
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed mb-4">
                      {renderTextWithColorTokens(settings.description)}
                    </p>
                    <div className="flex space-x-3">
                      <div className="w-4 h-4 bg-gray-600 rounded"></div>
                      <div className="w-4 h-4 bg-gray-600 rounded"></div>
                    </div>
                  </div>

                  {/* Links Úteis */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">
                      {settings.links_title}
                    </h3>
                    <ul className="space-y-1">
                      <li>
                        <span className="text-gray-400 text-xs">Vantagens</span>
                      </li>
                      <li>
                        <span className="text-gray-400 text-xs">
                          Depoimentos
                        </span>
                      </li>
                      <li>
                        <span className="text-gray-400 text-xs">Galeria</span>
                      </li>
                      <li>
                        <span className="text-gray-400 text-xs">FAQ</span>
                      </li>
                    </ul>
                  </div>

                  {/* Contato */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">
                      {settings.contact_title}
                    </h3>
                    <div className="space-y-1 text-xs">
                      <p className="text-gray-400">{settings.phone}</p>
                      <p className="text-gray-400">{settings.email}</p>
                      <p className="text-gray-400">{settings.hours}</p>
                    </div>
                  </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 pt-4 text-center">
                  <p className="text-gray-500 text-xs">
                    {renderTextWithColorTokens(settings.copyright)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
