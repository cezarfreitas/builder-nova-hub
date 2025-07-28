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
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(defaultHeroSettings);
  const [loading, setLoading] = useState(false); // Começar sem loading para mostrar padrões imediatamente
  const [error, setError] = useState<string | null>(null);

  // Carregar configurações do hero de forma otimizada
  const loadHeroSettings = useCallback(async () => {
    try {
      // Não definir loading como true para evitar flickering
      setError(null);

      const response = await fetch('/api/hero', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar configurações: ${response.status}`);
      }

      const data = await response.json();

      // Garantir que todas as propriedades necessárias existam
      const completeSettings = {
        ...defaultHeroSettings,
        ...data
      };

      // Sempre atualizar com os dados da API
      setHeroSettings(completeSettings);

      // Atualizar cache local
      try {
        localStorage.setItem('hero_settings_cache', JSON.stringify({
          data: completeSettings,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Erro ao salvar cache:', e);
      }
    } catch (err) {
      console.error('Erro ao carregar configurações do hero:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');

      // Garantir que sempre temos configurações válidas
      setHeroSettings(prev => ({
        ...defaultHeroSettings,
        ...prev // Manter qualquer configuração que já existia
      }));
    }
  }, []); // Remover heroSettings da dependência para evitar loop

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
        throw new Error(`Erro ao salvar configurações: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setHeroSettings(settings);
        return { success: true };
      } else {
        throw new Error(result.error || 'Erro ao salvar configurações');
      }
    } catch (err) {
      console.error('Erro ao salvar configurações do hero:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao salvar';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, []);

  // Atualizar um campo específico
  const updateField = useCallback((field: keyof HeroSettings, value: any) => {
    setHeroSettings(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Resetar para configurações padrão
  const resetToDefaults = useCallback(() => {
    setHeroSettings(defaultHeroSettings);
  }, []);

  // Carregar configurações na inicialização
  useEffect(() => {
    let isMounted = true;

    const initializeHeroSettings = async () => {
      // Tentar carregar cache local primeiro
      try {
        const cached = localStorage.getItem('hero_settings_cache');
        if (cached) {
          const cachedData = JSON.parse(cached);
          const cacheTime = cachedData.timestamp;
          const now = Date.now();

          // Cache válido por 5 minutos
          if (now - cacheTime < 5 * 60 * 1000) {
            if (isMounted) {
              setHeroSettings({
                ...defaultHeroSettings,
                ...cachedData.data
              });
            }
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar cache:', e);
      }

      // Carregar dados da API
      if (isMounted) {
        await loadHeroSettings();
      }
    };

    initializeHeroSettings();

    return () => {
      isMounted = false;
    };
  }, []); // Array vazia para executar apenas uma vez

  return {
    heroSettings,
    loading,
    error,
    saveHeroSettings,
    updateField,
    resetToDefaults,
    reloadHeroSettings: loadHeroSettings
  };
}
