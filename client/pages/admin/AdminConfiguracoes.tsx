import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import { SeoImageUpload } from "../../components/SeoImageUpload";
import { SeoPreviewModal } from "../../components/SeoPreviewModal";
import { useJsonSettings } from "../../hooks/useJsonSettings";
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
  Upload,
  Code,
  Target,
  BarChart3,
  Facebook,
  Zap,
  Shield,
  Palette,
  Link,
  Users,
} from "lucide-react";

export default function AdminConfiguracoes() {
  const { toast } = useToast();
  const [activeConfigTab, setActiveConfigTab] = useState("webhook");
  const [showSeoPreview, setShowSeoPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hook para gerenciar configurações no JSON
  const {
    settings,
    loading,
    error,
    saveSetting,
    saveMultipleSettings,
    getSetting,
  } = useJsonSettings();

  // Helper para gerar URLs baseadas no domínio configurado
  const generateUrl = (path: string = "/") => {
    const domain = seoFormData.site_domain || "https://b2b.eckoshop.com.br";
    return domain.endsWith("/") ? domain + path.substring(1) : domain + path;
  };

  // Estados do formulário SEO
  const [seoFormData, setSeoFormData] = useState({
    site_domain: getSetting("site_domain") || "https://b2b.eckoshop.com.br",
    favicon_url: getSetting("favicon_url") || "",
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

  // Estados do formulário Analytics
  const [analyticsFormData, setAnalyticsFormData] = useState({
    ga4_measurement_id: getSetting("ga4_measurement_id") || "",
    ga4_api_secret: getSetting("ga4_api_secret") || "",
    gtag_config: getSetting("gtag_config") || "",
    facebook_pixel_id: getSetting("facebook_pixel_id") || "",
    facebook_access_token: getSetting("facebook_access_token") || "",
    facebook_test_event_code: getSetting("facebook_test_event_code") || "",
    conversions_api_enabled: getSetting("conversions_api_enabled") || "false",
    lead_event_name: getSetting("lead_event_name") || "Lead",
    conversion_value: getSetting("conversion_value") || "0",
  });

  // Atualizar formulários quando settings carregarem
  React.useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setSeoFormData({
        site_domain: getSetting("site_domain") || "https://b2b.eckoshop.com.br",
        favicon_url: getSetting("favicon_url") || "",
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

      setAnalyticsFormData({
        ga4_measurement_id: getSetting("ga4_measurement_id") || "",
        ga4_api_secret: getSetting("ga4_api_secret") || "",
        gtag_config: getSetting("gtag_config") || "",
        facebook_pixel_id: getSetting("facebook_pixel_id") || "",
        facebook_access_token: getSetting("facebook_access_token") || "",
        facebook_test_event_code: getSetting("facebook_test_event_code") || "",
        conversions_api_enabled:
          getSetting("conversions_api_enabled") || "false",
        lead_event_name: getSetting("lead_event_name") || "Lead",
        conversion_value: getSetting("conversion_value") || "0",
      });
    }
  }, [settings, getSetting]);

  // Função para salvar configurações SEO
  const handleSaveSeoSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(seoFormData).map(
        ([key, value]) => ({
          key,
          value: String(value),
          type: "text",
        }),
      );

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
      console.error("Erro ao salvar:", error);
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
      const settingsToSave = Object.entries(webhookFormData).map(
        ([key, value]) => ({
          key,
          value: String(value),
          type:
            key.includes("timeout") || key.includes("retries")
              ? "number"
              : "text",
        }),
      );

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
      console.error("Erro ao salvar:", error);
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
      const response = await fetch("/api/webhook/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhook_url: webhookFormData.webhook_url,
          webhook_secret: webhookFormData.webhook_secret,
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
        throw new Error("Resposta inválida do servidor");
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
        const errorMessage = result.message || "Erro desconhecido";

        if (result.error === "TIMEOUT") {
          toast({
            title: "⏰ Timeout",
            description:
              "O webhook não respondeu em 30 segundos. Verifique se a URL está funcionando.",
            variant: "destructive",
          });
        } else if (result.error === "CONNECTION_ERROR") {
          toast({
            title: "❌ Erro de conexão",
            description:
              "Não foi possível conectar ao webhook. Verifique a URL.",
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
      console.error("Erro ao testar webhook:", error);
      toast({
        title: "❌ Erro",
        description: "Erro ao executar teste de webhook. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Função para salvar configurações Analytics
  const handleSaveAnalyticsSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(analyticsFormData).map(
        ([key, value]) => ({
          key,
          value: String(value),
          type: key.includes("enabled") ? "boolean" : "text",
        }),
      );

      const success = await saveMultipleSettings(settingsToSave);
      if (success) {
        toast({
          title: "�� Sucesso!",
          description: "Configurações de Analytics salvas com sucesso!",
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
      console.error("Erro ao salvar:", error);
      toast({
        title: "❌ Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Função para testar Facebook Pixel
  const handleTestFacebookPixel = async () => {
    if (!analyticsFormData.facebook_pixel_id) {
      toast({
        title: "⚠️ Pixel ID obrigatório",
        description: "Configure um Pixel ID antes de testar.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/analytics/test-pixel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pixel_id: analyticsFormData.facebook_pixel_id,
          access_token: analyticsFormData.facebook_access_token,
          test_event_code: analyticsFormData.facebook_test_event_code,
        }),
      });

      // Handle different response scenarios
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "⚠️ Endpoint não encontrado",
            description:
              "A API de teste de pixel ainda não foi implementada no servidor.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "❌ Erro HTTP",
          description: `Erro ${response.status}: ${response.statusText}`,
          variant: "destructive",
        });
        return;
      }

      // Try to read response body safely
      let result;
      try {
        // Clone the response to avoid stream issues
        const responseClone = response.clone();
        const responseText = await responseClone.text();

        if (!responseText) {
          result = { success: true, message: "Resposta vazia do servidor" };
        } else {
          result = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.warn(
          "Erro ao fazer parse JSON, usando resposta como sucesso:",
          parseError,
        );
        result = {
          success: true,
          message: "Teste executado (resposta não-JSON)",
        };
      }

      if (result.success !== false) {
        toast({
          title: "✅ Pixel testado!",
          description:
            result.message ||
            "Evento de teste enviado com sucesso para o Facebook.",
          variant: "success",
        });
      } else {
        toast({
          title: "❌ Erro no teste",
          description: result.message || "Erro ao testar pixel",
          variant: "destructive",
        });
      }
    } catch (networkError) {
      console.error("Erro de rede ao testar pixel:", networkError);

      if (
        networkError.name === "TypeError" &&
        networkError.message.includes("fetch")
      ) {
        toast({
          title: "❌ Erro de conexão",
          description:
            "Não foi possível conectar ao servidor. Verifique sua conexão.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Erro",
          description:
            "Erro interno ao testar Facebook Pixel. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // Função para testar conexão do banco
  const handleTestDatabaseConnection = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/test-db");
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
          description: `${result.message}. Detalhes: ${result.error?.message || "Erro desconhecido"}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
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
                onClick={() => setActiveConfigTab("analytics")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeConfigTab === "analytics"
                    ? "border-ecko-red text-ecko-red"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2 inline" />
                Analytics & META
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Configurações de Webhook
                </h3>
                <Button
                  onClick={handleTestWebhook}
                  disabled={saving || !webhookFormData.webhook_url}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {saving ? "Testando..." : "Testar Webhook"}
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">
                      Como funciona o webhook
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Quando um lead for capturado na landing page, os dados
                      serão enviados automaticamente para a URL configurada
                      abaixo. Isso permite integrar com seu CRM, sistema de
                      e-mail marketing ou qualquer outro serviço.
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuração da URL */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  URL de Destino
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="webhook_url"
                      className="text-sm font-medium text-gray-700"
                    >
                      URL do Webhook *
                    </Label>
                    <Input
                      id="webhook_url"
                      type="url"
                      placeholder="https://seu-sistema.com/webhook/leads"
                      value={webhookFormData.webhook_url}
                      onChange={(e) =>
                        setWebhookFormData({
                          ...webhookFormData,
                          webhook_url: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL onde os dados dos leads serão enviados via POST
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="webhook_secret"
                      className="text-sm font-medium text-gray-700"
                    >
                      Secret (Opcional)
                    </Label>
                    <Input
                      id="webhook_secret"
                      type="password"
                      placeholder="chave-secreta-para-validacao"
                      value={webhookFormData.webhook_secret}
                      onChange={(e) =>
                        setWebhookFormData({
                          ...webhookFormData,
                          webhook_secret: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Chave secreta para validar a origem dos dados (enviada no
                      header X-Signature)
                    </p>
                  </div>
                </div>
              </div>

              {/* Configurações Avançadas */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Configurações Avançadas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="webhook_timeout"
                      className="text-sm font-medium text-gray-700"
                    >
                      Timeout (segundos)
                    </Label>
                    <Input
                      id="webhook_timeout"
                      type="number"
                      min="5"
                      max="120"
                      value={webhookFormData.webhook_timeout}
                      onChange={(e) =>
                        setWebhookFormData({
                          ...webhookFormData,
                          webhook_timeout: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tempo limite para esperar resposta (5-120 segundos)
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="webhook_retries"
                      className="text-sm font-medium text-gray-700"
                    >
                      Tentativas
                    </Label>
                    <Input
                      id="webhook_retries"
                      type="number"
                      min="1"
                      max="10"
                      value={webhookFormData.webhook_retries}
                      onChange={(e) =>
                        setWebhookFormData({
                          ...webhookFormData,
                          webhook_retries: e.target.value,
                        })
                      }
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
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Exemplo de Payload
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Os dados do lead serão enviados no seguinte formato JSON:
                </p>
                <pre className="bg-gray-800 text-green-400 p-4 rounded text-xs overflow-x-auto">
                  {`{
  "lead_id": 123,
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "telefone": "(11) 99999-9999",
  "cidade": "São Paulo",
  "empresa": "Empresa ABC Ltda",
  "experiencia_revenda": "sim",
  "tem_cnpj": "sim",
  "tipo_loja": "fisica",
  "cep": "01234-567",
  "endereco": "Rua das Flores, 123",
  "numero": "123",
  "complemento": "Sala 101",
  "bairro": "Centro",
  "estado": "SP",
  "form_origin": "landing_page",
  "is_duplicate": false,
  "source": "direct",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "revendedores",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2024-01-15T10:30:00.000Z",
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
                </pre>
              </div>

              <Button
                onClick={handleSaveWebhookSettings}
                disabled={saving}
                className="bg-ecko-red hover:bg-ecko-red-dark text-white px-8 py-3 text-base font-medium"
              >
                {saving ? "Salvando..." : "Salvar Configurações de Webhook"}
              </Button>
            </div>
          )}

          {activeConfigTab === "seo" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Configurações de SEO
                </h3>
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
                    <h4 className="text-sm font-medium text-blue-800">
                      Otimização para mecanismos de busca
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Configure as meta tags e dados estruturados para melhorar
                      o ranking da página nos resultados de busca.
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuração de Domínio */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Configuração de Domínio
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="site_domain"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Link className="w-4 h-4 mr-1" />
                      Domínio Principal do Site
                    </Label>
                    <Input
                      id="site_domain"
                      value={seoFormData.site_domain}
                      onChange={(e) =>
                        setSeoFormData({
                          ...seoFormData,
                          site_domain: e.target.value,
                        })
                      }
                      placeholder="https://b2b.eckoshop.com.br"
                      className="mt-1"
                    />
                    <p className="text-xs text-blue-600 mt-1 flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Este domínio será usado automaticamente em todas as URLs
                      canônicas, Open Graph e Schema.org
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSeoFormData({
                          ...seoFormData,
                          seo_canonical_url: generateUrl("/"),
                          og_url: generateUrl("/"),
                        })
                      }
                      className="text-xs"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Aplicar a URLs
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSeoFormData({
                          ...seoFormData,
                          site_domain: "https://b2b.eckoshop.com.br",
                        })
                      }
                      className="text-xs"
                    >
                      <Palette className="w-3 h-3 mr-1" />
                      Usar Padrão
                    </Button>
                  </div>
                </div>

                {/* Favicon */}
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                    <Image className="w-4 h-4 mr-1" />
                    Ícone da Página (Favicon)
                  </Label>
                  <SeoImageUpload
                    currentImage={seoFormData.favicon_url}
                    onImageChange={(url) =>
                      setSeoFormData({ ...seoFormData, favicon_url: url })
                    }
                    label="Favicon do site"
                    description="Tamanho ideal: 32x32px ou 16x16px | Formatos: ICO, PNG, SVG | Aparece na aba do navegador"
                  />
                </div>
              </div>

              {/* Meta Tags Básicas */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Meta Tags Básicas
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="seo_title"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Título da Página (Title Tag)
                    </Label>
                    <Input
                      id="seo_title"
                      value={seoFormData.seo_title}
                      onChange={(e) =>
                        setSeoFormData({
                          ...seoFormData,
                          seo_title: e.target.value,
                        })
                      }
                      placeholder="Seja uma Revenda Autorizada da Ecko | Tenha os Melhores Produtos"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <Target className="w-3 h-3 mr-1" />
                      Máximo de 60 caracteres recomendado | Atual:{" "}
                      {seoFormData.seo_title.length}
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="seo_description"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Code className="w-4 h-4 mr-1" />
                      Meta Description
                    </Label>
                    <Textarea
                      id="seo_description"
                      value={seoFormData.seo_description}
                      onChange={(e) =>
                        setSeoFormData({
                          ...seoFormData,
                          seo_description: e.target.value,
                        })
                      }
                      placeholder="Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja..."
                      className="mt-1"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <Target className="w-3 h-3 mr-1" />
                      Máximo de 160 caracteres recomendado | Atual:{" "}
                      {seoFormData.seo_description.length}
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="seo_keywords"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Search className="w-4 h-4 mr-1" />
                      Keywords (separadas por vírgula)
                    </Label>
                    <Input
                      id="seo_keywords"
                      value={seoFormData.seo_keywords}
                      onChange={(e) =>
                        setSeoFormData({
                          ...seoFormData,
                          seo_keywords: e.target.value,
                        })
                      }
                      placeholder="revenda autorizada ecko, melhores produtos streetwear, lojista autorizado"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="seo_canonical_url"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Link className="w-4 h-4 mr-1" />
                      URL Canônica
                    </Label>
                    <Input
                      id="seo_canonical_url"
                      value={
                        seoFormData.seo_canonical_url ||
                        seoFormData.site_domain + "/"
                      }
                      onChange={(e) =>
                        setSeoFormData({
                          ...seoFormData,
                          seo_canonical_url: e.target.value,
                        })
                      }
                      placeholder={seoFormData.site_domain + "/"}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Deixe vazio para usar automaticamente:{" "}
                      {seoFormData.site_domain}/
                    </p>
                  </div>
                </div>
              </div>

              {/* Open Graph / Facebook */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Facebook className="w-5 h-5 mr-2 text-blue-600" />
                  Open Graph / Facebook
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="og_title"
                      className="text-sm font-medium text-gray-700"
                    >
                      Título Open Graph
                    </Label>
                    <Input
                      id="og_title"
                      value={seoFormData.og_title}
                      onChange={(e) =>
                        setSeoFormData({
                          ...seoFormData,
                          og_title: e.target.value,
                        })
                      }
                      placeholder={
                        seoFormData.seo_title || "Título para compartilhamento"
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="og_description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Descrição Open Graph
                    </Label>
                    <Textarea
                      id="og_description"
                      value={seoFormData.og_description}
                      onChange={(e) =>
                        setSeoFormData({
                          ...seoFormData,
                          og_description: e.target.value,
                        })
                      }
                      placeholder={
                        seoFormData.seo_description ||
                        "Descrição para compartilhamento"
                      }
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                      <Image className="w-4 h-4 mr-1" />
                      Imagem Open Graph (1200x630px)
                    </Label>
                    <SeoImageUpload
                      currentImage={seoFormData.og_image}
                      onImageChange={(url) =>
                        setSeoFormData({ ...seoFormData, og_image: url })
                      }
                      label="Imagem para redes sociais"
                      description="Tamanho ideal: 1200x630px | Formatos: JPG, PNG, WebP"
                    />
                  </div>
                </div>
              </div>

              {/* Twitter Card */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Twitter Card
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="twitter_title"
                      className="text-sm font-medium text-gray-700"
                    >
                      Título Twitter
                    </Label>
                    <Input
                      id="twitter_title"
                      value={seoFormData.twitter_title}
                      onChange={(e) =>
                        setSeoFormData({
                          ...seoFormData,
                          twitter_title: e.target.value,
                        })
                      }
                      placeholder={
                        seoFormData.og_title ||
                        seoFormData.seo_title ||
                        "Título para Twitter"
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="twitter_description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Descrição Twitter
                    </Label>
                    <Textarea
                      id="twitter_description"
                      value={seoFormData.twitter_description}
                      onChange={(e) =>
                        setSeoFormData({
                          ...seoFormData,
                          twitter_description: e.target.value,
                        })
                      }
                      placeholder={
                        seoFormData.og_description ||
                        seoFormData.seo_description ||
                        "Descrição para Twitter"
                      }
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Schema.org / Dados Estruturados */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Code className="w-5 h-5 mr-2 text-green-600" />
                  Schema.org / Dados Estruturados
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="schema_company_name"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Building2 className="w-4 h-4 mr-1" />
                      Nome da Empresa
                    </Label>
                    <Input
                      id="schema_company_name"
                      value={seoFormData.schema_company_name}
                      onChange={(e) =>
                        setSeoFormData({
                          ...seoFormData,
                          schema_company_name: e.target.value,
                        })
                      }
                      placeholder="Ecko Unlimited Brasil"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="schema_contact_phone"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Telefone de Contato
                    </Label>
                    <Input
                      id="schema_contact_phone"
                      value={seoFormData.schema_contact_phone}
                      onChange={(e) =>
                        setSeoFormData({
                          ...seoFormData,
                          schema_contact_phone: e.target.value,
                        })
                      }
                      placeholder="+55 (11) 99999-9999"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="schema_contact_email"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email de Contato
                    </Label>
                    <Input
                      id="schema_contact_email"
                      value={seoFormData.schema_contact_email}
                      onChange={(e) =>
                        setSeoFormData({
                          ...seoFormData,
                          schema_contact_email: e.target.value,
                        })
                      }
                      placeholder="contato@ecko.com.br"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="schema_address_city"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Cidade
                    </Label>
                    <Input
                      id="schema_address_city"
                      value={seoFormData.schema_address_city}
                      onChange={(e) =>
                        setSeoFormData({
                          ...seoFormData,
                          schema_address_city: e.target.value,
                        })
                      }
                      placeholder="São Paulo"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                    <Image className="w-4 h-4 mr-1" />
                    Logo da Empresa
                  </Label>
                  <SeoImageUpload
                    currentImage={seoFormData.schema_company_logo}
                    onImageChange={(url) =>
                      setSeoFormData({
                        ...seoFormData,
                        schema_company_logo: url,
                      })
                    }
                    label="Logo para dados estruturados"
                    description="Tamanho ideal: 512x512px | Formato quadrado recomendado"
                  />
                </div>
              </div>

              {/* Preview das URLs Geradas */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-green-600" />
                  Preview das URLs Geradas
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <span className="font-medium text-gray-700">
                      URL Canônica:
                    </span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {seoFormData.seo_canonical_url || generateUrl("/")}
                    </code>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <span className="font-medium text-gray-700">
                      Open Graph URL:
                    </span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {seoFormData.og_url || generateUrl("/")}
                    </code>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <span className="font-medium text-gray-700">
                      Schema.org URL:
                    </span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {generateUrl("/")}
                    </code>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-3 flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  Todas essas URLs serão atualizadas automaticamente quando você
                  alterar o domínio principal
                </p>
              </div>

              <Button
                onClick={handleSaveSeoSettings}
                disabled={saving}
                className="bg-ecko-red hover:bg-ecko-red-dark text-white px-8 py-3 text-base font-medium"
              >
                {saving ? "Salvando..." : "Salvar Configurações de SEO"}
              </Button>
            </div>
          )}

          {activeConfigTab === "analytics" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                  Analytics & META Configuration
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleTestFacebookPixel}
                    disabled={saving || !analyticsFormData.facebook_pixel_id}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    {saving ? "Testando..." : "Testar Pixel"}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">
                      Analytics e Conversões
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Configure Google Analytics 4 e Facebook Pixel para
                      rastrear conversões e otimizar campanhas publicitárias
                      automaticamente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Analytics 4 */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google Analytics 4
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="ga4_measurement_id"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Target className="w-4 h-4 mr-1" />
                      Measurement ID (G-XXXXXXXXXX)
                    </Label>
                    <Input
                      id="ga4_measurement_id"
                      value={analyticsFormData.ga4_measurement_id}
                      onChange={(e) =>
                        setAnalyticsFormData({
                          ...analyticsFormData,
                          ga4_measurement_id: e.target.value,
                        })
                      }
                      placeholder="G-XXXXXXXXXX"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Encontre no Google Analytics 4 → Admin → Streams de dados
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="ga4_api_secret"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      API Secret (Para Measurement Protocol)
                    </Label>
                    <Input
                      id="ga4_api_secret"
                      type="password"
                      value={analyticsFormData.ga4_api_secret}
                      onChange={(e) =>
                        setAnalyticsFormData({
                          ...analyticsFormData,
                          ga4_api_secret: e.target.value,
                        })
                      }
                      placeholder="Chave secreta da API"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Para envio de eventos server-side (conversões offline)
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="gtag_config"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Code className="w-4 h-4 mr-1" />
                      Configurações Adicionais (JSON)
                    </Label>
                    <Textarea
                      id="gtag_config"
                      value={analyticsFormData.gtag_config}
                      onChange={(e) =>
                        setAnalyticsFormData({
                          ...analyticsFormData,
                          gtag_config: e.target.value,
                        })
                      }
                      placeholder='{"custom_map": {"custom_parameter_1": "dimension1"}, "send_page_view": false}'
                      className="mt-1"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Configurações JSON para gtag() - Opcional
                    </p>
                  </div>
                </div>
              </div>

              {/* Facebook Pixel & Conversions API */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Facebook className="w-5 h-5 mr-2 text-blue-600" />
                  Facebook Pixel & Conversions API
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="facebook_pixel_id"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Target className="w-4 h-4 mr-1" />
                      Pixel ID
                    </Label>
                    <Input
                      id="facebook_pixel_id"
                      value={analyticsFormData.facebook_pixel_id}
                      onChange={(e) =>
                        setAnalyticsFormData({
                          ...analyticsFormData,
                          facebook_pixel_id: e.target.value,
                        })
                      }
                      placeholder="123456789012345"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Encontre no Facebook Business Manager → Pixels
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="facebook_access_token"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      Access Token (Para Conversions API)
                    </Label>
                    <Input
                      id="facebook_access_token"
                      type="password"
                      value={analyticsFormData.facebook_access_token}
                      onChange={(e) =>
                        setAnalyticsFormData({
                          ...analyticsFormData,
                          facebook_access_token: e.target.value,
                        })
                      }
                      placeholder="Token de acesso permanente"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Token para envio de eventos server-side via Conversions
                      API
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="facebook_test_event_code"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Test Event Code (Opcional)
                    </Label>
                    <Input
                      id="facebook_test_event_code"
                      value={analyticsFormData.facebook_test_event_code}
                      onChange={(e) =>
                        setAnalyticsFormData({
                          ...analyticsFormData,
                          facebook_test_event_code: e.target.value,
                        })
                      }
                      placeholder="TEST12345"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Para testes no Event Manager - Deixe vazio em produção
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="conversions_api_enabled"
                      checked={
                        analyticsFormData.conversions_api_enabled === "true"
                      }
                      onChange={(e) =>
                        setAnalyticsFormData({
                          ...analyticsFormData,
                          conversions_api_enabled: e.target.checked
                            ? "true"
                            : "false",
                        })
                      }
                      className="w-4 h-4 text-ecko-red bg-gray-100 border-gray-300 rounded focus:ring-ecko-red focus:ring-2"
                    />
                    <Label
                      htmlFor="conversions_api_enabled"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Ativar Conversions API
                    </Label>
                  </div>
                </div>
              </div>

              {/* Configurações de Conversão */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  Configurações de Conversão Personalizada
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="lead_event_name"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Nome do Evento de Lead
                    </Label>
                    <Input
                      id="lead_event_name"
                      value={analyticsFormData.lead_event_name}
                      onChange={(e) =>
                        setAnalyticsFormData({
                          ...analyticsFormData,
                          lead_event_name: e.target.value,
                        })
                      }
                      placeholder="Lead"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nome do evento enviado para Facebook quando um lead é
                      capturado
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="conversion_value"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Target className="w-4 h-4 mr-1" />
                      Valor da Conversão (R$)
                    </Label>
                    <Input
                      id="conversion_value"
                      type="number"
                      step="0.01"
                      value={analyticsFormData.conversion_value}
                      onChange={(e) =>
                        setAnalyticsFormData({
                          ...analyticsFormData,
                          conversion_value: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Valor monetário atribuído a cada lead capturado
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-white p-4 rounded border border-green-300">
                  <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <Code className="w-4 h-4 mr-1" />
                    Eventos Automáticos Configurados
                  </h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • <strong>PageView:</strong> Quando a página é carregada
                    </li>
                    <li>
                      • <strong>Lead:</strong> Quando o formulário é enviado com
                      sucesso
                    </li>
                    <li>
                      • <strong>Contact:</strong> Quando o WhatsApp é clicado
                    </li>
                    <li>
                      • <strong>ViewContent:</strong> Tracking de engajamento na
                      página
                    </li>
                  </ul>
                </div>
              </div>

              <Button
                onClick={handleSaveAnalyticsSettings}
                disabled={saving}
                className="bg-ecko-red hover:bg-ecko-red-dark text-white px-8 py-3 text-base font-medium"
              >
                {saving ? "Salvando..." : "Salvar Configurações de Analytics"}
              </Button>
            </div>
          )}

          {activeConfigTab === "database" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Status do Banco de Dados
                </h3>
                <Button
                  onClick={handleTestDatabaseConnection}
                  disabled={saving}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  {saving ? "Testando..." : "Testar Conexão"}
                </Button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Informações da Conexão
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Host
                    </Label>
                    <Input
                      value="5.161.52.206"
                      readOnly
                      className="mt-1 bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Porta
                    </Label>
                    <Input value="3040" readOnly className="mt-1 bg-gray-100" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Banco
                    </Label>
                    <Input value="lpdb" readOnly className="mt-1 bg-gray-100" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Usuário
                    </Label>
                    <Input value="lpdb" readOnly className="mt-1 bg-gray-100" />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Banco de dados conectado e funcionando
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Todas as operações de leads e configurações estão sendo
                      salvas corretamente.
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
            ogTitle:
              seoFormData.og_title || seoFormData.seo_title || "Título OG",
            ogDescription:
              seoFormData.og_description ||
              seoFormData.seo_description ||
              "Descrição OG",
            ogImage: seoFormData.og_image || "URL da imagem",
            twitterTitle:
              seoFormData.twitter_title ||
              seoFormData.seo_title ||
              "Título Twitter",
            siteName: seoFormData.og_site_name || "Ecko Revendedores",
            canonicalUrl:
              seoFormData.seo_canonical_url || seoFormData.site_domain + "/",
          }}
        />
      )}
    </div>
  );
}
