import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  Palette,
  RefreshCw,
  Save,
  Eye,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { ThemeSettings, ThemeResponse, ThemeUpdateResponse } from "@shared/api";
import { Link } from "react-router-dom";

interface ThemeFormData {
  primary_color: string;
  primary_light: string;
  primary_dark: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
}

interface ThemePreset {
  name: string;
  primary_color: string;
  primary_light: string;
  primary_dark: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
}

export default function ThemeManagement() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [copiedCSS, setCopiedCSS] = useState(false);
  const [formData, setFormData] = useState<ThemeFormData>({
    primary_color: "#DC2626",
    primary_light: "#F87171",
    primary_dark: "#991B1B",
    secondary_color: "#1F2937",
    background_color: "#000000",
    text_color: "#FFFFFF",
    accent_color: "#EF4444",
  });

  useEffect(() => {
    fetchThemeSettings();
    fetchPresets();
  }, []);

  const fetchThemeSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/theme");
      if (response.ok) {
        const data: ThemeResponse = await response.json();
        setThemeSettings(data.theme);
        setFormData({
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
    } finally {
      setLoading(false);
    }
  };

  const fetchPresets = async () => {
    try {
      const response = await fetch("/api/theme/presets");
      if (response.ok) {
        const data = await response.json();
        setPresets(data.presets || []);
      }
    } catch (error) {
      console.error("Error fetching presets:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/theme", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data: ThemeUpdateResponse = await response.json();
        setThemeSettings(data.theme);
        alert("Tema atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Error updating theme:", error);
      alert("Erro ao atualizar tema");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/theme/reset", {
        method: "POST",
      });

      if (response.ok) {
        await fetchThemeSettings();
        alert("Tema resetado para o padrão!");
      }
    } catch (error) {
      console.error("Error resetting theme:", error);
      alert("Erro ao resetar tema");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePresetSelect = (preset: ThemePreset) => {
    setFormData({
      primary_color: preset.primary_color,
      primary_light: preset.primary_light,
      primary_dark: preset.primary_dark,
      secondary_color: preset.secondary_color,
      background_color: preset.background_color,
      text_color: preset.text_color,
      accent_color: preset.accent_color,
    });
  };

  const handleInputChange = (field: keyof ThemeFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const generateCSS = () => {
    return `/* Ecko Theme Colors */
:root {
  --ecko-red: ${formData.primary_color};
  --ecko-red-light: ${formData.primary_light};
  --ecko-red-dark: ${formData.primary_dark};
  --ecko-secondary: ${formData.secondary_color};
  --ecko-background: ${formData.background_color};
  --ecko-text: ${formData.text_color};
  --ecko-accent: ${formData.accent_color};
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
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Tema</h1>
            <p className="text-gray-600 mt-1">
              Personalize as cores da landing page
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-orange-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Resetar Padrão
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resetar tema</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja resetar o tema para as cores padrão da
                  Ecko? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Resetar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Settings */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Cores Principais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cor Primária</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) =>
                          handleInputChange("primary_color", e.target.value)
                        }
                        className="w-12 h-10 p-1 rounded"
                      />
                      <Input
                        value={formData.primary_color}
                        onChange={(e) =>
                          handleInputChange("primary_color", e.target.value)
                        }
                        placeholder="#DC2626"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Primária Clara
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.primary_light}
                        onChange={(e) =>
                          handleInputChange("primary_light", e.target.value)
                        }
                        className="w-12 h-10 p-1 rounded"
                      />
                      <Input
                        value={formData.primary_light}
                        onChange={(e) =>
                          handleInputChange("primary_light", e.target.value)
                        }
                        placeholder="#F87171"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Primária Escura
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.primary_dark}
                        onChange={(e) =>
                          handleInputChange("primary_dark", e.target.value)
                        }
                        className="w-12 h-10 p-1 rounded"
                      />
                      <Input
                        value={formData.primary_dark}
                        onChange={(e) =>
                          handleInputChange("primary_dark", e.target.value)
                        }
                        placeholder="#991B1B"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Cor Secundária
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) =>
                          handleInputChange("secondary_color", e.target.value)
                        }
                        className="w-12 h-10 p-1 rounded"
                      />
                      <Input
                        value={formData.secondary_color}
                        onChange={(e) =>
                          handleInputChange("secondary_color", e.target.value)
                        }
                        placeholder="#1F2937"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cores de Suporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cor de Fundo</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.background_color}
                        onChange={(e) =>
                          handleInputChange("background_color", e.target.value)
                        }
                        className="w-12 h-10 p-1 rounded"
                      />
                      <Input
                        value={formData.background_color}
                        onChange={(e) =>
                          handleInputChange("background_color", e.target.value)
                        }
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cor do Texto</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.text_color}
                        onChange={(e) =>
                          handleInputChange("text_color", e.target.value)
                        }
                        className="w-12 h-10 p-1 rounded"
                      />
                      <Input
                        value={formData.text_color}
                        onChange={(e) =>
                          handleInputChange("text_color", e.target.value)
                        }
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Cor de Destaque
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.accent_color}
                        onChange={(e) =>
                          handleInputChange("accent_color", e.target.value)
                        }
                        className="w-12 h-10 p-1 rounded"
                      />
                      <Input
                        value={formData.accent_color}
                        onChange={(e) =>
                          handleInputChange("accent_color", e.target.value)
                        }
                        placeholder="#EF4444"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Tema
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Preview and Presets */}
        <div className="space-y-6">
          {/* Color Palette Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Preview das Cores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div
                    className="w-full h-12 rounded mb-2"
                    style={{ backgroundColor: formData.primary_color }}
                  ></div>
                  <p className="text-xs text-gray-600">Primária</p>
                </div>
                <div className="text-center">
                  <div
                    className="w-full h-12 rounded mb-2"
                    style={{ backgroundColor: formData.primary_light }}
                  ></div>
                  <p className="text-xs text-gray-600">Clara</p>
                </div>
                <div className="text-center">
                  <div
                    className="w-full h-12 rounded mb-2"
                    style={{ backgroundColor: formData.primary_dark }}
                  ></div>
                  <p className="text-xs text-gray-600">Escura</p>
                </div>
                <div className="text-center">
                  <div
                    className="w-full h-12 rounded mb-2"
                    style={{ backgroundColor: formData.secondary_color }}
                  ></div>
                  <p className="text-xs text-gray-600">Secundária</p>
                </div>
                <div className="text-center">
                  <div
                    className="w-full h-12 rounded mb-2"
                    style={{ backgroundColor: formData.accent_color }}
                  ></div>
                  <p className="text-xs text-gray-600">Destaque</p>
                </div>
                <div className="text-center">
                  <div
                    className="w-full h-12 rounded mb-2 border"
                    style={{ backgroundColor: formData.background_color }}
                  ></div>
                  <p className="text-xs text-gray-600">Fundo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Temas Prontos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {presets.map((preset, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handlePresetSelect(preset)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{preset.name}</h4>
                      <div className="flex gap-1 mt-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.primary_color }}
                        ></div>
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.primary_light }}
                        ></div>
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.primary_dark }}
                        ></div>
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.accent_color }}
                        ></div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Aplicar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* CSS Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Variáveis CSS</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                {generateCSS()}
              </pre>
            </CardContent>
          </Card>

          {/* Current Settings Info */}
          {themeSettings && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações Atuais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <strong>Última Atualização:</strong>{" "}
                    {new Date(themeSettings.updated_at!).toLocaleString(
                      "pt-BR",
                    )}
                  </div>
                  <div>
                    <strong>Status:</strong>{" "}
                    <Badge
                      variant={
                        themeSettings.is_active ? "default" : "secondary"
                      }
                      className={
                        themeSettings.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {themeSettings.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
