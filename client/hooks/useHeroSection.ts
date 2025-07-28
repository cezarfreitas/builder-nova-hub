import { useState, useEffect, useCallback } from 'react';

export interface HeroSettings {
  title: string;
  subtitle: string;
  description: string;
  background_image: string;
  background_color: string;
  text_color: string;
  cta_primary_text: string;
  cta_secondary_text: string;
  cta_color: string;
  cta_text_color: string;
  overlay_color: string;
  overlay_opacity: number;
  overlay_blend_mode: string;
  overlay_gradient_enabled: boolean;
  overlay_gradient_start: string;
  overlay_gradient_end: string;
  overlay_gradient_direction: string;
  logo_url: string;
}

const defaultHeroSettings: HeroSettings = {
  title: "SEJA UM {ecko}REVENDEDOR{/ecko} OFICIAL",
  subtitle: "O maior programa de parceria do streetwear",
  description: "Transforme sua paixão por streetwear em um negócio lucrativo. Junte-se a milhares de revendedores que já fazem parte da família {ecko}Ecko{/ecko} e descobra como vender produtos autênticos com margens exclusivas.",
  background_image: "",
  background_color: "#000000",
  text_color: "#ffffff",
  cta_primary_text: "QUERO SER {ecko}REVENDEDOR{/ecko}",
  cta_secondary_text: "DESCUBRA {blue}COMO{/blue}",
  cta_color: "#dc2626",
  cta_text_color: "#ffffff",
  overlay_color: "#000000",
  overlay_opacity: 70,
  overlay_blend_mode: "normal",
  overlay_gradient_enabled: false,
  overlay_gradient_start: "#000000",
  overlay_gradient_end: "#333333",
  overlay_gradient_direction: "to bottom",
  logo_url: ""
};

export function useHeroSection() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar configurações do hero apenas da API
  const loadHeroSettings = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch('/api/hero', {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setHeroSettings(data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar configurações do hero:', err);

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Timeout - Servidor não responde');
        } else if (err.message.includes('fetch')) {
          setError('Erro de conexão');
        } else {
          setError(err.message);
        }
      } else {
        setError('Erro ao carregar');
      }

      setLoading(false);
      setHeroSettings(null);
    }
  }, []);

  // Salvar configurações do hero
  const saveHeroSettings = useCallback(async (settings: HeroSettings) => {
    try {
      setError(null);

      const response = await fetch('/api/hero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar');
      }

      const result = await response.json();

      if (result.success) {
        setHeroSettings(settings);
        return { success: true };
      } else {
        throw new Error('Erro ao salvar');
      }
    } catch (err) {
      console.error('Erro ao salvar configurações do hero:', err);
      setError('Erro ao salvar');
      return {
        success: false,
        error: 'Erro ao salvar'
      };
    }
  }, []);

  // Atualizar um campo específico
  const updateField = useCallback((field: keyof HeroSettings, value: any) => {
    if (heroSettings) {
      setHeroSettings(prev => prev ? ({
        ...prev,
        [field]: value
      }) : null);
    }
  }, [heroSettings]);



  // Carregar configurações na inicialização
  useEffect(() => {
    loadHeroSettings();
  }, [loadHeroSettings]);

  return {
    heroSettings,
    loading,
    error,
    saveHeroSettings,
    updateField,
    reloadHeroSettings: loadHeroSettings
  };
}
