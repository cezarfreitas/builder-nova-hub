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
  form: {
    main_title: string;
    main_description: string;
    title: string;
    subtitle: string;
    fields: {
      name_label: string;
      name_placeholder: string;
      whatsapp_label: string;
      whatsapp_placeholder: string;
      whatsapp_error: string;
      whatsapp_success: string;
      cep_label: string;
      cep_placeholder: string;
      endereco_label: string;
      endereco_placeholder: string;
      complemento_label: string;
      complemento_placeholder: string;
      bairro_label: string;
      cidade_label: string;
      estado_label: string;
      cnpj_label: string;
      cnpj_yes: string;
      cnpj_no: string;
      cnpj_error: string;
      store_type_label: string;
      store_type_placeholder: string;
    };
    submit_button: string;
    submit_button_loading: string;
    validation_messages: {
      whatsapp_invalid: string;
      address_incomplete: string;
      cnpj_required: string;
    };
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
    items: {
      id: number;
      title: string;
      description: string;
      image_url: string;
      alt_text: string;
      is_active: boolean;
      display_order: number;
    }[];
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
    items: {
      id: number;
      name: string;
      company: string;
      role: string;
      content: string;
      avatar_url: string;
      rating: number;
      is_active: boolean;
      display_order: number;
    }[];
    cta_title: string;
    cta_description: string;
    cta_button_text: string;
  };
  faq: {
    section_tag: string;
    section_title: string;
    section_subtitle: string;
    section_description: string;
    items: {
      id: number;
      question: string;
      answer: string;
      is_active: boolean;
      display_order: number;
    }[];
    cta_title: string;
    cta_description: string;
    cta_button_text: string;
  };
  final_cta: {
    title: string;
    description: string;
    button_text: string;
  };
  footer: {
    description: string;
    links_title: string;
    contact_title: string;
    phone: string;
    email: string;
    hours: string;
    copyright: string;
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
        // Sempre usar dados do JSON para seções principais
        finalContent = {
          ...finalContent,
          // Hero, Form, Benefits, Testimonials, Gallery e FAQ sempre do JSON
          hero: contentData.hero,
          form: contentData.form,
          benefits: contentData.benefits,
          testimonials: contentData.testimonials,
          gallery: contentData.gallery,
          faq: contentData.faq,
          // Outras seções podem vir do backup se válidas
          final_cta: parsed.final_cta || contentData.final_cta,
        };
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
