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
import {
  Save,
  Copyright,
  AlertCircle,
  Loader2,
  Lightbulb,
} from "lucide-react";

interface FooterSettings {
  copyright: string;
}

export default function AdminFooter() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<FooterSettings>(content.footer);
  const [saving, setSaving] = useState(false);
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
          title: "Rodapé atualizado!",
          description: "As configurações foram salvas com sucesso.",
        });
        setHasChanges(false);
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
          <p className="text-gray-600">Gerencie o texto do copyright do rodapé da página</p>
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

      {/* Content */}
      <div className="space-y-6">
        {/* Color Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-blue-900 text-sm">Destaque de Texto</h4>
            </div>
            <p className="text-blue-700 text-xs mb-3">
              Use <code className="bg-blue-100 px-1 rounded text-blue-800">{"{ecko}texto{/ecko}"}</code> em qualquer campo de texto para destacar palavras.
            </p>
            
            {/* Color Examples */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-blue-600 mr-2">Cores:</span>
              {[
                { name: 'ecko', color: '#dc2626' },
                { name: 'blue', color: '#2563eb' },
                { name: 'green', color: '#16a34a' },
                { name: 'orange', color: '#ea580c' },
                { name: 'yellow', color: '#ca8a04' },
                { name: 'white', color: '#ffffff' },
                { name: 'black', color: '#000000' }
              ].map(({ name, color }) => (
                <span
                  key={name}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border"
                  style={{
                    backgroundColor: color === '#ffffff' ? '#f8f9fa' : color,
                    color: ['#ffffff', '#ca8a04'].includes(color) ? '#000000' : '#ffffff',
                    borderColor: color === '#ffffff' ? '#d1d5db' : color
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Copyright */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
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
                value={settings.copyright}
                onChange={(value) => updateField("copyright", value)}
                placeholder="Ex: © 2024 Ecko. Todos os direitos reservados. Seja um revendedor oficial e transforme seu negócio."
                rows={3}
                label=""
              />
            </div>

            {/* Preview Section */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 text-sm mb-3">Preview do Rodapé</h4>
              <div className="bg-black text-white p-6 rounded-lg">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  {/* Logo */}
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-ecko-red rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">ECKO</span>
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
                    <p className="text-gray-300 text-xs">
                      {settings.copyright ? (
                        settings.copyright.split('{ecko}').map((part, index) => {
                          if (index === 0) return part;
                          const [highlighted, ...rest] = part.split('{/ecko}');
                          return (
                            <span key={index}>
                              <span className="text-ecko-red font-bold">{highlighted}</span>
                              {rest.join('{/ecko}')}
                            </span>
                          );
                        })
                      ) : (
                        "© 2024 Ecko. Todos os direitos reservados."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
