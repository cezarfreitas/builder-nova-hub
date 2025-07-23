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
      setSettings(null); // Sem fallback - apenas dados salvos no banco
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
