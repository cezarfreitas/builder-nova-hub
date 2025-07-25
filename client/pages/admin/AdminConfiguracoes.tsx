import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import { SeoImageUpload } from "../../components/SeoImageUpload";
import { SeoPreviewModal } from "../../components/SeoPreviewModal";
import { useSettings } from "../../hooks/useSettings";
import { useToast } from "../../hooks/use-toast";
import {
  Settings,
  Search,
  Webhook,
  Database,
  Eye,
  Globe,
  Image,
  FileText,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

export default function AdminConfiguracoes() {
  const { toast } = useToast();
  const [activeConfigTab, setActiveConfigTab] = useState("webhook");
  const [showSeoPreview, setShowSeoPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hook para gerenciar configurações
  const { settings, loading, error, saveSetting, saveMultipleSettings, getSetting } = useSettings();

  // Estados do formulário SEO
  const [seoFormData, setSeoFormData] = useState({
    seo_title: getSetting("seo_title") || "",
    seo_description: getSetting("seo_description") || "",
    seo_keywords: getSetting("seo_keywords") || "",
    seo_canonical_url: getSetting("seo_canonical_url") || "",
    seo_robots: getSetting("seo_robots") || "index,follow",
    og_title: getSetting("og_title") || "",
    og_description: getSetting("og_description") || "",
    og_image: getSetting("og_image") || "",
    og_type: getSetting("og_type") || "website",
    og_url: getSetting("og_url") || "",
    og_site_name: getSetting("og_site_name") || "",
    twitter_card: getSetting("twitter_card") || "summary_large_image",
    twitter_title: getSetting("twitter_title") || "",
    twitter_description: getSetting("twitter_description") || "",
    twitter_image: getSetting("twitter_image") || "",
    schema_company_name: getSetting("schema_company_name") || "",
    schema_company_logo: getSetting("schema_company_logo") || "",
    schema_contact_phone: getSetting("schema_contact_phone") || "",
    schema_contact_email: getSetting("schema_contact_email") || "",
    schema_address_street: getSetting("schema_address_street") || "",
    schema_address_city: getSetting("schema_address_city") || "",
    schema_address_state: getSetting("schema_address_state") || "",
    schema_address_postal: getSetting("schema_address_postal") || "",
    schema_address_country: getSetting("schema_address_country") || "",
  });

  // Estados do formulário Webhook
  const [webhookFormData, setWebhookFormData] = useState({
    webhook_url: getSetting("webhook_url") || "",
    webhook_secret: getSetting("webhook_secret") || "",
    webhook_timeout: getSetting("webhook_timeout") || "30",
    webhook_retries: getSetting("webhook_retries") || "3",
  });

  // Atualizar formulários quando settings carregarem
  React.useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setSeoFormData({
        seo_title: getSetting("seo_title") || "",
        seo_description: getSetting("seo_description") || "",
        seo_keywords: getSetting("seo_keywords") || "",
        seo_canonical_url: getSetting("seo_canonical_url") || "",
        seo_robots: getSetting("seo_robots") || "index,follow",
        og_title: getSetting("og_title") || "",
        og_description: getSetting("og_description") || "",
        og_image: getSetting("og_image") || "",
        og_type: getSetting("og_type") || "website",
        og_url: getSetting("og_url") || "",
        og_site_name: getSetting("og_site_name") || "",
        twitter_card: getSetting("twitter_card") || "summary_large_image",
        twitter_title: getSetting("twitter_title") || "",
        twitter_description: getSetting("twitter_description") || "",
        twitter_image: getSetting("twitter_image") || "",
        schema_company_name: getSetting("schema_company_name") || "",
        schema_company_logo: getSetting("schema_company_logo") || "",
        schema_contact_phone: getSetting("schema_contact_phone") || "",
        schema_contact_email: getSetting("schema_contact_email") || "",
        schema_address_street: getSetting("schema_address_street") || "",
        schema_address_city: getSetting("schema_address_city") || "",
        schema_address_state: getSetting("schema_address_state") || "",
        schema_address_postal: getSetting("schema_address_postal") || "",
        schema_address_country: getSetting("schema_address_country") || "",
      });

      setWebhookFormData({
        webhook_url: getSetting("webhook_url") || "",
        webhook_secret: getSetting("webhook_secret") || "",
        webhook_timeout: getSetting("webhook_timeout") || "30",
        webhook_retries: getSetting("webhook_retries") || "3",
      });
    }
  }, [settings, getSetting]);

  // Função para salvar configurações SEO
  const handleSaveSeoSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(seoFormData).map(([key, value]) => ({
        key,
        value: String(value),
        type: 'text'
      }));

      const success = await saveMultipleSettings(settingsToSave);
      if (success) {
        toast({
          title: "✅ Sucesso!",
          description: "Configurações de SEO salvas com sucesso!",
          variant: "success",
        });
      } else {
        toast({
          title: "❌ Erro",
          description: "Erro ao salvar configurações. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Função para salvar configurações Webhook
  const handleSaveWebhookSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(webhookFormData).map(([key, value]) => ({
        key,
        value: String(value),
        type: key.includes('timeout') || key.includes('retries') ? 'number' : 'text'
      }));

      const success = await saveMultipleSettings(settingsToSave);
      if (success) {
        toast({
          title: "✅ Sucesso!",
          description: "Configurações de Webhook salvas com sucesso!",
          variant: "success",
        });
      } else {
        toast({
          title: "❌ Erro",
          description: "Erro ao salvar configurações. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Função para testar webhook
  const handleTestWebhook = async () => {
    if (!webhookFormData.webhook_url) {
      toast({
        title: "⚠️ URL obrigatória",
        description: "Configure uma URL antes de testar o webhook.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhook_url: webhookFormData.webhook_url,
          webhook_secret: webhookFormData.webhook_secret
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Resposta inválida do servidor');
      }

      if (result.success) {
        if (result.webhook_response) {
          const status = result.webhook_response.status;
          const statusText = result.webhook_response.statusText;

          if (status >= 200 && status < 300) {
            toast({
              title: "✅ Webhook testado!",
              description: `Teste enviado com sucesso. Status: ${status} ${statusText}`,
              variant: "success",
            });
          } else {
            toast({
              title: "⚠️ Resposta não OK",
              description: `Webhook retornou status ${status} ${statusText}. Verifique a configuração.`,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "✅ Teste executado!",
            description: "Teste de webhook executado com sucesso.",
            variant: "success",
          });
        }
      } else {
        const errorMessage = result.message || 'Erro desconhecido';

        if (result.error === 'TIMEOUT') {
          toast({
            title: "⏰ Timeout",
            description: "O webhook não respondeu em 30 segundos. Verifique se a URL está funcionando.",
            variant: "destructive",
          });
        } else if (result.error === 'CONNECTION_ERROR') {
          toast({
            title: "❌ Erro de conexão",
            description: "Não foi possível conectar ao webhook. Verifique a URL.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "❌ Erro no teste",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao executar teste de webhook. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Função para testar conexão do banco
  const handleTestDatabaseConnection = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/test-db');
      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Conexão bem-sucedida!",
          description: `Host: ${result.data.config.host} | Porta: ${result.data.config.port} | Banco: ${result.data.config.database} | Tabelas: ${result.data.tables.length}`,
          variant: "success",
        });
      } else {
        toast({
          title: "❌ Falha na conexão",
          description: `${result.message}. Detalhes: ${result.error?.message || 'Erro desconhecido'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao testar conexão com o banco de dados",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">
          Gerencie as configurações avançadas da plataforma, webhooks e SEO.
        </p>
      </div>

      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-ecko-red" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Gerencie as configurações avançadas da plataforma.
          </p>

          {/* Abas de Configuração */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveConfigTab("webhook")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeConfigTab === "webhook"
                    ? "border-ecko-red text-ecko-red"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Webhook className="w-4 h-4 mr-2 inline" />
                Webhook
              </button>
              <button
                onClick={() => setActiveConfigTab("seo")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeConfigTab === "seo"
                    ? "border-ecko-red text-ecko-red"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Search className="w-4 h-4 mr-2 inline" />
                SEO
              </button>
              <button
                onClick={() => setActiveConfigTab("database")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeConfigTab === "database"
                    ? "border-ecko-red text-ecko-red"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Database className="w-4 h-4 mr-2 inline" />
                Banco de Dados
              </button>
            </nav>
          </div>

          {/* Conteúdo das Abas */}
          {activeConfigTab === "webhook" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Configurações de Webhook</h3>
                <Button
                  onClick={handleTestWebhook}
                  disabled={saving || !webhookFormData.webhook_url}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {saving ? 'Testando...' : 'Testar Webhook'}
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Como funciona o webhook</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Quando um lead for capturado na landing page, os dados serão enviados automaticamente para a URL configurada abaixo. 
                      Isso permite integrar com seu CRM, sistema de e-mail marketing ou qualquer outro serviço.
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuração da URL */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-4">URL de Destino</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook_url" className="text-sm font-medium text-gray-700">
                      URL do Webhook *
                    </Label>
                    <Input
                      id="webhook_url"
                      type="url"
                      placeholder="https://seu-sistema.com/webhook/leads"
                      value={webhookFormData.webhook_url}
                      onChange={(e) => setWebhookFormData({...webhookFormData, webhook_url: e.target.value})}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL onde os dados dos leads serão enviados via POST
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="webhook_secret" className="text-sm font-medium text-gray-700">
                      Secret (Opcional)
                    </Label>
                    <Input
                      id="webhook_secret"
                      type="password"
                      placeholder="chave-secreta-para-validacao"
                      value={webhookFormData.webhook_secret}
                      onChange={(e) => setWebhookFormData({...webhookFormData, webhook_secret: e.target.value})}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Chave secreta para validar a origem dos dados (enviada no header X-Signature)
                    </p>
                  </div>
                </div>
              </div>

              {/* Configurações Avançadas */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Configurações Avançadas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="webhook_timeout" className="text-sm font-medium text-gray-700">
                      Timeout (segundos)
                    </Label>
                    <Input
                      id="webhook_timeout"
                      type="number"
                      min="5"
                      max="120"
                      value={webhookFormData.webhook_timeout}
                      onChange={(e) => setWebhookFormData({...webhookFormData, webhook_timeout: e.target.value})}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tempo limite para esperar resposta (5-120 segundos)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="webhook_retries" className="text-sm font-medium text-gray-700">
                      Tentativas
                    </Label>
                    <Input
                      id="webhook_retries"
                      type="number"
                      min="1"
                      max="10"
                      value={webhookFormData.webhook_retries}
                      onChange={(e) => setWebhookFormData({...webhookFormData, webhook_retries: e.target.value})}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Número de tentativas em caso de falha (1-10)
                    </p>
                  </div>
                </div>
              </div>

              {/* Exemplo de Payload */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Exemplo de Payload</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Os dados do lead serão enviados no seguinte formato JSON:
                </p>
                <pre className="bg-gray-800 text-green-400 p-4 rounded text-xs overflow-x-auto">
{`{
  "lead_id": 123,
  "nome": "João Silva",
  "telefone": "(11) 99999-9999",
  "tem_cnpj": "sim",
  "tipo_loja": "fisica",
  "is_duplicate": false,
  "source": "direct",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "revendedores",
  "ip_address": "192.168.1.1",
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
                </pre>
              </div>

              <Button
                onClick={handleSaveWebhookSettings}
                disabled={saving}
                className="bg-ecko-red hover:bg-ecko-red-dark text-white px-8 py-3 text-base font-medium"
              >
                {saving ? 'Salvando...' : 'Salvar Configurações de Webhook'}
              </Button>
            </div>
          )}

          {activeConfigTab === "seo" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Configurações de SEO</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowSeoPreview(true)}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Search className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Otimização para mecanismos de busca</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Configure as meta tags e dados estruturados para melhorar o ranking da página nos resultados de busca.
                    </p>
                  </div>
                </div>
              </div>

              {/* Meta Tags Básicas */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Meta Tags Básicas
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="seo_title" className="text-sm font-medium text-gray-700">
                      Título da Página (Title Tag)
                    </Label>
                    <Input
                      id="seo_title"
                      value={seoFormData.seo_title}
                      onChange={(e) => setSeoFormData({...seoFormData, seo_title: e.target.value})}
                      placeholder="Seja uma Revenda Autorizada da Ecko | Tenha os Melhores Produtos"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo de 60 caracteres recomendado
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="seo_description" className="text-sm font-medium text-gray-700">
                      Meta Description
                    </Label>
                    <Textarea
                      id="seo_description"
                      value={seoFormData.seo_description}
                      onChange={(e) => setSeoFormData({...seoFormData, seo_description: e.target.value})}
                      placeholder="Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja..."
                      className="mt-1"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo de 160 caracteres recomendado
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="seo_keywords" className="text-sm font-medium text-gray-700">
                      Keywords (separadas por vírgula)
                    </Label>
                    <Input
                      id="seo_keywords"
                      value={seoFormData.seo_keywords}
                      onChange={(e) => setSeoFormData({...seoFormData, seo_keywords: e.target.value})}
                      placeholder="revenda autorizada ecko, melhores produtos streetwear, lojista autorizado"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveSeoSettings}
                disabled={saving}
                className="bg-ecko-red hover:bg-ecko-red-dark text-white px-8 py-3 text-base font-medium"
              >
                {saving ? 'Salvando...' : 'Salvar Configurações de SEO'}
              </Button>
            </div>
          )}

          {activeConfigTab === "database" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Status do Banco de Dados</h3>
                <Button
                  onClick={handleTestDatabaseConnection}
                  disabled={saving}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  {saving ? 'Testando...' : 'Testar Conexão'}
                </Button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Informações da Conexão</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Host</Label>
                    <Input
                      value="5.161.52.206"
                      readOnly
                      className="mt-1 bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Porta</Label>
                    <Input
                      value="3040"
                      readOnly
                      className="mt-1 bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Banco</Label>
                    <Input
                      value="lpdb"
                      readOnly
                      className="mt-1 bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Usuário</Label>
                    <Input
                      value="lpdb"
                      readOnly
                      className="mt-1 bg-gray-100"
                    />
                  </div>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Preview SEO */}
      {showSeoPreview && (
        <SeoPreviewModal
          isOpen={showSeoPreview}
          onClose={() => setShowSeoPreview(false)}
          seoData={{
            title: seoFormData.seo_title || "Título da página",
            description: seoFormData.seo_description || "Meta description",
            ogTitle: seoFormData.og_title || seoFormData.seo_title || "Título OG",
            ogDescription: seoFormData.og_description || seoFormData.seo_description || "Descrição OG",
            ogImage: seoFormData.og_image || "URL da imagem",
            twitterTitle: seoFormData.twitter_title || seoFormData.seo_title || "Título Twitter",
            siteName: seoFormData.og_site_name || "Ecko Revendedores",
            canonicalUrl: seoFormData.seo_canonical_url || "https://revendedores.ecko.com.br/"
          }}
        />
      )}
    </div>
  );
}
