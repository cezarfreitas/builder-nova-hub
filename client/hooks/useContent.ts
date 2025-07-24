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
  const [content, setContent] = useState<ContentData>(contentData);
  const [loading, setLoading] = useState(false);

  // Função para salvar conteúdo (para interface admin futura)
  const saveContent = async (newContent: ContentData) => {
    setLoading(true);
    try {
      // Aqui você pode implementar uma API para salvar o JSON
      // Por enquanto, apenas atualiza o estado local
      setContent(newContent);
      
      // TODO: Implementar API endpoint para salvar o arquivo JSON
      // await fetch('/api/content', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newContent)
      // });
      
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
