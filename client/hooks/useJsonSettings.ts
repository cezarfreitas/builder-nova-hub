import { useState, useEffect, useCallback } from "react";
import { useContent } from "./useContent";

export interface JsonSettings {
  general: {
    site_domain: string;
    favicon_url: string;
  };
  seo: {
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    seo_canonical_url: string;
    seo_robots: string;
    og_title: string;
    og_description: string;
    og_image: string;
    og_type: string;
    og_url: string;
    og_site_name: string;
    twitter_card: string;
    twitter_title: string;
    twitter_description: string;
    twitter_image: string;
    schema_company_name: string;
    schema_company_logo: string;
    schema_contact_phone: string;
    schema_contact_email: string;
    schema_address_street: string;
    schema_address_city: string;
    schema_address_state: string;
    schema_address_postal: string;
    schema_address_country: string;
  };
  webhook: {
    webhook_url: string;
    webhook_secret: string;
    webhook_timeout: string;
    webhook_retries: string;
  };
  analytics: {
    ga4_measurement_id: string;
    ga4_api_secret: string;
    gtag_config: string;
    facebook_pixel_id: string;
    facebook_access_token: string;
    facebook_test_event_code: string;
    conversions_api_enabled: string;
    lead_event_name: string;
    conversion_value: string;
  };
}

interface UseJsonSettingsReturn {
  settings: JsonSettings;
  loading: boolean;
  error: string | null;
  saveSetting: (category: keyof JsonSettings, key: string, value: any) => Promise<boolean>;
  saveMultipleSettings: (
    settingsArray: Array<{ category: keyof JsonSettings; key: string; value: any }>
  ) => Promise<boolean>;
  getSetting: (category: keyof JsonSettings, key: string) => any;
  refreshSettings: () => Promise<void>;
}

export function useJsonSettings(): UseJsonSettingsReturn {
  const { content, loading: contentLoading, saveContent } = useContent();
  const [settings, setSettings] = useState<JsonSettings>(content.settings || getDefaultSettings());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configurações padrão
  function getDefaultSettings(): JsonSettings {
    return {
      general: {
        site_domain: "https://b2b.eckoshop.com.br",
        favicon_url: "",
      },
      seo: {
        seo_title: "Seja uma Revenda Autorizada da Ecko | Tenha os Melhores Produtos",
        seo_description: "Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja. Transforme sua paixão em lucro com exclusividade territorial e suporte completo.",
        seo_keywords: "revenda autorizada ecko, melhores produtos streetwear, lojista autorizado",
        seo_canonical_url: "https://b2b.eckoshop.com.br/",
        seo_robots: "index,follow",
        og_title: "Seja uma Revenda Autorizada da Ecko",
        og_description: "Transforme sua paixão em lucro! Seja um revendedor autorizado Ecko e tenha acesso aos melhores produtos de streetwear do mercado.",
        og_image: "https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png",
        og_type: "website",
        og_url: "https://b2b.eckoshop.com.br/",
        og_site_name: "Ecko Revendedores",
        twitter_card: "summary_large_image",
        twitter_title: "",
        twitter_description: "",
        twitter_image: "",
        schema_company_name: "",
        schema_company_logo: "",
        schema_contact_phone: "",
        schema_contact_email: "",
        schema_address_street: "",
        schema_address_city: "",
        schema_address_state: "",
        schema_address_postal: "",
        schema_address_country: "",
      },
      webhook: {
        webhook_url: "",
        webhook_secret: "",
        webhook_timeout: "30",
        webhook_retries: "3",
      },
      analytics: {
        ga4_measurement_id: "",
        ga4_api_secret: "",
        gtag_config: "",
        facebook_pixel_id: "",
        facebook_access_token: "",
        facebook_test_event_code: "",
        conversions_api_enabled: "false",
        lead_event_name: "Lead",
        conversion_value: "0",
      },
    };
  }

  // Sincronizar com o conteúdo quando carregado
  useEffect(() => {
    if (content.settings) {
      setSettings({
        ...getDefaultSettings(),
        ...content.settings,
      });
    }
    setLoading(contentLoading);
  }, [content.settings, contentLoading]);

  const refreshSettings = useCallback(async () => {
    // As configurações são carregadas automaticamente via useContent
    setError(null);
  }, []);

  const saveSetting = useCallback(
    async (category: keyof JsonSettings, key: string, value: any): Promise<boolean> => {
      try {
        setError(null);

        const newSettings = {
          ...settings,
          [category]: {
            ...settings[category],
            [key]: value,
          },
        };

        setSettings(newSettings);

        const updatedContent = {
          ...content,
          settings: newSettings,
        };

        const result = await saveContent(updatedContent);

        if (result.success) {
          return true;
        } else {
          throw new Error(result.message || "Erro ao salvar configuração");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        console.error("Erro ao salvar configuração:", err);
        return false;
      }
    },
    [settings, content, saveContent]
  );

  const saveMultipleSettings = useCallback(
    async (
      settingsArray: Array<{ category: keyof JsonSettings; key: string; value: any }>
    ): Promise<boolean> => {
      try {
        setError(null);

        let newSettings = { ...settings };

        // Aplicar todas as mudanças
        settingsArray.forEach(({ category, key, value }) => {
          newSettings = {
            ...newSettings,
            [category]: {
              ...newSettings[category],
              [key]: value,
            },
          };
        });

        setSettings(newSettings);

        const updatedContent = {
          ...content,
          settings: newSettings,
        };

        const result = await saveContent(updatedContent);

        if (result.success) {
          return true;
        } else {
          throw new Error(result.message || "Erro ao salvar configurações");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        console.error("Erro ao salvar configurações:", err);
        return false;
      }
    },
    [settings, content, saveContent]
  );

  const getSetting = useCallback(
    (category: keyof JsonSettings, key: string): any => {
      return settings[category]?.[key as keyof typeof settings[typeof category]] || "";
    },
    [settings]
  );

  return {
    settings,
    loading,
    error,
    saveSetting,
    saveMultipleSettings,
    getSetting,
    refreshSettings,
  };
}
