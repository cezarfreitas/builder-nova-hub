import { useState, useEffect } from "react";

interface BenefitCard {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface BenefitsSettings {
  section_tag: string;
  section_title: string;
  section_subtitle: string;
  section_description: string;
  cards: BenefitCard[];
  cta_title: string;
  cta_button_text: string;
}

export const useBenefits = () => {
  const [benefits, setBenefits] = useState<BenefitsSettings>({
    section_tag: "Por que escolher a Ecko?",
    section_title: "VANTAGENS EXCLUSIVAS",
    section_subtitle: "para nossos parceiros",
    section_description: "Descubra os benefícios únicos que fazem da Ecko a escolha certa para impulsionar seu negócio no mundo da moda streetwear",
    cards: [
      {
        id: 1,
        title: "MARCA INTERNACIONAL",
        description: "A Ecko é uma marca reconhecida mundialmente com forte presença no Brasil e grande apelo junto ao público jovem.",
        icon: "Globe"
      },
      {
        id: 2,
        title: "PRONTA ENTREGA",
        description: "Disponibilizamos mais de 100.000 produtos prontos para entrega, para impulsionar suas vendas.",
        icon: "Truck"
      },
      {
        id: 3,
        title: "SUPORTE AO LOJISTA",
        description: "Nossa equipe de especialistas está sempre à disposição para garantir que você tenha a melhor experiência.",
        icon: "HeadphonesIcon"
      },
      {
        id: 4,
        title: "TOTALMENTE ONLINE",
        description: "Oferecemos uma plataforma exclusiva de compras online, com preços de atacado e condições exclusivos.",
        icon: "Monitor"
      }
    ],
    cta_title: "Junte-se a milhares de parceiros que já confiam na Ecko",
    cta_button_text: "QUERO FAZER PARTE AGORA"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do benefits
  const loadBenefits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/benefits", {
        headers: {
          "Cache-Control": "no-cache"
        }
      });
      
      if (!response.ok) {
        throw new Error("Erro ao carregar dados do benefits");
      }
      
      const data = await response.json();
      setBenefits(data);
    } catch (err) {
      console.error("Erro ao carregar benefits:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Salvar dados do benefits
  const saveBenefits = async (benefitsData: BenefitsSettings) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/benefits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(benefitsData)
      });
      
      if (!response.ok) {
        throw new Error("Erro ao salvar dados do benefits");
      }
      
      const result = await response.json();
      setBenefits(benefitsData);
      
      return { success: true, message: result.message };
    } catch (err) {
      console.error("Erro ao salvar benefits:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadBenefits();
  }, []);

  return {
    benefits,
    loading,
    error,
    saveBenefits,
    reload: loadBenefits
  };
};
