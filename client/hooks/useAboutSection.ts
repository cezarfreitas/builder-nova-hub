import { useState, useEffect } from "react";
import { useToast } from "./use-toast";

interface AboutSettings {
  section_tag: string;
  section_title: string;
  section_subtitle: string;
  section_description: string;
  content: string;
  stats: {
    id: number;
    number: string;
    label: string;
    description: string;
  }[];
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
  background_type: string;
  background_color: string;
  background_image: string;
  overlay_enabled: boolean;
  overlay_color: string;
  overlay_opacity: number;
  overlay_blend_mode: string;
  overlay_gradient_enabled: boolean;
  overlay_gradient_start: string;
  overlay_gradient_end: string;
  overlay_gradient_direction: string;
}

export function useAboutSection() {
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Carregar dados da seção About
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/content/about");
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        // Se não encontrar, usar dados padrão
        const defaultSettings: AboutSettings = {
          section_tag: "Nossa História",
          section_title: "SOBRE A {ecko}ECKO{/ecko}",
          section_subtitle: "mais de 20 anos de streetwear",
          section_description: "Conheça a trajetória de uma das marcas mais influentes do streetwear mundial",
          content: "Fundada em 1993 por Marc Milecofsky, a {ecko}Ecko{/ecko} nasceu com o propósito de dar voz à cultura urbana e ao streetwear autêntico.",
          stats: [
            {
              id: 1,
              number: "30+",
              label: "Anos de História",
              description: "Mais de três décadas construindo a cultura streetwear"
            },
            {
              id: 2,
              number: "50+",
              label: "Países",
              description: "Presença global com produtos em todos os continentes"
            },
            {
              id: 3,
              number: "1000+",
              label: "Lojas Parceiras",
              description: "Rede de revendedores oficiais no Brasil"
            },
            {
              id: 4,
              number: "100M+",
              label: "Produtos Vendidos",
              description: "Milhões de peças que marcaram gerações"
            }
          ],
          cta_title: "Faça Parte Desta {ecko}História{/ecko}",
          cta_description: "Torne-se um revendedor oficial e ajude a escrever o próximo capítulo da Ecko",
          cta_button_text: "QUERO SER PARTE DA {ecko}ECKO{/ecko}",
          background_type: "color",
          background_color: "#ffffff",
          background_image: "",
          overlay_enabled: false,
          overlay_color: "#000000",
          overlay_opacity: 50,
          overlay_blend_mode: "normal",
          overlay_gradient_enabled: false,
          overlay_gradient_start: "#000000",
          overlay_gradient_end: "#333333",
          overlay_gradient_direction: "to bottom"
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações About:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as configurações da seção About.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Salvar dados da seção About
  const saveSettings = async (newSettings: AboutSettings) => {
    try {
      setSaving(true);

      const response = await fetch("/api/content/about", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        const result = await response.json();
        setSettings(newSettings);
        
        toast({
          title: "Seção About atualizada!",
          description: "As configurações foram salvas com sucesso.",
        });

        return { success: true };
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar seção About:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    saveSettings,
    setSettings,
  };
}
