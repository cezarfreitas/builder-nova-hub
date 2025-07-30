import { useState, useEffect } from "react";

interface FooterSettings {
  copyright: string;
  social_links: {
    facebook: string;
    instagram: string;
  };
}

export const useFooter = () => {
  const [footer, setFooter] = useState<FooterSettings>({
    copyright: "© 2024 Ecko. Todos os direitos reservados. Seja um revendedor oficial e transforme seu negócio.",
    social_links: {
      facebook: "https://facebook.com/ecko",
      instagram: "https://instagram.com/ecko"
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do footer
  const loadFooter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/footer", {
        headers: {
          "Cache-Control": "no-cache"
        }
      });
      
      if (!response.ok) {
        throw new Error("Erro ao carregar dados do footer");
      }
      
      const data = await response.json();
      setFooter(data);
    } catch (err) {
      console.error("Erro ao carregar footer:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Salvar dados do footer
  const saveFooter = async (footerData: FooterSettings) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/footer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(footerData)
      });
      
      if (!response.ok) {
        throw new Error("Erro ao salvar dados do footer");
      }
      
      const result = await response.json();
      setFooter(footerData);
      
      return { success: true, message: result.message };
    } catch (err) {
      console.error("Erro ao salvar footer:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadFooter();
  }, []);

  return {
    footer,
    loading,
    error,
    saveFooter,
    reload: loadFooter
  };
};
