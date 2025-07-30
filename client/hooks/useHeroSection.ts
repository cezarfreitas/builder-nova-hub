import { useState, useEffect, useCallback } from "react";
import { robustFetchJson, robustFetch } from "../utils/robustFetch";

// Preload critical hero images
const preloadImage = (url: string) => {
  if (!url || typeof window === "undefined") return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = url;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
};

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
  overlay_gradient_center_color: string;
  overlay_gradient_start_opacity: number;
  overlay_gradient_center_opacity: number;
  overlay_gradient_end_opacity: number;
  overlay_gradient_start_position: number;
  overlay_gradient_center_position: number;
  overlay_gradient_end_position: number;
  logo_url: string;
}

const defaultHeroSettings: HeroSettings = {
  title: "SEJA UM {ecko}REVENDEDOR{/ecko} OFICIAL",
  subtitle: "O maior programa de parceria do streetwear",
  description:
    "Transforme sua paixão por streetwear em um negócio lucrativo. Junte-se a milhares de revendedores que já fazem parte da família {ecko}Ecko{/ecko} e descobra como vender produtos autênticos com margens exclusivas.",
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
  overlay_gradient_enabled: true,
  overlay_gradient_start: "#000000",
  overlay_gradient_end: "#000000",
  overlay_gradient_direction: "radial",
  overlay_gradient_center_color: "#000000",
  overlay_gradient_start_opacity: 80,
  overlay_gradient_center_opacity: 0,
  overlay_gradient_end_opacity: 90,
  overlay_gradient_start_position: 20,
  overlay_gradient_center_position: 50,
  overlay_gradient_end_position: 80,
  logo_url: "",
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

      console.log("🔄 [HERO] Carregando configurações do hero...");

      const data = await robustFetchJson("/api/hero", {
        timeout: 10000,
      });

      console.log("✅ [HERO] Configurações do hero carregadas com sucesso");

      // Preload critical images
      if (data.background_image) {
        preloadImage(data.background_image);
      }
      if (data.logo_url) {
        preloadImage(data.logo_url);
      }

      setHeroSettings(data);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar configurações do hero:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Timeout - Servidor não responde");
        } else if (err.message.includes("fetch")) {
          setError("Erro de conexão");
        } else {
          setError(err.message);
        }
      } else {
        setError("Erro ao carregar");
      }

      setLoading(false);
      setHeroSettings(null);
    }
  }, []);

  // Salvar configurações do hero
  const saveHeroSettings = useCallback(async (settings: HeroSettings) => {
    try {
      setError(null);

      const response = await robustFetch("/api/hero", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
        timeout: 8000,
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar");
      }

      const result = await response.json();

      if (result.success) {
        setHeroSettings(settings);
        return { success: true };
      } else {
        throw new Error("Erro ao salvar");
      }
    } catch (err) {
      console.error("Erro ao salvar configurações do hero:", err);
      setError("Erro ao salvar");
      return {
        success: false,
        error: "Erro ao salvar",
      };
    }
  }, []);

  // Atualizar um campo específico
  const updateField = useCallback(
    (field: keyof HeroSettings, value: any) => {
      if (heroSettings) {
        setHeroSettings((prev) =>
          prev
            ? {
                ...prev,
                [field]: value,
              }
            : null,
        );
      }
    },
    [heroSettings],
  );

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
    reloadHeroSettings: loadHeroSettings,
  };
}
