import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useImageUpload } from '../hooks/useImageUpload';
import { useToast } from '../hooks/use-toast';
import { Upload, X, RefreshCw } from 'lucide-react';

interface CompactImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accept?: string;
  className?: string;
}

export function CompactImageUpload({
  value,
  onChange,
  placeholder = "URL da imagem ou faça upload",
  accept = "image/jpeg,image/jpg,image/png,image/webp,image/gif",
  className = ""
}: CompactImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, error, uploadImage, deleteImage, clearError } = useImageUpload();
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    const result = await uploadImage(file);
    if (result) {
      onChange(result.url);
      toast({
        title: "Upload concluído!",
        description: `Imagem enviada com sucesso`,
      });
    } else if (error) {
      toast({
        title: "Erro no upload",
        description: error,
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = async () => {
    if (value) {
      // Se for uma imagem local, deletar do servidor
      const filename = value.split('/').pop();
      if (filename && value.includes('/uploads/')) {
        const success = await deleteImage(filename);
        if (success) {
          toast({
            title: "Imagem removida",
            description: "Imagem deletada com sucesso",
          });
        }
      }
      onChange('');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        
        <Button
          type="button"
          onClick={openFileDialog}
          variant="outline"
          size="sm"
          disabled={uploading}
          className="px-3 border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          {uploading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </Button>

        {value && (
          <Button
            type="button"
            onClick={handleRemove}
            variant="outline"
            size="sm"
            className="px-3 border-red-300 text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Preview da imagem se existir */}
      {value && (
        <div className="relative">
          <img 
            src={value}
            alt="Preview" 
            className="w-full h-24 object-cover rounded border border-gray-200"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
      )}

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept={accept}
        onChange={handleFileChange}
      />

      {/* Erro de upload */}
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
          <div className="flex items-center justify-between">
            <span className="text-red-800">{error}</span>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Status de upload */}
      {uploading && (
        <div className="text-xs text-blue-600 flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Enviando imagem...
        </div>
      )}
    </div>
  );
}
