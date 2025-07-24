import { useState, useEffect } from "react";

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

      // Create fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch("/api/settings/hero", {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
      } else {
        throw new Error(
          result.message || "Erro ao buscar configurações do hero",
        );
      }
    } catch (err) {
      // Silently fall back to defaults without throwing errors to console
      if (err instanceof Error && err.name === "AbortError") {
        console.warn("⚠️ API timeout - usando configurações padrão do hero");
      } else {
        console.warn(
          "⚠️ API indisponível - usando configurações padrão do hero",
        );
      }

      // Set null error to prevent UI error states
      setError(null);

      // Usar configurações padrão em caso de erro
      setSettings({
        title: "SEJA PARCEIRO OFICIAL ECKO E TENHA SUCESSO",
        subtitle:
          "Transforme sua paixão pelo streetwear em um negócio lucrativo",
        description:
          "Junte-se aos milhares de revendedores que já transformaram seus negócios com a marca mais desejada do streetwear brasileiro",
        cta_text: "QUERO SER REVENDEDOR OFICIAL",
        cta_secondary_text: "CONHECER OS BENEFÍCIOS",
        background_image: "",
        background_color: "#000000",
        text_color: "#ffffff",
        cta_color: "#dc2626",
        logo_url: "",
        video_url: "",
        enabled: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  useEffect(() => {
    // Delay the initial fetch to avoid blocking page load
    const timer = setTimeout(() => {
      fetchSettings();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return {
    settings,
    loading,
    error,
    refreshSettings,
  };
}
