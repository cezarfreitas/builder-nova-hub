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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
  Search,
  Globe,
  Image,
  RefreshCw,
  Save,
  Eye,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { SEOSettings, SEOResponse, SEOUpdateResponse } from "@shared/api";
import { Link } from "react-router-dom";

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

export default function SEOManagement() {
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SEOFormData>({
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
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/seo");
      if (response.ok) {
        const data: SEOResponse = await response.json();
        setSeoSettings(data.seo);
        setFormData({
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/seo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data: SEOUpdateResponse = await response.json();
        setSeoSettings(data.seo);
        alert("Configurações de SEO atualizadas com sucesso!");
      }
    } catch (error) {
      console.error("Error updating SEO settings:", error);
      alert("Erro ao atualizar configurações de SEO");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/seo/reset", {
        method: "POST",
      });

      if (response.ok) {
        await fetchSEOSettings();
        alert("Configurações de SEO resetadas para o padrão!");
      }
    } catch (error) {
      console.error("Error resetting SEO settings:", error);
      alert("Erro ao resetar configurações de SEO");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SEOFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const getPreviewUrl = () => {
    return window.location.origin;
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
            <h1 className="text-3xl font-bold text-gray-900">
              Configurações de SEO
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie as configurações de SEO da landing page
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={getPreviewUrl}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Visualizar Site
            <ExternalLink className="w-4 h-4" />
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
                <AlertDialogTitle>
                  Resetar configurações de SEO
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja resetar todas as configurações de SEO
                  para os valores padrão? Esta ação não pode ser desfeita.
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              SEO Básico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título da Página *</label>
              <Input
                value={formData.page_title}
                onChange={(e) =>
                  handleInputChange("page_title", e.target.value)
                }
                placeholder="Ex: Ecko - Programa de Revendedores | Seja um Parceiro Oficial"
                required
              />
              <p className="text-xs text-gray-500">
                Recomendado: 50-60 caracteres ({formData.page_title.length}
                /60)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Descrição</label>
              <Textarea
                value={formData.meta_description}
                onChange={(e) =>
                  handleInputChange("meta_description", e.target.value)
                }
                placeholder="Descrição breve e atrativa da página"
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Recomendado: 150-160 caracteres (
                {formData.meta_description.length}/160)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Palavras-chave</label>
              <Input
                value={formData.meta_keywords}
                onChange={(e) =>
                  handleInputChange("meta_keywords", e.target.value)
                }
                placeholder="ecko, revendedor, streetwear, moda urbana"
              />
              <p className="text-xs text-gray-500">
                Separe as palavras-chave por vírgulas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Canônica</label>
                <Input
                  value={formData.canonical_url}
                  onChange={(e) =>
                    handleInputChange("canonical_url", e.target.value)
                  }
                  placeholder="https://seudominio.com/"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Robots</label>
                <Select
                  value={formData.robots}
                  onValueChange={(value) => handleInputChange("robots", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index, follow">Index, Follow</SelectItem>
                    <SelectItem value="noindex, nofollow">
                      No Index, No Follow
                    </SelectItem>
                    <SelectItem value="index, nofollow">
                      Index, No Follow
                    </SelectItem>
                    <SelectItem value="noindex, follow">
                      No Index, Follow
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              Open Graph (Redes Sociais)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título OG</label>
              <Input
                value={formData.og_title}
                onChange={(e) => handleInputChange("og_title", e.target.value)}
                placeholder="Título para redes sociais"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição OG</label>
              <Textarea
                value={formData.og_description}
                onChange={(e) =>
                  handleInputChange("og_description", e.target.value)
                }
                placeholder="Descrição para redes sociais"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Imagem OG</label>
              <Input
                value={formData.og_image}
                onChange={(e) => handleInputChange("og_image", e.target.value)}
                placeholder="https://exemplo.com/imagem-og.jpg"
              />
              <p className="text-xs text-gray-500">
                Recomendado: 1200x630 pixels, formato JPG ou PNG
              </p>
              {formData.og_image && (
                <div className="mt-2">
                  <img
                    src={formData.og_image}
                    alt="Preview OG"
                    className="w-48 h-24 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Preview Google
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-1">
                <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {formData.page_title || "Título da página"}
                </div>
                <div className="text-green-700 text-sm">
                  {formData.canonical_url || "https://seudominio.com/"}
                </div>
                <div className="text-gray-600 text-sm">
                  {formData.meta_description ||
                    "Descrição da página aparecerá aqui..."}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Settings Info */}
        {seoSettings && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações Atuais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Última Atualização:</strong>{" "}
                  {new Date(seoSettings.updated_at!).toLocaleString("pt-BR")}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <Badge
                    variant={seoSettings.is_active ? "default" : "secondary"}
                    className={
                      seoSettings.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {seoSettings.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
