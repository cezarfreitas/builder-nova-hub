import { useState, useEffect } from 'react';
import contentData from '../data/content.json';

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
    // Tenta carregar backup do localStorage primeiro
    try {
      const backup = localStorage.getItem('ecko_content_backup');
      if (backup) {
        const parsed = JSON.parse(backup);
        // Valida se tem a estrutura correta
        if (parsed.hero && parsed.gallery && parsed.testimonials) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar backup do localStorage:', error);
    }
    // Se não houver backup válido, usa os dados padrão
    return contentData;
  });
  const [loading, setLoading] = useState(false);

  // Função para salvar conteúdo (atualiza estado local + futura API)
  const saveContent = async (newContent: ContentData) => {
    setLoading(true);
    try {
      // Atualiza o estado local imediatamente para UX responsiva
      setContent(newContent);

      // Simula salvamento (em produção, implementar API para salvar JSON)
      await new Promise(resolve => setTimeout(resolve, 500));

      // TODO: Implementar API endpoint para salvar o arquivo JSON
      // const response = await fetch('/api/content', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newContent)
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Falha ao salvar no servidor');
      // }

      // Por enquanto, salva no localStorage como backup
      localStorage.setItem('ecko_content_backup', JSON.stringify(newContent));

      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
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
    resetToDefaults
  };
};
