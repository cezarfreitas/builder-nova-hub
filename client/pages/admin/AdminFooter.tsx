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
import { useToast } from "../../hooks/use-toast";
import { useContent } from "../../hooks/useContent";
import { TokenColorEditor } from "../../components/TokenColorEditor";
import {
  Save,
  Copyright,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
  Facebook,
  Instagram,
  Type,
  Eye,
} from "lucide-react";

interface FooterSettings {
  copyright: string;
  social_links: {
    facebook: string;
    instagram: string;
  };
}

export default function AdminFooter() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<FooterSettings>(content.footer);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"textos" | "social" | "preview">("textos");
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Sincronizar com o conteúdo JSON quando carregado
  useEffect(() => {
    if (content.footer) {
      setSettings(content.footer);
    }
  }, [content.footer]);

  // Detectar mudanças
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(content.footer);
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
          title: "Footer atualizado!",
          description: "As configurações foram salvas com sucesso.",
        });
        setHasChanges(false);
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar footer:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Atualizar campo específico
  const updateField = (field: keyof FooterSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Atualizar campo de link social
  const updateSocialLink = (platform: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  };

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Carregando configurações do footer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Footer</h1>
        <p className="text-gray-600">Configure o rodapé da página</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Copyright className="w-5 h-5 mr-2" />
            Configurações do Footer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copyright
            </label>
            <TokenColorEditor
              value={settings.copyright || ""}
              onChange={(value) => handleInputChange("copyright", value)}
              placeholder="© 2024 Ecko. Todos os direitos reservados."
            />
            <p className="text-xs text-gray-500 mt-1">
              Use [ecko-red] para aplicar a cor vermelha da marca
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <LinkIcon className="w-5 h-5 mr-2" />
              Links Sociais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Facebook className="w-4 h-4 inline mr-1" />
                  Facebook
                </label>
                <Input
                  value={settings.social_links?.facebook || ""}
                  onChange={(e) => handleInputChange("social_links.facebook", e.target.value)}
                  placeholder="https://facebook.com/eckounltd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Instagram className="w-4 h-4 inline mr-1" />
                  Instagram
                </label>
                <Input
                  value={settings.social_links?.instagram || ""}
                  onChange={(e) => handleInputChange("social_links.instagram", e.target.value)}
                  placeholder="https://instagram.com/eckounltd"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="bg-black p-6 rounded-lg">
              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  {settings.copyright || "© 2024 Ecko. Todos os direitos reservados."}
                </p>
                <div className="flex justify-center space-x-4 mt-4">
                  {settings.social_links?.facebook && (
                    <a href="#" className="text-gray-400 hover:text-ecko-red">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {settings.social_links?.instagram && (
                    <a href="#" className="text-gray-400 hover:text-ecko-red">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de salvar */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
      )}
    </div>
  );
}
