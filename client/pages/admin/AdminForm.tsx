import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { useToast } from "../../hooks/use-toast";
import { useContent } from "../../hooks/useContent";
import { TokenColorEditor } from "../../components/TokenColorEditor";
import { renderTextWithColorTokens } from "../../utils/colorTokens";
import {
  FormInput,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Type,
  Check,
  AlertCircle,
  Loader2,
  FileText
} from "lucide-react";

interface FormSettings {
  main_title: string;
  main_description: string;
  title: string;
  subtitle: string;
  fields: {
    name_label: string;
    name_placeholder: string;
    whatsapp_label: string;
    whatsapp_placeholder: string;
    whatsapp_error: string;
    whatsapp_success: string;
    cep_label: string;
    cep_placeholder: string;
    endereco_label: string;
    endereco_placeholder: string;
    complemento_label: string;
    complemento_placeholder: string;
    bairro_label: string;
    cidade_label: string;
    estado_label: string;
    cnpj_label: string;
    cnpj_yes: string;
    cnpj_no: string;
    cnpj_error: string;
    store_type_label: string;
    store_type_placeholder: string;
  };
  submit_button: string;
  submit_button_loading: string;
  validation_messages: {
    whatsapp_invalid: string;
    address_incomplete: string;
    cnpj_required: string;
  };
}

export default function AdminForm() {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<FormSettings>(content.form);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validation, setValidation] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  // Sincronizar com o conteúdo JSON quando carregado
  useEffect(() => {
    if (content.form) {
      setSettings(content.form);
    }
  }, [content.form]);

  // Detectar mudanças
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(content.form);
    setHasChanges(hasChanges);
  }, [settings, content.form]);

  // Salvar configurações
  const saveSettings = async () => {
    try {
      setSaving(true);

      const updatedContent = {
        ...content,
        form: settings,
      };

      const result = await saveContent(updatedContent);

      if (result.success) {
        toast({
          title: "Formulário atualizado!",
          description: "As configurações foram salvas com sucesso.",
        });
        setHasChanges(false);
        setLastSaved(new Date());
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar formulário:", error);
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
    setSettings(content.form);
    setHasChanges(false);
    toast({
      title: "Resetado",
      description: "Configurações resetadas para os valores salvos.",
    });
  };

  // Atualizar campo específico
  const updateField = (field: string, value: string) => {
    const fieldParts = field.split('.');
    if (fieldParts.length === 1) {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (fieldParts.length === 2) {
      const [section, key] = fieldParts;
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof FormSettings],
          [key]: value
        }
      }));
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Formulário de Cadastro</h1>
          <p className="text-gray-600">Gerencie todos os textos do formulário de revendedor</p>
        </div>
        
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Salvo às {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
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
          {/* Títulos Principais */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Type className="w-5 h-5 mr-2 text-ecko-red" />
                Títulos Principais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título do Formulário
                </label>
                <TokenColorEditor
                  value={settings.title}
                  onChange={(value) => updateField('title', value)}
                  placeholder="Ex: Cadastro de Revendedor"
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subtítulo
                </label>
                <TokenColorEditor
                  value={settings.subtitle}
                  onChange={(value) => updateField('subtitle', value)}
                  placeholder="Ex: Preencha os dados para receber nossa proposta"
                  rows={2}
                  label=""
                />
              </div>
            </CardContent>
          </Card>

          {/* Labels dos Campos */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <FormInput className="w-5 h-5 mr-2 text-ecko-red" />
                Labels dos Campos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Label Nome
                  </label>
                  <Input
                    value={settings.fields.name_label}
                    onChange={(e) => updateField('fields.name_label', e.target.value)}
                    placeholder="Nome Completo"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Label WhatsApp
                  </label>
                  <Input
                    value={settings.fields.whatsapp_label}
                    onChange={(e) => updateField('fields.whatsapp_label', e.target.value)}
                    placeholder="WhatsApp"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Label CEP
                  </label>
                  <Input
                    value={settings.fields.cep_label}
                    onChange={(e) => updateField('fields.cep_label', e.target.value)}
                    placeholder="CEP"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Label Endereço
                  </label>
                  <Input
                    value={settings.fields.endereco_label}
                    onChange={(e) => updateField('fields.endereco_label', e.target.value)}
                    placeholder="Endereço"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Label CNPJ
                  </label>
                  <Input
                    value={settings.fields.cnpj_label}
                    onChange={(e) => updateField('fields.cnpj_label', e.target.value)}
                    placeholder="Tem CNPJ?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Label Tipo de Loja
                  </label>
                  <Input
                    value={settings.fields.store_type_label}
                    onChange={(e) => updateField('fields.store_type_label', e.target.value)}
                    placeholder="Tipo de Loja"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholders */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-ecko-red" />
                Placeholders e Mensagens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Placeholder Nome
                </label>
                <Input
                  value={settings.fields.name_placeholder}
                  onChange={(e) => updateField('fields.name_placeholder', e.target.value)}
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Placeholder WhatsApp
                </label>
                <Input
                  value={settings.fields.whatsapp_placeholder}
                  onChange={(e) => updateField('fields.whatsapp_placeholder', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mensagem de Erro WhatsApp
                </label>
                <Input
                  value={settings.fields.whatsapp_error}
                  onChange={(e) => updateField('fields.whatsapp_error', e.target.value)}
                  placeholder="Digite um número de WhatsApp válido..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mensagem de Sucesso WhatsApp
                </label>
                <Input
                  value={settings.fields.whatsapp_success}
                  onChange={(e) => updateField('fields.whatsapp_success', e.target.value)}
                  placeholder="✅ WhatsApp válido"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Erro CNPJ
                </label>
                <Input
                  value={settings.fields.cnpj_error}
                  onChange={(e) => updateField('fields.cnpj_error', e.target.value)}
                  placeholder="Para ser um revendedor oficial..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Check className="w-5 h-5 mr-2 text-ecko-red" />
                Botões e Ações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Texto do Botão de Envio
                </label>
                <TokenColorEditor
                  value={settings.submit_button}
                  onChange={(value) => updateField('submit_button', value)}
                  placeholder="QUERO SER REVENDEDOR OFICIAL"
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Texto do Botão (Carregando)
                </label>
                <Input
                  value={settings.submit_button_loading}
                  onChange={(e) => updateField('submit_button_loading', e.target.value)}
                  placeholder="Enviando..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Opção CNPJ Sim
                </label>
                <Input
                  value={settings.fields.cnpj_yes}
                  onChange={(e) => updateField('fields.cnpj_yes', e.target.value)}
                  placeholder="Sim"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Opção CNPJ Não
                </label>
                <Input
                  value={settings.fields.cnpj_no}
                  onChange={(e) => updateField('fields.cnpj_no', e.target.value)}
                  placeholder="Não"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        {previewMode && (
          <div className="lg:sticky lg:top-6">
            <Card className="bg-gray-900 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-ecko-red" />
                  Preview do Formulário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Títulos */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {renderTextWithColorTokens(settings.title)}
                  </h2>
                  <p className="text-gray-300">
                    {renderTextWithColorTokens(settings.subtitle)}
                  </p>
                </div>

                {/* Campos de Preview */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {settings.fields.name_label}
                    </label>
                    <div className="h-10 bg-gray-800 border border-gray-700 rounded px-3 flex items-center text-gray-400">
                      {settings.fields.name_placeholder}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {settings.fields.whatsapp_label}
                    </label>
                    <div className="h-10 bg-gray-800 border border-gray-700 rounded px-3 flex items-center text-gray-400">
                      {settings.fields.whatsapp_placeholder}
                    </div>
                    <p className="text-green-400 text-xs mt-1">
                      {settings.fields.whatsapp_success}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {settings.fields.cep_label}
                    </label>
                    <div className="h-10 bg-gray-800 border border-gray-700 rounded px-3 flex items-center text-gray-400">
                      {settings.fields.cep_placeholder}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {settings.fields.cnpj_label}
                    </label>
                    <div className="h-10 bg-gray-800 border border-gray-700 rounded px-3 flex items-center text-gray-400">
                      <span className="mr-4">{settings.fields.cnpj_yes}</span>
                      <span>{settings.fields.cnpj_no}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {settings.fields.store_type_label}
                    </label>
                    <div className="h-10 bg-gray-800 border border-gray-700 rounded px-3 flex items-center text-gray-400">
                      {settings.fields.store_type_placeholder}
                    </div>
                  </div>

                  <button className="w-full bg-ecko-red text-white py-3 rounded font-bold">
                    {renderTextWithColorTokens(settings.submit_button)}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
