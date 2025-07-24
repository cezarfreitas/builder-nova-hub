import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { Upload, X, Loader2, Image as ImageIcon, Check } from 'lucide-react';

interface CompactImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  type?: 'seo' | 'hero' | 'avatar' | 'gallery';
  className?: string;
}

export function CompactImageUpload({
  value,
  onChange,
  placeholder = 'Clique para fazer upload',
  type = 'seo',
  className = ''
}: CompactImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadConfigs = {
    seo: { maxSize: 10, endpoint: '/api/uploads/seo-image' },
    hero: { maxSize: 15, endpoint: '/api/uploads/hero' },
    avatar: { maxSize: 2, endpoint: '/api/uploads/avatar' },
    gallery: { maxSize: 5, endpoint: '/api/uploads/seo-image' }
  };

  const config = uploadConfigs[type];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Apenas arquivos de imagem são permitidos';
    }

    const maxSizeBytes = config.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Arquivo muito grande. Máximo: ${formatFileSize(maxSizeBytes)}`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const validation = validateFile(file);
    if (validation) {
      toast({
        title: "❌ Arquivo inválido",
        description: validation,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const response = await fetch(config.endpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onChange(result.data.url);
        
        const compressionMsg = result.data.compression?.wasCompressed 
          ? ` (compactada ${result.data.compression.reduction})`
          : '';
        
        toast({
          title: "✅ Upload realizado",
          description: `Imagem enviada com sucesso${compressionMsg}`,
          variant: "success",
        });
      } else {
        throw new Error(result.message || 'Erro no upload');
      }
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "❌ Erro no upload",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasImage = value && value.length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Upload Button */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : hasImage ? (
            <Check className="w-4 h-4 mr-2 text-green-600" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {uploading ? 'Compactando...' : hasImage ? 'Trocar imagem' : placeholder}
        </Button>

        {hasImage && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Preview Thumbnail */}
      {hasImage && (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-24 object-cover rounded border border-gray-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute top-1 right-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Size info */}
      <div className="text-xs text-gray-500">
        Máximo: {formatFileSize(config.maxSize * 1024 * 1024)} • Formatos: JPEG, PNG, WebP
      </div>

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
