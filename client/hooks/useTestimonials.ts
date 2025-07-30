import { useState, useEffect, useCallback } from "react";

export interface TestimonialItem {
  id: number;
  name: string;
  company?: string;
  role?: string;
  content: string;
  avatar_url?: string;
  rating: number;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface TestimonialsSettings {
  section_tag: string;
  section_title: string;
  section_subtitle: string;
  section_description: string;
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
  items: TestimonialItem[];
}

interface UseTestimonialsReturn {
  testimonials: TestimonialsSettings;
  loading: boolean;
  error: string | null;
  
  // Funções para textos da seção
  saveTestimonialsSettings: (settings: Omit<TestimonialsSettings, 'items'>) => Promise<{
    success: boolean;
    error?: string;
  }>;
  
  // Funções CRUD para itens
  addTestimonial: (testimonial: Omit<TestimonialItem, 'id' | 'created_at' | 'updated_at'>) => Promise<{
    success: boolean;
    data?: TestimonialItem;
    error?: string;
  }>;
  
  updateTestimonial: (id: number, testimonial: Partial<TestimonialItem>) => Promise<{
    success: boolean;
    data?: TestimonialItem;
    error?: string;
  }>;
  
  deleteTestimonial: (id: number) => Promise<{
    success: boolean;
    error?: string;
  }>;
  
  toggleTestimonial: (id: number) => Promise<{
    success: boolean;
    data?: TestimonialItem;
    error?: string;
  }>;
  
  reorderTestimonials: (testimonials: TestimonialItem[]) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

export function useTestimonials(): UseTestimonialsReturn {
  const [testimonials, setTestimonials] = useState<TestimonialsSettings>({
    section_tag: "",
    section_title: "",
    section_subtitle: "",
    section_description: "",
    cta_title: "",
    cta_description: "",
    cta_button_text: "",
    items: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar configurações de texto dos testimonials
  const fetchTestimonialsSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/testimonials-settings');
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Erro ao carregar configurações');
      }
    } catch (err) {
      console.error('Erro ao buscar configurações dos testimonials:', err);
      // Fallback para dados padrão
      return {
        section_tag: "Depoimentos",
        section_title: "O que nossos revendedores dizem",
        section_subtitle: "casos reais de sucesso",
        section_description: "Depoimentos reais de parceiros que transformaram suas paixões em negócios lucrativos com a Ecko",
        cta_title: "Seja o próximo case de sucesso!",
        cta_description: "Junte-se aos revendedores que já transformaram seus negócios",
        cta_button_text: "QUERO SER UM CASE DE SUCESSO"
      };
    }
  }, []);

  // Função para buscar itens dos testimonials
  const fetchTestimonialsItems = useCallback(async () => {
    try {
      const response = await fetch('/api/testimonials');
      const result = await response.json();
      
      if (result.success) {
        return result.data.testimonials || [];
      } else {
        throw new Error(result.message || 'Erro ao carregar depoimentos');
      }
    } catch (err) {
      console.error('Erro ao buscar itens dos testimonials:', err);
      return [];
    }
  }, []);

  // Carregar dados iniciais
  const loadTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [settings, items] = await Promise.all([
        fetchTestimonialsSettings(),
        fetchTestimonialsItems()
      ]);

      setTestimonials({
        ...settings,
        items
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar testimonials:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchTestimonialsSettings, fetchTestimonialsItems]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  // Salvar configurações de texto
  const saveTestimonialsSettings = useCallback(async (settings: Omit<TestimonialsSettings, 'items'>) => {
    try {
      const response = await fetch('/api/testimonials-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        // Atualizar estado local
        setTestimonials(prev => ({
          ...prev,
          ...settings
        }));
        return { success: true };
      } else {
        throw new Error(result.message || 'Erro ao salvar configurações');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Adicionar novo depoimento
  const addTestimonial = useCallback(async (testimonial: Omit<TestimonialItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonial),
      });

      const result = await response.json();

      if (result.success) {
        const newTestimonial = result.data;
        
        // Atualizar estado local
        setTestimonials(prev => ({
          ...prev,
          items: [...prev.items, newTestimonial].sort((a, b) => a.display_order - b.display_order)
        }));

        return { success: true, data: newTestimonial };
      } else {
        throw new Error(result.message || 'Erro ao adicionar depoimento');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Atualizar depoimento
  const updateTestimonial = useCallback(async (id: number, testimonial: Partial<TestimonialItem>) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonial),
      });

      const result = await response.json();

      if (result.success) {
        const updatedTestimonial = result.data;
        
        // Atualizar estado local
        setTestimonials(prev => ({
          ...prev,
          items: prev.items.map(item => 
            item.id === id ? updatedTestimonial : item
          ).sort((a, b) => a.display_order - b.display_order)
        }));

        return { success: true, data: updatedTestimonial };
      } else {
        throw new Error(result.message || 'Erro ao atualizar depoimento');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Deletar depoimento
  const deleteTestimonial = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Atualizar estado local
        setTestimonials(prev => ({
          ...prev,
          items: prev.items.filter(item => item.id !== id)
        }));

        return { success: true };
      } else {
        throw new Error(result.message || 'Erro ao deletar depoimento');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Toggle ativo/inativo
  const toggleTestimonial = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/testimonials/${id}/toggle`, {
        method: 'PUT',
      });

      const result = await response.json();

      if (result.success) {
        const updatedTestimonial = result.data;
        
        // Atualizar estado local
        setTestimonials(prev => ({
          ...prev,
          items: prev.items.map(item => 
            item.id === id ? updatedTestimonial : item
          )
        }));

        return { success: true, data: updatedTestimonial };
      } else {
        throw new Error(result.message || 'Erro ao alterar status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Reordenar depoimentos
  const reorderTestimonials = useCallback(async (testimonials: TestimonialItem[]) => {
    try {
      const response = await fetch('/api/testimonials/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testimonials }),
      });

      const result = await response.json();

      if (result.success) {
        // Atualizar estado local
        setTestimonials(prev => ({
          ...prev,
          items: testimonials
        }));

        return { success: true };
      } else {
        throw new Error(result.message || 'Erro ao reordenar depoimentos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    testimonials,
    loading,
    error,
    saveTestimonialsSettings,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonial,
    reorderTestimonials,
  };
}
