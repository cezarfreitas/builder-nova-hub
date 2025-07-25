import { useState, useEffect, useCallback } from "react";

export interface Settings {
  [key: string]: {
    value: any;
    type: string;
    updated_at: string;
  };
}

interface UseSettingsReturn {
  settings: Settings;
  loading: boolean;
  error: string | null;
  saveSetting: (key: string, value: any, type?: string) => Promise<boolean>;
  saveMultipleSettings: (
    settingsArray: Array<{ key: string; value: any; type?: string }>,
  ) => Promise<boolean>;
  getSetting: (key: string) => any;
  refreshSettings: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Create fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced to 3 seconds

      let response;
      try {
        response = await fetch("/api/settings", {
          signal: controller.signal,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw new Error(`Network error: ${fetchError.message}`);
      }

      clearTimeout(timeoutId);

      if (!response) {
        throw new Error("No response received from server");
      }

      if (response.status === 500) {
        // Banco não disponível, usar configurações padrão
        console.warn("⚠️ Banco não disponível, usando configurações padrão");
        setSettings({
          site_domain: {
            value: "https://b2b.eckoshop.com.br",
            type: "text",
            updated_at: new Date().toISOString(),
          },
          seo_title: {
            value:
              "Seja uma Revenda Autorizada da Ecko | Tenha os Melhores Produtos",
            type: "text",
            updated_at: new Date().toISOString(),
          },
          seo_description: {
            value:
              "Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja. Transforme sua paixão em lucro com exclusividade territorial e suporte completo.",
            type: "text",
            updated_at: new Date().toISOString(),
          },
          seo_keywords: {
            value:
              "revenda autorizada ecko, melhores produtos streetwear, lojista autorizado",
            type: "text",
            updated_at: new Date().toISOString(),
          },
          seo_canonical_url: {
            value: "https://b2b.eckoshop.com.br/",
            type: "text",
            updated_at: new Date().toISOString(),
          },
          og_image: {
            value: "https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png",
            type: "text",
            updated_at: new Date().toISOString(),
          },
          og_title: {
            value: "Seja uma Revenda Autorizada da Ecko",
            type: "text",
            updated_at: new Date().toISOString(),
          },
          og_description: {
            value:
              "Transforme sua paixão em lucro! Seja um revendedor autorizado Ecko e tenha acesso aos melhores produtos de streetwear do mercado.",
            type: "text",
            updated_at: new Date().toISOString(),
          },
          og_site_name: {
            value: "Ecko Revendedores",
            type: "text",
            updated_at: new Date().toISOString(),
          },
          webhook_url: {
            value: "",
            type: "text",
            updated_at: new Date().toISOString(),
          },
          webhook_secret: {
            value: "",
            type: "text",
            updated_at: new Date().toISOString(),
          },
        });
        // Don't set error to prevent UI error states
        setError(null);
        return;
      }

      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
      } else {
        throw new Error(result.message || "Erro ao carregar configurações");
      }
    } catch (err) {
      // Silently fall back to defaults
      if (err instanceof Error && err.name === "AbortError") {
        console.warn("⚠️ API timeout - usando configurações padrão");
      } else {
        console.warn("⚠️ API indisponível - usando configurações padrão");
      }

      // Don't set error to prevent UI error states
      setError(null);

      // Usar configurações padrão em caso de erro
      setSettings({
        site_domain: {
          value: "https://b2b.eckoshop.com.br",
          type: "text",
          updated_at: new Date().toISOString(),
        },
        seo_title: {
          value:
            "Seja uma Revenda Autorizada da Ecko | Tenha os Melhores Produtos",
          type: "text",
          updated_at: new Date().toISOString(),
        },
        seo_description: {
          value:
            "Seja uma revenda autorizada da Ecko e tenha os melhores produtos de streetwear em sua loja. Transforme sua paixão em lucro com exclusividade territorial e suporte completo.",
          type: "text",
          updated_at: new Date().toISOString(),
        },
        seo_keywords: {
          value:
            "revenda autorizada ecko, melhores produtos streetwear, lojista autorizado",
          type: "text",
          updated_at: new Date().toISOString(),
        },
        seo_canonical_url: {
          value: "https://b2b.eckoshop.com.br/",
          type: "text",
          updated_at: new Date().toISOString(),
        },
        og_image: {
          value: "https://estyle.vteximg.com.br/arquivos/ecko_mosaic5.png",
          type: "text",
          updated_at: new Date().toISOString(),
        },
        og_title: {
          value: "Seja uma Revenda Autorizada da Ecko",
          type: "text",
          updated_at: new Date().toISOString(),
        },
        og_description: {
          value:
            "Transforme sua paixão em lucro! Seja um revendedor autorizado Ecko e tenha acesso aos melhores produtos de streetwear do mercado.",
          type: "text",
          updated_at: new Date().toISOString(),
        },
        og_site_name: {
          value: "Ecko Revendedores",
          type: "text",
          updated_at: new Date().toISOString(),
        },
        webhook_url: {
          value: "",
          type: "text",
          updated_at: new Date().toISOString(),
        },
        webhook_secret: {
          value: "",
          type: "text",
          updated_at: new Date().toISOString(),
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSetting = useCallback(
    async (
      key: string,
      value: any,
      type: string = "text",
    ): Promise<boolean> => {
      try {
        setError(null);

        let response;
        try {
          response = await fetch(`/api/settings/${key}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ value, type }),
            timeout: 10000, // 10 second timeout
          });
        } catch (fetchError) {
          console.error("Network error saving setting:", fetchError);
          throw new Error(`Erro de rede: ${fetchError.message}`);
        }

        if (!response) {
          throw new Error("Nenhuma resposta recebida do servidor");
        }

        const result = await response.json();

        if (result.success) {
          // Atualizar estado local
          setSettings((prev) => ({
            ...prev,
            [key]: {
              value,
              type,
              updated_at: new Date().toISOString(),
            },
          }));
          return true;
        } else {
          throw new Error(result.message || "Erro ao salvar configuração");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        console.error("Erro ao salvar configuração:", err);
        return false;
      }
    },
    [],
  );

  const saveMultipleSettings = useCallback(
    async (
      settingsArray: Array<{ key: string; value: any; type?: string }>,
    ): Promise<boolean> => {
      try {
        setError(null);

        const formattedSettings = settingsArray.map((setting) => ({
          setting_key: setting.key,
          setting_value: setting.value,
          setting_type: setting.type || "text",
        }));

        let response;
        try {
          response = await fetch("/api/settings", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ settings: formattedSettings }),
            timeout: 10000, // 10 second timeout
          });
        } catch (fetchError) {
          console.error("Network error saving settings:", fetchError);
          throw new Error(`Erro de rede: ${fetchError.message}`);
        }

        if (!response) {
          throw new Error("Nenhuma resposta recebida do servidor");
        }

        const result = await response.json();

        if (result.success) {
          // Atualizar estado local
          const newSettings = { ...settings };
          settingsArray.forEach((setting) => {
            newSettings[setting.key] = {
              value: setting.value,
              type: setting.type || "text",
              updated_at: new Date().toISOString(),
            };
          });
          setSettings(newSettings);
          return true;
        } else {
          throw new Error(result.message || "Erro ao salvar configurações");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        console.error("Erro ao salvar configurações:", err);
        return false;
      }
    },
    [settings],
  );

  const getSetting = useCallback(
    (key: string): any => {
      return settings[key]?.value || null;
    },
    [settings],
  );

  // Carregar configurações na inicialização
  useEffect(() => {
    // Delay the initial fetch to avoid blocking page load
    const timer = setTimeout(() => {
      refreshSettings();
    }, 200);

    return () => clearTimeout(timer);
  }, [refreshSettings]);

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
