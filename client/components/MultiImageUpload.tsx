import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";

interface UploadResult {
  file: File;
  url?: string;
  error?: string;
  status: "pending" | "uploading" | "success" | "error";
  compressedSize?: number;
  originalSize?: number;
}

interface MultiImageUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number; // em MB
  acceptedTypes?: string[];
  quality?: number; // 0-1 para compressão JPEG
  maxWidth?: number;
  maxHeight?: number;
}

export function MultiImageUpload({
  onUpload,
  maxFiles = 10,
  maxSize = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  quality = 0.8,
  maxWidth = 1200,
  maxHeight = 1200,
}: MultiImageUploadProps) {
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Função para comprimir imagem
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      console.log(`🗜️ Processando ${file.name}: ${(file.size / 1024 / 1024).toFixed(1)}MB (${file.type})`);

      // GIFs não devem ser comprimidos (perdem animação)
      if (file.type === "image/gif") {
        console.log(`🎬 GIF detectado, mantendo original: ${file.name}`);
        resolve(file);
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calcular novas dimensões mantendo aspect ratio
        let { width, height } = img;
        const originalDimensions = `${width}x${height}`;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        console.log(`📐 Redimensionando ${file.name}: ${originalDimensions} → ${Math.round(width)}x${Math.round(height)}`);

        canvas.width = width;
        canvas.height = height;

        // Desenhar e comprimir
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality,
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Validar arquivo
  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de arquivo não aceito: ${file.type}`;
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(1)}MB (máximo: ${maxSize}MB)`;
    }

    return null;
  };

  // Upload de um arquivo
  const uploadFile = async (file: File, index: number): Promise<string> => {
    console.log(`📤 Fazendo upload do arquivo ${index + 1}:`, file.name, file.size, file.type);

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload/gallery", {
      method: "POST",
      body: formData,
    });

    console.log(`📥 Resposta do upload ${index + 1}:`, response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Upload falhou para ${file.name}:`, errorText);
      throw new Error(`Upload falhou: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Resultado do upload ${index + 1}:`, result);

    if (!result.success) {
      throw new Error(result.message || "Upload falhou");
    }

    return result.url;
  };

  // Processar arquivos selecionados
  const handleFileSelect = async (files: FileList) => {
    const fileArray = Array.from(files).slice(0, maxFiles);

    if (fileArray.length === 0) return;

    const initialResults: UploadResult[] = fileArray.map((file) => ({
      file,
      status: "pending",
      originalSize: file.size,
    }));

    setUploadResults(initialResults);
    setIsUploading(true);

    const successfulUploads: string[] = [];

    // Processar cada arquivo
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      try {
        // Atualizar status para uploading
        setUploadResults((prev) =>
          prev.map((result, idx) =>
            idx === i ? { ...result, status: "uploading" } : result,
          ),
        );

        // Validar arquivo
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }

        // Comprimir imagem
        const compressedFile = await compressImage(file);

        // Upload
        const url = await uploadFile(compressedFile, i);

        // Atualizar resultado com sucesso
        setUploadResults((prev) =>
          prev.map((result, idx) =>
            idx === i
              ? {
                  ...result,
                  status: "success",
                  url,
                  compressedSize: compressedFile.size,
                }
              : result,
          ),
        );

        successfulUploads.push(url);
      } catch (error) {
        // Atualizar resultado com erro
        setUploadResults((prev) =>
          prev.map((result, idx) =>
            idx === i
              ? {
                  ...result,
                  status: "error",
                  error:
                    error instanceof Error
                      ? error.message
                      : "Erro desconhecido",
                }
              : result,
          ),
        );
      }
    }

    setIsUploading(false);

    // Notificar uploads bem-sucedidos
    if (successfulUploads.length > 0) {
      onUpload(successfulUploads);
      toast({
        title: "Upload concluído!",
        description: `${successfulUploads.length} ${successfulUploads.length === 1 ? "imagem enviada" : "imagens enviadas"} com sucesso.`,
      });
    }

    // Notificar erros se houver
    const errors = initialResults.filter((_, idx) => !successfulUploads[idx]);
    if (errors.length > 0) {
      toast({
        title: "Alguns uploads falharam",
        description: `${errors.length} ${errors.length === 1 ? "arquivo teve" : "arquivos tiveram"} problemas no upload.`,
        variant: "destructive",
      });
    }
  };

  // Remover arquivo da lista
  const removeFile = (index: number) => {
    setUploadResults((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Resetar lista
  const clearAll = () => {
    setUploadResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Upload múltiplo de imagens
            </p>
            <p className="text-sm text-gray-500">
              Selecione até {maxFiles} imagens (máximo {maxSize}MB cada)
            </p>
            <p className="text-xs text-gray-400">
              Formatos aceitos: JPG, PNG, WebP, GIF
            </p>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-ecko-red hover:bg-ecko-red-dark"
            >
              <Plus className="w-4 h-4 mr-2" />
              Selecionar Imagens
            </Button>

            {uploadResults.length > 0 && (
              <Button
                variant="outline"
                onClick={clearAll}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-2" />
                Limpar Lista
              </Button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Arquivos ({uploadResults.length})
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                {
                  uploadResults.filter((r) => r.status === "success").length
                }{" "}
                sucesso
              </div>
              <div className="flex items-center">
                <AlertCircle className="w-3 h-3 mr-1 text-red-500" />
                {uploadResults.filter((r) => r.status === "error").length} erro
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {uploadResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {/* Status Icon */}
                  {result.status === "pending" && (
                    <Upload className="w-4 h-4 text-gray-400" />
                  )}
                  {result.status === "uploading" && (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  {result.status === "success" && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {result.status === "error" && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatFileSize(result.originalSize || 0)}</span>
                      {result.compressedSize &&
                        result.compressedSize !== result.originalSize && (
                          <>
                            <span>→</span>
                            <span className="text-green-600">
                              {formatFileSize(result.compressedSize)}
                            </span>
                            <span className="text-green-600">
                              (-
                              {Math.round(
                                (1 -
                                  result.compressedSize /
                                    (result.originalSize || 1)) *
                                  100,
                              )}
                              %)
                            </span>
                          </>
                        )}
                    </div>
                    {result.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {result.error}
                      </p>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFile(index)}
                  disabled={result.status === "uploading"}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
