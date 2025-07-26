import { useState, useEffect, useCallback } from 'react';

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
  saveMultipleSettings: (settingsArray: Array<{key: string, value: any, type?: string}>) => Promise<boolean>;
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

      const response = await fetch('/api/settings');
      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
      } else {
        throw new Error(result.message || 'Erro ao carregar configurações');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSetting = useCallback(async (key: string, value: any, type: string = 'text'): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value, type }),
      });

      const result = await response.json();

      if (result.success) {
        // Atualizar estado local
        setSettings(prev => ({
          ...prev,
          [key]: {
            value,
            type,
            updated_at: new Date().toISOString()
          }
        }));
        return true;
      } else {
        throw new Error(result.message || 'Erro ao salvar configuração');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao salvar configuração:', err);
      return false;
    }
  }, []);

  const saveMultipleSettings = useCallback(async (settingsArray: Array<{key: string, value: any, type?: string}>): Promise<boolean> => {
    try {
      setError(null);
      
      const formattedSettings = settingsArray.map(setting => ({
        setting_key: setting.key,
        setting_value: setting.value,
        setting_type: setting.type || 'text'
      }));

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: formattedSettings }),
      });

      const result = await response.json();

      if (result.success) {
        // Atualizar estado local
        const newSettings = { ...settings };
        settingsArray.forEach(setting => {
          newSettings[setting.key] = {
            value: setting.value,
            type: setting.type || 'text',
            updated_at: new Date().toISOString()
          };
        });
        setSettings(newSettings);
        return true;
      } else {
        throw new Error(result.message || 'Erro ao salvar configurações');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao salvar configurações:', err);
      return false;
    }
  }, [settings]);

  const getSetting = useCallback((key: string): any => {
    return settings[key]?.value || null;
  }, [settings]);

  // Carregar configurações na inicialização
  useEffect(() => {
    refreshSettings();
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
