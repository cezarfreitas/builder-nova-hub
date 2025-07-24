import { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import {
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Loader2,
  AlertCircle,
  Info,
  Compress,
  Download
} from 'lucide-react';

interface OptimizedImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  label: string;
  maxSizeKB?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  acceptedTypes?: string[];
  className?: string;
}

interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'jpeg' | 'webp' | 'png';
}

export function OptimizedImageUpload({
  value,
  onChange,
  onClear,
  label,
  maxSizeKB = 500, // 500KB default
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = ''
}: OptimizedImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Função para comprimir imagem
  const compressImage = useCallback(async (
    file: File, 
    options: CompressionOptions
  ): Promise<{ blob: Blob; stats: any }> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular dimensões mantendo aspect ratio
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > options.maxWidth) {
          width = options.maxWidth;
          height = width / aspectRatio;
        }

        if (height > options.maxHeight) {
          height = options.maxHeight;
          width = height * aspectRatio;
        }

        // Configurar canvas
        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para blob com compressão
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const stats = {
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio: Math.round((1 - blob.size / file.size) * 100),
                originalDimensions: { width: img.width, height: img.height },
                newDimensions: { width, height }
              };
              resolve({ blob, stats });
            } else {
              reject(new Error('Falha na compressão da imagem'));
            }
          },
          options.format === 'png' ? 'image/png' : `image/${options.format}`,
          options.quality
        );
      };

      img.onerror = () => reject(new Error('Falha ao carregar a imagem'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Função para processar arquivo
  const processFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validações iniciais
      if (!acceptedTypes.includes(file.type)) {
        throw new Error(`Tipo de arquivo não suportado. Use: ${acceptedTypes.join(', ')}`);
      }

      if (file.size > maxSizeKB * 1024 * 10) { // 10x o limite para compressão
        throw new Error(`Arquivo muito grande. Máximo: ${maxSizeKB * 10}KB`);
      }

      setUploadProgress(25);

      // Determinar formato de saída
      let outputFormat: 'jpeg' | 'webp' | 'png' = 'jpeg';
      if (file.type === 'image/png' && file.size < maxSizeKB * 1024) {
        outputFormat = 'png'; // Manter PNG se já estiver otimizado
      } else if (file.type === 'image/webp') {
        outputFormat = 'webp';
      }

      setUploadProgress(50);

      // Comprimir imagem
      const { blob, stats } = await compressImage(file, {
        maxWidth,
        maxHeight,
        quality,
        format: outputFormat
      });

      setCompressionStats({
        originalSize: stats.originalSize,
        compressedSize: stats.compressedSize,
        compressionRatio: stats.compressionRatio
      });

      setUploadProgress(75);

      // Converter para base64 ou upload para servidor
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onChange(result);
        setUploadProgress(100);
        
        toast({
          title: "Imagem otimizada!",
          description: `Compressão: ${stats.compressionRatio}% • Tamanho final: ${Math.round(blob.size / 1024)}KB`,
        });
      };

      reader.onerror = () => {
        throw new Error('Erro ao processar a imagem');
      };

      reader.readAsDataURL(blob);

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [acceptedTypes, maxSizeKB, maxWidth, maxHeight, quality, onChange, toast, compressImage]);

  // Handlers de eventos
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleClear = useCallback(() => {
    onChange('');
    setCompressionStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  }, [onChange, onClear]);

  // Formatar tamanho de arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          dragOver
            ? 'border-ecko-red bg-red-50'
            : value
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'pointer-events-none' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {isUploading ? (
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 text-ecko-red animate-spin" />
            <p className="text-sm font-medium text-gray-700">
              Otimizando imagem...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-ecko-red h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
          </div>
        ) : value ? (
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={value}
                alt="Preview"
                className="max-w-full max-h-32 rounded-lg shadow-md"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center text-green-600">
              <Check className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Imagem carregada</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              Clique ou arraste uma imagem
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {acceptedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()} até {maxSizeKB}KB
            </p>
          </div>
        )}
      </div>

      {/* Compression Stats */}
      {compressionStats && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Compress className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Otimização aplicada</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                -{compressionStats.compressionRatio}%
              </Badge>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-blue-700">
              <div>
                <span className="font-medium">Original:</span> {formatFileSize(compressionStats.originalSize)}
              </div>
              <div>
                <span className="font-medium">Otimizada:</span> {formatFileSize(compressionStats.compressedSize)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center">
          <Info className="w-3 h-3 mr-1" />
          <span>Resolução máxima: {maxWidth}x{maxHeight}px</span>
        </div>
        <div className="flex items-center">
          <Info className="w-3 h-3 mr-1" />
          <span>Tamanho alvo: {maxSizeKB}KB • Qualidade: {Math.round(quality * 100)}%</span>
        </div>
      </div>

      {/* Action Buttons */}
      {value && (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const link = document.createElement('a');
              link.href = value;
              link.download = `optimized-image.${value.includes('data:image/png') ? 'png' : 'jpg'}`;
              link.click();
            }}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="text-xs text-red-600 hover:text-red-700"
          >
            <X className="w-3 h-3 mr-1" />
            Remover
          </Button>
        </div>
      )}
    </div>
  );
}
