import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { Upload, X, AlertCircle, CheckCircle, Image, Loader2 } from 'lucide-react';

interface SmartImageUploadProps {
  value?: string;
  onChange: (url: string, metadata?: any) => void;
  onClear?: () => void;
  type?: 'seo' | 'hero' | 'avatar' | 'gallery';
  maxSize?: number; // em MB
  preview?: boolean;
  className?: string;
  placeholder?: string;
}

export function SmartImageUpload({
  value,
  onChange,
  onClear,
  type = 'seo',
  maxSize,
  preview = true,
  className = '',
  placeholder = 'Clique para fazer upload ou arraste uma imagem'
}: SmartImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<any>(null);

  // Configurações por tipo
  const uploadConfigs = {
    seo: { maxSize: 10, endpoint: '/api/uploads/seo-image', accept: 'image/*' },
    hero: { maxSize: 15, endpoint: '/api/uploads/hero', accept: 'image/*' },
    avatar: { maxSize: 2, endpoint: '/api/uploads/avatar', accept: 'image/*' },
    gallery: { maxSize: 5, endpoint: '/api/uploads/seo-image', accept: 'image/*' }
  };

  const config = uploadConfigs[type];
  const maxSizeBytes = (maxSize || config.maxSize) * 1024 * 1024;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      return 'Apenas arquivos de imagem são permitidos';
    }

    // Validar tamanho
    if (file.size > maxSizeBytes) {
      return `Arquivo muito grande. Máximo permitido: ${formatFileSize(maxSizeBytes)}. Tamanho atual: ${formatFileSize(file.size)}`;
    }

    // Validar formatos específicos
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Formato não suportado. Use: JPEG, PNG, WebP ou GIF';
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
    setUploadInfo(null);

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
        setUploadInfo(result.data);
        onChange(result.data.url, result.data);
        
        toast({
          title: "✅ Upload realizado",
          description: result.message,
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

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
    setUploadInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasImage = value && value.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`
          border-2 border-dashed transition-all duration-200 cursor-pointer
          ${dragOver ? 'border-blue-500 bg-blue-50' : hasImage ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-8">
          <div className="text-center">
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
                <div>
                  <p className="text-lg font-medium text-gray-700">Processando imagem...</p>
                  <p className="text-sm text-gray-500">Otimizando para melhor performance</p>
                </div>
              </div>
            ) : hasImage ? (
              <div className="space-y-4">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                <div>
                  <p className="text-lg font-medium text-gray-700">Imagem carregada</p>
                  <p className="text-sm text-gray-500">Clique para trocar ou arraste nova imagem</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">{placeholder}</p>
                  <p className="text-sm text-gray-500">
                    Formatos: JPEG, PNG, WebP, GIF • Máximo: {formatFileSize(maxSizeBytes)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Info */}
      {uploadInfo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Image className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-blue-900">Processamento concluído</span>
                  {uploadInfo.optimization?.wasOptimized && (
                    <Badge className="bg-green-100 text-green-800">
                      Otimizada: {uploadInfo.optimization.reduction}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Arquivo:</span>
                    <p className="font-medium">{uploadInfo.originalName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tamanho final:</span>
                    <p className="font-medium">{uploadInfo.sizeFormatted}</p>
                  </div>
                  {uploadInfo.optimization?.wasOptimized && (
                    <>
                      <div>
                        <span className="text-gray-600">Tamanho original:</span>
                        <p className="font-medium">{uploadInfo.optimization.originalSizeFormatted}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Qualidade:</span>
                        <p className="font-medium">{uploadInfo.optimization.quality}%</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {preview && hasImage && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Preview</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Remover
              </Button>
            </div>
            <div className="relative">
              <img
                src={value}
                alt="Preview"
                className="max-w-full h-auto max-h-64 mx-auto rounded-lg border border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={config.accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
