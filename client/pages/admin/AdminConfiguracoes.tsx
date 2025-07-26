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
  BarChart3,
  Target,
  Zap,
  Upload,
  Link,
  Twitter,
  Smartphone,
} from "lucide-react";

export default function AdminConfiguracoes() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'webhook' | 'seo' | 'integracoes' | 'database'>('webhook');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Hook para gerenciar configurações
  const { settings, loading, error, saveMultipleSettings, getSetting } = useSettings();

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
    seo_canonical_url: getSetting("seo_canonical_url") || "",
    favicon_url: getSetting("favicon_url") || "",
    apple_icon_url: getSetting("apple_icon_url") || "",
    robots_txt: getSetting("robots_txt") || `User-agent: *\nDisallow: /admin\nAllow: /\n\nSitemap: ${window.location.origin}/sitemap.xml`,
    og_title: getSetting("og_title") || "",
    og_description: getSetting("og_description") || "",
    og_image: getSetting("og_image") || "",
    og_url: getSetting("og_url") || "",
    og_type: getSetting("og_type") || "website",
    twitter_card: getSetting("twitter_card") || "summary_large_image",
    twitter_title: getSetting("twitter_title") || "",
    twitter_description: getSetting("twitter_description") || "",
    twitter_image: getSetting("twitter_image") || "",
    schema_company_name: getSetting("schema_company_name") || "",
    schema_contact_phone: getSetting("schema_contact_phone") || "",
    schema_contact_email: getSetting("schema_contact_email") || "",
    schema_address_street: getSetting("schema_address_street") || "",
    schema_address_city: getSetting("schema_address_city") || "",
    schema_address_state: getSetting("schema_address_state") || "",
  });

  const [integracoesData, setIntegracoesData] = useState({
    ga4_measurement_id: getSetting("ga4_measurement_id") || "",
    ga4_api_secret: getSetting("ga4_api_secret") || "",
    ga4_conversion_name: getSetting("ga4_conversion_name") || "form_submit",
    meta_pixel_id: getSetting("meta_pixel_id") || "",
    meta_access_token: getSetting("meta_access_token") || "",
    meta_conversion_name: getSetting("meta_conversion_name") || "Lead",
    custom_conversion_enabled: getSetting("custom_conversion_enabled") || "false",
    custom_conversion_event: getSetting("custom_conversion_event") || "lead_captured",
    custom_conversion_value: getSetting("custom_conversion_value") || "1",
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
        seo_canonical_url: getSetting("seo_canonical_url") || "",
        favicon_url: getSetting("favicon_url") || "",
        apple_icon_url: getSetting("apple_icon_url") || "",
        robots_txt: getSetting("robots_txt") || `User-agent: *\nDisallow: /admin\nAllow: /\n\nSitemap: ${window.location.origin}/sitemap.xml`,
        og_title: getSetting("og_title") || "",
        og_description: getSetting("og_description") || "",
        og_image: getSetting("og_image") || "",
        og_url: getSetting("og_url") || "",
        og_type: getSetting("og_type") || "website",
        twitter_card: getSetting("twitter_card") || "summary_large_image",
        twitter_title: getSetting("twitter_title") || "",
        twitter_description: getSetting("twitter_description") || "",
        twitter_image: getSetting("twitter_image") || "",
        schema_company_name: getSetting("schema_company_name") || "",
        schema_contact_phone: getSetting("schema_contact_phone") || "",
        schema_contact_email: getSetting("schema_contact_email") || "",
        schema_address_street: getSetting("schema_address_street") || "",
        schema_address_city: getSetting("schema_address_city") || "",
        schema_address_state: getSetting("schema_address_state") || "",
      });

      setIntegracoesData({
        ga4_measurement_id: getSetting("ga4_measurement_id") || "",
        ga4_api_secret: getSetting("ga4_api_secret") || "",
        ga4_conversion_name: getSetting("ga4_conversion_name") || "form_submit",
        meta_pixel_id: getSetting("meta_pixel_id") || "",
        meta_access_token: getSetting("meta_access_token") || "",
        meta_conversion_name: getSetting("meta_conversion_name") || "Lead",
        custom_conversion_enabled: getSetting("custom_conversion_enabled") || "false",
        custom_conversion_event: getSetting("custom_conversion_event") || "lead_captured",
        custom_conversion_value: getSetting("custom_conversion_value") || "1",
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
      seo_canonical_url: getSetting("seo_canonical_url") || "",
      favicon_url: getSetting("favicon_url") || "",
      apple_icon_url: getSetting("apple_icon_url") || "",
      robots_txt: getSetting("robots_txt") || `User-agent: *\nDisallow: /admin\nAllow: /\n\nSitemap: ${window.location.origin}/sitemap.xml`,
      og_title: getSetting("og_title") || "",
      og_description: getSetting("og_description") || "",
      og_image: getSetting("og_image") || "",
      og_url: getSetting("og_url") || "",
      og_type: getSetting("og_type") || "website",
      twitter_card: getSetting("twitter_card") || "summary_large_image",
      twitter_title: getSetting("twitter_title") || "",
      twitter_description: getSetting("twitter_description") || "",
      twitter_image: getSetting("twitter_image") || "",
      schema_company_name: getSetting("schema_company_name") || "",
      schema_contact_phone: getSetting("schema_contact_phone") || "",
      schema_contact_email: getSetting("schema_contact_email") || "",
      schema_address_street: getSetting("schema_address_street") || "",
      schema_address_city: getSetting("schema_address_city") || "",
      schema_address_state: getSetting("schema_address_state") || "",
    };

    const currentIntegracoes = {
      ga4_measurement_id: getSetting("ga4_measurement_id") || "",
      ga4_api_secret: getSetting("ga4_api_secret") || "",
      ga4_conversion_name: getSetting("ga4_conversion_name") || "form_submit",
      meta_pixel_id: getSetting("meta_pixel_id") || "",
      meta_access_token: getSetting("meta_access_token") || "",
      meta_conversion_name: getSetting("meta_conversion_name") || "Lead",
      custom_conversion_enabled: getSetting("custom_conversion_enabled") || "false",
      custom_conversion_event: getSetting("custom_conversion_event") || "lead_captured",
      custom_conversion_value: getSetting("custom_conversion_value") || "1",
    };

    const webhookChanged = JSON.stringify(webhookData) !== JSON.stringify(currentWebhook);
    const seoChanged = JSON.stringify(seoData) !== JSON.stringify(currentSeo);
    const integracoesChanged = JSON.stringify(integracoesData) !== JSON.stringify(currentIntegracoes);

    setHasChanges(webhookChanged || seoChanged || integracoesChanged);
  }, [webhookData, seoData, integracoesData, getSetting]);

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
      } else if (activeTab === 'integracoes') {
        settingsToSave = Object.entries(integracoesData).map(([key, value]) => ({
          key,
          value: String(value),
          type: key.includes('enabled') ? 'boolean' : 'text'
        }));
      }

      const success = await saveMultipleSettings(settingsToSave);
      if (success) {
        toast({
          title: "Configurações salvas!",
          description: `Configurações de ${
            activeTab === 'webhook' ? 'Webhook' :
            activeTab === 'seo' ? 'SEO' :
            activeTab === 'integracoes' ? 'Integrações' : 'Sistema'
          } foram salvas com sucesso.`,
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

  // Testar integrações
  const handleTestIntegrations = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/integracoes/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();

      if (result.success) {
        const { ga4, metaPixel, customEvent } = result.results;

        let description = 'Resultados dos testes:\n';

        if (ga4.skipped) {
          description += '• GA4: Não configurado\n';
        } else if (ga4.success) {
          description += '• GA4: ✅ Enviado com sucesso\n';
        } else {
          description += `• GA4: ❌ Erro - ${ga4.error}\n`;
        }

        if (metaPixel.skipped) {
          description += '• Meta Pixel: Não configurado\n';
        } else if (metaPixel.success) {
          description += '• Meta Pixel: ✅ Enviado com sucesso\n';
        } else {
          description += `• Meta Pixel: ❌ Erro - ${metaPixel.error}\n`;
        }

        description += `• Evento Personalizado: ${customEvent.enabled ? '✅ Ativado' : '⚪ Desativado'}`;

        toast({
          title: "Teste de integrações concluído!",
          description: description,
        });
      } else {
        toast({
          title: "Erro no teste de integrações",
          description: result.message || "Erro ao testar integrações.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao executar teste de integrações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-ecko-red mx-auto" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900">Erro ao carregar configurações</h3>
          <p className="text-gray-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-ecko-red hover:bg-ecko-red-dark"
          >
            Tentar Novamente
          </Button>
        </div>
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
            onClick={() => setActiveTab('integracoes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'integracoes'
                ? 'border-ecko-red text-ecko-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2 inline" />
            Integrações
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">Título da Página</Label>
                  <Input
                    id="seo_title"
                    placeholder="Ex: Seja Revendedor Oficial Ecko - Oportunidade Única"
                    value={seoData.seo_title}
                    onChange={(e) => setSeoData({...seoData, seo_title: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Máx. 60 caracteres para melhor exibição</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_canonical_url">URL Canônica</Label>
                  <Input
                    id="seo_canonical_url"
                    placeholder="https://seudominio.com"
                    value={seoData.seo_canonical_url}
                    onChange={(e) => setSeoData({...seoData, seo_canonical_url: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">URL principal do site para evitar conteúdo duplicado</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">Meta Description</Label>
                <Input
                  id="seo_description"
                  placeholder="Descrição que aparece nos resultados do Google (máx. 160 caracteres)"
                  value={seoData.seo_description}
                  onChange={(e) => setSeoData({...seoData, seo_description: e.target.value})}
                />
                <p className="text-xs text-gray-500">
                  {seoData.seo_description.length}/160 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_keywords">Palavras-chave</Label>
                <Input
                  id="seo_keywords"
                  placeholder="revendedor, ecko, streetwear, marca, parceria"
                  value={seoData.seo_keywords}
                  onChange={(e) => setSeoData({...seoData, seo_keywords: e.target.value})}
                />
                <p className="text-xs text-gray-500">Separe as palavras-chave por vírgula</p>
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
      ) : activeTab === 'integracoes' ? (
        <div className="space-y-6">
          {/* Card de Instruções */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Como funcionam as integrações?
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Quando um lead se cadastra, os dados são automaticamente enviados para as plataformas configuradas:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <BarChart3 className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="font-medium">Google Analytics 4</span>
                      </div>
                      <p className="text-gray-600">
                        Rastreia conversões em tempo real via Measurement Protocol API
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-purple-200">
                      <div className="flex items-center mb-2">
                        <Target className="w-4 h-4 text-purple-600 mr-2" />
                        <span className="font-medium">Meta Pixel</span>
                      </div>
                      <p className="text-gray-600">
                        Otimiza campanhas do Facebook/Instagram com dados reais de conversão
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-200">
                      <div className="flex items-center mb-2">
                        <Zap className="w-4 h-4 text-green-600 mr-2" />
                        <span className="font-medium">Evento Custom</span>
                      </div>
                      <p className="text-gray-600">
                        Permite integrar com outras ferramentas de automação e analytics
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Analytics 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-ecko-red" />
                Google Analytics 4 (GA4)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">Como configurar o GA4</h4>
                <p className="text-blue-700 text-xs">
                  Configure seu ID de medição do GA4 para rastrear automaticamente conversões quando um lead se cadastrar.
                  O evento será enviado via Measurement Protocol API.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ga4_measurement_id">ID de Medição GA4 *</Label>
                  <Input
                    id="ga4_measurement_id"
                    placeholder="G-XXXXXXXXXX"
                    value={integracoesData.ga4_measurement_id}
                    onChange={(e) => setIntegracoesData({...integracoesData, ga4_measurement_id: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Encontre em GA4 → Admin → Streams de dados</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ga4_api_secret">API Secret *</Label>
                  <Input
                    id="ga4_api_secret"
                    type="password"
                    placeholder="ABC123..."
                    value={integracoesData.ga4_api_secret}
                    onChange={(e) => setIntegracoesData({...integracoesData, ga4_api_secret: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Crie em GA4 → Admin → Measurement Protocol API secrets</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ga4_conversion_name">Nome do Evento</Label>
                  <Input
                    id="ga4_conversion_name"
                    placeholder="form_submit"
                    value={integracoesData.ga4_conversion_name}
                    onChange={(e) => setIntegracoesData({...integracoesData, ga4_conversion_name: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Nome do evento que será enviado ao GA4</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meta Pixel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-ecko-red" />
                Meta Pixel (Facebook/Instagram)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 text-sm mb-2">Como configurar o Meta Pixel</h4>
                <p className="text-purple-700 text-xs">
                  Configure sua API de Conversões do Meta para rastrear leads diretamente do servidor.
                  Isso melhora a precisão do rastreamento e otimiza suas campanhas no Facebook/Instagram.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_pixel_id">Pixel ID *</Label>
                  <Input
                    id="meta_pixel_id"
                    placeholder="123456789012345"
                    value={integracoesData.meta_pixel_id}
                    onChange={(e) => setIntegracoesData({...integracoesData, meta_pixel_id: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Encontre em Events Manager → Data Sources</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_access_token">Access Token *</Label>
                  <Input
                    id="meta_access_token"
                    type="password"
                    placeholder="EAAxxxx..."
                    value={integracoesData.meta_access_token}
                    onChange={(e) => setIntegracoesData({...integracoesData, meta_access_token: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Gere em Events Manager → Settings → Conversions API</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_conversion_name">Nome do Evento</Label>
                  <Input
                    id="meta_conversion_name"
                    placeholder="Lead"
                    value={integracoesData.meta_conversion_name}
                    onChange={(e) => setIntegracoesData({...integracoesData, meta_conversion_name: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Ex: Lead, Purchase, CompleteRegistration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversão Personalizada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-ecko-red" />
                Conversão Personalizada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 text-sm mb-2">Evento JavaScript Personalizado</h4>
                <p className="text-green-700 text-xs">
                  Configure um evento personalizado que será disparado no frontend quando um lead se cadastrar.
                  Útil para integrar com outras ferramentas de analytics ou automação.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom_conversion_enabled">Ativar Conversão</Label>
                  <select
                    id="custom_conversion_enabled"
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                    value={integracoesData.custom_conversion_enabled}
                    onChange={(e) => setIntegracoesData({...integracoesData, custom_conversion_enabled: e.target.value})}
                  >
                    <option value="false">Desativado</option>
                    <option value="true">Ativado</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_conversion_event">Nome do Evento</Label>
                  <Input
                    id="custom_conversion_event"
                    placeholder="lead_captured"
                    value={integracoesData.custom_conversion_event}
                    onChange={(e) => setIntegracoesData({...integracoesData, custom_conversion_event: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Nome do evento customEvent() que será disparado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_conversion_value">Valor da Conversão</Label>
                  <Input
                    id="custom_conversion_value"
                    placeholder="1"
                    value={integracoesData.custom_conversion_value}
                    onChange={(e) => setIntegracoesData({...integracoesData, custom_conversion_value: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Valor numérico enviado com o evento</p>
                </div>
              </div>

              {integracoesData.custom_conversion_enabled === 'true' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Evento que será disparado:</h4>
                  <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`// Evento customizado disparado ao capturar lead
window.dispatchEvent(new CustomEvent('${integracoesData.custom_conversion_event}', {
  detail: {
    value: ${integracoesData.custom_conversion_value},
    timestamp: new Date().toISOString(),
    leadData: {
      nome: "Nome do Lead",
      telefone: "Telefone do Lead",
      // ... outros dados
    }
  }
}));`}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo das Integrações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-ecko-red" />
                  Status das Integrações
                </span>
                <Button
                  onClick={handleTestIntegrations}
                  disabled={saving}
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  {saving ? 'Testando...' : 'Testar Integrações'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${integracoesData.ga4_measurement_id && integracoesData.ga4_api_secret ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className="font-medium text-sm">Google Analytics 4</p>
                    <p className="text-xs text-gray-500">
                      {integracoesData.ga4_measurement_id && integracoesData.ga4_api_secret ? 'Configurado' : 'Não configurado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${integracoesData.meta_pixel_id && integracoesData.meta_access_token ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className="font-medium text-sm">Meta Pixel</p>
                    <p className="text-xs text-gray-500">
                      {integracoesData.meta_pixel_id && integracoesData.meta_access_token ? 'Configurado' : 'Não configurado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${integracoesData.custom_conversion_enabled === 'true' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className="font-medium text-sm">Evento Personalizado</p>
                    <p className="text-xs text-gray-500">
                      {integracoesData.custom_conversion_enabled === 'true' ? 'Ativado' : 'Desativado'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Sistema JSON
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-ecko-red" />
                  Sistema de Armazenamento JSON
                </span>
                <Button
                  onClick={handleTestJsonSystem}
                  disabled={saving}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  {saving ? 'Testando...' : 'Testar Sistema'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Arquivo de Configurações</Label>
                  <Input value="server/data/settings.json" readOnly className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Armazenamento</Label>
                  <Input value="JSON File System" readOnly className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label>Backup</Label>
                  <Input value="Não necessário" readOnly className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label>Persistência</Label>
                  <Input value="Arquivo local" readOnly className="bg-gray-100" />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">
                      Sistema JSON ativo e funcionando
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Todas as configurações são salvas diretamente em arquivo JSON local. Sistema simples, rápido e sem dependências externas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-amber-800">
                      Vantagens do Sistema JSON
                    </p>
                    <div className="text-sm text-amber-700 mt-1">
                      <ul className="list-disc list-inside space-y-1">
                        <li>✅ Não requer banco de dados externo</li>
                        <li>✅ Backup automático por versionamento</li>
                        <li>✅ Performance superior (acesso direto ao arquivo)</li>
                        <li>✅ Simplicidade de configuração</li>
                        <li>✅ Zero dependências externas</li>
                      </ul>
                    </div>
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
