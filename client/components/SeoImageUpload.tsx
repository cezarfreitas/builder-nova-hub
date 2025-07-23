import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { useImageUpload, UploadedImage } from '../hooks/useImageUpload';
import { useToast } from '../hooks/use-toast';

interface SeoImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
  description?: string;
}

export function SeoImageUpload({
  currentImage,
  onImageChange,
  label = "Imagem SEO",
  description = "Tamanho recomendado: 1200x630px"
}: SeoImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { uploading, error, uploadImage, deleteImage, clearError } = useImageUpload();
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    const result = await uploadImage(file);
    if (result) {
      onImageChange(result.url);
      toast({
        title: "✅ Upload concluído!",
        description: `Imagem ${result.originalName} enviada com sucesso`,
        variant: "success",
      });
    } else if (error) {
      toast({
        title: "❌ Erro no upload",
        description: error,
        variant: "destructive",
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = async () => {
    if (currentImage) {
      // Extrair filename da URL se for upload local
      const filename = currentImage.split('/').pop();
      if (filename && currentImage.includes('/uploads/')) {
        const success = await deleteImage(filename);
        if (success) {
          toast({
            title: "🗑️ Imagem removida",
            description: "Imagem deletada com sucesso",
            variant: "default",
          });
        }
      }
      onImageChange('');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Preview da imagem atual */}
      {currentImage && (
        <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-white">
          <img 
            src={currentImage}
            alt="Preview" 
            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {currentImage.split('/').pop() || 'Imagem atual'}
            </p>
            <p className="text-xs text-gray-500">{description}</p>
            <input
              type="url"
              className="w-full mt-2 p-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-ecko-red focus:border-ecko-red"
              value={currentImage}
              onChange={(e) => onImageChange(e.target.value)}
              placeholder="URL da imagem"
            />
          </div>
          <Button 
            variant="outline" 
            className="text-red-600 border-red-300 hover:bg-red-50"
            onClick={handleRemove}
          >
            Remover
          </Button>
        </div>
      )}

      {/* Área de upload */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          dragActive
            ? 'border-ecko-red bg-red-50'
            : 'border-gray-300 hover:border-ecko-red'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ecko-red"></div>
            <p className="mt-2 text-sm text-gray-600">Enviando...</p>
          </div>
        ) : (
          <>
            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-3">
              <button
                type="button"
                onClick={openFileDialog}
                className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-ecko-red bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ecko-red"
              >
                Escolher arquivo
              </button>
              <p className="mt-1 text-xs text-gray-600">
                ou arraste aqui
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {description}
              </p>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleChange}
        />
      </div>

      {/* Erro */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="mt-1 text-xs text-red-600 hover:text-red-500 underline"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
