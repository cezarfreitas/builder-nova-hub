import { useState, useEffect, useCallback } from 'react';

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
  saveSettings: (settingsArray: Array<{setting_key: string, setting_value: string, setting_type: string}>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/settings');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data || {});
      } else {
        throw new Error(result.message || "Erro ao carregar configurações");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao carregar configurações:', err);
      setError(errorMessage);
      
      // Em caso de erro, usar configurações padrão vazias para não quebrar a interface
      setSettings({});
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSetting = useCallback(async (key: string, value: any, type: string = 'text'): Promise<boolean> => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: [{
            setting_key: key,
            setting_value: String(value),
            setting_type: type
          }]
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Atualizar o estado local
        setSettings(prev => ({
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
        console.error('Erro ao salvar configuração:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      return false;
    }
  }, []);

  const saveSettings = useCallback(async (settingsArray: Array<{setting_key: string, setting_value: string, setting_type: string}>): Promise<boolean> => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: settingsArray
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Atualizar o estado local com todas as configurações salvas
        setSettings(prev => {
          const updated = { ...prev };
          settingsArray.forEach(setting => {
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
        console.error('Erro ao salvar configurações:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      return false;
    }
  }, []);

  const getSetting = useCallback((key: string): string => {
    return settings[key]?.setting_value || '';
  }, [settings]);

  // Buscar configurações na inicialização
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

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
