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
  const { settings, loading, error, saveSettings, getSetting } =
    useSettings();

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
    custom_conversion_enabled: getSetting("custom_conversion_enabled") || "false",
    custom_conversion_event: getSetting("custom_conversion_event") || "lead_captured",
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
        meta_track_interactions: getSetting("meta_track_interactions") || "true",
        custom_conversion_enabled: getSetting("custom_conversion_enabled") || "false",
        custom_conversion_event: getSetting("custom_conversion_event") || "lead_captured",
        custom_conversion_value: getSetting("custom_conversion_value") || "1",
      });
    }
  }, [settings, loading, getSetting]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let settingsToSave: Array<{setting_key: string, setting_value: string, setting_type: string}> = [];

      if (activeTab === "webhook") {
        settingsToSave = [
          { setting_key: "webhook_url", setting_value: webhookData.webhook_url, setting_type: "text" },
          { setting_key: "webhook_secret", setting_value: webhookData.webhook_secret, setting_type: "text" },
          { setting_key: "webhook_timeout", setting_value: webhookData.webhook_timeout, setting_type: "number" },
          { setting_key: "webhook_retries", setting_value: webhookData.webhook_retries, setting_type: "number" },
        ];
      } else if (activeTab === "seo") {
        settingsToSave = Object.entries(seoData).map(([key, value]) => ({
          setting_key: key,
          setting_value: value,
          setting_type: "text"
        }));
      } else if (activeTab === "integracoes") {
        settingsToSave = Object.entries(integracoesData).map(([key, value]) => ({
          setting_key: key,
          setting_value: value,
          setting_type: key.includes("enabled") ? "boolean" : "text"
        }));
      }

      const success = await saveSettings(settingsToSave);
      
      if (success) {
        toast({
          title: "✅ Configura��ões salvas!",
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

  const testMetaTracking = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      // Primeiro verificar configuração
      const configResponse = await fetch('/api/meta/config');
      const configResult = await configResponse.json();

      if (!configResult.configured) {
        toast({
          title: "⚠️ Configuração incompleta",
          description: "Configure Pixel ID e Access Token antes de testar.",
          variant: "destructive",
        });
        setTesting(false);
        return;
      }

      // Testar evento PageView
      const testResponse = await fetch('/api/meta/test-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: 'PageView',
          custom_data: {
            content_type: 'admin_test',
            content_category: 'configuration_test',
            page_title: 'Admin Test - Meta Tracking',
          }
        })
      });

      const testResult = await testResponse.json();

      if (testResult.success) {
        toast({
          title: "✅ Teste bem-sucedido!",
          description: "Evento enviado para Meta com sucesso.",
        });

        setTestResults({
          success: true,
          configCheck: configResult,
          eventTest: testResult,
        });
      } else {
        throw new Error(testResult.message || 'Falha no teste');
      }

    } catch (error) {
      toast({
        title: "❌ Erro no teste",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });

      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
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
          <p className="text-red-600">Erro ao carregar configurações: {error}</p>
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
                    setWebhookData({ ...webhookData, webhook_url: e.target.value });
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
                    setWebhookData({ ...webhookData, webhook_secret: e.target.value });
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
                      setWebhookData({ ...webhookData, webhook_timeout: e.target.value });
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
                      setWebhookData({ ...webhookData, webhook_retries: e.target.value });
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
                        Testando...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Testar Integração
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
                        setIntegracoesData({...integracoesData, meta_pixel_id: e.target.value});
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
                        setIntegracoesData({...integracoesData, meta_access_token: e.target.value});
                        setHasChanges(true);
                      }}
                      placeholder="EAAxxxx..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_conversion_name">Nome da Conversão</Label>
                    <Input
                      id="meta_conversion_name"
                      value={integracoesData.meta_conversion_name}
                      onChange={(e) => {
                        setIntegracoesData({...integracoesData, meta_conversion_name: e.target.value});
                        setHasChanges(true);
                      }}
                      placeholder="Lead"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_test_code">Código de Teste (Opcional)</Label>
                    <Input
                      id="meta_test_code"
                      value={integracoesData.meta_test_code}
                      onChange={(e) => {
                        setIntegracoesData({...integracoesData, meta_test_code: e.target.value});
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
                        checked={integracoesData.meta_tracking_enabled === "true"}
                        onChange={(e) => {
                          setIntegracoesData({
                            ...integracoesData,
                            meta_tracking_enabled: e.target.checked ? "true" : "false"
                          });
                          setHasChanges(true);
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="meta_tracking_enabled" className="flex items-center cursor-pointer">
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
                            meta_track_pageview: e.target.checked ? "true" : "false"
                          });
                          setHasChanges(true);
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="meta_track_pageview" className="flex items-center cursor-pointer">
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
                            meta_track_scroll: e.target.checked ? "true" : "false"
                          });
                          setHasChanges(true);
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="meta_track_scroll" className="flex items-center cursor-pointer">
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
                            meta_track_time: e.target.checked ? "true" : "false"
                          });
                          setHasChanges(true);
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="meta_track_time" className="flex items-center cursor-pointer">
                        <Clock className="w-4 h-4 mr-1 text-orange-500" />
                        Rastrear Tempo na Página
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 md:col-span-2">
                      <input
                        type="checkbox"
                        id="meta_track_interactions"
                        checked={integracoesData.meta_track_interactions === "true"}
                        onChange={(e) => {
                          setIntegracoesData({
                            ...integracoesData,
                            meta_track_interactions: e.target.checked ? "true" : "false"
                          });
                          setHasChanges(true);
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="meta_track_interactions" className="flex items-center cursor-pointer">
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

                    <div className={`p-3 rounded-lg ${
                      testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      {testResults.success ? (
                        <div className="space-y-2">
                          <p className="text-green-800 font-medium">✅ Integração funcionando corretamente!</p>
                          <p className="text-green-700 text-sm">
                            Eventos estão sendo enviados para o Meta Facebook com sucesso.
                          </p>
                          {testResults.eventTest?.result?.eventsReceived !== undefined && (
                            <p className="text-green-600 text-sm">
                              Eventos recebidos: {testResults.eventTest.result.eventsReceived}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-red-800 font-medium">❌ Erro na integração</p>
                          <p className="text-red-700 text-sm">{testResults.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informações importantes */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">ℹ️ Informações Importantes</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• O rastreamento é feito via Conversions API para máxima precisão</li>
                    <li>• Todos os eventos são enviados automaticamente na landing page</li>
                    <li>• Use o código de teste durante desenvolvimento para não afetar dados reais</li>
                    <li>• Configure eventos personalizados conforme sua estratégia de marketing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Botão de salvar */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={handleSave}
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
