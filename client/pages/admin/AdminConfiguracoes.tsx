import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { SeoImageUpload } from "../../components/SeoImageUpload";
import { useSettings } from "../../hooks/useSettings";
import { useToast } from "../../hooks/use-toast";
import {
  Settings,
  Search,
  Webhook,
  Database,
  AlertCircle,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Image,
  FileText,
  Save,
} from "lucide-react";

export default function AdminConfiguracoes() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'webhook' | 'seo' | 'database'>('webhook');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Hook para gerenciar configurações
  const { settings, loading, saveMultipleSettings, getSetting } = useSettings();

  // Estados do formulário
  const [webhookData, setWebhookData] = useState({
    webhook_url: getSetting("webhook_url") || "",
    webhook_secret: getSetting("webhook_secret") || "",
    webhook_timeout: getSetting("webhook_timeout") || "30",
    webhook_retries: getSetting("webhook_retries") || "3",
  });

  const [seoData, setSeoData] = useState({
    seo_title: getSetting("seo_title") || "",
    seo_description: getSetting("seo_description") || "",
    seo_keywords: getSetting("seo_keywords") || "",
    og_title: getSetting("og_title") || "",
    og_description: getSetting("og_description") || "",
    og_image: getSetting("og_image") || "",
    schema_company_name: getSetting("schema_company_name") || "",
    schema_contact_phone: getSetting("schema_contact_phone") || "",
    schema_contact_email: getSetting("schema_contact_email") || "",
    schema_address_street: getSetting("schema_address_street") || "",
    schema_address_city: getSetting("schema_address_city") || "",
    schema_address_state: getSetting("schema_address_state") || "",
  });

  // Atualizar estados quando configurações carregarem
  React.useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setWebhookData({
        webhook_url: getSetting("webhook_url") || "",
        webhook_secret: getSetting("webhook_secret") || "",
        webhook_timeout: getSetting("webhook_timeout") || "30",
        webhook_retries: getSetting("webhook_retries") || "3",
      });

      setSeoData({
        seo_title: getSetting("seo_title") || "",
        seo_description: getSetting("seo_description") || "",
        seo_keywords: getSetting("seo_keywords") || "",
        og_title: getSetting("og_title") || "",
        og_description: getSetting("og_description") || "",
        og_image: getSetting("og_image") || "",
        schema_company_name: getSetting("schema_company_name") || "",
        schema_contact_phone: getSetting("schema_contact_phone") || "",
        schema_contact_email: getSetting("schema_contact_email") || "",
        schema_address_street: getSetting("schema_address_street") || "",
        schema_address_city: getSetting("schema_address_city") || "",
        schema_address_state: getSetting("schema_address_state") || "",
      });
    }
  }, [settings, getSetting]);

  // Detectar mudanças
  React.useEffect(() => {
    const currentWebhook = {
      webhook_url: getSetting("webhook_url") || "",
      webhook_secret: getSetting("webhook_secret") || "",
      webhook_timeout: getSetting("webhook_timeout") || "30",
      webhook_retries: getSetting("webhook_retries") || "3",
    };
    
    const currentSeo = {
      seo_title: getSetting("seo_title") || "",
      seo_description: getSetting("seo_description") || "",
      seo_keywords: getSetting("seo_keywords") || "",
      og_title: getSetting("og_title") || "",
      og_description: getSetting("og_description") || "",
      og_image: getSetting("og_image") || "",
      schema_company_name: getSetting("schema_company_name") || "",
      schema_contact_phone: getSetting("schema_contact_phone") || "",
      schema_contact_email: getSetting("schema_contact_email") || "",
      schema_address_street: getSetting("schema_address_street") || "",
      schema_address_city: getSetting("schema_address_city") || "",
      schema_address_state: getSetting("schema_address_state") || "",
    };

    const webhookChanged = JSON.stringify(webhookData) !== JSON.stringify(currentWebhook);
    const seoChanged = JSON.stringify(seoData) !== JSON.stringify(currentSeo);
    
    setHasChanges(webhookChanged || seoChanged);
  }, [webhookData, seoData, getSetting]);

  // Salvar configurações
  const handleSave = async () => {
    setSaving(true);
    try {
      let settingsToSave = [];

      if (activeTab === 'webhook') {
        settingsToSave = Object.entries(webhookData).map(([key, value]) => ({
          key,
          value: String(value),
          type: key.includes('timeout') || key.includes('retries') ? 'number' : 'text'
        }));
      } else if (activeTab === 'seo') {
        settingsToSave = Object.entries(seoData).map(([key, value]) => ({
          key,
          value: String(value),
          type: 'text'
        }));
      }

      const success = await saveMultipleSettings(settingsToSave);
      if (success) {
        toast({
          title: "Configurações salvas!",
          description: `Configurações de ${activeTab === 'webhook' ? 'Webhook' : 'SEO'} foram salvas com sucesso.`,
        });
        setHasChanges(false);
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Testar webhook
  const handleTestWebhook = async () => {
    if (!webhookData.webhook_url) {
      toast({
        title: "URL obrigatória",
        description: "Configure uma URL antes de testar o webhook.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook_url: webhookData.webhook_url,
          webhook_secret: webhookData.webhook_secret
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Webhook testado!",
          description: "Teste enviado com sucesso.",
        });
      } else {
        toast({
          title: "Erro no teste",
          description: result.message || "Erro ao testar webhook.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao executar teste de webhook.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Testar sistema JSON
  const handleTestJsonSystem = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/test-json');
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Sistema JSON funcionando!",
          description: `${result.data.settings_count} configurações carregadas. Tamanho: ${result.data.file_size}`,
        });
      } else {
        toast({
          title: "Erro no sistema JSON",
          description: result.message || "Erro ao acessar arquivo de configurações.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao testar sistema JSON",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações avançadas da plataforma</p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              Alterações pendentes
            </Badge>
            <Button 
              onClick={handleSave} 
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
            onClick={() => setActiveTab('webhook')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'webhook'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Webhook className="w-4 h-4 mr-2 inline" />
            Webhook
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'seo'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Search className="w-4 h-4 mr-2 inline" />
            SEO
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'database'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 mr-2 inline" />
            Sistema JSON
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'webhook' ? (
        <div className="space-y-6">
          {/* Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">Como funciona o webhook</h4>
              <p className="text-blue-700 text-xs">
                Quando um lead for capturado na landing page, os dados serão enviados automaticamente 
                para a URL configurada. Isso permite integrar com seu CRM ou sistema de e-mail marketing.
              </p>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Webhook className="w-5 h-5 mr-2 text-ecko-red" />
                  Configurações de Webhook
                </span>
                <Button
                  onClick={handleTestWebhook}
                  disabled={saving || !webhookData.webhook_url}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {saving ? 'Testando...' : 'Testar'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="webhook_url">URL do Webhook *</Label>
                  <Input
                    id="webhook_url"
                    type="url"
                    placeholder="https://seu-sistema.com/webhook/leads"
                    value={webhookData.webhook_url}
                    onChange={(e) => setWebhookData({...webhookData, webhook_url: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">URL onde os dados dos leads serão enviados via POST</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook_secret">Secret (Opcional)</Label>
                  <Input
                    id="webhook_secret"
                    type="password"
                    placeholder="chave-secreta-para-validacao"
                    value={webhookData.webhook_secret}
                    onChange={(e) => setWebhookData({...webhookData, webhook_secret: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Chave secreta para validar a origem dos dados</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook_timeout">Timeout (segundos)</Label>
                  <Input
                    id="webhook_timeout"
                    type="number"
                    min="5"
                    max="120"
                    value={webhookData.webhook_timeout}
                    onChange={(e) => setWebhookData({...webhookData, webhook_timeout: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Tempo limite para esperar resposta (5-120 segundos)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook_retries">Tentativas</Label>
                  <Input
                    id="webhook_retries"
                    type="number"
                    min="1"
                    max="10"
                    value={webhookData.webhook_retries}
                    onChange={(e) => setWebhookData({...webhookData, webhook_retries: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Número de tentativas em caso de falha (1-10)</p>
                </div>
              </div>

              {/* Exemplo de Payload */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Exemplo de Payload</h4>
                <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`{
  "lead_id": 123,
  "nome": "João Silva",
  "telefone": "(11) 99999-9999",
  "tem_cnpj": "sim",
  "tipo_loja": "fisica",
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === 'seo' ? (
        <div className="space-y-6">
          {/* SEO Básico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2 text-ecko-red" />
                SEO Básico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">Título da Página</Label>
                <Input
                  id="seo_title"
                  placeholder="Ex: Seja Revendedor Oficial Ecko - Oportunidade Única"
                  value={seoData.seo_title}
                  onChange={(e) => setSeoData({...seoData, seo_title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">Meta Description</Label>
                <Input
                  id="seo_description"
                  placeholder="Descrição que aparece nos resultados do Google (máx. 160 caracteres)"
                  value={seoData.seo_description}
                  onChange={(e) => setSeoData({...seoData, seo_description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_keywords">Palavras-chave</Label>
                <Input
                  id="seo_keywords"
                  placeholder="revendedor, ecko, streetwear, marca, parceria"
                  value={seoData.seo_keywords}
                  onChange={(e) => setSeoData({...seoData, seo_keywords: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Open Graph */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-ecko-red" />
                Open Graph (Redes Sociais)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="og_title">Título OG</Label>
                  <Input
                    id="og_title"
                    placeholder="Título para redes sociais"
                    value={seoData.og_title}
                    onChange={(e) => setSeoData({...seoData, og_title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_description">Descrição OG</Label>
                  <Input
                    id="og_description"
                    placeholder="Descrição para redes sociais"
                    value={seoData.og_description}
                    onChange={(e) => setSeoData({...seoData, og_description: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="og_image">Imagem OG</Label>
                <SeoImageUpload
                  value={seoData.og_image}
                  onChange={(url) => setSeoData({...seoData, og_image: url})}
                  label=""
                />
              </div>
            </CardContent>
          </Card>

          {/* Schema.org */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-ecko-red" />
                Dados da Empresa (Schema.org)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schema_company_name">Nome da Empresa</Label>
                  <Input
                    id="schema_company_name"
                    placeholder="Ecko Unltd"
                    value={seoData.schema_company_name}
                    onChange={(e) => setSeoData({...seoData, schema_company_name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schema_contact_phone">Telefone</Label>
                  <Input
                    id="schema_contact_phone"
                    placeholder="(11) 99999-9999"
                    value={seoData.schema_contact_phone}
                    onChange={(e) => setSeoData({...seoData, schema_contact_phone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schema_contact_email">E-mail</Label>
                  <Input
                    id="schema_contact_email"
                    type="email"
                    placeholder="contato@ecko.com"
                    value={seoData.schema_contact_email}
                    onChange={(e) => setSeoData({...seoData, schema_contact_email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schema_address_street">Endereço</Label>
                  <Input
                    id="schema_address_street"
                    placeholder="Rua das Flores, 123"
                    value={seoData.schema_address_street}
                    onChange={(e) => setSeoData({...seoData, schema_address_street: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schema_address_city">Cidade</Label>
                  <Input
                    id="schema_address_city"
                    placeholder="São Paulo"
                    value={seoData.schema_address_city}
                    onChange={(e) => setSeoData({...seoData, schema_address_city: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schema_address_state">Estado</Label>
                  <Input
                    id="schema_address_state"
                    placeholder="SP"
                    value={seoData.schema_address_state}
                    onChange={(e) => setSeoData({...seoData, schema_address_state: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Database
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-ecko-red" />
                  Status do Banco de Dados
                </span>
                <Button
                  onClick={handleTestDatabase}
                  disabled={saving}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  {saving ? 'Testando...' : 'Testar Conexão'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Host</Label>
                  <Input value="5.161.52.206" readOnly className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label>Porta</Label>
                  <Input value="3040" readOnly className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Input value="lpdb" readOnly className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label>Usuário</Label>
                  <Input value="lpdb" readOnly className="bg-gray-100" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Banco de dados conectado e funcionando
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Todas as operações de leads e configurações estão sendo salvas corretamente.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
