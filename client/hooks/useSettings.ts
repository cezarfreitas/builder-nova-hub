import { useState, useEffect, useCallback } from "react";
import { robustFetchJson, robustFetch } from "../utils/robustFetch";

interface SettingItem {
  setting_key: string;
  setting_value: string;
  setting_type: string;
  updated_at: string;
}

interface SettingsData {
  [key: string]: SettingItem;
}

interface UseSettingsResult {
  settings: SettingsData;
  loading: boolean;
  error: string | null;
  getSetting: (key: string) => string;
  saveSetting: (key: string, value: any, type?: string) => Promise<boolean>;
  saveSettings: (
    settingsArray: Array<{
      setting_key: string;
      setting_value: string;
      setting_type: string;
    }>,
  ) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchSettings = useCallback(async () => {
    // Cache por 5 minutos
    const now = Date.now();
    if (now - lastFetch < 300000 && Object.keys(settings).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔄 [SETTINGS] Carregando configurações...");

      const result = await robustFetchJson("/api/settings", {
        timeout: 8000,
      });

      if (result.success) {
        console.log("✅ [SETTINGS] Configurações carregadas com sucesso");
        setSettings(result.data || {});
        setLastFetch(now);
      } else {
        throw new Error(result.message || "Erro ao carregar configurações");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      console.error("❌ Erro ao carregar configurações:", err);
      setError(errorMessage);

      // Em caso de erro, usar configurações padrão vazias para não quebrar a interface
      setSettings({});
    } finally {
      setLoading(false);
    }
  }, [lastFetch, settings]);

  const saveSetting = useCallback(
    async (
      key: string,
      value: any,
      type: string = "text",
    ): Promise<boolean> => {
      try {
        const response = await robustFetch("/api/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            settings: [
              {
                setting_key: key,
                setting_value: String(value),
                setting_type: type,
              },
            ],
          }),
          timeout: 8000,
        });

        const result = await response.json();

        if (result.success) {
          // Atualizar o estado local
          setSettings((prev) => ({
            ...prev,
            [key]: {
              setting_key: key,
              setting_value: String(value),
              setting_type: type,
              updated_at: new Date().toISOString(),
            },
          }));
          return true;
        } else {
          console.error("Erro ao salvar configuração:", result.message);
          return false;
        }
      } catch (error) {
        console.error("Erro ao salvar configuração:", error);
        return false;
      }
    },
    [],
  );

  const saveSettings = useCallback(
    async (
      settingsArray: Array<{
        setting_key: string;
        setting_value: string;
        setting_type: string;
      }>,
    ): Promise<boolean> => {
      try {
        const response = await fetch("/api/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            settings: settingsArray,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Atualizar o estado local com todas as configurações salvas
          setSettings((prev) => {
            const updated = { ...prev };
            settingsArray.forEach((setting) => {
              updated[setting.setting_key] = {
                setting_key: setting.setting_key,
                setting_value: setting.setting_value,
                setting_type: setting.setting_type,
                updated_at: new Date().toISOString(),
              };
            });
            return updated;
          });
          return true;
        } else {
          console.error("Erro ao salvar configurações:", result.message);
          return false;
        }
      } catch (error) {
        console.error("Erro ao salvar configurações:", error);
        return false;
      }
    },
    [],
  );

  const getSetting = useCallback(
    (key: string): string => {
      return settings[key]?.setting_value || "";
    },
    [settings],
  );

  // Buscar configurações na inicialização
  useEffect(() => {
    if (Object.keys(settings).length === 0) {
      fetchSettings();
    }
  }, []);

  return {
    settings,
    loading,
    error,
    getSetting,
    saveSetting,
    saveSettings,
    refetch: fetchSettings,
  };
}
