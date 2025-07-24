import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";
import { Upload, X, Plus, Images } from "lucide-react";

interface MultiImageUploadProps {
  onImagesChange: (imageUrls: string[]) => void;
  images: string[];
  maxSizeMB?: number;
  maxImages?: number;
  disabled?: boolean;
}

export function MultiImageUpload({
  onImagesChange,
  images,
  maxSizeMB = 5,
  maxImages = 20,
  disabled = false
}: MultiImageUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload/gallery', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return result.data.url;
      } else {
        throw new Error(result.message || 'Erro no upload');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      return null;
    }
  };

  const handleFiles = async (files: FileList) => {
    if (disabled) return;

    const validFiles: File[] = [];
    let errorMessages: string[] = [];

    // Validar arquivos
    Array.from(files).forEach((file, index) => {
      // Verificar se é imagem
      if (!file.type.startsWith('image/')) {
        errorMessages.push(`Arquivo ${index + 1}: Não é uma imagem válida`);
        return;
      }

      // Verificar tamanho
      if (file.size > maxSizeMB * 1024 * 1024) {
        errorMessages.push(`Arquivo ${index + 1}: Muito grande (max ${maxSizeMB}MB)`);
        return;
      }

      validFiles.push(file);
    });

    // Verificar limite total
    if (images.length + validFiles.length > maxImages) {
      errorMessages.push(`Limite excedido. Máximo ${maxImages} imagens`);
      return;
    }

    // Mostrar erros se houver
    if (errorMessages.length > 0) {
      toast({
        title: "❌ Erro na Validação",
        description: errorMessages.join('; '),
        variant: "destructive",
      });
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = validFiles.map(file => uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter(url => url !== null) as string[];
      const failedCount = results.length - successfulUploads.length;

      if (successfulUploads.length > 0) {
        onImagesChange([...images, ...successfulUploads]);
        
        toast({
          title: "✅ Upload Concluído",
          description: `${successfulUploads.length} ${successfulUploads.length === 1 ? 'imagem enviada' : 'imagens enviadas'}${failedCount > 0 ? ` (${failedCount} falharam)` : ''}`,
          variant: "success",
        });
      }

      if (failedCount > 0 && successfulUploads.length === 0) {
        toast({
          title: "❌ Erro no Upload",
          description: "Todas as imagens falharam no upload",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no upload múltiplo:', error);
      toast({
        title: "❌ Erro",
        description: "Erro inesperado no upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(newImages);
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={disabled ? undefined : openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-2">
          <div className="flex justify-center">
            <Images className={`w-12 h-12 ${dragActive ? 'text-green-500' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading ? 'Enviando imagens...' : 'Upload de Múltiplas Imagens'}
            </p>
            <p className="text-sm text-gray-500">
              Arraste e solte imagens aqui, ou clique para selecionar
            </p>
          </div>

          <div className="text-xs text-gray-400">
            <p>Máximo {maxSizeMB}MB por imagem • {maxImages} imagens no total</p>
            <p>Tipos: JPG, PNG, WEBP, GIF</p>
          </div>

          {!disabled && (
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              disabled={uploading}
            >
              <Plus className="w-4 h-4 mr-2" />
              {uploading ? 'Enviando...' : 'Selecionar Imagens'}
            </Button>
          )}
        </div>
      </div>

      {/* Preview das Imagens */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Imagens Selecionadas ({images.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((imageUrl, index) => (
              <div key={`${imageUrl}-${index}`} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button"
                  disabled={disabled}
                >
                  ×
                </button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado de Loading */}
      {uploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-sm text-gray-600">Processando imagens...</span>
        </div>
      )}
    </div>
  );
}
