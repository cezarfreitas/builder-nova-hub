import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { useToast } from "../../hooks/use-toast";
import { useForm } from "../../hooks/useForm";
import { TokenColorEditor } from "../../components/TokenColorEditor";
import {
  FormInput,
  Save,
  Type,
  AlertCircle,
  Loader2,
  FileText,
  Check,
  Settings,
  Lightbulb
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
  const { form, loading: formLoading, saveForm } = useForm();
  const [settings, setSettings] = useState<FormSettings>(form);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'titulos' | 'campos' | 'mensagens'>('titulos');
  const { toast } = useToast();

  // Sincronizar com os dados do form quando carregados
  useEffect(() => {
    if (form) {
      setSettings(form);
    }
  }, [form]);

  // Detectar mudanças
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(form);
    setHasChanges(hasChanges);
  }, [settings, form]);

  // Salvar configurações
  const saveSettings = async () => {
    try {
      setSaving(true);

      const result = await saveForm(settings);

      if (result.success) {
        toast({
          title: "Formulário atualizado!",
          description: "As configurações foram salvas com sucesso no banco de dados.",
        });
        setHasChanges(false);
      } else {
        throw new Error(result.error || "Falha ao salvar");
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

  if (formLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Formulário</h1>
          <p className="text-gray-600">Gerencie todos os textos do formulário de revendedor</p>
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
            onClick={() => setActiveTab('titulos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'titulos'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Type className="w-4 h-4 mr-2 inline" />
            Títulos
          </button>
          <button
            onClick={() => setActiveTab('campos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'campos'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FormInput className="w-4 h-4 mr-2 inline" />
            Campos
          </button>
          <button
            onClick={() => setActiveTab('mensagens')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mensagens'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 mr-2 inline" />
            Mensagens
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'titulos' ? (
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

          {/* Títulos Principais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Type className="w-5 h-5 mr-2 text-ecko-red" />
                Títulos da Seção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título Principal (Coluna Esquerda)
                </label>
                <TokenColorEditor
                  value={settings.main_title}
                  onChange={(value) => updateField('main_title', value)}
                  placeholder="Ex: SEJA PARCEIRO OFICIAL ECKO E TENHA SUCESSO"
                  rows={3}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descrição Principal (Coluna Esquerda)
                </label>
                <TokenColorEditor
                  value={settings.main_description}
                  onChange={(value) => updateField('main_description', value)}
                  placeholder="Ex: Transforme sua paixão pelo streetwear em um negócio lucrativo"
                  rows={2}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título do Formulário (Coluna Direita)
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
                  Subtítulo do Formulário (Coluna Direita)
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
        </div>
      ) : activeTab === 'campos' ? (
        <div className="space-y-6">
          {/* Labels dos Campos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FormInput className="w-5 h-5 mr-2 text-ecko-red" />
                Labels e Placeholders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    Placeholder CEP
                  </label>
                  <Input
                    value={settings.fields.cep_placeholder}
                    onChange={(e) => updateField('fields.cep_placeholder', e.target.value)}
                    placeholder="00000-000"
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
                    Placeholder Endereço
                  </label>
                  <Input
                    value={settings.fields.endereco_placeholder}
                    onChange={(e) => updateField('fields.endereco_placeholder', e.target.value)}
                    placeholder="Rua, número"
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Placeholder Tipo de Loja
                  </label>
                  <Input
                    value={settings.fields.store_type_placeholder}
                    onChange={(e) => updateField('fields.store_type_placeholder', e.target.value)}
                    placeholder="Selecione o tipo"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões e Opções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-ecko-red" />
                Botões e Opções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Mensagens
        <div className="space-y-6">
          {/* Mensagens de Validação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-ecko-red" />
                Mensagens de Validação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  WhatsApp Inválido
                </label>
                <Input
                  value={settings.validation_messages.whatsapp_invalid}
                  onChange={(e) => updateField('validation_messages.whatsapp_invalid', e.target.value)}
                  placeholder="Número de WhatsApp inválido"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Endereço Incompleto
                </label>
                <Input
                  value={settings.validation_messages.address_incomplete}
                  onChange={(e) => updateField('validation_messages.address_incomplete', e.target.value)}
                  placeholder="Preencha o endereço completo"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  CNPJ Obrigatório
                </label>
                <Input
                  value={settings.validation_messages.cnpj_required}
                  onChange={(e) => updateField('validation_messages.cnpj_required', e.target.value)}
                  placeholder="CNPJ é obrigatório para revendedores"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
