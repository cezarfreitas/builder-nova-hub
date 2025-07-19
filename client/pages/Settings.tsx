import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Settings as SettingsIcon,
  Webhook,
  Palette,
  Search,
  Globe,
  Save,
  RefreshCw,
  ArrowLeft,
  Eye,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  SEOSettings,
  SEOResponse,
  SEOUpdateResponse,
  ThemeSettings,
  ThemeResponse,
  ThemeUpdateResponse,
} from "@shared/api";

interface WebhookSettings {
  url: string;
  timeout: number;
  retries: number;
  enabled: boolean;
}

interface ThemeFormData {
  primary_color: string;
  primary_light: string;
  primary_dark: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
}

interface SEOFormData {
  page_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
  robots: string;
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCSS, setCopiedCSS] = useState(false);

  // Webhook Settings
  const [webhookSettings, setWebhookSettings] = useState<WebhookSettings>({
    url: "https://webhook.site/your-url",
    timeout: 10000,
    retries: 3,
    enabled: true,
  });

  // Theme Settings
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(
    null,
  );
  const [themeData, setThemeData] = useState<ThemeFormData>({
    primary_color: "#DC2626",
    primary_light: "#F87171",
    primary_dark: "#991B1B",
    secondary_color: "#1F2937",
    background_color: "#000000",
    text_color: "#FFFFFF",
    accent_color: "#EF4444",
  });

  // SEO Settings
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [seoData, setSeoData] = useState<SEOFormData>({
    page_title: "",
    meta_description: "",
    meta_keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    canonical_url: "",
    robots: "index, follow",
  });

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    setLoading(true);
    await Promise.all([
      fetchThemeSettings(),
      fetchSEOSettings(),
      loadWebhookSettings(),
    ]);
    setLoading(false);
  };

  const fetchThemeSettings = async () => {
    try {
      const response = await fetch("/api/theme");
      if (response.ok) {
        const data: ThemeResponse = await response.json();
        setThemeSettings(data.theme);
        setThemeData({
          primary_color: data.theme.primary_color,
          primary_light: data.theme.primary_light,
          primary_dark: data.theme.primary_dark,
          secondary_color: data.theme.secondary_color,
          background_color: data.theme.background_color,
          text_color: data.theme.text_color,
          accent_color: data.theme.accent_color,
        });
      }
    } catch (error) {
      console.error("Error fetching theme settings:", error);
    }
  };

  const fetchSEOSettings = async () => {
    try {
      const response = await fetch("/api/seo");
      if (response.ok) {
        const data: SEOResponse = await response.json();
        setSeoSettings(data.seo);
        setSeoData({
          page_title: data.seo.page_title || "",
          meta_description: data.seo.meta_description || "",
          meta_keywords: data.seo.meta_keywords || "",
          og_title: data.seo.og_title || "",
          og_description: data.seo.og_description || "",
          og_image: data.seo.og_image || "",
          canonical_url: data.seo.canonical_url || "",
          robots: data.seo.robots || "index, follow",
        });
      }
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
    }
  };

  const loadWebhookSettings = () => {
    // Load from localStorage or API if available
    const saved = localStorage.getItem("webhookSettings");
    if (saved) {
      setWebhookSettings(JSON.parse(saved));
    }
  };

  const saveWebhookSettings = () => {
    localStorage.setItem("webhookSettings", JSON.stringify(webhookSettings));
    alert("Configurações de webhook salvas!");
  };

  const saveThemeSettings = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(themeData),
      });

      if (response.ok) {
        const data: ThemeUpdateResponse = await response.json();
        setThemeSettings(data.theme);
        alert("Tema atualizado com sucesso!");

        // Update CSS custom properties
        updateCSSProperties();
      }
    } catch (error) {
      console.error("Error updating theme:", error);
      alert("Erro ao atualizar tema");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveSEOSettings = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seoData),
      });

      if (response.ok) {
        const data: SEOUpdateResponse = await response.json();
        setSeoSettings(data.seo);
        alert("Configurações de SEO atualizadas!");
      }
    } catch (error) {
      console.error("Error updating SEO:", error);
      alert("Erro ao atualizar SEO");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCSSProperties = () => {
    const root = document.documentElement;
    root.style.setProperty("--ecko-red", themeData.primary_color);
    root.style.setProperty("--ecko-red-light", themeData.primary_light);
    root.style.setProperty("--ecko-red-dark", themeData.primary_dark);
    root.style.setProperty("--ecko-secondary", themeData.secondary_color);
    root.style.setProperty("--ecko-background", themeData.background_color);
    root.style.setProperty("--ecko-text", themeData.text_color);
    root.style.setProperty("--ecko-accent", themeData.accent_color);
  };

  const generateCSS = () => {
    return `/* Ecko Theme Colors */
:root {
  --ecko-red: ${themeData.primary_color};
  --ecko-red-light: ${themeData.primary_light};
  --ecko-red-dark: ${themeData.primary_dark};
  --ecko-secondary: ${themeData.secondary_color};
  --ecko-background: ${themeData.background_color};
  --ecko-text: ${themeData.text_color};
  --ecko-accent: ${themeData.accent_color};
}`;
  };

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(generateCSS());
      setCopiedCSS(true);
      setTimeout(() => setCopiedCSS(false), 2000);
    } catch (error) {
      console.error("Error copying CSS:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-1">
              Gerencie as configurações do sistema
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={copyCSS}
            variant="outline"
            className="flex items-center gap-2"
          >
            {copiedCSS ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copiedCSS ? "Copiado!" : "Copiar CSS"}
          </Button>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Ver Site
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>

      <Tabs defaultValue="webhook" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="webhook" className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhook
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Tema
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* Webhook Settings */}
        <TabsContent value="webhook" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-blue-600" />
                Configurações de Webhook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL do Webhook</label>
                <Input
                  value={webhookSettings.url}
                  onChange={(e) =>
                    setWebhookSettings({
                      ...webhookSettings,
                      url: e.target.value,
                    })
                  }
                  placeholder="https://webhook.site/your-url"
                />
                <p className="text-xs text-gray-500">
                  URL onde os dados dos leads serão enviados
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timeout (ms)</label>
                  <Input
                    type="number"
                    value={webhookSettings.timeout}
                    onChange={(e) =>
                      setWebhookSettings({
                        ...webhookSettings,
                        timeout: parseInt(e.target.value) || 10000,
                      })
                    }
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tentativas</label>
                  <Input
                    type="number"
                    value={webhookSettings.retries}
                    onChange={(e) =>
                      setWebhookSettings({
                        ...webhookSettings,
                        retries: parseInt(e.target.value) || 3,
                      })
                    }
                    placeholder="3"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={webhookSettings.enabled}
                  onChange={(e) =>
                    setWebhookSettings({
                      ...webhookSettings,
                      enabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">
                  Webhook habilitado
                </label>
              </div>

              <Button
                onClick={saveWebhookSettings}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Cores do Tema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(themeData).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium capitalize">
                      {key.replace(/_/g, " ")}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={value}
                        onChange={(e) =>
                          setThemeData({
                            ...themeData,
                            [key]: e.target.value,
                          })
                        }
                        className="w-12 h-10 p-1 rounded"
                      />
                      <Input
                        value={value}
                        onChange={(e) =>
                          setThemeData({
                            ...themeData,
                            [key]: e.target.value,
                          })
                        }
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={saveThemeSettings}
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Tema
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-green-600" />
                Configurações de SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Título da Página
                  </label>
                  <Input
                    value={seoData.page_title}
                    onChange={(e) =>
                      setSeoData({ ...seoData, page_title: e.target.value })
                    }
                    placeholder="Título da página"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta Descrição</label>
                  <Textarea
                    value={seoData.meta_description}
                    onChange={(e) =>
                      setSeoData({
                        ...seoData,
                        meta_description: e.target.value,
                      })
                    }
                    placeholder="Descrição da página"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Palavras-chave
                    </label>
                    <Input
                      value={seoData.meta_keywords}
                      onChange={(e) =>
                        setSeoData({
                          ...seoData,
                          meta_keywords: e.target.value,
                        })
                      }
                      placeholder="palavra1, palavra2, palavra3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Robots</label>
                    <Select
                      value={seoData.robots}
                      onValueChange={(value) =>
                        setSeoData({ ...seoData, robots: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="index, follow">
                          Index, Follow
                        </SelectItem>
                        <SelectItem value="noindex, nofollow">
                          No Index, No Follow
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                onClick={saveSEOSettings}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar SEO
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
