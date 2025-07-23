import { useState, useCallback } from 'react';

export interface UploadedImage {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  path: string;
}

interface UseImageUploadReturn {
  uploading: boolean;
  error: string | null;
  uploadImage: (file: File) => Promise<UploadedImage | null>;
  deleteImage: (filename: string) => Promise<boolean>;
  clearError: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<UploadedImage | null> => {
    setUploading(true);
    setError(null);

    try {
      // Validar arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido. Use: JPEG, PNG, WebP ou GIF');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('Arquivo muito grande. Tamanho máximo: 5MB');
      }

      // Criar FormData
      const formData = new FormData();
      formData.append('image', file);

      // Fazer upload
      const response = await fetch('/api/uploads/seo-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Erro ao fazer upload');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const deleteImage = useCallback(async (filename: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/uploads/${filename}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      return result.success;
    } catch (err) {
      setError('Erro ao deletar imagem');
      return false;
    }
  }, []);

  return {
    uploading,
    error,
    uploadImage,
    deleteImage,
    clearError,
  };
}
