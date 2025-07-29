import { useState, useEffect } from "react";

interface GalleryItem {
  id: number;
  title?: string;
  description?: string;
  image_url: string;
  alt_text?: string;
  is_active: boolean;
  display_order: number;
}

interface GallerySettings {
  section_tag: string;
  section_title: string;
  section_subtitle: string;
  section_description: string;
  items: GalleryItem[];
  empty_state_title: string;
  empty_state_description: string;
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
}

export const useGallery = () => {
  const [gallery, setGallery] = useState<GallerySettings>({
    section_tag: "Lifestyle Gallery",
    section_title: "COLEÇÃO LIFESTYLE",
    section_subtitle: "Viva o estilo Ecko",
    section_description: "Descubra o lifestyle autêntico da Ecko através de looks que representam a essência do streetwear e a cultura urbana que define nossa marca",
    items: [],
    empty_state_title: "Galeria em Construção",
    empty_state_description: "Em breve nossa galeria estará repleta de looks incríveis!",
    cta_title: "Tenha Estes Produtos em Sua Loja!",
    cta_description: "Produtos com alta demanda e excelente margem de lucro",
    cta_button_text: "QUERO ESSES PRODUTOS NA MINHA LOJA"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados da galeria (textos + imagens)
  const loadGallery = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar configurações de texto do lp_settings
      const textResponse = await fetch("/api/gallery-settings", {
        headers: {
          "Cache-Control": "no-cache"
        }
      });
      
      if (!textResponse.ok) {
        throw new Error("Erro ao carregar configurações de texto da galeria");
      }
      
      const textData = await textResponse.json();
      
      // Carregar imagens do banco de dados
      const imagesResponse = await fetch("/api/gallery", {
        headers: {
          "Cache-Control": "no-cache"
        }
      });
      
      if (!imagesResponse.ok) {
        throw new Error("Erro ao carregar imagens da galeria");
      }
      
      const imagesData = await imagesResponse.json();
      
      // Combinar os dados
      const combinedData = {
        ...textData,
        items: imagesData.data?.images || []
      };
      
      setGallery(combinedData);
    } catch (err) {
      console.error("Erro ao carregar galeria:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Salvar configurações de texto da galeria
  const saveGallerySettings = async (galleryData: Partial<GallerySettings>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Extrair apenas os campos de texto (não as imagens)
      const textData = {
        section_tag: galleryData.section_tag,
        section_title: galleryData.section_title,
        section_subtitle: galleryData.section_subtitle,
        section_description: galleryData.section_description,
        empty_state_title: galleryData.empty_state_title,
        empty_state_description: galleryData.empty_state_description,
        cta_title: galleryData.cta_title,
        cta_description: galleryData.cta_description,
        cta_button_text: galleryData.cta_button_text
      };
      
      const response = await fetch("/api/gallery-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(textData)
      });
      
      if (!response.ok) {
        throw new Error("Erro ao salvar configurações da galeria");
      }
      
      const result = await response.json();
      
      // Atualizar estado local (manter imagens, atualizar textos)
      setGallery(prev => ({
        ...prev,
        ...textData
      }));
      
      return { success: true, message: result.message };
    } catch (err) {
      console.error("Erro ao salvar galeria:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova imagem
  const addImage = async (imageData: Omit<GalleryItem, 'id'>) => {
    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(imageData)
      });
      
      if (!response.ok) {
        throw new Error("Erro ao adicionar imagem");
      }
      
      const result = await response.json();
      
      // Atualizar lista local
      setGallery(prev => ({
        ...prev,
        items: [...prev.items, result.data]
      }));
      
      return { success: true, data: result.data };
    } catch (err) {
      console.error("Erro ao adicionar imagem:", err);
      return { success: false, error: err instanceof Error ? err.message : "Erro desconhecido" };
    }
  };

  // Atualizar imagem
  const updateImage = async (id: number, imageData: Partial<GalleryItem>) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(imageData)
      });
      
      if (!response.ok) {
        throw new Error("Erro ao atualizar imagem");
      }
      
      const result = await response.json();
      
      // Atualizar lista local
      setGallery(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === id ? result.data : item)
      }));
      
      return { success: true, data: result.data };
    } catch (err) {
      console.error("Erro ao atualizar imagem:", err);
      return { success: false, error: err instanceof Error ? err.message : "Erro desconhecido" };
    }
  };

  // Excluir imagem
  const deleteImage = async (id: number) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        headers: {
          "Cache-Control": "no-cache"
        }
      });
      
      if (!response.ok) {
        throw new Error("Erro ao excluir imagem");
      }
      
      // Remover da lista local
      setGallery(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
      
      return { success: true };
    } catch (err) {
      console.error("Erro ao excluir imagem:", err);
      return { success: false, error: err instanceof Error ? err.message : "Erro desconhecido" };
    }
  };

  // Toggle ativo/inativo
  const toggleImage = async (id: number) => {
    try {
      const response = await fetch(`/api/gallery/${id}/toggle`, {
        method: "PUT",
        headers: {
          "Cache-Control": "no-cache"
        }
      });
      
      if (!response.ok) {
        throw new Error("Erro ao alterar status da imagem");
      }
      
      const result = await response.json();
      
      // Atualizar lista local
      setGallery(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === id ? result.data : item)
      }));
      
      return { success: true, data: result.data };
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      return { success: false, error: err instanceof Error ? err.message : "Erro desconhecido" };
    }
  };

  // Reordenar imagens
  const reorderImages = async (newOrder: GalleryItem[]) => {
    try {
      const response = await fetch("/api/gallery/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify({ images: newOrder })
      });
      
      if (!response.ok) {
        throw new Error("Erro ao reordenar imagens");
      }
      
      // Atualizar lista local
      setGallery(prev => ({
        ...prev,
        items: newOrder
      }));
      
      return { success: true };
    } catch (err) {
      console.error("Erro ao reordenar:", err);
      return { success: false, error: err instanceof Error ? err.message : "Erro desconhecido" };
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadGallery();
  }, []);

  return {
    gallery,
    loading,
    error,
    saveGallerySettings,
    addImage,
    updateImage,
    deleteImage,
    toggleImage,
    reorderImages,
    reload: loadGallery
  };
};
