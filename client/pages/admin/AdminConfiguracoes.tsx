import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { SeoImageUpload } from "../../components/SeoImageUpload";
import { SeoPreviewModal } from "../../components/SeoPreviewModal";
import { CompactImageUpload } from "../../components/CompactImageUpload";
import { MetaTrackingInfo } from "../../components/MetaTrackingInfo";
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
  TestTube,
  Activity,
  MousePointer,
  Clock,
  Eye as ViewIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function AdminConfiguracoes() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "webhook" | "seo" | "integracoes" | "database"
  >("webhook");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  // Hook para gerenciar configurações
  const { settings, loading, error, saveSettings, getSetting } = useSettings();

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
    og_title: getSetting("og_title") || "",
    og_description: getSetting("og_description") || "",
    og_image: getSetting("og_image") || "",
    twitter_card: getSetting("twitter_card") || "summary_large_image",
    twitter_title: getSetting("twitter_title") || "",
    twitter_description: getSetting("twitter_description") || "",
    twitter_image: getSetting("twitter_image") || "",
    favicon_url: getSetting("favicon_url") || "",
    apple_icon_url: getSetting("apple_icon_url") || "",
  });

  const [integracoesData, setIntegracoesData] = useState({
    ga4_measurement_id: getSetting("ga4_measurement_id") || "",
    ga4_api_secret: getSetting("ga4_api_secret") || "",
    ga4_conversion_name: getSetting("ga4_conversion_name") || "form_submit",
    meta_pixel_id: getSetting("meta_pixel_id") || "",
    meta_access_token: getSetting("meta_access_token") || "",
    meta_conversion_name: getSetting("meta_conversion_name") || "Lead",
    meta_test_code: getSetting("meta_test_code") || "",
    meta_tracking_enabled: getSetting("meta_tracking_enabled") || "true",
    meta_track_pageview: getSetting("meta_track_pageview") || "true",
    meta_track_scroll: getSetting("meta_track_scroll") || "true",
    meta_track_time: getSetting("meta_track_time") || "true",
    meta_track_interactions: getSetting("meta_track_interactions") || "true",
    custom_conversion_enabled:
      getSetting("custom_conversion_enabled") || "false",
    custom_conversion_event:
      getSetting("custom_conversion_event") || "lead_captured",
    custom_conversion_value: getSetting("custom_conversion_value") || "1",
  });

  // Atualizar dados quando as configurações carregarem
  useEffect(() => {
    if (!loading && Object.keys(settings).length > 0) {
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
        og_title: getSetting("og_title") || "",
        og_description: getSetting("og_description") || "",
        og_image: getSetting("og_image") || "",
        twitter_card: getSetting("twitter_card") || "summary_large_image",
        twitter_title: getSetting("twitter_title") || "",
        twitter_description: getSetting("twitter_description") || "",
        twitter_image: getSetting("twitter_image") || "",
        favicon_url: getSetting("favicon_url") || "",
        apple_icon_url: getSetting("apple_icon_url") || "",
      });

      setIntegracoesData({
        ga4_measurement_id: getSetting("ga4_measurement_id") || "",
        ga4_api_secret: getSetting("ga4_api_secret") || "",
        ga4_conversion_name: getSetting("ga4_conversion_name") || "form_submit",
        meta_pixel_id: getSetting("meta_pixel_id") || "",
        meta_access_token: getSetting("meta_access_token") || "",
        meta_conversion_name: getSetting("meta_conversion_name") || "Lead",
        meta_test_code: getSetting("meta_test_code") || "",
        meta_tracking_enabled: getSetting("meta_tracking_enabled") || "true",
        meta_track_pageview: getSetting("meta_track_pageview") || "true",
        meta_track_scroll: getSetting("meta_track_scroll") || "true",
        meta_track_time: getSetting("meta_track_time") || "true",
        meta_track_interactions:
          getSetting("meta_track_interactions") || "true",
        custom_conversion_enabled:
          getSetting("custom_conversion_enabled") || "false",
        custom_conversion_event:
          getSetting("custom_conversion_event") || "lead_captured",
        custom_conversion_value: getSetting("custom_conversion_value") || "1",
      });
    }
  }, [settings, loading, getSetting]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let settingsToSave: Array<{
        setting_key: string;
        setting_value: string;
        setting_type: string;
      }> = [];

      if (activeTab === "webhook") {
        settingsToSave = [
          {
            setting_key: "webhook_url",
            setting_value: webhookData.webhook_url,
            setting_type: "text",
          },
          {
            setting_key: "webhook_secret",
            setting_value: webhookData.webhook_secret,
            setting_type: "text",
          },
          {
            setting_key: "webhook_timeout",
            setting_value: webhookData.webhook_timeout,
            setting_type: "number",
          },
          {
            setting_key: "webhook_retries",
            setting_value: webhookData.webhook_retries,
            setting_type: "number",
          },
        ];
      } else if (activeTab === "integracoes") {
        settingsToSave = Object.entries(integracoesData).map(
          ([key, value]) => ({
            setting_key: key,
            setting_value: value,
            setting_type: key.includes("enabled") ? "boolean" : "text",
          }),
        );
      }

      const success = await saveSettings(settingsToSave);

      if (success) {
        toast({
          title: "✅ Configurações salvas!",
          description: "As configurações foram atualizadas com sucesso.",
        });
        setHasChanges(false);
      } else {
        throw new Error("Falha ao salvar configurações");
      }
    } catch (error) {
      toast({
        title: "❌ Erro ao salvar",
        description: "Erro ao salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Função específica para salvar configurações de SEO em JSON exclusivo
  const saveSeoSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/seo-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(seoData)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ SEO configurado!",
          description: "Configurações de SEO salvas em arquivo exclusivo",
          variant: "default",
        });
        setHasChanges(false);
      } else {
        throw new Error(result.message || 'Erro ao salvar configurações de SEO');
      }
    } catch (error: any) {
      console.error('Erro ao salvar configurações de SEO:', error);
      toast({
        title: "❌ Erro ao salvar SEO",
        description: error.message || "Erro ao salvar configurações de SEO",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Carregar configurações de SEO ao montar o componente
  useEffect(() => {
    const loadSeoSettings = async () => {
      try {
        const response = await fetch('/api/seo-settings');
        const result = await response.json();

        if (result.success) {
          setSeoData(result.data);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de SEO:', error);
      }
    };

    loadSeoSettings();
  }, []);

  const testMetaTracking = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      // Verificar se as configurações locais estão preenchidas primeiro
      const pixelId = integracoesData.meta_pixel_id?.trim();
      const accessToken = integracoesData.meta_access_token?.trim();

      if (!pixelId || !accessToken) {
        toast({
          title: "⚠️ Configurações obrigatórias",
          description: "Preencha Pixel ID e Access Token antes de testar.",
          variant: "destructive",
        });
        setTesting(false);
        return;
      }

      // Verificar configuração no servidor
      const configResponse = await fetch("/api/meta/config");
      const configResult = await configResponse.json();

      if (!configResult.configured) {
        toast({
          title: "⚠️ Configuração não salva",
          description: "Salve as configurações antes de testar a integração.",
          variant: "destructive",
        });
        setTesting(false);
        return;
      }

      // Testar evento PageView (Pixel)
      const pixelTestResponse = await fetch("/api/meta/test-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: "PageView",
          custom_data: {
            content_type: "admin_test",
            content_category: "configuration_test",
            page_title: "Admin Test - Meta Tracking",
          },
        }),
      });

      const pixelTestResult = await pixelTestResponse.json();

      // Testar API de Conversões
      const conversionTestResponse = await fetch("/api/meta/track-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: "Lead",
          event_source_url: window.location.href,
          action_source: "website",
          custom_data: {
            content_type: "admin_conversion_test",
            content_category: "api_test",
            value: 1.00,
            currency: "BRL"
          },
          user_data: {
            client_ip_address: "test",
            client_user_agent: navigator.userAgent,
            fbc: "test_fbc",
            fbp: "test_fbp"
          }
        }),
      });

      const conversionTestResult = await conversionTestResponse.json();

      const allTestsSuccess = pixelTestResult.success && conversionTestResult.success;

      if (allTestsSuccess) {
        toast({
          title: "✅ Testes bem-sucedidos!",
          description: "Pixel e API de Conversões funcionando corretamente.",
        });

        setTestResults({
          success: true,
          configCheck: configResult,
          pixelTest: pixelTestResult,
          conversionTest: conversionTestResult,
        });
      } else {
        const errors = [];
        if (!pixelTestResult.success) errors.push("Pixel: " + pixelTestResult.message);
        if (!conversionTestResult.success) errors.push("Conversões: " + conversionTestResult.message);

        throw new Error("Falhas encontradas: " + errors.join(", "));
      }
    } catch (error) {
      toast({
        title: "❌ Erro no teste",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });

      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        pixelTest: { success: false, message: "Não testado devido ao erro" },
        conversionTest: { success: false, message: "Não testado devido ao erro" },
        configurationIssue: !integracoesData.meta_pixel_id || !integracoesData.meta_access_token
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600">
            Erro ao carregar configurações: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do sistema</p>
      </div>

      {/* Tabs de navegação */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "webhook", label: "Webhook", icon: Webhook },
            { id: "seo", label: "SEO", icon: Search },
            { id: "integracoes", label: "Integrações", icon: BarChart3 },
            { id: "database", label: "Database", icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das tabs */}
      <div>
        {activeTab === "webhook" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Webhook className="w-5 h-5 mr-2" />
                Configurações de Webhook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhook_url">URL do Webhook</Label>
                <Input
                  id="webhook_url"
                  value={webhookData.webhook_url}
                  onChange={(e) => {
                    setWebhookData({
                      ...webhookData,
                      webhook_url: e.target.value,
                    });
                    setHasChanges(true);
                  }}
                  placeholder="https://example.com/webhook"
                />
              </div>
              <div>
                <Label htmlFor="webhook_secret">Secret do Webhook</Label>
                <Input
                  id="webhook_secret"
                  type="password"
                  value={webhookData.webhook_secret}
                  onChange={(e) => {
                    setWebhookData({
                      ...webhookData,
                      webhook_secret: e.target.value,
                    });
                    setHasChanges(true);
                  }}
                  placeholder="sua_chave_secreta"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="webhook_timeout">Timeout (segundos)</Label>
                  <Input
                    id="webhook_timeout"
                    type="number"
                    value={webhookData.webhook_timeout}
                    onChange={(e) => {
                      setWebhookData({
                        ...webhookData,
                        webhook_timeout: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="webhook_retries">Tentativas</Label>
                  <Input
                    id="webhook_retries"
                    type="number"
                    value={webhookData.webhook_retries}
                    onChange={(e) => {
                      setWebhookData({
                        ...webhookData,
                        webhook_retries: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "integracoes" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Integrações Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meta Pixel */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    Meta Facebook Conversions API
                  </h3>
                  <Button
                    onClick={testMetaTracking}
                    disabled={testing}
                    variant="outline"
                    size="sm"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testando Pixel e API...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Testar Pixel e API de Conversões
                      </>
                    )}
                  </Button>
                </div>

                {/* Configurações básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meta_pixel_id">Pixel ID</Label>
                    <Input
                      id="meta_pixel_id"
                      value={integracoesData.meta_pixel_id}
                      onChange={(e) => {
                        setIntegracoesData({
                          ...integracoesData,
                          meta_pixel_id: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      placeholder="123456789012345"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_access_token">Access Token</Label>
                    <Input
                      id="meta_access_token"
                      type="password"
                      value={integracoesData.meta_access_token}
                      onChange={(e) => {
                        setIntegracoesData({
                          ...integracoesData,
                          meta_access_token: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      placeholder="EAAxxxx..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_conversion_name">
                      Nome da Conversão
                    </Label>
                    <Input
                      id="meta_conversion_name"
                      value={integracoesData.meta_conversion_name}
                      onChange={(e) => {
                        setIntegracoesData({
                          ...integracoesData,
                          meta_conversion_name: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      placeholder="Lead"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_test_code">
                      Código de Teste (Opcional)
                    </Label>
                    <Input
                      id="meta_test_code"
                      value={integracoesData.meta_test_code}
                      onChange={(e) => {
                        setIntegracoesData({
                          ...integracoesData,
                          meta_test_code: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      placeholder="TEST23442"
                    />
                  </div>
                </div>

                {/* Configurações de rastreamento avançado */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-green-600" />
                    Rastreamento Automático da Landing Page
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="meta_tracking_enabled"
                        checked={
                          integracoesData.meta_tracking_enabled === "true"
                        }
                        onChange={(e) => {
                          setIntegracoesData({
                            ...integracoesData,
                            meta_tracking_enabled: e.target.checked
                              ? "true"
                              : "false",
                          });
                          setHasChanges(true);
                        }}
                        className="rounded"
                      />
                      <Label
                        htmlFor="meta_tracking_enabled"
                        className="flex items-center cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                        Ativar Rastreamento Geral
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="meta_track_pageview"
                        checked={integracoesData.meta_track_pageview === "true"}
                        onChange={(e) => {
                          setIntegracoesData({
                            ...integracoesData,
                            meta_track_pageview: e.target.checked
                              ? "true"
                              : "false",
                          });
                          setHasChanges(true);
                        }}
                        className="rounded"
                      />
                      <Label
                        htmlFor="meta_track_pageview"
                        className="flex items-center cursor-pointer"
                      >
                        <ViewIcon className="w-4 h-4 mr-1 text-blue-500" />
                        Rastrear Visualizações de Página
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="meta_track_scroll"
                        checked={integracoesData.meta_track_scroll === "true"}
                        onChange={(e) => {
                          setIntegracoesData({
                            ...integracoesData,
                            meta_track_scroll: e.target.checked
                              ? "true"
                              : "false",
                          });
                          setHasChanges(true);
                        }}
                        className="rounded"
                      />
                      <Label
                        htmlFor="meta_track_scroll"
                        className="flex items-center cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4 mr-1 text-purple-500" />
                        Rastrear Profundidade de Scroll
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="meta_track_time"
                        checked={integracoesData.meta_track_time === "true"}
                        onChange={(e) => {
                          setIntegracoesData({
                            ...integracoesData,
                            meta_track_time: e.target.checked
                              ? "true"
                              : "false",
                          });
                          setHasChanges(true);
                        }}
                        className="rounded"
                      />
                      <Label
                        htmlFor="meta_track_time"
                        className="flex items-center cursor-pointer"
                      >
                        <Clock className="w-4 h-4 mr-1 text-orange-500" />
                        Rastrear Tempo na Página
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 md:col-span-2">
                      <input
                        type="checkbox"
                        id="meta_track_interactions"
                        checked={
                          integracoesData.meta_track_interactions === "true"
                        }
                        onChange={(e) => {
                          setIntegracoesData({
                            ...integracoesData,
                            meta_track_interactions: e.target.checked
                              ? "true"
                              : "false",
                          });
                          setHasChanges(true);
                        }}
                        className="rounded"
                      />
                      <Label
                        htmlFor="meta_track_interactions"
                        className="flex items-center cursor-pointer"
                      >
                        <MousePointer className="w-4 h-4 mr-1 text-red-500" />
                        Rastrear Interações (Cliques, Hover, FAQ, etc.)
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Resultado dos testes */}
                {testResults && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      {testResults.success ? (
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                      )}
                      Resultado do Teste
                    </h4>

                    <div
                      className={`p-3 rounded-lg ${
                        testResults.success
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      {testResults.success ? (
                        <div className="space-y-3">
                          <p className="text-green-800 font-medium">
                            ✅ Integração funcionando corretamente!
                          </p>

                          {/* Configurações testadas */}
                          <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <h5 className="font-medium text-blue-900 mb-2">
                              📋 Configurações Testadas
                            </h5>
                            <div className="space-y-1 text-xs">
                              <p className="text-blue-700">
                                <strong>Pixel ID:</strong> {integracoesData.meta_pixel_id ? `${integracoesData.meta_pixel_id.substring(0, 8)}...` : 'Não configurado'}
                              </p>
                              <p className="text-blue-700">
                                <strong>Access Token:</strong> {integracoesData.meta_access_token ? `${integracoesData.meta_access_token.substring(0, 12)}...` : 'Não configurado'}
                              </p>
                            </div>
                          </div>

                          {/* Resultado do Pixel */}
                          <div className="bg-white p-3 rounded border">
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Meta Pixel
                            </h5>
                            <p className="text-green-700 text-sm">
                              Eventos do Pixel sendo enviados com sucesso
                            </p>
                            {testResults.pixelTest?.result?.eventsReceived !== undefined && (
                              <p className="text-green-600 text-xs mt-1">
                                Eventos recebidos: {testResults.pixelTest.result.eventsReceived}
                              </p>
                            )}
                          </div>

                          {/* Resultado da API de Conversões */}
                          <div className="bg-white p-3 rounded border">
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              API de Conversões
                            </h5>
                            <p className="text-green-700 text-sm">
                              API de Conversões funcionando corretamente
                            </p>
                            {testResults.conversionTest?.result?.eventsReceived !== undefined && (
                              <p className="text-green-600 text-xs mt-1">
                                Eventos recebidos: {testResults.conversionTest.result.eventsReceived}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-red-800 font-medium">
                            ❌ Erro na integração
                          </p>

                          {/* Configurações atuais */}
                          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                            <h5 className="font-medium text-yellow-900 mb-2">
                              ⚠️ Configurações Atuais
                            </h5>
                            <div className="space-y-1 text-xs">
                              <p className={`${integracoesData.meta_pixel_id ? 'text-green-700' : 'text-red-700'}`}>
                                <strong>Pixel ID:</strong> {integracoesData.meta_pixel_id || 'Não configurado'}
                              </p>
                              <p className={`${integracoesData.meta_access_token ? 'text-green-700' : 'text-red-700'}`}>
                                <strong>Access Token:</strong> {integracoesData.meta_access_token ? `${integracoesData.meta_access_token.substring(0, 12)}...` : 'Não configurado'}
                              </p>
                            </div>
                          </div>

                          {/* Status do Pixel */}
                          <div className="bg-white p-3 rounded border">
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${testResults.pixelTest?.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              Meta Pixel
                            </h5>
                            <p className={`text-sm ${testResults.pixelTest?.success ? 'text-green-700' : 'text-red-700'}`}>
                              {testResults.pixelTest?.success ? 'Funcionando' : `Erro: ${testResults.pixelTest?.message || 'Falha no teste'}`}
                            </p>
                          </div>

                          {/* Status da API de Conversões */}
                          <div className="bg-white p-3 rounded border">
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${testResults.conversionTest?.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              API de Conversões
                            </h5>
                            <p className={`text-sm ${testResults.conversionTest?.success ? 'text-green-700' : 'text-red-700'}`}>
                              {testResults.conversionTest?.success ? 'Funcionando' : `Erro: ${testResults.conversionTest?.message || 'Falha no teste'}`}
                            </p>
                          </div>

                          <p className="text-red-700 text-sm">
                            {testResults.error}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informações importantes */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    ℹ️ Informações Importantes
                  </h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>
                      • O rastreamento é feito via Conversions API para máxima
                      precisão
                    </li>
                    <li>
                      • Todos os eventos são enviados automaticamente na landing
                      page
                    </li>
                    <li>
                      • Use o código de teste durante desenvolvimento para não
                      afetar dados reais
                    </li>
                    <li>
                      • Configure eventos personalizados conforme sua estratégia
                      de marketing
                    </li>
                  </ul>
                </div>
              </div>

              {/* Implementação Info */}
              <div className="mt-8">
                <MetaTrackingInfo />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "seo" && (
          <div className="space-y-6">
            {/* SEO Básico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  SEO Básico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="seo_title">
                      Título da Página (Title Tag)
                    </Label>
                    <Input
                      id="seo_title"
                      value={seoData.seo_title}
                      onChange={(e) => {
                        setSeoData({ ...seoData, seo_title: e.target.value });
                        setHasChanges(true);
                      }}
                      placeholder="Seja uma Revenda Autorizada da Ecko | Tenha os Melhores Produtos"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {seoData.seo_title.length}/60 caracteres (ideal: 50-60)
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="seo_description">Meta Description</Label>
                    <textarea
                      id="seo_description"
                      value={seoData.seo_description}
                      onChange={(e) => {
                        setSeoData({
                          ...seoData,
                          seo_description: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      placeholder="Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {seoData.seo_description.length}/160 caracteres (ideal:
                      150-160)
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="seo_keywords">
                      Palavras-chave (Keywords)
                    </Label>
                    <Input
                      id="seo_keywords"
                      value={seoData.seo_keywords}
                      onChange={(e) => {
                        setSeoData({
                          ...seoData,
                          seo_keywords: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      placeholder="revenda autorizada ecko, melhores produtos streetwear, lojista autorizado"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separe por vírgulas. Foque nas mais importantes para seu
                      negócio.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="seo_canonical_url">URL Canônica</Label>
                    <Input
                      id="seo_canonical_url"
                      value={seoData.seo_canonical_url}
                      onChange={(e) => {
                        setSeoData({
                          ...seoData,
                          seo_canonical_url: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      placeholder="https://revendedores.ecko.com.br"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL principal do seu site. Evita problemas de conteúdo
                      duplicado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Open Graph (Facebook) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Open Graph (Facebook/LinkedIn)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="og_title">Título para Redes Sociais</Label>
                    <Input
                      id="og_title"
                      value={seoData.og_title}
                      onChange={(e) => {
                        setSeoData({ ...seoData, og_title: e.target.value });
                        setHasChanges(true);
                      }}
                      placeholder="Seja uma Revenda Autorizada da Ecko"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="og_description">
                      Descrição para Redes Sociais
                    </Label>
                    <textarea
                      id="og_description"
                      value={seoData.og_description}
                      onChange={(e) => {
                        setSeoData({
                          ...seoData,
                          og_description: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      placeholder="Transforme sua paixão em lucro! Seja um revendedor autorizado Ecko..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Imagem para Redes Sociais</Label>
                    <CompactImageUpload
                      value={seoData.og_image}
                      onChange={(url) => {
                        setSeoData({ ...seoData, og_image: url });
                        setHasChanges(true);
                      }}
                      placeholder="Upload da imagem Open Graph"
                      type="seo"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recomendado: 1200x630px. Será exibida quando seu site for
                      compartilhado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Twitter Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Twitter className="w-5 h-5 mr-2 text-blue-400" />
                  Twitter Cards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="twitter_card">Tipo de Card</Label>
                    <select
                      id="twitter_card"
                      value={seoData.twitter_card}
                      onChange={(e) => {
                        setSeoData({
                          ...seoData,
                          twitter_card: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="summary">Summary</option>
                      <option value="summary_large_image">
                        Summary com Imagem Grande
                      </option>
                      <option value="app">App</option>
                      <option value="player">Player</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="twitter_title">Título para Twitter</Label>
                    <Input
                      id="twitter_title"
                      value={seoData.twitter_title}
                      onChange={(e) => {
                        setSeoData({
                          ...seoData,
                          twitter_title: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      placeholder="Seja uma Revenda Autorizada da Ecko"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="twitter_description">
                      Descrição para Twitter
                    </Label>
                    <textarea
                      id="twitter_description"
                      value={seoData.twitter_description}
                      onChange={(e) => {
                        setSeoData({
                          ...seoData,
                          twitter_description: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      placeholder="Transforme sua paixão em lucro! Seja um revendedor autorizado Ecko..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={2}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Imagem para Twitter</Label>
                    <CompactImageUpload
                      value={seoData.twitter_image}
                      onChange={(url) => {
                        setSeoData({ ...seoData, twitter_image: url });
                        setHasChanges(true);
                      }}
                      placeholder="Upload da imagem Twitter"
                      type="seo"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Favicons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-purple-600" />
                  Favicons e Ícones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Favicon</Label>
                    <CompactImageUpload
                      value={seoData.favicon_url}
                      onChange={(url) => {
                        setSeoData({ ...seoData, favicon_url: url });
                        setHasChanges(true);
                      }}
                      placeholder="Upload do favicon"
                      type="seo"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recomendado: 32x32px ou 16x16px (.ico, .png)
                    </p>
                  </div>

                  <div>
                    <Label>Ícone Apple Touch</Label>
                    <CompactImageUpload
                      value={seoData.apple_icon_url}
                      onChange={(url) => {
                        setSeoData({ ...seoData, apple_icon_url: url });
                        setHasChanges(true);
                      }}
                      placeholder="Upload do ícone Apple"
                      type="seo"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recomendado: 180x180px (.png)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview SEO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ViewIcon className="w-5 h-5 mr-2 text-green-600" />
                  Preview do Google
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="max-w-2xl">
                    <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                      {seoData.seo_title ||
                        "Título da sua página aparecerá aqui"}
                    </div>
                    <div className="text-green-700 text-sm mt-1">
                      {seoData.seo_canonical_url || "https://seusite.com.br"}
                    </div>
                    <div className="text-gray-600 text-sm mt-2 leading-relaxed">
                      {seoData.seo_description ||
                        "A descrição da sua página aparecerá aqui. Certifique-se de que seja atrativa e informativa para aumentar o CTR."}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                  Dicas de SEO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-3">
                    💡 Melhores Práticas
                  </h4>
                  <ul className="text-yellow-800 text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span>
                        <strong>Título:</strong> Use palavras-chave importantes
                        no início. Máximo 60 caracteres.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span>
                        <strong>Descrição:</strong> Seja persuasivo e inclua
                        call-to-action. 150-160 caracteres.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span>
                        <strong>Imagens:</strong> Use imagens de alta qualidade
                        e otimizadas para web.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span>
                        <strong>URL Canônica:</strong> Sempre use HTTPS e evite
                        URLs com parâmetros desnecessários.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span>
                        <strong>Keywords:</strong> Foque na intenção de busca do
                        seu público-alvo.
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Botão de salvar */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={activeTab === "seo" ? saveSeoSettings : handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
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
