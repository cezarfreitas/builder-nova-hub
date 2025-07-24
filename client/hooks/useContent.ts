import { useState, useEffect } from "react";
import contentData from "../data/content.json";

export interface ContentData {
  hero: {
    enabled: boolean;
    title: string;
    subtitle: string;
    description: string;
    cta_text: string;
    cta_secondary_text: string;
    logo_url: string;
    background_image: string;
    background_color: string;
    text_color: string;
    cta_color: string;
    cta_text_color: string;
  };
  benefits: {
    section_tag: string;
    section_title: string;
    section_subtitle: string;
    section_description: string;
    cards: {
      id: number;
      title: string;
      description: string;
      icon: string;
    }[];
    cta_title: string;
    cta_button_text: string;
  };
  gallery: {
    section_tag: string;
    section_title: string;
    section_subtitle: string;
    section_description: string;
    empty_state_title: string;
    empty_state_description: string;
    cta_title: string;
    cta_description: string;
    cta_button_text: string;
  };
  testimonials: {
    section_tag: string;
    section_title: string;
    section_subtitle: string;
    section_description: string;
    cta_title: string;
    cta_description: string;
    cta_button_text: string;
  };
  faq: {
    section_tag: string;
    section_title: string;
    section_subtitle: string;
    section_description: string;
    cta_title: string;
    cta_description: string;
    cta_button_text: string;
  };
  final_cta: {
    title: string;
    description: string;
    button_text: string;
  };
}

export const useContent = () => {
  const [content, setContent] = useState<ContentData>(() => {
    // Sempre usar dados do JSON como base
    let finalContent = { ...contentData };

    // Tenta carregar backup do localStorage apenas para seções específicas (não hero)
    try {
      const backup = localStorage.getItem("ecko_content_backup");
      if (backup) {
        const parsed = JSON.parse(backup);
        // Valida se tem a estrutura correta e mescla mantendo hero do JSON
        if (parsed.gallery && parsed.testimonials && parsed.benefits?.cards) {
          finalContent = {
            ...finalContent,
            // Hero sempre do JSON
            hero: contentData.hero,
            // Outras seções podem vir do backup se válidas
            benefits: parsed.benefits?.cards
              ? parsed.benefits
              : contentData.benefits,
            gallery: parsed.gallery || contentData.gallery,
            testimonials: parsed.testimonials || contentData.testimonials,
            faq: parsed.faq || contentData.faq,
            final_cta: parsed.final_cta || contentData.final_cta,
          };
        }
      }
    } catch (error) {
      console.warn("Erro ao carregar backup do localStorage:", error);
    }

    return finalContent;
  });
  const [loading, setLoading] = useState(false);

  // Função para salvar conteúdo (atualiza estado local + arquivo JSON)
  const saveContent = async (newContent: ContentData) => {
    setLoading(true);
    try {
      // Atualiza o estado local imediatamente para UX responsiva
      setContent(newContent);

      // Salva no arquivo JSON via API
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContent)
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar no servidor');
      }

      // Salva no localStorage como backup apenas se a API funcionou
      localStorage.setItem("ecko_content_backup", JSON.stringify(newContent));

      console.log('✅ Conteúdo salvo no arquivo JSON com sucesso');
      return { success: true };
    } catch (error) {
      console.error("Erro ao salvar conteúdo:", error);
      // Em caso de erro da API, ainda salva no localStorage
      localStorage.setItem("ecko_content_backup", JSON.stringify(newContent));
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Função para resetar para padrões
  const resetToDefaults = () => {
    setContent(contentData);
  };

  return {
    content,
    loading,
    saveContent,
    resetToDefaults,
  };
};
