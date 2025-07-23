import { useState, useEffect } from 'react';

export interface HeroSettings {
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  cta_secondary_text: string;
  background_image: string;
  background_color: string;
  text_color: string;
  cta_color: string;
  logo_url: string;
  video_url: string;
  enabled: boolean;
}

interface UseHeroSettingsReturn {
  settings: HeroSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

export function useHeroSettings(): UseHeroSettingsReturn {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings/hero');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
      } else {
        throw new Error(result.message || 'Erro ao buscar configurações do hero');
      }
    } catch (err) {
      console.error('Erro ao buscar configurações do hero:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Fallback para configurações padrão em caso de erro
      setSettings({
        title: "Torne-se um Revendedor Ecko",
        subtitle: "Oportunidade única de negócio",
        description: "Junte-se à rede de revendedores Ecko e maximize seus lucros com produtos de alta qualidade e suporte completo.",
        cta_text: "Quero ser Revendedor",
        cta_secondary_text: "Saiba Mais",
        background_image: "",
        background_color: "#dc2626",
        text_color: "#ffffff",
        cta_color: "#ffffff",
        logo_url: "",
        video_url: "",
        enabled: true
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refreshSettings
  };
}
