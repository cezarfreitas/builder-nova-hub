import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  Link,
  FolderOpen,
  Trash2,
  Eye,
} from "lucide-react";

interface UploadedFile {
  id: number;
  filename: string;
  original_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  alt_text?: string;
  used_for?: string;
  created_at: string;
}

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  description?: string;
  usedFor?: string;
  allowUrl?: boolean;
}

export default function ImageUpload({
  value = "",
  onChange,
  label = "Imagem",
  placeholder = "URL da imagem ou faça upload",
  description,
  usedFor = "hero",
  allowUrl = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Arquivo muito grande. Máximo 5MB permitido.");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Apenas arquivos de imagem são permitidos.");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("used_for", usedFor);
      formData.append("alt_text", file.name);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onChange(data.url);
        setUrlInput(data.url);
        setError(null);
      } else {
        setError(data.message || "Erro no upload da imagem");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Erro ao fazer upload da imagem");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const loadUploadedFiles = async () => {
    try {
      setIsLoadingGallery(true);
      const response = await fetch(
        `/api/upload/images?used_for=${usedFor}&limit=20`,
      );
      const data = await response.json();

      if (data.success) {
        setUploadedFiles(data.uploads || []);
      }
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleSelectFromGallery = (fileUrl: string) => {
    onChange(fileUrl);
    setUrlInput(fileUrl);
    setShowGallery(false);
  };

  const handleUrlChange = (newUrl: string) => {
    setUrlInput(newUrl);
    onChange(newUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      uploadFile(imageFile);
    } else {
      setError("Apenas arquivos de imagem são permitidos.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{label}</Label>
      {description && <p className="text-sm text-gray-600">{description}</p>}

      {/* Current Image Preview */}
      {value && (
        <div className="relative">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="relative">
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    onChange("");
                    setUrlInput("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-sm text-gray-600">Enviando imagem...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    {isDragging
                      ? "Solte a imagem aqui"
                      : "Clique para enviar ou arraste uma imagem"}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF, WebP até 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Dialog open={showGallery} onOpenChange={setShowGallery}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={loadUploadedFiles}
                  className="flex-1"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Galeria
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Galeria de Imagens</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {isLoadingGallery ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="ml-2">Carregando...</span>
                    </div>
                  ) : uploadedFiles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma imagem encontrada</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleSelectFromGallery(file.file_url)}
                        >
                          <div className="aspect-square relative">
                            <img
                              src={file.file_url}
                              alt={file.alt_text || file.original_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <div className="p-2">
                            <p className="text-xs text-gray-600 truncate">
                              {file.original_name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatFileSize(file.file_size)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* URL Input */}
      {allowUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Link className="w-4 h-4" />
              Ou inserir URL da imagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="url"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder}
              className="w-full"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
