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
} from "lucide-react";

export default function AdminConfiguracoes() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "webhook" | "seo" | "integracoes" | "database"
  >("webhook");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Target className="w-5 h-5 mr-2 text-ecko-red" />
                  Meta Pixel (Facebook/Instagram)
                </h3>
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
                    <Label htmlFor="meta_test_code">Código de Teste</Label>
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
