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
import { renderTextWithColorTokens } from "../../utils/colorTokens";
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Footer</h1>
          <p className="text-gray-600">Gerencie as informações e links do rodapé</p>
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
            onClick={() => setActiveTab('social')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'social'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <LinkIcon className="w-4 h-4 mr-2 inline" />
            Redes Sociais
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Eye className="w-4 h-4 mr-2 inline" />
            Preview
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'textos' ? (
        <div className="space-y-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Copyright className="w-5 h-5 mr-2 text-ecko-red" />
                Copyright
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Texto do Copyright
                </label>
                <TokenColorEditor
                  value={settings.copyright || ""}
                  onChange={(value) => updateField("copyright", value)}
                  placeholder="© 2024 Ecko. Todos os direitos reservados."
                  rows={3}
                  label=""
                />
                <p className="text-xs text-gray-500">
                  Use {"{ecko}texto{/ecko}"} para destacar partes do texto com a cor da marca
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === 'social' ? (
        <div className="space-y-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <LinkIcon className="w-5 h-5 mr-2 text-ecko-red" />
                Links das Redes Sociais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Facebook className="w-4 h-4 inline mr-1" />
                  Facebook
                </label>
                <Input
                  value={settings.social_links?.facebook || ""}
                  onChange={(e) => updateSocialLink("facebook", e.target.value)}
                  placeholder="https://facebook.com/eckounltd"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Instagram className="w-4 h-4 inline mr-1" />
                  Instagram
                </label>
                <Input
                  value={settings.social_links?.instagram || ""}
                  onChange={(e) => updateSocialLink("instagram", e.target.value)}
                  placeholder="https://instagram.com/eckounltd"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <LinkIcon className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-blue-900 text-sm">Dica</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Cole os links completos das redes sociais. Deixe em branco os campos que não deseja exibir no rodapé.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Preview
        <div className="space-y-6">
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-ecko-red" />
                Preview do Rodapé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black p-6 rounded-lg">
                <div className="container mx-auto text-center">
                  {/* Social Links */}
                  <div className="flex justify-center space-x-6 mb-6">
                    {settings.social_links?.facebook && (
                      <a
                        href={settings.social_links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-ecko-red transition-colors"
                      >
                        <Facebook className="w-6 h-6" />
                      </a>
                    )}
                    {settings.social_links?.instagram && (
                      <a
                        href={settings.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-ecko-red transition-colors"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                    )}
                  </div>

                  {/* Copyright */}
                  <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto">
                    {settings.copyright || "© 2024 Ecko. Todos os direitos reservados."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
